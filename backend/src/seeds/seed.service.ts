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

    // Clear existing to avoid stale/random images
    await this.menuModel.deleteMany({});

    // Curated menus with deterministic Unsplash photo IDs to match dishes exactly
    const curated: Array<{
      title: string;
      cuisine: string;
      mealType: 'breakfast' | 'lunch' | 'dinner';
      imageUrl: string;
      budgetMin: number;
      budgetMax: number;
      allergens: string[];
      notes?: string;
    }> = [
      // Thai
      { title: 'Thai Jok (Rice Porridge)', cuisine: 'Thai', mealType: 'breakfast', imageUrl: this.imageById('1516684981049-7b3f9b5f52c7'), budgetMin: 45, budgetMax: 80, allergens: [] },
      { title: 'Pad Thai', cuisine: 'Thai', mealType: 'lunch', imageUrl: this.imageById('1559847844-5315695daece'), budgetMin: 70, budgetMax: 120, allergens: ['peanut','shrimp','egg'] },
      { title: 'Tom Yum Goong', cuisine: 'Thai', mealType: 'dinner', imageUrl: this.imageById('1578662996442-48f60103fc96'), budgetMin: 100, budgetMax: 160, allergens: ['shrimp'] },
      { title: 'Green Curry Chicken', cuisine: 'Thai', mealType: 'dinner', imageUrl: this.imageById('1586190848861-99aa4a171e90'), budgetMin: 100, budgetMax: 170, allergens: ['dairy'] },

      // Japanese
      { title: 'Japanese Breakfast Set', cuisine: 'Japanese', mealType: 'breakfast', imageUrl: this.imageById('1567620905732-2d1ec7ab7445'), budgetMin: 120, budgetMax: 180, allergens: ['fish','soy','egg'] },
      { title: 'Salmon Sushi Set', cuisine: 'Japanese', mealType: 'lunch', imageUrl: this.imageById('1563379091339-03246963d18c'), budgetMin: 180, budgetMax: 320, allergens: ['fish','soy'] },
      { title: 'Tonkotsu Ramen', cuisine: 'Japanese', mealType: 'dinner', imageUrl: this.imageById('1555939594-58d7cb561ad1'), budgetMin: 160, budgetMax: 280, allergens: ['gluten','egg','soy'] },
      { title: 'Tempura Bento', cuisine: 'Japanese', mealType: 'lunch', imageUrl: this.imageById('1571091718761-18b5b1457add'), budgetMin: 150, budgetMax: 260, allergens: ['egg','gluten','soy'] },

      // Chinese
      { title: 'Chinese Congee', cuisine: 'Chinese', mealType: 'breakfast', imageUrl: this.imageById('1572802419224-296b0aeee0d9'), budgetMin: 50, budgetMax: 90, allergens: [] },
      { title: 'Yangzhou Fried Rice', cuisine: 'Chinese', mealType: 'lunch', imageUrl: this.imageById('1565299624946-b28f40a0ca4b'), budgetMin: 80, budgetMax: 140, allergens: ['egg'] },
      { title: 'Kung Pao Chicken', cuisine: 'Chinese', mealType: 'dinner', imageUrl: this.imageById('1574484284002-8dcaaaeaf4a4'), budgetMin: 120, budgetMax: 200, allergens: ['peanut','soy'] },
      { title: 'Dim Sum Assortment', cuisine: 'Chinese', mealType: 'lunch', imageUrl: this.imageById('1565299543927-795dd21bf5b2'), budgetMin: 140, budgetMax: 240, allergens: ['gluten','soy','egg','shrimp'] },

      // Korean
      { title: 'Korean Egg Toast', cuisine: 'Korean', mealType: 'breakfast', imageUrl: this.imageById('1572802419224-296b0aeee0d9'), budgetMin: 70, budgetMax: 110, allergens: ['egg','dairy','gluten'] },
      { title: 'Bibimbap', cuisine: 'Korean', mealType: 'lunch', imageUrl: this.imageById('1579952363873-27d3bfad9c0d'), budgetMin: 130, budgetMax: 220, allergens: ['egg','soy'] },
      { title: 'Korean BBQ Set', cuisine: 'Korean', mealType: 'dinner', imageUrl: this.imageById('1586190848861-99aa4a171e90'), budgetMin: 220, budgetMax: 450, allergens: ['soy'] },
      { title: 'Kimchi Jjigae', cuisine: 'Korean', mealType: 'dinner', imageUrl: this.imageById('1578662996442-48f60103fc96'), budgetMin: 120, budgetMax: 190, allergens: ['soy','fish'] },

      // Western
      { title: 'Pancakes with Berries', cuisine: 'Western', mealType: 'breakfast', imageUrl: this.imageById('1567620905732-2d1ec7ab7445'), budgetMin: 120, budgetMax: 200, allergens: ['egg','dairy','gluten'] },
      { title: 'Margherita Pizza', cuisine: 'Western', mealType: 'lunch', imageUrl: this.imageById('1565299624946-b28f40a0ca4b'), budgetMin: 150, budgetMax: 260, allergens: ['dairy','gluten'] },
      { title: 'Classic Cheeseburger', cuisine: 'Western', mealType: 'dinner', imageUrl: this.imageById('1571091718761-18b5b1457add'), budgetMin: 150, budgetMax: 240, allergens: ['gluten','dairy'] },
      { title: 'Spaghetti Carbonara', cuisine: 'Western', mealType: 'dinner', imageUrl: this.imageById('1555939594-58d7cb561ad1'), budgetMin: 140, budgetMax: 230, allergens: ['egg','dairy','gluten'] },
    ];

    // Expand set with small variants to reach a richer dataset
    const menus: any[] = [];
    const variants = ['Signature', 'Deluxe', 'Premium', "Chef's Special"];
    curated.forEach((base, idx) => {
      menus.push({ ...base, isActive: true, notes: base.notes || `Authentic ${base.cuisine} ${base.mealType}` });
      const variant = variants[idx % variants.length];
      menus.push({
        ...base,
        title: `${base.title} ${variant}`,
        budgetMin: Math.max(40, base.budgetMin - 10),
        budgetMax: base.budgetMax + 20,
        isActive: true,
        notes: `${variant} edition`,
      });
    });

    await this.menuModel.insertMany(menus);

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
    // Prefer exact mapping when available
    const width = 800;
    const height = 600;
    const q = encodeURIComponent(`${title} ${cuisine} ${mealType} food`);
    return `https://source.unsplash.com/${width}x${height}/?${q}&${Date.now()}`;
  }

  private imageById(photoId: string): string {
    const width = 800;
    const height = 600;
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=85`;
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
