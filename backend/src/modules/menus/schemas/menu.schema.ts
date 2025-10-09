import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  title: string;

  @Prop({ enum: ['breakfast', 'lunch', 'dinner'], index: true })
  mealType: 'breakfast' | 'lunch' | 'dinner';

  @Prop({ required: true })
  cuisine: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  notes?: string;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: Number })
  budgetMin?: number;

  @Prop({ type: Number })
  budgetMax?: number;

  @Prop()
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
