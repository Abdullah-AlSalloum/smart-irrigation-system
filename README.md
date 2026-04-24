# Akıllı Sulama Sistemi

ESP32 tabanlı, NestJS backend ve Next.js frontend kullanan akıllı sulama sistemi. Toprak nemi, sıcaklık ve pH sensörlerinden gelen verilere göre pompayı otomatik kontrol eder.

## Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- ESP32 geliştirme kartı
- Arduino IDE veya PlatformIO

## Kurulum

### 1. Depoyu klonlayın

```bash
git clone <repo-url>
cd sulama-sistem
```

### 2. Backend kurulumu

```bash
cd backend
npm install
cp .env.example .env
```

`.env` dosyasını açıp şu değerleri doldurun:

- `DATABASE_URL` — PostgreSQL bağlantı adresiniz
- `JWT_SECRET` — Güçlü rastgele bir anahtar oluşturun:

```bash
openssl rand -hex 48
```

Çıktıyı kopyalayıp `.env` dosyasındaki `JWT_SECRET` değerine yapıştırın.

```bash
npx prisma migrate deploy
npm run start:dev
```

Backend `http://localhost:3002` adresinde çalışır.

### 3. Frontend kurulumu

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local zaten doğru değerleri içeriyor
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışır.

### 4. ESP32 firmware kurulumu

1. Arduino IDE'yi açın
2. Gerekli kütüphaneleri yükleyin:
   - `OneWire`
   - `DallasTemperature`
   - `ArduinoJson`
3. `esp32/sulama_sistemi/sulama_sistemi.ino` dosyasını açın
4. Aşağıdaki sabitleri düzenleyin:
   ```cpp
   #define WIFI_SSID       "WIFI_ADINIZ"
   #define WIFI_PASSWORD   "WIFI_SIFRENIZ"
   #define SERVER_URL      "http://SUNUCU_IP:3002/api"
   #define DEVICE_ID       "sisteme-kayitli-cihaz-id"
   ```
   > **Not:** `DEVICE_ID` değerini, frontend dashboard üzerinden yeni bir cihaz ekledikten sonra elde edersiniz. Dashboard → Cihaz Ekle → oluşturulan cihazın ID'sini kopyalayın.
5. ESP32'ye yükleyin

## API Uç Noktaları

### Kimlik Doğrulama
| Metod | URL | Açıklama |
|-------|-----|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş yap, JWT token al |

### Cihazlar (JWT gerekli)
| Metod | URL | Açıklama |
|-------|-----|----------|
| GET | `/api/devices` | Tüm cihazları listele |
| POST | `/api/devices` | Yeni cihaz ekle |
| GET | `/api/devices/:id` | Cihaz detayı |
| PUT | `/api/devices/:id` | Cihaz güncelle |
| DELETE | `/api/devices/:id` | Cihaz sil |

### Sensörler
| Metod | URL | Açıklama |
|-------|-----|----------|
| POST | `/api/sensors?deviceId=` | Sensör verisi gönder (ESP32, JWT gerekmez) |
| GET | `/api/sensors/:deviceId` | Son sensör verileri (JWT gerekli) |
| GET | `/api/sensors/:deviceId/statistics` | İstatistikler (JWT gerekli) |

### Pompa Kontrolü
| Metod | URL | Açıklama |
|-------|-----|----------|
| GET | `/api/pump/status?deviceId=` | Pompa durumu sorgula (ESP32, JWT gerekmez) |
| GET | `/api/pump/status/:deviceId` | Pompa durumu (JWT gerekli) |
| POST | `/api/pump/on/:deviceId` | Pompayı aç (JWT gerekli) |
| POST | `/api/pump/off/:deviceId` | Pompayı kapat (JWT gerekli) |
| GET | `/api/pump/logs/:deviceId` | Pompa logları (JWT gerekli) |

### Uyarılar (JWT gerekli)
| Metod | URL | Açıklama |
|-------|-----|----------|
| GET | `/api/alerts/:deviceId` | Cihaz uyarılarını getir |
| PATCH | `/api/alerts/:id/read` | Uyarıyı okundu işaretle |
| PATCH | `/api/alerts/:deviceId/read-all` | Tüm uyarıları okundu işaretle |

## Pin Bağlantıları (ESP32)

| Sensör | GPIO |
|--------|------|
| Toprak nem (analog) | GPIO34 |
| DS18B20 sıcaklık | GPIO4 |
| pH sensörü (analog) | GPIO35 |
| Röle girişi | GPIO26 |
| Durum LED | GPIO2 |

## Otomasyon Kuralları

Sistem her 10 saniyede bir son sensör verilerini kontrol eder:

- Nem `< 30%` → Pompa otomatik açılır
- Nem `> 60%` → Pompa otomatik kapanır
- Sıcaklık `> 35°C` → Yüksek sıcaklık uyarısı
- pH `< 5.5` veya `> 7.5` → pH uyarısı

Eşik değerleri `.env` dosyasından yapılandırılabilir.

## Proje Yapısı

```
sulama-sistem/
├── backend/          # NestJS API sunucusu
│   ├── prisma/       # Veritabanı şeması ve migration'lar
│   └── src/
│       └── modules/  # auth, devices, sensors, pump, alerts, automation, websocket
├── frontend/         # Next.js web arayüzü
│   └── src/
│       ├── app/      # Sayfa bileşenleri
│       └── lib/      # API istemcileri, socket bağlantısı
└── esp32/            # Arduino firmware
    └── sulama_sistemi/
```

## WebSocket Olayları

Gerçek zamanlı veri için `http://localhost:3002` adresine bağlanın:

| Olay | Açıklama |
|------|----------|
| `sensor-data` | Yeni sensör verisi geldi |
| `pump-status` | Pompa durumu değişti |
| `alert` | Yeni uyarı oluştu |
| `device-offline` | Cihaz çevrimdışı oldu |
| `automation-action` | Otomasyon eylemi gerçekleşti |

Belirli bir cihazı dinlemek için `subscribe` olayını `{ deviceId }` ile gönderin.
