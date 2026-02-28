import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
@Unique(['userId', 'productId']) // Bir kullanıcı bir ürüne yalnızca 1 yorum yapabilir
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: number;

  // Yıldız puanı (1-5 arası)
  @Column('int')
  rating: number;

  // Yorum başlığı (opsiyonel)
  @Column({ nullable: true })
  title: string;

  // Yorum içeriği
  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
