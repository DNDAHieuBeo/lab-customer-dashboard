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
    console.log('[DEBUG] Login payload:', body);
    try {
      const token = await this.authService.validate(body.email, body.password);
      if (!token) {
        console.log('[DEBUG] Invalid credentials');
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log('[DEBUG] Token generated:', token);
      return { access_token: token };
    } catch (err) {
      console.error('[DEBUG] /auth/login error:', err);
      throw err; // hoặc dùng HttpException
    }
  }

  // 👇 test route protected
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user; // 👈 nếu verify thành công, user sẽ nằm ở đây
  }
}
