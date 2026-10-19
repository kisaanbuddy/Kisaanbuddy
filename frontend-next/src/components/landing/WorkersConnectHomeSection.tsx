'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Briefcase, ArrowRight, CheckCircle2, ShieldCheck,
  MapPin, Calendar, Clock, Sparkles, UserCheck, PhoneCall,
  TrendingUp, Award, ChevronRight, Filter
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

interface WorkerCollectiveItem {
  id: number;
  name: string;
  state: string;
  location: string;
  specialty: string;
  groupSize: number;
  wage: string;
  verified: string;
  equipment?: string;
}

interface FarmJobItem {
  id: number;
  title: string;
  state: string;
  location: string;
  workersNeeded: number;
  duration: string;
  wage: string;
  perk: string;
  timing: string;
}

const ALL_STATES = ["All States", "Karnataka", "Punjab", "Maharashtra", "Andhra Pradesh", "Uttar Pradesh"] as const;
type SelectedState = typeof ALL_STATES[number];

const STATE_BENCHMARKS: Record<SelectedState, { text: string; source: string }> = {
  "All States": {
    text: "Official WRRI Benchmark: ₹350 – ₹520 / day (Agricultural Activities Across States)",
    source: "Labour Bureau, Ministry of Labour & Employment",
  },
  "Karnataka": {
    text: "Labour Bureau Karnataka: ₹415 / day avg • Harvesting: ₹470 • Tilling: ₹480 • MGNREGA: ₹358",
    source: "Labour Bureau WRRI & MoRD",
  },
  "Punjab": {
    text: "Labour Bureau Punjab: ₹490 / day avg • Harvesting/Combine: ₹510 • Ploughing: ₹520",
    source: "Labour Bureau WRRI (Feb 2026)",
  },
  "Maharashtra": {
    text: "Labour Bureau Maharashtra: ₹380 / day avg • Vineyard Pruning: ₹430 • MGNREGA: ₹297",
    source: "Labour Bureau WRRI & MoRD",
  },
  "Andhra Pradesh": {
    text: "Labour Bureau Andhra Pradesh: ₹370 / day avg • Chili/Cotton Picking: ₹420 • Sowing: ₹390",
    source: "Labour Bureau WRRI & MoRD",
  },
  "Uttar Pradesh": {
    text: "Labour Bureau Uttar Pradesh: ₹400 / day avg • Sugarcane Cutting: ₹440 • Sowing: ₹380",
    source: "Labour Bureau WRRI & MoRD",
  },
};

const VERIFIED_COLLECTIVES: WorkerCollectiveItem[] = [
  {
    id: 1,
    name: "Dummawad Horticulture Farmers Producer Co. (CHC)",
    state: "Karnataka",
    location: "Dharwad, Karnataka",
    specialty: "Paddy Harvesting & Tractor Rotavator",
    groupSize: 18,
    wage: "₹450 / day",
    verified: "SFAC / NABARD Registered",
    equipment: "45HP Tractor & Rotavator",
  },
  {
    id: 2,
    name: "Sahyadri Coffee & Spice Harvesters Collective",
    state: "Karnataka",
    location: "Sakleshpur, Hassan, Karnataka",
    specialty: "Coffee Bean Picking & Pepper Harvest",
    groupSize: 12,
    wage: "₹460 / day",
    verified: "NABARD Promoted Group",
    equipment: "Motorized Shakers & Drying Trays",
  },
  {
    id: 3,
    name: "Jagraon Crop Producer Co. Ltd. (Harvester Wing)",
    state: "Punjab",
    location: "Ludhiana, Punjab",
    specialty: "Combine Harvester & Laser Leveler Crew",
    groupSize: 15,
    wage: "₹510 / day",
    verified: "SFAC Registered FPO",
    equipment: "Self-Propelled Harvester & Laser Leveler",
  },
  {
    id: 4,
    name: "Malwa High-Capacity Straw Reaper Collective",
    state: "Punjab",
    location: "Bathinda, Punjab",
    specialty: "Wheat Straw Baling & Super Seeder Ops",
    groupSize: 10,
    wage: "₹520 / day",
    verified: "Custom Hiring Bank (CHC)",
    equipment: "Happy Seeder & Round Baler",
  },
  {
    id: 5,
    name: "Sahyadri Farmers Producer Co. Ltd. (Canopy Unit)",
    state: "Maharashtra",
    location: "Nashik, Maharashtra",
    specialty: "Vineyard Pruning & Electrostatic Spraying",
    groupSize: 8,
    wage: "₹430 / day",
    verified: "Export Certified FPC",
    equipment: "Air-Blast Orchard Sprayer",
  },
  {
    id: 6,
    name: "Baramati Sugarcane Harvesters Gang",
    state: "Maharashtra",
    location: "Pune, Maharashtra",
    specialty: "Sugarcane Harvesting & Drip Maintenance",
    groupSize: 16,
    wage: "₹420 / day",
    verified: "Registered Cooperative Unit",
    equipment: "Hydraulic Trolley & Cane Cutters",
  },
  {
    id: 7,
    name: "Pedakakani Fresh Fields FPO (Harvesting Gang)",
    state: "Andhra Pradesh",
    location: "Guntur, Andhra Pradesh",
    specialty: "Teja Chili Picking & SRI Transplanting",
    groupSize: 14,
    wage: "₹420 / day",
    verified: "SFAC 10,000 FPO Scheme",
    equipment: "Manual Clean-Picking Crews",
  },
  {
    id: 8,
    name: "Mawana Sugarcane Mechanization Cooperative",
    state: "Uttar Pradesh",
    location: "Meerut, Uttar Pradesh",
    specialty: "Cane Cutting, Binding & Tractor Haulage",
    groupSize: 20,
    wage: "₹440 / day",
    verified: "Registered Cane Cooperative",
    equipment: "55HP Cane Haulage Rig",
  },
];

