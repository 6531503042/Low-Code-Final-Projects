import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PreferenceDocument = Preference & Document;

@Schema({ timestamps: true })
export class Preference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  cuisines: string[];

  @Prop({ type: [String], default: [] })
  allergensAvoid: string[];

  @Prop({ type: Number })
  budgetMin?: number;

  @Prop({ type: Number })
  budgetMax?: number;

  @Prop({ type: [String], default: [] })
  excludedMealTypes: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
