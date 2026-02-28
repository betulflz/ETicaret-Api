import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Kullanıcıdan dönen review'da password gizle
  private sanitizeReview(review: Review) {
    if (review.user) {
      const { password, ...safeUser } = review.user as any;
      return { ...review, user: safeUser };
    }
    return review;
  }

  // Yorum oluştur
  async create(userId: number, createReviewDto: CreateReviewDto) {
    const { productId, rating, title, comment } = createReviewDto;

    // Ürün var mı kontrol et
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Kullanıcı bu ürüne zaten yorum yapmış mı
    const existing = await this.reviewRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('Bu ürüne zaten yorum yaptınız. Yorumunuzu güncelleyebilirsiniz.');
    }

    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      title,
      comment,
    });

    const saved = await this.reviewRepository.save(review);

    // Ürünün ortalama puanını güncelle
    await this.updateProductRating(productId);

    // İlişkileriyle birlikte dön
    const result = await this.reviewRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'product'],
    });

    return this.sanitizeReview(result!);
  }

  // Bir ürünün tüm yorumlarını getir
  async findByProduct(productId: number) {
    // Ürün var mı kontrol et
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Ortalama puan hesapla
    const stats = await this.getProductRatingStats(productId);

    return {
      reviews: reviews.map((r) => this.sanitizeReview(r)),
      ...stats,
    };
  }

  // Kullanıcının tüm yorumlarını getir
  async findByUser(userId: number) {
    const reviews = await this.reviewRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return {
      reviews,
      count: reviews.length,
    };
  }

  // Tek bir yorum getir
  async findOne(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Yorum bulunamadı');
    }

    return this.sanitizeReview(review);
  }

  // Yorum güncelle (sadece sahibi güncelleyebilir)
  async update(userId: number, reviewId: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Yorum bulunamadı');
    }

    // Sadece yorum sahibi güncelleyebilir
    if (review.userId !== userId) {
      throw new ForbiddenException('Bu yorumu güncelleme yetkiniz yok');
    }

    // Güncelle
    if (updateReviewDto.rating !== undefined) review.rating = updateReviewDto.rating;
    if (updateReviewDto.title !== undefined) review.title = updateReviewDto.title;
    if (updateReviewDto.comment !== undefined) review.comment = updateReviewDto.comment;

    const saved = await this.reviewRepository.save(review);

    // Ürünün ortalama puanını güncelle
    await this.updateProductRating(review.productId);

    return this.sanitizeReview(saved);
  }

  // Yorum sil (sahibi veya admin silebilir)
  async remove(userId: number, reviewId: number, userRole: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Yorum bulunamadı');
    }

    // Sahibi veya admin silebilir
    if (review.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Bu yorumu silme yetkiniz yok');
    }

    const productId = review.productId;
    await this.reviewRepository.remove(review);

    // Ürünün ortalama puanını güncelle
    await this.updateProductRating(productId);

    return { message: 'Yorum silindi' };
  }

  // Ürünün puan istatistiklerini hesapla
  async getProductRatingStats(productId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .addSelect('SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END)', 'star5')
      .addSelect('SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END)', 'star4')
      .addSelect('SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END)', 'star3')
      .addSelect('SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END)', 'star2')
      .addSelect('SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END)', 'star1')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      averageRating: result.averageRating ? parseFloat(parseFloat(result.averageRating).toFixed(1)) : 0,
      totalReviews: parseInt(result.totalReviews) || 0,
      ratingDistribution: {
        5: parseInt(result.star5) || 0,
        4: parseInt(result.star4) || 0,
        3: parseInt(result.star3) || 0,
        2: parseInt(result.star2) || 0,
        1: parseInt(result.star1) || 0,
      },
    };
  }

  // Ürünün ortalama puanını product tablosunda güncelle
  private async updateProductRating(productId: number) {
    const stats = await this.getProductRatingStats(productId);
    await this.productRepository.update(productId, {
      averageRating: stats.averageRating,
      reviewCount: stats.totalReviews,
    });
  }
}
