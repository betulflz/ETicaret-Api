import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { Cart } from './cart/entities/cart.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { FilesModule } from './files/files.module'; 
import { DatabaseModule } from './database/database.module';
import { FavoritesModule } from './favorites/favorites.module';
import { Favorite } from './favorites/entities/favorite.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/entities/review.entity';

@Module({
  imports: [
    // 1. RESİM KLASÖRÜNÜ DIŞARI AÇMA AYARI
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',
    }), // <-- Parantez burada kapanmalı, FilesModule bunun içinde OLMAZ.
    
    // 2. VERİTABANI AYARLARI
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'betulfiliz', 
      password: '1234', // <-- DİKKAT: Buraya kendi gerçek şifreni yazdığına emin ol!
      database: 'eticaret_db',
      entities: [User, Product, Order, Cart, RefreshToken, Favorite, Review],
      synchronize: true,
    }),

    // 3. DİĞER MODÜLLER
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CartModule,
    FavoritesModule,
    ReviewsModule,
    FilesModule,
    DatabaseModule,
  ],
})
export class AppModule {}