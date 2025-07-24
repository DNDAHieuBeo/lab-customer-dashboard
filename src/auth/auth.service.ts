// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  // Đăng nhập và tạo token
  async validate(email: string, password: string): Promise<{ access_token: string, refresh_token: string } | null> {
    const admin = await this.adminRepo.findOneBy({ email });

    // So sánh mật khẩu (bạn nên dùng bcrypt để bảo mật nếu đang lưu mật khẩu mã hóa)
    if (!admin || admin.password !== password) {
      return null;
    }

    const access_token = this.jwtService.sign({ sub: admin.id }, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign({ sub: admin.id }, { secret: 'REFRESH_SECRET', expiresIn: '7d' });

    // Mã hóa refresh token rồi lưu vào DB
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.adminRepo.update(admin.id, { refreshToken: hashedRefreshToken });

    return { access_token, refresh_token };
  }

  // Cấp lại access token mới từ refresh token
  async refreshToken(refresh_token: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refresh_token, { secret: 'REFRESH_SECRET' });

      const admin = await this.adminRepo.findOneBy({ id: payload.sub });
      if (!admin || !admin.refreshToken) throw new UnauthorizedException('Không tìm thấy người dùng');

      const isMatch = await bcrypt.compare(refresh_token, admin.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Refresh token không hợp lệ');

      // Tạo access token mới
      return this.jwtService.sign({ sub: admin.id }, { expiresIn: '15m' });
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
