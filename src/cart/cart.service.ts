import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

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
    });

    if (existingCartItem) {
      // Varsa miktarı güncelle
      const newQuantity = existingCartItem.quantity + quantity;
      
      // Yeni miktar için stok kontrolü
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Yeterli stok yok. Mevcut stok: ${product.stock}`);
      }

      existingCartItem.quantity = newQuantity;
      return await this.cartRepository.save(existingCartItem);
    } else {
      // Yoksa yeni sepet öğesi oluştur
      const cartItem = this.cartRepository.create({
        userId,
        productId,
        quantity,
      });
      return await this.cartRepository.save(cartItem);
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
      items: cartItems,
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

    // Tüm ürünler için stok kontrolü
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `${item.product.name} için yeterli stok yok. Mevcut stok: ${item.product.stock}`
        );
      }
    }

    // Stoktan düş
    for (const item of cartItems) {
      item.product.stock -= item.quantity;
      await this.productRepository.save(item.product);
    }

    // Toplam fiyatı hesapla
    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Sepeti temizle
    await this.cartRepository.remove(cartItems);

    return {
      message: 'Sipariş başarıyla tamamlandı',
      items: cartItems,
      total: total.toFixed(2),
    };
  }
}
