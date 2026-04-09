import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true }
  });

  if (users.length === 0) {
    console.log('No users found in database.');
  } else {
    console.log('Users:');
    users.forEach(u => console.log(`  - ${u.email} (${u.name})`));
  }

  await db.$disconnect();
}

main();
