import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  // Yanıttan password alanını temizle
  private sanitizeCartItem(cartItem: Cart) {
    if (cartItem.user) {
      const { password, ...safeUser } = cartItem.user as any;
      return { ...cartItem, user: safeUser };
    }
    return cartItem;
  }

  // Sepete ürün ekle
  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Ürünün var olup olmadığını kontrol et
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Stok kontrolü
    if (product.stock < quantity) {
      throw new BadRequestException(`Yeterli stok yok. Mevcut stok: ${product.stock}`);
    }

    // Bu kullanıcının sepetinde bu ürün var mı kontrol et
    const existingCartItem = await this.cartRepository.findOne({
      where: { userId, productId },
      relations: ['product'],
    });

    if (existingCartItem) {
      // Varsa miktarı güncelle
      const newQuantity = existingCartItem.quantity + quantity;
      
      // Yeni miktar için stok kontrolü
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Yeterli stok yok. Mevcut stok: ${product.stock}`);
      }

      existingCartItem.quantity = newQuantity;
      const saved = await this.cartRepository.save(existingCartItem);
      // Kaydettikten sonra product ilişkisini yükle
      const result = await this.cartRepository.findOne({
        where: { id: saved.id },
        relations: ['product'],
      });
      return result;
    } else {
      // Yoksa yeni sepet öğesi oluştur
      const cartItem = this.cartRepository.create({
        userId,
        productId,
        quantity,
      });
      const saved = await this.cartRepository.save(cartItem);
      // Kaydettikten sonra product ilişkisini yükle
      const result = await this.cartRepository.findOne({
        where: { id: saved.id },
        relations: ['product'],
      });
      return result;
    }
  }

  // Kullanıcının sepetini getir
  async getCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });

    // Toplam fiyat hesapla
    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    return {
      items: cartItems.map(item => {
        // user eager olmadığı için artık password sızmaz, ama güvenlik için kontrol et
        const { user, ...safeItem } = item as any;
        return safeItem;
      }),
      total: total.toFixed(2),
      itemCount: cartItems.length,
    };
  }

  // Sepetteki ürün miktarını güncelle
  async updateCartItem(userId: number, cartItemId: number, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    // Stok kontrolü
    if (cartItem.product.stock < updateCartDto.quantity) {
      throw new BadRequestException(`Yeterli stok yok. Mevcut stok: ${cartItem.product.stock}`);
    }

    cartItem.quantity = updateCartDto.quantity;
    return await this.cartRepository.save(cartItem);
  }

  // Sepetten ürün çıkar
  async removeFromCart(userId: number, cartItemId: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    await this.cartRepository.remove(cartItem);
    return { message: 'Ürün sepetten kaldırıldı' };
  }

  // Sepeti temizle
  async clearCart(userId: number) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    await this.cartRepository.remove(cartItems);
    return { message: 'Sepet temizlendi' };
  }

  // Sepetteki ürünler için stoktan düş (sipariş verirken kullanılacak)
  async checkoutCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Sepetiniz boş');
    }

    // Tüm ürünler için stok kontrolü (onay aninda tekrar kontrol edilecek)
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `${item.product.name} için yeterli stok yok. Mevcut stok: ${item.product.stock}`
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders: Order[] = [];
      const orderIds: number[] = [];

      for (const item of cartItems) {
        const total = Number(item.product.price) * item.quantity;
        const order = queryRunner.manager.create(Order, {
          quantity: item.quantity,
          totalPrice: total,
          product: item.product,
          user: { id: userId } as User,
          status: 'PENDING',
        });

        const saved = await queryRunner.manager.save(order);
        orders.push(saved);
        orderIds.push(saved.id);
      }

      await queryRunner.manager.remove(cartItems);
      await queryRunner.commitTransaction();

      const ordersWithRelations = await this.dataSource.manager.find(Order, {
        where: { id: In(orderIds) },
        relations: ['product', 'user'],
      });

      const totalPrice = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

      return {
        message: 'Siparis onayi bekleniyor',
        orders: ordersWithRelations.length ? ordersWithRelations : orders,
        total: totalPrice.toFixed(2),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
