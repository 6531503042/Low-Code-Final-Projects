import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../modules/user/schema/users.schema';
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
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = {
      email: 'admin@gmail.com',
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
    const userPasswordHash = await bcrypt.hash('user123', 10);
    const sampleUser = {
      email: 'user@gmail.com',
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

    const menus: any[] = [];

    // Generate 20 menus per meal type (60 total)
    for (const mealType of mealTypes) {
      for (let i = 0; i < 20; i++) {
        const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
        const menuAllergens = allergens
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3));

        const title = this.generateMenuTitle(mealType, cuisine, i);
        const menu = {
          title: title,
          mealType,
          cuisine,
          isActive: true,
          notes: `Delicious ${cuisine} ${mealType} option`,
          allergens: menuAllergens,
          budgetMin: Math.floor(Math.random() * 20) + 40, // 40-60
          budgetMax: Math.floor(Math.random() * 60) + 80, // 80-140
          imageUrl: this.getRandomFoodImage(mealType, cuisine, title),
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
      console.log('Admin: admin@gmail.com / admin123');
      console.log('User:  user@gmail.com / user123');
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

  private getRandomFoodImage(mealType: string, cuisine: string, title: string): string {
    // Get specific image based on menu title and cuisine
    const width = 400;
    const height = 300;
    
    // Map menu titles to specific food images
    const imageMap = this.getFoodImageMap(mealType, cuisine, title);
    const photoId = imageMap[Math.floor(Math.random() * imageMap.length)];
    
    return `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${width}&h=${height}&q=80`;
  }

  private getFoodImageMap(mealType: string, cuisine: string, title: string): string[] {
    // Thai Food Images
    const thaiImages = [
      '1559847844-5315695daece', // Pad Thai
      '1578662996442-48f60103fc96', // Tom Yum
      '1579952363873-27d3bfad9c0d', // Green Curry
      '1586190848861-99aa4a171e90', // Thai Curry
      '1578662996442-48f60103fc96'  // Thai Soup
    ];

    // Chinese Food Images  
    const chineseImages = [
      '1565299624946-b28f40a0ca4b', // Fried Rice
      '1574484284002-8dcaaaeaf4a4', // Chinese Noodles
      '1565299543927-795dd21bf5b2', // Dim Sum
      '1579952363873-27d3bfad9c0d', // Chinese Stir Fry
      '1586190848861-99aa4a171e90'  // Chinese Food
    ];

    // Japanese Food Images
    const japaneseImages = [
      '1563379091339-03246963d18c', // Sushi
      '1555939594-58d7cb561ad1', // Ramen
      '1571091718761-18b5b1457add', // Tempura
      '1567620905732-2d1ec7ab7445', // Bento Box
      '1565299624946-b28f40a0ca4b'  // Japanese Food
    ];

    // Korean Food Images
    const koreanImages = [
      '1579952363873-27d3bfad9c0d', // Bibimbap
      '1586190848861-99aa4a171e90', // Korean BBQ
      '1578662996442-48f60103fc96', // Kimchi
      '1565299624946-b28f40a0ca4b', // Korean Food
      '1579952363873-27d3bfad9c0d'  // Korean Dish
    ];

    // Western Food Images
    const westernImages = [
      '1571091718761-18b5b1457add', // Burger
      '1565299624946-b28f40a0ca4b', // Pizza
      '1555939594-58d7cb561ad1', // Pasta
      '1578662996442-48f60103fc96', // Steak
      '1586190848861-99aa4a171e90'  // Western Food
    ];

    // Breakfast Images
    const breakfastImages = [
      '1567620905732-2d1ec7ab7445', // Pancakes
      '1572802419224-296b0aeee0d9', // Breakfast Bowl
      '1578662996442-48f60103fc96', // Eggs
      '1586190848861-99aa4a171e90', // Cereal
      '1565299624946-b28f40a0ca4b'  // Toast
    ];

    // Lunch Images
    const lunchImages = [
      '1551782450-a2132b4ba21d', // Sandwich
      '1578662996442-48f60103fc96', // Salad
      '1586190848861-99aa4a171e90', // Soup
      '1565299624946-b28f40a0ca4b', // Lunch Bowl
      '1579952363873-27d3bfad9c0d'  // Wrap
    ];

    // Dinner Images
    const dinnerImages = [
      '1546833999-b9f581a1996d', // Main Course
      '1578662996442-48f60103fc96', // Grilled Food
      '1586190848861-99aa4a171e90', // Dinner Plate
      '1565299624946-b28f40a0ca4b', // Gourmet Food
      '1579952363873-27d3bfad9c0d'  // Fine Dining
    ];

    // Check if title contains specific keywords
    const titleLower = title.toLowerCase();

    // Thai specific dishes
    if (cuisine === 'Thai') {
      if (titleLower.includes('pad thai') || titleLower.includes('noodle')) return thaiImages;
      if (titleLower.includes('tom yum') || titleLower.includes('soup')) return thaiImages;
      if (titleLower.includes('curry')) return thaiImages;
      return thaiImages;
    }

    // Chinese specific dishes
    if (cuisine === 'Chinese') {
      if (titleLower.includes('fried rice') || titleLower.includes('rice')) return chineseImages;
      if (titleLower.includes('noodle') || titleLower.includes('noodles')) return chineseImages;
      if (titleLower.includes('dim sum')) return chineseImages;
      return chineseImages;
    }

    // Japanese specific dishes
    if (cuisine === 'Japanese') {
      if (titleLower.includes('sushi')) return japaneseImages;
      if (titleLower.includes('ramen')) return japaneseImages;
      if (titleLower.includes('tempura')) return japaneseImages;
      if (titleLower.includes('bento')) return japaneseImages;
      return japaneseImages;
    }

    // Korean specific dishes
    if (cuisine === 'Korean') {
      if (titleLower.includes('bibimbap')) return koreanImages;
      if (titleLower.includes('bbq') || titleLower.includes('bulgogi')) return koreanImages;
      if (titleLower.includes('kimchi')) return koreanImages;
      return koreanImages;
    }

    // Western specific dishes
    if (cuisine === 'Western') {
      if (titleLower.includes('burger')) return westernImages;
      if (titleLower.includes('pizza')) return westernImages;
      if (titleLower.includes('pasta')) return westernImages;
      if (titleLower.includes('steak')) return westernImages;
      return westernImages;
    }

    // Meal type specific images
    if (mealType === 'breakfast') {
      if (titleLower.includes('pancake')) return breakfastImages;
      if (titleLower.includes('waffle')) return breakfastImages;
      if (titleLower.includes('egg')) return breakfastImages;
      if (titleLower.includes('bowl')) return breakfastImages;
      return breakfastImages;
    }

    if (mealType === 'lunch') {
      if (titleLower.includes('sandwich')) return lunchImages;
      if (titleLower.includes('salad')) return lunchImages;
      if (titleLower.includes('soup')) return lunchImages;
      if (titleLower.includes('bowl')) return lunchImages;
      return lunchImages;
    }

    if (mealType === 'dinner') {
      if (titleLower.includes('grilled')) return dinnerImages;
      if (titleLower.includes('roasted')) return dinnerImages;
      if (titleLower.includes('main')) return dinnerImages;
      if (titleLower.includes('gourmet')) return dinnerImages;
      return dinnerImages;
    }

    // Default fallback
    return [
      '1565299624946-b28f40a0ca4b', // Pizza
      '1571091718761-18b5b1457add', // Burger
      '1563379091339-03246963d18c'  // Sushi
    ];
  }
}