const ACTIVE_FARM_JOBS: FarmJobItem[] = [
  {
    id: 1,
    title: "Paddy Harvesting & Threshing Crew Needed",
    state: "Karnataka",
    location: "Navalgund, Dharwad, Karnataka",
    workersNeeded: 10,
    duration: "5 days",
    wage: "₹450 / day",
    perk: "Tractor pickup & rest shed provided",
    timing: "7:00 AM – 4:00 PM",
  },
  {
    id: 2,
    title: "Sugarcane Harvesting & Tractor Loading",
    state: "Karnataka",
    location: "Pandavapura, Mandya, Karnataka",
    workersNeeded: 8,
    duration: "6 days",
    wage: "₹470 / day",
    perk: "Daily cash payment at muster",
    timing: "6:30 AM – 3:30 PM",
  },
  {
    id: 3,
    title: "Wheat Combine Harvester Assistance & Bagging",
    state: "Punjab",
    location: "Jagraon, Ludhiana, Punjab",
    workersNeeded: 8,
    duration: "4 days",
    wage: "₹510 / day",
    perk: "Tube-well room with electricity",
    timing: "8:00 AM – 5:00 PM",
  },
  {
    id: 4,
    title: "Super Seeder Operation & Field Bunding",
    state: "Punjab",
    location: "Khanna, Ludhiana, Punjab",
    workersNeeded: 4,
    duration: "3 days",
    wage: "₹520 / day",
    perk: "Field lunch & tea provided",
    timing: "7:30 AM – 4:30 PM",
  },
  {
    id: 5,
    title: "Grape Vineyard Summer Canopy Pruning",
    state: "Maharashtra",
    location: "Niphad, Nashik, Maharashtra",
    workersNeeded: 6,
    duration: "7 days",
    wage: "₹430 / day",
    perk: "Shared tempo transport from market",
    timing: "7:30 AM – 3:30 PM",
  },
  {
    id: 6,
    title: "Teja Red Chili Plucking & Sun-Drying",
    state: "Andhra Pradesh",
    location: "Pedakakani, Guntur, Andhra Pradesh",
    workersNeeded: 15,
    duration: "10 days",
    wage: "₹420 / day",
    perk: "Shaded drying platform & drinking water",
    timing: "7:00 AM – 4:00 PM",
  },
  {
    id: 7,
    title: "Ratoon Sugarcane Cutting & Haulage",
    state: "Uttar Pradesh",
    location: "Mawana, Meerut, Uttar Pradesh",
    workersNeeded: 12,
    duration: "8 days",
    wage: "₹440 / day",
    perk: "Tractor haulage with hydraulic trolley",
    timing: "7:00 AM – 4:00 PM",
  },
];

