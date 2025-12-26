import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
    const customers = await prisma.customer.findMany();
    console.log(`Total customers: ${customers.length}`);

    const counts: Record<string, number> = {};
    customers.forEach(c => {
        const key = `${c.name}-${c.tin}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
        console.log('Duplicates found:');
        duplicates.forEach(([key, count]) => {
            console.log(`- ${key}: ${count} times`);
        });
    } else {
        console.log('No duplicates found in database based on Name and TIN.');
    }

    await prisma.$disconnect();
}

checkDuplicates();
