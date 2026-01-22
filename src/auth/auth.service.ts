import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Şifre karşılaştırmak için

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, pass: string) {
    // 1. Kullanıcıyı bul
    const user = await this.usersService.findOneByEmail(email);
    
    // 2. Kullanıcı yoksa hata fırlat
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    // 3. Şifreyi kontrol et (Veritabanındaki hash ile girilen şifreyi kıyasla)
    const isMatch = await bcrypt.compare(pass, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedException('Şifre hatalı.');
    }

    // 4. Şifre doğruysa Token oluştur
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload), // İşte o meşhur JWT
    };
  }
}