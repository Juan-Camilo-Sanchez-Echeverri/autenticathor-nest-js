// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(email: string, password: string): Promise<User> {
    const newUser = new this.userModel({ email, password });
    return await newUser.save();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async update2FASecret(userId: string, secret: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { twoFASecret: secret, twoFAEnabled: true },
      { new: true },
    );
  }

  async enable2FA(userId: string, secret: string): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { twoFASecret: secret, twoFAEnabled: true },
      { new: true },
    );
  }

  // Validar código 2FA
  async validate2FA(userId: string, code: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.twoFASecret === code;
  }
}
