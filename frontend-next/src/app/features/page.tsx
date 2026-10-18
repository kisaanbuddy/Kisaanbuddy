import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Bug,
  CloudSun,
  FlaskConical,
  TrendingUp,
  Store,
  Landmark,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Languages,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features — KisaanBuddy Agricultural Intelligence Platform",
  description:
    "Explore KisaanBuddy's full suite of agricultural tools: AI Farm Advisor, Crop Doctor, Mandi Prices, Weather Advisory, Soil Health, and Direct Marketplace.",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Farm Advisor",
    category: "Intelligent Advisory",
    image: "/images/farmers/farmer-field-tending.jpg",
    imageAlt: "Indian farmer working in field managing nutrient application",
    description:
      "Conversational agronomy assistant personalized to your specific crop variety, sowing date, soil pH, and microclimate. Available in 10 Indian languages with voice input.",
    href: "/chatbot",
    cta: "Consult AI Advisor",
    accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    icon: Layers,
    title: "Farmer Profile & Plot Mapping",
    category: "Farm Management",
    image: "/images/crops/indian-paddy-field.jpg",
    imageAlt: "Lush green agricultural crop field in rural India",
    description:
      "A permanent digital identity storing acreage, soil type, irrigation facilities, and individual plot-to-crop mappings for tailored, season-long guidance.",
    href: "/profile",
    cta: "Manage Farm Profile",
    accent: "text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300",
  },
  {
    icon: Bug,
    title: "Crop Doctor",
    category: "Disease Diagnostics",
    image: "/images/crop-doctor/powdery-mildew-leaf.jpg",
    imageAlt: "Close-up of crop leaf diagnosed with fungal mildew",
    description:
      "Instant visual disease identification powered by computer vision. Upload a leaf photo to diagnose symptoms, assess fungal pressure, and receive approved treatment steps.",
    href: "/disease",
    cta: "Diagnose Crops",
    accent: "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300",
  },
  {
    icon: CloudSun,
    title: "Agro-Weather & Operational Risk",
    category: "Field Climate",
    image: "/images/weather/monsoon-farmland.jpg",
    imageAlt: "Indian agricultural landscape under monsoon clouds",
    description:
      "Hyperlocal forecast combined with operational decision support: pesticide spray suitability, optimal irrigation windows, and heat stress alerts.",
    href: "/weather",
    cta: "Check Forecast",
    accent: "text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300",
  },
  {
    icon: FlaskConical,
    title: "Soil Health & Nutrient Balancer",
    category: "Soil Science",
    image: "/images/soil/soil-ph-testing.jpg",
    imageAlt: "Scientific field soil pH and nutrient test with color chart",
    description:
      "Track N-P-K reserves, organic carbon percentage, and soil pH. Distinguishes lab-verified Soil Health Cards from baseline farmer estimates.",
    href: "/soil-health",
    cta: "View Soil Health",
    accent: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  {
    icon: TrendingUp,
    title: "Mandi Market Intelligence",
    category: "Market Prices",
    image: "/images/mandi/grain-market-mandi.jpg",
    imageAlt: "Wholesale grain market with bags of harvested crops",
    description:
      "Real-time commodity arrival rates across Indian APMC mandis powered by official AGMARKNET feeds. Compare regional rates and spot price trends.",
    href: "/mandi",
    cta: "Track Mandi Rates",
    accent: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    icon: Store,
    title: "Direct Marketplace (Buyers & Sellers)",
    category: "Trade & Inputs",
    image: "/images/marketplace/vegetable-mandi.jpg",
    imageAlt: "Vegetable mandi vendor with fresh crates of farm produce",
    description:
      "Direct connection between farmers, verified institutional buyers, FPOs, and certified agricultural input sellers without middleman exploitation.",
    href: "/marketplace",
    cta: "Explore Marketplace",
    accent: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300",
  },
  {
    icon: Landmark,
    title: "Government Schemes Discovery",
    category: "Farmer Welfare",
    image: "/images/hero/hero-indian-farmer.jpg",
    imageAlt: "Indian farmer in field accessing agricultural subsidies",
    description:
      "Filterable catalog of state and central agricultural schemes (PM-Kisan, PMFBY, drip subsidies, solar pumps) with official guidelines and direct application links.",
    href: "/schemes",
    cta: "Discover Schemes",
    accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
  },
  {
    icon: BookOpen,
    title: "Khet Diary & Crop Lifecycles",
    category: "Farm Records",
    image: "/images/crops/punjab-wheat-field.jpg",
    imageAlt: "Healthy wheat crop field in Phagwara Punjab",
    description:
      "Digital ledger to log fertilizer applications, sprayings, harvests, labour expenses, and crop sale revenues to understand your true seasonal profitability.",
    href: "/khet-diary",
    cta: "Open Khet Diary",
    accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Create Your Farm Profile",
    description: "Register your village location, total land size, and available irrigation facilities.",
  },
  {
    step: "02",
    title: "Add Crops & Field Details",
    description: "Map your plots, active crops, seed varieties, and sowing dates.",
  },
  {
    step: "03",
    title: "Get Personalized Farm Insights",
    description: "Receive AI guidance tailored to your actual soil status, weather, and crop stages.",
  },
  {
    step: "04",
    title: "Plan Activities & Connect with Buyers",
    description: "Schedule daily farm operations and discover verified buyers for your harvest.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Complete Agricultural Platform
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tools Built for Every Step of the Farming Cycle
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          From soil testing and sowing schedules to pest management, mandi prices, and harvest buyers—KisaanBuddy gives you the edge to maximize crop yield and farm profit.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur shadow-xs border border-white/20">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/40 relative overflow-hidden">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
            How KisaanBuddy Works for Your Farm
          </h2>
          <p className="text-sm text-emerald-100/80 mt-2">
            No technical skills required. Designed for Indian farmers with support for regional languages and voice input.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((w) => (
            <div
              key={w.step}
              className="bg-emerald-900/50 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-5 space-y-2"
            >
              <div className="text-2xl font-black text-emerald-400">{w.step}</div>
              <h3 className="text-sm font-bold text-white">{w.title}</h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">{w.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Capabilities & Technology Integrity */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Verified Capabilities & Open Standards
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backed by official data sources and privacy-first Indian engineering
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                10 Regional Languages & Voice
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hindi, English, Kannada, Telugu, Tamil, Malayalam, Marathi, Bengali, Punjabi, and Gujarati.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                Official APMC Feeds
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct integration with AGMARKNET daily arrivals and mandi price bulletins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                Hardware Independent
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect physical ESP32 soil probes if available, or enjoy full features through satellite weather & manual records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="text-center py-6">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-95"
        >
          <span>Start Free Farm Setup</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
