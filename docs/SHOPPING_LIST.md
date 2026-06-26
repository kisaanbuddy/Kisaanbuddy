# KisaanBuddy — Hardware Shopping List

> Sab components ESP32 ke saath compatible hain aur ek dusre ke saath bina conflict ke chalenge. Total budget ke andar hai.

## Zaroori (Must-buy)

| # | Item | Note | ~Price (₹) |
|---|------|------|-----------|
| 1 | ESP32 DevKit V1 (38-pin) | Brain / main controller (WiFi built-in) | 400 |
| 2 | Capacitive soil moisture sensor v2.0 | 3-wire module (corrosion-proof) | 110 |
| 3 | DHT22 module (3-pin) | Temperature + humidity, built-in pull-up | 190 |
| 4 | DS18B20 (waterproof) | Soil temperature probe (+4.7kΩ agar bare probe ho) | 140 |
| 5 | Jumper wires 120pc (M-M / M-F / F-F) + breadboard | Connections ke liye | 130 |
| 6 | Data micro-USB cable | Programming + power (shayad ghar pe already ho) | 50 |

**Must-buy subtotal ≈ ₹1,020**

## Optional (acha rahega, par zaroori nahi)

| # | Item | Note | ~Price (₹) |
|---|------|------|-----------|
| 7 | OLED SSD1306 0.96" I2C | Display polish — readings dikhane ke liye | 160 |
| 8 | Resistor pack (incl. 4.7kΩ) | Safety / pull-up ke liye | ~30 |

**Optional subtotal ≈ ₹190**

## Grand Total ≈ ₹1,180 – ₹1,210

## Bilkul nahi kharidna (Free / paas me hai)

- **Arduino IDE** — free download
- **ESP32 ka CP2102 / CH340 USB driver** — free download
- **Soil calibration ke liye** — ek glass paani
- **Power ke liye** — phone charger / power bank

---

### Dhyaan dene layak baat (model inputs)

Yeh sensors aapke model ke **temperature, humidity** (DHT22) aur **soil temp + moisture** (DS18B20, capacitive) cover karte hain.
Aapka AI model **3 aur inputs** maangta hai jo in sensors se nahi aate:

- **N, P, K** → soil testing lab / NPK card se, ya manually enter karna padega (NPK sensor ₹1,500+ ka aata hai, isliye is list mein nahi rakha)
- **Soil pH** → pH testing strip / lab se manually
- **Rainfall** → yeh aapke project ka **weather API** (weather_service.py) already de deta hai

Yaani sensors real-time data fill karenge, baaki 3 values manual ya API se aayengi — yeh ek practical aur budget-friendly setup hai.
