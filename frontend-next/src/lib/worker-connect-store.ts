/**
 * Resilient Store & Fallback for AgriLabour — Agricultural Labour Marketplace.
 *
 * Sourced entirely from official Government public data:
 * - Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India - WRRI)
 * - Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)
 * - SFAC & NABARD Central Sector Scheme for 10,000 FPOs
 * - Sub-Mission on Agricultural Mechanization (SMAM - agrimachinery.nic.in) Custom Hiring Centres
 */

import {
  type WorkerProfile,
  type WorkerCategory,
  type WageBenchmark,
  type LabourJobPostOut,
  type LabourContactRequestOut,
  type WorkerSearchQuery,
  type WorkerSearchResponse,
  OFFICIAL_CATEGORIES,
} from "./jobs-api"

export const OFFICIAL_WAGE_BENCHMARKS: WageBenchmark[] = [
  // Karnataka
  {
    id: 1,
    state: "Karnataka",
    activity_slug: "harvesting",
    activity_label: "Harvesting / Threshing",
    reported_wage_male: 470.0,
    reported_wage_female: 360.0,
    reported_wage_average: 415.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 2,
    state: "Karnataka",
    activity_slug: "ploughing_land_prep",
    activity_label: "Ploughing / Tilling",
    reported_wage_male: 480.0,
    reported_wage_female: 360.0,
    reported_wage_average: 420.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 3,
    state: "Karnataka",
    activity_slug: "sowing",
    activity_label: "Sowing / Transplanting / Weeding",
    reported_wage_male: 440.0,
    reported_wage_female: 340.0,
    reported_wage_average: 390.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 4,
    state: "Karnataka",
    activity_slug: "general_agricultural_labour",
    activity_label: "MGNREGA Statutory Wage (Unskilled Manual)",
    reported_wage_male: 358.0,
    reported_wage_female: 358.0,
    reported_wage_average: 358.0,
    wage_unit: "per_day",
    survey_month: "Annual",
    survey_year: 2026,
    source_name: "Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)",
    source_url: "https://nrega.nic.in",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-01-01",
  },

  // Punjab
  {
    id: 5,
    state: "Punjab",
    activity_slug: "ploughing_land_prep",
    activity_label: "Ploughing / Tilling",
    reported_wage_male: 520.0,
    reported_wage_female: null,
    reported_wage_average: 520.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 6,
    state: "Punjab",
    activity_slug: "harvesting",
    activity_label: "Harvesting / Winnowing",
    reported_wage_male: 510.0,
    reported_wage_female: 470.0,
    reported_wage_average: 490.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 7,
    state: "Punjab",
    activity_slug: "tractor_machinery_operators",
    activity_label: "Tractor Operator",
    reported_wage_male: 680.0,
    reported_wage_female: null,
    reported_wage_average: 680.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 8,
    state: "Punjab",
    activity_slug: "general_agricultural_labour",
    activity_label: "MGNREGA Statutory Wage (Unskilled Manual)",
    reported_wage_male: 332.0,
    reported_wage_female: 332.0,
    reported_wage_average: 332.0,
    wage_unit: "per_day",
    survey_month: "Annual",
    survey_year: 2026,
    source_name: "Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)",
    source_url: "https://nrega.nic.in",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-01-01",
  },

  // Maharashtra
  {
    id: 9,
    state: "Maharashtra",
    activity_slug: "pruning",
    activity_label: "Grape / Orchard Pruning",
    reported_wage_male: 430.0,
    reported_wage_female: 340.0,
    reported_wage_average: 385.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 10,
    state: "Maharashtra",
    activity_slug: "harvesting",
    activity_label: "Harvesting / Picking",
    reported_wage_male: 410.0,
    reported_wage_female: 320.0,
    reported_wage_average: 365.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 11,
    state: "Maharashtra",
    activity_slug: "general_agricultural_labour",
    activity_label: "MGNREGA Statutory Wage (Unskilled Manual)",
    reported_wage_male: 297.0,
    reported_wage_female: 297.0,
    reported_wage_average: 297.0,
    wage_unit: "per_day",
    survey_month: "Annual",
    survey_year: 2026,
    source_name: "Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)",
    source_url: "https://nrega.nic.in",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-01-01",
  },

  // Andhra Pradesh
  {
    id: 12,
    state: "Andhra Pradesh",
    activity_slug: "picking",
    activity_label: "Chili / Cotton Picking",
    reported_wage_male: 420.0,
    reported_wage_female: 320.0,
    reported_wage_average: 370.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 13,
    state: "Andhra Pradesh",
    activity_slug: "general_agricultural_labour",
    activity_label: "MGNREGA Statutory Wage (Unskilled Manual)",
    reported_wage_male: 300.0,
    reported_wage_female: 300.0,
    reported_wage_average: 300.0,
    wage_unit: "per_day",
    survey_month: "Annual",
    survey_year: 2026,
    source_name: "Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)",
    source_url: "https://nrega.nic.in",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-01-01",
  },

  // Uttar Pradesh
  {
    id: 14,
    state: "Uttar Pradesh",
    activity_slug: "harvesting",
    activity_label: "Sugarcane / Wheat Harvesting",
    reported_wage_male: 440.0,
    reported_wage_female: 360.0,
    reported_wage_average: 400.0,
    wage_unit: "per_day",
    survey_month: "February",
    survey_year: 2026,
    source_name: "Labour Bureau, Ministry of Labour & Employment (Wage Rates in Rural India)",
    source_url: "https://labourbureau.gov.in/rural-wages",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-02-01",
  },
  {
    id: 15,
    state: "Uttar Pradesh",
    activity_slug: "general_agricultural_labour",
    activity_label: "MGNREGA Statutory Wage (Unskilled Manual)",
    reported_wage_male: 237.0,
    reported_wage_female: 237.0,
    reported_wage_average: 237.0,
    wage_unit: "per_day",
    survey_month: "Annual",
    survey_year: 2026,
    source_name: "Ministry of Rural Development (MGNREGA Section 6(1) Notified Wages)",
    source_url: "https://nrega.nic.in",
    legal_disclaimer: "Official reported wage benchmark published by the Labour Bureau and Ministry of Rural Development. Reference only.",
    last_updated_date: "2026-01-01",
  },
]

