# 🚀 API Hızlı Referans (Cheat Sheet)

**Not:** Tüm endpoint'ler prefix'i `http://localhost:3000` ile başlar.

---

## 🔐 Auth Endpoints

### Kayıt Ol
```
POST /auth/register
```
**Body:**
```json
{
  "email": "yeni@example.com",
  "password": "StrongPass123",
  "fullName": "Ad Soyad",
  "phone": "5551234567",
  "gender": "male"
}
```
**Response:** `{ user, access_token, refresh_token }`

### Giriş Yap
```
POST /auth/login
```
**Body:**
```json
{
  "email": "yeni@example.com",
  "password": "StrongPass123"
}
```
**Response:** `{ access_token, refresh_token }`

### Token Yenile
```
POST /auth/refresh
```
**Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```
**Response:** `{ access_token }`

### Profil Bilgisi
```
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Response:** Kullanıcı bilgileri

---

## 👥 Users Endpoints

### Tüm Kullanıcıları Listele (Admin)
```
GET /users
Authorization: Bearer <admin_token>
```

### Kullanıcı Detayları
```
GET /users/:id
Authorization: Bearer <token>
```

### Kendini Güncelle
```
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Yeni Ad",
  "phone": "5559876543",
  "gender": "female"
}
```
**Not:** Sadece kendi profilini güncelleyebilirsin

### Kullanıcıyı Sil (Admin)
```
DELETE /users/:id
Authorization: Bearer <admin_token>
```

---

## 📦 Products Endpoints

### Tüm Ürünleri Listele (Public)
```
GET /products
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Apple iPhone 15",
    "price": 57999,
    "stock": 35,
    "imageUrl": "https://...",
    "description": "..."
  },
  ...
]
```

### Bir Ürün Detayları
```
GET /products/:id
```

### Yeni Ürün Ekle (Admin)
```
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Samsung Galaxy S24",
  "description": "Yeni Android telefonu",
  "price": 54999,
  "stock": 50,
  "imageUrl": "https://picsum.photos/600/400"
}
```

### Ürünü Güncelle (Admin)
```
PATCH /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 49999,
  "stock": 100
}
```

### Ürünü Sil (Admin)
```
DELETE /products/:id
Authorization: Bearer <admin_token>
```

---

## 🛒 Cart Endpoints

### Sepete Ürün Ekle
```
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```
**Response:**
```json
{
  "id": 1,
  "userId": 5,
  "productId": 1,
  "quantity": 2,
  "product": { "id": 1, "name": "iPhone", "price": 57999 }
}
```

### Sepeti Görüntüle
```
GET /cart
Authorization: Bearer <token>
```
**Response:** Sepet içinde bulunan ürünler

### Sepet Ürününü Güncelle
```
PATCH /cart/:cartItemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

### Sepet Ürününü Sil
```
DELETE /cart/:cartItemId
Authorization: Bearer <token>
```

### Sepeti Tamamen Boşalt
```
DELETE /cart
Authorization: Bearer <token>
```

### Satın Al (Checkout)
```
POST /cart/checkout
Authorization: Bearer <token>
```
**Sonuç:** 
- Sepet içindeki her ürün için sipariş oluşturulur
- Ürünlerin stokları azalır
- Sepet boşaltılır

---

## 📋 Orders Endpoints

### Yeni Sipariş Oluştur (Doğrudan)
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```
**Response:**
```json
{
  "id": 1,
  "user": { "id": 5, "email": "..." },
  "product": { "id": 1, "name": "iPhone" },
  "quantity": 2,
  "totalPrice": 115998,
  "status": "PENDING",
  "createdAt": "2026-02-14T13:45:00Z"
}
```

### Kendi Siparişlerimi Gör
```
GET /orders
Authorization: Bearer <token>
```
**Response:** Kullanıcının tüm siparişleri

---

## 🛡️ Admin - Orders Endpoints

### Tüm Siparişleri Gör
```
GET /admin/orders
Authorization: Bearer <admin_token>
```

### Siparişleri Filtrele (Status'a göre)
```
GET /admin/orders?status=PENDING
Authorization: Bearer <admin_token>

# Status değerleri: PENDING, APPROVED, REJECTED
```

