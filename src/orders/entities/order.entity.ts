import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // Hangi kullanıcı sipariş verdi?
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  // Hangi ürünü aldı?
  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @Column()
  quantity: number; // Kaç adet aldı?

  @Column('decimal')
  totalPrice: number; // Toplam tutar ne kadar?

  @Column({ default: 'PENDING' })
  status: string; // PENDING | APPROVED | REJECTED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}