import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { buildPaginationFilter, buildPaginationResult, PaginationResult } from '../../common/utils/pagination.util';

@Injectable()
export class MenusService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = new this.menuModel(createMenuDto);
    return menu.save();
  }

  async findAll(query: QueryMenuDto): Promise<PaginationResult<Menu>> {
    const { filter, sort, skip, limit } = buildPaginationFilter({
      page: query.page || 1,
      limit: query.limit || 20,
      sort: query.sort || 'createdAt:desc',
      search: query.search,
    });

    // Add specific filters
    if (query.mealType) {
      filter.mealType = query.mealType;
    }
    if (query.cuisine) {
      filter.cuisine = { $regex: query.cuisine, $options: 'i' };
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [menus, total] = await Promise.all([
      this.menuModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.menuModel.countDocuments(filter),
    ]);

    return buildPaginationResult(menus, total, query.page || 1, query.limit || 20);
  }

  async findAllSimple(): Promise<Menu[]> {
    return this.menuModel.find({ isActive: true }).limit(50).lean();
  }

  async getCount(): Promise<number> {
    return this.menuModel.countDocuments({ isActive: true });
  }

  async getAllMenus(): Promise<Menu[]> {
    return this.menuModel.find({ isActive: true }).limit(100).lean();
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuModel.findByIdAndUpdate(id, updateMenuDto, { new: true });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuModel.findByIdAndDelete(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
  }

  async pickRandomMeal(mealType: 'breakfast' | 'lunch' | 'dinner'): Promise<Menu | null> {
    const result = await this.menuModel.aggregate([
      { $match: { isActive: true, mealType } },
      { $sample: { size: 1 } },
    ]);
    return result[0] || null;
  }

  // Conservative fallback in case aggregation returns empty
  async pickAny(mealType: 'breakfast' | 'lunch' | 'dinner'): Promise<Menu | null> {
    const doc = await this.menuModel.findOne({ isActive: true, mealType }).sort({ createdAt: -1 }).lean();
    return (doc as unknown as Menu) || null;
  }

  async pickRandomMealWithPreferences(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    preferences?: {
      cuisines?: string[];
      allergensAvoid?: string[];
      budgetMin?: number;
      budgetMax?: number;
    },
  ): Promise<Menu | null> {
    const matchQuery: any = { isActive: true, mealType };

    // Apply cuisine preferences
    if (preferences?.cuisines && preferences.cuisines.length > 0) {
      matchQuery.cuisine = { $in: preferences.cuisines };
    }

    // Apply allergen avoidance
    if (preferences?.allergensAvoid && preferences.allergensAvoid.length > 0) {
      matchQuery.allergens = { $nin: preferences.allergensAvoid };
    }

    // Apply budget preferences
    if (preferences?.budgetMin !== undefined || preferences?.budgetMax !== undefined) {
      matchQuery.$and = [];
      
      if (preferences.budgetMin !== undefined) {
        matchQuery.$and.push({
          $or: [
            { budgetMax: null },
            { budgetMax: { $gte: preferences.budgetMin } },
          ],
        });
      }
      
      if (preferences.budgetMax !== undefined) {
        matchQuery.$and.push({
          $or: [
            { budgetMin: null },
            { budgetMin: { $lte: preferences.budgetMax } },
          ],
        });
      }
    }

    const result = await this.menuModel.aggregate([
      { $match: matchQuery },
      { $sample: { size: 1 } },
    ]);

    return result[0] || null;
  }

  async pickMultipleMeals(mealType: 'breakfast' | 'lunch' | 'dinner', count: number): Promise<Menu[]> {
    const result = await this.menuModel.aggregate([
      { $match: { isActive: true, mealType } },
      { $sample: { size: count } },
    ]);
    return result || [];
  }

  async pickMultipleWithPreferences(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    preferences: {
      cuisines?: string[];
      allergensAvoid?: string[];
      budgetMin?: number;
      budgetMax?: number;
    },
    count: number,
  ): Promise<Menu[]> {
    const matchQuery: any = { isActive: true, mealType };

    // Apply cuisine preferences
    if (preferences?.cuisines && preferences.cuisines.length > 0) {
      matchQuery.cuisine = { $in: preferences.cuisines };
    }

    // Apply allergen avoidance
    if (preferences?.allergensAvoid && preferences.allergensAvoid.length > 0) {
      matchQuery.allergens = { $nin: preferences.allergensAvoid };
    }

    // Apply budget preferences
    if (preferences?.budgetMin !== undefined || preferences?.budgetMax !== undefined) {
      matchQuery.$and = [];
      
      if (preferences.budgetMin !== undefined) {
        matchQuery.$and.push({
          $or: [
            { budgetMax: null },
            { budgetMax: { $gte: preferences.budgetMin } },
          ],
        });
      }
      
      if (preferences.budgetMax !== undefined) {
        matchQuery.$and.push({
          $or: [
            { budgetMin: null },
            { budgetMin: { $lte: preferences.budgetMax } },
          ],
        });
      }
    }

    const result = await this.menuModel.aggregate([
      { $match: matchQuery },
      { $sample: { size: count } },
    ]);

    return result || [];
  }
}
