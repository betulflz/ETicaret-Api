import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('favorites')
@UseGuards(AuthGuard) // Tüm favoriler endpointleri login gerektirir
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // POST /favorites — Favorilere ürün ekle
  @Post()
  addFavorite(@Request() req, @Body() addFavoriteDto: AddFavoriteDto) {
    const userId = req.user.sub;
    return this.favoritesService.addFavorite(userId, addFavoriteDto.productId);
  }

  // GET /favorites — Kullanıcının favori listesini getir
  @Get()
  getFavorites(@Request() req) {
    const userId = req.user.sub;
    return this.favoritesService.getFavorites(userId);
  }

  // GET /favorites/check/:productId — Ürün favorilerde mi kontrol et
  @Get('check/:productId')
  isFavorite(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
    const userId = req.user.sub;
    return this.favoritesService.isFavorite(userId, productId);
  }

  // GET /favorites/count/:productId — Ürünü kaç kişi favoriledi (public yapılabilir)
  @Get('count/:productId')
  getFavoriteCount(@Param('productId', ParseIntPipe) productId: number) {
    return this.favoritesService.getFavoriteCount(productId);
  }

  // DELETE /favorites/:productId — Favorilerden ürün çıkar
  @Delete(':productId')
  removeFavorite(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
    const userId = req.user.sub;
    return this.favoritesService.removeFavorite(userId, productId);
  }

  // DELETE /favorites — Tüm favorileri temizle
  @Delete()
  clearFavorites(@Request() req) {
    const userId = req.user.sub;
    return this.favoritesService.clearFavorites(userId);
  }
}
