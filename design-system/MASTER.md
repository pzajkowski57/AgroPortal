# AgroPortal Design System — MASTER

## Pattern: Marketplace / Directory

- **Section Order:** 1. Hero (Search focused), 2. Categories, 3. Featured Listings, 4. Trust/Safety, 5. CTA (List your item)
- **Primary CTA:** Hero Search Bar + Navbar "Dodaj ogłoszenie"
- **Color Strategy:** Search: High contrast. Categories: Visual icons. Trust: Green.
- **Conversion:** Search bar is the CTA. Reduce friction. Popular searches suggestions.

---

## Color Palette (Adapted Agro Brand)

Based on Florist/Plant Shop palette, adapted to existing agro-500 (#2D7A2D).

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#2D7A2D` (agro-500) | `#4ADE80` | Buttons, links, active states |
| `--primary-foreground` | `#FFFFFF` | `#052E16` | Text on primary |
| `--secondary` | `#22C55E` (green-500) | `#16A34A` | Secondary actions, badges |
| `--accent` | `#F97316` (orange-500) | `#FB923C` | CTA highlights, "Dodaj ogłoszenie" |
| `--accent-foreground` | `#FFFFFF` | `#431407` | Text on accent |
| `--background` | `#F0FDF4` (green-50) | `#0A0A0A` | Page background |
| `--foreground` | `#14532D` (green-900) | `#F8FAFC` | Primary text |
| `--card` | `#FFFFFF` | `#171717` | Card backgrounds |
| `--card-foreground` | `#14532D` | `#F8FAFC` | Card text |
| `--muted` | `#E8F0F1` | `#262626` | Muted backgrounds |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Secondary text |
| `--border` | `#BBF7D0` (green-200) | `#334155` | Borders, dividers |
| `--destructive` | `#DC2626` | `#EF4444` | Delete, errors |
| `--ring` | `#2D7A2D` | `#4ADE80` | Focus rings |

### Existing Tailwind agro palette (keep as-is):
```
agro-50: #f0f9f0, agro-100: #dcf0dc, agro-200: #bce0bc
agro-300: #8dc98d, agro-400: #5aab5a, agro-500: #2D7A2D (PRIMARY)
agro-600: #266a26, agro-700: #205520, agro-800: #1d441d, agro-900: #1a3a1a
```

---

## Typography

- **Heading:** Inter (already installed via next/font) — keep for consistency
- **Body:** Inter — single font system, clean and professional
- **Fallback:** system-ui, -apple-system, sans-serif
- **Scale:** 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60
- **Line height:** 1.5 body, 1.2 headings
- **Polish latin-ext:** Already configured in layout.tsx

> Inter was chosen over Poppins/Rubik because it's already configured and is the best general-purpose UI font. No font change needed.

---

## Spacing & Layout

- **Spacing scale:** 4px increments (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80)
- **Border radius:** 0.5rem (8px) default — already in CSS variables
- **Container:** max-w-7xl centered with px-4 sm:px-6 lg:px-8
- **Breakpoints:** 375 / 640 / 768 / 1024 / 1280 / 1440
- **Mobile-first** approach
- **Section gaps:** 48px+ between major sections

---

## Component Standards

### Buttons
- Primary: bg-agro-500 text-white hover:bg-agro-600 — for main actions
- Secondary: bg-secondary text-secondary-foreground — for secondary actions
- Accent/CTA: bg-orange-500 text-white hover:bg-orange-600 — for "Dodaj ogłoszenie"
- Ghost: hover:bg-agro-50 — for nav items
- Min height: 44px (touch target)
- Transition: 150-300ms ease

### Cards (Listing Cards)
- White bg, rounded-lg, border border-border
- Hover: shadow-md transition 200ms
- Image: aspect-[4/3] with object-cover
- Content: p-4, title truncate, price bold agro-600
- Location: muted-foreground with MapPin icon
- Status badge: top-right corner

### Forms
- Input height: 44px min
- Visible labels (never placeholder-only)
- Error below field, red-500
- Required: asterisk marker
- Inline validation on blur
- Helper text in muted-foreground

### Navigation (Header)
- Sticky top, white bg, border-b
- Logo left, nav center, actions right
- Search bar in center (desktop) / expandable (mobile)
- Mobile: hamburger menu with slide drawer
- Items: Ogłoszenia, Baza Firm, Giełda, Aktualności
- CTA: "Dodaj ogłoszenie" (accent/orange)
- User menu: avatar dropdown (logged in) / "Zaloguj się" (logged out)

---

## Icons

- **Library:** Lucide React (already installed)
- **Style:** Consistent stroke width, 24px default
- **NO emojis** as structural icons
- Common: Search, MapPin, User, Menu, Plus, ChevronDown, Heart, Eye, Calendar, Phone, Mail, Star

---

## Accessibility Requirements

- Contrast 4.5:1 minimum (text on backgrounds)
- Focus rings: 2px ring-agro-500
- Alt text on all images
- aria-labels on icon-only buttons
- Keyboard navigation: tab order matches visual
- prefers-reduced-motion respected
- Skip-to-content link
- Semantic HTML (nav, main, article, section, aside)

---

## Animation

- Duration: 150-300ms for micro-interactions
- Easing: ease-out for entering, ease-in for exiting
- Transform/opacity only (no width/height animation)
- Skeleton loaders for async content
- Stagger list items by 30-50ms
- Respect prefers-reduced-motion

---

## Page-Specific Patterns

### Homepage (`/`)
1. **Hero:** Full-width green gradient bg, h1 "Znajdź maszyny rolnicze", SearchBar centered, popular categories below
2. **Categories:** Grid of 6-8 category cards with icons (Ciągniki, Kombajny, Przyczepy, Siewniki, Opryskiwacze, Części)
3. **Featured Listings:** Horizontal scroll / 4-col grid of ListingCards
4. **Trust:** Stats bar (X ogłoszeń, Y firm, Z użytkowników) + trust badges
5. **CTA:** "Dodaj swoje ogłoszenie za darmo" section with accent button

### Listings (`/ogloszenia`)
- Left sidebar filters (desktop) / bottom sheet filters (mobile)
- Grid: 3-col desktop, 2-col tablet, 1-col mobile
- Sort: dropdown (najnowsze, cena rosnąco/malejąco, popularne)
- Pagination: existing PaginationControls component
- VoivodeshipSelect: existing component
- Empty state: illustration + "Brak ogłoszeń" + CTA

### Auth Pages (`/logowanie`, `/rejestracja`)
- Centered card layout, max-w-md
- Logo top, form below
- Google OAuth button prominent
- Divider "lub zaloguj się emailem"
- Link to opposite page (login <-> register)
- Error states inline

### Dashboard (`/panel/*`)
- Sidebar nav (desktop) / bottom nav (mobile)
- Content area with breadcrumbs
- Cards for stats overview
- Tables for listings management

---

## Anti-Patterns (AVOID)

- Low trust signals on marketplace
- Confusing navigation
- Emojis as icons
- Placeholder-only form labels
- Gray-on-gray text
- Horizontal scroll on mobile
- Animation > 500ms
- Mixed icon styles (filled + outline)
- Hardcoded hex colors (use tokens)
- Layout shift on load (always reserve space)
