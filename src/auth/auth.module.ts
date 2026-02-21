import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Users modülünü çağırıyoruz
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    UsersModule, // Çünkü şifre kontrolü için kullanıcıyı bulmamız lazım
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({
      global: true, // Token her yerde geçerli olsun
      secret: process.env.JWT_SECRET || 'cokgizlibiranahtar',
      signOptions: { expiresIn: '15m' }, // Access Token: 15 dakika
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}