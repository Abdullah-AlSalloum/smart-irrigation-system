# Smart Irrigation System - Backend (NestJS)

Akıllı Sulama Sistemi arka ucu. NestJS + Prisma + PostgreSQL ile inşa edilmiştir.

## Özellikler / Features

✅ JWT tabanlı kimlik doğrulama  
✅ Sensör verisi işleme ve depolama  
✅ Real-time WebSocket güncellemeleri  
✅ Otomatik pompa kontrolü  
✅ Uyarı ve bildirim sistemi  
✅ Çevrimdışı cihaz tespiti  
✅ REST API  

## Teknolojiler / Tech Stack

- **Framework**: NestJS 10+
- **ORM**: Prisma
- **Veritabanı**: PostgreSQL
- **Real-time**: Socket.io
- **Kimlik Doğrulama**: JWT + Passport
- **Doğrulama**: class-validator
- **Şifreleme**: bcrypt
- **Scheduled Tasks**: @nestjs/schedule

## Kurulum / Installation

### 1. Gereksinimler / Prerequisites

```bash
Node.js >= 18
PostgreSQL >= 12
npm veya yarn
```

### 2. Paketleri Yükle / Install Dependencies

```bash
npm install
```

### 3. Veritabanını Yapılandır / Configure Database

`.env` dosyasını düzenle:

```env
# Veritabanı
DATABASE_URL="postgresql://postgres:password@localhost:5432/sulama_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="24h"

# Uygulama
PORT=3000
NODE_ENV=development

# ESP32
ESP32_API_TIMEOUT=5000
SENSOR_DATA_INTERVAL=5000

# Otomasyon Eşikleri
MOISTURE_MIN_THRESHOLD=30
MOISTURE_MAX_THRESHOLD=60
PH_MIN_THRESHOLD=5.5
PH_MAX_THRESHOLD=7.5
TEMPERATURE_MAX_THRESHOLD=35
```

### 4. Veritabanı Migrasyonları Çalıştır / Run Database Migrations

```bash
# Şemayı oluştur
npx prisma migrate dev --name init

# Prisma Client oluştur
npx prisma generate
```

### 5. Uygulamayı Başlat / Start Application

```bash
# Geliştirme modunda
npm run start:dev

# Üretim modunda
npm run build
npm run start:prod
```

Uygulama `http://localhost:3000` adresinde çalışacak

## Veritabanı Schema / Database Schema

### Users (Kullanıcılar)
- `id`: UUID
- `email`: Benzersiz email
- `password`: Şifrelenmiş şifre
- `name`: Kullanıcı adı
- `createdAt`, `updatedAt`: Zaman damgaları

### Devices (Cihazlar)
- `id`: UUID
- `name`: Cihaz adı
- `status`: online, offline, error
- `lastSeen`: Son görülme zamanı
- `userId`: Sahibi olan kullanıcı

### SensorData (Sensör Verisi)
- `id`: UUID
- `deviceId`: İlgili cihaz
- `moisture`: Toprak nemi (0-100%)
- `temperature`: Sıcaklık (°C)
- `ph`: pH seviyesi (0-14)
- `createdAt`: Oluşturulma zamanı

### PumpLogs (Pompa Logları)
- `id`: UUID
- `deviceId`: İlgili cihaz
- `action`: ON veya OFF
- `reason`: İşlemin nedeni
- `timestamp`: İşlem zamanı

### Alerts (Uyarılar)
- `id`: UUID
- `deviceId`: İlgili cihaz
- `type`: Uyarı türü (moisture, temperature, ph)
- `message`: Uyarı mesajı
- `severity`: info, warning, critical
- `isRead`: Okundu mu?
- `createdAt`: Oluşturulma zamanı

## API Endpoints

### Kimlik Doğrulama / Authentication

#### Kayıt / Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Ahmet",
  "password": "password123"
}

Response: 201 Created
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Ahmet"
  }
}
```

#### Giriş / Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

### Cihazlar / Devices

#### Yeni Cihaz Oluştur / Create Device
```bash
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bahçe Sulama Sistemi"
}

