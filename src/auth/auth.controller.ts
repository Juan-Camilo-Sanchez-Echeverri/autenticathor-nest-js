import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { email, password } = registerUserDto;
    return await this.authService.registerUser(email, password);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.authService.validateCredentials(email, password);

    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (user.twoFAEnabled) return { userId: user._id };

    return user;
  }

  @Post('verify-2fa')
  async verify2FA(@Body() { userId, code }: { userId: string; code: string }) {
    const user = await this.authService.verify2FA(userId, code);

    if (!user) throw new UnauthorizedException('Invalid 2FA code');

    return user;
  }

  @Post('generate-2fa')
  async generate2FA(@Body() { userId }: { userId: string }) {
    return await this.authService.generate2FASecret(userId);
  }
}
