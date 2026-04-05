# AgroPortal — Technical Architecture

> Last updated: 2026-04-05
> Update this document after each sprint when structural or behavioral changes are made.

---

## 1. Overview

AgroPortal is a Polish agricultural marketplace for buying and selling agricultural machinery, equipment, and spare parts. It also supports commodity exchange (grain, rapeseed, etc.), agricultural news, subsidy tracking, and a seasonal farming calendar.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, React Server Components) |
| Language | TypeScript 5.7 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache / Queue transport | Redis 7 (ioredis) |
| Background jobs | BullMQ 5 |
| Auth | NextAuth v5 (auth.js beta) |
| Styling | Tailwind CSS 3, Radix UI primitives, shadcn/ui |
| File storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Rate limiting | Upstash Ratelimit (sliding window) |
| Payments | PayU |
| Testing | Vitest, Testing Library, MSW |
| Deployment | Docker (multi-stage), docker-compose |

---

## 2. Directory Structure

```
agroportal/
├── prisma/
│   ├── schema.prisma          # Single source of truth for DB schema
│   ├── seed.ts                # Development seed data
│   └── migrations/            # Prisma migration history
│
├── src/
│   ├── app/                   # Next.js App Router (pages, layouts, API routes)
│   │   ├── layout.tsx         # Root layout — <html>, global CSS, Header/Footer
│   │   ├── page.tsx           # Home page (/)
│   │   ├── globals.css        # Tailwind base styles
│   │   ├── logowanie/         # Login page (/logowanie)
│   │   │   ├── page.tsx
│   │   │   └── actions.ts     # Server Actions for form submission
│   │   ├── rejestracja/       # Registration page (/rejestracja)
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── ogloszenia/        # Listing browse + detail pages
│   │   │   ├── page.tsx       # /ogloszenia — SSR listing grid
│   │   │   ├── loading.tsx
│   │   │   └── [id]/          # /ogloszenia/[id] — listing detail
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts   # NextAuth catch-all handler
│   │       └── v1/
│   │           ├── listings/
│   │           │   ├── route.ts              # GET, POST /api/v1/listings
│   │           │   ├── [id]/route.ts         # GET, PATCH, DELETE /api/v1/listings/[id]
│   │           │   └── __tests__/
│   │           └── upload/
│   │               ├── presigned/route.ts    # POST /api/v1/upload/presigned
│   │               └── __tests__/
│   │
│   ├── components/            # React components, organised by domain
│   │   ├── auth/              # Login/register UI (OAuthButton, PasswordInput, PasswordStrength)
│   │   ├── home/              # Landing page sections (Hero, Categories, FeaturedListings, Stats, CTA)
│   │   ├── layout/            # App shell (Header, Footer, MobileNav, UserMenu, nav-links)
│   │   ├── listings/          # Listing-domain components (barrel-exported from index.ts)
│   │   │   ├── cards/         # ListingCard, ListingCardSkeleton
│   │   │   ├── detail/        # Breadcrumbs, ImageGallery, ListingDetails, RelatedListings, SellerCard
│   │   │   ├── filters/       # CategoryAccordion, ConditionCheckboxes, ListingsFilters,
│   │   │   │                  #   MobileFiltersSheet, PriceRangeInput, SortSelect
│   │   │   ├── grid/          # ListingsGrid, ListingsPageClient (client entry point)
│   │   │   └── index.ts       # Re-exports all listings components
│   │   └── ui/                # Shared primitives (Button, Card, Input, Label,
│   │                          #   PaginationControls, VoivodeshipSelect)
│   │
│   ├── hooks/                 # Client-side React hooks
│   │   ├── useListings.ts         # Fetches and paginates listing data from the API
│   │   ├── useListingsFilters.ts  # Reads/writes filter state to the URL search params
│   │   └── useDebounce.ts         # Generic debounce hook
│   │
│   ├── lib/                   # Shared server-side utilities
│   │   ├── db.ts              # Prisma client singleton (for workers / direct imports)
│   │   ├── redis.ts           # ioredis client singleton (BullMQ transport)
│   │   ├── queue.ts           # BullMQ queue + worker factories
│   │   ├── auth-helpers.ts    # getServerSession, requireAuth, requireRole, requireAdmin, hasRole
│   │   ├── constants.ts       # APP_NAME, APP_URL, and other shared constants
│   │   ├── utils.ts           # cn() class utility (clsx + tailwind-merge)
│   │   ├── infra/             # HTTP-layer infrastructure
│   │   │   ├── cors.ts            # corsHeaders(), handleCorsPreflight()
│   │   │   ├── rate-limit.ts      # Upstash sliding-window limiters (api, auth, upload)
│   │   │   └── security-headers.ts # CSP + security header definitions for next.config
│   │   ├── repositories/      # Data access layer — wraps Prisma queries
│   │   │   └── listing.repository.ts
│   │   ├── schemas/           # Zod validation schemas
│   │   │   ├── auth.ts
│   │   │   ├── listing.ts
│   │   │   └── upload.ts
│   │   ├── storage/           # File upload utilities
│   │   │   ├── r2.ts          # Cloudflare R2 presigned URL generation
│   │   │   └── storage.ts     # Storage abstraction (public URL helpers)
│   │   ├── utils/             # Pure utility functions
│   │   │   ├── slugify.ts
│   │   │   └── voivodeships.ts  # TERYT code helpers
│   │   └── validators/        # Domain-specific validators
│   │       └── nip.ts         # Polish NIP (VAT) checksum validator
│   │
│   ├── server/
│   │   ├── auth.ts            # Re-exports from @/auth + @/lib/auth-helpers (backwards compat)
│   │   └── db.ts              # Prisma client singleton for server components / API routes
│   │
│   ├── workers/               # BullMQ standalone worker process
│   │   ├── index.ts           # Entry point — registers jobs and starts workers
│   │   └── listing-expiry/
│   │       └── processor.ts   # Marks expired listings as 'expired', sends email notifications
│   │
│   ├── types/
│   │   ├── index.ts           # Shared domain types (Role, ListingCondition, etc.)
│   │   └── next-auth.d.ts     # Augments Session.user with id and role
│   │
│   ├── test/                  # Test infrastructure
│   │   ├── setup.ts           # Vitest global setup (Testing Library matchers, MSW)
│   │   ├── helpers.ts         # Shared test helpers
│   │   ├── msw/
│   │   │   ├── handlers.ts    # MSW request handlers
│   │   │   └── server.ts      # MSW server setup
│   │   └── factories/         # Object factories for test data
│   │       ├── userFactory.ts
│   │       ├── listingFactory.ts
│   │       └── companyFactory.ts
│   │
│   ├── auth.ts                # Full NextAuth config (Node.js runtime — providers, JWT, session)
│   ├── auth.config.ts         # Edge-compatible NextAuth config (used by middleware)
│   └── middleware.ts          # Edge middleware — rate limiting + auth guard
│
├── design-system/MASTER.md    # Design system documentation
├── docker-compose.yml         # Local dev infra (postgres, redis, worker)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Architecture Layers

### Pages — `src/app/`

All pages are **React Server Components** by default. They fetch data directly from repositories (no intermediate API call) and render HTML on the server. Client interactivity is delegated to Client Components via the `'use client'` directive.

Key patterns:
- `generateMetadata()` is used on dynamic pages (e.g. listing detail) to produce per-listing Open Graph and SEO metadata.
- `loading.tsx` files provide Suspense-based streaming skeletons.
- `not-found.tsx` renders the 404 UI when `notFound()` is called.
- Server Actions in `actions.ts` files handle form submissions (login, register) without a client-side fetch.

### Components — `src/components/`

Organised by domain, not by type. Each domain folder contains co-located `__tests__/` directories.

- `auth/` — Form primitives for login and registration flows.
- `home/` — Static marketing sections. All server-rendered.
- `layout/` — App shell components. `Header` and `Footer` are server components; `MobileNav` and `UserMenu` are client components.
- `listings/` — Split into four subdirectories:
  - `cards/` — `ListingCard` (display a single listing preview) and `ListingCardSkeleton`.
  - `detail/` — Components used on the listing detail page: `ImageGallery`, `ListingDetails`, `SellerCard`, `RelatedListings`, `Breadcrumbs`.
  - `filters/` — All filter UI: category, condition, price range, voivodeship, sort. Controlled via `useListingsFilters` hook.
  - `grid/` — `ListingsGrid` (renders the card grid) and `ListingsPageClient` (client entry point that wires together hooks + grid + filters + pagination).
- `ui/` — Reusable atomic components built on Radix UI and shadcn/ui conventions.

### Hooks — `src/hooks/`

All hooks are `'use client'` and handle client-side state management:

- `useListingsFilters` — Reads and writes listing filter state as URL search params. Each filter change triggers a `router.push()`, making the URL shareable and bookmarkable.
- `useListings` — Fetches listing data from `GET /api/v1/listings`. Implements cursor-based pagination with a cursor stack for forward/back navigation. Cancels in-flight requests on filter change via `AbortController`.
- `useDebounce` — Generic debounce hook used to delay search queries while typing.

### API Routes — `src/app/api/`

All public API routes are versioned under `/api/v1/`. Routes follow the same pattern:

1. Authenticate with `auth()` (where required).
2. Parse and validate input with Zod (`safeParse`).
3. Delegate to the repository layer.
4. Return a consistent `{ success, data?, error? }` envelope.

Rate limiting is applied in middleware before the route handler runs.

### Repositories — `src/lib/repositories/`

The repository layer is the only place that imports `db` (Prisma client) for business data. Route handlers and Server Components call repository functions; they never build Prisma queries directly.

Current repositories:
- `listing.repository.ts` — `findListings`, `findListingById`, `findRelatedListings`, `createListing`, `updateListing`, `softDeleteListing`.

### Schemas — `src/lib/schemas/`

Zod schemas serve as the validation boundary between untrusted input and the application. Types are inferred from schemas with `z.infer<>` to keep schema and type in sync.

- `listing.ts` — `createListingSchema`, `patchListingSchema`, `listingsQuerySchema`.
- `auth.ts` — Login and registration schemas.
- `upload.ts` — `presignedUploadRequestSchema` (file array, content type allowlist, size limit).

### Workers — `src/workers/`

The worker process is a separate Node.js entry point (`src/workers/index.ts`) that runs inside the `worker` Docker service. It is **not** part of the Next.js app.

### Infrastructure — `src/lib/infra/`

Low-level HTTP middleware utilities:

- `cors.ts` — Origin allowlist-based CORS headers and preflight handler.
- `rate-limit.ts` — Three Upstash sliding-window limiters. Gracefully degrades (no-op) when Upstash env vars are absent.
- `security-headers.ts` — CSP and security header definitions consumed by `next.config.mjs`.

### Storage — `src/lib/storage/`

- `r2.ts` — Lazy-initialised S3Client pointed at Cloudflare R2. Exposes `createPresignedUploadUrl()` for client-side direct uploads.
- `storage.ts` — Higher-level helpers for constructing public object URLs.

---

## 4. Data Flow Diagrams

### SSR page request (listing detail)

```
Browser
  └─► GET /ogloszenia/[id]
        └─► Next.js Edge Middleware
              ├─ Rate limit check (no limit on page routes)
              └─ Auth check (public route — passes through)
                  └─► ListingDetailPage (React Server Component)
                        ├─► findListingById(id)         ─► Prisma ─► PostgreSQL
                        └─► findRelatedListings(...)    ─► Prisma ─► PostgreSQL
                              └─► HTML response streamed to browser
