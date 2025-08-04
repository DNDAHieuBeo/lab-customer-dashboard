import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async validate(
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    const admin = await this.adminRepo.findOneBy({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return null;
    }
    const refreshExpiresIn = rememberMe ? '30d' : '7d';
    const access_token = this.jwtService.sign(
      { sub: admin.id },
      { expiresIn: '15m' },
    );
    const refresh_token = this.jwtService.sign(
      { sub: admin.id },
      { secret: 'REFRESH_SECRET', expiresIn: refreshExpiresIn },
    );

    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.adminRepo.update(admin.id, { refreshToken: hashedRefresh });

    return { access_token, refresh_token };
  }

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
  async getAdminProfile(userId: string): Promise<Partial<Admin>> {
    const admin = await this.adminRepo.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    if (!admin) {
      throw new UnauthorizedException('Không tìm thấy admin');
    }

    return admin;
  }
  async updateAdminProfile(
    adminId: string,
    data: { firstName: string; lastName: string },
  ): Promise<Partial<Admin>> {
    const admin = await this.adminRepo.findOneBy({ id: adminId });

    if (!admin) {
      throw new UnauthorizedException('Admin không tồn tại');
    }

    admin.firstName = data.firstName;
    admin.lastName = data.lastName;

    await this.adminRepo.save(admin);

    const { password, refreshToken, ...safeAdmin } = admin;
    return safeAdmin;
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminRepo.findOneBy({ id: adminId });

    if (!admin) throw new Error('Admin not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, admin.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    admin.password = hashedPassword;

    await this.adminRepo.save(admin);

    return { message: 'Password changed successfully' };
  }
}
