# 🛒 E-Ticaret Backend Projesi - Detaylı Döküman

## 📋 İçindekiler
1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Modüller ve İşlevleri](#modüller-ve-işlevleri)
5. [Veritabanı Yapısı](#veritabanı-yapısı)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Endpoints](#api-endpoints)
8. [Kod Örnekleri](#kod-örnekleri)

---

## 🎯 Proje Genel Bakış

Bu proje, **NestJS** framework'ü kullanılarak geliştirilmiş modern bir e-ticaret backend uygulamasıdır. PostgreSQL veritabanı, JWT authentication, role-based authorization ve dosya yükleme özellikleri içerir.

### Ana Özellikler:
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Admin ve Customer rol yönetimi
- ✅ Ürün yönetimi (CRUD işlemleri)
- ✅ Resim yükleme ve görüntüleme
- ✅ Sepet sistemi
- ✅ Sipariş yönetimi
- ✅ Stok takibi
- ✅ Swagger API dokümantasyonu

---

## 🛠 Teknoloji Stack

### Backend Framework
- **NestJS 11.0**: Modüler ve ölçeklenebilir Node.js framework
- **TypeScript**: Tip güvenli programlama dili

### Veritabanı
- **PostgreSQL**: İlişkisel veritabanı
- **TypeORM 0.3.28**: ORM (Object-Relational Mapping) aracı

### Güvenlik & Authentication
- **JWT (JSON Web Tokens)**: Token tabanlı kimlik doğrulama
- **bcrypt 6.0**: Şifre hashleme
- **Passport.js**: Authentication middleware

### Diğer Kütüphaneler
- **Multer**: Dosya yükleme
- **Swagger**: API dokümantasyonu
- **class-validator**: DTO validasyonu
- **class-transformer**: Veri dönüşümü

---

## 📁 Proje Yapısı

```
ecommerce-backend/
├── src/
│   ├── main.ts                    # Uygulama giriş noktası
│   ├── app.module.ts              # Ana modül
│   │
│   ├── auth/                      # Kimlik Doğrulama Modülü
│   │   ├── auth.controller.ts     # Login, Register endpoint'leri
│   │   ├── auth.service.ts        # Auth iş mantığı
│   │   ├── auth.guard.ts          # JWT Guard (Token kontrolü)
│   │   ├── roles.guard.ts         # Role Guard (Admin/User kontrolü)
│   │   └── roles.decorator.ts     # @Roles() decorator
│   │
│   ├── users/                     # Kullanıcı Modülü
│   │   ├── users.controller.ts    # User CRUD endpoints
│   │   ├── users.service.ts       # User iş mantığı
│   │   ├── entities/
│   │   │   └── user.entity.ts     # User veritabanı tablosu
│   │   └── dto/
│   │       ├── create-user.dto.ts # Kullanıcı oluşturma verisi
│   │       └── update-user.dto.ts # Kullanıcı güncelleme verisi
│   │
│   ├── products/                  # Ürün Modülü
│   │   ├── products.controller.ts # Product CRUD + Image Upload
│   │   ├── products.service.ts    # Product iş mantığı
│   │   ├── entities/
│   │   │   └── product.entity.ts  # Product veritabanı tablosu
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   │
│   ├── cart/                      # Sepet Modülü
│   │   ├── cart.controller.ts     # Sepet endpoints
│   │   ├── cart.service.ts        # Sepet iş mantığı
│   │   ├── entities/
│   │   │   └── cart.entity.ts     # Cart veritabanı tablosu
│   │   └── dto/
│   │       ├── add-to-cart.dto.ts
│   │       └── update-cart.dto.ts
│   │
│   ├── orders/                    # Sipariş Modülü
│   │   ├── orders.controller.ts   # Order endpoints
│   │   ├── orders.service.ts      # Order iş mantığı + Transaction
│   │   ├── entities/
│   │   │   └── order.entity.ts    # Order veritabanı tablosu
│   │   └── dto/
│   │       └── create-order.dto.ts
│   │
│   ├── files/                     # Dosya Yükleme Modülü
│   │   ├── files.controller.ts    # Upload endpoint
│   │   └── files.module.ts
│   │
│   └── database/                  # Veritabanı Seed
│       ├── database.module.ts
│       └── database.seeder.ts     # Test verileri
│
├── uploads/                       # Yüklenen resimler
├── test/                          # Test dosyaları
├── package.json                   # NPM bağımlılıkları
├── tsconfig.json                  # TypeScript yapılandırması
└── nest-cli.json                  # NestJS CLI yapılandırması
```

---

## 🧩 Modüller ve İşlevleri

### 1. **Main Module (main.ts)**

Uygulama başlangıç dosyası. Sunucu ayarları ve middleware'ler burada yapılandırılır.

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS'u etkinleştir (Frontend'den gelen isteklere izin ver)
  app.enableCors();
  
  // Static dosyalar (resimleri) /uploads URL'inden erişilebilir yap
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Validasyon pipe'ını global olarak aktif et
  app.useGlobalPipes(new ValidationPipe());

  // Swagger API dokümantasyonu
  const config = new DocumentBuilder()
    .setTitle('E-Ticaret API')
    .setDescription('NestJS ile geliştirdiğim backend projesi')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  await app.listen(3000);
}
```

**Önemli Noktalar:**
- `enableCors()`: Frontend ile backend farklı portlarda çalışsa bile iletişim kurabilsin
- `useStaticAssets()`: Resimlere `http://localhost:3000/uploads/resim.jpg` şeklinde erişebilirsin
- `ValidationPipe()`: DTO'lardaki `@IsString()`, `@IsNumber()` gibi decorator'ları aktif eder
- Swagger: `http://localhost:3000/api` adresinden API'yi test edebilirsin

---

### 2. **App Module (app.module.ts)**

Tüm modüllerin toplandığı ana modül. Veritabanı bağlantısı burada yapılır.

```typescript
@Module({
  imports: [
    // Resim klasörünü public yap
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',
    }),
    
    // PostgreSQL bağlantısı
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'betulfiliz', 
      password: '1234',
      database: 'eticaret_db',
      entities: [User, Product, Order, Cart], // Tablolar
      synchronize: true, // Otomatik tablo oluştur (Production'da false olmalı!)
    }),

    // Tüm modüller
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CartModule,
    FilesModule,
    DatabaseModule,
  ],
})
export class AppModule {}
```

**Kritik Ayar:**
- `synchronize: true`: TypeORM, entity'lerdeki değişiklikleri otomatik olarak veritabanına yansıtır
  - ⚠️ **Production'da mutlaka `false` yapılmalı!** Yoksa veri kaybı riski var.

---

### 3. **Authentication Module (auth/)**

Kullanıcı kayıt, giriş ve token yönetimi.

#### **auth.service.ts** - İş Mantığı

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // Kullanıcı Kaydı
  async signUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, ...safeUser } = user; // Şifreyi yanıtta gösterme!

    return {
      user: safeUser,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Kullanıcı Girişi
  async signIn(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    // Şifre kontrolü (hash karşılaştırması)
    const isMatch = await bcrypt.compare(pass, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedException('Şifre hatalı.');
    }

    // JWT Token oluştur
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

**Nasıl Çalışır?**

1. **Kayıt (signUp):**
   - Kullanıcı bilgilerini al
   - Şifreyi hash'le ve veritabanına kaydet
   - JWT token oluştur ve döndür

2. **Giriş (signIn):**
   - Email ile kullanıcıyı bul
   - Şifreyi kontrol et (bcrypt.compare ile hash karşılaştırması)
   - Doğruysa JWT token döndür

**JWT Token İçeriği:**
```json
{
  "sub": 5,           // Kullanıcı ID
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1738702800,  // Token oluşturma zamanı
  "exp": 1738789200   // Token geçerlilik süresi
}
```

---

#### **auth.guard.ts** - Token Kontrolü

Her korumalı endpoint'te bu guard devreye girer.

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Giriş yapmanız gerekiyor!');
    }

    try {
      // Token'ı doğrula ve içeriğini oku
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'cokgizlibiranahtar',
      });
      
      // Request nesnesine user bilgisini ekle
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Geçersiz Token!');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**Nasıl Çalışır?**

