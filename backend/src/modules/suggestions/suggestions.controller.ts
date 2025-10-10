import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { RerollDto } from './dto/reroll.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Suggestions')
@Controller('suggestions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post('generate-today')
  @ApiOperation({ summary: 'Generate meal suggestions for today' })
  @ApiResponse({ status: 201, description: 'Suggestions generated successfully' })
  async generateToday(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.suggestionsService.generateToday(currentUser.id, currentUser.timezone);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s meal suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions retrieved successfully' })
  async getToday(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.suggestionsService.getToday(currentUser.id, currentUser.timezone);
  }

  @Post('reroll')
  @ApiOperation({ summary: 'Reroll a specific meal type for today' })
  @ApiResponse({ status: 200, description: 'Meal rerolled successfully' })
  async reroll(@CurrentUser() currentUser: CurrentUserPayload, @Body() rerollDto: RerollDto) {
    return this.suggestionsService.reroll(currentUser.id, currentUser.timezone, rerollDto);
  }
}
