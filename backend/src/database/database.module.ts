import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { createMongooseOptions } from './mongoose.providers';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: createMongooseOptions,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
