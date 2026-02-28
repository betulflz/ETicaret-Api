import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Product } from './entities/product.entity';
import { ParsedDataTableQuery, DataTableResponse } from '../common/dto/datatable-query.dto';

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

  // 2. Tümünü Listeleme (Arama + Filtreleme + Sıralama + Sayfalama destekli)
  async findAll(filterDto?: FilterProductDto) {
    // QueryBuilder ile dinamik sorgu oluşturuyoruz
    const query = this.productRepository.createQueryBuilder('product');

    // --- ARAMA: İsim veya açıklamada geçen kelimeyi arar ---
    if (filterDto?.search) {
      query.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)',
        { search: `%${filterDto.search.toLowerCase()}%` },
      );
    }

    // --- FİYAT FİLTRESİ: Minimum fiyat ---
    if (filterDto?.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice: filterDto.minPrice });
    }

    // --- FİYAT FİLTRESİ: Maksimum fiyat ---
    if (filterDto?.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: filterDto.maxPrice });
    }

    // --- STOK FİLTRESİ: Sadece stokta olanlar ---
    if (filterDto?.inStock === true) {
      query.andWhere('product.stock > 0');
    }

    // --- SIRALAMA ---
    const sortBy = filterDto?.sortBy || 'id'; // Varsayılan: id'ye göre sırala
    const order = filterDto?.order || 'ASC';   // Varsayılan: küçükten büyüğe
    query.orderBy(`product.${sortBy}`, order);

    // --- SAYFALAMA (PAGİNATİON) ---
    const page = filterDto?.page || 1;    // Varsayılan: 1. sayfa
    const limit = filterDto?.limit || 10; // Varsayılan: sayfa başına 10 ürün
    const skip = (page - 1) * limit;      // Kaç kayıt atlayacağını hesapla

    query.skip(skip).take(limit);

    // Hem verileri hem toplam sayıyı al (sayfalama bilgisi için gerekli)
    const [products, total] = await query.getManyAndCount();

    return {
      data: products,
      meta: {
        total,                              // Toplam ürün sayısı
        page,                               // Şu anki sayfa
        limit,                              // Sayfa başına ürün
        totalPages: Math.ceil(total / limit), // Toplam sayfa sayısı
      },
    };
  }

  // ========================================
  // DataTable Server-Side Processing
  // jQuery DataTables AJAX istekleri için
  // ========================================
  async findAllDataTable(dtQuery: ParsedDataTableQuery): Promise<DataTableResponse<Product>> {
    // İzin verilen sıralama kolonları (SQL injection koruması)
    const allowedColumns = ['id', 'name', 'description', 'price', 'stock', 'imageUrl'];

    // --- TOPLAM KAYIT SAYISI (Filtresiz) ---
    const recordsTotal = await this.productRepository.count();

    // --- QueryBuilder ile dinamik sorgu ---
    const query = this.productRepository.createQueryBuilder('product');

    // --- GLOBAL ARAMA ---
    if (dtQuery.searchValue && dtQuery.searchValue.trim() !== '') {
      const searchTerm = `%${dtQuery.searchValue.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search OR CAST(product.price AS TEXT) LIKE :search OR CAST(product.id AS TEXT) LIKE :search)',
        { search: searchTerm },
      );
    }

    // --- KOLON BAZLI ARAMA ---
    dtQuery.columns.forEach((col) => {
      if (col.searchable && col.searchValue && col.searchValue.trim() !== '' && allowedColumns.includes(col.data)) {
        query.andWhere(`LOWER(CAST(product.${col.data} AS TEXT)) LIKE :colSearch_${col.data}`, {
          [`colSearch_${col.data}`]: `%${col.searchValue.toLowerCase()}%`,
        });
      }
    });

    // --- FİLTRELENMİŞ KAYIT SAYISI ---
    const recordsFiltered = await query.getCount();

    // --- SIRALAMA ---
    if (dtQuery.orders.length > 0) {
      dtQuery.orders.forEach((order, index) => {
        const columnName = order.columnName;
        if (allowedColumns.includes(columnName)) {
          if (index === 0) {
            query.orderBy(`product.${columnName}`, order.dir);
          } else {
            query.addOrderBy(`product.${columnName}`, order.dir);
          }
        }
      });
    } else {
      query.orderBy('product.id', 'ASC');
    }

    // --- SAYFALAMA (PAGINATION) ---
    if (dtQuery.length > 0) {
      query.skip(dtQuery.start).take(dtQuery.length);
    }
    // length = -1 ise tümünü göster (DataTables "All" seçeneği)

    const data = await query.getMany();

    return {
      draw: dtQuery.draw,
      recordsTotal,
      recordsFiltered,
      data,
    };
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