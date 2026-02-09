import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedProductsIfMissing();
  }

  private getRandomImageUrl(seed: string) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
  }

  private async seedProductsIfMissing() {
    const seedProducts: Array<
      Omit<Product, 'id'> & { id?: number }
    > = [
      {
        name: 'Apple iPhone 15 128GB',
        description: 'Akıllı telefon, 6.1 inç ekran, güçlü işlemci.',
        price: 57999,
        stock: 35,
        imageUrl: '',
      },
      {
        name: 'Samsung Galaxy S24 256GB',
        description: 'Akıllı telefon, yüksek performans ve gelişmiş kamera.',
        price: 54999,
        stock: 30,
        imageUrl: '',
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Aktif gürültü engellemeli kablosuz kulaklık.',
        price: 12999,
        stock: 60,
        imageUrl: '',
      },
      {
        name: 'Apple MacBook Air M2 13"',
        description: 'Hafif tasarım, M2 işlemci, uzun pil ömrü.',
        price: 69999,
        stock: 18,
        imageUrl: '',
      },
      {
        name: 'Dell XPS 13',
        description: '13 inç ultraportable dizüstü bilgisayar.',
        price: 64999,
        stock: 20,
        imageUrl: '',
      },
      {
        name: 'Nintendo Switch OLED',
        description: 'Taşınabilir oyun konsolu, OLED ekran.',
        price: 14999,
        stock: 45,
        imageUrl: '',
      },
      {
        name: 'Sony PlayStation 5',
        description: 'Yeni nesil oyun konsolu.',
        price: 23999,
        stock: 22,
        imageUrl: '',
      },
      {
        name: 'Canon EOS R50',
        description: 'Aynasız fotoğraf makinesi, 24.2 MP.',
        price: 34999,
        stock: 12,
        imageUrl: '',
      },
      {
        name: 'Dyson V11',
        description: 'Kablosuz dikey süpürge.',
        price: 29999,
        stock: 25,
        imageUrl: '',
      },
      {
        name: 'Nike Air Force 1',
        description: 'Klasik sneaker modeli.',
        price: 4999,
        stock: 90,
        imageUrl: '',
      },
      {
        name: 'Adidas Ultraboost',
        description: 'Koşu ayakkabısı, yüksek konfor.',
        price: 6499,
        stock: 70,
        imageUrl: '',
      },
      {
        name: "Levi's 501 Original Fit",
        description: 'Klasik kesim jean pantolon.',
        price: 2799,
        stock: 55,
        imageUrl: '',
      },
    ];

    const seedProductsWithImages = seedProducts.map((product) => ({
      ...product,
      imageUrl: this.getRandomImageUrl(product.name),
    }));

    const existing = await this.productRepository.find({
      select: ['name'],
    });
    const existingNames = new Set(existing.map((item) => item.name));

    const toInsert = seedProductsWithImages.filter(
      (product) => !existingNames.has(product.name),
    );

    if (toInsert.length === 0) {
      this.logger.log('Seed ürünleri zaten mevcut, ekleme yapılmadı.');
      return;
    }

    await this.productRepository.save(toInsert);
    this.logger.log(`${toInsert.length} adet dummy ürün eklendi.`);
  }
}
