import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkaDepartment, ScaleConfig, ScaleReading, Prisma } from '@prisma/client';
import { CreateScaleDto, ScaleReadingDto, UpdateScaleConfigDto } from './dto/scale.dto';

@Injectable()
export class ScaleService {
  private readonly logger = new Logger(ScaleService.name);

  constructor(private prisma: PrismaService) { }

  // Scale Configuration Management
  async createScaleConfig(dto: CreateScaleDto): Promise<ScaleConfig> {
    try {
      return await this.prisma.scaleConfig.create({
        data: {
          name: dto.name,
          department: dto.department,
          isActive: dto.isActive ?? true,
          settings: dto.settings || {},
          connectionStatus: 'disconnected',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create scale config: ${error.message}`);
      throw new BadRequestException('Failed to create scale configuration');
    }
  }

  async getScaleConfigs(): Promise<ScaleConfig[]> {
    const scales = await this.prisma.scaleConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Auto-seed if empty for better UX
    if (scales.length === 0) {
      this.logger.log('No scales found, seeding default scale...');
      const defaultScale = await this.createScaleConfig({
        name: 'Main Scale',
        department: MarkaDepartment.UNIVERSAL,
        isActive: true
      } as any);
      return [defaultScale];
    }

    return scales;
  }

  async getScaleConfigByDepartment(department: MarkaDepartment): Promise<ScaleConfig[]> {
    return this.prisma.scaleConfig.findMany({
      where: {
        department,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateScaleConfig(id: string, dto: UpdateScaleConfigDto): Promise<ScaleConfig> {
    return this.prisma.scaleConfig.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.department && { department: dto.department }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.connectionStatus && { connectionStatus: dto.connectionStatus }),
        ...(dto.settings && { settings: dto.settings }),
        ...(dto.connectionStatus === 'connected' && { lastHeartbeat: new Date() }),
      },
    });
  }

  // Scale Reading Management
  async recordReading(scaleId: string, dto: ScaleReadingDto): Promise<ScaleReading> {
    try {
      // Validate scale exists and is active
      const scale = await this.prisma.scaleConfig.findFirst({
        where: { id: scaleId, isActive: true },
      });

      if (!scale) {
        throw new BadRequestException('Scale not found or inactive');
      }

      // Record the reading
      const reading = await this.prisma.scaleReading.create({
        data: {
          scaleId,
          value: dto.weight,
          isStable: dto.isStable ?? false,
          toyId: (dto as any).toyId || null,
        },
      });

      // Update scale heartbeat
      await this.updateScaleHeartbeat(scaleId);

      return reading;
    } catch (error) {
      this.logger.error(`Failed to record scale reading: ${error.message}`);
      throw error;
    }
  }

  async getLatestReading(scaleId: string): Promise<ScaleReading | null> {
    return this.prisma.scaleReading.findFirst({
      where: { scaleId },
      orderBy: { timestamp: 'desc' },
      include: {
        scale: true,
      },
    });
  }

  async getReadingHistory(
    scaleId: string,
    limit: number = 100,
    markaId?: string,
  ): Promise<ScaleReading[]> {
    return this.prisma.scaleReading.findMany({
      where: {
        scaleId,
        ...(markaId && { toyId: { not: null } }), // Simplified filter, real implementation would require join/lookup
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        scale: true,
      },
    });
  }

  // Scale Connection Management
  async updateScaleHeartbeat(scaleId: string): Promise<void> {
    await this.prisma.scaleConfig.update({
      where: { id: scaleId },
      data: {
        lastHeartbeat: new Date(),
        connectionStatus: 'connected',
        isActive: true,
      },
    });
  }

  async checkScaleConnections(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Mark scales as disconnected if no heartbeat for 5 minutes
    await this.prisma.scaleConfig.updateMany({
      where: {
        lastHeartbeat: {
          lt: fiveMinutesAgo,
        },
        connectionStatus: 'connected',
      },
      data: {
        connectionStatus: 'disconnected',
        // isActive: false, // Don't deactivate, just mark disconnected
      },
    });
  }

  // Department-specific scale access
  async getActiveScalesForDepartment(department: MarkaDepartment): Promise<ScaleConfig[]> {
    return this.prisma.scaleConfig.findMany({
      where: {
        department,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Conflict prevention - ensure only one active session per department
  async startScaleSession(scaleId: string, sessionId: string): Promise<boolean> {
    try {
      const scale = await this.prisma.scaleConfig.findUnique({
        where: { id: scaleId },
      });

      if (!scale) {
        throw new BadRequestException('Scale not found');
      }

      // Check if there's an active session in the same department
      const activeScales = await this.prisma.scaleConfig.findMany({
        where: {
          department: scale.department,
          isActive: true,
          connectionStatus: 'connected',
          id: { not: scaleId },
        },
      });

      // Check for recent readings from other scales (within last 30 seconds)
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      const recentReadings = await this.prisma.scaleReading.findMany({
        where: {
          scale: {
            department: scale.department,
            id: { not: scaleId },
          },
          timestamp: {
            gte: thirtySecondsAgo,
          },
        },
      });

      if (recentReadings.length > 0 || activeScales.length > 0) {
        this.logger.warn(`Scale conflict prevented for department ${scale.department}`);
        return false;
      }

      await this.updateScaleHeartbeat(scaleId);
      return true;
    } catch (error) {
      this.logger.error(`Failed to start scale session: ${error.message}`);
      return false;
    }
  }

  // Get scales by department with active markas
  async getScalesWithActiveMarkas(department: MarkaDepartment) {
    const scales = await this.getActiveScalesForDepartment(department);

    // Get active markas for this department
    const activeMarkas = await this.prisma.marka.findMany({
      where: {
        department,
        showOnScale: true,
        status: 'ACTIVE',
      },
      orderBy: { number: 'asc' },
    });

    return {
      scales,
      activeMarkas,
      departmentInfo: {
        department,
        scaleCount: scales.length,
        markaCount: activeMarkas.length,
      },
    };
  }
}
