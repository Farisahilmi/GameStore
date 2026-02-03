
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Checking users...');
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true
    }
  });
  console.log('Users found:', users);

  // Reset admin password to ensure it is correct
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  try {
      await prisma.user.update({
        where: { email: 'admin@gamestore.com' },
        data: { password: hashedPassword }
      });
      console.log('Admin password reset to: password123');
  } catch (e) {
      console.log('Admin user not found to update.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
