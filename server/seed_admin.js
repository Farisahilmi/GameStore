const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Admin User...');

    const adminEmail = 'admin@gamestore.com';
    const adminPassword = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN'
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin GameStore',
            role: 'ADMIN'
        }
    });

    console.log('Admin User created/updated successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
