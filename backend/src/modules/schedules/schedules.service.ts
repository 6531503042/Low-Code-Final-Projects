import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) {}

  async findByUserId(userId: string): Promise<Schedule | null> {
    return this.scheduleModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async updateByUserId(userId: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    return this.scheduleModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      updateScheduleDto,
      { upsert: true, new: true },
    );
  }

  async createDefaultSchedule(userId: string, timezone: string = 'Asia/Bangkok'): Promise<Schedule> {
    const defaultSchedule = {
      userId: new Types.ObjectId(userId),
      times: ['08:00', '12:00', '18:00'],
      timezone,
    };

    const schedule = new this.scheduleModel(defaultSchedule);
    return schedule.save();
  }
}
