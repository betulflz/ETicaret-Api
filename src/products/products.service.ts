import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  // CONSTRUCTOR: Repository'yi buraya enjekte ediyoruz.
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // 1. Ürün Oluşturma
  async create(createProductDto: CreateProductDto) {
    // DTO'dan gelen veriyi veritabanı formatına çevirir
    const newProduct = this.productRepository.create(createProductDto);
    // Veritabanına kaydeder
    return await this.productRepository.save(newProduct);
  }

  // 2. Tümünü Listeleme
  async findAll() {
    return await this.productRepository.find();
  }

  // 3. ID'ye Göre Bulma
  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      // Eğer ürün yoksa hata fırlat (Best Practice)
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // 4. Güncelleme
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Önce var mı diye kontrol et
    const product = await this.findOne(id);
    // Varsa güncelle
    this.productRepository.merge(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  // 5. Silme
  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }
}