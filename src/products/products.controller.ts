import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/auth.guard'; // Giriş kontrolü
import { RolesGuard } from '../auth/roles.guard'; // Rol kontrolü
import { Roles } from '../auth/roles.decorator'; // Etiketimiz

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // SADECE ADMIN EKLEME YAPABİLİR
  @UseGuards(AuthGuard, RolesGuard) // Önce giriş yapmış mı, sonra yetkisi var mı?
  @Roles('admin') // Şartımız: admin olmak
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Herkes görebilir (Guard yok)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // ... Diğer metodlar (Update ve Delete için de @Roles('admin') eklemelisin)
}