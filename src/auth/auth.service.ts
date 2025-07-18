// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  async validate(email: string, password: string): Promise<string | null> {
    const admin = await this.adminRepo.findOneBy({ email });
    if (admin && admin.password === password) {
      return this.jwtService.sign({ email });
    }
    return null;
  }
}
