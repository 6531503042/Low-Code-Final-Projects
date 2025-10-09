import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { DailySuggestion, DailySuggestionSchema } from './schemas/daily-suggestion.schema';
import { MenusModule } from '../menus/menus.module';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DailySuggestion.name, schema: DailySuggestionSchema }]),
    MenusModule,
    PreferencesModule,
  ],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
