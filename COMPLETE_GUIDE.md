# 🛒 E-Ticaret Backend - Kapsamlı Eğitici Rehber

**Seviye:** Başlangıç → Orta | **Okuma Süresi:** ~20 dakika

---

## 📋 İçindekiler
1. [Proje Özeti](#proje-özeti)
2. [Kurulum & Başlangıç](#kurulum--başlangıç)
3. [Proje Mimarisi](#proje-mimarisi)
4. [Temel Kavramlar](#temel-kavramlar)
5. [Modüller Detaylı](#modüller-detaylı)
6. [Veritabanı Şeması](#veritabanı-şeması)
7. [Authentication (JWT + Refresh Token)](#authentication-jwt--refresh-token)
8. [API Endpoints](#api-endpoints)
9. [Örnek İstekler](#örnek-istekler)
10. [Troubleshooting](#troubleshooting)

---

## Proje Özeti

**E-Ticaret Backend**, NestJS ile yazılmış full-featured bir API. Kullanıcılar ürün satın alabilir, sepet yönetebilir, siparişleri onaylayabilir.

**Ana Özellikler:**
- ✅ Kullanıcı Kayıt & Giriş (JWT + Refresh Token)
- ✅ Ürün Yönetimi (CRUD)
- ✅ Sepet Sistemi
- ✅ Sipariş Yönetimi (Transaction ile)
- ✅ Admin Paneli (Sipariş Onayı)
- ✅ File Upload (Resim)

**Tech Stack:**
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL + TypeORM
- **Authentication:** JWT + Refresh Token
- **Security:** Bcrypt (şifre hashleme)

---

## Kurulum & Başlangıç

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veritabanı Konfigürasyonu
[.env](.env) dosyasını düzenle:
```env
# Database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=betulfiliz
DB_PASSWORD=1234
DB_NAME=eticaret_db

# JWT Secrets (Production'da güçlü değerler kullan!)
JWT_SECRET=cokgizlibiranahtar
JWT_REFRESH_SECRET=gizlirefreshkey

PORT=3000
```

### 3. Uygulamayı Başlat
```bash
# Development modunda (hot reload'lu)
npm run start:dev

# Production modunda
npm run start:prod

# Build et
npm run build
```

**Başarılı çıktı:**
```
[Nest] ... Nest application successfully started
```

---

## Proje Mimarisi

### Folder Yapısı
```
src/
├── main.ts                    # Entry point
├── app.module.ts              # Ana modül (veritabanı, tüm modüller)
├── app.controller.ts          # Health check endpoint
│
├── auth/                      # 🔐 Authentication
│   ├── auth.service.ts        # Token generation & validation
│   ├── auth.controller.ts     # Login/Register endpoints
│   ├── auth.guard.ts          # JWT doğrulaması
│   ├── auth.module.ts         # Auth module config
│   ├── dto/
│   │   └── refresh-token.dto.ts
│   └── entities/
│       └── refresh-token.entity.ts
│
├── users/                     # 👥 Kullanıcı Yönetimi
│   ├── users.service.ts       # CRUD işlemleri
│   ├── users.controller.ts    # Endpoints
│   ├── entities/
│   │   └── user.entity.ts     # Database tablosu
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
├── products/                  # 📦 Ürün Yönetimi
│   ├── products.service.ts    # CRUD + stok
│   ├── products.controller.ts
│   ├── entities/
│   │   └── product.entity.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
│
├── cart/                      # 🛒 Sepet
│   ├── cart.service.ts        # Sepete ürün ekleme/çıkarma
│   ├── cart.controller.ts
│   ├── entities/
│   │   └── cart.entity.ts
│   └── dto/
│       ├── add-to-cart.dto.ts
│       └── update-cart.dto.ts
│
├── orders/                    # 📋 Siparişler
│   ├── orders.service.ts      # Transaction yönetimi
│   ├── orders.controller.ts   # User & Admin endpoints
│   ├── entities/
│   │   └── order.entity.ts
│   └── dto/
│       └── create-order.dto.ts
│
├── files/                     # 📤 Dosya Upload
│   ├── files.service.ts
│   ├── files.controller.ts
│   └── entities/
│       └── file.entity.ts
│
├── database/                  # 🌱 Seed & Init
│   ├── database.module.ts
│   └── database.seeder.ts     # Test verileri
│
└── uploads/                   # 📸 Yüklenen resimler

package.json                   # Dependencies
.env                          # Config (gitignore'da!)
tsconfig.json                 # TypeScript ayarları
```

---

## Temel Kavramlar

### 🔹 Entity (Veritabanı Tablosu)
Entity, veritabanında bir tabloyu temsil eder. TypeORM kullanarak tanımlanır.

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;
}
```

**Sonuç:** `products` adında tablo oluşur (`id`, `name`, `price` sütunları)

### 🔹 DTO (Data Transfer Object)
Frontend'den gelen veriyi doğrulamak için kullanılır.

```typescript
export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}
```

**Ne İşe Yarar:** `POST /products` ile `{name: "iPhone", price: 1000}` gönderirsek, DTO otomatik olarak doğrular.

### 🔹 Service (İş Mantığı)
Veritabanı işlemlerini ve business logic'i barındırır.

```typescript
@Injectable()
export class ProductsService {
  async create(dto: CreateProductDto) {
    // Veritabanına ürün ekle
    return this.productRepository.save(dto);
  }
}
```

### 🔹 Controller (Endpoints)
HTTP istekleri karşılamak ve Service'i çağırmak.

```typescript
@Controller('products')
export class ProductsController {
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

**Sonuç:** `POST /products` endpoint'i oluşur

### 🔹 Guard (Koruma)
Endpoint'e giriş kontrolü yapar. JWT, roller vb. kontrol eder.

```typescript
@UseGuards(AuthGuard)  // Bu endpoint'e sadece token olanlar girebilir
@Get('me')
getProfile(@Request() req) { ... }
```

### 🔹 Module (Bileşenleri Birleştirme)
Entity, Service, Controller ve diğer modülleri bir arada tutar.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

---

## Modüller Detaylı

### 1. 🔐 Auth Module (Authentication)

**Dosyalar:** `auth/`

**Işlevler:**
- Kullanıcı kayıt/giriş
- JWT Access Token oluştur (15 dakika)
- Refresh Token oluştur (30 gün)
- Token yenilemek

**Endpoints:**
- `POST /auth/register` - Kayıt ol
- `POST /auth/login` - Giriş yap
- `POST /auth/refresh` - Token yenile ⭐ (YENİ)
- `GET /auth/me` - Profil (JWT gerekli)

**Kritik Dosyalar:**
- `auth.guard.ts` - Request'in JWT'sini kontrol eder
- `auth.service.ts` - Token generation
- `refresh-token.entity.ts` - Refresh token'lar veritabanında saklanır

---

### 2. 👥 Users Module

**Dosyalar:** `users/`

**CRUD İşlemleri:**
```
GET    /users           - Tüm kullanıcılar
GET    /users/:id       - Bir kullanıcı
POST   /users           - Yeni kullanıcı (auth aracılığıyla)
PATCH  /users/:id       - Güncelle
DELETE /users/:id       - Sil
```

**Şifre Güvenliği:**
- Şifreler **bcrypt** ile hashlenir
- Veritabanında plain-text şifre asla saklanmaz
- Login'de giriş şifresi veritabanındaki hash ile karşılaştırılır

---

### 3. 📦 Products Module

**Dosyalar:** `products/`

**CRUD İşlemleri:**
```
GET    /products        - Tüm ürünler (public)
GET    /products/:id    - Bir ürün
POST   /products        - Yeni ürün (admin)
PATCH  /products/:id    - Güncelle (admin)
DELETE /products/:id    - Sil (admin)
```

**Veriler:**
```typescript
{
  id: 1,
  name: "Apple iPhone 15",
  description: "Akıllı telefon...",
  price: 57999,
  stock: 35,
  imageUrl: "https://..."
}
```

**Seed Verileri:**
- App başlarken otomatik 10 ürün eklenir (varsa eklenmez)
- Kullanıcı isterse manuel ürün ekleyebilir

---

### 4. 🛒 Cart Module

**Dosyalar:** `cart/`

**Işlevler:**
```
POST   /cart/add        - Sepete ürün ekle
GET    /cart            - Sepeti görüntüle
PATCH  /cart/:id        - Miktarı güncelle
DELETE /cart/:id        - Ürünü sil
DELETE /cart            - Sepeti boşalt
POST   /cart/checkout   - Sipariş oluştur (satın al)
```

**Örnek Sepet Verisi:**
```json
[
  {
    "id": 1,
    "product": { "id": 5, "name": "iPhone", "price": 57999 },
    "quantity": 2,
    "userId": 10,
    "createdAt": "2026-02-14T..."
  }
]
```

**Checkout Işlemi:**
- Sepet içindeki ürünler siparişe dönüştürülür
- Her ürün için ayrı sipariş oluşturulur
- Sepet boşaltılır

---

### 5. 📋 Orders Module

**Dosyalar:** `orders/`

**Işlevler:**

**Normal Kullanıcı Endpoints:**
```
POST   /orders          - Sipariş oluştur (ürünü satın al)
GET    /orders          - Kendi siparişlerimi gör
```

**Admin Endpoints:**
```
GET    /admin/orders           - Tüm siparişleri gör
GET    /admin/orders?status=   - Status'a göre filtre
PATCH  /admin/orders/:id/approve - Siparişi onayla
PUT    /admin/orders/:id/approve
PATCH  /admin/orders/:id/reject  - Siparişi reddet
PUT    /admin/orders/:id/reject
```

**Sipariş Status'ları:**
- `PENDING` - Beklemede (yeni)
- `APPROVED` - Onaylandı ✓
- `REJECTED` - Reddedildi ✗

**Transaction (Veritabanı Işlemi):**
```typescript
// Sipariş oluşturulurken:
1. Ürünü bul ve kilitle (başkası değiştiremesin)
2. Stok kontrolü yap (yeterli mi?)
3. Sipariş oluştur
4. Stoğu azalt
5. Her şey tamam ise kaydet (COMMIT)
6. Hata olursa geri al (ROLLBACK)
```

⚠️ **Neden Transaction?** Para işlemi gibi kritik işlemlerde, yarı yolda hata oluşursa tutarsızlık yaşanır. Transaction bunun önüne geçer.

---

### 6. 📤 Files Module

**Dosyalar:** `files/`

**Işlevi:**
```
POST   /files/upload    - Resim yükle
```

**Ne Yapılır:**
1. Resim `uploads/` klasörüne kaydedilir
2. Resim URL'si veritabanına kaydedilir
3. Frontend `public/uploads/` üzerinden erişebilir

---

### 7. 🌱 Database Module

**Dosyalar:** `database/`

**İşlevi:**
- App başladığında test verileri oluşturur
- 10 ürün, kategori bilgileri tablosuna eklenir
- Aynı ürünler tekrar eklenmez

---

## Veritabanı Şeması

### Tablolar Arası İlişkiler

```
User (1) -------- (N) RefreshToken
  |
  ├---- (N) Order
  ├---- (N) Cart
  
Product (1) ---- (N) Order
  |
  └---- (N) Cart

Order (N) -------- (1) User
  |
  └---- (1) Product
```

### Tablo Yapıları

#### **users** Tablosu
```
id (PK)        | integer
email          | string (unique)
password       | string (hash)
fullName       | string
phone          | string
gender         | string
role           | string (default: 'customer')
refreshTokens  | relation (User -> RefreshToken)
```

#### **products** Tablosu
```
id (PK)        | integer
name           | string
description    | string
price          | decimal
stock          | integer
imageUrl       | string
```

#### **orders** Tablosu
```
id (PK)        | integer
user (FK)      | references users(id)
product (FK)   | references products(id)
quantity       | integer
totalPrice     | decimal
status         | string (PENDING/APPROVED/REJECTED)
createdAt      | timestamp
updatedAt      | timestamp
```

#### **cart** Tablosu
```
id (PK)        | integer
user (FK)      | references users(id)
product (FK)   | references products(id)
quantity       | integer
createdAt      | timestamp
```

#### **refresh_tokens** Tablosu ⭐ (YENİ)
```
id (PK)        | integer
token          | string
userId (FK)    | references users(id)
expiresAt      | timestamp
isValid        | boolean
deletedAt      | timestamp (soft delete)
createdAt      | timestamp
```

---

## Authentication (JWT + Refresh Token)

### JWT Token Akışı

```
1. KAYIT/GİRİŞ
   ├─ POST /auth/register veya /auth/login
   ├─ Şifre kontrol
   └─ Return: access_token (15 dakika) + refresh_token (30 gün)

2. API İSTEĞİ
   ├─ Header: Authorization: Bearer <access_token>
   ├─ AuthGuard token'ı doğrula
   └─ ✓ İşleme devam

3. ACCESS TOKEN SÜRESI DOLARSA
   ├─ POST /auth/refresh
   ├─ Body: { refresh_token: "..." }
   └─ Return: Yeni access_token

4. LOGOUT (İsteğe Bağlı)
   ├─ Refresh token'ın isValid = false yap
   ├─ Ya da tüm refresh token'ları sil
   └─ Token artık yenilenemez
```

### Token İçeriği (JWT Payload)

**Access Token (JWT):**
```json
{
  "sub": 5,              // User ID
  "email": "user@example.com",
  "role": "customer",
  "iat": 1707900000,    // İssued at
  "exp": 1707900900    // Expires in (15 min)
}
```

**Refresh Token (JWT):**
```json
{
  "sub": 5,
  "type": "refresh",
  "iat": 1707900000,
  "exp": 1709800000    // Expires in (30 days)
}
```

### Güvenlik Notları

⚠️ **Production'da Yapılacaklar:**
1. JWT_SECRET ve JWT_REFRESH_SECRET değişkenleri güçlü ve rastgele olmalı
2. HTTPS zorunludur (HTTP'de token çalınabilir)
3. HttpOnly cookies'de token saklanabilir (XSS koruması)
4. Token yenileme request'inde rate limiting kulllanılabilir

---

## API Endpoints

### Authentication

| Metot | Endpoint | Açıklama | Auth Gerekli? |
|-------|----------|----------|--------------|
| POST | `/auth/register` | Kayıt ol | ❌ |
| POST | `/auth/login` | Giriş yap | ❌ |
| POST | `/auth/refresh` | Token yenile | ❌ |
| GET | `/auth/me` | Profil | ✅ |

### Users

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| GET | `/users` | Tüm kullanıcılar | ✅ (Admin) |
| GET | `/users/:id` | Bir kullanıcı | ✅ (Admin) |
| PATCH | `/users/:id` | Güncelle | ✅ (Kendi) |
| DELETE | `/users/:id` | Sil | ✅ (Admin) |

### Products

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| GET | `/products` | Tüm ürünler | ❌ |
| GET | `/products/:id` | Bir ürün | ❌ |
| POST | `/products` | Yeni ürün | ✅ (Admin) |
| PATCH | `/products/:id` | Güncelle | ✅ (Admin) |
| DELETE | `/products/:id` | Sil | ✅ (Admin) |

### Cart

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/cart/add` | Sepete ekle | ✅ |
| GET | `/cart` | Sepeti gör | ✅ |
| PATCH | `/cart/:id` | Miktarı güncelle | ✅ |
| DELETE | `/cart/:id` | Ürünü sil | ✅ |
| DELETE | `/cart` | Sepeti boşalt | ✅ |
| POST | `/cart/checkout` | Siparişi oluştur | ✅ |

### Orders

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/orders` | Sipariş oluştur | ✅ |
| GET | `/orders` | Kendi siparişlerim | ✅ |
| GET | `/admin/orders` | Tüm siparişler | ✅ (Admin) |
| PATCH | `/admin/orders/:id/approve` | Onayla | ✅ (Admin) |
| PATCH | `/admin/orders/:id/reject` | Reddet | ✅ (Admin) |

### Files

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/files/upload` | Resim yükle | ✅ |

---

## Örnek İstekler

### 1. Kayıt Olmak

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{ 
    "email": "user@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "phone": "5551234567",
    "gender": "male"
  }'
```

**Yanıt:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "customer"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Giriş Yapmak

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Token Yenilemek (Access Token Süresi Dolarsa)

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 4. Korumalı Endpoint'e İstek

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Ürünleri Listele (Public)

```bash
curl http://localhost:3000/products
```

### 6. Sepete Ürün Ekle

```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

### 7. Siparişi Onaylama (Admin)

```bash
curl -X PATCH http://localhost:3000/admin/orders/1/approve \
  -H "Authorization: Bearer <admin_token>"
```

---

## Troubleshooting

### ❌ "Giriş yapmanız gerekiyor!"

**Sebep:** Header'da token yok

**Çözüm:**
```bash
# DOĞRUGitHub
-H "Authorization: Bearer <token>"

# YANLIŞ
-H "Bearer <token>"
```

### ❌ "Geçersiz Token!"

**Sebep:** Token'ın süresi dolmuş veya invalid

**Çözüm:**
```
1. Yeni token al: POST /auth/login
2. Ya da: POST /auth/refresh ile yenile
```

### ❌ "Yetersiz stok!"

**Sebep:** Ürünün stok sayısı istenen miktardan az

**Çözüm:** Daha az miktar sipariş et ya da farklı ürün seç

### ❌ "Port zaten kullanımda (EADDRINUSE)"

**Sebep:** 3000 portu başka bir uygulama kullanıyor

**Çözüm:**
```bash
# Prosesi öldür
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ya da farklı port kullan
PORT=3001 npm start
```

### ❌ "Veritabanı bağlantısı başarısız"

**Sebep:** PostgreSQL çalışmıyor ya da .env yanlış

**Çözüm:**
1. PostgreSQL servisi çalışıyor mu kontrol et: `brew services list`
2. .env dosyasındaki credentials doğru mu check et
3. Veritabanı var mı: `createdb eticaret_db`

### ❌ "Yeni bağımlılık kurdum ama çalışmıyor"

**Çözüm:**
```bash
# Cache temizle
rm -rf node_modules package-lock.json

# Yeni kur
npm install

# Tekrar başlat
npm run build
npm start
```

---

## 🎓 Öğrenme Rehberi

### Günlük Olarak Yapılacaklar

1. **Sabah:** Yeni bir ürün POST endpoint'ine istek gönder
2. **Öğle:** Sepet ekleme işlemini debug et
3. **Akşam:** Admin siparişi onaylama işlemini test et

### Derinlemesine Öğrenme

- [ ] TypeORM relations (OneToMany, ManyToOne) anla
- [ ] JWT token yapısını decode et (jwt.io)
- [ ] Transaction kavramını tamamen anla (Orders modülü)
- [ ] Role-based access control (RBAC) ekle
- [ ] Rate limiting implement et
- [ ] Logging ekle (Winston)

### Sonraki Adımlar

1. **Email Notifications:** Order confirmation email gönder
2. **Payment Integration:** Stripe/Iyzico entegrasyonu
3. **Search:** Ürün arama ve filtreleme
4. **Reviews:** Ürün yorumları
5. **Wishlist:** Favoriler listesi
6. **Analytics:** Satış raporları

---

## 📚 Faydalı Linkler

- **NestJS Docs:** https://docs.nestjs.com
- **TypeORM Docs:** https://typeorm.io
- **JWT Debugger:** https://jwt.io
- **PostgreSQL Docs:** https://www.postgresql.org/docs

---

**Son Güncelleme:** 14 Şubat 2026 | **Version:** 1.0
