/**
 * Authentic KisaanBuddy Agricultural Advisory Knowledge & KVK Store.
 * Supports direct Next.js API routes and fallback when FastAPI backend is offline.
 */

export interface AgriculturalExpert {
  id: number;
  name: str;
  designation: string;
  institution_name: string;
  institution_type: "kvk" | "icar" | "sau" | "dept_agri" | "consultant";
  qualification?: string | null;
  specialization: string;
  state: string;
  district: string;
  service_area?: string | null;
  crops_supported?: string | null;
  official_phone: string;
  official_email?: string | null;
  official_website?: string | null;
  contact_type: "official_published" | "individually_verified" | "registered_expert" | "referral_partner";
  is_active: boolean;
  can_receive_referrals: boolean;
  verification_date?: string | null;
  source_attribution: string;
}

export interface AdvisoryCase {
  id: number;
  case_id: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_phone_masked?: string;
  preferred_contact_method: "phone" | "whatsapp" | "sms";
  consent_recorded: boolean;
  crop_name: string;
  crop_variety?: string | null;
  state: string;
  district: string;
  village_or_tehsil?: string | null;
  growth_stage?: string | null;
  sowing_date?: string | null;
  visible_symptoms?: string | null;
  symptom_duration_days?: number | null;
  affected_area_acres?: number | null;
  recent_weather_conditions?: string | null;
  fertilizer_pesticide_history?: string | null;
  image_url?: string | null;
  ai_predicted_disease?: string | null;
  ai_confidence?: number | null;
  ai_status?: string | null;
  ai_differentials?: string | null;
  status: "pending" | "queued" | "sent" | "acknowledged" | "accepted" | "farmer_contacted" | "resolved" | "failed";
  priority: "low" | "normal" | "urgent";
  expert_notes?: string | null;
  expert_recommendation?: string | null;
  assigned_expert?: AgriculturalExpert;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface KnowledgeRecord {
  id: number;
  crop: string;
  disease_or_pest: string;
  category: "fungal" | "bacterial" | "viral" | "pest" | "deficiency";
  symptoms: string;
  growth_stage_applicability?: string;
  cultural_preventive: string;
  biological_organic: string;
  chemical_control: string;
  cibrc_registered_compounds?: string;
  dosage_guidelines?: string;
  pre_harvest_interval_days?: number;
  safety_instructions: string;
  source_institution: string;
  source_url?: string;
  last_verified_date: string;
}

export const AUTHENTIC_EXPERTS: AgriculturalExpert[] = [
  {
    id: 1,
    name: "Dr. Virender Kumar",
    designation: "Senior Scientist & Head (Plant Protection)",
    institution_name: "Krishi Vigyan Kendra (ICAR-NDRI), Karnal",
    institution_type: "kvk",
    qualification: "Ph.D. in Plant Pathology (IARI)",
    specialization: "Plant Pathology & Wheat/Paddy Disease Management",
    state: "Haryana",
    district: "Karnal",
    service_area: "Karnal, Kurukshetra, Panipat",
    crops_supported: "Wheat, Paddy, Mustard, Sugarcane",
    official_phone: "+91 184 2259200",
    official_email: "kvk-karnal@icar.gov.in",
    official_website: "https://ndri.res.in/kvk",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-09-10",
    source_attribution: "ICAR Agricultural Technology Application Research Institute (ATARI Zone-II)"
  },
  {
    id: 2,
    name: "Dr. Manpreet Singh Dhaliwal",
    designation: "Principal Extension Scientist (Agronomy)",
    institution_name: "Krishi Vigyan Kendra (PAU), Ludhiana",
    institution_type: "kvk",
    qualification: "Ph.D. Agronomy (PAU Ludhiana)",
    specialization: "Integrated Pest Management & Crop Protection",
    state: "Punjab",
    district: "Ludhiana",
    service_area: "Ludhiana, Fatehgarh Sahib, Khanna",
    crops_supported: "Wheat, Rice (Basmati), Maize, Cotton",
    official_phone: "+91 161 2401960",
    official_email: "kvkludhiana@pau.edu",
    official_website: "https://www.pau.edu/kvk",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-09-12",
    source_attribution: "Punjab Agricultural University Extension Network"
  },
  {
    id: 3,
    name: "Dr. Ramesh Chandra Sharma",
    designation: "Subject Matter Specialist (Plant Protection)",
    institution_name: "Krishi Vigyan Kendra (RVSKVV), Sehore",
    institution_type: "kvk",
    qualification: "M.Sc. (Ag) Entomology & Pathology",
    specialization: "Soybean & Sharbati Wheat Pest Protection",
    state: "Madhya Pradesh",
    district: "Sehore",
    service_area: "Sehore, Bhopal, Raisen, Hoshangabad",
    crops_supported: "Soybean, Wheat (Sharbati), Gram, Garlic",
    official_phone: "+91 7562 222384",
    official_email: "kvksehore@gmail.com",
    official_website: "https://rvskvv.net/kvk",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-08-25",
    source_attribution: "ICAR-ATARI Zone-IX Jabalpur"
  },
  {
    id: 4,
    name: "Dr. Dattatraya B. Pawar",
    designation: "Head & SMS (Horticulture & Plant Pathology)",
    institution_name: "Krishi Vigyan Kendra, Baramati (Sharadchandra Pawar KVK)",
    institution_type: "kvk",
    qualification: "Ph.D. Horticulture (MPKV Rahuri)",
    specialization: "Sugarcane, Pomegranate, Onion & Vegetable Diseases",
    state: "Maharashtra",
    district: "Pune",
    service_area: "Pune, Solapur, Ahmednagar",
    crops_supported: "Sugarcane, Grapes, Pomegranate, Onion, Soybean",
    official_phone: "+91 2112 255227",
    official_email: "kvkbaramati@yahoo.com",
    official_website: "https://www.kvkbaramati.com",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-09-15",
    source_attribution: "Agricultural Development Trust Baramati / ICAR"
  },
  {
    id: 5,
    name: "Dr. N. Shivashankara",
    designation: "Senior Scientist (Agronomy & Soil Science)",
    institution_name: "Krishi Vigyan Kendra, Kolar (UAS Bangalore)",
    institution_type: "kvk",
    qualification: "Ph.D. Soil Science (UASB)",
    specialization: "Tomato Blight, Ragi Blast, Groundnut Diseases",
    state: "Karnataka",
    district: "Kolar",
    service_area: "Kolar, Chikkaballapura, Bengaluru Rural",
    crops_supported: "Tomato, Ragi, Groundnut, Mango, Mulberry",
    official_phone: "+91 8152 243112",
    official_email: "kvkkolar@uasbangalore.edu.in",
    official_website: "https://uasbangalore.edu.in/kvk",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-09-05",
    source_attribution: "University of Agricultural Sciences, Bangalore"
  },
  {
    id: 6,
    name: "Dr. S. K. Singh",
    designation: "Principal Scientist (Vegetable Pathology)",
    institution_name: "ICAR-IIVR Krishi Vigyan Kendra, Varanasi",
    institution_type: "icar",
    qualification: "Ph.D. Plant Pathology (BHU)",
    specialization: "Tomato, Chilli, Brinjal & Solanaceous Crop Diseases",
    state: "Uttar Pradesh",
    district: "Varanasi",
    service_area: "Varanasi, Mirzapur, Chandauli, Ghazipur",
    crops_supported: "Tomato, Potato, Chilli, Pea, Mustard, Rice",
    official_phone: "+91 542 2635247",
    official_email: "iivr.kvk@icar.gov.in",
    official_website: "https://iivr.icar.gov.in",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-09-18",
    source_attribution: "ICAR - Indian Institute of Vegetable Research"
  },
  {
    id: 7,
    name: "Dr. M. Senthilkumar",
    designation: "Professor & Head (Plant Pathology)",
    institution_name: "Krishi Vigyan Kendra (TNAU), Coimbatore",
    institution_type: "sau",
    qualification: "Ph.D. Plant Pathology (TNAU)",
    specialization: "Cotton, Sugarcane, Banana & Horticultural IDM",
    state: "Tamil Nadu",
    district: "Coimbatore",
    service_area: "Coimbatore, Tiruppur, Erode",
    crops_supported: "Cotton, Banana, Turmeric, Tomato, Coconut",
    official_phone: "+91 422 6611223",
    official_email: "kvkcbe@tnau.ac.in",
    official_website: "https://agritech.tnau.ac.in",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-08-30",
    source_attribution: "Tamil Nadu Agricultural University Extension Network"
  },
  {
    id: 8,
    name: "Kisan Call Centre (KCC) Directorate",
    designation: "National Agricultural Toll-Free Advisory Helpdesk",
    institution_name: "Ministry of Agriculture & Farmers Welfare, Govt of India",
    institution_type: "dept_agri",
    qualification: "Level-1 Graduate Agronomists & Level-2 Subject Specialists",
    specialization: "All Crops, Livestock, Weather Advisory, Market Rates & Govt Schemes",
    state: "National / All States",
    district: "All Districts",
    service_area: "All 732+ Agricultural Districts of India",
    crops_supported: "All Field Crops, Horticulture, Floriculture, Spices",
    official_phone: "1800-180-1551",
    official_email: "kisan-callcentre@gov.in",
    official_website: "https://daconline.gov.in/kcc",
    contact_type: "official_published",
    is_active: true,
    can_receive_referrals: true,
    verification_date: "2026-10-01",
    source_attribution: "Department of Agriculture & Farmers Welfare, Government of India (Toll-Free 6:00 AM to 10:00 PM, 7 days/week)"
  }
];

export const KNOWLEDGE_BASE_RECORDS: KnowledgeRecord[] = [
  {
    id: 1,
    crop: "Wheat",
    disease_or_pest: "Yellow Rust (Puccinia striiformis)",
    category: "fungal",
    symptoms: "Bright yellow pustules arranged in linear stripes parallel to leaf veins, releasing yellow powder on touch.",
    growth_stage_applicability: "Tillering to Grain Filling (Cool & Humid Climate)",
    cultural_preventive: "Sow resistant cultivars (e.g. HD-3226, DBW-187, PBW-725). Avoid excessive nitrogen fertilizer. Ensure timely sowing in November.",
    biological_organic: "Spray aqueous extract of neem seed kernel (NSKE 5%) or garlic clove extract @ 50 ml/L at initial flag leaf emergence.",
    chemical_control: "Spray Propiconazole 25% EC @ 1.0 ml/L or Tebuconazole 250 EC @ 1.0 ml/L in 200 liters of water per acre. Repeat after 15 days if stripe development persists.",
    cibrc_registered_compounds: "Propiconazole 25% EC, Tebuconazole 250 EC",
    dosage_guidelines: "Propiconazole 25% EC @ 200 ml/acre in 200 L water",
    pre_harvest_interval_days: 30,
    safety_instructions: "Wear nitrile gloves and face mask during mixing. Spray in early morning when wind speed is < 8 km/h. Do not spray within 30 days of harvest.",
    source_institution: "ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal",
    source_url: "https://iiwbr.icar.gov.in",
    last_verified_date: "2026-08-15"
  },
  {
    id: 2,
    crop: "Wheat",
    disease_or_pest: "Brown Rust (Puccinia triticina)",
    category: "fungal",
    symptoms: "Round to oval orange-brown pustules scattered irregularly across leaf blades, without forming linear stripes.",
    growth_stage_applicability: "Heading to Milk Stage (Warm & Moderate Humidity)",
    cultural_preventive: "Use recommended certified rust-tolerant seeds (HD-3086, WH-1105). Maintain balanced NPK nutrition (120:60:40 kg/ha).",
    biological_organic: "Foliar application of Trichoderma harzianum @ 5 g/L with 0.1% jaggery sticker in early mornings.",
    chemical_control: "Apply Propiconazole 25% EC @ 1 ml/L or Mancozeb 75% WP @ 2.0 g/L upon first sighting of leaf pustules.",
    cibrc_registered_compounds: "Propiconazole 25% EC, Mancozeb 75% WP",
    dosage_guidelines: "Mancozeb 75% WP @ 500-600 g/acre in 200 L water",
    pre_harvest_interval_days: 25,
    safety_instructions: "Always wash spray tanks thoroughly. Do not graze livestock in treated fields within 21 days of spraying.",
    source_institution: "ICAR-IIWBR Karnal & PAU Ludhiana Department of Plant Pathology",
    source_url: "https://iiwbr.icar.gov.in",
    last_verified_date: "2026-08-15"
  },
  {
    id: 3,
    crop: "Rice",
    disease_or_pest: "Rice Blast (Magnaporthe oryzae)",
    category: "fungal",
    symptoms: "Spindle-shaped or diamond-shaped lesions with grey/whitish centers and dark reddish-brown margins on leaves, collars, and neck nodes.",
    growth_stage_applicability: "Nursery, Tillering, and Panicle Emergence (Neck Blast)",
    cultural_preventive: "Avoid excessive nitrogenous fertilizers (>120 kg N/ha). Avoid continuous standing water stress. Clean field bunds of wild grasses.",
    biological_organic: "Treat seeds with Pseudomonas fluorescens @ 10 g/kg seed. Apply foliar spray of Pseudomonas fluorescens @ 5 g/L.",
    chemical_control: "Spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L at first leaf spot sighting or booting stage.",
    cibrc_registered_compounds: "Tricyclazole 75% WP, Isoprothiolane 40% EC, Kasugamycin 3% SL",
    dosage_guidelines: "Tricyclazole 75% WP @ 120-150 g/acre in 200 L water",
    pre_harvest_interval_days: 30,
    safety_instructions: "Do not mix with alkaline fertilizers. Wear protective clothing. Toxic to aquatic life; prevent runoff into fish ponds.",
    source_institution: "ICAR - National Rice Research Institute (NRRI), Cuttack",
    source_url: "https://icar-nrri.gov.in",
    last_verified_date: "2026-07-20"
  },
  {
    id: 4,
    crop: "Rice",
    disease_or_pest: "Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)",
    category: "bacterial",
    symptoms: "Water-soaked to yellowish-white wavy lesions starting from leaf margins near tips, moving downwards, resulting in blighted straw-colored drying leaves.",
    growth_stage_applicability: "Maximum Tillering to Flowering Stage",
    cultural_preventive: "Drain the field for 3-4 days if flood-irrigated. Ensure balanced Potash application (50-60 kg K2O/ha). Avoid clipping seedlings during transplanting.",
    biological_organic: "Spray cow dung slurry supernatant (20 kg fresh cow dung soaked in 100 L water for 24 hours, strained) or apply Bacillus subtilis @ 5 g/L.",
    chemical_control: "Spray Copper Oxychloride 50% WP @ 2.5 g/L combined with Streptocycline @ 0.03 g/L (6 g in 200 L water/acre).",
    cibrc_registered_compounds: "Copper Oxychloride 50% WP, Streptocycline formulation",
    dosage_guidelines: "Copper Oxychloride @ 500 g + Streptocycline @ 6 g per acre in 200 L water",
    pre_harvest_interval_days: 21,
    safety_instructions: "Avoid spraying during high noon temperature. Streptocycline must be handled with dry measuring spoon.",
    source_institution: "ICAR-NRRI Cuttack & Directorate of Rice Development",
    source_url: "https://icar-nrri.gov.in",
    last_verified_date: "2026-07-20"
  },
  {
    id: 5,
    crop: "Cotton",
    disease_or_pest: "Cotton Leaf Curl Virus (CLCuV)",
    category: "viral",
    symptoms: "Upward or downward curling of leaf margins, vein thickening, dark green enations on undersides of leaves, and severe plant stunting.",
    growth_stage_applicability: "Early Vegetative to Square Formation (Spread by Whitefly Bemisia tabaci)",
    cultural_preventive: "Eradicate alternate weed hosts. Install yellow sticky traps @ 10-12/acre to monitor whiteflies. Uproot initial virus-infected plants.",
    biological_organic: "Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil (10,000 ppm) @ 2 ml/L or Verticillium lecanii @ 5 g/L to suppress whitefly vectors.",
    chemical_control: "To manage the whitefly vector: Spray Diafenthiuron 50% WP @ 1.2 g/L or Pyriproxyfen 10% EC @ 2 ml/L. Rotate insecticidal classes.",
    cibrc_registered_compounds: "Diafenthiuron 50% WP, Pyriproxyfen 10% EC, Spiromesifen 22.9% SC",
    dosage_guidelines: "Diafenthiuron 50% WP @ 250 g/acre in 200 L water",
    pre_harvest_interval_days: 30,
    safety_instructions: "Do not spray synthetic pyrethroids which cause whitefly resurgence. Always wear respirator mask and eye protection.",
    source_institution: "ICAR - Central Institute for Cotton Research (CICR), Nagpur",
    source_url: "https://cicr.icar.gov.in",
    last_verified_date: "2026-09-01"
  },
  {
    id: 6,
    crop: "Tomato",
    disease_or_pest: "Early Blight (Alternaria solani)",
    category: "fungal",
    symptoms: "Concentric dark brown rings resembling target-boards on older lower leaves, surrounded by yellow chlorotic halo.",
    growth_stage_applicability: "Vegetative to Fruiting Stage",
    cultural_preventive: "Prune lower leaves touching wet soil. Practice 3-year rotation avoiding Solanaceous crops. Use drip irrigation.",
    biological_organic: "Trichoderma harzianum @ 5 g/L foliar spray. Bio-formulation of Ampelomyces quisqualis or baking soda spray (5 g/L with soap sticker).",
    chemical_control: "Spray Mancozeb 75% WP @ 2.0-2.5 g/L or Chlorothalonil 75% WP @ 2.0 g/L. In severe cases, Azoxystrobin 23% SC @ 1.0 ml/L.",
    cibrc_registered_compounds: "Mancozeb 75% WP, Chlorothalonil 75% WP, Azoxystrobin 23% SC",
    dosage_guidelines: "Mancozeb 75% WP @ 500 g/acre in 200 L water",
    pre_harvest_interval_days: 5,
    safety_instructions: "Observe strict 5-day PHI before harvesting marketable ripe tomatoes. Wash picked fruit thoroughly.",
    source_institution: "ICAR - Indian Institute of Vegetable Research (IIVR), Varanasi",
    source_url: "https://iivr.icar.gov.in",
    last_verified_date: "2026-08-10"
  },
  {
    id: 7,
    crop: "Tomato",
    disease_or_pest: "Late Blight (Phytophthora infestans)",
    category: "fungal",
    symptoms: "Large, irregular, water-soaked dark brownish-black lesions on leaves and stems with delicate white fuzzy mold on undersides during high humidity.",
    growth_stage_applicability: "Flowering to Fruiting Stage (Cool, Foggy, High Humidity > 90%)",
    cultural_preventive: "Monitor weather advisories for winter fog. Maintain wider plant spacing for canopy aeration. Destroy infected cull piles.",
    biological_organic: "Preventive foliar application of Copper hydroxide 77% WP @ 2.0 g/L or Bordeaux mixture (1%) before disease outbreak.",
    chemical_control: "Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2.0 g/L or Dimethomorph 50% WP @ 1.0 g/L.",
    cibrc_registered_compounds: "Metalaxyl 8% + Mancozeb 64% WP, Dimethomorph 50% WP",
    dosage_guidelines: "Metalaxyl + Mancozeb @ 500 g/acre in 200 L water",
    pre_harvest_interval_days: 7,
    safety_instructions: "Late blight can destroy the entire field in 72 hours. Act on first lesion. Wear full chemical protective gear.",
    source_institution: "ICAR-IIVR Varanasi & CPRI Shimla",
    source_url: "https://iivr.icar.gov.in",
    last_verified_date: "2026-08-10"
  }
];

// In-Memory Advisory Cases
const advisoryCasesStore: AdvisoryCase[] = [
  {
    id: 1,
    case_id: "ADV-20261019-8812",
    farmer_name: "Raghuvir Singh",
    farmer_phone: "+91 98260 12345",
    farmer_phone_masked: "+91 98*** **345",
    preferred_contact_method: "phone",
    consent_recorded: true,
    crop_name: "Wheat",
    crop_variety: "HD-3086",
    state: "Madhya Pradesh",
    district: "Sehore",
    village_or_tehsil: "Ashta",
    growth_stage: "Tillering",
    visible_symptoms: "Yellow striping on upper leaves, powdery spores",
    status: "accepted",
    priority: "urgent",
    ai_predicted_disease: "wheat_yellow_rust",
    ai_confidence: 0.88,
    ai_status: "confident",
    assigned_expert: AUTHENTIC_EXPERTS[2],
    expert_notes: "Advised immediate Propiconazole 25% EC foliar spray at 1 ml/L. Flagged for follow-up inspection.",
    expert_recommendation: "Apply Propiconazole 25% EC 200ml/acre in 200L water. Repeat after 15 days if yellow stripes expand.",
    created_at: "2026-10-19T06:30:00Z",
    updated_at: "2026-10-19T08:15:00Z"
  },
  {
    id: 2,
    case_id: "ADV-20261019-9402",
    farmer_name: "Gurpreet Brar",
    farmer_phone: "+91 98150 98765",
    farmer_phone_masked: "+91 98*** **765",
    preferred_contact_method: "whatsapp",
    consent_recorded: true,
    crop_name: "Rice",
    crop_variety: "Pusa Basmati 1121",
    state: "Punjab",
    district: "Ludhiana",
    village_or_tehsil: "Jagraon",
    growth_stage: "Panicle Emergence",
    visible_symptoms: "Neck node blackening and diamond spots on leaves",
    status: "sent",
    priority: "urgent",
    ai_predicted_disease: "rice_blast",
    ai_confidence: 0.79,
    ai_status: "confident",
    assigned_expert: AUTHENTIC_EXPERTS[1],
    created_at: "2026-10-19T10:12:00Z",
    updated_at: "2026-10-19T10:12:00Z"
  }
];

export function maskPhone(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.length >= 10) {
    return `${clean.slice(0, 5)}*** **${clean.slice(-3)}`;
  }
  return "****";
}

