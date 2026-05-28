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

#define ONE_WIRE_BUS 5

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHT_PIN, DHT_TYPE);

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature soilTempSensor(&oneWire);

// Change these after calibration if needed
int dryValue = 3200;
int wetValue = 1300;

void setup() {
  Serial.begin(115200);

  Wire.begin(OLED_SDA, OLED_SCL);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (true);
  }

  dht.begin();
  soilTempSensor.begin();

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("KrishiAI Node");
  display.println("Starting...");
  display.display();

  delay(2000);
}

void loop() {
  float airTemp = dht.readTemperature();
  float humidity = dht.readHumidity();

  soilTempSensor.requestTemperatures();
  float soilTemp = soilTempSensor.getTempCByIndex(0);

  int rawSoil = analogRead(SOIL_PIN);

  int soilPercent = map(rawSoil, dryValue, wetValue, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  Serial.print("Air Temp: ");
  Serial.print(airTemp);
  Serial.print(" C  Humidity: ");
  Serial.print(humidity);
  Serial.print(" %  Soil Temp: ");
  Serial.print(soilTemp);
  Serial.print(" C  Soil Raw: ");
  Serial.print(rawSoil);
  Serial.print("  Soil Moisture: ");
  Serial.print(soilPercent);
  Serial.println("%");

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("KrishiAI Sensor");

  display.setCursor(0, 13);
  display.print("Air T: ");
  if (isnan(airTemp)) {
    display.print("ERR");
  } else {
    display.print(airTemp, 1);
    display.print(" C");
  }

  display.setCursor(0, 25);
  display.print("Hum  : ");
  if (isnan(humidity)) {
    display.print("ERR");
  } else {
    display.print(humidity, 1);
    display.print(" %");
  }

  display.setCursor(0, 37);
  display.print("SoilT: ");
  if (soilTemp == DEVICE_DISCONNECTED_C) {
    display.print("ERR");
  } else {
    display.print(soilTemp, 1);
    display.print(" C");
  }

  display.setCursor(0, 49);
  display.print("Moist: ");
  display.print(soilPercent);
  display.print("% R:");
  display.print(rawSoil);

  display.display();

  delay(2000);
}