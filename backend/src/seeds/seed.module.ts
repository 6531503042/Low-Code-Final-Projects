import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../modules/user/schema/users.schema';
import { Menu, MenuSchema } from '../modules/menus/schemas/menu.schema';
import { Preference, PreferenceSchema } from '../modules/preferences/schemas/preference.schema';
import { Schedule, ScheduleSchema } from '../modules/schedules/schemas/schedule.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/meerai'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
