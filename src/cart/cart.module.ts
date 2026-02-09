import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Product]),
    AuthModule, // JWT doğrulaması için
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // Başka modüllerde kullanılabilir
})
export class CartModule {}
