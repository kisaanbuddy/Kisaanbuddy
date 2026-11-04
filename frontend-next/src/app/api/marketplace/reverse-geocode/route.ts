import { NextRequest, NextResponse } from "next/server";

// Canonical mapping for Indian States & Union Territories
const STATE_CANONICAL_MAP: Record<string, string> = {
  "andhra pradesh": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  "assam": "Assam",
  "bihar": "Bihar",
  "chhattisgarh": "Chhattisgarh",
  "delhi": "Delhi",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  "goa": "Goa",
  "gujarat": "Gujarat",
  "haryana": "Haryana",
  "himachal pradesh": "Himachal Pradesh",
  "jharkhand": "Jharkhand",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  "maharashtra": "Maharashtra",
  "manipur": "Manipur",
  "meghalaya": "Meghalaya",
  "mizoram": "Mizoram",
  "nagaland": "Nagaland",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "punjab": "Punjab",
  "rajasthan": "Rajasthan",
  "sikkim": "Sikkim",
  "tamil nadu": "Tamil Nadu",
  "telangana": "Telangana",
  "tripura": "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  "uttarakhand": "Uttarakhand",
  "uttaranchal": "Uttarakhand",
  "west bengal": "West Bengal",
  "chandigarh": "Chandigarh",
  "jammu and kashmir": "Jammu and Kashmir",
  "ladakh": "Ladakh",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",
};

// District name normalization (strip "District", "Urban", etc., or map common aliases)
function normalizeDistrictName(raw: string): string {
  if (!raw) return "";
  let name = raw.replace(/\bdistrict\b/gi, "")
    .replace(/\bdivision\b/gi, "")
    .replace(/\bzone\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const lower = name.toLowerCase();
  if (lower.startsWith("bengaluru") || lower.startsWith("bangalore")) {
    return "Bengaluru";
  }
  if (lower.startsWith("pune")) return "Pune";
  if (lower.startsWith("mumbai")) return "Mumbai";
  if (lower.startsWith("delhi") || lower.startsWith("new delhi")) return "New Delhi";
  if (lower.startsWith("hyderabad")) return "Hyderabad";
  if (lower.startsWith("ahmedabad")) return "Ahmedabad";
  if (lower.startsWith("ludhiana")) return "Ludhiana";
  if (lower.startsWith("patna")) return "Patna";
  if (lower.startsWith("sehore")) return "Sehore";
  if (lower.startsWith("indore")) return "Indore";
  if (lower.startsWith("nashik")) return "Nashik";

  return name;
}

function normalizeStateName(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\bstate of\b/gi, "").replace(/\s+/g, " ").trim().toLowerCase();
  for (const [key, val] of Object.entries(STATE_CANONICAL_MAP)) {
    if (cleaned === key || cleaned.includes(key) || key.includes(cleaned)) {
      return val;
    }
  }
  // Capitalize words if not matched
  return raw.trim().replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  if (!latStr || !lonStr) {
    return NextResponse.json({ success: false, error: "Missing lat or lon query parameters" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ success: false, error: "Invalid coordinates range" }, { status: 400 });
  }

  // 1. Primary: BigDataCloud Reverse Geocoding Client API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const rawState = data.principalSubdivision || "";
      let rawDistrict = "";

      if (Array.isArray(data.localityInfo?.administrative)) {
        const distObj = data.localityInfo.administrative.find((a: any) =>
          (a.description && a.description.toLowerCase().includes("district")) ||
          (a.name && a.name.toLowerCase().includes("district"))
        );
        if (distObj?.name) {
          rawDistrict = distObj.name;
        }
      }

      if (!rawDistrict) {
        rawDistrict = data.city || data.locality || "";
      }

      const rawCity = data.city || data.locality || rawDistrict;

      const state = normalizeStateName(rawState);
      const district = normalizeDistrictName(rawDistrict);
      const city = normalizeDistrictName(rawCity);

      if (state || district) {
        return NextResponse.json({
          success: true,
          state: state || district,
          district: district || city,
          city: city || district,
          formatted: `${city || district}${state ? ", " + state : ""}`,
          source: "bigdatacloud",
        });
      }
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode error:", err);
  }

  // 2. Secondary fallback: OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "KisaanBuddy-Marketplace/1.0 (contact@kisaanbuddy.org)",
          "Accept-Language": "en",
        },
      }
    );
    clearTimeout(timer);

    if (nomRes.ok) {
      const data = await nomRes.json();
      const addr = data.address || {};
      const rawState = addr.state || addr.state_district || "";
      const rawDistrict = addr.state_district || addr.county || addr.district || addr.city || "";
      const rawCity = addr.city || addr.town || addr.village || addr.suburb || rawDistrict;

      const state = normalizeStateName(rawState);
      const district = normalizeDistrictName(rawDistrict);
      const city = normalizeDistrictName(rawCity);

      if (state || district) {
        return NextResponse.json({
          success: true,
          state: state || district,
          district: district || city,
          city: city || district,
          formatted: `${city || district}${state ? ", " + state : ""}`,
          source: "nominatim",
        });
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode error:", err);
  }

  return NextResponse.json(
    {
      success: false,
      error: "Unable to reverse-geocode coordinates to an authentic Indian location",
    },
    { status: 422 }
  );
}
