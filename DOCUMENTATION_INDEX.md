# 📚 E-Ticaret Backend - Dokümantasyon İndeksi

**Hoşgeldiniz!** Bu sayfada projenin tüm rehberleri ve kaynakları bulunur.

---

## 🎯 Hızlı Başlangıç (5 dakika)

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını kontrol et
cat .env

# 3. Uygulamayı başlat
npm run start:dev

# 4. ✅ "Nest application successfully started" mesajını gör
```

**Test Etmek:**
```bash
# Ürünleri listele
curl http://localhost:3000/products

# Başarılı! 🎉
```

---

## 📖 Dokümantasyon Rehberi

### 🌟 **1. Kapsamlı Eğitici Rehber** (⭐ Başlangıç için ideal)
📄 **[COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)** 

**Okuma Süresi:** ~20 dakika  
**Seviye:** Başlangıç → Orta

**İçerik:**
- ✅ Proje özeti ve kurulum
- ✅ Proje mimarisi ve folder yapısı
- ✅ Temel kavramlar (Entity, DTO, Service, Controller, Guard)
- ✅ Her modülün detaylı açıklaması
- ✅ Veritabanı şeması ve ilişkileri
- ✅ Authentication akışı (JWT + Refresh Token)
- ✅ API endpoints tablosu
- ✅ Örnek istekler (cURL)
- ✅ Troubleshooting

**Ne Zaman Oku:** Kod okumaya başlamadan önce

---

### 🚀 **2. API Hızlı Referans** (Cheat Sheet)
📄 **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)**

**Okuma Süresi:** ~10 dakika (gerektiğinde başvur)  
**Seviye:** Hızlı referans

**İçerik:**
- ✅ Tüm API endpoint'leri
- ✅ Request/Response örnekleri
- ✅ Hata kodları ve çözümleri
- ✅ cURL komutları (test için)
- ✅ Test senaryoları

**Ne Zaman Oku:** API'yi test ederken veya endpoint'ler hakkında hızlı bilgi gerektiğinde

---

### 🔐 **3. JWT & Refresh Token Implementasyonu**
📄 **[JWT_REFRESH_TOKEN_IMPLEMENTATION.md](JWT_REFRESH_TOKEN_IMPLEMENTATION.md)**

**Okuma Süresi:** ~5 dakika  
**Seviye:** Detaylı açıklama

**İçerik:**
- ✅ Access Token (15 dakika)
- ✅ Refresh Token (30 gün)
- ✅ Authentication endpoints
- ✅ Token yenileme akışı
- ✅ Environment variables
- ✅ Veritabanı entegrasyonu

**Ne Zaman Oku:** Authentication hakkında derinlemesine bilgi gerektiğinde

---

### 📋 **4. Orijinal Proje Dokümantasyonu**
📄 **[PROJE_DOKUMANI.md](PROJE_DOKUMANI.md)**

**Okuma Süresi:** ~30 dakika (detaylı)  
**Seviye:** Kapsamlı referans

**İçerik:**
- Tüm modüllerin en detaylı açıklaması
- Kod örnekleri
- Transaction yönetimi
- Admin dashboard açıklaması

**Ne Zaman Oku:** Belirli bir modülü derinlemesine anlamak istediğinde (Orders, Auth vb.)

---

## 🗂️ Proje Dosya Yapısı

```
ecommerce-backend/
│
├── 📚 DOKÜMANTASYON (Bu dosyayı oku!)
│   ├── COMPLETE_GUIDE.md                  ⭐ Ana rehber
│   ├── API_QUICK_REFERENCE.md             🚀 Hızlı referans
│   ├── JWT_REFRESH_TOKEN_IMPLEMENTATION.md  🔐 Auth detayları
│   ├── PROJE_DOKUMANI.md                  📋 Kapsamlı dokümantasyon
│   └── README.md                          (Burası!)
│
├── 📦 KAYNAK KODU
│   ├── src/
│   │   ├── main.ts                        Entry point
│   │   ├── app.module.ts                  Ana modül
│   │   ├── auth/                          🔐 Authentication
│   │   ├── users/                         👥 Kullanıcı yönetimi
│   │   ├── products/                      📦 Ürün yönetimi
│   │   ├── cart/                          🛒 Sepet
│   │   ├── orders/                        📋 Siparişler
│   │   ├── files/                         📤 Dosya upload
│   │   └── database/                      🌱 Seed
│   │
│   └── uploads/                           📸 Yüklenen resimler
│
├── ⚙️ KONFIGÜRASYON
│   ├── package.json                       npm bağımlılıkları
│   ├── .env                               Environment variables
│   ├── tsconfig.json                      TypeScript ayarları
│   └── eslint.config.mjs                  Linter ayarları
│
└── 🧪 TEST
    ├── test/                              Test dosyaları
    └── jest.config.js                     Test ayarları
