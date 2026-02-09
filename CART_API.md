# Sepet (Cart) API Kullanımı

Backend başarıyla çalışıyor ve sepet sistemi aktif! İşte kullanabileceğiniz API endpoint'leri:

## 📋 Tüm Cart API Endpoint'leri

### 1️⃣ Sepete Ürün Ekle
**Endpoint:** `POST http://localhost:3000/cart/add`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Açıklama:** Giriş yapmış kullanıcının sepetine ürün ekler. Eğer ürün zaten sepette varsa miktarı artırır.

---

### 2️⃣ Sepeti Görüntüle
**Endpoint:** `GET http://localhost:3000/cart`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Ürün Adı",
        "price": 100,
        "imageUrl": "http://localhost:3000/uploads/..."
      }
    }
  ],
  "total": "200.00",
  "itemCount": 1
}
```

---

### 3️⃣ Sepetteki Ürün Miktarını Güncelle
**Endpoint:** `PATCH http://localhost:3000/cart/:id`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "quantity": 5
}
```

**Örnek:** `PATCH http://localhost:3000/cart/1` - 1 numaralı sepet öğesinin miktarını günceller

---

### 4️⃣ Sepetten Ürün Çıkar
**Endpoint:** `DELETE http://localhost:3000/cart/:id`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

**Örnek:** `DELETE http://localhost:3000/cart/1` - 1 numaralı ürünü sepetten kaldırır

---

### 5️⃣ Sepeti Temizle
**Endpoint:** `DELETE http://localhost:3000/cart`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

**Açıklama:** Kullanıcının sepetindeki tüm ürünleri temizler

---

### 6️⃣ Sepeti Onayla ve Satın Al (Stoktan Düş)
**Endpoint:** `POST http://localhost:3000/cart/checkout`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

**Response:**
```json
{
  "message": "Sipariş başarıyla tamamlandı",
  "items": [...],
  "total": "500.00"
}
```

**Açıklama:** 
- Sepetteki tüm ürünler için stok kontrolü yapar
- Stoklardan ürünleri düşer
- Sepeti temizler
- Toplam tutarı döner

---

## 🔐 Önemli Notlar

1. **Token Zorunlu:** Tüm cart endpoint'leri için kullanıcının giriş yapmış olması (Bearer token) gereklidir.

2. **Stok Kontrolü:** Her işlemde stok kontrolü yapılır. Stok yoksa hata döner.

3. **Kullanıcıya Özel:** Her kullanıcı sadece kendi sepetini görebilir ve yönetebilir.

---

## 🚀 Frontend Entegrasyon Örneği

### Sepete Ürün Ekleme (React/JavaScript)
```javascript
const addToCart = async (productId, quantity) => {
  try {
    const token = localStorage.getItem('token'); // veya state'den al
    
    const response = await fetch('http://localhost:3000/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Ürün sepete eklendi!');
      // Sepet ikonundaki sayıyı güncelle
    } else {
      alert(data.message || 'Hata oluştu');
    }
  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
  }
};
```

### Sepeti Görüntüleme
```javascript
const getCart = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Sepet:', data);
      // items: ürünler
      // total: toplam fiyat
      // itemCount: kaç farklı ürün var
      return data;
    }
  } catch (error) {
    console.error('Sepet yükleme hatası:', error);
  }
};
```

### Sipariş Tamamlama (Checkout)
```javascript
const checkout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/cart/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      alert(`Sipariş tamamlandı! Toplam: ${data.total} TL`);
      // Sepeti temizle ve sipariş sayfasına yönlendir
    } else {
      alert(data.message || 'Sipariş oluşturulamadı');
    }
  } catch (error) {
    console.error('Checkout hatası:', error);
  }
};
```

---

## ✅ Özellikler

- ✅ Kullanıcıya özel sepet sistemi
- ✅ Otomatik stok kontrolü
- ✅ Aynı ürün varsa miktar artırma
- ✅ Toplam fiyat hesaplama
- ✅ Sepet temizleme
- ✅ Checkout ile stoktan düşme
- ✅ JWT authentication ile güvenlik

---

## 🧪 Test Etmek İçin

1. Önce giriş yap ve token al: `POST /auth/login`
2. Token'ı alıp sepete ürün ekle: `POST /cart/add`
3. Sepeti görüntüle: `GET /cart`
4. Checkout yap: `POST /cart/checkout`

Backend hazır, frontend'de bu endpoint'leri kullanabilirsin! 🎉
