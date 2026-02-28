# DataTables Server-Side Processing - Backend API Dokümantasyonu

Bu dokümantasyon, backend'e eklenen jQuery DataTables server-side processing endpoint'lerini açıklar. Frontend tarafında DataTables konfigürasyonunu bu dokümana göre yapabilirsiniz.

---

## 📌 Genel Bilgi

Tüm DataTable endpoint'leri jQuery DataTables'ın **server-side processing** modunu destekler. DataTables, her sayfa değişikliğinde, arama yapıldığında veya sıralama değiştiğinde otomatik olarak backend'e AJAX isteği atar.

### Yanıt Formatı (Tüm Endpoint'ler İçin Aynı)

```json
{
  "draw": 1,
  "recordsTotal": 100,
  "recordsFiltered": 25,
  "data": [...]
}
```

| Alan | Açıklama |
|------|----------|
| `draw` | İstekle gelen draw değeri (güvenlik için geri döndürülür) |
| `recordsTotal` | Veritabanındaki toplam kayıt sayısı (filtresiz) |
| `recordsFiltered` | Arama/filtre sonrası kalan kayıt sayısı |
| `data` | O sayfada gösterilecek kayıtlar |

---

## 🔗 Endpoint'ler

### 1. Ürünler DataTable

```
GET /products/datatable
```

- **Yetki:** Public (token gerekmez)
- **Kolonlar:**

| Index | data | Açıklama | Aranabilir | Sıralanabilir |
|-------|------|----------|------------|---------------|
| 0 | `id` | Ürün ID | ✅ | ✅ |
| 1 | `name` | Ürün adı | ✅ | ✅ |
| 2 | `description` | Açıklama | ✅ | ✅ |
| 3 | `price` | Fiyat | ✅ | ✅ |
| 4 | `stock` | Stok | ✅ | ✅ |
| 5 | `imageUrl` | Resim URL | ❌ | ✅ |

**Frontend Örneği:**
```javascript
$('#productsTable').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: 'http://localhost:3000/products/datatable',
        type: 'GET'
    },
    columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'description' },
        { data: 'price' },
        { data: 'stock' },
        { 
            data: 'imageUrl',
            render: function(data) {
                if (data) {
                    return '<img src="' + data + '" width="50" height="50" />';
                }
                return 'Resim yok';
            },
            orderable: true,
            searchable: false
        }
    ],
    order: [[0, 'asc']], // Varsayılan: ID'ye göre artan
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/tr.json'
    }
});
```

---

### 2. Kullanıcının Siparişleri DataTable

```
GET /orders/datatable
```

- **Yetki:** `Authorization: Bearer <token>` (giriş yapmış kullanıcı)
- **Açıklama:** Giriş yapan kullanıcının kendi siparişlerini listeler
- **Kolonlar:**

| Index | data | Açıklama | Aranabilir | Sıralanabilir |
|-------|------|----------|------------|---------------|
| 0 | `id` | Sipariş ID | ✅ | ✅ |
| 1 | `product` | Ürün bilgisi (obje) | ✅ (product.name) | ❌ |
| 2 | `quantity` | Adet | ✅ | ✅ |
| 3 | `totalPrice` | Toplam tutar | ✅ | ✅ |
| 4 | `status` | Durum | ✅ | ✅ |
| 5 | `createdAt` | Oluşturulma tarihi | ❌ | ✅ |

