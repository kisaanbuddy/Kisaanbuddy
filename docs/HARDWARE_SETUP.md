# KisaanBuddy — Hardware Setup Guide (ESP32 Sensor Node)

Yeh guide ESP32 sensor node ko banane, flash karne, aur KisaanBuddy backend se jodne ke liye hai.
Data flow:

```
ESP32 sensors  --HTTP POST-->  /api/sensor/ingest  (FastAPI backend)
Crop Predictor page  --GET-->  /api/sensor/latest   (auto-fills Temp + Humidity)
```

Shopping list ke liye dekho: `SHOPPING_LIST.md`.

---

## 1. Wiring (connections)

> Sab sensors **3V3** pe chalenge (5V mat do — ESP32 ke GPIO pins 3.3V hain).
> ESP32 board: **ESP32 DevKit V1 (38-pin)**, Arduino board name **"ESP32 Dev Module"**.

| Sensor | Sensor pin | ESP32 pin | Note |
|--------|-----------|-----------|------|
| DHT22 | VCC | 3V3 | |
| DHT22 | DATA | **GPIO 4** | module mein pull-up built-in hai |
| DHT22 | GND | GND | |
| DS18B20 (soil temp) | VCC (red) | 3V3 | |
| DS18B20 | DATA (yellow) | **GPIO 5** | **4.7kΩ resistor** DATA aur 3V3 ke beech (pull-up) |
| DS18B20 | GND (black) | GND | |
| Capacitive soil moisture | VCC | 3V3 | |
| Capacitive soil moisture | AOUT | **GPIO 34** | analog, input-only pin |
| Capacitive soil moisture | GND | GND | |
| OLED SSD1306 (optional) | VCC | 3V3 | |
| OLED | GND | GND | |
| OLED | SDA | **GPIO 21** | I2C default |
| OLED | SCL | **GPIO 22** | I2C default |

**Power:** ESP32 ko micro-USB se laptop/charger/power-bank pe chalao. Sab GND aapas mein common hone chahiye (breadboard ki ek hi ground rail use karo).

> Note: GPIO 34 sirf input hai (output nahi de sakta) — soil moisture ke analog read ke liye perfect hai.

---

## 2. Software setup (Arduino IDE)

1. **Arduino IDE** install karo (free): https://www.arduino.cc/en/software
2. **ESP32 board support** add karo:
   - `File → Preferences → Additional Boards Manager URLs` mein yeh paste karo:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - `Tools → Board → Boards Manager` → search **"esp32"** → **esp32 by Espressif** install karo.
3. **Board select:** `Tools → Board → ESP32 Arduino → ESP32 Dev Module`.
4. **USB driver:** agar board detect na ho to CP2102 ya CH340 driver install karo (free download). Phir `Tools → Port` mein COM port chuno.

### Libraries (Library Manager se install karo — `Tools → Manage Libraries`)

Search karke install karo:

- **DHT sensor library** (by Adafruit)  → + **Adafruit Unified Sensor** (dependency, saath install ho jaata hai)
- **OneWire** (by Paul Stoffregen)
- **DallasTemperature** (by Miles Burton)
- **Adafruit SSD1306**  → + **Adafruit GFX Library** (dependency)

WiFi aur HTTPClient ESP32 core ke saath aate hain — alag install nahi karna.

---

## 3. Firmware configure karo

`hardware/kisaanbuddy_sensor_node.ino` kholo aur upar **CONFIG** block mein 4 cheezein badlo:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.7:8000/api/sensor/ingest";
const char* SENSOR_TOKEN  = "";   // backend ka SENSOR_INGEST_TOKEN set kiya ho to wahi daalo
```

> **Important:** ESP32 aur backend wala computer **same WiFi** pe hone chahiye.
> `BACKEND_URL` mein `127.0.0.1` / `localhost` **mat** likho — woh ESP32 ke khud ke liye hoga.
> Apne computer ka LAN IP daalo (neeche step 4).

---

## 4. Backend ka IP dhoondo

Backend wale computer pe:

- **Windows:** `ipconfig` chalao → **IPv4 Address** dekho (jaise `192.168.1.7`).
- **Mac/Linux:** `ifconfig` ya `ip addr` → `inet 192.168.x.x`.

Yahi IP `BACKEND_URL` mein daalo, port `8000` ke saath.

---

## 5. Backend chalao

```bash
cd backend
# pehli baar:  pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