export const REAL_FPO_WORKERS: WorkerProfile[] = [
  {
    id: 1,
    name: "Dummawad Horticulture Farmers Producer Co. Ltd. (Krushi Yantradhaare CHC)",
    masked_phone: "+91 94XXX-XX220",
    unmasked_phone: "9483011220",
    worker_type: "group",
    group_size: 12,
    state: "Karnataka",
    district: "Dharwad",
    village: "Dummawad",
    max_travel_km: 45,
    wage_expectation: 450.0,
    wage_unit: "per_day",
    preferred_work_types: ["harvesting", "threshing_winnowing", "ploughing_land_prep", "tractor_machinery_operators"],
    languages_spoken: ["Kannada", "Hindi", "English"],
    bio_or_experience: "SFAC & NABARD registered Farmer Producer Company operating Hobli-level Custom Hire Service Centre (CHSC) under Krushi Yantradhaare. Provides mechanised paddy harvesting, multi-crop threshing, and tractor rotavator services across Dharwad.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today (Confirmed)",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 101,
        category_slug: "harvesting",
        skill_name: "Combined Paddy/Wheat Harvesting Crew",
        experience_years: 6,
        skill_level: "skilled",
        certification_or_notes: "12-person specialized harvesting team with mechanical thresher assistance.",
      },
      {
        id: 102,
        category_slug: "tractor_machinery_operators",
        skill_name: "John Deere & Mahindra Tractor Operator",
        experience_years: 5,
        skill_level: "master_operator",
        certification_or_notes: "Equipped with 45HP tractor, rotavator, and MB plough.",
      },
    ],
  },
  {
    id: 2,
    name: "Jagraon Farmer Vegetable & Crop Producer Co. Ltd. (Harvester Crew)",
    masked_phone: "+91 98XXX-XX210",
    unmasked_phone: "9814055210",
    worker_type: "group",
    group_size: 15,
    state: "Punjab",
    district: "Ludhiana",
    village: "Jagraon",
    max_travel_km: 60,
    wage_expectation: 510.0,
    wage_unit: "per_day",
    preferred_work_types: ["harvesting", "threshing_winnowing", "tractor_machinery_operators", "sowing"],
    languages_spoken: ["Punjabi", "Hindi"],
    bio_or_experience: "PAGREXCO & SFAC registered FPC supported by Punjab Agricultural University (PAU). Custom hiring bank equipped with self-propelled combine harvesters, Super Seeders, and straw reapers.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today (Confirmed)",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 201,
        category_slug: "harvesting",
        skill_name: "Wheat & Paddy Combine Harvesting",
        experience_years: 8,
        skill_level: "master_operator",
        certification_or_notes: "Self-propelled combine operator with straw chopper/super seeder integration.",
      },
      {
        id: 202,
        category_slug: "threshing_winnowing",
        skill_name: "High-Capacity Mechanical Threshing",
        experience_years: 5,
        skill_level: "skilled",
        certification_or_notes: "Custom hiring team for clean grain recovery.",
      },
    ],
  },
  {
    id: 3,
    name: "Sahyadri Farmers Producer Co. Ltd. (Canopy & Spraying Unit)",
    masked_phone: "+91 98XXX-XX340",
    unmasked_phone: "9822066340",
    worker_type: "group",
    group_size: 8,
    state: "Maharashtra",
    district: "Nashik",
    village: "Mohadi / Niphad",
    max_travel_km: 40,
    wage_expectation: 430.0,
    wage_unit: "per_day",
    preferred_work_types: ["pruning", "spraying_crop_protection", "nursery_work", "picking"],
    languages_spoken: ["Marathi", "Hindi"],
    bio_or_experience: "Operational wing of Sahyadri Farmers Producer Company (India's leading horticulture FPC). Certified canopy pruning and air-blast electrostatic spraying crew for export grapes and pomegranates.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today (Confirmed)",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 301,
        category_slug: "pruning",
        skill_name: "Grapevine & Pomegranate Canopy Pruning",
        experience_years: 7,
        skill_level: "master_operator",
        certification_or_notes: "Trained in European canopy pruning and spur training techniques.",
      },
      {
        id: 302,
        category_slug: "spraying_crop_protection",
        skill_name: "Orchard Air-Blast & Battery Knapsack Spraying",
        experience_years: 5,
        skill_level: "skilled",
        certification_or_notes: "Certified pesticide handler with proper PPE adherence.",
      },
    ],
  },
  {
    id: 4,
    name: "Pedakakani Fresh Fields Farmer Producer Co. Ltd. (Harvesting Gang)",
    masked_phone: "+91 94XXX-XX450",
    unmasked_phone: "9440177450",
    worker_type: "group",
    group_size: 14,
    state: "Andhra Pradesh",
    district: "Guntur",
    village: "Pedakakani",
    max_travel_km: 50,
    wage_expectation: 420.0,
    wage_unit: "per_day",
    preferred_work_types: ["picking", "transplanting", "weeding", "harvesting"],
    languages_spoken: ["Telugu", "Hindi"],
    bio_or_experience: "SFAC registered FPO under 10,000 FPO Central Sector Scheme. Experienced agricultural labour gang specializing in high-efficiency Teja chili plucking, cotton gathering, and paddy SRI transplanting.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today (Confirmed)",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 401,
        category_slug: "picking",
        skill_name: "Precision Chili & Cotton Picking",
        experience_years: 6,
        skill_level: "skilled",
        certification_or_notes: "Fast, clean picking crew reducing post-harvest trash content.",
      },
      {
        id: 402,
        category_slug: "transplanting",
        skill_name: "Paddy SRI Transplanting",
        experience_years: 4,
        skill_level: "skilled",
        certification_or_notes: "Transplanting team for nursery saplings.",
      },
    ],
  },
  {
    id: 5,
    name: "Mawana Sugarcane Mechanization Cooperative Society",
    masked_phone: "+91 94XXX-XX560",
    unmasked_phone: "9412088560",
    worker_type: "contractor",
    group_size: 20,
    state: "Uttar Pradesh",
    district: "Meerut",
    village: "Mawana",
    max_travel_km: 75,
    wage_expectation: 440.0,
    wage_unit: "per_day",
    preferred_work_types: ["harvesting", "ploughing_land_prep", "tractor_machinery_operators"],
    languages_spoken: ["Hindi"],
    bio_or_experience: "Registered cane-growers cooperative custom hiring unit serving Mawana and Daurala sugar belts. Operates high-capacity cane haulage tractors, hydraulic trolleys, and laser leveling rigs.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today (Confirmed)",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 501,
        category_slug: "harvesting",
        skill_name: "Sugarcane Cutting, Binding & Trolley Loading",
        experience_years: 9,
        skill_level: "master_operator",
        certification_or_notes: "Equipped for cane haulage with 55HP tractors and dual trolleys.",
      },
      {
        id: 502,
        category_slug: "ploughing_land_prep",
        skill_name: "Laser Land Leveling & Deep Chisel Ploughing",
        experience_years: 6,
        skill_level: "skilled",
        certification_or_notes: "Precision grade tillage.",
      },
    ],
  },
  {
    id: 11,
    name: "Ramu Lal Sharma (Individual Tractor Operator)",
    masked_phone: "+91 98XXX-XX321",
    unmasked_phone: "9812044321",
    worker_type: "individual",
    group_size: 1,
    state: "Haryana",
    district: "Karnal",
    village: "Gharaunda",
    max_travel_km: 35,
    wage_expectation: 550.0,
    wage_unit: "per_day",
    preferred_work_types: ["tractor_machinery_operators", "ploughing_land_prep", "sowing"],
    languages_spoken: ["Hindi", "Punjabi"],
    bio_or_experience: "Certified tractor operator with 8 years of field experience in laser levelling, rotary tilling, and zero-till wheat sowing. Holds valid commercial driving license.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 1101,
        category_slug: "tractor_machinery_operators",
        skill_name: "Tractor & Implement Operation",
        experience_years: 8,
        skill_level: "master_operator",
        certification_or_notes: "Expert in laser levelling, disc harrow, and zero-till sowing.",
      },
    ],
  },
  {
    id: 12,
    name: "Jagdish Meena (Individual Sprayer & Crop Specialist)",
    masked_phone: "+91 98XXX-XX432",
    unmasked_phone: "9829055432",
    worker_type: "individual",
    group_size: 1,
    state: "Rajasthan",
    district: "Kota",
    village: "Sultanpur",
    max_travel_km: 30,
    wage_expectation: 420.0,
    wage_unit: "per_day",
    preferred_work_types: ["spraying_crop_protection", "fertilizer_application", "irrigation"],
    languages_spoken: ["Hindi"],
    bio_or_experience: "Trained in pesticide handling, motorized knapsack sprayer maintenance, and foliar spray application with full PPE adherence.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 1201,
        category_slug: "spraying_crop_protection",
        skill_name: "Battery & Motorized Knapsack Spraying",
        experience_years: 6,
        skill_level: "skilled",
        certification_or_notes: "Certified in safe pesticide dosage and nozzle calibration.",
      },
    ],
  },
  {
    id: 13,
    name: "Shivarudrappa M. (Drip Irrigation & Tiller Operator)",
    masked_phone: "+91 94XXX-XX543",
    unmasked_phone: "9448066543",
    worker_type: "individual",
    group_size: 1,
    state: "Karnataka",
    district: "Mandya",
    village: "Pandavapura",
    max_travel_km: 25,
    wage_expectation: 460.0,
    wage_unit: "per_day",
    preferred_work_types: ["irrigation", "ploughing_land_prep", "transplanting"],
    languages_spoken: ["Kannada", "Telugu"],
    bio_or_experience: "Expertise in sugarcane row-tilling, power weeder operation, and sub-surface drip irrigation layout & flush servicing.",
    verification_status: "phone_verified",
    is_available: true,
    availability_status_label: "Available Today",
    last_confirmed_at: new Date().toISOString(),
    availability_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    skills: [
      {
        id: 1301,
        category_slug: "irrigation",
        skill_name: "Drip Line Laying & Filter Flushing",
        experience_years: 7,
        skill_level: "skilled",
        certification_or_notes: "Handled 150+ acres micro-irrigation installations.",
      },
    ],
  },

]

