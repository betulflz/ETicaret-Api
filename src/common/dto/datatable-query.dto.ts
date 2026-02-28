import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * jQuery DataTables Server-Side Processing İstek DTO'su
 * 
 * DataTables AJAX isteği şu parametreleri gönderir:
 * - draw: Her istekte artan sayaç (güvenlik için geri döndürülür)
 * - start: Başlangıç satır numarası (offset)
 * - length: Sayfa başına gösterilecek kayıt sayısı
 * - search[value]: Global arama değeri
 * - order[0][column]: Sıralama yapılacak kolon indexi
 * - order[0][dir]: Sıralama yönü (asc/desc)
 * - columns[i][data]: Kolon veri kaynağı
 * - columns[i][name]: Kolon adı
 * - columns[i][searchable]: Kolon aranabilir mi
 * - columns[i][orderable]: Kolon sıralanabilir mi
 * - columns[i][search][value]: Kolon bazlı arama değeri
 */
export class DataTableQueryDto {
  @ApiPropertyOptional({ description: 'DataTable draw sayacı (güvenlik için geri döndürülür)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  draw?: number;

  @ApiPropertyOptional({ description: 'Başlangıç satır numarası (offset)', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  start?: number;

  @ApiPropertyOptional({ description: 'Sayfa başına gösterilecek kayıt sayısı', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1) // -1 = tümünü göster
  length?: number;

  // Global arama - search[value] olarak gelir
  @ApiPropertyOptional({ description: 'Global arama değeri' })
  @IsOptional()
  @IsString()
  'search[value]'?: string;

  // Sıralama - order[0][column] ve order[0][dir] olarak gelir
  @ApiPropertyOptional({ description: 'Sıralama yapılacak kolon indexi', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  'order[0][column]'?: number;

  @ApiPropertyOptional({ description: 'Sıralama yönü (asc/desc)', example: 'asc' })
  @IsOptional()
  @IsString()
  'order[0][dir]'?: string;
}

/**
 * jQuery DataTables Server-Side Processing Yanıt Arayüzü
 * 
 * DataTables şu formatta yanıt bekler:
 * {
 *   "draw": 1,                  // İstek ile gelen draw değeri
 *   "recordsTotal": 100,        // Toplam kayıt sayısı (filtresiz)
 *   "recordsFiltered": 50,      // Filtrelenmiş kayıt sayısı
 *   "data": [...]               // Gösterilecek veriler
 * }
 */
export interface DataTableResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

/**
 * DataTable istek parametrelerini parse eder.
 * Query string'den gelen columns ve order bilgilerini yapılandırılmış hale çevirir.
 */
export function parseDataTableQuery(query: Record<string, any>): ParsedDataTableQuery {
  const draw = parseInt(query.draw) || 1;
  const start = parseInt(query.start) || 0;
  const length = parseInt(query.length) || 10;
  const searchValue = query['search[value]'] || '';

  // Kolonları parse et
  const columns: DataTableColumn[] = [];
  let colIndex = 0;
  while (query[`columns[${colIndex}][data]`] !== undefined) {
    columns.push({
      data: query[`columns[${colIndex}][data]`],
      name: query[`columns[${colIndex}][name]`] || '',
      searchable: query[`columns[${colIndex}][searchable]`] === 'true',
      orderable: query[`columns[${colIndex}][orderable]`] === 'true',
      searchValue: query[`columns[${colIndex}][search][value]`] || '',
    });
    colIndex++;
  }

  // Sıralama bilgilerini parse et
  const orders: DataTableOrder[] = [];
  let orderIndex = 0;
  while (query[`order[${orderIndex}][column]`] !== undefined) {
    const columnIdx = parseInt(query[`order[${orderIndex}][column]`]);
    orders.push({
      column: columnIdx,
      dir: (query[`order[${orderIndex}][dir]`] || 'asc').toUpperCase() as 'ASC' | 'DESC',
      // Kolon adını da ekleyelim (eğer columns parse edildiyse)
      columnName: columns[columnIdx]?.data || '',
    });
    orderIndex++;
  }

  return {
    draw,
    start,
    length,
    searchValue,
    columns,
    orders,
  };
}

export interface DataTableColumn {
  data: string;       // Kolon veri kaynağı (alan adı)
  name: string;       // Kolon adı
  searchable: boolean; // Bu kolonda arama yapılabilir mi
  orderable: boolean;  // Bu kolona göre sıralanabilir mi
  searchValue: string; // Bu kolona özel arama değeri
}

export interface DataTableOrder {
  column: number;     // Sıralama yapılacak kolon indexi
  dir: 'ASC' | 'DESC'; // Sıralama yönü
  columnName: string; // Kolon alan adı
}

export interface ParsedDataTableQuery {
  draw: number;
  start: number;
  length: number;
  searchValue: string;
  columns: DataTableColumn[];
  orders: DataTableOrder[];
}
