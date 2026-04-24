/*
  Akilli Sulama - ESP32 firmware

  Pin baglantilari
  - Toprak nem sensoru (analog): GPIO34
  - DS18B20 veri: GPIO4 (3.3V'a 4.7k pull-up)
  - pH analog cikis: GPIO35
  - Role girisi: GPIO26 (aktif LOW)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// Yuklemeden once bu alanlari doldurun
#define WIFI_SSID       "WIFI_ADI"
#define WIFI_PASSWORD   "WIFI_SIFRESI"
#define SERVER_URL      "http://192.168.1.50:3002/api"
#define DEVICE_ID       "CIHAZ_ID_BURAYA"

#define PIN_MOISTURE    34
#define PIN_TEMP        4
#define PIN_PH          35
#define PIN_RELAY       26
#define PIN_LED         2

#define SENSOR_INTERVAL_MS   5000
#define PUMP_CHECK_MS        15000

// Kalibrasyon
#define MOISTURE_DRY    3200
#define MOISTURE_WET    1200

#define PH_OFFSET       0.0f

OneWire oneWire(PIN_TEMP);
DallasTemperature tempSensor(&oneWire);

unsigned long lastSensorTime = 0;
unsigned long lastPumpCheckTime = 0;
bool pumpIsOn = false;

float readMoisture() {
  int raw = analogRead(PIN_MOISTURE);
  float pct = map(raw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
  pct = constrain(pct, 0.0f, 100.0f);
  Serial.printf("[NEM] raw=%d yuzde=%.1f%%\n", raw, pct);
  return pct;
}

float readTemperature() {
  tempSensor.requestTemperatures();
  float temp = tempSensor.getTempCByIndex(0);
  if (temp == DEVICE_DISCONNECTED_C) {
    Serial.println("[SICAKLIK] sensor bagli degil, varsayilan deger kullaniliyor");
    return 25.0f;
  }
  Serial.printf("[SICAKLIK] %.1f C\n", temp);
  return temp;
}

float readPH() {
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_PH);
    delay(10);
  }
  float raw = sum / 10.0f;

  float voltage = raw * (3.3f / 4095.0f);

  float ph = 7.0f - ((voltage - 1.65f) / 0.18f) + PH_OFFSET;
  ph = constrain(ph, 0.0f, 14.0f);
  Serial.printf("[PH] raw=%.0f voltaj=%.3fV ph=%.2f\n", raw, voltage, ph);
  return ph;
}

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("[WIFI] baglaniyor");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] baglandi: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(PIN_LED, HIGH);
  } else {
    Serial.println("\n[WIFI] baglanti basarisiz, tekrar denenecek");
    digitalWrite(PIN_LED, LOW);
  }
}

void sendSensorData(float moisture, float temperature, float ph) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] wifi yok, sensor verisi gonderilemedi");
    return;
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/sensors?deviceId=" + DEVICE_ID;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["moisture"]    = round(moisture * 10) / 10.0;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["ph"]          = round(ph * 100) / 100.0;

  String body;
  serializeJson(doc, body);

  Serial.printf("[HTTP] POST %s\n", url.c_str());

  int code = http.POST(body);
  if (code > 0) {
    Serial.printf("[HTTP] durum=%d\n", code);
  } else {
    Serial.printf("[HTTP] hata=%s\n", http.errorToString(code).c_str());
  }
  http.end();
}

void checkPumpStatus() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(SERVER_URL) + "/pump/status?deviceId=" + DEVICE_ID;
  http.begin(url);

  Serial.printf("[POMPA] GET %s\n", url.c_str());

  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    Serial.printf("[POMPA] yanit=%s\n", payload.c_str());

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (!err) {
      const char* status = doc["status"];
      bool shouldBeOn = (strcmp(status, "ON") == 0);

      if (shouldBeOn != pumpIsOn) {
        pumpIsOn = shouldBeOn;
        digitalWrite(PIN_RELAY, pumpIsOn ? LOW : HIGH);
        Serial.printf("[POMPA] degisti=%s\n", pumpIsOn ? "ACIK" : "KAPALI");
      } else {
        Serial.printf("[POMPA] ayni=%s\n", pumpIsOn ? "ACIK" : "KAPALI");
      }
    }
  } else {
    Serial.printf("[POMPA] http durum=%d\n", code);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("Akilli sulama firmware basladi...");

  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_RELAY, HIGH);
  digitalWrite(PIN_LED, LOW);

  tempSensor.begin();
  ensureWiFi();

  lastSensorTime = 0;
  lastPumpCheckTime = 0;
}

void loop() {
  ensureWiFi();

  unsigned long now = millis();

  if (now - lastSensorTime >= SENSOR_INTERVAL_MS) {
    lastSensorTime = now;

    Serial.println("\n--- Sensor dongusu ---");
    float moisture    = readMoisture();
    float temperature = readTemperature();
    float ph          = readPH();
    sendSensorData(moisture, temperature, ph);
  }

  if (now - lastPumpCheckTime >= PUMP_CHECK_MS) {
    lastPumpCheckTime = now;
    Serial.println("\n--- Pompa dongusu ---");
    checkPumpStatus();
  }

  delay(100);
}
