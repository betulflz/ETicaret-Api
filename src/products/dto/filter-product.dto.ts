import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Bu DTO, ürün arama ve filtreleme için kullanılan query parametrelerini tanımlar.
// Örnek: GET /products?search=laptop&minPrice=100&maxPrice=5000&sortBy=price&order=ASC&page=1&limit=10
export class FilterProductDto {
  // --- ARAMA ---
  @ApiPropertyOptional({ description: 'Ürün adı veya açıklamasında arama yapar', example: 'laptop' })
  @IsOptional()
  @IsString()
  search?: string;

  // --- FİYAT FİLTRELEME ---
  @ApiPropertyOptional({ description: 'Minimum fiyat', example: 100 })
  @IsOptional()
  @Type(() => Number) // Query param string gelir, bunu number'a çevirir
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maksimum fiyat', example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // --- STOK FİLTRELEME ---
  @ApiPropertyOptional({ description: 'Sadece stokta olan ürünleri getir (true/false)', example: true })
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  // --- SIRALAMA ---
  @ApiPropertyOptional({
    description: 'Sıralama kriteri',
    enum: ['price', 'name', 'stock', 'id'],
    example: 'price',
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'name', 'stock', 'id'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sıralama yönü (ASC = küçükten büyüğe, DESC = büyükten küçüğe)',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  // --- SAYFALAMA (PAGİNATİON) ---
  @ApiPropertyOptional({ description: 'Sayfa numarası (1\'den başlar)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Sayfa başına ürün sayısı', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
