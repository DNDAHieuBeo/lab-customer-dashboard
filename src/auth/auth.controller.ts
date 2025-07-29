import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RequestWithCookies } from 'src/types/request-with-cookie';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenData = await this.authService.validate(
      body.email,
      body.password,
    );
    if (!tokenData) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gửi refresh token qua cookie thay vì body
    res.cookie('refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: false, // Chỉ bật ở production
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokenData.access_token };
  }

  // 👇 test route protected
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  @Post('refresh')
  async refresh(@Req() req: RequestWithCookies) {
    const refresh_token = (req as any).cookies['refresh_token']; // Tạm thời
    const access_token = await this.authService.refreshToken(refresh_token);
    return { access_token };
  }
  // 📁 backend/src/auth/auth.controller.ts
  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  logout(@Req() req: RequestWithCookies, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    this.authService.invalidateToken(refreshToken);
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
