const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const email = 'admin@test.com';
  const password = 'admin123';
  const name = 'Main Admin';
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    });
    console.log('Admin account created/updated successfully:', admin.email);
  } catch (err) {
    console.error('Error creating admin account:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();