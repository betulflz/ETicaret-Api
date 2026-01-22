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

  // --- YENİ EKLENEN KISIM ---
  @Column({ nullable: true }) // Resimsiz ürün olabilir diye nullable yaptık
  imageUrl: string; 
  // --------------------------
}