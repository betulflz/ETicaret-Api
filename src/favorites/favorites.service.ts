import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Favorilere ürün ekle
  async addFavorite(userId: number, productId: number) {
    // Ürün var mı kontrol et
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Zaten favorilerde mi kontrol et
    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('Bu ürün zaten favorilerinizde');
    }

    const favorite = this.favoriteRepository.create({ userId, productId });
    const saved = await this.favoriteRepository.save(favorite);

    return await this.favoriteRepository.findOne({
      where: { id: saved.id },
      relations: ['product'],
    });
  }

  // Kullanıcının favorilerini getir
  async getFavorites(userId: number) {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return {
      items: favorites,
      count: favorites.length,
    };
  }

  // Favorilerden ürün çıkar
  async removeFavorite(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (!favorite) {
      throw new NotFoundException('Bu ürün favorilerinizde bulunamadı');
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Ürün favorilerden kaldırıldı' };
  }

  // Ürün favorilerde mi kontrol et
  async isFavorite(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });
    return { isFavorite: !!favorite };
  }

  // Favorileri temizle
  async clearFavorites(userId: number) {
    const favorites = await this.favoriteRepository.find({ where: { userId } });
    await this.favoriteRepository.remove(favorites);
    return { message: 'Tüm favoriler temizlendi' };
  }

  // Bir ürünü kaç kişi favoriledi
  async getFavoriteCount(productId: number) {
    const count = await this.favoriteRepository.count({ where: { productId } });
    return { productId, favoriteCount: count };
  }
}
