import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: ['admin', 'user'], default: 'user', index: true })
  role: 'admin' | 'user';

  @Prop({ type: String, default: 'Asia/Bangkok' })
  timezone: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);