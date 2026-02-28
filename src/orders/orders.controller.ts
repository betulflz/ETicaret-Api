import { Controller, Post, Body, UseGuards, Request, Get, Query, Param, Patch, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard'; // Yazdığımız Guard'ı import ettik
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { parseDataTableQuery } from '../common/dto/datatable-query.dto';

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

  // ========================================
  // DataTable Server-Side Processing
  // GET /orders/datatable?draw=1&start=0&length=10&...
  // ========================================
  @UseGuards(AuthGuard)
  @Get('datatable')
  findMyOrdersDataTable(@Request() req, @Query() query: Record<string, any>) {
    const userId = req.user.sub;
    const dtQuery = parseDataTableQuery(query);
    return this.ordersService.findUserOrdersDataTable(userId, dtQuery);
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

  // ========================================
  // Admin DataTable Server-Side Processing
  // GET /admin/orders/datatable?draw=1&start=0&length=10&...
  // ========================================
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('datatable')
  findAllDataTable(@Query() query: Record<string, any>, @Query('status') status?: string) {
    const dtQuery = parseDataTableQuery(query);
    return this.ordersService.findAllOrdersDataTable(dtQuery, status);
  }

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