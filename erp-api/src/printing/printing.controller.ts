import { Body, Controller, Post, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GodexService, ToyPrintData, PrintOptions } from './godex.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Printing')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('printing')
export class PrintingController {
  constructor(private readonly godex: GodexService) {}

  @Get('status')
  @Roles(Role.ADMIN, Role.WAREHOUSE, Role.OPERATOR, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get printer connectivity status' })
  async status() {
    try {
      return await this.godex.checkStatus();
    } catch (e: any) {
      return { mode: (process.env.PRINTER_MODE as any) || 'network', reachable: false, message: e?.message || 'status error' };
    }
  }

  @Post('toy-label')
  @Roles(Role.ADMIN, Role.WAREHOUSE, Role.OPERATOR, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Print toy label to Godex/TSPL printer (auto/network/serial/windows)' })
  async printToyLabel(@Body() body: { toy: ToyPrintData; options?: PrintOptions }) {
    try {
      const res = await this.godex.printLabel(body.toy, body.options);
      return {
        ok: true,
        ...res,
        tried: body?.options?.transport || process.env.PRINTER_MODE || 'network',
      };
    } catch (e: any) {
      return { ok: false, success: false, message: e?.message || 'print error (controller)' };
    }
  }

  @Get('debug')
  @Roles(Role.ADMIN, Role.WAREHOUSE, Role.OPERATOR, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Debug printer environment and transports' })
  async debug() {
    try {
      const statuses = {
        windows: await this.godex.checkStatus({ transport: 'windows' }),
        network: await this.godex.checkStatus({ transport: 'network' }),
        serial: await this.godex.checkStatus({ transport: 'serial' }),
      };
      return {
        env: {
          PRINTER_MODE: process.env.PRINTER_MODE || null,
          PRINTER_HOST: process.env.PRINTER_HOST || null,
          PRINTER_PORT: process.env.PRINTER_PORT || null,
          PRINTER_SERIAL_PORT: process.env.PRINTER_SERIAL_PORT || null,
          PRINTER_SERIAL_BAUD: process.env.PRINTER_SERIAL_BAUD || null,
          WINDOWS_PRINTER_NAME: process.env.WINDOWS_PRINTER_NAME || null,
        },
        statuses,
      };
    } catch (e: any) {
      return { error: e?.message || 'debug error' };
    }
  }
}
