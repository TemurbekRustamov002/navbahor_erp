import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    const tables = [
        'ActivityLog',
        'ScaleReading',
        'ScaleConfig',
        'Shipment',
        'WHChecklistItem',
        'WHChecklist',
        'WHItem',
        'WHOrder',
        'LabResult',
        'Toy',
        'Marka',
        'CustomerDocument',
        'CustomerReport',
        'Customer'
    ];

    for (const table of tables) {
        try {
            console.log(`Cleaning table: ${table}`);
            await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
        } catch (error: any) {
            console.error(`Failed to clean table ${table}:`, error.message);
        }
    }

    console.log('Database cleanup completed. Users preserved.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
