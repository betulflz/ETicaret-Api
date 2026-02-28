# Ürün Arama, Filtreleme, Sıralama & Sayfalama API Dokümantasyonu

> **Base URL:** `http://localhost:3000`
> **Endpoint:** `GET /products`
> **Auth:** Gerekli değil (public endpoint)

---

## Query Parametreleri

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|-----------|-----|---------|------------|----------|
| `search` | string | Hayır | — | Ürün adı veya açıklamasında arama yapar (büyük/küçük harf duyarsız) |
| `minPrice` | number | Hayır | — | Minimum fiyat filtresi |
| `maxPrice` | number | Hayır | — | Maksimum fiyat filtresi |
| `inStock` | boolean | Hayır | — | `true` gönderilirse sadece stokta olan ürünleri getirir |
| `sortBy` | string | Hayır | `id` | Sıralama kriteri. Değerler: `price`, `name`, `stock`, `id` |
| `order` | string | Hayır | `ASC` | Sıralama yönü. `ASC` (küçükten büyüğe) veya `DESC` (büyükten küçüğe) |
| `page` | number | Hayır | `1` | Sayfa numarası (1'den başlar) |
| `limit` | number | Hayır | `10` | Sayfa başına ürün sayısı |

---

## Yanıt Formatı

```json
{
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "Gaming laptop",
      "price": "15000.00",
      "stock": 25,
      "imageUrl": "http://localhost:3000/uploads/12345.jpg"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### `data` Alanı (Ürün Dizisi)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | number | Ürün ID'si |
| `name` | string | Ürün adı |
| `description` | string | Ürün açıklaması |
| `price` | string (decimal) | Ürün fiyatı |
| `stock` | number | Stok adedi |
| `imageUrl` | string \| null | Ürün resmi URL'i (opsiyonel) |

### `meta` Alanı (Sayfalama Bilgisi)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `total` | number | Filtreye uyan toplam ürün sayısı |
| `page` | number | Şu anki sayfa numarası |
| `limit` | number | Sayfa başına gösterilen ürün sayısı |
| `totalPages` | number | Toplam sayfa sayısı |

---

## Kullanım Örnekleri

### 1. Tüm Ürünleri Getir (Varsayılan)
```
GET /products
```

### 2. İsme Göre Arama
```
GET /products?search=laptop
```
> Ürün adında veya açıklamasında "laptop" geçen ürünleri getirir. Büyük/küçük harf fark etmez.

### 3. Fiyat Aralığına Göre Filtreleme
```
GET /products?minPrice=500&maxPrice=5000
```
> Fiyatı 500 ile 5000 arasındaki ürünleri getirir.

### 4. Sadece Stokta Olanlar
```
GET /products?inStock=true
```

### 5. Fiyata Göre Sıralama (Ucuzdan Pahalıya)
```
GET /products?sortBy=price&order=ASC
```

### 6. Fiyata Göre Sıralama (Pahalıdan Ucuza)
```
GET /products?sortBy=price&order=DESC
```

### 7. İsme Göre Sıralama (A-Z)
```
GET /products?sortBy=name&order=ASC
```

### 8. Sayfalama
```
GET /products?page=1&limit=5
GET /products?page=2&limit=5
```
> İlk 5 ürünü, sonra 6-10 arası ürünleri getirir.

### 9. Tüm Filtreler Birlikte
```
GET /products?search=telefon&minPrice=1000&maxPrice=10000&inStock=true&sortBy=price&order=DESC&page=1&limit=12
```
> Adında "telefon" geçen, 1000-10000₺ arası, stokta olan ürünleri fiyata göre pahalıdan ucuza sıralar ve ilk 12'sini getirir.

---

## Frontend Entegrasyon Örneği (JavaScript / Fetch)

```javascript
// Filtre parametrelerini oluştur
const params = new URLSearchParams();

// Arama (opsiyonel)
if (searchText) params.append('search', searchText);

// Fiyat aralığı (opsiyonel)
if (minPrice) params.append('minPrice', minPrice);
if (maxPrice) params.append('maxPrice', maxPrice);

// Stok filtresi (opsiyonel)
if (onlyInStock) params.append('inStock', 'true');

// Sıralama (opsiyonel)
if (sortBy) params.append('sortBy', sortBy);     // 'price' | 'name' | 'stock' | 'id'
if (order) params.append('order', order);          // 'ASC' | 'DESC'

// Sayfalama
params.append('page', currentPage.toString());
params.append('limit', '12');

// API çağrısı
const response = await fetch(`http://localhost:3000/products?${params.toString()}`);
const result = await response.json();

// Kullanım
const products = result.data;       // Ürün dizisi
const totalItems = result.meta.total;      // Toplam ürün sayısı
const totalPages = result.meta.totalPages; // Toplam sayfa sayısı
const currentPage = result.meta.page;      // Mevcut sayfa
```

## Frontend Entegrasyon Örneği (Axios)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getProducts = async (filters = {}) => {
  const { search, minPrice, maxPrice, inStock, sortBy, order, page = 1, limit = 12 } = filters;

  const params = { page, limit };

  if (search) params.search = search;
  if (minPrice !== undefined) params.minPrice = minPrice;
  if (maxPrice !== undefined) params.maxPrice = maxPrice;
  if (inStock) params.inStock = true;
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;

  const response = await axios.get(`${API_URL}/products`, { params });
  return response.data; // { data: [...], meta: {...} }
};

// Kullanım:
const result = await getProducts({
  search: 'laptop',
  minPrice: 1000,
  sortBy: 'price',
  order: 'ASC',
  page: 1,
  limit: 12,
});
```

---

## Notlar

- Hiçbir filtre gönderilmezse tüm ürünler varsayılan sıralama (`id ASC`) ve sayfalama (`page=1, limit=10`) ile döner.
- `price` alanı veritabanında `decimal` tipinde tutulduğundan yanıtta string olarak gelir (`"15000.00"`). Frontend'de `parseFloat()` ile sayıya çevirin.
- `search` parametresi hem `name` hem `description` alanlarında arama yapar.
- Filtrelerin hepsi opsiyoneldir, istediğiniz kombinasyonda kullanabilirsiniz.
- Swagger dokümantasyonu: `http://localhost:3000/api` adresinden tüm parametreleri interaktif olarak test edebilirsiniz.