```

### API request (GET listings)

```
Browser / Client Component
  └─► GET /api/v1/listings?category=...
        └─► Edge Middleware
              ├─ apiLimiter.limit(ip)      ─► Upstash Redis
              └─ (public route — no auth check)
                  └─► GET handler
                        ├─ listingsQuerySchema.safeParse(searchParams)
                        └─► findListings(query)         ─► Prisma ─► PostgreSQL
                              └─► { success: true, data: { listings, nextCursor, total } }
```

### File upload flow

```
Browser
  └─► POST /api/v1/upload/presigned  { files: [...] }
        └─► Edge Middleware (uploadLimiter: 10 req/h)
              └─► POST handler
                    ├─ auth() — requires session
                    ├─ presignedUploadRequestSchema.safeParse(body)
                    └─► createPresignedUploadUrl(key, contentType, size)  ─► Cloudflare R2
                          └─► { success: true, data: { urls: [{ url, key, expiresIn }] } }

Browser
  └─► PUT <presigned-url>  (direct to R2, no server involved)
```

### Background job (listing expiry)

```
Docker worker service (src/workers/index.ts)
  └─► BullMQ Queue: 'listing-expiry'
        └─► Repeatable job: cron '0 1 * * *' (01:00 UTC daily)
              └─► processListingExpiry()
                    ├─► db.listing.findMany(status: active, expiresAt <= now)  ─► PostgreSQL
                    ├─► db.listing.updateMany(status: expired)                 ─► PostgreSQL
                    └─► resend.emails.send(listingExpiredEmail)                ─► Resend API
