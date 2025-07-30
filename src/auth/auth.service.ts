import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  // 🔐 Validate đăng nhập và sinh token
  async validate(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    const admin = await this.adminRepo.findOneBy({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return null;
    }

    const access_token = this.jwtService.sign(
      { sub: admin.id },
      { expiresIn: '15m' },
    );
    const refresh_token = this.jwtService.sign(
      { sub: admin.id },
      { secret: 'REFRESH_SECRET', expiresIn: '7d' },
    );

    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.adminRepo.update(admin.id, { refreshToken: hashedRefresh });

    return { access_token, refresh_token };
  }

  // 🔁 Cấp lại access token từ refresh token
  async refreshToken(rawToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(rawToken, {
        secret: 'REFRESH_SECRET',
      });

      const admin = await this.adminRepo.findOneBy({ id: payload.sub });
      if (!admin?.refreshToken) {
        throw new UnauthorizedException('Chưa đăng nhập');
      }

      const isValid = await bcrypt.compare(rawToken, admin.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Token không khớp');
      }

      return this.jwtService.sign({ sub: admin.id }, { expiresIn: '15m' });
    } catch (err) {
      console.error('[REFRESH TOKEN ERROR]', err); // 👈 debug khi cần
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }


  async invalidateToken(rawToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(rawToken, {
        secret: 'REFRESH_SECRET',
      });

      const admin = await this.adminRepo.findOneBy({ id: payload.sub });
      if (!admin?.refreshToken) {
        throw new UnauthorizedException('Không tìm thấy người dùng');
      }

      const isValid = await bcrypt.compare(rawToken, admin.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Không khớp token');
      }

      await this.adminRepo.update(admin.id, { refreshToken: null });
    } catch (err) {
      console.error('[LOGOUT TOKEN ERROR]', err);
      throw new UnauthorizedException('Không thể huỷ token');
    }
  }
  // 📌 Lấy thông tin đầy đủ của admin từ DB
  async getAdminProfile(userId: number): Promise<Partial<Admin>> {
    const admin = await this.adminRepo.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'email'], // 👈 chỉ lấy thông tin cần thiết
    });

    if (!admin) {
      throw new UnauthorizedException('Không tìm thấy admin');
    }

    return admin;
  }
  async updateAdminProfile(
    adminId: number,
    data: { firstName: string; lastName: string },
  ): Promise<Partial<Admin>> {
    const admin = await this.adminRepo.findOneBy({ id: adminId });
  
    if (!admin) {
      throw new UnauthorizedException('Admin không tồn tại');
    }
  
    admin.firstName = data.firstName;
    admin.lastName = data.lastName;
  
    await this.adminRepo.save(admin);
  
    // Trả về bản rút gọn, không trả password, token...
    const { password, refreshToken, ...safeAdmin } = admin;
    return safeAdmin;
  }
  
}