Response: 201 Created
{
  "id": "device-uuid",
  "name": "Bahçe Sulama Sistemi",
  "status": "offline",
  "lastSeen": "2024-04-22T10:00:00Z"
}
```

#### Cihazları Listele / Get User Devices
```bash
GET /api/devices
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "device-uuid",
    "name": "Bahçe Sulama Sistemi",
    "status": "online",
    "lastSeen": "2024-04-22T10:15:00Z"
  }
]
```

#### Cihazı Getir / Get Device
```bash
GET /api/devices/:deviceId
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "device-uuid",
  "name": "Bahçe Sulama Sistemi",
  "status": "online",
  "lastSeen": "2024-04-22T10:15:00Z"
}
```

#### Cihazı Güncelle / Update Device
```bash
PUT /api/devices/:deviceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Yeni Adı",
  "status": "online"
}

Response: 200 OK
```

#### Cihazı Sil / Delete Device
```bash
DELETE /api/devices/:deviceId
Authorization: Bearer <token>

Response: 204 No Content
```

### Sensör Verisi / Sensor Data

#### Sensör Verisi Gönder / Send Sensor Data (ESP32 tarafından)
```bash
POST /api/sensors?deviceId=device-uuid
Content-Type: application/json

{
  "moisture": 45.5,
  "temperature": 28.3,
  "ph": 6.8
}

Response: 201 Created
{
  "id": "sensor-data-uuid",
  "deviceId": "device-uuid",
  "moisture": 45.5,
  "temperature": 28.3,
  "ph": 6.8,
  "createdAt": "2024-04-22T10:20:00Z"
}
```

#### Son Sensör Verilerini Getir / Get Latest Sensor Data
```bash
GET /api/sensors/:deviceId?limit=100
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "sensor-data-uuid",
    "deviceId": "device-uuid",
    "moisture": 45.5,
    "temperature": 28.3,
    "ph": 6.8,
    "createdAt": "2024-04-22T10:20:00Z"
  }
]
```

#### Sensör İstatistikleri / Get Sensor Statistics
```bash
GET /api/sensors/:deviceId/statistics?hours=24
Authorization: Bearer <token>

Response: 200 OK
{
  "averageMoisture": 50.2,
  "averageTemperature": 27.8,
  "averagePh": 6.9,
  "dataCount": 288,
  "latestData": { ... }
}
```

### Pompa Kontrolü / Pump Control

#### Pompayı Aç / Turn Pump ON
```bash
POST /api/pump/on/:deviceId
Authorization: Bearer <token>

Response: 200 OK
{
  "deviceId": "device-uuid",
  "status": "ON",
  "lastAction": "2024-04-22T10:25:00Z",
  "lastReason": "Manuel kontrol - Pompa açıldı"
}
```

#### Pompayı Kapat / Turn Pump OFF
```bash
POST /api/pump/off/:deviceId
Authorization: Bearer <token>

Response: 200 OK
{
  "deviceId": "device-uuid",
  "status": "OFF",
  "lastAction": "2024-04-22T10:26:00Z",
  "lastReason": "Manuel kontrol - Pompa kapatıldı"
}
```

#### Pompa Durumunu Getir / Get Pump Status
```bash
GET /api/pump/status/:deviceId
Authorization: Bearer <token>

Response: 200 OK
{
  "deviceId": "device-uuid",
  "status": "ON",
  "lastAction": "2024-04-22T10:25:00Z",
  "lastReason": "Manual control - Pump turned on"
}
```

#### Pompa Durumunu Kontrol Et / Check Pump Status (ESP32 için)
```bash
POST /api/pump/status?deviceId=device-uuid