1. Request header'ından `Authorization: Bearer <token>` bilgisini al
2. Token'ı doğrula
3. Geçerli ise içindeki user bilgisini `request.user` olarak ekle
4. Controller bu bilgiyi kullanabilsin

**Kullanım:**
```typescript
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // Token'dan gelen user bilgisi
}
```

---

#### **roles.guard.ts** - Admin/User Kontrolü

Belirli endpoint'lere sadece admin erişebilsin.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Endpoint'te @Roles('admin') var mı kontrol et
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Rol şartı yoksa herkes geçebilir
    }

    // Kullanıcının rolü istenen rollerden biri mi?
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Kullanım:**
```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Post()
createProduct() {
  // Sadece admin girebilir
}
```

---

### 4. **Users Module (users/)**

Kullanıcı yönetimi.

#### **user.entity.ts** - Veritabanı Tablosu

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string; // Aynı email ile 2. kayıt yapılamaz

  @Column()
  password: string; // Hash'lenmiş şifre

  @Column({ default: 'customer' })
  role: string; // 'admin' veya 'customer'
}
```

**Veritabanında Oluşan Tablo:**
```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'customer'
);
```

---

#### **users.service.ts** - CRUD İşlemleri

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Kullanıcı oluştur
  async create(createUserDto: CreateUserDto) {
    // Aynı email var mı kontrol et
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Bu e-posta adresi zaten kullanımda.');
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  // Email ile kullanıcı bul
  async findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Tüm kullanıcıları listele
  findAll() {
    return this.usersRepository.find();
  }

  // ID ile kullanıcı bul
  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  // Kullanıcı güncelle
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  // Kullanıcı sil
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}
```

