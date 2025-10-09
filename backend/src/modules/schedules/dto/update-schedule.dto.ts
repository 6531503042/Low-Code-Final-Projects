import { IsOptional, IsArray, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiProperty({ 
    example: ['08:00', '12:00', '18:00'], 
    required: false,
    description: 'Array of meal times in HH:mm format (24-hour)'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    each: true, 
    message: 'Each time must be in HH:mm format (24-hour)' 
  })
  times?: string[];

  @ApiProperty({ example: 'Asia/Bangkok', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
