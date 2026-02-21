# 📐 Sistem Mimarisi & Veri Akışı

Bu sayfa, projenin nasıl çalıştığını **görsel olarak** gösterir.

---

## 🔄 Genel Sistem Akışı

```
┌─────────────┐
│   FRONTEND  │  (React, Vue vb.)
└──────┬──────┘
       │ HTTP Request (Authorization: Bearer <token>)
       │
       ↓
┌──────────────────────────────┐
│   API GATEWAY (Controller)   │  Endpoint: POST /orders
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│    AUTH GUARD               │  ← Token doğrulama
│  (AuthGuard)                 │     JWT verify
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│    SERVICE (Business Logic) │  OrdersService.create()
│  - Validation               │
│  - DB Operations            │
│  - Transactions             │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│   DATABASE (TypeORM)        │  Product, User, Order
│   PostgreSQL                 │  repositories
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│   RESPONSE to Frontend      │  { success: true, data: {...} }
└──────────────────────────────┘
```

---

## 🔐 Authentication Akışı (Detaylı)

### 1️⃣ Kayıt & Giriş

```
User Input (email, password)
        ↓
┌──────────────────────────┐
│  /auth/register         │  (Yeni kullanıcı)
│  /auth/login            │  (Mevcut kullanıcı)
└──────┬───────────────────┘
       ↓
[Password Validation]
  - findOne(email) → Kullanıcı var mı?
  - bcrypt.compare(input, hash) → Şifre doğru mu?
       ↓
  ✅ Doğru → Token oluştur
  ❌ Yanlış → Hata döndür
       ↓
┌──────────────────────────┐
│  Generate Access Token  │  expiresIn: 15m
│  Generate Refresh Token │  expiresIn: 30d
│  Save Refresh to DB     │  (RefreshToken table)
└──────┬───────────────────┘
       ↓
Return: {
  access_token,
  refresh_token,
  user
}
```

### 2️⃣ Token Kullanım

```
Frontend stores: {
  access_token: "eyJhbGciOi..."
  refresh_token: "eyJhbGciOi..."
}

Every API Request:
┌──────────────────────────┐
│ POST /orders             │
│ Headers: {               │
│   Authorization:         │
│   Bearer <access_token>  │
│ }                        │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   AuthGuard (auth.guard) │
│                          │
│   extractTokenFromHeader │
│   jwt.verifyAsync()      │
└──────┬───────────────────┘
       ↓
  ✅ Token Valid → Continue
  ❌ Token Invalid/Expired → 401 Unauthorized
  
  req.user = decoded payload {
    sub: 5,
    email: "user@example.com"
  }
       ↓
[Controller] receives request
[Service] gets userId from req.user.sub
[DB Operations] execute
```

### 3️⃣ Token Yenilenme

```
Access Token Süresi Dolunca:

Frontend:
  POST /auth/refresh
  {
    refresh_token: "eyJhbGciOi..."
  }
        ↓
┌──────────────────────────┐
│   AuthService.refresh()  │
│                          │
│   1. Verify refresh token│
│   2. Check if valid in DB│
│   3. Check expiration    │
└──────┬───────────────────┘
       ↓
  ✅ Valid → Generate new access_token
  ❌ Invalid → 401 Unauthorized
       ↓
Return: {
  access_token: "eyJhbGciOi..." (new, 15m)
}
```

---

## 🛒 Sepet & Sipariş Akışı

```
User: "sepete ürün ekle"
        ↓
┌──────────────────────────┐
│  POST /cart/add          │
│  { productId, quantity } │
└──────┬───────────────────┘
       ↓
[AuthGuard] ✅
       ↓
┌──────────────────────────┐
│  CartService.addToCart() │
│                          │
│  1. Find Product         │
│  2. Create Cart entry    │
│  3. Save to DB           │
└──────┬───────────────────┘
       ↓
[Database]
  INSERT INTO cart
  (userId, productId, quantity)
  VALUES (5, 1, 2)
       ↓
Response: { id, product, quantity }
```

### Checkout (Satın Alma)

```
User: "checkout" (sepeti satın al)
        ↓
┌──────────────────────────────┐
│  POST /cart/checkout         │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│  CartService.checkout()                  │
│  Sepet içindeki her ürün için:          │
│  1. Order oluştur (create-order mantığı)│
│  2. Stokları azalt                      │
│  3. Sepet temizle                       │
└──────┬───────────────────────────────────┘
       ↓
[Loop] Her product için:

  ┌─ Product 1 (qty: 2) ──┐
  │  → Order#1 oluştur    │
  │  → Stock: 35 - 2 = 33 │
  └───────────────────────┘
  
  ┌─ Product 2 (qty: 1) ──┐
  │  → Order#2 oluştur    │
  │  → Stock: 20 - 1 = 19 │
  └───────────────────────┘

       ↓
[Database]
  INSERT INTO orders ... 
  UPDATE products SET stock = ...
  DELETE FROM cart ...
       ↓
Response: [Order#1, Order#2]
```

---

## 📋 Sipariş Yönetimi (Admin)

