# Kurulum Talimatları

---

## Önce bunları yükleyin

- Node.js 18+ → https://nodejs.org
- PostgreSQL 14+ → https://www.postgresql.org (veya ücretsiz bulut: https://neon.tech)
- Arduino IDE 2+ → https://www.arduino.cc/en/software

---

## 1. Projeyi çıkarın

RAR dosyasını bir klasöre çıkarın, klasörün adı `sulama-sistem` olsun.

---

## 2. Veritabanı

**Neon veritabanı kullanildi:**
site linki: https://neon.com/
kullanci adi: ozgenural65@gmail.com
sifre: ozgenur2000
note: veritabani calisiyordur, ama ihtiyaciniz olursa yazdim. 



---

## 3. Backend

```bash
cd sulama-sistem/backend
npm install
cp .env.example .env
```

`.env` dosyası zaten hazır, DATABASE_URL ve JWT_SECRET dolu — bir şey değiştirmenize gerek yok.

Veritabanı tablolarını oluşturun:

```bash
npx prisma migrate deploy
```

Backend'i başlatın:

```bash
npm run start:dev
```

Terminalde `✓ Uygulama 3002 portunda başladı` yazısını görürseniz çalışıyor demektir.

---

## 4. Frontend

Yeni bir terminal açın:

```bash
cd sulama-sistem/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Tarayıcıdan `http://localhost:3000` adresine girin.

> Eğer backend başka bir makinede çalışıyorsa `.env.local` dosyasındaki `NEXT_PUBLIC_API_BASE_URL` değerini o makinenin IP'siyle güncelleyin.

---

## 5. Hesap ve cihaz oluşturun

1. `http://localhost:3000` adresine gidin
2. Kayıt olun (e-posta + şifre)
3. Giriş yapın
4. Dashboard'da **"+ Cihaz Ekle"** butonuna tıklayın
5. Cihaza bir isim verin (örn. `Bahçe 1`) ve ekleyin

**Cihaz ID'sini almak için** (ESP32'ye yazmanız gerekiyor):

```bash
cd sulama-sistem/backend
npx prisma studio
```

Tarayıcıda açılan sayfadan **Device** tablosuna gidin, eklediğiniz cihazın `id` değerini kopyalayın.

---

## 6. ESP32 firmware

Arduino IDE'yi açın.

Önce bu kütüphaneleri yükleyin (**Tools → Manage Libraries**):
- `OneWire`
- `DallasTemperature`
- `ArduinoJson`

ESP32 desteği yoksa **File → Preferences → Additional Board Manager URLs** alanına şunu ekleyin:
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```
Sonra **Tools → Board → Boards Manager**'dan `esp32` aratıp yükleyin.

`esp32/sulama_sistemi/sulama_sistemi.ino` dosyasını açın ve en üstteki 4 satırı doldurun:

```cpp
#define WIFI_SSID       "WIFI_ADINIZ"
#define WIFI_PASSWORD   "WIFI_SIFRENIZ"
#define SERVER_URL      "http://SUNUCU_IP:3002/api"
#define DEVICE_ID       "ADIM_5_TEN_KOPYALADIGINIZ_ID"
```

> Sunucu IP'sini öğrenmek için: Windows'ta `ipconfig`, Linux/macOS'ta `hostname -I`

**Pin bağlantıları:**

| Sensör | ESP32 |
|--------|-------|
| Toprak nemi (analog) | GPIO34 |
| DS18B20 sıcaklık (data) | GPIO4 |
| DS18B20 pull-up (4.7kΩ) | GPIO4 ile 3.3V arası |
| pH sensörü (analog) | GPIO32 |
| Röle | GPIO26 |

ESP32'yi USB'ye takın, **Tools → Board → ESP32 Dev Module** seçin, portu seçin ve yükleyin.

Yükleme bitince **Serial Monitor**'ü açın (baud: 115200). Şunları görüyorsanız çalışıyor:
```
WiFi baglandi
Veri gönderildi: 200
```

---

## 7. Her şeyin çalıştığını kontrol edin

1. Dashboard'da cihazı seçin, durum **çevrimiçi** görünmeli
2. Nem, sıcaklık, pH değerleri ekrana gelmeli
3. Nem %30'un altına düşünce pompa otomatik açılıyor
4. Pompa panelinden manuel açıp kapatabilirsiniz
5. Eşik aşımlarında uyarılar panelinde bildirim çıkıyor

---

## Otomasyon eşiklerini değiştirmek isterseniz

`backend/.env` dosyasında bu değerleri düzenleyin:

```env
MOISTURE_MIN=30   # altına düşünce pompa açılır
MOISTURE_MAX=60   # üstüne çıkınca pompa kapanır
TEMP_MAX=35       # üstünde sıcaklık uyarısı
PH_MIN=5.5
PH_MAX=7.5
```

Değiştirdikten sonra backend'i yeniden başlatın.

---

## Sorun yaşıyorsanız

| Hata | Ne yapmalı |
|------|-----------|
| `DATABASE_URL tanimlanmamis` | `.env` dosyasının `backend/` klasöründe olduğunu kontrol edin |
| `JWT_SECRET tanimlanmamis` | `.env` dosyasına JWT_SECRET ekleyin |
| ESP32 WiFi'ye bağlanmıyor | SSID ve şifreyi kontrol edin |
| ESP32 veri gönderemiyor | SERVER_URL'deki IP'nin doğru olduğunu kontrol edin, backend çalışıyor mu bakın |
| Dashboard boş kalıyor | `NEXT_PUBLIC_API_BASE_URL` değerini kontrol edin |
| Prisma hatası | DATABASE_URL'yi ve veritabanı bağlantısını kontrol edin |
| Pompa çalışmıyor | Röle bağlantısını ve GPIO26'yı kontrol edin |
