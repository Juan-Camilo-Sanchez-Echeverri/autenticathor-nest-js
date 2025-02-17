import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from '../users/schemas/user.schema';

import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async registerUser(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, passwordHash);

    return await user.save();
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) return null;

    return user;
  }

  async generate2FASecret(userId: string) {
    const secret = speakeasy.generateSecret({ name: `MyApp (${userId})` });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    const user = await this.usersService.enable2FA(userId, secret.base32);

    if (!user) throw new UnauthorizedException('User not found');

    return { qrCodeUrl };
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFASecret) {
      throw new UnauthorizedException('2FA is not enabled for this user');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');

    return { message: '2FA verified successfully' };
  }
}
