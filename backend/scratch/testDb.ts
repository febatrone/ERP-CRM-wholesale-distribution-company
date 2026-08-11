import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DB:", users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })));
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