```

---

## 📊 Modüller ve Sorumlulukları

| Modül | Dosya | Amaç | 
|-------|-------|------|
| 🔐 **Auth** | `src/auth/` | Kullanıcı giriş, JWT token yönetimi |
| 👥 **Users** | `src/users/` | Kullanıcı CRUD işlemleri |
| 📦 **Products** | `src/products/` | Ürün yönetimi, stok kontrolü |
| 🛒 **Cart** | `src/cart/` | Sepete ürün ekleme/çıkarma |
| 📋 **Orders** | `src/orders/` | Sipariş yönetimi, transaction |
| 📤 **Files** | `src/files/` | Resim yükleme |
| 🌱 **Database** | `src/database/` | Test verileri (seed) |

---

## 🚦 Learning Path (Öğrenme Yolu)

### 👶 Level 1: Başlangıç (1-2 saat)

1. **COMPLETE_GUIDE.md** oku
   - Proje özeti
   - Temel kavramlar
   - Modüller detaylı açıklaması

2. **API_QUICK_REFERENCE.md** ile hızlı test et
   - Ürün listele: `curl http://localhost:3000/products`
   - Kayıt ol ve giriş yap
   - Sepete ürün ekle

3. **Dosyaları ara-tıkla:** `src/auth/auth.controller.ts`
   - Endpoint'lerin tanımlandığı yerdir
   - Basit CRUD işlemlerinin nasıl yapıldığını gör

### 👨‍💻 Level 2: Orta (2-4 saat)

1. **PROJE_DOKUMANI.md** oku (detaylı kısımlar)
   - Her modülün iç detayları
   - Kod örnekleri
   - Service'lerin nasıl çalıştığı

2. **Authentication Akışını Anla**
   - JWT_REFRESH_TOKEN_IMPLEMENTATION.md oku
   - Token yapısını jwt.io'da analiz et
   - `/auth/refresh` endpoint'ini test et

3. **Orders Module'ü Derinlemesine Anla**
   - `src/orders/orders.service.ts` oku
   - Transaction konseptini anla
   - Test et: Sipariş oluştur → Admin onayla

### 🔬 Level 3: İleri (4+ saat)

1. **TypeORM Relations'ı Anla**
   - Entity'lerdeki `@ManyToOne`, `@OneToMany` dekoratörleri
   - Database relations ayarlanması

2. **Kendi Endpoint'ini Yaz**
   - Yeni bir feature ekle (örn: Product reviews)
   - Service, Controller, Entity yaz

3. **Tests Yaz**
   - `test/` klasöründeki test dosyaları anla
   - Jest ile unit test yaz

---

## 🔨 Geliştirici Komutları

```bash
# 🚀 Başlat
npm run start         # Production modunda
npm run start:dev     # Development modunda (hot reload)

# 🏗️ Build
npm run build         # TypeScript → JavaScript dönüştür

# 🧪 Test
npm run test          # Unit testleri çalıştır
npm run test:watch    # Dosya değişikliğinde auto-test
npm run test:e2e      # End-to-end testleri çalıştır

# 📝 Kod kalitesi
npm run lint          # Linting (ESLint)
npm run format        # Prettier ile otomatik format

# 🧹 Temizlik
rm -rf node_modules
rm dist/
npm install           # Yeniden yükle
```

---

## 🌍 Environment Variables (.env)

Bu dosyayı **hiç Git'e commit etme!** (.gitignore'da var)

```env
# 🔐 JWT Secrets (Production'da güçlü değerler kullan!)
JWT_SECRET=cokgizlibiranahtar
JWT_REFRESH_SECRET=gizlirefreshkey

# 🗄️ PostgreSQL
DB_HOST=localhost          # Veritabanı sunucusu
DB_PORT=5432               # PostgreSQL default portu
DB_USERNAME=betulfiliz    # DB kullanıcısı
DB_PASSWORD=1234          # DB şifresi
DB_NAME=eticaret_db       # Veritabanı adı

# 🚀 Server
PORT=3000                  # API portu
```

