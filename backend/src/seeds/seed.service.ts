import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../modules/users/schema/users.schema';
import { Menu, MenuDocument } from '../modules/menus/schemas/menu.schema';
import { Preference, PreferenceDocument } from '../modules/preferences/schemas/preference.schema';
import { Schedule, ScheduleDocument } from '../modules/schedules/schemas/schedule.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  async seedUsers(): Promise<void> {
    console.log('🌱 Seeding users...');

    // Admin user
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const adminUser = {
      email: 'admin@meerai.kin',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      role: 'admin' as const,
      timezone: 'Asia/Bangkok',
    };

    await this.userModel.findOneAndUpdate(
      { email: adminUser.email },
      adminUser,
      { upsert: true, new: true },
    );

    // Sample user
    const userPasswordHash = await bcrypt.hash('User123!', 10);
    const sampleUser = {
      email: 'user@meerai.kin',
      passwordHash: userPasswordHash,
      name: 'Sample User',
      role: 'user' as const,
      timezone: 'Asia/Bangkok',
    };

    await this.userModel.findOneAndUpdate(
      { email: sampleUser.email },
      sampleUser,
      { upsert: true, new: true },
    );

    console.log('✅ Users seeded successfully');
  }

  async seedMenus(): Promise<void> {
    console.log('🌱 Seeding menus...');

    const cuisines = ['Thai', 'Japanese', 'Chinese', 'Korean', 'Western'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
    const allergens = ['peanut', 'shrimp', 'dairy', 'gluten', 'soy', 'egg', 'fish'];

    const menus = [];

    // Generate 20 menus per meal type (60 total)
    for (const mealType of mealTypes) {
      for (let i = 0; i < 20; i++) {
        const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
        const menuAllergens = allergens
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3));

        const menu = {
          title: this.generateMenuTitle(mealType, cuisine, i),
          mealType,
          cuisine,
          isActive: true,
          notes: `Delicious ${cuisine} ${mealType} option`,
          allergens: menuAllergens,
          budgetMin: Math.floor(Math.random() * 20) + 40, // 40-60
          budgetMax: Math.floor(Math.random() * 60) + 80, // 80-140
          imageUrl: `https://example.com/images/${mealType}-${cuisine.toLowerCase()}-${i + 1}.jpg`,
        };

        menus.push(menu);
      }
    }

    // Insert menus in batches
    for (const menu of menus) {
      await this.menuModel.findOneAndUpdate(
        { title: menu.title, mealType: menu.mealType },
        menu,
        { upsert: true, new: true },
      );
    }

    console.log('✅ Menus seeded successfully');
  }

  async seedPreferences(): Promise<void> {
    console.log('🌱 Seeding preferences...');

    const sampleUser = await this.userModel.findOne({ email: 'user@meerai.kin' });
    if (!sampleUser) {
      console.log('⚠️ Sample user not found, skipping preferences');
      return;
    }

    const preferences = {
      userId: sampleUser._id,
      cuisines: ['Thai', 'Japanese'],
      allergensAvoid: ['peanut'],
      budgetMin: 50,
      budgetMax: 120,
      excludedMealTypes: [],
    };

    await this.preferenceModel.findOneAndUpdate(
      { userId: sampleUser._id },
      preferences,
      { upsert: true, new: true },
    );

    console.log('✅ Preferences seeded successfully');
  }

  async seedSchedules(): Promise<void> {
    console.log('🌱 Seeding schedules...');

    const sampleUser = await this.userModel.findOne({ email: 'user@meerai.kin' });
    if (!sampleUser) {
      console.log('⚠️ Sample user not found, skipping schedules');
      return;
    }

    const schedule = {
      userId: sampleUser._id,
      times: ['08:00', '12:00', '18:00'],
      timezone: 'Asia/Bangkok',
    };

    await this.scheduleModel.findOneAndUpdate(
      { userId: sampleUser._id },
      schedule,
      { upsert: true, new: true },
    );

    console.log('✅ Schedules seeded successfully');
  }

  async runSeeds(): Promise<void> {
    console.log('🚀 Starting database seeding...');

    try {
      await this.seedUsers();
      await this.seedMenus();
      await this.seedPreferences();
      await this.seedSchedules();

      console.log('🎉 All seeds completed successfully!');
      console.log('\n📋 Sample accounts:');
      console.log('Admin: admin@meerai.kin / Admin123!');
      console.log('User:  user@meerai.kin / User123!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  private generateMenuTitle(mealType: string, cuisine: string, index: number): string {
    const templates = {
      breakfast: [
        `${cuisine} Breakfast Bowl`,
        `${cuisine} Morning Delight`,
        `Traditional ${cuisine} Breakfast`,
        `${cuisine} Sunrise Special`,
        `Healthy ${cuisine} Start`,
      ],
      lunch: [
        `${cuisine} Lunch Special`,
        `Authentic ${cuisine} Lunch`,
        `${cuisine} Midday Feast`,
        `Classic ${cuisine} Lunch`,
        `${cuisine} Lunch Combo`,
      ],
      dinner: [
        `${cuisine} Dinner Experience`,
        `Premium ${cuisine} Dinner`,
        `${cuisine} Evening Special`,
        `Gourmet ${cuisine} Dinner`,
        `${cuisine} Dinner Delight`,
      ],
    };

    const titles = templates[mealType as keyof typeof templates];
    const baseTitle = titles[index % titles.length];
    
    // Add variety with numbers or descriptors
    if (index >= titles.length) {
      const descriptors = ['Plus', 'Pro', 'Deluxe', 'Signature', 'Premium'];
      const descriptor = descriptors[Math.floor(index / titles.length) % descriptors.length];
      return `${baseTitle} ${descriptor}`;
    }

    return baseTitle;
  }
}