> `--host 0.0.0.0` zaroori hai taaki ESP32 (dusra device) backend tak pahunch sake.
> Agar Windows firewall poochhe to **Allow access** karo (private network).

(Optional) Ingest pe token lagana ho to backend chalane se pehle:
```bash
# Windows PowerShell
$env:SENSOR_INGEST_TOKEN="mysecret123"
# Mac/Linux
export SENSOR_INGEST_TOKEN="mysecret123"
```
…aur wahi `mysecret123` firmware ke `SENSOR_TOKEN` mein bhi daalo.

---

## 6. Flash karo

1. ESP32 ko USB se jodo, `Tools → Port` mein sahi COM port chuno.
2. **Upload** (→ arrow) dabao. "Connecting..." aaye to board ka **BOOT** button daba ke rakho (kuch boards pe zaroori hota hai).
3. `Tools → Serial Monitor` kholo, baud **115200**. Yeh dikhna chahiye:
   ```
   WiFi OK  IP: 192.168.1.20
   T=27.4C  H=61.0%  soilT=24.8C  soil=38% (raw 2450)
   POST -> HTTP 200
   ```

---

## 7. Soil moisture calibrate karo

Default values theek-thaak hain, par accurate % ke liye:

1. Probe ko **sukha (hawa mein)** rakho → Serial Monitor mein `raw` value note karo → yeh **`SOIL_AIR_VALUE`** (0%).
2. Probe ko **paani ke glass** mein (sirf white line tak, electronics nahi dubana) → `raw` note karo → yeh **`SOIL_WATER_VALUE`** (100%).
3. Dono numbers firmware ke calibration block mein daalo aur dobara flash karo.

```cpp
const int SOIL_AIR_VALUE   = 3200;   // tumhara dry reading
const int SOIL_WATER_VALUE = 1300;   // tumhara wet reading
```

---

## 8. Test karo (end-to-end)

**A. Backend seedha test (curl):**
```bash
curl -X POST http://localhost:8000/api/sensor/ingest \
  -H "Content-Type: application/json" \
  -d "{\"device_id\":\"kisaanbuddy-node-1\",\"temperature\":27.5,\"humidity\":61,\"soil_moisture\":40}"

curl http://localhost:8000/api/sensor/latest
```
`latest` mein tumhara data wapas aana chahiye.

**B. Frontend:**
1. `frontend-next` chalao: `npm run dev`
2. **Crop Predictor** page kholo → naya **"Read live data from ESP32"** (neela) button dikhega.
3. Click karo → Temperature aur Humidity sliders sensor ki live value se set ho jaayenge. Soil moisture/temp niche info mein dikhega.

API docs: http://localhost:8000/docs → **Sensors** section mein saare endpoints.

---

## 9. Naye endpoints (reference)

| Method | Path | Kaam |
|--------|------|------|
| POST | `/api/sensor/ingest` | ESP32 reading bhejta hai |
| GET | `/api/sensor/latest` | Sabse nayi reading (frontend isse padhta hai). `?device_id=` optional |
| GET | `/api/sensor/history?device_id=kisaanbuddy-node-1` | Recent readings (debug/graph) |
| GET | `/api/sensor/health` | Kaunse devices online hain |

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| Serial pe `WiFi FAILED` | SSID/password check karo; 2.4GHz WiFi use karo (ESP32 5GHz support nahi karta) |
| `POST failed` / connection refused | Backend `--host 0.0.0.0` pe chal raha hai? IP sahi hai? Same WiFi? Firewall allow? |
| `T=nan H=nan` | DHT22 wiring/pull-up check; module ko 3V3 do, GPIO 4 pe DATA |
| `soilT=-127` | DS18B20 ka 4.7kΩ pull-up missing; DATA GPIO 5 pe |
| Soil % hamesha 0 ya 100 | calibration values galat — step 7 dobara karo |
| OLED blank | I2C address `0x3C` (kuch `0x3D`); SDA=21, SCL=22 |
| 401 Unauthorized | firmware ka `SENSOR_TOKEN` backend ke `SENSOR_INGEST_TOKEN` se match nahi |

---

## Note: model inputs

Yeh node **temperature** aur **humidity** AI model ko deta hai (live). Baaki inputs:
- **N, P, K** + **pH** → soil test card / lab se manually (predictor sliders se).
- **Rainfall** → "Auto-fill from your location" button (weather API) se.
- **Soil moisture / soil temperature** abhi extra info hain (model input nahi) — aage irrigation feature mein kaam aayenge.
