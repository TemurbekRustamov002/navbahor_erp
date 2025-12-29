import { PrismaClient, Role, ProductType, MarkaStatus, LabGrade, LabStatus, MarkaDepartment, SexType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Professional Navbahor ERP Database Seed Started...');

  // Clear existing data in proper order
  console.log('🧹 Clearing existing data...');
  try {
    await prisma.activityLog.deleteMany();
    await prisma.scaleReading.deleteMany();
    await prisma.scaleConfig.deleteMany();
    await prisma.wHChecklistItem.deleteMany();
    await prisma.wHChecklist.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.wHItem.deleteMany();
    await prisma.wHOrder.deleteMany();
    await prisma.labResult.deleteMany();
    await prisma.toy.deleteMany();
    await prisma.marka.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Cleaning error (this is normal if tables are empty):', error.message);
  }

  console.log('🗑️  Database cleaned successfully');

  const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';

  // 1. Create Essential Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const taroziHash = await bcrypt.hash('tarozi123', 10);
  const labHash = await bcrypt.hash('lab123', 10);
  const scannerHash = await bcrypt.hash('scanner123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@navbahor.uz',
      password: passwordHash,
      fullName: 'Bosh Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'tarozi',
      email: 'tarozi@navbahor.uz',
      password: taroziHash,
      fullName: 'Tarozi Operator',
      role: Role.SCALE,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'laborant',
      email: 'lab@navbahor.uz',
      password: labHash,
      fullName: 'Laborant Analitigi',
      role: Role.LAB,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'scanner',
      email: 'scanner@navbahor.uz',
      password: scannerHash,
      fullName: 'Urovo Skaner Qurilmasi',
      role: Role.SCANNER as any,
      isActive: true,
    },
  });

  console.log('👥 Essential users created: admin/admin123, tarozi/tarozi123, laborant/lab123, scanner/scanner123');

  if (IS_PRODUCTION) {
    console.log('🚀 Production mode: Skipping sample data creation.');
    console.log('✅ Production Setup Completed!');
    return;
  }

  // 2. Create Sample Customers (Development Mode Only)
  const customer = await prisma.customer.create({
    data: {
      name: "Global Textiles MCHJ",
      legalName: "GLOBAL TEXTILES GROUP SOLUTIONS",
      tin: "305123456",
      director: "Abror Qodirov",
      address: "Toshkent, Shayxontohur, Navoiy ko'chasi 1",
      bankName: "Ipak Yo'li Bank",
      bankAccount: "20208000100020003000",
      mfo: "01001",
      oked: "13100",
      contactName: "Azamat Akramov",
      contactPhone: "+998 90 123 45 67",
      isActive: true
    }
  });

  // 3. Create active Markas
  const marka = await prisma.marka.create({
    data: {
      number: 101,
      productType: ProductType.TOLA,
      sex: SexType.ARRALI,
      department: MarkaDepartment.ARRALI_SEX,
      selection: 'C-6524',
      ptm: 'PTM-A1',
      pickingType: 'Mashina',
      capacity: 220,
      used: 5,
      status: MarkaStatus.ACTIVE,
      showOnScale: true,
      createdBy: admin.id
    }
  });

  // 4. Create some Toys (Bales)
  for (let i = 1; i <= 5; i++) {
    const toy = await prisma.toy.create({
      data: {
        qrUid: `NV-101-${1000 + i}`,
        orderNo: i,
        productType: ProductType.TOLA,
        brutto: 245.0 + Math.random() * 5,
        tara: 5.5,
        netto: 239.5 + Math.random() * 5,
        markaId: marka.id,
        labStatus: i <= 3 ? LabStatus.APPROVED : LabStatus.PENDING,
        readyForWarehouse: i <= 3,
      }
    });

    if (i <= 3) {
      await prisma.labResult.create({
        data: {
          toyId: toy.id,
          moisture: 7.5,
          trash: 2.1,
          navi: 4,
          grade: LabGrade.YAXSHI,
          strength: 31.0,
          lengthMm: 29.5,
          status: LabStatus.APPROVED,
          showToWarehouse: true
        }
      });
    }
  }

  // 5. Create a sample Warehouse Order and Checklist for Testing Scanner
  const order = await prisma.wHOrder.create({
    data: {
      customerId: customer.id,
      number: '5001',
      status: 'TSD_CHECKLIST',
    }
  });

  const readyToys = await prisma.toy.findMany({
    where: { readyForWarehouse: true },
    take: 3
  });

  for (const toy of readyToys) {
    await prisma.wHItem.create({
      data: {
        orderId: order.id,
        toyId: toy.id,
        markaId: toy.markaId,
        productType: toy.productType as any,
        orderNo: toy.orderNo,
        netto: toy.netto
      }
    });
  }

  const checklist = await prisma.wHChecklist.create({
    data: {
      orderId: order.id,
      code: `CL-5001-${Date.now()}`,
      status: 'READY'
    }
  });

  for (const toy of readyToys) {
    await prisma.wHChecklistItem.create({
      data: {
        checklistId: checklist.id,
        toyId: toy.id,
        scanned: false
      }
    });
  }

  console.log('📦 Sample order and checklist created for scanner testing.');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });