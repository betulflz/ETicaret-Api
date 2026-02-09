import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard) // Tüm endpoint'ler için auth gerekli
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Sepete ürün ekle
  @Post('add')
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.sub; // Token'dan kullanıcı ID'sini al
    return this.cartService.addToCart(userId, addToCartDto);
  }

  // Sepeti görüntüle
  @Get()
  getCart(@Request() req) {
    const userId = req.user.sub;
    return this.cartService.getCart(userId);
  }

  // Sepetteki ürün miktarını güncelle
  @Patch(':id')
  updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const userId = req.user.sub;
    return this.cartService.updateCartItem(userId, +id, updateCartDto);
  }

  // Sepetten ürün çıkar
  @Delete(':id')
  removeFromCart(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.cartService.removeFromCart(userId, +id);
  }

  // Sepeti temizle
  @Delete()
  clearCart(@Request() req) {
    const userId = req.user.sub;
    return this.cartService.clearCart(userId);
  }

  // Sepeti onayla ve satın al (stoktan düş)
  @Post('checkout')
  checkoutCart(@Request() req) {
    const userId = req.user.sub;
    return this.cartService.checkoutCart(userId);
  }
}
