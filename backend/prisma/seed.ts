import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database records...");

  // Clean mock transactional data to start fresh
  console.log("Cleaning up old transactional mock records...");
  await prisma.invoice.deleteMany({});
  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.customerFollowUp.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});

  // Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("Admin@12345", salt);
  const salesHash = await bcrypt.hash("Sales@12345", salt);
  const warehouseHash = await bcrypt.hash("Warehouse@12345", salt);
  const accountsHash = await bcrypt.hash("Accounts@12345", salt);

  const admin = await prisma.user.upsert({
    where: { email: "admin@insightscope.com" },
    update: {
      email: "admin@insightscope.com",
      password: adminHash,
      name: "Super Administrator",
      role: "ADMIN"
    },
    create: {
      email: "admin@insightscope.com",
      password: adminHash,
      name: "Super Administrator",
      role: "ADMIN"
    }
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@insightscope.com" },
    update: {
      email: "sales@insightscope.com",
      password: salesHash,
      name: "Sales Rep",
      role: "SALES"
    },
    create: {
      email: "sales@insightscope.com",
      password: salesHash,
      name: "Sales Rep",
      role: "SALES"
    }
  });

  const warehouse = await prisma.user.upsert({
    where: { email: "warehouse@insightscope.com" },
    update: {
      email: "warehouse@insightscope.com",
      password: warehouseHash,
      name: "Warehouse Manager",
      role: "WAREHOUSE"
    },
    create: {
      email: "warehouse@insightscope.com",
      password: warehouseHash,
      name: "Warehouse Manager",
      role: "WAREHOUSE"
    }
  });

  const accounts = await prisma.user.upsert({
    where: { email: "accounts@insightscope.com" },
    update: {
      email: "accounts@insightscope.com",
      password: accountsHash,
      name: "Accountant Manager",
      role: "ACCOUNTS"
    },
    create: {
      email: "accounts@insightscope.com",
      password: accountsHash,
      name: "Accountant Manager",
      role: "ACCOUNTS"
    }
  });

  console.log("Seeding complete! Seeded Users:");
  console.log(`- Admin: admin@insightscope.com / Admin@12345`);
  console.log(`- Sales: sales@insightscope.com / Sales@12345`);
  console.log(`- Warehouse: warehouse@insightscope.com / Warehouse@12345`);
  console.log(`- Accounts: accounts@insightscope.com / Accounts@12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