### Siparişi Onayla
```
PATCH /admin/orders/:orderId/approve
Authorization: Bearer <admin_token>

# OR

PUT /admin/orders/:orderId/approve
Authorization: Bearer <admin_token>
```
**Sonuç:** 
- Sipariş status'u APPROVED olur
- Stok işletme tamamlanır

### Siparişi Reddet
```
PATCH /admin/orders/:orderId/reject
Authorization: Bearer <admin_token>

# OR

PUT /admin/orders/:orderId/reject
Authorization: Bearer <admin_token>
```
**Sonuç:**
- Sipariş status'u REJECTED olur
- Stoğu geri eklenir

---

## 📤 Files Endpoints

### Resim Yükle
```
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

[Resim dosyası]
```
**Response:**
```json
{
  "filename": "1707900000000-screenshot.png",
  "path": "/uploads/1707900000000-screenshot.png",
  "url": "http://localhost:3000/uploads/1707900000000-screenshot.png"
}
```

**Resme Erişim:**
```
GET /uploads/1707900000000-screenshot.png
```

---

## 📝 Authorization Header

**Gerekli Endpoint'lerde:**
```
Authorization: Bearer <access_token>
```

**Access Token Nereden Gelsin:**
1. `POST /auth/register` - Kayıt ol
2. `POST /auth/login` - Giriş yap
3. `POST /auth/refresh` - Eski token'ı yenile

**Token Süresi:**
- Access Token: 15 dakika
- Refresh Token: 30 gün

---

## 🔑 Kolay Postman Setup (Curl)

### 1. Kayıt Ol ve Token Kopyala
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "fullName": "Test User"
  }'
```

### 2. Token ile İstek Gönder
```bash
TOKEN="<buraya_token_yapıştır>"

curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Sepete Ürün Ekle
```bash
TOKEN="<buraya_token_yapıştır>"

curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Kayıt + Giriş
```bash
# 1. Kayıt ol
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"Test123","fullName":"User 1"}'

# 2. Giriş yap (aynı credentials)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"Test123"}'

# 3. Token ile profil gör
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Senaryo 2: Ürün Satın Al
```bash
TOKEN="<access_token>"

# 1. Ürünleri listele
curl http://localhost:3000/products

# 2. Sepete ekle (product id 1)
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

# 3. Sepeti görüntüle
curl http://localhost:3000/cart \
  -H "Authorization: Bearer $TOKEN"

# 4. Satın al
curl -X POST http://localhost:3000/cart/checkout \
  -H "Authorization: Bearer $TOKEN"

# 5. Siparişlerimi gör
curl http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

### Senaryo 3: Admin Sipariş Yönetimi
```bash
ADMIN_TOKEN="<admin_token>"

# 1. Tüm siparişleri gör
curl http://localhost:3000/admin/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Pending siparişleri filtrele
curl "http://localhost:3000/admin/orders?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Siparişi onayla (order id 1)
curl -X PATCH http://localhost:3000/admin/orders/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Onaylanan siparişleri gör
curl "http://localhost:3000/admin/orders?status=APPROVED" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## ❌ Hata Kodları ve Çözümleri

| Kod | Mesaj | Çözüm |
|-----|-------|-------|
| 400 | `Validation failed` | DTO gereksinimlerini kontrol et |
| 401 | `Giriş yapmanız gerekiyor` | Authorization header ekle |
| 401 | `Geçersiz Token` | Token'ı yenile veya yeniden giriş yap |
| 403 | `Forbidden` | Admin rolü gerekli |
| 404 | `Not Found` | Kayıt/ürün/sipariş bulunamadı |
| 409 | `Conflict` | Email zaten kullanımda |
| 500 | `Internal error` | Loglara bak, admin'e bildir |

---

## 💡 Timing Özeti

- **Access Token:** 15 dakika ⏱️
- **Refresh Token:** 30 gün 📅
- **Refresh işlemi:** Otomatik `POST /auth/refresh`

---

**Version:** 1.0 | **Last Updated:** 14 Şubat 2026