---

### 5. **Products Module (products/)**

Ürün yönetimi ve resim yükleme.

#### **product.entity.ts**

```typescript
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

  @Column({ nullable: true })
  imageUrl: string; // Resim URL'i
}
```

---

#### **products.controller.ts** - Resim Yükleme ile CRUD

**Ürün Oluşturma (Admin):**

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Post()
@UseInterceptors(FileInterceptor('image', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new BadRequestException('Sadece resim dosyaları!'), false);
    }
    callback(null, true);
  },
}))
create(@Body() createProductDto: CreateProductDto, @UploadedFile() image?: any) {
  if (image) {
    createProductDto.imageUrl = `http://localhost:3000/uploads/${image.filename}`;
  }
  return this.productsService.create(createProductDto);
}
```

**Nasıl Çalışır?**

1. **FileInterceptor('image')**: Form-data'daki `image` alanını yakala
2. **diskStorage**: Dosyayı `./uploads` klasörüne kaydet
3. **filename**: Benzersiz isim oluştur (örn: `1738702800-123456789.jpg`)
4. **fileFilter**: Sadece resim dosyalarına izin ver
5. **imageUrl**: Resmin tam URL'ini oluştur ve DTO'ya ekle

**Ürün Güncelleme (Admin):**

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Put(':id')
@UseInterceptors(FileInterceptor('image', { /* aynı ayarlar */ }))
updatePut(
  @Param('id') id: string,
  @Body() updateProductDto: UpdateProductDto,
  @UploadedFile() image?: any,
) {
  if (image) {
    updateProductDto.imageUrl = `http://localhost:3000/uploads/${image.filename}`;
  }
  return this.productsService.update(+id, updateProductDto);
}
```

---

### 6. **Cart Module (cart/)**

Alışveriş sepeti sistemi.

#### **cart.entity.ts**

```typescript
@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column()
  productId: number;

  @Column('int')
  quantity: number; // Sepetteki adet

  @CreateDateColumn()
  createdAt: Date;
}
```

**İlişkiler:**
- Her sepet öğesi bir kullanıcıya ait (`ManyToOne` → User)
- Her sepet öğesi bir ürüne ait (`ManyToOne` → Product)
- `eager: true`: İlişkili tabloları otomatik yükle

---

#### **cart.service.ts** - Sepet İşlemleri

**Sepete Ekleme:**

```typescript
async addToCart(userId: number, addToCartDto: AddToCartDto) {
  const { productId, quantity } = addToCartDto;

  // Ürünü bul
  const product = await this.productRepository.findOneBy({ id: productId });
  if (!product) {
    throw new NotFoundException('Ürün bulunamadı');
  }

  // Stok kontrolü
  if (product.stock < quantity) {
    throw new BadRequestException(`Yeterli stok yok. Mevcut stok: ${product.stock}`);
  }

  // Sepette bu ürün var mı kontrol et
  const existingCartItem = await this.cartRepository.findOne({
    where: { userId, productId },
  });

  if (existingCartItem) {
    // Varsa miktarı güncelle
    const newQuantity = existingCartItem.quantity + quantity;
    
    if (product.stock < newQuantity) {
      throw new BadRequestException(`Yeterli stok yok!`);
    }

    existingCartItem.quantity = newQuantity;
    return await this.cartRepository.save(existingCartItem);
  } else {
    // Yoksa yeni oluştur
    const cartItem = this.cartRepository.create({
      userId,
      productId,
      quantity,
    });
    return await this.cartRepository.save(cartItem);
  }
}
```

**Sepeti Görüntüleme:**

```typescript
async getCart(userId: number) {
  const cartItems = await this.cartRepository.find({
    where: { userId },
    relations: ['product'], // Ürün bilgilerini de getir
  });

  // Toplam fiyat hesapla
  const total = cartItems.reduce((sum, item) => {
    return sum + (Number(item.product.price) * item.quantity);
  }, 0);

  return {
    items: cartItems,
    total: total.toFixed(2),
    itemCount: cartItems.length,
  };
}
```

---

### 7. **Orders Module (orders/)**

Sipariş sistemi ve transaction yönetimi.

#### **order.entity.ts**

```typescript
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal')
  totalPrice: number;
}
```

---

#### **orders.service.ts** - Transaction Yönetimi

**Sipariş Oluşturma (Kritik İşlem):**

```typescript
async create(userId: number, createOrderDto: CreateOrderDto) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction(); // Transaction başlat

  try {
    // Ürünü bul ve kilitle
    const product = await queryRunner.manager.findOne(Product, {
      where: { id: createOrderDto.productId },
    });

    if (!product) {
      throw new BadRequestException('Ürün bulunamadı.');
    }

    // Stok kontrolü
    if (product.stock < createOrderDto.quantity) {
      throw new BadRequestException('Yetersiz stok!');
    }

    // Sipariş oluştur
    const total = product.price * createOrderDto.quantity;
    const order = queryRunner.manager.create(Order, {
      quantity: createOrderDto.quantity,
      totalPrice: total,
      product: product,
      user: { id: userId } as User,
    });

    await queryRunner.manager.save(order);

    // Stoktan düş
    product.stock -= createOrderDto.quantity;
    await queryRunner.manager.save(product);

    // Transaction'ı onayla (değişiklikleri kalıcı yap)
    await queryRunner.commitTransaction();
    
    return order;

  } catch (err) {
    // Hata olursa her şeyi geri al
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

**Transaction Neden Önemli?**

Diyelim ki sipariş oluştu ama stok güncellenmeden hata oldu:
- ❌ **Transaction olmasaydı**: Sipariş kaydedilir, stok düşmez → Tutarsızlık!
- ✅ **Transaction ile**: Her şey geri alınır, hiçbir değişiklik olmaz

---

### 8. **Files Module (files/)**

Genel dosya yükleme endpoint'i.

```typescript
@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Sadece resim!'), false);
      }
      callback(null, true);
    },
  }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi!');
    }
    return {
      imageUrl: `http://localhost:3000/uploads/${file.filename}`
    };
  }
}
```

**Kullanım:**
```bash
POST http://localhost:3000/files/upload
Content-Type: multipart/form-data

