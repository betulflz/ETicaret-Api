import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Şifre karşılaştırmak için
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // Access Token: 15 dakika
  async generateAccessToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'cokgizlibiranahtar',
      expiresIn: '15m',
    });
  }

  // Refresh Token: 30 gün
  async generateRefreshToken(userId: number) {
    const payload = { sub: userId, type: 'refresh' };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'gizlirefreshkey',
      expiresIn: '30d',
    });

    // Veritabanında refresh token'ı kaydet
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.save({
      token,
      userId,
      expiresAt,
      isValid: true,
    });

    return token;
  }

  async signUp(createUserDto: CreateUserDto) {
    // Kaydı yap ve JWT üret
    const user = await this.usersService.create(createUserDto);
    const { password, ...safeUser } = user; // Parola hash'ini yanıt dışı bırak

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: safeUser,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

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
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Refresh token'ı doğrula
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'gizlirefreshkey',
      });

      // Veritabanında refresh token kontrolü
      const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          token: refreshToken,
          userId: decoded.sub,
          isValid: true,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Geçersiz refresh token.');
      }

      // Token süresini kontrol et
      if (new Date() > storedToken.expiresAt) {
        storedToken.isValid = false;
        await this.refreshTokenRepository.save(storedToken);
        throw new UnauthorizedException('Refresh token süresi dolmuş.');
      }

      // Kullanıcı bilgilerini getir
      const user = await this.usersService.findOne(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı.');
      }

      // Yeni access token oluştur
      const newAccessToken = await this.generateAccessToken(
        user.id,
        user.email,
        user.role,
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token geçersiz.');
    }
  }

  async getProfile(userId: number) {
    return this.usersService.findMe(userId);
  }
}