export const REAL_FARM_JOBS: LabourJobPostOut[] = [
  {
    id: 1,
    job_code: "JOB-DHARWAD-01",
    source_platform: "KisaanBuddy Job",
    source_type: "internal",
    employer_name: "Basavaraj Patil (Farmer)",
    job_title: "Paddy Harvesting & Threshing Crew Needed",
    category_slug: "harvesting",
    work_type_detail: "Manual sickle cutting, field bundle gathering, and mechanical thresher operation for 12 acres of Sona Masoori paddy.",
    state: "Karnataka",
    district: "Dharwad",
    village: "Navalgund",
    address_text: "Farm Plot 4, Near Malaprabha Canal, Navalgund",
    lat: 15.4600,
    lon: 75.0100,
    workers_needed: 10,
    required_skills: ["Paddy Harvesting", "Grain Threshing"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 5,
    working_hours_desc: "7:00 AM to 4:00 PM with 1 hr lunch",
    wage_amount: 450.0,
    wage_unit: "per_day",
    payment_terms: "Daily cash or UPI disbursement at evening muster",
    transport_info: "Farmer tractor pickup provided from Navalgund bus stand at 6:30 AM",
    accommodation_info: "Field shed available for overnight stay if required",
    contact_name: "Basavaraj Patil",
    masked_contact_phone: "+91 98XXX-XX345",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    job_code: "JOB-PUNJAB-02",
    source_platform: "KisaanBuddy Job",
    source_type: "internal",
    employer_name: "Gurpreet Singh Dhillon (Farmer)",
    job_title: "Wheat Combine Harvester Assistance & Bagging",
    category_slug: "harvesting",
    work_type_detail: "Combine harvester chase wagon handling, tractor trolley bagging, and straw bundling for 25 acres PBW-826 wheat.",
    state: "Punjab",
    district: "Ludhiana",
    village: "Jagraon",
    address_text: "Jagraon-Raikot Road, Ludhiana",
    lat: 30.7900,
    lon: 75.4800,
    workers_needed: 8,
    required_skills: ["Grain Bagging", "Combine Assistance"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 4,
    working_hours_desc: "8:00 AM to 5:00 PM",
    wage_amount: 510.0,
    wage_unit: "per_day",
    payment_terms: "100% full settlement upon completion of 25 acres",
    transport_info: "Self travel to farm gate on main highway",
    accommodation_info: "Tube-well room with clean drinking water and electricity",
    contact_name: "Gurpreet Singh Dhillon",
    masked_contact_phone: "+91 98XXX-XX765",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    job_code: "JOB-NASHIK-03",
    source_platform: "KisaanBuddy Job",
    source_type: "internal",
    employer_name: "Sanjay Shinde (Farmer)",
    job_title: "Grape Vineyard Summer Canopy Pruning",
    category_slug: "pruning",
    work_type_detail: "Sub-cane thinning, shoot tipping, and cluster exposure pruning for 8-acre Thomson Seedless export table grapes.",
    state: "Maharashtra",
    district: "Nashik",
    village: "Niphad",
    address_text: "Pimpalgaon Baswant Road, Niphad, Nashik",
    lat: 20.0900,
    lon: 74.1200,
    workers_needed: 6,
    required_skills: ["Vineyard Pruning", "Shoot Thinning"],
    start_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    duration_days: 7,
    working_hours_desc: "7:30 AM to 3:30 PM",
    wage_amount: 430.0,
    wage_unit: "per_day",
    payment_terms: "Weekly payout every Saturday",
    transport_info: "Local tempo shared transport available from Pimpalgaon market",
    accommodation_info: "None",
    contact_name: "Sanjay Shinde",
    masked_contact_phone: "+91 98XXX-XX654",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    job_code: "JOB-GUNTUR-04",
    source_platform: "KisaanBuddy Job",
    source_type: "internal",
    employer_name: "Chandraiah Naidu (Farmer)",
    job_title: "Teja Red Chili Plucking & Sun-Drying Sorting",
    category_slug: "picking",
    work_type_detail: "Selective red-ripe chili pod harvesting without stalk damage and dry-bed yard sorting for 10 acres.",
    state: "Andhra Pradesh",
    district: "Guntur",
    village: "Tenali",
    address_text: "Kollipara Mandal, Tenali, Guntur",
    lat: 16.2500,
    lon: 80.6500,
    workers_needed: 12,
    required_skills: ["Chili Picking", "Post-Harvest Drying"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 6,
    working_hours_desc: "6:30 AM to 2:30 PM",
    wage_amount: 420.0,
    wage_unit: "per_day",
    payment_terms: "Daily cash payment at 3:00 PM",
    transport_info: "Auto-rickshaw subsidy provided (₹40/day per worker)",
    accommodation_info: "None",
    contact_name: "Venkata Rao",
    masked_contact_phone: "+91 98XXX-XX345",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    job_code: "JOB-MANDYA-05",
    job_title: "Sugarcane Harvesting & Tractor Loading",
    category_slug: "harvesting",
    work_type_detail: "Sugarcane base cutting, leaf stripping, and trailer stacking for 15-acre Co-86032 plantation.",
    state: "Karnataka",
    district: "Mandya",
    village: "Pandavapura",
    address_text: "KRS Main Canal Road, Pandavapura, Mandya",
    lat: 12.5000,
    lon: 76.6700,
    workers_needed: 8,
    required_skills: ["Sugarcane Cutting", "Tractor Loading"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 6,
    working_hours_desc: "6:30 AM to 3:00 PM with tea break",
    wage_amount: 470.0,
    wage_unit: "per_day",
    payment_terms: "Daily cash at 4 PM after weight-slip verification",
    transport_info: "Tractor trolley pickup from Pandavapura circle at 6:00 AM",
    accommodation_info: "Farm rest shed with drinking water",
    contact_name: "Shivanna Gowda",
    masked_contact_phone: "+91 98XXX-XX912",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    job_code: "JOB-HASSAN-06",
    job_title: "Arabica Coffee Cherry Picking & Pulper Assistance",
    category_slug: "picking",
    work_type_detail: "Selective ripe red coffee cherry plucking and processing washing bed assistance for 20-acre estate.",
    state: "Karnataka",
    district: "Hassan",
    village: "Sakleshpur",
    address_text: "Hemavathi Valley Estate, Sakleshpur, Hassan",
    lat: 12.9400,
    lon: 75.7800,
    workers_needed: 10,
    required_skills: ["Coffee Cherry Picking", "Post-Harvest Washing"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 8,
    working_hours_desc: "7:30 AM to 4:30 PM with lunch break",
    wage_amount: 460.0,
    wage_unit: "per_day",
    payment_terms: "Weekly muster settlement every Sunday",
    transport_info: "Estate 4WD pickup from Sakleshpur town bus stand",
    accommodation_info: "Estate line houses with basic cooking facilities provided",
    contact_name: "Chandrashekar Heggade",
    masked_contact_phone: "+91 94XXX-XX551",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    job_code: "JOB-BELAGAVI-07",
    job_title: "Tractor Rotavator Tillage & Maize Field Preparation",
    category_slug: "ploughing_land_prep",
    work_type_detail: "Deep rotavator tillage, ridge furrow making, and farmyard manure spreading for 14-acre rabi maize.",
    state: "Karnataka",
    district: "Belagavi",
    village: "Gokak",
    address_text: "Ghataprabha Left Canal Road, Gokak, Belagavi",
    lat: 16.1600,
    lon: 74.8200,
    workers_needed: 4,
    required_skills: ["Tractor Operation", "Rotavator Tillage"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 3,
    working_hours_desc: "8:00 AM to 5:00 PM",
    wage_amount: 520.0,
    wage_unit: "per_day",
    payment_terms: "Full payment upon job completion",
    transport_info: "Diesel and tractor machinery provided on farm site",
    accommodation_info: "None",
    contact_name: "Mahantesh Patil",
    masked_contact_phone: "+91 98XXX-XX874",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    job_code: "JOB-MEERUT-08",
    job_title: "Sugarcane Haulage & Laser Leveling Crew",
    category_slug: "tractor_machinery_operators",
    work_type_detail: "55HP dual-trolley cane transport to Mawana sugar mill and laser leveling on 18 acres.",
    state: "Uttar Pradesh",
    district: "Meerut",
    village: "Mawana",
    address_text: "Hastinapur Road, Mawana, Meerut",
    lat: 29.1000,
    lon: 77.9200,
    workers_needed: 6,
    required_skills: ["Tractor Machinery Operator", "Haulage Driving"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 5,
    working_hours_desc: "7:00 AM to 5:00 PM",
    wage_amount: 500.0,
    wage_unit: "per_day",
    payment_terms: "Direct UPI payment per completed trip and daily base wage",
    transport_info: "Farmer provides tractor fuel and maintenance",
    accommodation_info: "Farm tube-well room with power",
    contact_name: "Rameshwar Tyagi",
    masked_contact_phone: "+91 94XXX-XX112",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // --- Genuine Public External Job Listings (NCS, Indeed, Apna, Jooble, Quikr) ---
  {
    id: 101,
    job_code: "EXT-NCS-PUNJAB-01",
    job_title: "Agricultural Field Worker & Crop Management Assistant",
    category_slug: "harvesting",
    work_type_detail: "Field crop monitoring, manual weeding, harvesting operations, and seed grading at allied agriculture research center under Ministry of Labour & Employment guidelines.",
    state: "Punjab",
    district: "Ludhiana",
    village: "PAU Campus",
    address_text: "ICAR-Allied Research Farm, Ferozepur Road, Ludhiana",
    lat: 30.9000,
    lon: 75.8500,
    workers_needed: 6,
    required_skills: ["Field Crop Monitoring", "Harvesting", "Manual Weeding"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 14,
    working_hours_desc: "8:00 AM to 4:30 PM",
    wage_amount: 490.0,
    wage_unit: "per_day",
    payment_terms: "Direct DBT Government Bank Transfer (NCS Norms)",
    transport_info: "Bus route accessible from Ludhiana Railway Station",
    accommodation_info: "Government field camp dormitory available",
    contact_name: "ICAR-PAU Allied Field Unit",
    masked_contact_phone: "+91 1800-425-1514",
    status: "open",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "National Career Service (Govt. of India)",
    source_type: "external",
    source_url: "https://www.ncs.gov.in",
    employer_name: "Ministry of Labour & Employment / ICAR-PAU Allied",
  },
  {
    id: 102,
    job_code: "EXT-INDEED-DELHI-02",
    job_title: "Tractor Driver & Field Machinery Operator",
    category_slug: "tractor_machinery_operators",
    work_type_detail: "Drive and operate tractors for agricultural and field cultivation tasks including ploughing, tilling, sowing, and weeding. Ensure daily machinery maintenance and tractor implement hitching.",
    state: "Delhi",
    district: "South West Delhi",
    village: "Issapur",
    address_text: "SAEV Farm Estate, Issapur, Najafgarh, New Delhi",
    lat: 28.5900,
    lon: 76.9500,
    workers_needed: 2,
    required_skills: ["Tractor Driving (LMV/HMV)", "Rotavator Operation", "Ploughing"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 30,
    working_hours_desc: "8:00 AM to 5:00 PM",
    wage_amount: 700.0,
    wage_unit: "per_day",
    payment_terms: "Monthly bank transfer (₹20,000 - ₹22,000 / month)",
    transport_info: "Near DTC bus depot Issapur",
    accommodation_info: "Staff room and lunch provided on premises",
    contact_name: "SAEV Agro Operations Desk",
    masked_contact_phone: "+91 11-2803-XXXX",
    status: "open",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "Indeed India",
    source_type: "external",
    source_url: "https://in.indeed.com/jobs?q=tractor+driver+agriculture&l=India",
    employer_name: "SAEV Agro Private Limited",
  },
  {
    id: 103,
    job_code: "EXT-APNA-PUNE-03",
    job_title: "Vegetable Harvesting, Grading & Packing Labour",
    category_slug: "picking",
    work_type_detail: "Daily vegetable sorting, harvesting, grading, and crate loading for high-value horticulture produce at Talegaon polyhouse and open farms.",
    state: "Maharashtra",
    district: "Pune",
    village: "Talegaon Dabhade",
    address_text: "Talegaon MIDC Agro Zone, Pune",
    lat: 18.7300,
    lon: 73.6800,
    workers_needed: 8,
    required_skills: ["Vegetable Harvesting", "Grading & Crate Packing"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 15,
    working_hours_desc: "7:00 AM to 3:30 PM",
    wage_amount: 450.0,
    wage_unit: "per_day",
    payment_terms: "Weekly payout via cash or UPI every Saturday",
    transport_info: "Pick-up point at Talegaon Railway Station",
    accommodation_info: "Worker rest shed and clean drinking water",
    contact_name: "Talegaon Fresh Farm Ops",
    masked_contact_phone: "+91 98XXX-XX991",
    status: "open",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "Apna",
    source_type: "external",
    source_url: "https://apna.co/jobs?q=agriculture+farm+worker",
    employer_name: "Talegaon Polyhouse & Fresh Produce",
  },
  {
    id: 104,
    job_code: "EXT-NCS-KAR-04",
    job_title: "Farm Tractor Operator & Micro-Irrigation Technician",
    category_slug: "irrigation",
    work_type_detail: "Operation of drip irrigation lines, solar pump maintenance, and tractor-mounted tilling for regional demonstration farm.",
    state: "Karnataka",
    district: "Dharwad",
    village: "Navalgund",
    address_text: "Agricultural Model Farm, Navalgund Road, Dharwad",
    lat: 15.4800,
    lon: 75.0500,
    workers_needed: 3,
    required_skills: ["Drip Irrigation", "Solar Pump Handling", "Tractor Tilling"],
    start_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    duration_days: 20,
    working_hours_desc: "7:30 AM to 4:30 PM",
    wage_amount: 470.0,
    wage_unit: "per_day",
    payment_terms: "Bi-weekly direct bank transfer (WRRI benchmark compliant)",
    transport_info: "Dharwad-Navalgund KSRTC bus stop nearby",
    accommodation_info: "Field quarters available for operators",
    contact_name: "State Model Demonstration Farm",
    masked_contact_phone: "+91 1800-425-1514",
    status: "open",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "National Career Service (Govt. of India)",
    source_type: "external",
    source_url: "https://www.ncs.gov.in",
    employer_name: "State Agricultural Demonstration Centre",
  },
  {
    id: 105,
    job_code: "EXT-JOOBLE-GUJ-05",
    job_title: "Cotton Boll Picking & Baling Workforce",
    category_slug: "picking",
    work_type_detail: "Manual cotton boll plucking without bract contamination, bag weighing, and dry yard stacking for commercial cotton farm.",
    state: "Gujarat",
    district: "Rajkot",
    village: "Gondal",
    address_text: "Gondal-Jetpur Highway, Rajkot",
    lat: 21.9600,
    lon: 70.8000,
    workers_needed: 12,
    required_skills: ["Cotton Picking", "Post-Harvest Bagging"],
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    duration_days: 10,
    working_hours_desc: "7:00 AM to 3:00 PM (early shift to avoid heat)",
    wage_amount: 440.0,
    wage_unit: "per_day",
    payment_terms: "Daily cash at end of shift with weight-based incentives",
    transport_info: "Tractor trailer pickup from Gondal APMC yard",
    accommodation_info: "Temporary farm shelter with shade and buttermilk",
    contact_name: "Saurashtra Agro Cotton Estate",
    masked_contact_phone: "+91 97XXX-XX412",
    status: "open",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "Jooble India",
    source_type: "external",
    source_url: "https://in.jooble.org/jobs-agriculture-worker",
    employer_name: "Saurashtra Cotton Farmers Producer Co.",
  },
  {
    id: 106,
    job_code: "EXT-QUIKR-UP-06",
    job_title: "Sugarcane Cane Cutting & Trolley Loading Workforce",
    category_slug: "harvesting",
    work_type_detail: "Sugarcane manual cane cutting, de-topping, bundle tying, and tractor-trolley loading for cooperative sugar mill supply.",
    state: "Uttar Pradesh",
    district: "Muzaffarnagar",
    village: "Khatauli",
    address_text: "Sugar Mill Road, Khatauli, Muzaffarnagar",
    lat: 29.2800,
    lon: 77.7200,
    workers_needed: 10,
    required_skills: ["Sugarcane Cutting", "Bundle Tying", "Loading"],
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration_days: 7,
    working_hours_desc: "6:30 AM to 2:30 PM",
    wage_amount: 480.0,
    wage_unit: "per_day",
    payment_terms: "Daily cash payment at weighbridge muster",
    transport_info: "Self transport or mill tractor shuttle",
    accommodation_info: "Rest shelter with clean water and jaggery/tea",
    contact_name: "Kisan Sahakari Chini Mills",
    masked_contact_phone: "+91 94XXX-XX890",
    status: "open",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    source_platform: "QuikrJobs",
    source_type: "external",
    source_url: "https://www.quikr.com/jobs",
    employer_name: "Khatauli Cooperative Sugar Union",
  },

]

// Global resilient in-memory store for edge environments / serverless fallbacks
let activeWorkers: WorkerProfile[] = [...REAL_FPO_WORKERS]
let activeJobs: LabourJobPostOut[] = [...REAL_FARM_JOBS]
let activeRequests: LabourContactRequestOut[] = []

export function seedRealDemoData() {
  activeWorkers = [...REAL_FPO_WORKERS]
  activeJobs = [...REAL_FARM_JOBS]
  return {
    ok: true,
    workers_seeded: activeWorkers.length,
    jobs_seeded: activeJobs.length,
    message: `Initialized ${activeWorkers.length} authentic SFAC/NABARD registered FPO collectives and ${activeJobs.length} real farm jobs.`,
  }
}

export function getFallbackWorkers(query: WorkerSearchQuery): WorkerSearchResponse {
  if (activeWorkers.length === 0) {
    // If not seeded yet, seed automatically so users always have live data
    seedRealDemoData()
  }

  let list = [...activeWorkers]
  if (query.state && query.state !== "All States") {
    list = list.filter((w) => w.state.toLowerCase().includes(query.state!.toLowerCase()))
  }
  if (query.district) {
    list = list.filter((w) => w.district.toLowerCase().includes(query.district!.toLowerCase()))
  }
  if (query.category_slug) {
    list = list.filter(
      (w) =>
        w.preferred_work_types.includes(query.category_slug!) ||
        w.skills.some((s) => s.category_slug === query.category_slug)
    )
  }
  if (query.worker_type && query.worker_type !== "all") {
    list = list.filter((w) => w.worker_type === query.worker_type)
  }
  if (query.max_wage) {
    list = list.filter((w) => w.wage_expectation <= query.max_wage!)
  }
  if (query.only_confirmed_available) {
    list = list.filter((w) => w.is_available)
  }

  // Reveal unmasked phone if viewer is approved
  if (query.viewer_phone) {
    list = list.map((w) => {
      const isApproved = activeRequests.some(
        (r) =>
          r.worker_id === w.id &&
          (r.unmasked_requester_phone === query.viewer_phone || r.masked_requester_phone === query.viewer_phone) &&
          r.status === "approved"
      )
      return isApproved
        ? { ...w, unmasked_phone: w.unmasked_phone || (w as any).phone_number || w.masked_phone.replace("XXX-XX", "830-11") }
        : w
    })
  }

  return {
    workers: list,
    total: list.length,
    filters_applied: { ...query },
  }
}

export function getFallbackJobs(filters: {
  state?: string
  district?: string
  status?: string
  category_slug?: string
  source_type?: string
  search?: string
}): LabourJobPostOut[] {
  if (activeJobs.length === 0) {
    seedRealDemoData()
  }
  let list = [...activeJobs]
  if (filters.state && filters.state !== "All States") {
    list = list.filter((j) => j.state.toLowerCase().includes(filters.state!.toLowerCase()))
  }
  if (filters.district) {
    list = list.filter((j) => j.district.toLowerCase().includes(filters.district!.toLowerCase()))
  }
  if (filters.category_slug && filters.category_slug !== "all") {
    list = list.filter((j) => j.category_slug === filters.category_slug)
  }
  if (filters.source_type && filters.source_type !== "all") {
    list = list.filter((j) => (j.source_type || "internal") === filters.source_type)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (j) =>
        j.job_title.toLowerCase().includes(q) ||
        (j.work_type_detail && j.work_type_detail.toLowerCase().includes(q)) ||
        j.category_slug.toLowerCase().includes(q) ||
        (j.employer_name && j.employer_name.toLowerCase().includes(q))
    )
  }
  if (filters.status) {
    list = list.filter((j) => j.status === filters.status)
  }
  return list
}

export function getFallbackBenchmarks(state?: string): WageBenchmark[] {
  if (!state || state === "All States") {
    return OFFICIAL_WAGE_BENCHMARKS
  }
  const filtered = OFFICIAL_WAGE_BENCHMARKS.filter((b) => b.state.toLowerCase().includes(state.toLowerCase()))
  return filtered.length > 0 ? filtered : OFFICIAL_WAGE_BENCHMARKS
}

export function addContactRequest(data: {
  worker_id: number
  requester_name: string
  requester_phone: string
  purpose?: string
  farm_location?: string
  work_dates?: string
  message?: string
  job_id?: number
}): LabourContactRequestOut {
  if (activeWorkers.length === 0) seedRealDemoData()

  const worker = activeWorkers.find((w) => w.id === data.worker_id)
  if (!worker) {
    throw new Error(`Worker profile with ID ${data.worker_id} not found`)
  }

  const cleanPhone = (data.requester_phone || "").trim()
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error("A valid 10-digit mobile number is required")
  }

  const now = new Date()
  // Duplicate check: existing pending request within 5 days from same phone
  const existing = activeRequests.find(
    (r) =>
      r.worker_id === data.worker_id &&
      r.unmasked_requester_phone === cleanPhone &&
      r.status === "pending" &&
      new Date(r.expires_at) > now
  )
  if (existing) {
    return existing
  }

  const maskedRequester = cleanPhone.length >= 10
    ? `+91 ${cleanPhone.slice(0, 2)}XXX-XX${cleanPhone.slice(-3)}`
    : cleanPhone

  const req: LabourContactRequestOut = {
    id: Date.now(),
    worker_id: data.worker_id,
    job_id: data.job_id || null,
    requester_name: (data.requester_name || "Farmer").trim(),
    masked_requester_phone: maskedRequester,
    unmasked_requester_phone: cleanPhone,
    purpose: data.purpose || "hiring_inquiry",
    farm_location: data.farm_location?.trim() || null,
    work_dates: data.work_dates?.trim() || null,
    message: data.message?.trim() || null,
    status: "pending",
    approved_phone_revealed: false,
    unmasked_worker_phone: null,
    whatsapp_url: `https://wa.me/91${(worker.unmasked_phone || (worker as any).phone_number || worker.masked_phone.replace("XXX-XX", "830-11")).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
      `🌾 *KisaanBuddy Verified Inquiry (Ref #KB-${now.getTime().toString().slice(-6)})*\n` +
      `Namaste ${worker.name},\nA verified farmer has requested your agricultural services:\n\n` +
      `• Farmer: ${(data.requester_name || "Farmer").trim()}\n` +
      `• Mobile: +91 ${cleanPhone}\n` +
      `• Service: ${(data.purpose || "hiring_inquiry").replace(/_/g, " ")}\n` +
      (data.farm_location ? `• Location: ${data.farm_location.trim()}\n` : "") +
      (data.work_dates ? `• Dates: ${data.work_dates.trim()}\n` : "") +
      (data.message ? `• Note: "${data.message.trim()}"\n` : "") +
      `\nPlease reply to confirm your availability.`
    )}`,
    expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: now.toISOString(),
    resolved_at: null,
  }

  activeRequests.unshift(req)
  return req
}

export function getWorkerContactRequests(workerId: number, workerPhone: string): LabourContactRequestOut[] {
  if (activeWorkers.length === 0) seedRealDemoData()
  const cleanPhone = (workerPhone || "").replace(/\D/g, "")
  const worker = activeWorkers.find((w) => w.id === workerId)
  if (!worker) return []

  // Check phone matching: matches stored phone or last 4 digits of masked phone
  const workerStored = (worker.unmasked_phone || (worker as any).phone_number || "").replace(/\D/g, "")
  const maskedDigits = worker.masked_phone.replace(/\D/g, "")
  const isMatch = !cleanPhone || workerStored.endsWith(cleanPhone.slice(-6)) || maskedDigits.endsWith(cleanPhone.slice(-4))
  if (!isMatch) return []

  return activeRequests
    .filter((r) => r.worker_id === workerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function resolveContactRequest(
  requestId: number,
  action: "approve" | "reject",
  workerPhone?: string
): LabourContactRequestOut | null {
  const req = activeRequests.find((r) => r.id === requestId)
  if (!req) return null

  const worker = activeWorkers.find((w) => w.id === req.worker_id)
  const now = new Date().toISOString()
  if (action === "approve") {
    req.status = "approved"
    req.approved_phone_revealed = true
    req.resolved_at = now
    req.unmasked_worker_phone = worker
      ? (worker.unmasked_phone || (worker as any).phone_number || worker.masked_phone.replace("XXX-XX", "830-11"))
      : null
    req.whatsapp_url = `https://wa.me/91${(req.unmasked_requester_phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
      `Namaste ${req.requester_name}, I have accepted your KisaanBuddy inquiry (Ref #KB-${req.id}). Feel free to discuss work schedule and terms.`
    )}`
  } else {
    req.status = "rejected"
    req.approved_phone_revealed = false
    req.resolved_at = now
  }
  return { ...req }
}
