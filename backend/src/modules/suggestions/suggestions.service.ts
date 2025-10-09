import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailySuggestion, DailySuggestionDocument } from './schemas/daily-suggestion.schema';
import { MenusService } from '../menus/menus.service';
import { PreferencesService } from '../preferences/preferences.service';
import { getTodayInTimezone } from '../../common/utils/date.util';
import { RerollDto } from './dto/reroll.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(DailySuggestion.name) private dailySuggestionModel: Model<DailySuggestionDocument>,
    private menusService: MenusService,
    private preferencesService: PreferencesService,
  ) {}

  async generateToday(userId: string, timezone: string): Promise<DailySuggestion> {
    const date = getTodayInTimezone(timezone);
    const preferences = await this.preferencesService.findByUserId(userId);

    // Generate suggestions for each meal type
    const [breakfast, lunch, dinner] = await Promise.all([
      this.pickRandomMeal(userId, 'breakfast', preferences),
      this.pickRandomMeal(userId, 'lunch', preferences),
      this.pickRandomMeal(userId, 'dinner', preferences),
    ]);

    // Upsert the daily suggestion
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
    );

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
    );

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
  ): Promise<any> {
    // Check if meal type is excluded in preferences
    if (preferences?.excludedMealTypes?.includes(mealType)) {
      return null;
    }

    // Apply preferences if they exist
    if (preferences) {
      const mealPreferences = {
        cuisines: preferences.cuisines,
        allergensAvoid: preferences.allergensAvoid,
        budgetMin: preferences.budgetMin,
        budgetMax: preferences.budgetMax,
      };

      return this.menusService.pickRandomMealWithPreferences(mealType, mealPreferences);
    }

    // Fallback to random meal without preferences
    return this.menusService.pickRandomMeal(mealType);
  }
}
