import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. Kullanıcı Oluşturma (Burası zaten vardı)
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  // 2. Auth için E-posta ile bulma (Burası da vardı)
  async findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // --- AŞAĞIDAKİLER EKSİK OLDUĞU İÇİN HATA ALIYORDUN ---

  // 3. Tümünü Listele
  findAll() {
    return this.usersRepository.find();
  }

  // 4. ID'ye göre tek bir kullanıcı bul (Controller bunu arıyor)
  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
        throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findMe(userId: number) {
    const user = await this.findOne(userId);
    return this.sanitizeUser(user);
  }

  // 5. Güncelleme (Controller bunu arıyor)
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Email validasyonu
    if (updateUserDto.email) {
      if (!this.isValidEmail(updateUserDto.email)) {
        throw new BadRequestException('Geçerli bir e-posta giriniz');
      }
      if (updateUserDto.email !== user.email) {
        const existingUser = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUser && existingUser.id !== user.id) {
          throw new BadRequestException('Bu e-posta adresi zaten kullanımda.');
        }
      }
    }

    // Password validasyonu ve hashleme
    if (updateUserDto.password) {
      if (typeof updateUserDto.password !== 'string' || updateUserDto.password.length < 6) {
        throw new BadRequestException('Şifre string olmalı ve en az 6 karakter olmalı');
      }
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    this.usersRepository.merge(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async updateMe(userId: number, updateUserDto: UpdateUserDto) {
    return this.update(userId, updateUserDto);
  }

  // 6. Silme (Controller bunu arıyor)
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}