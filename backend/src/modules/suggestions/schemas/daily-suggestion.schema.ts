import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailySuggestionDocument = DailySuggestion & Document;

@Schema({ timestamps: true })
export class DailySuggestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  @Prop({ type: Types.ObjectId, ref: 'Menu' })
  breakfastMenuId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Menu' })
  lunchMenuId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Menu' })
  dinnerMenuId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const DailySuggestionSchema = SchemaFactory.createForClass(DailySuggestion);

// Create compound unique index
DailySuggestionSchema.index({ userId: 1, date: 1 }, { unique: true });