**Frontend Örneği:**
```javascript
$('#myOrdersTable').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: 'http://localhost:3000/orders/datatable',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    },
    columns: [
        { data: 'id' },
        { 
            data: 'product',
            render: function(data) {
                return data ? data.name : '-';
            },
            searchable: true,
            orderable: false
        },
        { data: 'quantity' },
        { 
            data: 'totalPrice',
            render: function(data) {
                return parseFloat(data).toFixed(2) + ' ₺';
            }
        },
        { 
            data: 'status',
            render: function(data) {
                var badges = {
                    'PENDING': '<span class="badge bg-warning">Beklemede</span>',
                    'APPROVED': '<span class="badge bg-success">Onaylandı</span>',
                    'REJECTED': '<span class="badge bg-danger">Reddedildi</span>'
                };
                return badges[data] || data;
            }
        },
        { 
            data: 'createdAt',
            render: function(data) {
                return new Date(data).toLocaleDateString('tr-TR');
            }
        }
    ],
    order: [[5, 'desc']], // Varsayılan: en yeni sipariş önce
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/tr.json'
    }
});
```

---

### 3. Admin - Tüm Siparişler DataTable

```
GET /admin/orders/datatable
GET /admin/orders/datatable?status=PENDING
```

- **Yetki:** `Authorization: Bearer <admin_token>` (admin rolü gerekli)
- **Ek Parametre:** `status` (opsiyonel) — `PENDING`, `APPROVED`, `REJECTED` ile filtreleme
- **Kolonlar:** Kullanıcının sipariş tablosuyla aynı + kullanıcı bilgisi

| Index | data | Açıklama | Aranabilir | Sıralanabilir |
|-------|------|----------|------------|---------------|
| 0 | `id` | Sipariş ID | ✅ | ✅ |
| 1 | `user` | Kullanıcı bilgisi (obje) | ✅ (user.email, user.fullName) | ❌ |
| 2 | `product` | Ürün bilgisi (obje) | ✅ (product.name) | ❌ |
| 3 | `quantity` | Adet | ✅ | ✅ |
| 4 | `totalPrice` | Toplam tutar | ✅ | ✅ |
| 5 | `status` | Durum | ✅ | ✅ |
| 6 | `createdAt` | Tarih | ❌ | ✅ |

**Frontend Örneği:**
```javascript
// Status filtresi ile kullanım
var statusFilter = 'PENDING'; // veya null (tümü)

$('#adminOrdersTable').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: 'http://localhost:3000/admin/orders/datatable',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        data: function(d) {
            if (statusFilter) {
                d.status = statusFilter;
            }
        }
    },
    columns: [
        { data: 'id' },
        { 
            data: 'user',
            render: function(data) {
                return data ? (data.fullName || data.email) : '-';
            },
            searchable: true,
            orderable: false
        },
        { 
            data: 'product',
            render: function(data) {
                return data ? data.name : '-';
            },
            searchable: true,
            orderable: false
        },
        { data: 'quantity' },
        { 
            data: 'totalPrice',
            render: function(data) {
                return parseFloat(data).toFixed(2) + ' ₺';
            }
        },
        { 
            data: 'status',
            render: function(data) {
                var badges = {
                    'PENDING': '<span class="badge bg-warning">Beklemede</span>',
                    'APPROVED': '<span class="badge bg-success">Onaylandı</span>',
                    'REJECTED': '<span class="badge bg-danger">Reddedildi</span>'
                };
                return badges[data] || data;
            }
        },
        { 
            data: 'createdAt',
            render: function(data) {
                return new Date(data).toLocaleDateString('tr-TR');
            }
        }
    ],
    order: [[6, 'desc']],
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/tr.json'
    }
});

// Status filtresi değiştiğinde tabloyu yenile
$('#statusFilter').on('change', function() {
    statusFilter = $(this).val() || null;
    $('#adminOrdersTable').DataTable().ajax.reload();
});
```

---

### 4. Admin - Kullanıcılar DataTable

```
GET /users/datatable
```

- **Yetki:** `Authorization: Bearer <admin_token>` (admin rolü gerekli)
- **Not:** `password` alanı yanıtta **asla** dönmez
- **Kolonlar:**