{
  "file": <dosya>
}
```

**Yanıt:**
```json
{
  "imageUrl": "http://localhost:3000/uploads/1738702800-123456789.jpg"
}
```

---

## 🗄 Veritabanı Yapısı

### ER Diyagramı (İlişkiler)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    USER     │         │     CART     │         │   PRODUCT   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │←────────│ id (PK)      │────────→│ id (PK)     │
│ email       │  1    M │ userId (FK)  │ M    1  │ name        │
│ password    │         │ productId(FK)│         │ description │
│ role        │         │ quantity     │         │ price       │
└─────────────┘         │ createdAt    │         │ stock       │
       │                └──────────────┘         │ imageUrl    │
       │ 1                                       └─────────────┘
       │                                                │
       │ M                                            M │
       ↓                                                ↓
┌─────────────┐                                 ┌─────────────┐
│    ORDER    │                                 │   (diğer)   │
├─────────────┤                                 └─────────────┘
│ id (PK)     │
│ userId (FK) │
│ productId(FK)│
│ quantity    │
│ totalPrice  │
└─────────────┘
```

**İlişki Açıklamaları:**
- **User ↔ Cart**: Bir kullanıcının birden fazla sepet öğesi olabilir (1-M)
- **Product ↔ Cart**: Bir ürün birden fazla sepette olabilir (1-M)
- **User ↔ Order**: Bir kullanıcının birden fazla siparişi olabilir (1-M)
- **Product ↔ Order**: Bir ürün birden fazla siparişte olabilir (1-M)

