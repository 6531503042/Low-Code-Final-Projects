import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailySuggestion, DailySuggestionDocument } from './schemas/daily-suggestion.schema';
import { MenusService } from '../menus/menus.service';
import { PreferencesService } from '../preferences/preferences.service';
import { getTodayInTimezone } from '../../common/utils/date.util';
import { RerollDto } from './dto/reroll.dto';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);
  private menuCache: Map<string, any[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectModel(DailySuggestion.name) private dailySuggestionModel: Model<DailySuggestionDocument>,
    private menusService: MenusService,
    private preferencesService: PreferencesService,
  ) {}

  async generateToday(userId: string, timezone: string): Promise<DailySuggestion> {
    const startTime = Date.now();
    const date = getTodayInTimezone(timezone);
    const preferences = await this.preferencesService.findByUserId(userId);

    this.logger.debug(`Generating suggestions for user ${userId} on ${date}`);

    // Generate suggestions for each meal type with better variety
    const usedMenuIds = new Set<string>();
    const [breakfast, lunch, dinner] = await Promise.all([
      this.pickRandomMeal(userId, 'breakfast', preferences, usedMenuIds),
      this.pickRandomMeal(userId, 'lunch', preferences, usedMenuIds),
      this.pickRandomMeal(userId, 'dinner', preferences, usedMenuIds),
    ]);

    // Update used menu IDs
    if (breakfast) usedMenuIds.add(breakfast._id.toString());
    if (lunch) usedMenuIds.add(lunch._id.toString());
    if (dinner) usedMenuIds.add(dinner._id.toString());

    // Upsert the daily suggestion with populated fields
    const suggestion = await this.dailySuggestionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      {
        userId: new Types.ObjectId(userId),
        date,
        breakfastMenuId: breakfast?._id,
        lunchMenuId: lunch?._id,
        dinnerMenuId: dinner?._id,
      },
      { upsert: true, new: true },
    ).populate('breakfastMenuId lunchMenuId dinnerMenuId');

    const duration = Date.now() - startTime;
    this.logger.log(`Generated suggestions in ${duration}ms`);

    return suggestion;
  }

  async getToday(userId: string, timezone: string): Promise<DailySuggestion | null> {
    const date = getTodayInTimezone(timezone);
    return this.dailySuggestionModel
      .findOne({ userId: new Types.ObjectId(userId), date })
      .populate('breakfastMenuId lunchMenuId dinnerMenuId');
  }

  async reroll(userId: string, timezone: string, rerollDto: RerollDto): Promise<DailySuggestion> {
    const date = getTodayInTimezone(timezone);
    const preferences = await this.preferencesService.findByUserId(userId);
    
    // Pick a new meal for the specified meal type
    const newMeal = await this.pickRandomMeal(userId, rerollDto.mealType, preferences);
    
    // Update the daily suggestion
    const updateField = `${rerollDto.mealType}MenuId`;
    const suggestion = await this.dailySuggestionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      { [updateField]: newMeal?._id },
      { new: true },
    ).populate([
      { path: 'breakfastMenuId', model: 'Menu' },
      { path: 'lunchMenuId', model: 'Menu' },
      { path: 'dinnerMenuId', model: 'Menu' },
    ]);

    if (!suggestion) {
      // If no suggestion exists for today, generate one
      return this.generateToday(userId, timezone);
    }

    return suggestion;
  }

  private async pickRandomMeal(
    userId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    preferences?: any,
    usedMenuIds?: Set<string>,
  ): Promise<any> {
    // Check if meal type is excluded in preferences
    if (preferences?.excludedMealTypes?.includes(mealType)) {
      return null;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(mealType, preferences);
    let candidates = this.getFromCache(cacheKey);

    if (!candidates) {
      // Fetch from database if not cached
      if (preferences) {
        const mealPreferences = {
          cuisines: preferences.cuisines,
          allergensAvoid: preferences.allergensAvoid,
          budgetMin: preferences.budgetMin,
          budgetMax: preferences.budgetMax,
        };
        candidates = await this.menusService.pickMultipleWithPreferences(mealType, mealPreferences, 10);
      } else {
        candidates = await this.menusService.pickMultipleMeals(mealType, 10);
      }

      this.setCache(cacheKey, candidates);
    }

    // Filter out already used menus
    if (usedMenuIds && usedMenuIds.size > 0) {
      candidates = candidates.filter(menu => !usedMenuIds.has(menu._id.toString()));
    }

    // Return random from candidates
    if (candidates && candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Fallbacks to ensure we always return something when data exists
    const withPrefs = preferences
      ? await this.menusService.pickRandomMealWithPreferences(mealType, {
          cuisines: preferences.cuisines,
          allergensAvoid: preferences.allergensAvoid,
          budgetMin: preferences.budgetMin,
          budgetMax: preferences.budgetMax,
        })
      : null;

    if (withPrefs) return withPrefs;

    const any = await this.menusService.pickRandomMeal(mealType);
    if (any) return any;

    // very last resort
    return this.menusService.pickAny(mealType);
  }

  private getCacheKey(mealType: string, preferences?: any): string {
    if (!preferences) return `menu:${mealType}:default`;
    
    const cuisines = (preferences.cuisines || []).sort().join(',');
    const allergens = (preferences.allergensAvoid || []).sort().join(',');
    const budget = `${preferences.budgetMin || 0}-${preferences.budgetMax || 999}`;
    
    return `menu:${mealType}:${cuisines}:${allergens}:${budget}`;
  }

  private getFromCache(key: string): any[] | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.menuCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.menuCache.get(key) || null;
  }

  private setCache(key: string, value: any[]): void {
    this.menuCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
}