| Index | data | Açıklama | Aranabilir | Sıralanabilir |
|-------|------|----------|------------|---------------|
| 0 | `id` | Kullanıcı ID | ✅ | ✅ |
| 1 | `email` | E-posta | ✅ | ✅ |
| 2 | `fullName` | Ad Soyad | ✅ | ✅ |
| 3 | `phone` | Telefon | ✅ | ✅ |
| 4 | `gender` | Cinsiyet | ✅ | ✅ |
| 5 | `role` | Rol | ✅ | ✅ |

**Frontend Örneği:**
```javascript
$('#usersTable').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: 'http://localhost:3000/users/datatable',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    },
    columns: [
        { data: 'id' },
        { data: 'email' },
        { data: 'fullName' },
        { data: 'phone' },
        { data: 'gender' },
        { 
            data: 'role',
            render: function(data) {
                if (data === 'admin') {
                    return '<span class="badge bg-danger">Admin</span>';
                }
                return '<span class="badge bg-primary">Müşteri</span>';
            }
        }
    ],
    order: [[0, 'asc']],
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/tr.json'
    }
});
```

---

## 📦 Frontend'e Gerekli CDN'ler

HTML `<head>` bölümüne eklenecek:

```html
<!-- DataTables CSS -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">

<!-- jQuery (DataTables için gerekli) -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- DataTables JS -->
<script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
```

## 📐 HTML Tablo Yapısı

Her DataTable için sadece `<thead>` ile boş bir tablo oluşturun. DataTables `<tbody>` içeriğini otomatik doldurur:

```html
<table id="productsTable" class="table table-striped" style="width:100%">
    <thead>
        <tr>
            <th>ID</th>
            <th>Ürün Adı</th>
            <th>Açıklama</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Resim</th>
        </tr>
    </thead>
</table>
```

---

## ⚙️ DataTables'ın Backend'e Gönderdiği Parametreler (Referans)

DataTables `serverSide: true` olduğunda, her istekte şu query parametrelerini otomatik gönderir:

| Parametre | Örnek | Açıklama |
|-----------|-------|----------|
| `draw` | `1` | İstek sayacı |
| `start` | `0` | Başlangıç satırı (offset) |
| `length` | `10` | Sayfa başına kayıt |
| `search[value]` | `laptop` | Global arama terimi |
| `order[0][column]` | `1` | Sıralama kolonu indexi |
| `order[0][dir]` | `asc` | Sıralama yönü |
| `columns[0][data]` | `id` | Kolon veri kaynağı |
| `columns[0][searchable]` | `true` | Kolon aranabilir mi |
| `columns[0][orderable]` | `true` | Kolon sıralanabilir mi |
| `columns[0][search][value]` | `` | Kolon bazlı arama |

> Bu parametrelerin tümü backend tarafında otomatik olarak parse edilir. Frontend'de ekstra bir şey yapmanıza gerek yok — sadece `columns` dizisindeki `data` değerlerinin yukarıdaki tablolardaki alan adlarıyla eşleştiğinden emin olun.

---

## 🔄 Tabloyu Yenileme

Herhangi bir işlemden sonra (ekleme, silme, güncelleme) tabloyu yenilemek için:

```javascript
$('#productsTable').DataTable().ajax.reload(null, false);
// İkinci parametre false = şu anki sayfada kal
// true = ilk sayfaya dön
```

---

## ⚠️ Önemli Notlar

1. **Mevcut endpoint'ler aynen çalışıyor** — `/products`, `/orders`, `/admin/orders`, `/users` gibi eski endpoint'ler değişmedi. DataTable endpoint'leri ayrı olarak `/datatable` yolunda eklendi.

2. **CORS aktif** — Backend'de CORS açık, farklı porttan gelen istekler kabul edilir.

3. **Token gönderimi** — Auth gerektiren endpoint'lerde `headers` içinde `Authorization: Bearer <token>` gönderilmeli.

4. **"Tümünü Göster"** — DataTables'da `length: -1` seçildiğinde backend tüm kayıtları döner.

5. **SQL Injection koruması** — Sadece izin verilen kolon adları sıralama ve arama için kullanılır.