---

### Tablo Detayları

#### 1. USER Tablosu
```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'customer'
);

-- Örnek Veri
INSERT INTO "user" (email, password, role) VALUES
('admin@test.com', '$2b$10$hashedpassword', 'admin'),
('user@test.com', '$2b$10$hashedpassword', 'customer');
```

#### 2. PRODUCT Tablosu
```sql
CREATE TABLE "product" (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  stock INTEGER NOT NULL,
  "imageUrl" VARCHAR
);

-- Örnek Veri
INSERT INTO "product" (name, description, price, stock, "imageUrl") VALUES
('Laptop', 'High performance laptop', 15000.00, 10, 'http://localhost:3000/uploads/laptop.jpg'),
('Mouse', 'Wireless mouse', 250.00, 50, 'http://localhost:3000/uploads/mouse.jpg');
```

#### 3. CART Tablosu
```sql
CREATE TABLE "cart" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "user"(id),
  "productId" INTEGER REFERENCES "product"(id),
  quantity INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Örnek Veri
INSERT INTO "cart" ("userId", "productId", quantity) VALUES
(2, 1, 1), -- user@test.com, Laptop, 1 adet
(2, 2, 2); -- user@test.com, Mouse, 2 adet
```

#### 4. ORDER Tablosu
```sql
CREATE TABLE "order" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "user"(id),
  "productId" INTEGER REFERENCES "product"(id),
  quantity INTEGER NOT NULL,
  "totalPrice" DECIMAL NOT NULL
);

-- Örnek Veri
INSERT INTO "order" ("userId", "productId", quantity, "totalPrice") VALUES
(2, 1, 1, 15000.00); -- user@test.com, Laptop, 1 adet, 15000 TL
```

---

## 🔐 Authentication & Authorization

### JWT Token Akışı

```
1. KAYIT/GİRİŞ
   ┌─────────┐                    ┌──────────┐
   │ Client  │  POST /auth/login  │  Backend │
   │         │───────────────────→│          │
   │         │ {email, password}  │          │
   │         │                    │ Şifre    │
   │         │                    │ Kontrol  │
   │         │                    │          │
   │         │←───────────────────│          │
   │         │  {access_token}    │          │
   └─────────┘                    └──────────┘

2. KORUNMALI ENDPOINT ERİŞİMİ
   ┌─────────┐                    ┌──────────┐
   │ Client  │  GET /products     │  Backend │
   │         │───────────────────→│          │
   │         │  Authorization:    │ Token    │
   │         │  Bearer <token>    │ Doğrula  │
   │         │                    │          │
   │         │←───────────────────│          │
   │         │  [ürün listesi]    │          │
   └─────────┘                    └──────────┘
```

### Role-Based Access Control (RBAC)

```typescript
// Admin'e özel endpoint
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Post()
createProduct() {
  // Sadece admin erişebilir
}

// Herkes erişebilir
@Get()
findAll() {
  // Token gerekmez
}

// Giriş yapanlar erişebilir
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@Request() req) {
  // Admin veya customer olabilir
}
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Açıklama | Auth | Body |
|--------|----------|----------|------|------|
| POST | `/auth/register` | Kullanıcı kaydı | ❌ | `{email, password, role?}` |
| POST | `/auth/login` | Kullanıcı girişi | ❌ | `{email, password}` |

**Örnek:**
```bash
# Kayıt
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456",
  "role": "customer"
}

