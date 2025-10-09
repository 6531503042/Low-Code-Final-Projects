import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RerollDto {
  @ApiProperty({ example: 'breakfast', enum: ['breakfast', 'lunch', 'dinner'] })
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType: 'breakfast' | 'lunch' | 'dinner';
}
