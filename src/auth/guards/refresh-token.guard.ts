// 📁 src/auth/guards/refresh-token.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class RefreshTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest<Request>();
      const refreshToken = req.cookies['refresh_token'];
  
      if (!refreshToken) throw new UnauthorizedException('Thiếu refresh token');
  
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: 'REFRESH_SECRET',
        });
        (req as any).user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }
    }
  }
  