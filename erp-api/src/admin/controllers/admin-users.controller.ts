import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from '../services/admin-users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/users')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return this.adminUsersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.adminUsersService.findAll({
      page: page || 1,
      limit: limit || 20,
      search,
      role,
      isActive,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminUsersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  async updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    return this.adminUsersService.updatePassword(id, dto.password);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.adminUsersService.remove(id);
  }

  @Put(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle user active status' })
  async toggleActive(@Param('id') id: string) {
    return this.adminUsersService.toggleActive(id);
  }

  @Get(':id/activity-logs')
  @ApiOperation({ summary: 'Get user activity logs' })
  async getActivityLogs(@Param('id') id: string) {
    return this.adminUsersService.getActivityLogs(id);
  }
}