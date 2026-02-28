# Favori & Yorum/Puanlama Sistemi - Frontend API Dokümantasyonu

Backend'e eklenen Favori (Wishlist) ve Yorum/Puanlama (Review/Rating) özelliklerinin frontend entegrasyonu için API referansı.

**Base URL:** `http://localhost:3000`

---

## 🔐 Yetkilendirme

Auth gerektiren endpoint'lerde her istekte header'a token eklenmeli:

```javascript
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
}
```

---

## ❤️ FAVORİ / WİSHLİST

### 1. Favorilere Ürün Ekle

```
POST /favorites
```

**Yetki:** Login gerekli

**Request Body:**
```json
{
  "productId": 1
}
```

**Başarılı Yanıt (201):**
```json
{
  "id": 1,
  "userId": 5,
  "product": {
    "id": 1,
    "name": "Apple iPhone 15 128GB",
    "description": "Akıllı telefon...",
    "price": "57999",
    "stock": 33,
    "imageUrl": "http://localhost:3000/uploads/xxx.jpg",
    "averageRating": "5.0",
    "reviewCount": 1
  },
  "productId": 1,
  "createdAt": "2026-02-28T12:35:43.099Z"
}
```

**Hata Yanıtları:**
- `404` — Ürün bulunamadı
- `409` — Bu ürün zaten favorilerinizde

**Frontend Örneği:**
```javascript
const addToFavorites = async (productId) => {
  try {
    const res = await axios.post('http://localhost:3000/favorites', 
      { productId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    // Kalp ikonunu dolu yap
    console.log('Favorilere eklendi:', res.data);
  } catch (err) {
    if (err.response?.status === 409) {
      alert('Bu ürün zaten favorilerinizde!');
    }
  }
};
```

---

### 2. Favori Listesini Getir

```
GET /favorites
```

**Yetki:** Login gerekli

**Başarılı Yanıt (200):**
```json
{
  "items": [
    {
      "id": 2,
      "userId": 5,
      "product": {
        "id": 3,
        "name": "Sony WH-1000XM5",
        "price": "12999",
        "stock": 60,
        "imageUrl": "http://localhost:3000/uploads/xxx.jpeg",
        "averageRating": "0.0",
        "reviewCount": 0
      },
      "productId": 3,
      "createdAt": "2026-02-28T12:35:43.117Z"
    },
    {
      "id": 1,
      "userId": 5,
      "product": {
        "id": 1,
        "name": "Apple iPhone 15 128GB",
        "price": "57999",
        "imageUrl": "http://localhost:3000/uploads/xxx.jpg",
        "averageRating": "5.0",
        "reviewCount": 1
      },
      "productId": 1,
      "createdAt": "2026-02-28T12:35:43.099Z"
    }
  ],
  "count": 2
}
```

**Frontend Örneği:**
```javascript
const getFavorites = async () => {
  const res = await axios.get('http://localhost:3000/favorites', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.data; // { items: [...], count: 2 }
};
```

---

### 3. Ürün Favorilerde mi Kontrol Et

```
GET /favorites/check/:productId
```

**Yetki:** Login gerekli

**Başarılı Yanıt (200):**
```json
{
  "isFavorite": true
}
```

**Frontend Örneği (ürün kartında kalp ikon durumu):**
```javascript
const checkFavorite = async (productId) => {
  const res = await axios.get(`http://localhost:3000/favorites/check/${productId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.data.isFavorite; // true veya false
};

