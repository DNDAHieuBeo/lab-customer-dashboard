import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const tokenData = await this.authService.validate(
      body.email,
      body.password,
    );
    if (!tokenData) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token, 
    };
  }

  // 👇 test route protected
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const access_token = await this.authService.refreshToken(
      body.refresh_token,
    );
    return { access_token };
  }
}
