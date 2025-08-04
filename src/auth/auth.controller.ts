import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RequestWithCookies } from 'src/types/request-with-cookie';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string; rememberMe: boolean },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenData = await this.authService.validate(
      body.email,
      body.password,
      body.rememberMe,
    );
  
    if (!tokenData) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const { rememberMe } = body; // ✅ Thêm dòng này để lấy rememberMe từ body
  
    const refreshMaxAgeMs = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
  
    res.cookie('refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: refreshMaxAgeMs,
    });
  
    return { access_token: tokenData.access_token };
  }
  

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const userId = req.user.sub; // 👈 ID từ JWT
    return this.authService.getAdminProfile(userId); // 👈 Trả về full admin info
  }
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    const adminId = req.user.sub;
    return this.authService.updateAdminProfile(adminId, body);
  }

  @Post('refresh')
  async refresh(@Req() req: RequestWithCookies) {
    const refresh_token = (req as any).cookies['refresh_token']; // Tạm thời
    const access_token = await this.authService.refreshToken(refresh_token);
    return { access_token };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    const adminId = req.user.sub;
    return this.authService.changePassword(adminId, body);
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
