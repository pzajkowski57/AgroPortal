import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================
// SEED DATA
// ============================================================

const listingCategories = [
  { name: "Maszyny rolnicze", slug: "maszyny-rolnicze" },
  { name: "Ciągniki", slug: "ciagniki" },
  { name: "Narzędzia rolnicze", slug: "narzedzia-rolnicze" },
  { name: "Nawozy", slug: "nawozy" },
  { name: "Nasiona", slug: "nasiona" },
  { name: "Środki ochrony roślin", slug: "srodki-ochrony-roslin" },
  { name: "Zwierzęta", slug: "zwierzeta" },
  { name: "Grunty rolne", slug: "grunty-rolne" },
  { name: "Usługi rolnicze", slug: "uslugi-rolnicze" },
  { name: "Inne", slug: "inne" },
];

const forumCategories = [
  { name: "Uprawa roślin", slug: "uprawa-roslin" },
  { name: "Hodowla zwierząt", slug: "hodowla-zwierzat" },
  { name: "Mechanizacja rolnictwa", slug: "mechanizacja-rolnictwa" },
  { name: "Dofinansowania i dotacje", slug: "dofinansowania-i-dotacje" },
  { name: "Ogólne", slug: "ogolne" },
];

const articleCategories = [
  { name: "Aktualności", slug: "aktualnosci" },
  { name: "Porady", slug: "porady" },
  { name: "Dofinansowania", slug: "dofinansowania" },
  { name: "Raporty", slug: "raporty" },
];

// MachineryCategory: seeded as representative MachineryModel entries,
// one per category, acting as category anchors in the catalog.
const machineryModelsByCategory = [
  { brand: "John Deere", model: "6R 110", category: "Ciągniki" },
  { brand: "Claas", model: "LEXION 8900", category: "Kombajny" },
  { brand: "Horsch", model: "Pronto 6 DC", category: "Siewniki" },
  { brand: "Amazone", model: "UX 5200", category: "Opryskiwacze" },
  { brand: "Wielton", model: "PRS-3 18", category: "Przyczepy rolnicze" },
  { brand: "Krone", model: "BiG M 450", category: "Maszyny do zbioru" },
];

const adminUser = {
  email: "admin@agroportal.pl",
  name: "Administrator",
  role: "admin" as const,
  password: "Admin@AgroPortal2024!",
};

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedListingCategories(): Promise<void> {
  console.log("Seeding listing categories...");

  for (const category of listingCategories) {
    await prisma.listingCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
  }

  console.log(`  Done: ${listingCategories.length} listing categories`);
}

async function seedForumCategories(): Promise<void> {
  console.log("Seeding forum categories...");

  for (const category of forumCategories) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).forumCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
  }

  console.log(`  Done: ${forumCategories.length} forum categories`);
}

async function seedArticleCategories(): Promise<void> {
  console.log("Seeding article categories...");

  for (const category of articleCategories) {
    await prisma.articleCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
  }

  console.log(`  Done: ${articleCategories.length} article categories`);
}

async function seedMachineryModels(): Promise<void> {
  console.log("Seeding machinery models (6 categories)...");

  for (const entry of machineryModelsByCategory) {
    await prisma.machineryModel.upsert({
      where: { brand_model: { brand: entry.brand, model: entry.model } },
      update: { category: entry.category },
      create: {
        brand: entry.brand,
        model: entry.model,
        category: entry.category,
      },
    });
  }

  console.log(`  Done: ${machineryModelsByCategory.length} machinery model entries`);
}

async function seedAdminUser(): Promise<void> {
  console.log("Seeding admin user...");

  const passwordHash = await bcrypt.hash(adminUser.password, 12);

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {
      name: adminUser.name,
      role: adminUser.role,
    },
    create: {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      passwordHash,
    },
  });

  console.log(`  Done: admin user (${adminUser.email})`);
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  console.log("Starting AgroPortal database seed...\n");

  await prisma.$transaction(async () => {
    await seedListingCategories();
    await seedArticleCategories();
    await seedMachineryModels();
  });

  // Admin user seeded outside transaction (bcrypt hash involves async I/O)
  await seedAdminUser();

  // ForumCategory — seeded only if model exists in the Prisma schema
  try {
    await seedForumCategories();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.toLowerCase().includes("forumcategory") ||
      message.includes("is not a function") ||
      message.includes("Cannot read properties of undefined")
    ) {
      console.log("  Skipped: ForumCategory model not yet in schema");
    } else {
      throw err;
    }
  }

  console.log("\nSeed completed successfully!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
