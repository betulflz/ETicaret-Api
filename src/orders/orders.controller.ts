import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard'; // Yazdığımız Guard'ı import ettik

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard) // <--- İŞTE BÜYÜ BURADA! "Sadece tokeni olan girsin"
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // req.user diyerek Token'ın içindeki kullanıcı ID'sine erişiyoruz
    const userId = req.user.sub; 
    return this.ordersService.create(userId, createOrderDto);
  }
}