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

    // Curated menus with proper food images that match the dishes
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
      // ===== THAI CUISINE (10 menus) =====
      { title: 'Royal Thai Congee', cuisine: 'Thai', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 60, budgetMax: 110, allergens: [] },
      { title: 'Thai Omelet Perfection', cuisine: 'Thai', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 50, budgetMax: 90, allergens: ['egg'] },
      { title: 'Traditional Jok', cuisine: 'Thai', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 55, budgetMax: 95, allergens: [] },
      { title: 'Pad Thai Royale', cuisine: 'Thai', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695daece?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 90, budgetMax: 150, allergens: ['peanut','shrimp','egg'] },
      { title: 'Basil Chicken Paradise', cuisine: 'Thai', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-8dcaaaeaf4a4?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 85, budgetMax: 140, allergens: ['soy'] },
      { title: 'Thai Fried Rice Supreme', cuisine: 'Thai', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 70, budgetMax: 120, allergens: ['egg'] },
      { title: 'Green Curry Excellence', cuisine: 'Thai', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 95, budgetMax: 160, allergens: ['dairy'] },
      { title: 'Royal Massaman Curry', cuisine: 'Thai', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 140, budgetMax: 230, allergens: ['peanut','dairy'] },
      { title: 'Tom Yum Seafood Symphony', cuisine: 'Thai', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 120, budgetMax: 200, allergens: ['shrimp'] },
      { title: 'Panang Curry Deluxe', cuisine: 'Thai', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 220, allergens: ['peanut','dairy'] },

      // ===== JAPANESE CUISINE (10 menus) =====
      { title: 'Traditional Zen Breakfast', cuisine: 'Japanese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 120, budgetMax: 200, allergens: ['fish','soy','egg'] },
      { title: 'Tamagoyaki Delight', cuisine: 'Japanese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 80, budgetMax: 140, allergens: ['egg','soy'] },
      { title: 'Miso Morning Glory', cuisine: 'Japanese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 60, budgetMax: 100, allergens: ['soy'] },
      { title: 'Premium Sushi Collection', cuisine: 'Japanese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 200, budgetMax: 350, allergens: ['fish','soy'] },
      { title: 'Tempura Deluxe Box', cuisine: 'Japanese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1571091718761-18b5b1457add?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 170, budgetMax: 280, allergens: ['egg','gluten','soy'] },
      { title: 'Udon Noodle Symphony', cuisine: 'Japanese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 145, budgetMax: 240, allergens: ['gluten','soy'] },
      { title: 'Katsu Curry Masterpiece', cuisine: 'Japanese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 175, budgetMax: 290, allergens: ['gluten','dairy'] },
      { title: 'Tonkotsu Ramen Perfection', cuisine: 'Japanese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 180, budgetMax: 300, allergens: ['gluten','egg','soy'] },
      { title: 'Sashimi Grand Platter', cuisine: 'Japanese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 280, budgetMax: 480, allergens: ['fish'] },
      { title: 'Unagi Don Royal', cuisine: 'Japanese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 240, budgetMax: 420, allergens: ['fish','soy'] },

      // ===== KOREAN CUISINE (10 menus) =====
      { title: 'Korean Fusion Toast', cuisine: 'Korean', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 80, budgetMax: 130, allergens: ['egg','dairy','gluten'] },
      { title: 'Kimchi Jjigae Morning', cuisine: 'Korean', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 90, budgetMax: 140, allergens: ['soy','fish'] },
      { title: 'Juk Harmony Bowl', cuisine: 'Korean', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 75, budgetMax: 125, allergens: [] },
      { title: 'Bibimbap Perfection', cuisine: 'Korean', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 140, budgetMax: 230, allergens: ['egg','soy'] },
      { title: 'Bulgogi Premium Bowl', cuisine: 'Korean', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1606850780554-b55fb84dc5c5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 160, budgetMax: 260, allergens: ['soy'] },
      { title: 'Japchae Glass Noodles', cuisine: 'Korean', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 205, allergens: ['soy'] },
      { title: 'Sundubu Jjigae Delight', cuisine: 'Korean', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 215, allergens: ['soy','shrimp'] },
      { title: 'Korean BBQ Premium Set', cuisine: 'Korean', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1606850780554-b55fb84dc5c5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 250, budgetMax: 480, allergens: ['soy'] },
      { title: 'Dakgalbi Spicy Excellence', cuisine: 'Korean', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1606850780554-b55fb84dc5c5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 195, budgetMax: 320, allergens: ['soy'] },
      { title: 'Bossam Pork Wraps', cuisine: 'Korean', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1606850780554-b55fb84dc5c5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 220, budgetMax: 400, allergens: [] },

      // ===== WESTERN CUISINE (10 menus) =====
      { title: 'Artisan Avocado Toast', cuisine: 'Western', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 120, budgetMax: 180, allergens: ['gluten'] },
      { title: 'Berry Bliss Pancakes', cuisine: 'Western', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 140, budgetMax: 220, allergens: ['egg','dairy','gluten'] },
      { title: 'Eggs Benedict Royal', cuisine: 'Western', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 150, budgetMax: 250, allergens: ['egg','dairy','gluten'] },
      { title: 'Margherita Perfection', cuisine: 'Western', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 170, budgetMax: 280, allergens: ['dairy','gluten'] },
      { title: 'Club Sandwich Elite', cuisine: 'Western', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 130, budgetMax: 210, allergens: ['gluten','egg','dairy'] },
      { title: 'Caesar Salad Premium', cuisine: 'Western', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 145, budgetMax: 230, allergens: ['dairy','fish'] },
      { title: 'Fish & Chips Classic', cuisine: 'Western', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1571091718761-18b5b1457add?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 155, budgetMax: 250, allergens: ['fish','gluten'] },
      { title: 'Angus Steak Perfection', cuisine: 'Western', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 300, budgetMax: 500, allergens: [] },
      { title: 'Truffle Carbonara Luxe', cuisine: 'Western', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 180, budgetMax: 280, allergens: ['egg','dairy','gluten'] },
      { title: 'Grilled Salmon Supreme', cuisine: 'Western', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 220, budgetMax: 380, allergens: ['fish'] },

      // ===== VIETNAMESE CUISINE (10 menus) =====
      { title: 'Pho Morning Glory', cuisine: 'Vietnamese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 100, budgetMax: 160, allergens: [] },
      { title: 'Banh Mi Sunrise', cuisine: 'Vietnamese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1540151812223-c30f7698f5f9?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 70, budgetMax: 120, allergens: ['gluten'] },
      { title: 'Xoi Sticky Rice Delight', cuisine: 'Vietnamese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 65, budgetMax: 110, allergens: [] },
      { title: 'Pho Bo Signature', cuisine: 'Vietnamese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1512054507848-54b8c4a4364b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 130, budgetMax: 220, allergens: [] },
      { title: 'Bun Cha Hanoi Style', cuisine: 'Vietnamese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 210, allergens: [] },
      { title: 'Banh Xeo Crispy Crepe', cuisine: 'Vietnamese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 110, budgetMax: 180, allergens: ['gluten','shrimp'] },
      { title: 'Com Tam Broken Rice', cuisine: 'Vietnamese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 95, budgetMax: 160, allergens: [] },
      { title: 'Pho Ga Chicken Noodle', cuisine: 'Vietnamese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1512054507848-54b8c4a4364b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 120, budgetMax: 200, allergens: [] },
      { title: 'Bun Bo Hue Royale', cuisine: 'Vietnamese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 140, budgetMax: 230, allergens: [] },
      { title: 'Cao Lau Premium', cuisine: 'Vietnamese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 220, allergens: ['gluten'] },

      // ===== CHINESE CUISINE (10 menus) =====
      { title: 'Dim Sum Morning Glory', cuisine: 'Chinese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 85, budgetMax: 145, allergens: ['gluten','soy'] },
      { title: 'Congee Royale', cuisine: 'Chinese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 65, budgetMax: 110, allergens: [] },
      { title: 'Soy Milk & You Tiao', cuisine: 'Chinese', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 50, budgetMax: 90, allergens: ['soy','gluten'] },
      { title: 'Imperial Dim Sum Tower', cuisine: 'Chinese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 160, budgetMax: 260, allergens: ['gluten','soy','egg','shrimp'] },
      { title: 'Yangzhou Fried Rice', cuisine: 'Chinese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 95, budgetMax: 155, allergens: ['egg'] },
      { title: 'Chow Mein Excellence', cuisine: 'Chinese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-8dcaaaeaf4a4?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 105, budgetMax: 175, allergens: ['gluten','soy'] },
      { title: 'Mapo Tofu Supreme', cuisine: 'Chinese', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 115, budgetMax: 190, allergens: ['soy'] },
      { title: 'Peking Duck Royale', cuisine: 'Chinese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-8dcaaaeaf4a4?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 320, budgetMax: 620, allergens: ['gluten'] },
      { title: 'Kung Pao Chicken Deluxe', cuisine: 'Chinese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-8dcaaaeaf4a4?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 215, allergens: ['peanut','soy'] },
      { title: 'Sweet & Sour Pork Premium', cuisine: 'Chinese', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-8dcaaaeaf4a4?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 205, allergens: ['gluten'] },

      // ===== ITALIAN CUISINE (10 menus) =====
      { title: 'Italian Breakfast Frittata', cuisine: 'Italian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 110, budgetMax: 180, allergens: ['egg','dairy'] },
      { title: 'Cornetto & Cappuccino', cuisine: 'Italian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 95, budgetMax: 155, allergens: ['gluten','dairy'] },
      { title: 'Focaccia Morning', cuisine: 'Italian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1590534247854-2f0c4bf1e475?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 85, budgetMax: 140, allergens: ['gluten'] },
      { title: 'Caprese Salad Classic', cuisine: 'Italian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1505575972945-283b8a31b751?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 225, allergens: ['dairy'] },
      { title: 'Margherita Pizza Perfection', cuisine: 'Italian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 180, budgetMax: 290, allergens: ['dairy','gluten'] },
      { title: 'Penne Arrabbiata', cuisine: 'Italian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 155, budgetMax: 250, allergens: ['gluten'] },
      { title: 'Minestrone Soup Supreme', cuisine: 'Italian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 200, allergens: [] },
      { title: 'Truffle Risotto Excellence', cuisine: 'Italian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1476124369491-f51bb1d5585f?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 250, budgetMax: 400, allergens: ['dairy'] },
      { title: 'Lasagna Bolognese Royale', cuisine: 'Italian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 195, budgetMax: 320, allergens: ['gluten','dairy'] },
      { title: 'Osso Buco Premium', cuisine: 'Italian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 280, budgetMax: 480, allergens: [] },

      // ===== INDIAN CUISINE (10 menus) =====
      { title: 'Masala Dosa Supreme', cuisine: 'Indian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567168544254-30a6a96bd3d5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 100, budgetMax: 160, allergens: ['gluten'] },
      { title: 'Idli Sambar Classic', cuisine: 'Indian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 85, budgetMax: 140, allergens: [] },
      { title: 'Poha Morning Delight', cuisine: 'Indian', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 75, budgetMax: 125, allergens: [] },
      { title: 'Chicken Biryani Paradise', cuisine: 'Indian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1604908177522-040a9042f6e5?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 155, budgetMax: 255, allergens: [] },
      { title: 'Tandoori Chicken Excellence', cuisine: 'Indian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 165, budgetMax: 270, allergens: ['dairy'] },
      { title: 'Paneer Tikka Masala', cuisine: 'Indian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 145, budgetMax: 235, allergens: ['dairy'] },
      { title: 'Dal Makhani Supreme', cuisine: 'Indian', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 200, allergens: ['dairy'] },
      { title: 'Butter Chicken Paradise', cuisine: 'Indian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 170, budgetMax: 280, allergens: ['dairy'] },
      { title: 'Rogan Josh Royal', cuisine: 'Indian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 185, budgetMax: 305, allergens: ['dairy'] },
      { title: 'Lamb Vindaloo Deluxe', cuisine: 'Indian', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 200, budgetMax: 340, allergens: [] },

      // ===== MEXICAN CUISINE (10 menus) =====
      { title: 'Chilaquiles Morning', cuisine: 'Mexican', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1612840666989-eb62e23ecaaf?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 95, budgetMax: 155, allergens: ['gluten','dairy'] },
      { title: 'Huevos Rancheros Classic', cuisine: 'Mexican', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 105, budgetMax: 170, allergens: ['egg'] },
      { title: 'Breakfast Burrito Supreme', cuisine: 'Mexican', mealType: 'breakfast', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 110, budgetMax: 180, allergens: ['gluten','egg','dairy'] },
      { title: 'Tacos al Pastor Royale', cuisine: 'Mexican', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 135, budgetMax: 215, allergens: [] },
      { title: 'Burrito Bowl Paradise', cuisine: 'Mexican', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 155, budgetMax: 245, allergens: ['dairy'] },
      { title: 'Quesadilla Deluxe', cuisine: 'Mexican', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a7560dc5c3?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 125, budgetMax: 205, allergens: ['gluten','dairy'] },
      { title: 'Torta Mexicana Premium', cuisine: 'Mexican', mealType: 'lunch', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 115, budgetMax: 190, allergens: ['gluten'] },
      { title: 'Enchiladas Supremas', cuisine: 'Mexican', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1599974979061-15f88dc3a8d6?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 165, budgetMax: 270, allergens: ['gluten','dairy'] },
      { title: 'Carne Asada Excellence', cuisine: 'Mexican', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 195, budgetMax: 325, allergens: [] },
      { title: 'Mole Poblano Royale', cuisine: 'Mexican', mealType: 'dinner', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&h=600&q=85', budgetMin: 180, budgetMax: 295, allergens: ['peanut'] },
    ];

    // Insert all menus directly without variants
    await this.menuModel.insertMany(curated.map(menu => ({ 
      ...menu, 
      isActive: true, 
      notes: `Authentic ${menu.cuisine} ${menu.mealType}` 
    })));

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