```

---

## 5. Database Schema

Full schema is in `prisma/schema.prisma`. Key models are summarised below.

### Core Models

#### User
- Roles: `user`, `company`, `admin`, `vet`
- Soft-delete via `deletedAt` (GDPR)
- Linked to `UserProfile` (1:1), `CompanyProfile` (1:1 for role=company)
- OAuth via `Account` model (NextAuth adapter)

#### Listing
- Belongs to `User` (nullable — `onDelete: SetNull`)
- Belongs to `ListingCategory` (`onDelete: Restrict`)
- Optional link to `MachineryModel`
- Status: `draft`, `active`, `expired`, `sold`, `rejected`
- Condition: `new`, `used`, `for_parts`
- Full-text search vector (`tsvector`) maintained via DB trigger
- Paid highlighting: `isHighlighted`, `highlightedUntil`
- Auto-expiry: `expiresAt` (processed by worker)

#### ListingCategory
- Self-referential tree (`parentId → id`)
- Used for hierarchical category navigation

#### ListingImage
- Many-to-one with `Listing` (`onDelete: Cascade`)
- `order` field controls display sequence

#### CompanyProfile
- One user can have one company profile
- Status flow: `pending → verified / rejected / suspended`
- Subscription tiers: `none`, `basic`, `premium`
- Linked to `CompanyCategory[]` (enum-based, replaces free-text)

#### ExchangeOffer
- Grain/commodity exchange listings
- `ExchangeCategory` enum: zboze, rzepak, kukurydza, etc.
- Price history tracked in `PriceHistoryEntry`

#### Payment
- Records PayU transactions
- References `Listing` or `CompanyProfile` (both nullable — `onDelete: SetNull` to preserve audit trail)
- `PaymentType`: `highlight`, `subscription_basic`, `subscription_premium`

### Relationships Diagram

```
User ──────────┬── 1:1 ──► UserProfile
               ├── 1:1 ──► CompanyProfile ──► CompanyCategory[]
               │                           └─► CompanyReview[]
               ├── 1:N ──► Listing ──────────► ListingImage[]
               │              └── N:1 ──► ListingCategory (tree)
               │              └── N:1 ──► MachineryModel
               ├── 1:N ──► ExchangeOffer ──► PriceHistoryEntry[]
               ├── 1:N ──► Message
               ├── M:N ──► Conversation (via ConversationParticipant)
               ├── 1:N ──► Notification
               ├── M:N ──► SavedListing
               └── 1:N ──► Payment

