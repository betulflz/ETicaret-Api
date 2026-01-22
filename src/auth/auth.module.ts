import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Users modülünü çağırıyoruz
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule, // Çünkü şifre kontrolü için kullanıcıyı bulmamız lazım
    JwtModule.register({
      global: true, // Token her yerde geçerli olsun
      secret: 'cokgizlibiranahtar', // Normalde .env dosyasında saklanır, şimdilik böyle kalsın
      signOptions: { expiresIn: '1h' }, // Token 1 saat sonra geçersiz olsun (Güvenlik)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}