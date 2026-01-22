import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DataSource } from 'typeorm'; // Transaction yöneticisi
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {} // Repository yerine DataSource kullanacağız

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    // 1. Veritabanı bağlantısını başlat
    await queryRunner.connect();
    // 2. Transaction'ı başlat (Geri alma noktası oluşturur)
    await queryRunner.startTransaction();

    try {
      // --- İŞLEMLER BAŞLIYOR ---

      // A. Ürünü Bul (Kilitliyoruz ki başkası o an değiştiremesin)
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createOrderDto.productId },
      });

      if (!product) {
        throw new BadRequestException('Ürün bulunamadı.');
      }

      // B. Stok Kontrolü
      if (product.stock < createOrderDto.quantity) {
        throw new BadRequestException('Yetersiz stok!');
      }

      // C. Sipariş Nesnesini Oluştur
      const total = product.price * createOrderDto.quantity;
      const order = queryRunner.manager.create(Order, {
        quantity: createOrderDto.quantity,
        totalPrice: total,
        product: product,
        user: { id: userId } as User,
      });

      // D. Siparişi Kaydet
      await queryRunner.manager.save(order);

      // E. Stoktan Düş ve Ürünü Güncelle
      product.stock -= createOrderDto.quantity;
      await queryRunner.manager.save(product);

      // --- İŞLEMLER BİTTİ ---
      
      // Her şey yolundaysa değişiklikleri onayla (Kalıcı yap)
      await queryRunner.commitTransaction();
      
      return order;

    } catch (err) {
      // Hata olduysa her şeyi en başa sar (Sipariş silinir, stok eski haline döner)
      await queryRunner.rollbackTransaction();
      throw err; // Hatayı kullanıcıya da göster
    } finally {
      // Bağlantıyı serbest bırak
      await queryRunner.release();
    }
  }
}