export function WorkersConnectHomeSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).workers;

  const [selectedState, setSelectedState] = useState<SelectedState>("All States");
  const [viewMode, setViewMode] = useState<"both" | "hire_workers" | "find_jobs">("both");

  // Filter collections by selected state
  const filteredCollectives = selectedState === "All States"
    ? VERIFIED_COLLECTIVES.slice(0, 4)
    : VERIFIED_COLLECTIVES.filter(c => c.state === selectedState);

  const filteredJobs = selectedState === "All States"
    ? ACTIVE_FARM_JOBS.slice(0, 4)
    : ACTIVE_FARM_JOBS.filter(j => j.state === selectedState);

  const currentBenchmark = STATE_BENCHMARKS[selectedState];

  return (
    <section id="workers-connect" className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {t.subtitle}
          </p>
        </div>

        {/* State Selection Bar & Benchmark Intelligence */}
        <div className="bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Select State / राज्य चुनें:
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center gap-1 bg-stone-200/70 dark:bg-stone-700/60 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
              <button
                onClick={() => setViewMode("both")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "both"
                    ? "bg-white dark:bg-stone-900 text-emerald-800 dark:text-white shadow-2xs font-bold"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                }`}
              >
                All Opportunities
              </button>
              <button
                onClick={() => setViewMode("hire_workers")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "hire_workers"
                    ? "bg-emerald-700 text-white shadow-2xs font-bold"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                }`}
              >
                Hire Workers
              </button>
              <button
                onClick={() => setViewMode("find_jobs")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "find_jobs"
                    ? "bg-amber-600 text-white shadow-2xs font-bold"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                }`}
              >
                Find Jobs
              </button>
            </div>
          </div>

          {/* State Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {ALL_STATES.map((st) => {
              const isSelected = selectedState === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-xs font-bold ring-2 ring-emerald-700/20"
                      : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Wage Benchmark Banner for the chosen state */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200/80 dark:border-stone-700/70 text-xs">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{currentBenchmark.text}</span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
              Source: {currentBenchmark.source}
            </span>
          </div>
        </div>

        {/* Dynamic Dual Pathway Grid */}
        <div className={`grid gap-6 sm:gap-8 items-stretch ${
          viewMode === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}>
          
          {/* ======================================================== */}
          {/* CARD A: HIRE WORKERS & LABOUR COLLECTIVES (FOR FARMERS)  */}
          {/* ======================================================== */}
          {(viewMode === "both" || viewMode === "hire_workers") && (
            <div className="rounded-3xl p-6 sm:p-8 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                    For Farmers
                  </span>
                  <span className="text-xs text-stone-500 font-medium">Seasonal Labour & Machinery Crews</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                    {t.cardWorkersTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                    {t.cardWorkersDesc}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2 pt-1 text-xs text-stone-700 dark:text-stone-300 font-medium">
                  {t.cardWorkersPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Live Filtered Collectives List */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {selectedState === "All States" ? t.sampleWorkersTitle : `Verified Groups in ${selectedState}`}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {filteredCollectives.length} Groups Available
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredCollectives.map((coll) => (
                      <div
                        key={coll.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/50 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                              {coll.name}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/20">
                              {coll.verified}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{coll.location}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              {coll.specialty}
                            </span>
                            {coll.equipment && (
                              <>
                                <span>&bull;</span>
                                <span className="text-stone-500 text-[10px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                  {coll.equipment}
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-stone-900 dark:text-white block">
                            {coll.wage}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {coll.groupSize} workers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <Link
                  href={selectedState === "All States"
                    ? "/worker-connect?tab=find_workers"
                    : `/worker-connect?tab=find_workers&state=${encodeURIComponent(selectedState)}`
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {selectedState === "All States"
                      ? t.cardWorkersCta
                      : `Hire Farm Workers in ${selectedState}`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CARD B: FIND FARMING JOBS (FOR LABOURERS & WORKERS)      */}
          {/* ======================================================== */}
          {(viewMode === "both" || viewMode === "find_jobs") && (
            <div className="rounded-3xl p-6 sm:p-8 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-2xs">
                    For Farm Workers
                  </span>
                  <span className="text-xs text-stone-500 font-medium">Agricultural Employment & Fair Wages</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                    {t.cardJobsTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                    {t.cardJobsDesc}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2 pt-1 text-xs text-stone-700 dark:text-stone-300 font-medium">
                  {t.cardJobsPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Live Filtered Farm Jobs List */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {selectedState === "All States" ? t.sampleJobsTitle : `Active Openings in ${selectedState}`}
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                      {filteredJobs.length} Jobs Open
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-500/50 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="font-bold text-xs text-stone-900 dark:text-white truncate block">
                            {job.title}
                          </span>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{job.location}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="text-stone-700 dark:text-stone-300 font-medium">
                              {job.perk}
                            </span>
                            <span>&bull;</span>
                            <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {job.timing}
                            </span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 block">
                            {job.wage}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {job.workersNeeded} needed ({job.duration})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <Link
                  href={selectedState === "All States"
                    ? "/worker-connect?tab=find_jobs"
                    : `/worker-connect?tab=find_jobs&state=${encodeURIComponent(selectedState)}`
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {selectedState === "All States"
                      ? t.cardJobsCta
                      : `Explore Farm Jobs in ${selectedState}`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Protection & Consent Verification Banner */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-start sm:items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[12px] leading-relaxed">
            <strong className="text-emerald-950 dark:text-white font-semibold">Strict Privacy & Zero Commission:</strong> KisaanBuddy protects worker privacy under DPDP principles. Direct contact is shared only upon worker consent. All wages displayed follow official Ministry of Labour (Labour Bureau WRRI) benchmarks.
          </p>
        </div>

      </div>
    </section>
  );
}