// Kullanım: Ürün kartı yüklenirken
const isFav = await checkFavorite(productId);
// isFav true ise → ❤️ (dolu kalp)
// isFav false ise → 🤍 (boş kalp)
```

---

### 4. Ürünü Kaç Kişi Favoriledi

```
GET /favorites/count/:productId
```

**Yetki:** Login gerekli

**Başarılı Yanıt (200):**
```json
{
  "productId": 1,
  "favoriteCount": 15
}
```

---

### 5. Favorilerden Ürün Çıkar

```
DELETE /favorites/:productId
```

**Yetki:** Login gerekli  
**Not:** URL'deki parametre **ürün ID'sidir** (favori ID değil!)

**Başarılı Yanıt (200):**
```json
{
  "message": "Ürün favorilerden kaldırıldı"
}
```

**Frontend Örneği (Toggle — Ekle/Çıkar):**
```javascript
const toggleFavorite = async (productId) => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Önce favoride mi kontrol et
  const { data } = await axios.get(
    `http://localhost:3000/favorites/check/${productId}`, 
    { headers }
  );

  if (data.isFavorite) {
    // Favorideyse çıkar
    await axios.delete(`http://localhost:3000/favorites/${productId}`, { headers });
    return false; // Artık favori değil
  } else {
    // Favoride değilse ekle
    await axios.post('http://localhost:3000/favorites', { productId }, { headers });
    return true; // Artık favori
  }
};
```

---

### 6. Tüm Favorileri Temizle

```
DELETE /favorites
```

**Yetki:** Login gerekli

**Başarılı Yanıt (200):**
```json
{
  "message": "Tüm favoriler temizlendi"
}
```

---

## ⭐ YORUM & PUANLAMA (Review/Rating)

### 1. Yorum Yaz

```
POST /reviews
```

**Yetki:** Login gerekli  
**Kural:** Bir kullanıcı aynı ürüne yalnızca **1 yorum** yapabilir. Tekrar yazmak isterse güncelleme (PATCH) kullanmalıdır.

**Request Body:**
```json
{
  "productId": 1,
  "rating": 5,
  "title": "Harika telefon",
  "comment": "Çok memnun kaldım, herkese tavsiye ederim."
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `productId` | number | ✅ | Hangi ürüne yorum yapılacak |
| `rating` | number | ✅ | 1-5 arası yıldız puanı |
| `title` | string | ❌ | Yorum başlığı (opsiyonel) |
| `comment` | string | ✅ | Yorum içeriği |

**Başarılı Yanıt (201):**
```json
{
  "id": 1,
  "user": {
    "id": 5,
    "email": "test@test.com",
    "fullName": null,
    "role": "customer"
  },
  "userId": 5,
  "product": {
    "id": 1,
    "name": "Apple iPhone 15 128GB",
    "averageRating": "5.0",
    "reviewCount": 1
  },
  "productId": 1,
  "rating": 5,
  "title": "Harika telefon",
  "comment": "Çok memnun kaldım, herkese tavsiye ederim.",
  "createdAt": "2026-02-28T12:35:57.321Z",
  "updatedAt": "2026-02-28T12:35:57.321Z"
}
```

**Hata Yanıtları:**
- `404` — Ürün bulunamadı
- `409` — Bu ürüne zaten yorum yaptınız. Yorumunuzu güncelleyebilirsiniz.

**Frontend Örneği:**
```javascript
const submitReview = async (productId, rating, title, comment) => {
  try {
    const res = await axios.post('http://localhost:3000/reviews', 
      { productId, rating, title, comment },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    console.log('Yorum eklendi:', res.data);
    // Sayfayı yenile veya yorumları tekrar çek
  } catch (err) {
    if (err.response?.status === 409) {
      alert('Bu ürüne zaten yorum yaptınız. Yorumunuzu güncelleyebilirsiniz.');
    }
  }
};
```

---

### 2. Bir Ürünün Tüm Yorumlarını Getir

```
GET /reviews/product/:productId
```

**Yetki:** Public (token gerekmez)

**Başarılı Yanıt (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "email": "test@test.com",
        "fullName": "Betül Filiz",
        "role": "customer"
      },
      "userId": 5,
      "productId": 1,
      "rating": 5,
      "title": "Harika telefon",
      "comment": "Çok memnun kaldım, herkese tavsiye ederim.",
      "createdAt": "2026-02-28T12:35:57.321Z",
      "updatedAt": "2026-02-28T12:35:57.321Z"
    }
  ],
  "averageRating": 5,
  "totalReviews": 1,
  "ratingDistribution": {
    "5": 1,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0
  }
}
```

**Frontend Örneği (Ürün detay sayfasında yorumları gösterme):**
```javascript
const getProductReviews = async (productId) => {
  const res = await axios.get(`http://localhost:3000/reviews/product/${productId}`);
  return res.data;
  // {
  //   reviews: [...],        // Yorum listesi
  //   averageRating: 4.5,    // Ortalama puan
  //   totalReviews: 12,      // Toplam yorum sayısı
  //   ratingDistribution: {  // Yıldız dağılımı
  //     5: 6, 4: 3, 3: 2, 2: 1, 1: 0
  //   }
  // }
};
```

---

### 3. Ürünün Puan İstatistikleri

```
GET /reviews/stats/:productId
```

**Yetki:** Public (token gerekmez)

**Başarılı Yanıt (200):**
```json
{
  "averageRating": 4.5,
  "totalReviews": 12,
  "ratingDistribution": {
    "5": 6,
    "4": 3,
    "3": 2,
    "2": 1,
    "1": 0
  }
}
```

**Frontend Örneği (Yıldız çubuğu bileşeni):**
```javascript
const renderRatingBar = async (productId) => {
  const { data } = await axios.get(`http://localhost:3000/reviews/stats/${productId}`);
  
  // Yıldız gösterimi
  const stars = '★'.repeat(Math.round(data.averageRating)) + 
                '☆'.repeat(5 - Math.round(data.averageRating));
  
  console.log(`${stars} ${data.averageRating}/5 (${data.totalReviews} değerlendirme)`);
  
  // Dağılım çubuğu
  for (let i = 5; i >= 1; i--) {
    const count = data.ratingDistribution[i];
    const percentage = data.totalReviews > 0 
      ? Math.round((count / data.totalReviews) * 100) 
      : 0;
    console.log(`${i} ★: ${'█'.repeat(percentage / 5)} ${percentage}% (${count})`);
  }
};
```

---

### 4. Kullanıcının Kendi Yorumları

```
GET /reviews/my
```

**Yetki:** Login gerekli

**Başarılı Yanıt (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "userId": 5,
      "productId": 1,
      "product": {
        "id": 1,
        "name": "Apple iPhone 15 128GB",
        "price": "57999",
        "imageUrl": "http://localhost:3000/uploads/xxx.jpg"
      },
      "rating": 5,
      "title": "Harika telefon",
      "comment": "Çok memnun kaldım.",
      "createdAt": "2026-02-28T12:35:57.321Z",
      "updatedAt": "2026-02-28T12:35:57.321Z"
    }
  ],
  "count": 1
}
```

