import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ProductsModule } from '../products/products.module'; // Import edilmiş mi?
import { UsersModule } from '../users/users.module'; // Import edilmiş mi?

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ProductsModule, // <-- BURADA OLMALI
    UsersModule     // <-- BURADA OLMALI
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}