# API Dokumentasyon İçeriği

Bu klasör, e-ticaret backend API'sinin kapsamlı dokumentasyonunu içerir.

## 📚 Dosyalar

### 1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Eksiksiz API Referans Dökümanı** - Swagger benzeri eksiksiz dokümantasyon

Bu dosya içerir:
- ✅ Tüm endpointler (8 modül, 30+ endpoint)
- ✅ Request ve response örnekleri
- ✅ Tüm DTO parametreleri ve açıklamaları
- ✅ Database entity şemaları
- ✅ Authentication flow şeması
- ✅ RBAC (Role-Based Access Control) açıklaması
- ✅ Örnek kullanım senaryoları (cURL)
- ✅ Error handling rehberi
- ✅ Troubleshooting bölümü
- ✅ Durum kodları ve açıklamaları

---

## 📋 Modüller Özeti

### 🔐 Authentication (Auth)
- Kayıt, giriş, token yenileme
- Profil görüntüleme
- **Dosya**: `API_DOCUMENTATION.md` → Kimlik Doğrulama bölümü

### 👥 Users
- Kullanıcı CRUD işlemleri
- Profil güncelleme
- **Dosya**: `API_DOCUMENTATION.md` → Kullanıcı Endpointleri bölümü

### 🛍 Products
- Ürün CRUD işlemleri
- Resim yükleme (Admin)
- **Dosya**: `API_DOCUMENTATION.md` → Ürün Endpointleri bölümü

### 🛒 Cart
- Sepete ürün ekleme/çıkarma
- Checkout
- **Dosya**: `API_DOCUMENTATION.md` → Sepet Endpointleri bölümü

### 📦 Orders
- Sipariş oluşturma
- Sipariş takip
- Admin siparişi yönetimi
- **Dosya**: `API_DOCUMENTATION.md` → Sipariş Endpointleri bölümü

### 📁 Files
- Resim yükleme
- **Dosya**: `API_DOCUMENTATION.md` → Dosya Yükleme Endpointleri bölümü

---

## 🚀 Hızlı Başlangıç

### 1. Kullanıcı Kaydı
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","fullName":"John"}'
```

### 2. Giriş Yap
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### 3. Ürün Listele
```bash
curl http://localhost:3000/products
```

### 4. Sepete Ürün Ekle
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

---

## 🔑 Base URL

```
http://localhost:3000
```

---

## 🛡 Güvenlik

### Authentication
- **Protokol**: JWT (JSON Web Token)
- **Format**: `Authorization: Bearer <token>`
- **Access Token Yaşam**: ~15 dakika
- **Refresh Token Yaşam**: ~7 gün

### Authorization
- **Customer**: Normal kullanıcı (varsayılan)
- **Admin**: Ürün ve sipariş yönetimi

---

## 📊 Data Models

| Model | Açıklama |
|-------|----------|
| **User** | Kullanıcı profili ve kimlik doğrulama |
| **Product** | Satılacak ürünler |
| **Cart** | Kullanıcı sepeti |
| **Order** | Tamamlanan siparişler |
| **RefreshToken** | Token yenileme verileri |

---

## 📝 Response Formatları

### Başarılı Response (200, 201)
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

### Hata Response (400, 401, 403, 404)
```json
{
  "statusCode": 400,
  "message": "Hata açıklaması",
  "error": "Bad Request"
}
```

---

## 🔄 HTTP Metodları

| Metod | Açıklama |
|-------|----------|
| **GET** | Veri oku |
| **POST** | Yeni veri oluştur |
| **PATCH** | Verinin bir kısmını güncelle |
| **PUT** | Verinin tamamını güncelle |
| **DELETE** | Veri sil |

---

## 🎯 Yaygın Kullanım Senaryoları

1. **Ürün Satın Alma**
   - Ürün listesini görüntüle
   - Sepete ekle
   - Checkout yap
   - Sipariş takip et

2. **Admin: Ürün Yönetimi**
   - Ürün oluştur (resim yükle)
   - Ürün güncelle
   - Siparişleri onayla/reddet

3. **Profil Yönetimi**
   - Kayıt ol
   - Giriş yap
   - Profili güncelle

---

## ⚠️ Doğrulama Kuralları

- **Email**: Geçerli e-posta formatı, unique
- **Şifre**: En az 6 karakter
- **Miktar**: Minimum 1
- **Resim**: jpg, jpeg, png, gif formatları
- **Fiyat**: Decimal (örn: 1299.99)
- **Stok**: Integer (örn: 50)

---

## 📞 İletişim

Sorularınız veya sorunlarınız için backend ekibine başvurun.

**API Belge Sürümü**: 1.0  
**Son Güncelleme**: 21 Şubat 2024
