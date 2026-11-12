#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_SDA 21
#define OLED_SCL 22

#define SOIL_PIN 34
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define ONE_WIRE_BUS 16

// ==================== CONFIGURATION ====================
// Option A: Provide a local, untracked "config.h" in this folder with:
//   #define WIFI_SSID "YourNetworkName"
//   #define WIFI_PASSWORD "YourPassword"
//   #define BACKEND_URL "http://192.168.x.x:8000/api/sensor/ingest"
//   #define SENSOR_TOKEN "krishi_sensor_secure_2026"
//   #define DEVICE_ID "krishiai-node-1"
//
// Option B: Fill in credentials in the fallback block below if not using config.h.
#if __has_include("config.h")
  #include "config.h"
#endif

#ifndef WIFI_SSID
  #define WIFI_SSID ""  // [ACTION REQUIRED] Enter your Wi-Fi SSID
#endif

#ifndef WIFI_PASSWORD
  #define WIFI_PASSWORD ""  // [ACTION REQUIRED] Enter your Wi-Fi Password
#endif

#ifndef BACKEND_URL
  // [ACTION REQUIRED] Replace <COMPUTER_LAN_IP> with your computer's LAN IP
  #define BACKEND_URL "http://<COMPUTER_LAN_IP>:8000/api/sensor/ingest"
#endif

#ifndef SENSOR_TOKEN
  #define SENSOR_TOKEN "krishi_sensor_secure_2026" // Must match backend SENSOR_INGEST_TOKEN if set
#endif

#ifndef DEVICE_ID
  #define DEVICE_ID "krishiai-node-1"
#endif
// ========================================================

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
bool hasOled = false;
DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature soilTempSensor(&oneWire);

// Calibration values (SOIL_AIR_VALUE = dry, SOIL_WATER_VALUE = wet)
const int SOIL_AIR_VALUE   = 3200;
const int SOIL_WATER_VALUE = 1300;

unsigned long lastPostTime = 0;
const unsigned long POST_INTERVAL_MS = 15000; // Post every 15 seconds

void connectWiFi() {
  if (strlen(WIFI_SSID) == 0) {
    Serial.println("\n[WiFi] SSID is empty! Please configure WIFI_SSID in config.h or firmware.");
    if (hasOled) {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("WiFi Config Error:");
      display.println("SSID not set!");
      display.display();
    }
    return;
  }

  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  if (hasOled) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Connecting to WiFi...");
    display.println(WIFI_SSID);
    display.display();
  }

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    if (hasOled) {
      display.println("Connected!");
      display.println(WiFi.localIP().toString());
      display.display();
    }
  } else {
    Serial.println("\nWiFi Connection Failed!");
    if (hasOled) {
      display.println("WiFi Failed!");
      display.display();
    }
  }
  delay(1500);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(OLED_SDA, OLED_SCL);

  hasOled = display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!hasOled) {
    Serial.println("OLED not found (running in headless serial/WiFi mode)");
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("KrishiAI Node");
    display.println("Starting...");
    display.display();
  }

  dht.begin();
  soilTempSensor.begin();

  delay(1000);
  connectWiFi();
}

void sendReading(float airTemp, float humidity, float soilTemp, int soilPercent, int rawSoil) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[HTTP] Send skipped: WiFi not connected.");
      return;
    }
  }

  if (String(BACKEND_URL).indexOf("<COMPUTER_LAN_IP>") != -1 || strlen(BACKEND_URL) == 0) {
    Serial.println("[HTTP] Send skipped: BACKEND_URL contains <COMPUTER_LAN_IP>. Set your LAN IP in config.h or firmware.");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  if (SENSOR_TOKEN && strlen(SENSOR_TOKEN) > 0) {
    http.addHeader("X-Sensor-Token", SENSOR_TOKEN);
  }

  // Create JSON string manually to avoid ArduinoJson library dependency
  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  if (!isnan(airTemp)) {
    json += "\"temperature\":" + String(airTemp, 1) + ",";
  }
  if (!isnan(humidity)) {
    json += "\"humidity\":" + String(humidity, 1) + ",";
  }
  if (soilTemp != DEVICE_DISCONNECTED_C) {
    json += "\"soil_temperature\":" + String(soilTemp, 1) + ",";
  }
  json += "\"soil_moisture\":" + String(soilPercent) + ",";
  json += "\"raw_moisture\":" + String(rawSoil);
  json += "}";

  Serial.print("POST -> ");
  Serial.println(json);

  int httpCode = http.POST(json);
  if (httpCode > 0) {
    Serial.print("Response: ");
    Serial.println(httpCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }
  http.end();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  float airTemp = dht.readTemperature();
  float humidity = dht.readHumidity();

  soilTempSensor.requestTemperatures();
  float soilTemp = soilTempSensor.getTempCByIndex(0);

  int rawSoil = analogRead(SOIL_PIN);

  int soilPercent = map(rawSoil, SOIL_AIR_VALUE, SOIL_WATER_VALUE, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // Print locally
  Serial.print("Air Temp: ");
  Serial.print(airTemp);
  Serial.print(" C | Hum: ");
  Serial.print(humidity);
  Serial.print(" % | Soil Temp: ");
  Serial.print(soilTemp);
  Serial.print(" C | Soil Raw: ");
  Serial.print(rawSoil);
  Serial.print(" | Soil: ");
  Serial.print(soilPercent);
  Serial.println("%");

  // Update OLED display if present
  if (hasOled) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    
    display.setCursor(0, 0);
    display.print("WiFi: ");
    display.println(WiFi.status() == WL_CONNECTED ? "OK" : "DISCONN");

    display.setCursor(0, 12);
    display.print("Air T: ");
    if (isnan(airTemp)) display.print("ERR");
    else { display.print(airTemp, 1); display.print(" C"); }

    display.setCursor(0, 24);
    display.print("Hum  : ");
    if (isnan(humidity)) display.print("ERR");
    else { display.print(humidity, 1); display.print(" %"); }

    display.setCursor(0, 36);
    display.print("SoilT: ");
    if (soilTemp == DEVICE_DISCONNECTED_C) display.print("ERR");
    else { display.print(soilTemp, 1); display.print(" C"); }

    display.setCursor(0, 48);
    display.print("Moist: ");
    display.print(soilPercent);
    display.print("% (R:");
    display.print(rawSoil);
    display.println(")");
    
    display.display();
  }

  // Send data to backend at regular intervals
  if (millis() - lastPostTime >= POST_INTERVAL_MS) {
    sendReading(airTemp, humidity, soilTemp, soilPercent, rawSoil);
    lastPostTime = millis();
  }

  delay(2000);
}