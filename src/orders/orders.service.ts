import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DataSource } from 'typeorm'; // Transaction yöneticisi
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  private sanitizeUser(order: Order) {
    if (!order.user) {
      return order;
    }

    const { password, ...safeUser } = order.user as any;
    return { ...order, user: safeUser } as Order;
  }

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
        status: 'PENDING',
      });

      // D. Siparişi Kaydet
      const savedOrder = await queryRunner.manager.save(order);

      // --- İŞLEMLER BİTTİ ---
      
      // Her şey yolundaysa değişiklikleri onayla (Kalıcı yap)
      await queryRunner.commitTransaction();
      
      const orderWithRelations = await queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['product', 'user'],
      });

      return this.sanitizeUser(orderWithRelations ?? savedOrder);

    } catch (err) {
      // Hata olduysa her şeyi en başa sar (Sipariş silinir, stok eski haline döner)
      await queryRunner.rollbackTransaction();
      throw err; // Hatayı kullanıcıya da göster
    } finally {
      // Bağlantıyı serbest bırak
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: number) {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.sanitizeUser(order));
  }

  async findAllOrders(status?: string) {
    const whereClause = status ? { status } : {};
    const orders = await this.orderRepository.find({
      where: whereClause,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.sanitizeUser(order));
  }

  async approveOrder(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['product', 'user'],
      });

      if (!order) {
        throw new NotFoundException('Siparis bulunamadi.');
      }

      if (order.status === 'APPROVED') {
        return this.sanitizeUser(order);
      }

      if (order.status === 'REJECTED') {
        throw new BadRequestException('Reddedilen siparis onaylanamaz.');
      }

      const product = await queryRunner.manager.findOne(Product, {
        where: { id: order.product.id },
      });

      if (!product) {
        throw new BadRequestException('Urun bulunamadi.');
      }

      if (product.stock < order.quantity) {
        throw new BadRequestException('Yetersiz stok!');
      }

      product.stock -= order.quantity;
      await queryRunner.manager.save(product);

      order.status = 'APPROVED';
      const saved = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      const orderWithRelations = await queryRunner.manager.findOne(Order, {
        where: { id: saved.id },
        relations: ['product', 'user'],
      });

      return this.sanitizeUser(orderWithRelations ?? (saved as Order));
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectOrder(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Siparis bulunamadi.');
    }

    if (order.status === 'APPROVED') {
      throw new BadRequestException('Onaylanmis siparis reddedilemez.');
    }

    order.status = 'REJECTED';
    const saved = await this.orderRepository.save(order);
    const orderWithRelations = await this.orderRepository.findOne({
      where: { id: saved.id },
      relations: ['product', 'user'],
    });
    return this.sanitizeUser(orderWithRelations ?? saved);
  }
}