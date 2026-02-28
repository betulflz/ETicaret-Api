import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /reviews — Yeni yorum oluştur (login gerekli)
  @UseGuards(AuthGuard)
  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    const userId = req.user.sub;
    return this.reviewsService.create(userId, createReviewDto);
  }

  // GET /reviews/product/:productId — Bir ürünün tüm yorumlarını getir (public)
  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }

  // GET /reviews/my — Kullanıcının kendi yorumlarını getir (login gerekli)
  @UseGuards(AuthGuard)
  @Get('my')
  findMyReviews(@Request() req) {
    const userId = req.user.sub;
    return this.reviewsService.findByUser(userId);
  }

  // GET /reviews/stats/:productId — Ürünün puan istatistikleri (public)
  @Get('stats/:productId')
  getStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductRatingStats(productId);
  }

  // GET /reviews/:id — Tek bir yorumu getir (public)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  // PATCH /reviews/:id — Yorumu güncelle (sadece sahibi)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userId = req.user.sub;
    return this.reviewsService.update(userId, id, updateReviewDto);
  }

  // DELETE /reviews/:id — Yorumu sil (sahibi veya admin)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.reviewsService.remove(userId, id, userRole);
  }
}
