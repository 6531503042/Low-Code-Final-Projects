import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Preference, PreferenceDocument } from './schemas/preference.schema';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(@InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>) {}

  async findByUserId(userId: string): Promise<Preference | null> {
    return this.preferenceModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async updateByUserId(userId: string, updatePreferenceDto: UpdatePreferenceDto): Promise<Preference> {
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      updatePreferenceDto,
      { upsert: true, new: true },
    );
  }

  async createDefaultPreferences(userId: string): Promise<Preference> {
    const defaultPreferences = {
      userId: new Types.ObjectId(userId),
      cuisines: [],
      allergensAvoid: [],
      excludedMealTypes: [],
    };

    const preference = new this.preferenceModel(defaultPreferences);
    return preference.save();
  }
}
