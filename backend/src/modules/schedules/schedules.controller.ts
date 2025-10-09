import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user schedule' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  async getMySchedule(@CurrentUser() currentUser: CurrentUserPayload) {
    let schedule = await this.schedulesService.findByUserId(currentUser.id);
    
    if (!schedule) {
      schedule = await this.schedulesService.createDefaultSchedule(currentUser.id, currentUser.timezone);
    }
    
    return schedule;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  async updateMySchedule(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.updateByUserId(currentUser.id, updateScheduleDto);
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user schedule by user ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUserSchedule(@Param('userId') userId: string) {
    const schedule = await this.schedulesService.findByUserId(userId);
    
    if (!schedule) {
      return this.schedulesService.createDefaultSchedule(userId);
    }
    
    return schedule;
  }

  @Patch(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user schedule by user ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateUserSchedule(
    @Param('userId') userId: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.updateByUserId(userId, updateScheduleDto);
  }
}