export function generateCaseId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ADV-${ymd}-${rand}`;
}

export function matchExpert(state: string, district: string, crop: string): AgriculturalExpert {
  const s = (state || "").toLowerCase().trim();
  const d = (district || "").toLowerCase().trim();

  // District match
  const matchDist = AUTHENTIC_EXPERTS.find(
    (e) => e.district.toLowerCase() === d && e.state.toLowerCase() === s
  );
  if (matchDist) return matchDist;

  // State match
  const matchState = AUTHENTIC_EXPERTS.find(
    (e) => e.state.toLowerCase() === s && e.id !== 8
  );
  if (matchState) return matchState;

  // National KCC Fallback
  return AUTHENTIC_EXPERTS[7]; // Kisan Call Centre
}

export function getExperts(params?: { state?: string; district?: string; crop?: string; specialization?: string }) {
  let list = [...AUTHENTIC_EXPERTS];
  if (params?.state && params.state.toLowerCase() !== "all") {
    list = list.filter((e) => e.state.toLowerCase().includes(params.state!.toLowerCase()) || e.id === 8);
  }
  if (params?.district && params.district.toLowerCase() !== "all") {
    list = list.filter((e) => e.district.toLowerCase().includes(params.district!.toLowerCase()) || e.id === 8);
  }
  if (params?.crop) {
    list = list.filter((e) => (e.crops_supported || "").toLowerCase().includes(params.crop!.toLowerCase()) || e.id === 8);
  }
  return list;
}

export function getKnowledge(params?: { crop?: string; disease?: string }) {
  let list = [...KNOWLEDGE_BASE_RECORDS];
  if (params?.crop && params.crop.toLowerCase() !== "all") {
    list = list.filter((k) => k.crop.toLowerCase().includes(params.crop!.toLowerCase()));
  }
  if (params?.disease) {
    list = list.filter((k) => k.disease_or_pest.toLowerCase().includes(params.disease!.toLowerCase()));
  }
  return list;
}

export function createAdvisoryCase(data: Partial<AdvisoryCase>): AdvisoryCase {
  const newId = advisoryCasesStore.length > 0 ? Math.max(...advisoryCasesStore.map((x) => x.id)) + 1 : 1;
  const expert = matchExpert(data.state || "", data.district || "", data.crop_name || "");
  const caseId = generateCaseId();
  const now = new Date().toISOString();

  const newCase: AdvisoryCase = {
    id: newId,
    case_id: caseId,
    farmer_name: data.farmer_name || "Farmer",
    farmer_phone: data.farmer_phone || "",
    farmer_phone_masked: maskPhone(data.farmer_phone || ""),
    preferred_contact_method: data.preferred_contact_method || "phone",
    consent_recorded: Boolean(data.consent_recorded),
    crop_name: data.crop_name || "Crop",
    crop_variety: data.crop_variety || null,
    state: data.state || "State",
    district: data.district || "District",
    village_or_tehsil: data.village_or_tehsil || null,
    growth_stage: data.growth_stage || null,
    sowing_date: data.sowing_date || null,
    visible_symptoms: data.visible_symptoms || null,
    symptom_duration_days: data.symptom_duration_days || null,
    affected_area_acres: data.affected_area_acres || null,
    recent_weather_conditions: data.recent_weather_conditions || null,
    fertilizer_pesticide_history: data.fertilizer_pesticide_history || null,
    image_url: data.image_url || null,
    ai_predicted_disease: data.ai_predicted_disease || null,
    ai_confidence: data.ai_confidence || null,
    ai_status: data.ai_status || "confident",
    ai_differentials: data.ai_differentials || null,
    status: "sent",
    priority: data.priority || "normal",
    assigned_expert: expert,
    expert_notes: `Assigned to ${expert.institution_name} (${expert.name})`,
    created_at: now,
    updated_at: now,
  };

  advisoryCasesStore.unshift(newCase);
  return newCase;
}

export function getAdvisoryCaseById(caseId: string): AdvisoryCase | null {
  return advisoryCasesStore.find((c) => c.case_id.toLowerCase() === caseId.toLowerCase()) || null;
}

export function listAdvisoryCases(params?: { status?: string; crop?: string; state?: string }): AdvisoryCase[] {
  let list = [...advisoryCasesStore];
  if (params?.status) {
    list = list.filter((c) => c.status === params.status);
  }
  if (params?.crop) {
    list = list.filter((c) => c.crop_name.toLowerCase().includes(params.crop!.toLowerCase()));
  }
  if (params?.state) {
    list = list.filter((c) => c.state.toLowerCase().includes(params.state!.toLowerCase()));
  }
  return list;
}

export function reviewAdvisoryCase(caseId: string, review: { status: string; expert_notes?: string; expert_recommendation?: string; follow_up_date?: string }): AdvisoryCase | null {
  const item = advisoryCasesStore.find((c) => c.case_id.toLowerCase() === caseId.toLowerCase());
  if (!item) return null;
  item.status = review.status as any;
  if (review.expert_notes) item.expert_notes = review.expert_notes;
  if (review.expert_recommendation) item.expert_recommendation = review.expert_recommendation;
  if (review.follow_up_date) item.follow_up_date = review.follow_up_date;
  if (review.status === "resolved") item.resolved_at = new Date().toISOString();
  item.updated_at = new Date().toISOString();
  return item;
}
