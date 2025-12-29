const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const toys = await prisma.toy.findMany({
            include: {
                marka: true,
            }
        });

        const orphans = toys.filter(t => !t.marka);
        console.log('Orphan toys (no marka):', orphans.length);

        if (orphans.length > 0) {
            console.log('Sample orphans:', orphans.slice(0, 5).map(o => o.id));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
