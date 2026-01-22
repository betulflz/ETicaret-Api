import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // DİKKAT: Aynı mailden ikinci kez eklenemez
  email: string;

  @Column()
  password: string; // Buraya şifrenin kendisi değil, HASH'lenmiş hali gelecek

  @Column({ default: 'customer' }) // Varsayılan rol 'customer' olsun
  role: string;
}