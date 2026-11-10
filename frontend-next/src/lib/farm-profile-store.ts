/**
 * Farmer Profile Store & Local Persistence.
 *
 * Implements transparent, privacy-first farmer profiles that personalize AI
 * advice (soil type, region, crops, irrigation) with explicit user consent.
 */

export type SoilType =
  | "alluvial"
  | "black"
  | "red"
  | "sandy_loam"
  | "clayey"
  | "laterite"
  | "saline"
  | "unknown";

export type IrrigationType =
  | "drip"
  | "sprinkler"
  | "canal"
  | "borewell_flood"
  | "rainfed"
  | "other";

export type LandOwnership = "owned" | "leased" | "sharecropper";

export interface FarmerProfileData {
  farmerName: string;
  state: string;
  district: string;
  block?: string;
  village?: string;
  pinCode?: string;
  farmSizeAcres: number;
  landOwnership: LandOwnership;
  soilType: SoilType;
  mainCrops: string[];
  cropVarieties: string;
  sowingDates: string;
  irrigationMethod: IrrigationType;
  fertilizerUsage: string;
  previousCropProblems: string;
  preferredLanguage: string;
  consentGiven: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "kisaanbuddy_farmer_profile_v2";

export const DEFAULT_FARMER_PROFILE: FarmerProfileData = {
  farmerName: "",
  state: "Haryana",
  district: "Karnal",
  block: "Karnal",
  village: "",
  pinCode: "132001",
  farmSizeAcres: 3.5,
  landOwnership: "owned",
  soilType: "alluvial",
  mainCrops: ["Wheat", "Paddy (Basmati)"],
  cropVarieties: "HD-3226, PBW-725, Pusa 1509",
  sowingDates: "Wheat: Nov 15, Paddy: June 25",
  irrigationMethod: "borewell_flood",
  fertilizerUsage: "Urea 2 bags/acre, DAP 1 bag/acre, Zinc Sulphate 21% 5kg",
  previousCropProblems: "Occasional yellow rust in wheat, leaf folder in paddy",
  preferredLanguage: "hi",
  consentGiven: true,
  updatedAt: new Date().toISOString()
};

export function loadFarmerProfile(): FarmerProfileData {
  if (typeof window === "undefined") return DEFAULT_FARMER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FARMER_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FARMER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_FARMER_PROFILE;
  }
}

export function saveFarmerProfile(profile: Partial<FarmerProfileData>): FarmerProfileData {
  const current = loadFarmerProfile();
  const updated: FarmerProfileData = {
    ...current,
    ...profile,
    updatedAt: new Date().toISOString()
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or disabled
    }
  }
  return updated;
}

export function clearFarmerProfile(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Format active farm profile facts as a natural context string for the AI prompt.
 */
export function formatFarmContextForAI(p: FarmerProfileData): string {
  if (!p.consentGiven) return "";
  const parts: string[] = [];
  if (p.farmerName) parts.push(`Farmer: ${p.farmerName}`);
  parts.push(`Location: ${p.village ? p.village + ", " : ""}${p.block ? p.block + ", " : ""}${p.district}, ${p.state}`);
  parts.push(`Land: ${p.farmSizeAcres} acres (${p.landOwnership})`);
  parts.push(`Soil Type: ${p.soilType}`);
  if (p.mainCrops?.length) parts.push(`Primary Crops: ${p.mainCrops.join(", ")} (Varieties: ${p.cropVarieties || "General"})`);
  if (p.irrigationMethod) parts.push(`Irrigation: ${p.irrigationMethod}`);
  if (p.fertilizerUsage) parts.push(`Past Fertilizer: ${p.fertilizerUsage}`);
  if (p.previousCropProblems) parts.push(`Historical Pest/Disease Issues: ${p.previousCropProblems}`);
  return `[FARMER LOCAL CONTEXT: ${parts.join(" | ")}]`;
}
