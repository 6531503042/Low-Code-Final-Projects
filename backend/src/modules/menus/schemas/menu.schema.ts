import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, enum: ['breakfast', 'lunch', 'dinner'], index: true })
  mealType: 'breakfast' | 'lunch' | 'dinner';

  @Prop({ type: String, required: true })
  cuisine: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: Number })
  budgetMin?: number;

  @Prop({ type: Number })
  budgetMax?: number;

  @Prop({ type: String })
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
