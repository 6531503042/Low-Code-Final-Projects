import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schema/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { buildPaginationFilter, buildPaginationResult, PaginationResult } from '../../common/utils/pagination.util';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto, currentUser: CurrentUserPayload): Promise<any> {
    const { email, password, name, timezone = 'Asia/Bangkok', role = 'user' } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new this.userModel({
      email,
      passwordHash,
      name,
      timezone,
      role: currentUser.role === 'admin' ? role : 'user',
    });

    await user.save();
    return this.findById(user._id.toString());
  }

  async findAll(query: QueryUserDto): Promise<PaginationResult<any>> {
    const { filter, sort, skip, limit } = buildPaginationFilter(query);
    
    // Add role filter if specified
    if (query.role) {
      filter.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter).sort(sort).skip(skip).limit(limit).select('-passwordHash'),
      this.userModel.countDocuments(filter),
    ]);

    return buildPaginationResult(users, total, query.page || 1, query.limit || 20);
  }

  async findById(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUserPayload): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only admin can update role
    if (updateUserDto.role && currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin can update user roles');
    }

    const updateData: any = { ...updateUserDto };
    
    // Hash password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateData.password;
    }

    await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    return this.findById(id);
  }

  async remove(id: string, currentUser: CurrentUserPayload): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-deletion
    if (user._id.toString() === currentUser.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    await this.userModel.findByIdAndDelete(id);
  }

  async getProfile(currentUser: CurrentUserPayload): Promise<any> {
    return this.findById(currentUser.id);
  }

  async updateProfile(currentUser: CurrentUserPayload, updateUserDto: Partial<UpdateUserDto>): Promise<any> {
    // Remove role from update data for self-update
    const { role, ...allowedUpdates } = updateUserDto;
    
    const updateData: any = { ...allowedUpdates };
    
    // Hash password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateData.password;
    }

    await this.userModel.findByIdAndUpdate(currentUser.id, updateData, { new: true });
    return this.findById(currentUser.id);
  }
}
