import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu (Admin only)' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all menus' })
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'mealType', required: false, enum: ['breakfast', 'lunch', 'dinner'] })
  @ApiQuery({ name: 'cuisine', required: false, description: 'Cuisine filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field:direction' })
  findAll(@Query() query: QueryMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all menus (Public access)' })
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'mealType', required: false, enum: ['breakfast', 'lunch', 'dinner'] })
  @ApiQuery({ name: 'cuisine', required: false, description: 'Cuisine filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field:direction' })
  findAllPublic(@Query() query: QueryMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all menus (No auth required)' })
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  async getAllMenus() {
    try {
      return await this.menusService.getAllMenus();
    } catch (error) {
      console.error('Error getting all menus:', error);
      return { error: error.message, menus: [] };
    }
  }

  @Get('simple')
  @ApiOperation({ summary: 'Get all menus (Simple format)' })
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  async findAllSimple() {
    try {
      return await this.menusService.findAllSimple();
    } catch (error) {
      console.error('Error in findAllSimple:', error);
      throw error;
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  test() {
    return { message: 'Menus API is working!', timestamp: new Date().toISOString() };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get menus count' })
  @ApiResponse({ status: 200, description: 'Menus count retrieved' })
  async getCount() {
    try {
      const count = await this.menusService.getCount();
      return { count };
    } catch (error) {
      console.error('Error getting count:', error);
      return { error: error.message };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiResponse({ status: 200, description: 'Menu retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update menu by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete menu by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
