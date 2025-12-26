import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Validate role is within Role enum explicitly (safety)
    const allowedRoles = ['ADMIN','SCALE','LAB','WAREHOUSE','SALES','ACCOUNTANT','SUPERVISOR','OPERATOR','LAB_ANALYST','WAREHOUSE_MANAGER','PRODUCTION_MANAGER','CUSTOMER_MANAGER','SALES_MANAGER'];
    if (!allowedRoles.includes(String(dto.role))) {
      throw new BadRequestException('Role noto\'g\'ri');
    }

    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Parollar mos emas');
    }

    // Ensure unique constraints give friendly error
    try {
      const hashed = await bcrypt.hash(dto.password, 12);
      return await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          fullName: dto.fullName,
          role: dto.role as any,
          password: hashed,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      });
    } catch (error: any) {
      // Prisma known errors mapping
      const isPrismaKnown = error?.code && typeof error.code === 'string'
      if (isPrismaKnown) {
        if (error.code === 'P2002') {
          const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : (error.meta?.target || 'unique field')
          throw new BadRequestException(`Unique constraint violated: ${target}`)
        }
        if (error.code === 'P2000') {
          throw new BadRequestException('Invalid value: field is out of range')
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid relation or foreign key constraint')
        }
        // Fallback for other Prisma errors
        throw new BadRequestException(error.message || 'Invalid request')
      }
      // Log and rethrow unknown errors
      console.error('Create user unexpected error:', error)
      // Wrap unknown errors to avoid 500 to client
      throw new BadRequestException(error?.message || 'Foydalanuvchini yaratishda xatolik');
    }
  }

  async findAll(query: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, role, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as any;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async updatePassword(id: string, newPassword: string) {
    try {
      const hashed = await bcrypt.hash(newPassword, 12);
      const user = await this.prisma.user.update({
        where: { id },
        data: { password: hashed },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async getActivityLogs(userId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs;
  }
}