```
Admin: "siparişleri gör"
        ↓
┌──────────────────────────────┐
│  GET /admin/orders           │
└──────┬───────────────────────┘
       ↓
[AuthGuard] ✅ + [RolesGuard] ✅ (admin role)
       ↓
┌──────────────────────────────┐
│  OrdersService.findAll()     │
│  SELECT * FROM orders        │
│  WHERE status IN [...]       │
└──────┬───────────────────────┘
       ↓
Return: [{
  id: 1,
  product: { name, price },
  user: { email },
  quantity: 2,
  totalPrice: 115998,
  status: "PENDING"
}, ...]
```

### Siparişi Onaylama

```
Admin: "Siparişi onayla"
        ↓
┌──────────────────────────────┐
│  PATCH /admin/orders/1/approve│
└──────┬───────────────────────┘
       ↓
[Transaction] başla:

  ┌────────────────────────────────┐
  │ BEGIN TRANSACTION              │
  │                                │
  │ 1. Order status = APPROVED     │
  │ 2. Stock işlemi tamamla        │
  │ 3. (Yeni feature) Email gönder │
  │                                │
  │ COMMIT                         │
  │ (Başarısız ise ROLLBACK)      │
  └────────────────────────────────┘
       ↓
✅ Sipariş onaylandı
```

---

## 🗄️ Database Schema (ER Diagram)

```
┌──────────────┐        ┌──────────────┐
│    USERS     │        │  PRODUCTS    │
├──────────────┤        ├──────────────┤
│ id (PK)      │◄──────►│ id (PK)      │
│ email        │ 1    N │ name         │
│ password     │        │ price        │
│ fullName     │        │ stock        │
│ role         │        │ imageUrl     │
└──────┬───────┘        └──────┬───────┘
       │                       │
    1  │ N                  1  │ N
       │                       │
       │                       │
  ┌────▼──────┐       ┌───────▼──────┐
  │   ORDERS   │       │     CART     │
  ├────────────┤       ├──────────────┤
  │ id (PK)    │       │ id (PK)      │
  │ userId (FK)├──────►│ userId (FK)  │
  │ productId (FK)     │ productId(FK)│
  │ quantity   │       │ quantity     │
  │ status     │       │ createdAt    │
  └────────────┘       └──────────────┘

  1 User → N Refresh Tokens
  ┌──────────────────────┐
  │   REFRESH_TOKENS     │
  ├──────────────────────┤
  │ id (PK)              │
  │ token                │
  │ userId (FK) ─────┐   │
  │ expiresAt        │   │
  │ isValid          │   │
  │ createdAt        │   │
  └──────────────────┼───┘
                     │
          ┌──────────┴──────────┐
          │                     │
       [USERS] ────────────────────
```

---

## 🔀 Request/Response Döngüsü (Örnek)

### Senaryo: Sitarişi Oluştur

```
1. FRONTEND
   User: "iPhone 2 tane al"
   
2. REQUEST
   POST /orders
   Authorization: Bearer <access_token>
   {
     productId: 1,
     quantity: 2
   }
   
3. CONTROLLER (orders.controller.ts)
   @UseGuards(AuthGuard)
   @Post()
   create(@Request() req, @Body() createOrderDto) {
     const userId = req.user.sub;
     return this.ordersService.create(userId, createOrderDto);
   }
   
4. SERVICE (orders.service.ts)
   async create(userId: number, createOrderDto) {
     const queryRunner = this.dataSource.createQueryRunner();
     await queryRunner.startTransaction();
     
     try {
       // Find product
       const product = await queryRunner.manager.findOne(Product, {where: {id: 1}});
       
       // Validate stock
       if (product.stock < 2)
         throw new BadRequestException('Stok yetersiz');
       
       // Create order
       const order = new Order();
       order.product = product;
       order.quantity = 2;
       order.totalPrice = product.price * 2;  // 57999 * 2 = 115998
       await queryRunner.manager.save(order);
       
       // Update stock
       product.stock -= 2;  // 35 - 2 = 33
       await queryRunner.manager.save(product);
       
       // Commit
       await queryRunner.commitTransaction();
     } catch (error) {
       // Rollback: Sipariş silinir, stok eski haline döner
       await queryRunner.rollbackTransaction();
       throw error;
     }
   }
   
5. DATABASE
   INSERT INTO orders (...) VALUES (...)
   UPDATE products SET stock = 33 WHERE id = 1
   [COMMIT - Permanent save]
   
6. RESPONSE
   {
     "id": 123,
     "product": { "id": 1, "name": "iPhone 15" },
     "quantity": 2,
     "totalPrice": 115998,
     "status": "PENDING",
     "createdAt": "2026-02-14T..."
   }
   
7. FRONTEND
   ✅ Sipariş başarılı!
   User siparişler sayfasında gör
```

---

## 🔄 Veri Transformasyonu

