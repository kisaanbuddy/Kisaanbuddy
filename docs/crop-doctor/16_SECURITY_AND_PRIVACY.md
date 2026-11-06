# Security, Privacy & Input Validation Specification

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Scope:** Image Upload Pipeline, Model Execution Sandbox, and Farmer Data Privacy  

---

## 1. Threat Modeling & Attack Surfaces

The image upload endpoint accepts untrusted binary data from public clients. The following attack vectors are actively mitigated:

1. **Malicious File Upload / Polyglot Executables:** Attackers uploading executable binaries disguised as images (e.g., PHP, shell scripts, EXE headers).
2. **Decompression Bomb (ZIP/PNG Bomb):** Images with extreme pixel compression expanding into gigabytes of RAM during decode.
3. **Denial of Service via Over-sized Payloads:** Starving network bandwidth with multi-gigabyte uploads.
4. **Metadata / Geolocation Leakage:** Farmer GPS coordinates inadvertently exposed in EXIF metadata.
5. **Arbitrary Diagnosis Quotas:** Commercial paywalls or artificial rate caps denying farmers diagnosis during critical pest emergencies.

---

## 2. Implemented Defense Controls

### 2.1 File Header & Magic Byte Validation
The backend inspects the initial byte sequences before passing buffers to decoder libraries:
- `JPEG`: `\xFF\xD8\xFF`
- `PNG`: `\x89\x50\x4E\x47\x0D\x0A\x1A\x0A`
- `WEBP`: `RIFF....WEBP`
Non-image MIME types or mismatched magic bytes are immediately rejected with HTTP 400.

### 2.2 Strict Size & Dimension Clamping
- **Maximum File Size:** 10 MB per upload (`413 Payload Too Large`).
- **Decompression Bomb Protection:** Pillow's `Image.MAX_IMAGE_PIXELS = 25000000` (25 megapixels) ceiling prevents algorithmic decompression attacks.
- **Auto-resizing:** Input tensors are resized to $224 \times 224$ using bilinear interpolation prior to tensor conversion.

### 2.3 EXIF Sanitization & Geolocation Privacy
- All EXIF metadata (camera serial, GPS coordinates, timestamps) is stripped before storing user images or logging.
- `ImageOps.exif_transpose` applies rotational orientation and discards the raw EXIF block.

### 2.4 No Arbitrary Per-Farmer Usage Caps
- In compliance with Non-Negotiable Rule 0.2, there are **no arbitrary limits** on how many diagnoses a farmer can request.
- Protection is implemented strictly via IP-based sliding-window rate limiting (60 requests/minute) to prevent automated scrapers and brute-force flooding, preserving open availability for all farmers.
