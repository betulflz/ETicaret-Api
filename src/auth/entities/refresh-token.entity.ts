import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isValid: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
