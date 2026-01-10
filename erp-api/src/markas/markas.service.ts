import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { MarkaNumberingService } from './services/marka-numbering.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarkaDto, UpdateMarkaDto, MarkaQueryDto } from './dto/marka.dto';
import { Prisma, MarkaStatus, ProductType, SexType } from '@prisma/client';

@Injectable()
export class MarkasService {
  constructor(
    private prisma: PrismaService,
    private numberingService: MarkaNumberingService
  ) { }

  async findAll(query: MarkaQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      productType,
      status,
      showOnScale,
      withUntestedToys,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MarkaWhereInput = {};

    if (search) {
      const isNumeric = /^\d+$/.test(search);
      where.OR = [
        ...(isNumeric ? [{ number: { equals: parseInt(search) } }] : []),
        { selection: { contains: search, mode: 'insensitive' } },
        { ptm: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (productType) {
      where.productType = productType;
    }

    if (status) {
      where.status = status;
    }

    if (showOnScale !== undefined) {
      where.showOnScale = showOnScale;
    }

    if (withUntestedToys) {
      where.toys = {
        some: {
          labResult: null
        }
      };
    }

    // Build orderBy clause
    const orderBy: Prisma.MarkaOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries
    const [items, total] = await this.prisma.$transaction([
      this.prisma.marka.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { toys: true }
          }
        }
      }),
      this.prisma.marka.count({ where })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        toyCount: item._count.toys
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id },
      include: {
        toys: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { toys: true }
        }
      }
    });

    if (!marka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    return {
      ...marka,
      toyCount: marka._count.toys
    };
  }

  async getMarkaToys(id: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id }
    });

    if (!marka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    const toys = await this.prisma.toy.findMany({
      where: { markaId: id },
      orderBy: { orderNo: 'asc' },
      include: {
        labResult: true
      }
    });

    // Check reservation status by looking up WHItem
    // Toys in WHItem are considered reserved/in-process
    const reservedItems = await this.prisma.wHItem.findMany({
      where: {
        toyId: { in: toys.map(t => t.id) }
      },
      select: { toyId: true }
    });

    const reservedToyIds = new Set(reservedItems.map(item => item.toyId));

    return {
      marka,
      toys: toys.map(toy => ({
        ...toy,
        weight: Number(toy.netto),
        timestamp: toy.createdAt.toISOString(),
        reserved: reservedToyIds.has(toy.id),
        sold: toy.status === 'SHIPPED'
      }))
    };
  }

  async getStats() {
    const stats = await this.prisma.marka.groupBy({
      by: ['status', 'productType'],
      _count: true
    });

    const totalMarkas = await this.prisma.marka.count();
    const activeMarkas = await this.prisma.marka.count({
      where: { status: MarkaStatus.ACTIVE }
    });
    const pausedMarkas = await this.prisma.marka.count({
      where: { status: MarkaStatus.PAUSED }
    });
    const scaleVisibleMarkas = await this.prisma.marka.count({
      where: { showOnScale: true }
    });

    return {
      total: totalMarkas,
      active: activeMarkas,
      paused: pausedMarkas,
      scaleVisible: scaleVisibleMarkas,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = (acc[stat.status] || 0) + stat._count;
        return acc;
      }, {}),
      byProductType: stats.reduce((acc, stat) => {
        acc[stat.productType] = (acc[stat.productType] || 0) + stat._count;
        return acc;
      }, {})
    };
  }

  async create(dto: CreateMarkaDto) {
    try {
      // TOLA uchun sex majburiy
      if (dto.productType === ProductType.TOLA && !dto.sex) {
        throw new BadRequestException('TOLA mahsuloti uchun sex (arrali/valikli) majburiy');
      }

      // TOLA uchun raqam cheklovi
      if (dto.productType === ProductType.TOLA) {
        if (dto.sex === SexType.ARRALI && (dto.number < 1 || dto.number > 200)) {
          throw new BadRequestException('Arrali sex uchun raqam 1-200 oraliqda bo\'lishi kerak');
        }
        if (dto.sex === SexType.VALIKLI && (dto.number < 201 || dto.number > 400)) {
          throw new BadRequestException('Valikli sex uchun raqam 201-400 oraliqda bo\'lishi kerak');
        }
      }

      // Department aniqlash
      const department = MarkaNumberingService.getDepartment(dto.productType, dto.sex);

      // Sex aniqlash (UNIVERSAL mahsulotlar uchun)
      const sex = dto.productType === ProductType.TOLA ? dto.sex! : SexType.UNIVERSAL;

      // Oldin ochilgan marka tekshirish
      const existingMarka = await this.prisma.marka.findUnique({
        where: {
          number_department: {
            number: dto.number,
            department
          }
        }
      });

      if (existingMarka) {
        const deptName = department === 'ARRALI_SEX' ? 'Arrali sex' :
          department === 'VALIKLI_SEX' ? 'Valikli sex' : 'Universal';
        throw new BadRequestException(`${dto.number}-raqamli marka ${deptName} bo'limida allaqachon mavjud`);
      }

      const marka = await this.prisma.marka.create({
        data: {
          number: dto.number,
          productType: dto.productType,
          sex: sex,
          department,
          selection: dto.selection,
          ptm: dto.ptm,
          pickingType: dto.pickingType,
          capacity: dto.capacity || 220,
          showOnScale: dto.showOnScale || false,
          status: MarkaStatus.ACTIVE,
        },
      });

      // Boshqa variantlarni lookup tablitsalarga qo'shish
      if (dto.ptm) {
        await this.prisma.ptm.upsert({
          where: { name: dto.ptm },
          update: { isActive: true },
          create: { name: dto.ptm }
        }).catch(err => console.error("PTM upsert error:", err));
      }
      if (dto.selection) {
        await this.prisma.selectionVariety.upsert({
          where: { name: dto.selection },
          update: { isActive: true },
          create: { name: dto.selection }
        }).catch(err => console.error("Selection upsert error:", err));
      }
      if (dto.pickingType) {
        await this.prisma.pickingType.upsert({
          where: { name: dto.pickingType },
          update: { isActive: true },
          create: { name: dto.pickingType }
        }).catch(err => console.error("PickingType upsert error:", err));
      }

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          action: 'MARKA_CREATED',
          entity: 'Marka',
          entityId: marka.id,
          actorRole: 'PRODUCTION_MANAGER',
          diff: { number: marka.number, type: marka.productType } as any
        }
      });

      const deptName = department === 'ARRALI_SEX' ? 'Arrali sex' :
        department === 'VALIKLI_SEX' ? 'Valikli sex' : 'Universal';
      return {
        success: true,
        data: marka,
        message: `✅ ${deptName} bo'limi uchun ${dto.number}-marka yaratildi`
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Bu raqamli marka allaqachon mavjud');
      }
      throw new BadRequestException(`Marka yaratishda xatolik: ${error.message}`);
    }
  }

  async update(id: string, updateMarkaDto: UpdateMarkaDto) {
    // Check if marka exists
    const existingMarka = await this.prisma.marka.findUnique({
      where: { id }
    });

    if (!existingMarka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    return this.prisma.marka.update({
      where: { id },
      data: updateMarkaDto
    });
  }

  async toggleScale(id: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id }
    });

    if (!marka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    return this.prisma.marka.update({
      where: { id },
      data: { showOnScale: !marka.showOnScale }
    });
  }

  async updateStatus(id: string, status: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id }
    });

    if (!marka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    if (!Object.values(MarkaStatus).includes(status as MarkaStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return this.prisma.marka.update({
      where: { id },
      data: { status: status as MarkaStatus }
    });
  }

  async enableScaleForActiveMarkas() {
    const result = await this.prisma.marka.updateMany({
      where: {
        status: 'ACTIVE'
      },
      data: {
        showOnScale: true,
        updatedAt: new Date()
      },
    });

    return {
      success: true,
      message: `${result.count} ta ACTIVE marka tarozida ko'rinadigan qilindi`,
      updatedCount: result.count
    };
  }

  async getOptions() {
    let [ptms, pickingTypes, selections] = await Promise.all([
      this.prisma.ptm.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
      this.prisma.pickingType.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
      this.prisma.selectionVariety.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
    ]);

    // Agar lookup tablitsalar bo'sh bo'lsa, mavjud markalardan ma'lumotlarni ko'chirib o'tamiz
    if (ptms.length === 0 && selections.length === 0) {
      const [distinctPtms, distinctPickingTypes, distinctSelections] = await Promise.all([
        this.prisma.marka.findMany({ select: { ptm: true }, distinct: ['ptm'], where: { ptm: { not: null } } }),
        this.prisma.marka.findMany({ select: { pickingType: true }, distinct: ['pickingType'], where: { pickingType: { not: null } } }),
        this.prisma.marka.findMany({ select: { selection: true }, distinct: ['selection'], where: { selection: { not: null } } }),
      ]);

      if (distinctPtms.length > 0) {
        await Promise.all(distinctPtms.map(p =>
          this.prisma.ptm.upsert({ where: { name: p.ptm! }, update: {}, create: { name: p.ptm! } }).catch(() => null)
        ));
      }
      if (distinctPickingTypes.length > 0) {
        await Promise.all(distinctPickingTypes.map(p =>
          this.prisma.pickingType.upsert({ where: { name: p.pickingType! }, update: {}, create: { name: p.pickingType! } }).catch(() => null)
        ));
      }
      if (distinctSelections.length > 0) {
        await Promise.all(distinctSelections.map(s =>
          this.prisma.selectionVariety.upsert({ where: { name: s.selection! }, update: {}, create: { name: s.selection! } }).catch(() => null)
        ));
      }

      // Qayta yuklash
      [ptms, pickingTypes, selections] = await Promise.all([
        this.prisma.ptm.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
        this.prisma.pickingType.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
        this.prisma.selectionVariety.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
      ]);
    }

    return {
      ptm: ptms.map(p => p.name),
      pickingType: pickingTypes.map(p => p.name),
      selection: selections.map(s => s.name),
    };
  }

  async remove(id: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id },
      include: { _count: { select: { toys: true } } }
    });

    if (!marka) {
      throw new NotFoundException(`Marka with ID ${id} not found`);
    }

    if (marka._count.toys > 0) {
      throw new BadRequestException(
        `Cannot delete marka with ${marka._count.toys} associated toys`
      );
    }

    await this.prisma.marka.delete({ where: { id } });

    return { message: 'Marka deleted successfully' };
  }
}