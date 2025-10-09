import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'admin', enum: ['admin', 'user'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user';
}
