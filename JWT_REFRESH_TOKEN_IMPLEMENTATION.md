# JWT & Refresh Token Implementation

## Özet
Projeye JWT access token (15 dakika) ve refresh token (30 gün) sistemi implementasyonu tamamlandı.

## Güvenlik Özellikleri

### Access Token (JWT)
- **Süresi**: 15 dakika
- **Içeriği**: User ID, Email, Role
- **Kullanım**: API isteklerinin güvenliğini sağlar

### Refresh Token
- **Süresi**: 30 gün
- **Depolama**: Veritabanında (RefreshToken tablosu)
- **Kullanım**: Yeni access token almak için

## API Endpoints

### 1. Kayıt Ol
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "phone": "5551234567",
  "gender": "male"
}

Response:
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

### 2. Giriş Yap
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Hesap Bilgilerini Al
```
GET /auth/me
Authorization: Bearer <access_token>

Response:
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "5551234567",
  "gender": "male",
  "role": "customer"
}
```

### 4. Token Yenile (Access Token Almak)
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Environment Variables (.env)

```env
# JWT Secrets
JWT_SECRET=cokgizlibiranahtar
JWT_REFRESH_SECRET=gizlirefreshkey

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ecommerce

# Port
PORT=3000
```

## Veritabanı Şemaları

### RefreshToken Entity
```
- id (PK): number
- token: string (Refresh token değeri)
- userId (FK): number (User ID)
- expiresAt: Date (Token'ın süresi dolacağı tarih)
- isValid: boolean (Token hala geçerli mi?)
- deletedAt: Date (Soft delete için)
- createdAt: Date (Oluşturulma tarihi)
```

### User Entity (Güncelleme)
```
- ... (Mevcut alanlar)
- refreshTokens: RefreshToken[] (One-to-Many ilişkisi)
```

## Kullanım Akışı

1. **Registeration/Login**: Kullanıcı register olur atau giriş yapar
2. **Access Token Kullanımı**: Sonraki 15 dakika boyunca API'ye istek yaparken `Authorization: Bearer <access_token>` header'ı ile gönderilir
3. **Token Süresi Dolarsa**: Client, refresh token ile `/auth/refresh` endpoint'ine istek yapar
4. **Yeni Access Token**: Sunucu yeni access token döner, 15 dakika daha API kullanabilir

## Güvenlik Notları

⚠️ **Production'da yapılması gerekenler:**
1. `JWT_SECRET` ve `JWT_REFRESH_SECRET` çevre değişkenlerini güçlü ve rastgele values ile değiştir
2. Refresh token'lar Redis gibi hızlı bir cache'de depolanabilir (opsiyonel)
3. Token iptali (logout) için refresh token valid flag'ini false yap
4. HTTPS kullan
5. HttpOnly cookies ile token'ları gönderebilirsin (XSS koruması için)

## Teknik Detaylar

### Files Oluşturulan/Güncellenmiş:

1. **[src/auth/entities/refresh-token.entity.ts](src/auth/entities/refresh-token.entity.ts)** - RefreshToken entity
2. **[src/auth/dto/refresh-token.dto.ts](src/auth/dto/refresh-token.dto.ts)** - RefreshToken DTO
3. **[src/auth/auth.service.ts](src/auth/auth.service.ts)** - Token generation ve validation logics
4. **[src/auth/auth.controller.ts](src/auth/auth.controller.ts)** - `/auth/refresh` endpoint
5. **[src/auth/auth.module.ts](src/auth/auth.module.ts)** - RefreshToken repository registration
6. **[src/auth/auth.guard.ts](src/auth/auth.guard.ts)** - Environment variable support
7. **[src/app.module.ts](src/app.module.ts)** - RefreshToken entity registration
8. **[src/users/entities/user.entity.ts](src/users/entities/user.entity.ts)** - RefreshToken ilişkisi ekleme
9. **[.env](.env)** - Environment variables