```
FRONTEND
(JavaScript Object)
{
  productId: 1,
  quantity: 2
}
        ↓
[JSON.stringify()]
        ↓
HTTP BODY
(JSON String)
"{ \"productId\": 1, \"quantity\": 2 }"
        ↓
[HTTP Request]
        ↓
BACKEND
(NestJS)
        ↓
[CreateOrderDto Validation]
@IsNumber() productId
@IsNumber() quantity
        ↓
[Service Processing]
        ↓
[TypeORM Entity]
new Order() {
  productId: 1,
  quantity: 2,
  totalPrice: 115998
}
        ↓
[Database]
INSERT/UPDATE
        ↓
[Service returns]
{
  id: 123,
  productId: 1,
  quantity: 2,
  totalPrice: 115998,
  status: "PENDING"
}
        ↓
[Response JSON]
        ↓
FRONTEND
(JavaScript Object)
```

---

## 🎯 Error Handling Flow

```
API Request
    ↓
[AuthGuard]
  ✅ Token valid → Continue
  ❌ Token missing → 401
  ❌ Token invalid → 401
       ↓
[Controller Validation]
  ✅ DTO valid → Continue
  ❌ Missing fields → 400
  ❌ Wrong type → 400
       ↓
[Service Business Logic]
  ✅ All good → Process
  ❌ Product not found → 404
  ❌ Stock insufficient → 400
  ❌ DB error → 500
       ↓
[Return Response]
  ✅ 200 OK + Data
  ❌ 4xx Client Error
  ❌ 5xx Server Error
```

---

## 🔌 Module Dependency Graph

```
AppModule (Ana modül)
  ├── ServeStaticModule (Resim servisi)
  ├── TypeOrmModule (Veritabanı)
  │
  ├── AuthModule
  │   ├── JwtModule
  │   ├── UsersModule (dependency)
  │   └── RefreshTokenRepository
  │
  ├── UsersModule
  │   └── UserRepository
  │
  ├── ProductsModule
  │   └── ProductRepository
  │
  ├── CartModule
  │   ├── CartRepository
  │   ├── ProductsModule (dependency)
  │   └── AuthModule (guards)
  │
  ├── OrdersModule
  │   ├── OrderRepository
  │   ├── ProductsModule (dependency)
  │   ├── UsersModule (dependency)
  │   └── DataSource (Transactions)
  │
  ├── FilesModule
  │   ├── FileRepository
  │   └── AuthModule (guards)
  │
  └── DatabaseModule
      └── DatabaseSeeder
```

---

## 💾 Transaction Lifecycle

```
Sipariş oluştururken:

[START]
  ↓
QueryRunner.connect() ─────────────────┐
  ↓                                    │
QueryRunner.startTransaction() ◄───────┤─ Rollback yapılabilir noktası
  ↓                                    │
[1] Find Product (lock)                │
  ↓                                    │
[2] Check Stock                        │
  ↓                                    │
[3] Create Order                       │
  ↓                                    │
[4] Update Stock                       │
  ↓                                    │
HATA OLUŞTU MU?                        │
  │                                    │
  ├─ ❌ YES → Rollback ◄───────────────┼─ Tüm değişiklikler geri alınır
  │                                    │
  └─ ✅ NO → Commit ──────────────────┬─ Tüm değişiklikler kalıcı
                                       │
QueryRunner.release() ─────────────────┘
  ↓
[END]
```

---

## 📊 Concurrency (Eşzamanlılık) Problemi & Çözü

### Problem (Şifresiz Kod)
```
User A: "5 adet sipariş ver (stok = 5)"
User B: "5 adet sipariş ver (aynı anda)"

[WITHOUT TRANSACTION]

User A process          User B process
1. Check stock (5) ✓
                        1. Check stock (5) ✓
2. Save Order
                        2. Save Order
3. Update (5-5=0)
                        3. Update (5-5=0) ← PROBLEM!

Sonuç: 10 adet satıldı ama stok 0!
```

### Çözüm (Transaction ile)
```
[WITH TRANSACTION - SEQUENTIAL LOCK]

User A process:
  BEGIN TRANS
  Lock Product (5)
  Check (5) ✓
  Create Order
  Update (5-5=0)
  COMMIT
  Unlock ───────────────┐
                        ↓
User B process:
  BEGIN TRANS
  Lock Product (0)
  Check (0) ✗ → ERROR
  ROLLBACK
  
Sonuç: Sadece 5 tane satıldı! ✅
```

---

## 🚀 Performance Optimization Noktaları

```
Frontend                           Backend
  ↓                                  ↓
[Request]  ──────────────────>  [API Endpoint]
  │                                  │
  │                                  ├─ [Validation] (99.9% başarılı)
  │                                  │
  │                                  ├─ [Auth Check] (10% fail)
  │                                  │
  │ (Wait)                            ├─ [DB Query] (2s ortalama)  ⚠️
  │                                  │   - Index'leri kontrol et
  │                                  │
  │                                  ├─ [Service Logic] (100ms)
  │                                  │
  │ (Wait)                            ├─ [Response Build]
  │                                  │
[Response] <──────────────────  [Send]
  │
Show Result
```

**Optimization:**
1. Database queries'i optimize et (SELECT * YAPMA!)
2. Caching ekle (Redis)
3. Lazy loading kullan
4. Pagination ekle
5. Rate limiting ekle

---

**Version:** 1.0 | **Last Updated:** 14 Şubat 2026

**Önceki Sayfa:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) 📚
