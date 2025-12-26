import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRolePermissions } from '../common/permissions/permissions.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) { }

  async login(username: string, password: string) {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Foydalanuvchi faol emas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Login yoki parol noto\'g\'ri');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      username: user.username,
      fullName: user.fullName
    };

    // Use the professional JWT configuration
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET')!,
      expiresIn: '24h', // Fixed 24h expiry for production use
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: '30d', // Fixed 30 days for refresh token
    });

    // Log successful login
    await this.prisma.activityLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        diff: { loginTime: new Date().toISOString() },
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        username: user.username,
        email: user.email,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        username: true,
        isActive: true,
      }
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  async getUserPermissions(role: string) {
    const permissions = getRolePermissions(role);
    return {
      role,
      permissions,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
      });

      // Check if user is still active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { isActive: true, role: true, username: true, fullName: true }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Foydalanuvchi faol emas');
      }

      const newPayload = {
        sub: payload.sub,
        role: user.role,
        username: user.username,
        fullName: user.fullName
      };

      const accessToken = this.jwt.sign(newPayload, {
        secret: this.config.get<string>('JWT_SECRET')!,
        expiresIn: '24h', // Fixed 24h expiry for production use
      });

      const newRefreshToken = this.jwt.sign(newPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: '30d', // Fixed 30 days for refresh token
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Noto\'g\'ri refresh token');
    }
  }
}