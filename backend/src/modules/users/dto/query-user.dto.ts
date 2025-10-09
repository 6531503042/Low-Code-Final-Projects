import { IsOptional, IsString, IsEnum, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'user'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user';

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