# Yanıt
{
  "user": {
    "id": 5,
    "email": "test@example.com",
    "role": "customer"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Giriş
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}

# Yanıt
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Products

| Method | Endpoint | Açıklama | Auth | Body |
|--------|----------|----------|------|------|
| GET | `/products` | Tüm ürünleri listele | ❌ | - |
| GET | `/products/:id` | Tek ürün getir | ❌ | - |
| POST | `/products` | Yeni ürün ekle | 🔒 Admin | Form-data |
| PUT | `/products/:id` | Ürün güncelle | 🔒 Admin | Form-data |
| PATCH | `/products/:id` | Ürün güncelle | 🔒 Admin | Form-data |
| DELETE | `/products/:id` | Ürün sil | 🔒 Admin | - |

**Örnek:**
```bash
# Tüm ürünleri listele
GET http://localhost:3000/products

# Yanıt
[
  {
    "id": 1,
    "name": "Laptop",
    "description": "High performance",
    "price": 15000,
    "stock": 10,
    "imageUrl": "http://localhost:3000/uploads/laptop.jpg"
  }
]

# Ürün ekle (Admin)
POST http://localhost:3000/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Laptop
description: High performance laptop
price: 15000
stock: 10
image: <dosya>

# Ürün güncelle (Admin)
PUT http://localhost:3000/products/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Laptop Pro
price: 18000
image: <yeni dosya> (opsiyonel)
```

---

### Cart

| Method | Endpoint | Açıklama | Auth | Body |
|--------|----------|----------|------|------|
| GET | `/cart` | Sepeti görüntüle | 🔒 User | - |
| POST | `/cart` | Sepete ekle | 🔒 User | `{productId, quantity}` |
| PATCH | `/cart/:id` | Sepet öğesi güncelle | 🔒 User | `{quantity}` |
| DELETE | `/cart/:id` | Sepetten çıkar | 🔒 User | - |
| DELETE | `/cart/clear` | Sepeti temizle | 🔒 User | - |

**Örnek:**
```bash
# Sepete ekle
POST http://localhost:3000/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}

# Sepeti görüntüle
GET http://localhost:3000/cart
Authorization: Bearer <token>

# Yanıt
{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Laptop",
        "price": 15000
      }
    }
  ],
  "total": "30000.00",
  "itemCount": 1
}
```

---

### Orders

| Method | Endpoint | Açıklama | Auth | Body |
|--------|----------|----------|------|------|
| POST | `/orders` | Sipariş oluştur | 🔒 User | `{productId, quantity}` |
| GET | `/orders` | Siparişleri listele | 🔒 User | - |

**Örnek:**
```bash
# Sipariş oluştur
POST http://localhost:3000/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 1
}

# Yanıt
{
  "id": 1,
  "quantity": 1,
  "totalPrice": 15000,
  "user": { "id": 2 },
  "product": { "id": 1, "name": "Laptop" }
}
```

---

### Files

| Method | Endpoint | Açıklama | Auth | Body |
|--------|----------|----------|------|------|
| POST | `/files/upload` | Dosya yükle | ❌ | Form-data (file) |

**Örnek:**
```bash
POST http://localhost:3000/files/upload
Content-Type: multipart/form-data

file: <dosya>

# Yanıt
{
  "imageUrl": "http://localhost:3000/uploads/1738702800-123456789.jpg"
}
```

---

## 💡 Kod Örnekleri

### 1. Nasıl Guard Eklenir?

```typescript
// Sadece giriş yapmış kullanıcılar
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // Token'dan gelen user bilgisi
}

// Sadece admin
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
removeProduct(@Param('id') id: string) {
  return this.productsService.remove(+id);
}
```

---

### 2. Nasıl Dosya Yüklenir?

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('image', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueName = Date.now() + '-' + Math.random() * 1e9;
      const ext = extname(file.originalname);
      callback(null, `${uniqueName}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new Error('Sadece resim!'), false);
    }
    callback(null, true);
  },
}))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return {
    url: `http://localhost:3000/uploads/${file.filename}`
  };
}
```

---

### 3. Nasıl Transaction Kullanılır?

```typescript
async createOrder(userId: number, productId: number, quantity: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // İşlemler
    const product = await queryRunner.manager.findOne(Product, { where: { id: productId } });
    product.stock -= quantity;
    await queryRunner.manager.save(product);
    
    const order = queryRunner.manager.create(Order, { /* ... */ });
    await queryRunner.manager.save(order);
    
    // Başarılı
    await queryRunner.commitTransaction();
    return order;
    
  } catch (err) {
    // Hata - geri al
    await queryRunner.rollbackTransaction();
    throw err;
    
  } finally {
    await queryRunner.release();
  }
}
```

---

### 4. Nasıl İlişkili Veri Getirilir?

```typescript
// eager: true ile otomatik yükleme
@Entity()
export class Cart {
  @ManyToOne(() => Product, { eager: true })
  product: Product; // Otomatik yüklenir
}

