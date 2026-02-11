import { Controller, Post, Body, UseGuards, Request, Get, Query, Param, Patch, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard'; // Yazdığımız Guard'ı import ettik
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @UseGuards(AuthGuard)
  @Get()
  findMyOrders(@Request() req) {
    const userId = req.user.sub;
    return this.ordersService.findUserOrders(userId);
  }
}

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAllOrders(status);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.ordersService.approveOrder(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/approve')
  approvePut(@Param('id') id: string) {
    return this.ordersService.approveOrder(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.ordersService.rejectOrder(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/reject')
  rejectPut(@Param('id') id: string) {
    return this.ordersService.rejectOrder(+id);
  }
}