---

## 💾 Veritabanı Kurulumu

### PostgreSQL Yükleme (macOS)
```bash
brew install postgresql@15
brew services start postgresql@15

# Veritabanı oluştur
createdb eticaret_db

# Test et
psql -d eticaret_db
```

### Tablo Oluşturma

TypeORM `synchronize: true` ayarı sayesinde otomatik oluşur:
```
npm run start:dev
# Şu mesajı gör: "Nest application successfully started"
# Tablolar otomatik oluştu! ✅
```

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### ❌ "Port 3000 zaten kullanımda"
```bash
# Portu öldür
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ya da programda port değiştir
PORT=3001 npm run start:dev
```

### ❌ "PostgreSQL bağlantısı başarısız"
```bash
# PostgreSQL çalışıyor mu?
brew services list

# Başlatılmadıysa başlat
brew services start postgresql@15

# Veritabanı var mı?
createdb eticaret_db
```

### ❌ "TypeScript hata veriyor"
```bash
npm run build    # Hataları görmek için
npm run lint:fix # Otomatik düzelt
```

Daha fazla sorun için: **[COMPLETE_GUIDE.md#troubleshooting](COMPLETE_GUIDE.md#troubleshooting)**

---

## 🎓 Tavsiyeler

### ✅ Yapılması Gerekenler
- [ ] Tüm dokümantasyonu en az bir kez oku
- [ ] Örnek API isteklerini cURL ile test et
- [ ] `src/auth/auth.service.ts` kodunu satır satır oku
- [ ] Kendi endpoint'ini yaz (örn: Product reviews)
- [ ] Tests yaz
- [ ] GitHub'a push et

### ❌ Yapılmaması Gerekenler
- [ ] `.env` dosyasını Git'e commit etme (secrets!)
- [ ] `node_modules/` dizinini Git'e commit etme
- [ ] `synchronize: true` Production'da bırakma
- [ ] Plain-text şifreler sakla
- [ ] Şifre olarak `password` kullanma

---

## 📞 Yardım ve Kaynaklar

### Konuya İlişkin Linkler
- 🔗 [NestJS Official Docs](https://docs.nestjs.com)
- 🔗 [TypeORM Documentation](https://typeorm.io)
- 🔗 [JWT Decoded](https://jwt.io)
- 🔗 [PostgreSQL Docs](https://www.postgresql.org/docs)

### Hızlı Sorular
- **"API'yi nasıl test etmeliyim?"** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md#-test-senaryoları)
- **"JWT token nasıl çalışıyor?"** → [JWT_REFRESH_TOKEN_IMPLEMENTATION.md](JWT_REFRESH_TOKEN_IMPLEMENTATION.md#jwt-token-akışı)
- **"Yeni endpoint nasıl eklerim?"** → [COMPLETE_GUIDE.md#modüller-detaylı](COMPLETE_GUIDE.md#modüller-detaylı)

---

## 🚀 Sonraki Adımlar

### Fase 1: Anlama (Şu An)
- ✅ Dokümantasyonları oku
- ✅ API'yi test et
- ✅ Kodu oku

### Fase 2: Geliştirme
- [ ] Yeni feature ekle
- [ ] Tests yaz
- [ ] Code review yap

### Fase 3: Deployment
- [ ] Docker'a al
- [ ] CI/CD kur
- [ ] Production'a deploy et

---

## 📈 Proje İstatistikleri

- **Modüller:** 7 (Auth, Users, Products, Cart, Orders, Files, Database)
- **API Endpoints:** 20+
- **Database Tables:** 5 (User, Product, Order, Cart, RefreshToken)
- **Satır Kod:** ~2000 (production)
- **Test Coverage:** (Geliştiriliyor)

---

## 👤 Katkıda Bulun

1. Feature branch oluştur: `git checkout -b feature/yeni-feature`
2. Değişiklikleri commit et: `git commit -m "Açıklama"`
3. Push et: `git push origin feature/yeni-feature`
4. Pull Request aç

---

## 📄 Lisans

Bu proje UNLICENSED'dir.

---

**Version:** 1.0 | **Son Güncelleme:** 14 Şubat 2026

**Başlamak için:** [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md) ← Buradan başla! ⭐