Response: 200 OK
{
  "deviceId": "device-uuid",
  "status": "ON",
  "lastAction": "2024-04-22T10:25:00Z",
  "lastReason": "Automatic control - Low moisture"
}
```

#### Pompa Loglarını Getir / Get Pump Logs
```bash
GET /api/pump/logs/:deviceId?limit=50
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "log-uuid",
    "deviceId": "device-uuid",
    "action": "ON",
    "reason": "Automatic control - Low moisture",
    "timestamp": "2024-04-22T10:25:00Z"
  }
]
```

## WebSocket Events

### Server Tarafından Gönderilen Events / Server Emits

#### Sensör Verisi / Sensor Data
```javascript
socket.on('sensor-data', (data) => {
  console.log(`Nem: ${data.moisture}%`);
  console.log(`Sıcaklık: ${data.temperature}°C`);
  console.log(`pH: ${data.ph}`);
});
```

#### Pompa Durumu / Pump Status
```javascript
socket.on('pump-status', (data) => {
  console.log(`Pompa: ${data.status}`);
  console.log(`Neden: ${data.lastReason}`);
});
```

#### Uyarı / Alert
```javascript
socket.on('alert', (data) => {
  console.log(`${data.severity}: ${data.message}`);
});
```

#### Otomasyon Aksiyonu / Automation Action
```javascript
socket.on('automation-action', (data) => {
  console.log(`${data.type} otomatik kontrol: ${data.action}`);
});
```

### Client Tarafından Gönderilen Events / Client Emits

#### Cihaza Abone Ol / Subscribe to Device
```javascript
socket.emit('subscribe', { deviceId: 'device-uuid' });

// Response
socket.on('subscribed', (data) => {
  console.log(`${data.deviceId} cihazına abone olundu`);
});
```

#### Abonelikten Çık / Unsubscribe
```javascript
socket.emit('unsubscribe', { deviceId: 'device-uuid' });
```

## Otomasyon Kuralları / Automation Rules

### Nemlilik Kontrolü / Moisture Control
- **Nem < 30%**: Pompa otomatik AÇILIR
- **Nem > 60%**: Pompa otomatik KAPANIR

### Uyarılar / Alerts
- **pH < 5.5 veya > 7.5**: Uyarı oluşturulur
- **Sıcaklık > 35°C**: Bildirim gönderilir
- **Cihaz 2 dakikadan fazla veri göndermezse**: Çevrimdışı olarak işaretlenir

## cURL Örnekleri / cURL Examples

### Kayıt Ol
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Ahmet",
    "password": "password123"
  }'
```

### Giriş Yap
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Cihaz Oluştur
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bahçe Sulama"
  }'
```

### Sensör Verisi Gönder
```bash
curl -X POST "http://localhost:3000/api/sensors?deviceId=YOUR_DEVICE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "moisture": 45.5,
    "temperature": 28.3,
    "ph": 6.8
  }'
```

### Pompayı Aç
```bash
curl -X POST http://localhost:3000/api/pump/on/YOUR_DEVICE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Dosya Yapısı / Project Structure

```
backend/
├── src/
│   ├── common/
│   │   └── database.service.ts
│   ├── config/
│   │   └── config.service.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── auth.module.ts
│   │   ├── sensors/
│   │   ├── devices/
│   │   ├── pump/
│   │   ├── automation/
│   │   └── websocket/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

## Geliştirme / Development

### Watch Mode
```bash
npm run start:dev
```

### Linting
```bash
npm run lint
```

### Formatı Düzelt
```bash
npm run format
```

## Sorun Giderme / Troubleshooting

### Veritabanı Bağlantı Hatası
```
ERROR: role "postgres" does not exist
```
PostgreSQL'de "postgres" kullanıcısını oluşturun veya `.env` dosyasında başka bir kullanıcı kullanın.

### Port Zaten Kullanımda
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti :3000 | xargs kill -9
```

### Prisma Client Hatası
```bash
npx prisma generate
npm install
```

## Üretim Dağıtımı / Production Deployment

### 1. Build İşlemini Yapma
```bash
npm run build
```

### 2. Üretim Veritabanını Hazırlama
```bash
# .env.production oluştur ve veritabanı URL'sini güncelle
npx prisma migrate deploy
```

### 3. Uygulamayı Başlatma
```bash
NODE_ENV=production npm run start
```

### Nginx Reverse Proxy Yapılandırması
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Lisans / License

MIT

## İletişim / Contact

Sorularınız için destek alın: support@example.com
