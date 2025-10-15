import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [String], default: ['08:00', '12:00', '18:00'] })
  times: string[];

  @Prop({ type: String, default: 'Asia/Bangkok' })
  timezone: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
