// src/auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không tồn tại hoặc không hợp lệ');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
