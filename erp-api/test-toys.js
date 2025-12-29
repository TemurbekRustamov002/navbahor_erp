const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Fetching toys...');
        const toys = await prisma.toy.findMany({
            take: 10,
            include: {
                marka: true,
                labResult: true,
            },
        });
        console.log('✅ Successfully fetched toys:', toys.length);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fetching toys:', err);
        process.exit(1);
    }
}

test();
