import { IsOptional, IsArray, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferenceDto {
  @ApiProperty({ example: ['Thai', 'Japanese'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisines?: string[];

  @ApiProperty({ example: ['peanut', 'shrimp'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergensAvoid?: string[];

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiProperty({ example: ['breakfast'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedMealTypes?: string[];
}
