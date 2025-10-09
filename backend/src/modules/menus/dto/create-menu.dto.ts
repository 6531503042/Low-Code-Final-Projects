import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Pad Thai' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'lunch', enum: ['breakfast', 'lunch', 'dinner'] })
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType: 'breakfast' | 'lunch' | 'dinner';

  @ApiProperty({ example: 'Thai' })
  @IsString()
  @IsNotEmpty()
  cuisine: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ example: 'Traditional Thai noodle dish', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: ['peanut', 'shrimp'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

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

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
