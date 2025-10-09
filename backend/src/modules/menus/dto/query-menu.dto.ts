import { IsOptional, IsString, IsEnum, IsBoolean, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMenuDto {
  @ApiProperty({ example: 'Pad Thai', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'lunch', enum: ['breakfast', 'lunch', 'dinner'], required: false })
  @IsOptional()
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType?: 'breakfast' | 'lunch' | 'dinner';

  @ApiProperty({ example: 'Thai', required: false })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumberString()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumberString()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: 'createdAt:desc', required: false })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';
}
