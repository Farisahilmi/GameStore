const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding vouchers...');

    const vouchers = [
        {
            code: 'WELCOME20',
            discountPercent: 20,
            maxUses: 100,
            expiryDate: new Date('2027-12-31')
        },
        {
            code: 'GAMER50',
            discountPercent: 50,
            maxUses: 10,
            expiryDate: new Date('2027-12-31')
        }
    ];

    for (const v of vouchers) {
        await prisma.voucher.upsert({
            where: { code: v.code },
            update: {},
            create: v
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
