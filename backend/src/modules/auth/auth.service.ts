import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schema/users.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, currentUser?: CurrentUserPayload): Promise<{ accessToken: string; user: any }> {
    const { email, password, name, timezone = 'Asia/Bangkok', role = 'user' } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Only allow admin to set role
    if (role === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
      throw new UnauthorizedException('Only admin can create admin users');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new this.userModel({
      email,
      passwordHash,
      name,
      timezone,
      role: currentUser?.role === 'admin' ? role : 'user',
    });

    await user.save();

    // Generate JWT
    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Return user without password
    const userResponse = await this.userModel.findById(user._id).select('-passwordHash');

    return {
      accessToken,
      user: {
        id: userResponse._id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        timezone: userResponse.timezone,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Return user without password
    const userResponse = await this.userModel.findById(user._id).select('-passwordHash');

    return {
      accessToken,
      user: {
        id: userResponse._id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        timezone: userResponse.timezone,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
    };
  }
}
