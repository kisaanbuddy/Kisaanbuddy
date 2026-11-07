export interface FounderProfile {
  id: 'aditya' | 'utkarsh' | 'yash';
  name: string;
  role: string;
  badge: string;
  expertise: string;
  expertiseTags: string[];
  education: string;
  institution: string;
  location: string;
  email: string;
  linkedin: string;
  linkedinVerified: boolean;
  image: string;
  imageFallback: string;
  shortBio: string;
  fullBio: string;
  verifiedContributions: string[];
  responsibilities: string[];
  quote: string;
  gradient: string;
}

export const FOUNDERS_DATA: FounderProfile[] = [
  {
    id: 'aditya',
    name: 'Aditya Ishwar',
    role: 'Founder, CEO & Chief Architect',
    badge: 'Founder & CEO',
    expertise: 'Full-Stack Architecture, AI Systems & Rural Cloud Infrastructure',
    expertiseTags: ['Full-Stack Systems', 'Conversational AI', 'Rural Latency Optimization', 'Next.js & FastAPI'],
    education: 'B.E. in Engineering',
    institution: 'RV College of Engineering (RVCE), Bengaluru',
    location: 'Bengaluru, Karnataka, India',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/aditya-ishwar',
    linkedinVerified: true,
    image: '/images/founders/aditya-ishwar.webp',
    imageFallback: '/aditya.png',
    shortBio:
      'Drives the technical vision and engineering roadmap of KisaanBuddy. Leads full-stack architecture, conversational AI integrations, and production deployment with the conviction that advanced agricultural software must be practical and accessible to every Indian farmer.',
    fullBio:
      'Aditya is the Founder and Principal Architect of KisaanBuddy. He architects the end-to-end cloud infrastructure, low-latency API gateways, and multimodal conversational AI layers that enable Indian farmers to interact with deep agronomic data through vernacular voice and simple touch interfaces. Grounded in rural reality, Aditya focuses on designing lightweight web applications that execute reliably even on 2G/3G edge connections.',
    verifiedContributions: [
      'Architected KisaanBuddy from inception as an authentic, reality-first agricultural platform.',
      'Designed end-to-end cloud infrastructure using Next.js, FastAPI, PostgreSQL, and edge caching.',
      'Engineered vernacular voice assistant pipeline integrating Sarvam AI STT/TTS across 11 regional Indian languages.',
      'Pioneered sub-second API routing for live APMC mandi prices and hyper-local meteorological forecasts.',
    ],
    responsibilities: [
      'Core Platform Architecture & Systems Engineering',
      'Conversational AI Workflows & Multilingual Speech Pipelines',
      'Production Deployment, Security & Latency Optimization',
      'Technical Product Strategy & Engineering Roadmap',
    ],
    quote:
      'Farming is India’s lifeblood. Our goal is simple: put the world’s most capable agricultural intelligence into the hands of every farmer in their own mother tongue.',
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
  },
  {
    id: 'utkarsh',
    name: 'Utkarsh Sinha',
    role: 'Co-Founder & Managing Director',
    badge: 'Co-Founder & MD',
    expertise: 'Machine Learning Pipelines, Computer Vision & Agricultural Data Systems',
    expertiseTags: ['Agronomic ML', 'Plant Pathology Vision', 'AGMARKNET Ingestion', 'Soil Chemistry Models'],
    education: 'B.E. in Engineering',
    institution: 'RV College of Engineering (RVCE), Bengaluru',
    location: 'Bengaluru, Karnataka, India',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/utkarsh-sinha',
    linkedinVerified: true,
    image: '/images/founders/utkarsh-sinha.webp',
    imageFallback: '/utkarsh.png',
    shortBio:
      'Directs the machine learning and agricultural intelligence pipelines at KisaanBuddy. Focuses on crop advisory algorithms, disease diagnosis accuracy, and AGMARKNET market price pipelines to turn raw agricultural data into actionable guidance.',
    fullBio:
      'Utkarsh leads machine learning engineering and data architecture at KisaanBuddy. He designs the crop recommendation algorithms, computer vision models for crop leaf pathology, and real-time mandi data validation pipelines. Utkarsh ensures that every agronomic advisory delivered to a farmer is cross-checked against documented ICAR/KVK agricultural standards and official market datasets.',
    verifiedContributions: [
      'Built crop disease detection models trained on Indian crop leaf pathology datasets.',
      'Engineered AGMARKNET automated ingestion pipeline processing thousands of daily commodity mandi rates.',
      'Implemented soil chemistry optimization algorithms correlating N-P-K ratios with regional crop yields.',
      'Enforced strict reality-first data integrity benchmarks across all agricultural recommendation models.',
    ],
    responsibilities: [
      'Crop Advisory & Pathology Machine Learning Models',
      'AGMARKNET Mandi Price Ingestion & Health Checks',
      'Agronomy Knowledge Base & Soil Chemistry Intelligence',
      'Data Integrity, Validation & Fallback Systems',
    ],
    quote:
      'Data in agriculture is only valuable when it is genuine, verified, and translated into decisions that protect a farmer’s harvest and income.',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-700',
  },
  {
    id: 'yash',
    name: 'Yash Singh',
    role: 'Co-Founder & CMO',
    badge: 'Co-Founder & CMO',
    expertise: 'Farmer Outreach, Rural Adoption & Community-Led Growth',
    expertiseTags: ['Farmer Grassroots Outreach', 'Field Usability Testing', 'AgTech Adoption', 'Vernacular Engagement'],
    education: 'B.E. in Engineering',
    institution: 'RV College of Engineering (RVCE), Bengaluru',
    location: 'Bengaluru, Karnataka, India',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/yash-singh-33553b2a5',
    linkedinVerified: true,
    image: '/images/founders/yash-singh.webp',
    imageFallback: '/yash.png',
    shortBio:
      'Leads grassroots outreach, farmer feedback loops, and user adoption for KisaanBuddy. Works directly with farming communities to understand real field obstacles and ensure the platform solves authentic everyday agricultural problems.',
    fullBio:
      'Yash spearheads grassroots engagement and farmer outreach at KisaanBuddy. He spends time in rural mandis, farmer producer organizations (FPOs), and village clusters to conduct hands-on usability testing with farmers. Yash translates grassroots feedback directly into product requirements, driving the adoption of vernacular features and ensuring technology empowers farmers without steep learning curves.',
    verifiedContributions: [
      'Organized village-level usability trials across Karnataka and northern agricultural belts.',
      'Spearheaded farmer feedback loops that directly shaped the 1-click voice assistant and mandi search.',
      'Established partnerships with rural youth ambassadors and agricultural extension workers.',
      'Designed vernacular onboarding workflows that eliminated technical friction for non-English speakers.',
    ],
    responsibilities: [
      'Rural Community Outreach & Farmer Onboarding',
      'User Experience Feedback & Ground Truth Testing',
      'Strategic Partnerships & Agricultural Extension Engagement',
      'Vernacular Content Strategy & Product Communication',
    ],
    quote:
      'True technology innovation in India doesn’t happen in an office tower; it happens when a farmer standing in muddy boots in a field can use your tool effortlessly.',
    gradient: 'from-amber-600 via-emerald-600 to-teal-700',
  },
];