// Veya manuel olarak
async getCart(userId: number) {
  return await this.cartRepository.find({
    where: { userId },
    relations: ['product', 'user'], // İlişkili tabloları yükle
  });
}
```

---

## 🚀 Proje Nasıl Çalıştırılır?

### 1. Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### 2. Kurulum
```bash
# Bağımlılıkları yükle
npm install

# PostgreSQL'de veritabanı oluştur
createdb eticaret_db

# .env dosyası oluştur (opsiyonel)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=betulfiliz
DB_PASSWORD=1234
DB_NAME=eticaret_db
JWT_SECRET=cokgizlibiranahtar
```

### 3. Çalıştırma
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 4. Test
```bash
# Swagger UI
http://localhost:3000/api

# Postman/cURL ile test
curl http://localhost:3000/products
```

---

## 📝 Önemli Notlar

### DTO (Data Transfer Object) Nedir?

DTO'lar, client'tan gelen verileri kontrol etmek için kullanılır.

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
```

**Faydaları:**
- Veri validasyonu (tip kontrolü, zorunlu alan vb.)
- Güvenlik (istenmeyen alanları engelleme)
- Tip güvenliği (TypeScript ile)

---

### Entity vs DTO

| Entity | DTO |
|--------|-----|
| Veritabanı tablosunu temsil eder | API request/response verisini temsil eder |
| `@Entity()`, `@Column()` decorator'ları | `@IsString()`, `@IsNumber()` decorator'ları |
| TypeORM ile çalışır | class-validator ile çalışır |

**Örnek:**
```typescript
// Entity (Veritabanı)
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

// DTO (API)
export class CreateProductDto {
  @IsString()
  name: string;
  
  // id yok çünkü otomatik oluşuyor
}
```

---

### Decorators Nedir?

Decorator'lar, class'lara, metodlara veya property'lere ek özellikler ekleyen TypeScript fonksiyonlarıdır.

```typescript
@Controller('products')  // Controller olduğunu belirt
export class ProductsController {
  
  @Get()  // GET endpoint'i
  findAll() {
    return [];
  }
  
  @Post()  // POST endpoint'i
  @UseGuards(AuthGuard)  // Guard ekle
  create(@Body() dto: CreateProductDto) {  // Body'den DTO al
    return dto;
  }
}
```

**Yaygın Decorator'lar:**
- `@Controller()`: Class'ı controller yapar
- `@Injectable()`: Class'ı dependency injection için kullanılabilir yapar
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`: HTTP metodları
- `@UseGuards()`: Guard ekler
- `@Body()`: Request body'sini alır
- `@Param()`: URL parametresini alır
- `@Query()`: Query string parametresini alır

---

## 🎓 Öğrenme Kaynakları

- [NestJS Resmi Dökümanı](https://docs.nestjs.com)
- [TypeORM Dökümanı](https://typeorm.io)
- [JWT Nedir?](https://jwt.io/introduction)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Stack Overflow
- NestJS Discord

---

## ✅ Sonuç

Bu proje, modern bir e-ticaret backend'inin temel özelliklerini içerir:

✅ **Güvenli kimlik doğrulama** (JWT)  
✅ **Rol tabanlı yetkilendirme** (Admin/User)  
✅ **Resim yükleme** (Multer)  
✅ **İlişkisel veritabanı** (PostgreSQL + TypeORM)  
✅ **Transaction yönetimi** (Sipariş sistemi)  
✅ **API dokümantasyonu** (Swagger)  

Bu dökümanı referans alarak projeyi geliştirebilir ve özelleştirebilirsiniz! 🚀