Account ──────── N:1 ──► User   (OAuth providers)
Session ──────── N:1 ──► User   (JWT sessions stored in DB)
```

---

## 6. Authentication Flow

NextAuth v5 is split across four files to accommodate Next.js's edge/Node.js runtime boundary:

| File | Runtime | Purpose |
|---|---|---|
| `src/auth.config.ts` | Edge | Minimal config safe for the edge runtime. Defines `pages`, `authorized` callback, and a stub Google provider. No DB or bcrypt imports. |
| `src/auth.ts` | Node.js | Full config — Prisma adapter, Google OAuth, Credentials provider (bcrypt), JWT + session callbacks. Exports `handlers`, `auth`, `signIn`, `signOut`. |
| `src/lib/auth-helpers.ts` | Node.js | Higher-level helpers: `getServerSession`, `requireAuth`, `requireRole`, `requireAdmin`, `hasRole`. Used in Server Components and API routes. |
| `src/server/auth.ts` | Node.js | Thin re-export of `@/auth` and `@/lib/auth-helpers` for backwards-compatible imports from `@/server/auth`. |

### Session Strategy

JWT sessions are used (`strategy: 'jwt'`). The `Account` and `Session` Prisma tables are maintained by the PrismaAdapter for OAuth account linking, but the active session itself is a signed JWT cookie.

The `jwt` callback persists `id` and `role` into the token. On every subsequent request it re-fetches `role` from the DB to reflect role changes without requiring a new login.

### Route Protection

`src/middleware.ts` wraps the edge-compatible `auth` export from `auth.config.ts`:

- `/panel/*` — any authenticated user
- `/admin/*` — `role === 'admin'` only (enforced in the `authorized` callback)
- All other routes — public

### OAuth Providers

- Google OAuth (configured via `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`)
- Email + Password (Credentials provider with bcrypt; dummy hash compare prevents timing-based user enumeration)

---

## 7. Background Jobs

### Queue Infrastructure

`src/lib/queue.ts` exports two factory functions built on BullMQ:

- `createQueue(name, options?)` — creates a BullMQ `Queue` with default retry policy (3 attempts, exponential backoff).
- `createWorker(name, processor, options?)` — creates a BullMQ `Worker` with default concurrency of 5 and a global error logger.

Both share a single `ioredis` connection from `src/lib/redis.ts`.

### Registered Queues

| Constant | Queue name | Description |
|---|---|---|
| `QUEUES.LISTING_EXPIRY` | `listing-expiry` | Daily job to expire listings |
| `QUEUES.MONTHLY_ORDERS` | `monthly-orders` | Recurring commodity order generation (planned) |
| `QUEUES.EMAIL` | `email` | Generic transactional email queue (planned) |

### Listing Expiry Worker

**Entry point:** `src/workers/index.ts`
**Processor:** `src/workers/listing-expiry/processor.ts`
**Cron schedule:** `0 1 * * *` (01:00 UTC every day)
**Concurrency:** 1 (serial execution)

The `processListingExpiry` processor:
1. Queries all `Listing` records with `status = 'active'` and `expiresAt <= now`.
2. Bulk-updates matched records to `status = 'expired'`.
3. Sends a notification email via Resend for each expired listing (skipped if `RESEND_API_KEY` is absent).
4. Returns `{ expired, emailsSent, emailsFailed }` as the job result.

### Adding a New Job

1. Add a queue name constant to `QUEUES` in `src/lib/queue.ts`.
2. Create a processor in `src/workers/<job-name>/processor.ts`.
3. Register the queue and worker in `src/workers/index.ts` following the existing pattern.
4. Add email templates in `src/lib/email/templates/` if notifications are required.

---

## 8. API Reference

All endpoints return a consistent envelope:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }

// Paginated
{ success: true, data: { listings: T[], nextCursor: string | null, total: number } }
```

### GET /api/v1/listings

List active listings with filtering and cursor-based pagination.

**Auth:** None required

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `q` | `string` | Full-text search (title + description, case-insensitive) |
| `category` | `string` | Category slug |
| `voivodeship` | `string` | TERYT voivodeship code |
| `priceMin` | `number` | Minimum price |
| `priceMax` | `number` | Maximum price |
| `condition` | `string[]` | `new`, `used`, `for_parts` (repeatable param) |
| `sort` | `string` | `newest` (default), `price_asc`, `price_desc`, `popular` |
| `cursor` | `string` | Opaque cursor from previous response for pagination |
| `limit` | `number` | Items per page (1–100, default 20) |

**Response:** `{ success: true, data: { listings: Listing[], nextCursor: string|null, total: number } }`

---

### POST /api/v1/listings

Create a new listing.

**Auth:** Required (any authenticated user)

**Request body:**

```json
{
  "title": "string (3–200)",
  "description": "string (10–10000)",
  "price": "number (>=0)",
  "currency": "PLN|EUR|USD",
  "condition": "new|used|for_parts",
  "categoryId": "string",
  "voivodeship": "string (TERYT code)",
  "city": "string (1–100)",
  "machineryModelId": "string? (optional)",
  "metaTitle": "string? (max 160)",
  "metaDesc": "string? (max 320)"
}
```

**Response:** `201 { success: true, data: Listing }`

---

### GET /api/v1/listings/[id]

Get a single listing and up to 4 related listings from the same category.

**Auth:** None required

**Response:** `{ success: true, data: { listing: Listing, related: Listing[] } }`

Returns `404` if the listing does not exist or is not active.

---

### PATCH /api/v1/listings/[id]

Partially update a listing. All fields are optional; at least one must be provided.

**Auth:** Required — owner or admin only

**Request body:** Subset of create body fields plus `imageKeys: string[]`.

**Response:** `{ success: true, data: Listing }`

---

### DELETE /api/v1/listings/[id]

Soft-delete a listing (sets `status = 'sold'`).

**Auth:** Required — owner or admin only

**Response:** `{ success: true, data: null }`

---

### POST /api/v1/upload/presigned

Generate presigned PUT URLs for direct upload to Cloudflare R2.

**Auth:** Required (any authenticated user)

**Rate limit:** 10 requests per hour

**Request body:**

```json
{
  "files": [
    { "filename": "photo.jpg", "contentType": "image/jpeg", "size": 1048576 }
  ]
}
```

Allowed content types: `image/jpeg`, `image/png`, `image/webp`.

**Response:** `{ success: true, data: { urls: [{ url: string, key: string, expiresIn: number }] } }`

The client uploads directly to R2 using `PUT <url>`. Presigned URLs expire in 15 minutes (900 s).

---

## 9. Development Setup

### Prerequisites

- Docker Desktop
- Node.js 20+
- pnpm / npm

### Start infrastructure (database + Redis)

```bash
# Start postgres and redis only
docker-compose up postgres redis -d

# Or start full stack including the worker
docker-compose up -d
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```
DATABASE_URL         # PostgreSQL connection string
AUTH_SECRET          # Random secret (npx auth secret)
AUTH_URL             # App URL (http://localhost:3000 for dev)
AUTH_GOOGLE_ID       # Google OAuth client ID
AUTH_GOOGLE_SECRET   # Google OAuth client secret
R2_ACCOUNT_ID        # Cloudflare R2 account ID
R2_ACCESS_KEY_ID     # R2 access key
R2_SECRET_ACCESS_KEY # R2 secret key
R2_BUCKET_NAME       # R2 bucket name
R2_PUBLIC_URL        # Public R2 URL
REDIS_URL            # Redis connection string (BullMQ)
UPSTASH_REDIS_REST_URL    # Upstash REST URL (rate limiting — optional in dev)
UPSTASH_REDIS_REST_TOKEN  # Upstash token (rate limiting — optional in dev)
NEXT_PUBLIC_APP_URL  # Public app URL
RESEND_API_KEY       # Resend email API key
RESEND_FROM_EMAIL    # Sender address
PAYU_POS_ID          # PayU POS ID
PAYU_MD5_KEY         # PayU MD5 key
PAYU_OAUTH_CLIENT_ID # PayU OAuth client ID
PAYU_OAUTH_CLIENT_SECRET # PayU OAuth secret
SEED_ADMIN_PASSWORD  # Password for seeded admin user
```

Rate limiting is skipped automatically when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent, so you can develop without Upstash.

### Database setup

```bash
# Apply schema to the database (dev — no migrations)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed development data
npm run db:seed
```

### Run the app

```bash
npm run dev          # Next.js dev server
npm run worker:dev   # BullMQ worker (tsx hot-reload)
```

### Run tests

```bash
npm test                # Run all tests once
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report (target: 80%)
npm run test:ui         # Vitest UI in browser
```

### Type checking and linting

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
npm run format:check # prettier --check (used in CI)
```

---

## 10. Conventions

### File Naming

- React components: `PascalCase.tsx`
- Utilities, hooks, config: `camelCase.ts`
- Tests: co-located in `__tests__/` sibling directory, named `<subject>.test.ts(x)`
- Factories: `camelCase.ts` in `src/test/factories/`

### Commit Format

```
<type>: <short description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### Branching Strategy

```
main                        # Production-ready code
feat/KAN-<N>-<short-desc>   # Feature branches (one per Jira ticket)
fix/KAN-<N>-<short-desc>    # Bug fix branches
```

All work happens on dedicated branches. Open a PR, run the code-reviewer agent, address issues, then merge to `main`.

### API Response Shape

All API endpoints return the same envelope:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

Paginated responses nest the list under `data`:

```typescript
interface PaginatedData<T> {
  items: T[]       // or domain-specific name (e.g. listings)
  nextCursor: string | null
  total: number
}
```

### Adding a New Feature — Checklist

1. **Page** — Add a new route directory under `src/app/`. Use Server Components for data fetching. Add `loading.tsx` and `not-found.tsx` where applicable.
2. **Component** — Add to the relevant domain directory under `src/components/`. Co-locate `__tests__/`.
3. **API Route** — Add under `src/app/api/v1/`. Follow the auth → validate → repository → respond pattern.
4. **Repository** — Add query functions to the relevant repository file in `src/lib/repositories/`. Create a new file for a new domain.
5. **Schema** — Add Zod schemas in `src/lib/schemas/`. Infer TypeScript types with `z.infer<>`.
6. **Worker** — Create a processor in `src/workers/<job-name>/processor.ts`. Register in `src/workers/index.ts`.
7. **Tests** — Write tests first (TDD). Target 80%+ coverage. Use factories from `src/test/factories/` for test data.
