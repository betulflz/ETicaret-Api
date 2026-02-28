import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column('int')
  stock: number;

  // Resim URL'i
  @Column({ nullable: true })
  imageUrl: string;

  // Ortalama puan (1-5 arası, review eklenince otomatik güncellenir)
  @Column('decimal', { default: 0, precision: 2, scale: 1 })
  averageRating: number;

  // Toplam yorum sayısı
  @Column('int', { default: 0 })
  reviewCount: number;
}