---

### 5. Tek Bir Yorumu Getir

```
GET /reviews/:id
```

**Yetki:** Public

---

### 6. Yorumu Güncelle

```
PATCH /reviews/:id
```

**Yetki:** Login gerekli (sadece yorum sahibi güncelleyebilir)

**Request Body (tüm alanlar opsiyonel):**
```json
{
  "rating": 4,
  "title": "Güncellendi",
  "comment": "Yorumumu güncelledim."
}
```

**Başarılı Yanıt (200):** Güncellenmiş yorum objesi döner.

**Hata Yanıtları:**
- `404` — Yorum bulunamadı
- `403` — Bu yorumu güncelleme yetkiniz yok (başka birinin yorumu)

**Frontend Örneği:**
```javascript
const updateReview = async (reviewId, updates) => {
  try {
    const res = await axios.patch(
      `http://localhost:3000/reviews/${reviewId}`,
      updates, // { rating: 4, comment: "Yeni yorum" }
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    console.log('Yorum güncellendi:', res.data);
  } catch (err) {
    if (err.response?.status === 403) {
      alert('Bu yorumu sadece sahibi güncelleyebilir!');
    }
  }
};
```

---

### 7. Yorumu Sil

```
DELETE /reviews/:id
```

**Yetki:** Login gerekli (yorum sahibi veya admin silebilir)

**Başarılı Yanıt (200):**
```json
{
  "message": "Yorum silindi"
}
```

**Hata Yanıtları:**
- `404` — Yorum bulunamadı
- `403` — Bu yorumu silme yetkiniz yok

---

## 📊 Ürün Kartında Rating Gösterimi

Artık her ürün objesinde `averageRating` ve `reviewCount` alanları var. Ürün listesinde veya detayda doğrudan kullanılabilir:

```javascript
// Ürün listesi çekildiğinde her ürünün içinde:
{
  "id": 1,
  "name": "Apple iPhone 15 128GB",
  "price": "57999",
  "stock": 33,
  "imageUrl": "http://localhost:3000/uploads/xxx.jpg",
  "averageRating": "4.5",  // ← Bunu yıldız olarak göster
  "reviewCount": 12         // ← "12 değerlendirme" olarak göster
}
```

**React Bileşen Örneği:**
```jsx
const ProductCard = ({ product }) => {
  const rating = parseFloat(product.averageRating) || 0;
  
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price} ₺</p>
      
      {/* Yıldız Gösterimi */}
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
            {star <= Math.round(rating) ? '★' : '☆'}
          </span>
        ))}
        <span className="rating-text">
          {rating > 0 ? `${rating}/5` : 'Henüz değerlendirilmedi'}
        </span>
        {product.reviewCount > 0 && (
          <span className="review-count">({product.reviewCount} değerlendirme)</span>
        )}
      </div>
      
      {/* Favori Butonu */}
      <button onClick={() => toggleFavorite(product.id)}>
        ❤️
      </button>
    </div>
  );
};
```

---

## ⚠️ Önemli Notlar

1. **Password asla dönmez** — Yorum yanıtlarında user objesi içinde `password` alanı yoktur.

2. **Bir ürüne bir yorum** — Kullanıcı aynı ürüne ikinci yorum yazamaz (409 hatası alır). Bunun yerine mevcut yorumunu PATCH ile güncellemeli.

3. **Rating otomatik güncellenir** — Yorum eklendiğinde, güncellendiğinde veya silindiğinde ürünün `averageRating` ve `reviewCount` değerleri otomatik yeniden hesaplanır.

4. **Favori toggle** — Favori ekle/çıkar için önce `GET /favorites/check/:productId` ile kontrol edip duruma göre POST veya DELETE çağrılabilir.

5. **Admin yorumları silebilir** — `DELETE /reviews/:id` endpoint'inde admin rolündeki kullanıcı herhangi bir yorumu silebilir.

6. **Public endpoint'ler** — Ürün yorumlarını görüntüleme (`/reviews/product/:id`) ve istatistikler (`/reviews/stats/:id`) için login gerekmez. Ürün detay sayfasında token kontrolü yapmadan çağrılabilir.
