import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Giriş yapmanız gerekiyor!');
    }

    try {
      // Token'ı çözüyoruz (İçindeki user id'yi okuyoruz)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'cokgizlibiranahtar', // auth.module.ts'deki secret ile aynı olmalı
      });
      
      // Request nesnesinin içine 'user' diye bir alan ekliyoruz.
      // Böylece Controller'da "Kim bu?" dediğimizde user bilgisini alabileceğiz.
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Geçersiz Token!');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Header'da "Authorization: Bearer <token>" yazar. Biz oradaki <token> kısmını alıyoruz.
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}