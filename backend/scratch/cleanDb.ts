import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log("Wiping all mock transactional data (customers, products, challans, invoices, stock movements)...");

  // Delete dependent items first
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.customerFollowUp.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});

  // Keep users but remove any non-default users (keeping the 4 main ones)
  const mainEmails = ["admin@company.com", "sales@company.com", "warehouse@company.com", "accounts@company.com"];
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: mainEmails
      }
    }
  });

  console.log("Wipe completed successfully! Live database is now clean and ready for real business data.");
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
