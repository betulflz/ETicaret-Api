import { Body, Controller, HttpCode, HttpStatus, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// Giriş için DTO (Basitçe buraya yazıyorum, normalde ayrı dosyada olması daha iyidir)
class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    const userId = req.user['sub'];
    return this.authService.getProfile(userId);
  }
}