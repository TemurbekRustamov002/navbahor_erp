import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating/Creating Admin User...');

    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: passwordHash,
            role: Role.ADMIN,
            isActive: true,
        },
        create: {
            username: 'admin',
            email: 'admin@navbahor.uz',
            password: passwordHash,
            fullName: 'Administrator',
            role: Role.ADMIN,
            isActive: true,
        },
    });

    console.log('✅ Admin user updated/created successfully: admin / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
