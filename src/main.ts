import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Bu satırı ekle
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  
  // Static dosyalar için uploads klasörünü serve et
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Validasyon ayarın (Burası zaten vardı)
  app.useGlobalPipes(new ValidationPipe());

  // --- SWAGGER AYARLARI BAŞLANGIÇ ---
  const config = new DocumentBuilder()
    .setTitle('E-Ticaret API')
    .setDescription('NestJS ile geliştirdiğim backend projesi')
    .setVersion('1.0')
    .addBearerAuth() // Token ile giriş yapabilmek için bu ayar şart
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // --- SWAGGER AYARLARI BİTİŞ ---

  await app.listen(3000);
}
bootstrap();