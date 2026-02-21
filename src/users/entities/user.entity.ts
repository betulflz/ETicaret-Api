import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // DİKKAT: Aynı mailden ikinci kez eklenemez
  email: string;

  @Column()
  password: string; // Buraya şifrenin kendisi değil, HASH'lenmiş hali gelecek

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: 'customer' }) // Varsayılan rol 'customer' olsun
  role: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}