export interface BlogPost {
  title: { en: string; hi: string };
  slug: string;
  description: { en: string; hi: string };
  author: { en: string; hi: string };
  publishedDate: string;
  updatedDate: string;
  category: 'weather' | 'schemes' | 'soil' | 'mandi' | 'disease';
  tags: { en: string[]; hi: string[] };
  featuredImage: string;
  content: { en: string; hi: string };
  faq: { en: { q: string; a: string }[]; hi: { q: string; a: string }[] };
  relatedArticles: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: {
      en: "Managing Soil Health for Wheat Cultivation in Punjab",
      hi: "पंजाब में गेहूं की खेती के लिए मिट्टी के स्वास्थ्य का प्रबंधन"
    },
    slug: "soil-health-wheat-punjab",
    description: {
      en: "A comprehensive guide on maintaining organic carbon, using NPK fertilizers, and testing soil health for Punjab wheat farmers.",
      hi: "पंजाब के गेहूं किसानों के लिए जैविक कार्बन बनाए रखने, एनपीके उर्वरकों के उपयोग और मिट्टी के स्वास्थ्य के परीक्षण पर एक व्यापक गाइड।"
    },
    author: {
      en: "Dr. Gurbachan Singh, Soil Scientist",
      hi: "डॉ. गुरबचन सिंह, मृदा वैज्ञानिक"
    },
    publishedDate: "2026-05-10",
    updatedDate: "2026-06-15",
    category: "soil",
    tags: {
      en: ["soil testing", "wheat cultivation", "punjab agriculture", "NPK fertilizers"],
      hi: ["मिट्टी का परीक्षण", "गेहूं की खेती", "पंजाब कृषि", "एनपीके उर्वरक"]
    },
    featuredImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Soil health is the foundation of high-yielding agriculture. In Punjab's Ludhiana district, farmer Baldev Singh faced declining wheat yields despite increasing his fertilizer application. After testing his soil at the local KVK, he discovered a severe deficiency in organic carbon and zinc. This guide outlines how to restore soil vitality.

First, understand the NPK ratio. For wheat in Punjab, the recommended ratio is 4:2:1 (Nitrogen, Phosphorus, and Potassium). Many farmers apply excess Urea (nitrogen) which burns the organic carbon in the soil. Soil organic carbon (SOC) should ideally be above 0.75%, but in many Punjab districts, it has dropped below 0.40% due to intensive farming and paddy residue burning.

To improve SOC, incorporate crop residues using a Happy Seeder instead of burning them. Additionally, apply 5 tonnes of well-decomposed Farm Yard Manure (FYM) per acre during field preparation. Zinc deficiency can be corrected by applying 10 kg of Zinc Sulphate (21% Zn) per acre. Testing your soil pH is also critical; a pH range of 6.5 to 7.5 is ideal for wheat root development.`,
      hi: `मिट्टी का स्वास्थ्य उच्च उपज वाली कृषि की आधारशिला है। पंजाब के लुधियाना जिले में, किसान बलदेव सिंह ने उर्वरक के बढ़ते इस्तेमाल के बावजूद गेहूं की घटती उपज का सामना किया। स्थानीय केवीके में अपनी मिट्टी का परीक्षण कराने के बाद, उन्हें जैविक कार्बन और जिंक की भारी कमी का पता चला। यह गाइड मिट्टी की जीवन शक्ति को बहाल करने के तरीकों को रेखांकित करती है।

सबसे पहले, एनपीके (NPK) अनुपात को समझें। पंजाब में गेहूं के लिए अनुशंसित अनुपात 4:2:1 (नाइट्रोजन, फास्फोरस और पोटेशियम) है। कई किसान अत्यधिक यूरिया (नाइट्रोजन) का उपयोग करते हैं जो मिट्टी में मौजूद जैविक कार्बन को नष्ट कर देता है। आदर्श रूप से मिट्टी में जैविक कार्बन (SOC) 0.75% से अधिक होना चाहिए, लेकिन गहन खेती और धान के अवशेषों को जलाने के कारण पंजाब के कई जिलों में यह 0.40% से नीचे गिर गया है।

जैविक कार्बन को बढ़ाने के लिए, फसल के अवशेषों को जलाने के बजाय हैप्पी सीडर का उपयोग करके उन्हें मिट्टी में मिलाएं। इसके अलावा, खेत की तैयारी के दौरान प्रति एकड़ 5 टन अच्छी तरह से सड़ी हुई गोबर की खाद (FYM) डालें। जिंक की कमी को प्रति एकड़ 10 किलोग्राम जिंक सल्फेट (21% Zn) डालकर ठीक किया जा सकता है। मिट्टी के पीएच (pH) का परीक्षण भी महत्वपूर्ण है; गेहूं की जड़ों के विकास के लिए 6.5 से 7.5 का पीएच स्तर आदर्श है।`
    },
    faq: {
      en: [
        { q: "What is the ideal NPK ratio for Punjab wheat?", a: "The recommended NPK ratio is 4:2:1, translating to 50 kg N, 25 kg P2O5, and 12 kg K2O per acre." },
        { q: "How can I increase organic carbon in my soil?", a: "By applying organic manure (FYM), composting, and avoiding crop residue burning." }
      ],
      hi: [
        { q: "पंजाब में गेहूं के लिए आदर्श एनपीके अनुपात क्या है?", a: "अनुशंसित एनपीके अनुपात 4:2:1 है, जिसका अर्थ प्रति एकड़ 50 किलो नाइट्रोजन, 25 किलो फास्फोरस और 12 किलो पोटेशियम है।" },
        { q: "मैं अपनी मिट्टी में जैविक कार्बन कैसे बढ़ा सकता हूँ?", a: "गोबर की खाद (FYM) डालकर, खाद बनाकर और फसल अवशेषों को जलाने से बचकर।" }
      ]
    },
    relatedArticles: ["fertilizer-management-npk", "farming-logs-khet-diary"]
  },
  {
    title: {
      en: "PM-Kisan and State Farm Subsidy Schemes: A Complete Guide",
      hi: "पीएम-किसान और राज्य कृषि सब्सिडी योजनाएं: एक पूर्ण गाइड"
    },
    slug: "pm-kisan-subsidies-guide",
    description: {
      en: "Learn how to apply for PM-Kisan Samman Nidhi, check beneficiary status, and access state-specific farm machinery subsidies.",
      hi: "पीएम-किसान सम्मान निधि के लिए आवेदन करने, लाभार्थी की स्थिति जांचने और राज्य-विशिष्ट कृषि मशीनरी सब्सिडी प्राप्त करने का तरीका जानें।"
    },
    author: {
      en: "Rajesh Kumar, Agri-Extension Officer",
      hi: "राजेश कुमार, कृषि विस्तार अधिकारी"
    },
    publishedDate: "2026-05-15",
    updatedDate: "2026-06-18",
    category: "schemes",
    tags: {
      en: ["government schemes", "PM-Kisan", "agriculture subsidies", "crop insurance"],
      hi: ["सरकारी योजनाएं", "पीएम-किसान", "कृषि सब्सिडी", "फसल बीमा"]
    },
    featuredImage: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `The Indian Government runs multiple financial support systems to help small and marginal farmers cover input costs. The flagship PM-Kisan Samman Nidhi scheme provides Rs. 6,000 annually in three equal installments of Rs. 2,000 directly to the bank accounts of landholder farmers.

To register for PM-Kisan, farmers need their land cultivation documents (Khatauni), Aadhaar card, and an active bank account linked with Aadhaar. In Uttar Pradesh, farmer Satish Mishra struggled to receive his 14th installment due to pending e-KYC. Doing biometric e-KYC at a Common Service Center (CSC) resolved the issue.

State schemes also offer additional subsidies. For instance, the Sub-Mission on Agricultural Mechanization (SMAM) provides 40% to 80% subsidies on tractors, seeders, and solar pumps. Farmers in Rajasthan can apply through the Raj Kisan Sathi portal, while Uttar Pradesh farmers use the UP Agriculture portal.`,
      hi: `भारत सरकार छोटे और सीमांत किसानों को इनपुट लागतों को पूरा करने में मदद करने के लिए कई वित्तीय सहायता प्रणालियाँ चलाती है। प्रमुख पीएम-किसान सम्मान निधि योजना भूमि धारक किसानों के बैंक खातों में सीधे तीन समान किस्तों में सालाना 6,000 रुपये प्रदान करती है।

पीएम-किसान के लिए पंजीकरण करने के लिए, किसानों को अपने भूमि दस्तावेजों (खतौनी), आधार कार्ड और आधार से जुड़े बैंक खाते की आवश्यकता होती है। उत्तर प्रदेश में, किसान सतीश मिश्रा को लंबित ई-केवाईसी के कारण अपनी 14वीं किस्त प्राप्त करने में कठिनाई हुई। कॉमन सर्विस सेंटर (CSC) पर बायोमेट्रिक ई-केवाईसी कराने से यह समस्या हल हो गई।

राज्य की योजनाएं अतिरिक्त सब्सिडी भी प्रदान करती हैं। उदाहरण के लिए, कृषि यंत्रीकरण पर उप-मिशन (SMAM) ट्रैक्टरों, सीडर्स और सोलर पंपों पर 40% से 80% तक की सब्सिडी प्रदान करता है। राजस्थान में किसान राज किसान साथी पोर्टल के माध्यम से आवेदन कर सकते हैं, जबकि उत्तर प्रदेश के किसान यूपी एग्रीकल्चर पोर्टल का उपयोग करते हैं।`
    },
    faq: {
      en: [
        { q: "Who is eligible for PM-Kisan?", a: "All landholding farmer families who own cultivable land in their names are eligible." },
        { q: "Is e-KYC mandatory for PM-Kisan?", a: "Yes, e-KYC is mandatory to receive installments under the PM-Kisan scheme." }
      ],
      hi: [
        { q: "पीएम-किसान योजना के लिए कौन पात्र है?", a: "सभी भूमिधारक किसान परिवार जिनके नाम पर कृषि योग्य भूमि है, वे पात्र हैं।" },
        { q: "क्या पीएम-किसान के लिए ई-केवाईसी अनिवार्य है?", a: "हां, पीएम-किसान योजना के तहत किस्तें प्राप्त करने के लिए ई-केवाईसी अनिवार्य है।" }
      ]
    },
    relatedArticles: ["crop-insurance-pmfby", "solar-pump-subsidies-kusum"]
  },
  {
    title: {
      en: "Understanding Crop Insurance (PMFBY) and How to Claim",
      hi: "फसल बीमा (PMFBY) को समझना और दावा कैसे करें"
    },
    slug: "crop-insurance-pmfby",
    description: {
      en: "Steps to enroll in Pradhan Mantri Fasal Bima Yojana, report crop damage within 72 hours, and secure timely payouts.",
      hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY) में नामांकन करने, 72 घंटों के भीतर फसल के नुकसान की रिपोर्ट करने और समय पर भुगतान प्राप्त करने के कदम।"
    },
    author: {
      en: "S. K. Verma, Agronomist & Rural Insurance Expert",
      hi: "एस. के. वर्मा, कृषि विज्ञानी और ग्रामीण बीमा विशेषज्ञ"
    },
    publishedDate: "2026-05-18",
    updatedDate: "2026-06-12",
    category: "schemes",
    tags: {
      en: ["crop insurance", "PMFBY", "natural disaster", "farmer safety"],
      hi: ["फसल बीमा", "PMFBY", "प्राकृतिक आपदा", "किसान सुरक्षा"]
    },
    featuredImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Natural calamities like unseasonal rain, hailstorms, and droughts can destroy months of hard work in a single day. The Pradhan Mantri Fasal Bima Yojana (PMFBY) is designed to mitigate this risk. The premium is heavily subsidized, with farmers paying only 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.

Enrollment can be done online via the PMFBY portal, through cooperative banks, or CSC centers. The crucial step is claiming insurance. In Madhya Pradesh, farmer Hari Ram lost 4 acres of soybean to waterlogging. He did not know he had to report the damage within 72 hours. Delayed reporting leads to claim rejection.

To secure a payout, report crop loss within 72 hours using the Crop Insurance App, or directly to the insurance company, bank, or local agriculture officer. Provide proof of sowing, land records, and photographs of the damaged crop.`,
      hi: `असामयिक वर्षा, ओलावृष्टि और सूखे जैसी प्राकृतिक आपदाएं एक ही दिन में महीनों की कड़ी मेहनत को बर्बाद कर सकती हैं। प्रधानमंत्री फसल बीमा योजना (PMFBY) इस जोखिम को कम करने के लिए बनाई गई है। इसका प्रीमियम काफी कम है, किसानों को खरीफ फसलों के लिए केवल 2%, रबी फसलों के लिए 1.5% और वाणिज्यिक/बागवानी फसलों के लिए 5% भुगतान करना पड़ता है।

नामांकन पीएमएफबीवाई पोर्टल, सहकारी बैंकों या सीएससी केंद्रों के माध्यम से ऑनलाइन किया जा सकता है। बीमा का दावा करना सबसे महत्वपूर्ण कदम है। मध्य प्रदेश में, किसान हरि राम ने जलभराव के कारण 4 एकड़ सोयाबीन खो दी। उन्हें नहीं पता था कि नुकसान की रिपोर्ट 72 घंटों के भीतर करनी होती है। देरी से रिपोर्ट करने पर दावा खारिज हो जाता है।

भुगतान सुरक्षित करने के लिए, 'क्रॉप इंश्योरेंस ऐप' का उपयोग करके या सीधे बीमा कंपनी, बैंक या स्थानीय कृषि अधिकारी को 72 घंटों के भीतर फसल नुकसान की रिपोर्ट करें। बुवाई का प्रमाण, भूमि रिकॉर्ड और क्षतिग्रस्त फसल की तस्वीरें प्रदान करें।`
    },
    faq: {
      en: [
        { q: "What is the deadline to report crop damage?", a: "Crop damage must be reported within 72 hours of occurrence to the insurer or agricultural department." },
        { q: "How much premium do farmers pay under PMFBY?", a: "Farmers pay 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops." }
      ],
      hi: [
        { q: "फसल नुकसान की रिपोर्ट करने की समय सीमा क्या है?", a: "फसल नुकसान की रिपोर्ट घटना के 72 घंटों के भीतर बीमा कंपनी या कृषि विभाग को की जानी चाहिए।" },
        { q: "PMFBY के तहत किसान कितना प्रीमियम देते हैं?", a: "किसान खरीफ फसलों के लिए 2%, रबी फसलों के लिए 1.5% और वाणिज्यिक/बागवानी फसलों के लिए 5% प्रीमियम का भुगतान करते हैं।" }
      ]
    },
    relatedArticles: ["pm-kisan-subsidies-guide", "solar-pump-subsidies-kusum"]
  },
  {
    title: {
      en: "Optimizing Drip Irrigation for Cotton in Rajasthan",
      hi: "राजस्थान में कपास के लिए ड्रिप सिंचाई का अनुकूलन"
    },
    slug: "drip-irrigation-cotton-rajasthan",
    description: {
      en: "A guide on using micro-irrigation to boost cotton yields, save water, and manage soil salinity in dry climates like Rajasthan.",
      hi: "राजस्थान जैसी शुष्क जलवायु में कपास की उपज बढ़ाने, पानी बचाने और मिट्टी की लवणता प्रबंधित करने के लिए सूक्ष्म सिंचाई के उपयोग पर गाइड।"
    },
    author: {
      en: "Dr. Sandeep Jharwal, Dryland Agronomist",
      hi: "डॉ. संदीप झारवाल, शुष्क भूमि कृषि विज्ञानी"
    },
    publishedDate: "2026-05-22",
    updatedDate: "2026-06-10",
    category: "soil",
    tags: {
      en: ["drip irrigation", "cotton farming", "water conservation", "rajasthan agriculture"],
      hi: ["ड्रिप सिंचाई", "कपास की खेती", "जल संरक्षण", "राजस्थान कृषि"]
    },
    featuredImage: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Water scarcity is the biggest bottleneck in Rajasthan's agriculture, especially in districts like Sri Ganganagar and Hanumangarh. Cotton is a thirsty crop, but flood irrigation leads to water wastage and soil salinization. Transitioning to drip irrigation saves up to 40% water and increases yield by 25%.

Drip irrigation delivers water directly to the root zone, reducing weed growth and evaporation. For cotton, lateral pipes should be spaced 1.2 meters apart with drippers spaced 30 cm to 40 cm. Fertigation—applying liquid fertilizers through the drip system—improves nutrient uptake efficiency.

Farmer Hanuman Ram from Jodhpur installed a drip system with an 80% subsidy under the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY). By applying soluble NPK through drip lines, he reduced fertilizer costs by 30% and achieved a yield of 12 quintals per acre compared to 8 quintals previously.`,
      hi: `राजस्थान के कृषि क्षेत्र में पानी की कमी सबसे बड़ी चुनौती है, विशेष रूप से श्रीगंगानगर और हनुमानगढ़ जैसे जिलों में। कपास एक अधिक पानी चाहने वाली फसल है, लेकिन बाढ़ सिंचाई से पानी की बर्बादी और मिट्टी में लवणता बढ़ती है। ड्रिप सिंचाई अपनाने से 40% तक पानी की बचत होती है और उपज में 25% की वृद्धि होती है।

ड्रिप सिंचाई पानी को सीधे पौधों की जड़ों तक पहुँचाती है, जिससे खरपतवार की वृद्धि और वाष्पीकरण कम होता है। कपास के लिए, लेटरल पाइपों के बीच 1.2 मीटर की दूरी होनी चाहिए और ड्रिपर्स के बीच 30 सेमी से 40 सेमी की दूरी होनी चाहिए। फर्टिगेशन—यानी ड्रिप प्रणाली के माध्यम से तरल उर्वरक देना—पोषक तत्वों के अवशोषण की दक्षता में सुधार करता है।

जोधपुर के किसान हनुमान राम ने प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के तहत 80% सब्सिडी पर ड्रिप सिस्टम स्थापित किया। ड्रिप लाइनों के माध्यम से घुलनशील एनपीके (NPK) देकर, उन्होंने उर्वरक लागत को 30% तक कम कर दिया और पिछले 8 क्विंटल की तुलना में प्रति एकड़ 12 क्विंटल कपास की उपज प्राप्त की।`
    },
    faq: {
      en: [
        { q: "How much subsidy is available for drip systems in Rajasthan?", a: "Small and marginal farmers can get up to 70-80% subsidy under the PMKSY scheme depending on their category." },
        { q: "What is fertigation?", a: "Fertigation is the process of applying water-soluble fertilizers directly through the drip irrigation system." }
      ],
      hi: [
        { q: "राजस्थान में ड्रिप सिस्टम पर कितनी सब्सिडी उपलब्ध है?", a: "पीएमकेएसवाई योजना के तहत छोटे और सीमांत किसानों को उनकी श्रेणी के आधार पर 70-80% तक सब्सिडी मिल सकती है।" },
        { q: "फर्टिगेशन क्या है?", a: "फर्टिगेशन ड्रिप सिंचाई प्रणाली के माध्यम से सीधे पानी में घुलनशील उर्वरकों को देने की प्रक्रिया है।" }
      ]
    },
    relatedArticles: ["soil-health-wheat-punjab", "fertilizer-management-npk"]
  },
  {
    title: {
      en: "Identifying and Controlling Yellow Rust in Wheat",
      hi: "गेहूं में पीला रतुआ (येलो रस्ट) की पहचान और नियंत्रण"
    },
    slug: "yellow-rust-wheat-control",
    description: {
      en: "How to spot yellow stripes on wheat leaves, choose rust-resistant varieties, and apply chemical fungicides effectively.",
      hi: "गेहूं के पत्तों पर पीली धारियों की पहचान करने, रस्ट-प्रतिरोधी किस्मों का चयन करने और रासायनिक कवकनाशियों को प्रभावी ढंग से लागू करने का तरीका।"
    },
    author: {
      en: "Dr. Meenakshi Pathak, Plant Pathologist",
      hi: "डॉ. मीनाक्षी पाठक, पादप रोगविज्ञानी"
    },
    publishedDate: "2026-05-28",
    updatedDate: "2026-06-14",
    category: "disease",
    tags: {
      en: ["wheat disease", "yellow rust", "fungicides", "crop health"],
      hi: ["गेहूं का रोग", "पीला रतुआ", "कवकनाशी", "फसल स्वास्थ्य"]
    },
    featuredImage: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Yellow rust, caused by the fungus Puccinia striiformis, is a major threat to wheat cultivation in Northern India, particularly in Haryana and Punjab. It appears as yellow powdery stripes on leaves, resembling turmeric powder, which hinders photosynthesis and reduces yield drastically.

Early detection is key. Walk your fields daily during cool, humid spells in January and February. If you spot yellow dust that rubs off on your fingers, it is yellow rust. Avoid varieties that are highly susceptible. Instead, grow resistant varieties like DBW 187, DBW 222, or HD 3226.

For chemical control, if symptoms appear, spray Propiconazole 25% EC at 200 ml per acre mixed in 200 liters of water. A second spray may be needed after 15 days if cool weather persists. Avoid excessive nitrogen application, as it creates a dense canopy that favors fungal growth.`,
      hi: `पुकिनिया स्ट्रिफॉर्मिस नामक कवक के कारण होने वाला पीला रतुआ (येलो रस्ट), उत्तर भारत, विशेष रूप से हरियाणा और पंजाब में गेहूं की खेती के लिए एक बड़ा खतरा है। यह पत्तियों पर पीले रंग की पाउडर जैसी धारियों के रूप में दिखाई देता है, जो हल्दी पाउडर जैसी लगती हैं, जिससे प्रकाश संश्लेषण बाधित होता है और उपज में भारी गिरावट आती है।

शुरुआती पहचान महत्वपूर्ण है। जनवरी और फरवरी में ठंडे और आर्द्र मौसम के दौरान रोजाना अपने खेतों का निरीक्षण करें। यदि आपको पीली धूल दिखाई देती है जो आपकी उंगलियों पर रगड़ने से लग जाती है, तो यह पीला रतुआ है। ऐसी किस्मों से बचें जो इसके प्रति संवेदनशील हैं। इसके बजाय, प्रतिरोधी किस्में जैसे DBW 187, DBW 222, या HD 3226 उगाएं।

रासायनिक नियंत्रण के लिए, यदि लक्षण दिखाई दें, तो प्रति एकड़ 200 मिलीलीटर प्रोपिकोनाजोल 25% ईसी (Propiconazole 25% EC) को 200 लीटर पानी में मिलाकर स्प्रे करें। यदि ठंडा मौसम बना रहता है तो 15 दिनों के बाद दूसरा स्प्रे करने की आवश्यकता हो सकती है। नाइट्रोजन के अत्यधिक उपयोग से बचें, क्योंकि यह घनी छांव बनाता है जो कवक के विकास के अनुकूल होती है।`
    },
    faq: {
      en: [
        { q: "Which wheat varieties are resistant to yellow rust?", a: "Varieties like DBW 187, DBW 222, HD 3226, and HD 3086 show good resistance." },
        { q: "What fungicide should be sprayed for yellow rust?", a: "Propiconazole 25% EC (e.g. Tilt) sprayed at 200 ml per acre is highly effective." }
      ],
      hi: [
        { q: "गेहूं की कौन सी किस्में पीले रतुआ के प्रति प्रतिरोधी हैं?", a: "DBW 187, DBW 222, HD 3226 और HD 3086 जैसी किस्में अच्छा प्रतिरोध दिखाती हैं।" },
        { q: "पीले रतुआ के लिए किस कवकनाशी का छिड़काव करना चाहिए?", a: "प्रोपिकोनाजोल 25% ईसी (जैसे टिल्ट) का 200 मिली प्रति एकड़ की दर से छिड़काव अत्यधिक प्रभावी है।" }
      ]
    },
    relatedArticles: ["late-blight-potato-cure", "rice-blast-coastal-management"]
  },
  {
    title: {
      en: "Navigating Mandis: How to Sell Online via eNAM",
      hi: "मंडियों का सफर: ई-नाम (eNAM) के माध्यम से ऑनलाइन बेचने का तरीका"
    },
    slug: "mandi-online-sales-enam",
    description: {
      en: "A step-by-step guide for farmers to register on the Electronic National Agriculture Market (eNAM), quality-test produce, and receive direct payments.",
      hi: "किसानों के लिए इलेक्ट्रॉनिक नेशनल एग्रीकल्चर मार्केट (eNAM) पर पंजीकरण करने, उपज की गुणवत्ता जांचने और सीधे भुगतान प्राप्त करने के लिए स्टेप-बाय-स्टेप गाइड।"
    },
    author: {
      en: "Devendra Patil, APMC Marketing Director",
      hi: "देवेन्द्र पाटिल, एपीएमसी विपणन निदेशक"
    },
    publishedDate: "2026-06-02",
    updatedDate: "2026-06-17",
    category: "mandi",
    tags: {
      en: ["mandi rates", "eNAM", "online trading", "APMC market"],
      hi: ["मंडी भाव", "eNAM", "ऑनलाइन व्यापार", "एपीएमसी बाजार"]
    },
    featuredImage: "https://images.unsplash.com/photo-1506485338023-6ce5f36692df?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `The Electronic National Agriculture Market (eNAM) is a pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities. It allows farmers to showcase their products online, escape middleman exploitation, and discover competitive prices from buyers across different states.

To sell on eNAM, you can register through the eNAM mobile app or visit the help desk at an eNAM-enabled mandi. You will need your land document, identity proof, bank passbook, and mobile number. Once registered, bring your clean crop to the mandi gateway, where a gate entry slip with a barcode is generated.

Next comes assaying (quality testing). Mandi officials sample your crop for moisture content, foreign matter, and grain size. This report is uploaded to eNAM, and traders place online bids based on this report. Once you accept the highest bid, a sale agreement is generated, and payment is directly deposited into your bank account.`,
      hi: `इलेक्ट्रॉनिक नेशनल एग्रीकल्चर मार्केट (eNAM) एक अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल है जो कृषि उपज के लिए एक एकीकृत राष्ट्रीय बाजार बनाने के लिए मौजूदा एपीएमसी (APMC) मंडियों को जोड़ता है। यह किसानों को अपनी उपज ऑनलाइन प्रदर्शित करने, बिचौलियों के शोषण से बचने और विभिन्न राज्यों के खरीदारों से प्रतिस्पर्धी कीमतों की खोज करने की अनुमति देता है।

ई-नाम पर बेचने के लिए, आप ई-नाम मोबाइल ऐप के माध्यम से पंजीकरण कर सकते हैं या ई-नाम सक्षम मंडी में सहायता डेस्क पर जा सकते हैं। आपको अपने भूमि दस्तावेज, पहचान प्रमाण, बैंक पासबुक और मोबाइल नंबर की आवश्यकता होगी। पंजीकरण के बाद, अपनी साफ फसल मंडी गेट पर लाएं, जहां बारकोड वाली गेट एंट्री पर्ची बनाई जाती है।

इसके बाद गुणवत्ता परीक्षण (Assaying) होता है। मंडी अधिकारी नमी, बाहरी पदार्थ और अनाज के आकार के लिए आपकी फसल का नमूना लेते हैं। यह रिपोर्ट ई-नाम पर अपलोड की जाती है, और व्यापारी ऑनलाइन बोलियां लगाते हैं। उच्चतम बोली स्वीकार करने पर बिक्री समझौता बनता है और भुगतान सीधे बैंक खाते में जमा किया जाता है।`
    },
    faq: {
      en: [
        { q: "Is eNAM registration free?", a: "Yes, registration on the eNAM portal is completely free for all farmers." },
        { q: "How long does payment take on eNAM?", a: "Payments are directly deposited via online transfer into the farmer's bank account, usually within 24 to 48 hours." }
      ],
      hi: [
        { q: "क्या ई-नाम पंजीकरण मुफ्त है?", a: "हाँ, ई-नाम पोर्टल पर पंजीकरण सभी किसानों के लिए पूरी तरह से मुफ्त है।" },
        { q: "ई-नाम पर भुगतान में कितना समय लगता है?", a: "भुगतान सीधे ऑनलाइन ट्रांसफर के माध्यम से किसान के बैंक खाते में जमा किया जाता है, आमतौर पर 24 से 48 घंटों के भीतर।" }
      ]
    },
    relatedArticles: ["mandi-price-trends-timing", "role-msp-grain-sales"]
  },
  {
    title: {
      en: "Monsoon Preparedness Guide for Paddy Farmers in UP",
      hi: "उत्तर प्रदेश में धान उत्पादकों के लिए मानसून तैयारी गाइड"
    },
    slug: "monsoon-prep-paddy-up",
    description: {
      en: "Crucial steps for Uttar Pradesh rice cultivators to optimize transplanting, select nursery varieties, and manage flood conditions.",
      hi: "उत्तर प्रदेश के चावल उत्पादकों के लिए रोपाई के समय को अनुकूलित करने, नर्सरी किस्मों का चयन करने और बाढ़ की स्थिति को प्रबंधित करने के लिए महत्वपूर्ण कदम।"
    },
    author: {
      en: "Dr. Alok Pandey, Regional Agronomist",
      hi: "डॉ. आलोक पांडे, क्षेत्रीय कृषि विज्ञानी"
    },
    publishedDate: "2026-06-05",
    updatedDate: "2026-06-19",
    category: "weather",
    tags: {
      en: ["monsoon", "paddy nursery", "UP agriculture", "flood management"],
      hi: ["मानसून", "धान की नर्सरी", "यूपी कृषि", "बाढ़ प्रबंधन"]
    },
    featuredImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Monsoon rains dictate the success of Paddy (Rice) farming in Uttar Pradesh's Gangetic plains. With rain patterns becoming unpredictable, timing and crop planning are critical. For eastern UP (Varanasi, Gorakhpur), nursery sowing should begin in the first fortnight of June, while transplanting must complete by mid-July.

In 2025, Varanasi farmer Kamlesh Tiwari faced stunted paddy growth due to dry spells post-transplanting. A backup irrigation source, like a solar pump, is essential. For flood-prone areas, select flood-tolerant varieties like Swarna Sub-1, which can survive submerged under water for up to 14 days.

Maintain a water depth of 2-3 cm during the first week after transplanting to encourage root establishment. For nurseries, prepare raised beds to prevent seed wash-offs during heavy downpours. Seed treatment with Trichoderma viride (10g/kg seed) prevents root rot.`,
      hi: `उत्तर प्रदेश के गंगा के मैदानी इलाकों में धान (चावल) की खेती की सफलता मानसून की बारिश पर निर्भर करती है। बारिश के पैटर्न के अप्रत्याशित होने के कारण, सही समय और फसल योजना अत्यंत महत्वपूर्ण है। पूर्वी यूपी (वाराणसी, गोरखपुर) के लिए, नर्सरी की बुवाई जून के पहले पखवाड़े में शुरू होनी चाहिए, जबकि रोपाई जुलाई के मध्य तक पूरी हो जानी चाहिए।

2025 में, वाराणसी के किसान कमलेश तिवारी को रोपाई के बाद सूखे के कारण धान की रुकी हुई वृद्धि का सामना करना पड़ा। सोलर पंप जैसा वैकल्पिक सिंचाई स्रोत आवश्यक है। बाढ़ प्रवण क्षेत्रों के लिए, स्वर्ण सब-1 (Swarna Sub-1) जैसी बाढ़-सहनशील किस्मों का चयन करें, जो 14 दिनों तक पानी में डूबे रहने पर भी जीवित रह सकती हैं।

रोपाई के बाद पहले सप्ताह के दौरान जड़ों को स्थापित करने के लिए 2-3 सेमी पानी की गहराई बनाए रखें। नर्सरी के लिए, भारी बारिश के दौरान बीजों के बह जाने से बचाने के लिए ऊंचे बेड तैयार करें। ट्राइकोडेरमा विरिड (10 ग्राम/किग्रा बीज) के साथ बीज उपचार जड़ सड़न को रोकता है।`
    },
    faq: {
      en: [
        { q: "Which rice variety is best for flood-prone areas in UP?", a: "Swarna Sub-1 is highly recommended as it tolerates submergence up to two weeks." },
        { q: "When should eastern UP farmers start paddy nursery sowing?", a: "Sowing should ideally start between June 1st and June 15th." }
      ],
      hi: [
        { q: "यूपी में बाढ़ प्रवण क्षेत्रों के लिए कौन सी चावल की किस्म सबसे अच्छी है?", a: "स्वर्ण सब-1 (Swarna Sub-1) अत्यधिक अनुशंसित है क्योंकि यह दो सप्ताह तक पानी में डूबने को सहन कर सकती है।" },
        { q: "पूर्वी यूपी के किसानों को धान की नर्सरी की बुवाई कब शुरू करनी चाहिए?", a: "बुवाई आदर्श रूप से 1 जून से 15 जून के बीच शुरू होनी चाहिए।" }
      ]
    },
    relatedArticles: ["weather-smart-el-nino", "rice-blast-coastal-management"]
  },
  {
    title: {
      en: "Integrated Pest Management (IPM) for Soybean Crops",
      hi: "सोयाबीन की फसल के लिए एकीकृत कीट प्रबंधन (IPM)"
    },
    slug: "soybean-ipm-pest-control",
    description: {
      en: "How to apply non-chemical traps, biological agents, and minimal chemical pesticides to control Girdle Beetle and Semilooper in Soybean.",
      hi: "सोयाबीन में गर्डल बीटल और सेमीलूपर को नियंत्रित करने के लिए गैर-रासायनिक जाल, जैविक एजेंटों और न्यूनतम रासायनिक कीटनाशकों को लागू करने का तरीका।"
    },
    author: {
      en: "Dr. Rameshwar Dangi, Soybean Pest Expert",
      hi: "डॉ. रामेश्वर दांगी, सोयाबीन कीट विशेषज्ञ"
    },
    publishedDate: "2026-06-08",
    updatedDate: "2026-06-16",
    category: "disease",
    tags: {
      en: ["soybean pests", "IPM", "biological control", "agriculture safety"],
      hi: ["सोयाबीन के कीट", "IPM", "जैविक नियंत्रण", "कृषि सुरक्षा"]
    },
    featuredImage: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Soybean is a vital cash crop in Madhya Pradesh and Maharashtra. However, pests like the Girdle Beetle and Semilooper caterpillars cause substantial damage if ignored. Relying solely on chemical sprays increases input costs and harms beneficial insects. Integrated Pest Management (IPM) offers a balanced solution.

IPM combines physical, biological, and chemical methods. First, install yellow sticky traps (10 per acre) to catch flying insects. To control caterpillars naturally, plant bird perches (T-shaped wooden stands, 20 per acre) so predatory birds can feed on the larvae.

If pest populations cross the Economic Threshold Level (ETL), spray Bacillus thuringiensis (Bt) or neem-based formulation Azadirachtin (1500 ppm) at 1 liter per acre. For chemical control, only apply recommended doses of Chlorantraniliprole 18.5% SC (80 ml/acre) during severe girdle beetle infestations, ensuring high-volume spraying.`,
      hi: `मध्य प्रदेश और महाराष्ट्र में सोयाबीन एक महत्वपूर्ण नकदी फसल है। हालांकि, गर्डल बीटल (Girdle Beetle) और सेमीलूपर (Semilooper) जैसे कीट नजरअंदाज किए जाने पर काफी नुकसान पहुंचाते हैं। केवल रासायनिक स्प्रे पर निर्भर रहने से इनपुट लागत बढ़ती है और मित्र कीटों को नुकसान पहुंचता है। एकीकृत कीट प्रबंधन (IPM) एक संतुलित समाधान प्रदान करता है।

आईपीएम भौतिक, जैविक और रासायनिक तरीकों को जोड़ता है। सबसे पहले, उड़ने वाले कीटों को पकड़ने के लिए पीले चिपचिपे जाल (प्रति एकड़ 10) स्थापित करें। इल्लियों को प्राकृतिक रूप से नियंत्रित करने के लिए, पक्षियों के बैठने के लिए टी-आकार के लकड़ी के स्टैंड (प्रति एकड़ 20) लगाएं ताकि शिकारी पक्षी इल्लियों को खा सकें।

यदि कीटों की संख्या आर्थिक सीमा स्तर (ETL) को पार कर जाती है, तो बेसिलस थुरिंगिएन्सिस (Bt) या नीम-आधारित फॉर्मूलेशन एजाडिराक्टिन (1500 ppm) का प्रति एकड़ 1 लीटर की दर से छिड़काव करें। रासायनिक नियंत्रण के लिए, गंभीर गर्डल बीटल के प्रकोप के दौरान क्लोरेंट्रानिलिप्रोल 18.5% एससी (80 मिली/एकड़) की अनुशंसित खुराक का छिड़काव करें।`
    },
    faq: {
      en: [
        { q: "What is the economic threshold level (ETL) for soybean semilooper?", a: "When you find more than 3-4 semilooper caterpillars per meter of crop row, chemical intervention is warranted." },
        { q: "How do bird perches help in soybean pest control?", a: "They attract insect-eating birds that feed on semilooper and tobacco caterpillars directly." }
      ],
      hi: [
        { q: "सोयाबीन सेमीलूपर के लिए आर्थिक सीमा स्तर (ETL) क्या है?", a: "जब आपको प्रति मीटर फसल की कतार में 3-4 से अधिक सेमीलूपर इल्लियां मिलती हैं, तब रासायनिक नियंत्रण की आवश्यकता होती है।" },
        { q: "सोयाबीन कीट नियंत्रण में बर्ड पर्च (पक्षियों के बैठने के स्थान) कैसे मदद करते हैं?", a: "वे कीट खाने वाले पक्षियों को आकर्षित करते हैं जो सीधे इल्लियों का शिकार करते हैं।" }
      ]
    },
    relatedArticles: ["yellow-rust-wheat-control", "late-blight-potato-cure"]
  },
  {
    title: {
      en: "Understanding NPK Ratios and Fertilizer Management",
      hi: "एनपीके (NPK) अनुपात और उर्वरक प्रबंधन को समझना"
    },
    slug: "fertilizer-management-npk",
    description: {
      en: "Demystifying Nitrogen, Phosphorus, and Potassium requirements for major Indian crops to prevent over-use of Urea.",
      hi: "यूरिया के अत्यधिक उपयोग को रोकने के लिए प्रमुख भारतीय फसलों के लिए नाइट्रोजन, फास्फोरस और पोटेशियम की आवश्यकताओं को सरल बनाना।"
    },
    author: {
      en: "Dr. K. S. Deshmukh, Soil Fertility Specialist",
      hi: "डॉ. के. एस. देशमुख, मृदा उर्वरता विशेषज्ञ"
    },
    publishedDate: "2026-06-10",
    updatedDate: "2026-06-19",
    category: "soil",
    tags: {
      en: ["NPK ratio", "fertilizers", "urea overuse", "soil health"],
      hi: ["एनपीके अनुपात", "उर्वरक", "यूरिया का अधिक उपयोग", "मिट्टी का स्वास्थ्य"]
    },
    featuredImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Nitrogen (N) promotes leafy growth, Phosphorus (P) aids root and seed development, and Potassium (K) enhances plant immunity and grain quality. Together, they form the NPK foundation. However, due to fertilizer subsidies, Indian farmers over-apply Urea (Nitrogen), skewing the soil chemistry.

Over-application of Urea makes crops lush green but leaves them weak, soft, and highly susceptible to pest attacks and lodging (falling down). In Maharashtra's Nashik region, grape growers faced split berries and powdery mildew due to nitrogen overdose. Balanced NPK application is vital.

General guidelines recommend a 4:2:1 ratio for cereal crops, 1:2:1 for pulses (since pulses fix their own nitrogen), and 2:1:4 for potassium-loving sugarcane. Always apply phosphatic and potash fertilizers during field preparation (basal dose), while splitting nitrogen applications into 2 or 3 doses.`,
      hi: `नाइट्रोजन (N) पत्तियों के विकास को बढ़ावा देता है, फास्फोरस (P) जड़ों और बीजों के विकास में सहायता करता है, और पोटेशियम (K) पौधों की रोग प्रतिरोधक क्षमता और अनाज की गुणवत्ता को बढ़ाता है। मिलकर, वे एनपीके (NPK) की आधारशिला बनाते हैं। हालांकि, उर्वरक सब्सिडी के कारण, भारतीय किसान यूरिया (नाइट्रोजन) का अत्यधिक उपयोग करते हैं, जिससे मिट्टी का संतुलन बिगड़ जाता है।

यूरिया के अत्यधिक उपयोग से फसलें हरी-भरी तो हो जाती हैं, लेकिन वे कमजोर, कोमल और कीटों के हमलों के प्रति अत्यधिक संवेदनशील हो जाती हैं। महाराष्ट्र के नासिक क्षेत्र में, अंगूर उत्पादकों को नाइट्रोजन की अधिक खुराक के कारण फलों के फटने और डाउनी मिल्ड्यू जैसी समस्याओं का सामना करना पड़ा।

अनाज की फसलों के लिए सामान्यतः 4:2:1, दालों के लिए 1:2:1 (क्योंकि दालें हवा से नाइट्रोजन स्वयं स्थिर करती हैं), और पोटेशियम पसंद करने वाले गन्ने के लिए 2:1:4 का अनुपात अनुशंसित है। हमेशा बुवाई के समय फास्फोरस और पोटाश उर्वरक डालें, जबकि नाइट्रोजन को 2 या 3 खुराकों में विभाजित करके छिड़कें।`
    },
    faq: {
      en: [
        { q: "Why is balanced fertilizer application important?", a: "Balanced NPK prevents plant lodging, decreases pest vulnerability, and optimizes input costs." },
        { q: "Can I substitute organic manure for chemical NPK?", a: "Manure supplies micronutrients and organic matter, but slow release rates mean a combination of organic and chemical sources is best." }
      ],
      hi: [
        { q: "संतुलित उर्वरक अनुप्रयोग क्यों महत्वपूर्ण है?", a: "संतुलित एनपीके फसल को गिरने से रोकता है, कीटों के प्रति संवेदनशीलता कम करता है, और इनपुट लागत को कम करता है।" },
        { q: "क्या मैं रासायनिक एनपीके की जगह गोबर की खाद का उपयोग कर सकता हूँ?", a: "खाद से सूक्ष्म पोषक तत्व और जैविक पदार्थ मिलते हैं, लेकिन पोषक तत्व धीरे-धीरे मिलने के कारण जैविक और रासायनिक दोनों का संयोजन सबसे अच्छा होता है।" }
      ]
    },
    relatedArticles: ["soil-health-wheat-punjab", "drip-irrigation-cotton-rajasthan"]
  },
  {
    title: {
      en: "Late Blight of Potato: Preventive Measures & Cure",
      hi: "टमाटर और आलू का पछेती झुलसा (लेट ब्लाइट) रोग: बचाव और उपचार"
    },
    slug: "late-blight-potato-cure",
    description: {
      en: "Recognizing potato late blight water-soaked spots, predicting outbreaks during cold misty weather, and treatment protocols.",
      hi: "आलू के पछेती झुलसा रोग के पानी से लथपथ धब्बों की पहचान करने, कोहरे वाले ठंडे मौसम में इसके प्रकोप की भविष्यवाणी करने और उपचार।"
    },
    author: {
      en: "Dr. Anand Joshi, Vegetable Pathologist",
      hi: "डॉ. आनंद जोशी, सब्जी रोगविज्ञानी"
    },
    publishedDate: "2026-06-12",
    updatedDate: "2026-06-18",
    category: "disease",
    tags: {
      en: ["potato disease", "late blight", "crop protection", "fungicides"],
      hi: ["आलू का रोग", "पछेती झुलसा", "फसल सुरक्षा", "कवकनाशी"]
    },
    featuredImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Late Blight, caused by Phytophthora infestans, is a devastating disease affecting potato and tomato crops. In cold, foggy conditions with high humidity, this disease can destroy an entire field within 48 to 72 hours, as seen historically during the Irish Potato Famine and regularly in India's Indo-Gangetic plains.

Symptoms start as irregular water-soaked spots on leaf tips and margins. During humid mornings, a white downy growth appears on the lower side of infected leaves. The spots quickly turn dark brown or black. Infected tubers develop dark, sunken lesions and rot.

Preventive measures include planting disease-free seed tubers of resistant varieties like Kufri Himalini or Kufri Girdhari. Avoid overhead sprinkler irrigation which keeps leaves wet. Upon warning, spray Mancozeb at 2g per liter of water as a preventative cover. If infection spreads, spray systemic fungicide Cymoxanil + Mancozeb (Moximate) at 3g/liter.`,
      hi: `फाइटोफ्थोरा इन्फेस्टन्स कवक के कारण होने वाला पछेती झुलसा (लेट ब्लाइट) रोग आलू और टमाटर की फसलों को प्रभावित करने वाला एक विनाशकारी रोग है। कोहरे और उच्च आर्द्रता वाले ठंडे मौसम में, यह रोग 48 से 72 घंटों के भीतर पूरे खेत को नष्ट कर सकता है, जैसा कि भारत के सिंधु-गंगा के मैदानी इलाकों में अक्सर देखा जाता है।

लक्षण पत्तियों के किनारों पर अनियमित पानी से लथपथ धब्बों के रूप में शुरू होते हैं। आर्द्र सुबह के दौरान, संक्रमित पत्तियों के निचले हिस्से पर एक सफेद पाउडर जैसी वृद्धि दिखाई देती है। धब्बे तेजी से गहरे भूरे या काले हो जाते हैं। संक्रमित आलू के कंदों में गहरे रंग के धब्बे बन जाते हैं और वे सड़ जाते हैं।

निवारक उपायों में कुफरी हिमालयिनी या कुफरी गिरधारी जैसी प्रतिरोधी किस्मों के रोगमुक्त कंदों का उपयोग शामिल है। इसके अलावा पत्ती गीली रखने वाली सिंचाई प्रणालियों से बचें। संक्रमण होने पर सिस्टेमिक कवकनाशी साइमोक्सानिल + मैनकोजेब (Cymoxanil + Mancozeb) का 3 ग्राम/लीटर पानी में घोल बनाकर स्प्रे करें।`
    },
    faq: {
      en: [
        { q: "What weather conditions favor late blight?", a: "Temperatures between 10-20°C combined with cloudy days, fog, and relative humidity above 90% favor outbreaks." },
        { q: "Which potato varieties are resistant to late blight?", a: "Kufri Himalini, Kufri Girdhari, and Kufri Jyoti exhibit high resistance." }
      ],
      hi: [
        { q: "पछेती झुलसा के अनुकूल कौन सी मौसम परिस्थितियां हैं?", a: "10-20 डिग्री सेल्सियस तापमान के साथ बादल, कोहरा और 90% से अधिक सापेक्ष आर्द्रता इसका प्रकोप बढ़ाती है।" },
        { q: "आलू की कौन सी किस्में पछेती झुलसा के प्रति प्रतिरोधी हैं?", a: "कुफरी हिमालयिनी, कुफरी गिरधारी और कुफरी ज्योति उच्च प्रतिरोध प्रदर्शित करती हैं।" }
      ]
    },
    relatedArticles: ["yellow-rust-wheat-control", "rice-blast-coastal-management"]
  },
  {
    title: {
      en: "Mandi Price Trends: How to Time Your Harvest for Profit",
      hi: "मंडी भाव का रुझान: अधिक मुनाफे के लिए फसल कटाई का सही समय"
    },
    slug: "mandi-price-trends-timing",
    description: {
      en: "Learn how to analyze historical mandi price arrivals, seasonal spikes, and market trends to sell your crops at peak value.",
      hi: "अपने फसलों को अधिकतम मूल्य पर बेचने के लिए ऐतिहासिक मंडी आवक, मौसमी उछाल और बाजार के रुझानों का विश्लेषण करना सीखें।"
    },
    author: {
      en: "Sanjay Shekhawat, Agricultural Market Analyst",
      hi: "संजय शेखावत, कृषि बाजार विश्लेषक"
    },
    publishedDate: "2026-06-11",
    updatedDate: "2026-06-19",
    category: "mandi",
    tags: {
      en: ["mandi price", "crop marketing", "harvest timing", "profit optimization"],
      hi: ["मंडी भाव", "फसल विपणन", "कटाई का समय", "मुनाफा अनुकूलन"]
    },
    featuredImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Timing is everything in crop marketing. Most farmers sell their crops immediately after harvest, causing a sudden glut in the mandi and a subsequent drop in prices. Analyzing seasonal arrivals helps in making better decisions.

For example, in Rajasthan's Kota mandi, soybean prices typically hit a seasonal low in October-November during peak harvest. Farmers who have scientific storage facilities (like scientific warehouses) can store their dry soybean and sell it in February-March, when arrivals decrease and prices rise by 15% to 25%.

Before harvesting, check the eNAM portal and KisaanBuddy Mandi rates. Ensure your crop is properly dried (moisture content below 12% for grains) so it can be stored without spoilage. Selling during off-season demand ensures a much higher return on investment.`,
      hi: `फसल विपणन में सही समय ही सब कुछ है। अधिकांश किसान कटाई के तुरंत बाद अपनी फसलें बेच देते हैं, जिससे मंडी में अचानक भारी आवक हो जाती है और परिणामस्वरूप कीमतें गिर जाती हैं। मौसमी आवक का विश्लेषण करने से बेहतर निर्णय लेने में मदद मिलती है।

उदाहरण के लिए, राजस्थान की कोटा मंडी में, सोयाबीन की कीमतें आम तौर पर अक्टूबर-नवंबर में कटाई के पीक सीजन के दौरान सबसे निचले स्तर पर होती हैं। जिन किसानों के पास वैज्ञानिक भंडारण सुविधाएं (जैसे गोदाम) हैं, वे अपनी सूखी सोयाबीन का भंडारण कर सकते हैं और इसे फरवरी-मार्च में बेच सकते हैं, जब आवक कम हो जाती है और कीमतें 15% से 25% तक बढ़ जाती हैं।

कटाई से पहले, ई-नाम (eNAM) पोर्टल और किसानमित्र (KisaanBuddy) मंडी दरों की जांच करें। सुनिश्चित करें कि आपकी फसल ठीक से सूखी हो (अनाज के लिए नमी 12% से कम हो) ताकि उसे बिना खराब हुए स्टोर किया जा सके। बंद सीजन (ऑफ-सीजन) की मांग के दौरान बेचने से निवेश पर बहुत अधिक लाभ मिलता है।`
    },
    faq: {
      en: [
        { q: "What is the best moisture percentage for grain storage?", a: "For cereals like wheat and paddy, moisture should be below 12% to prevent fungal growth during storage." },
        { q: "Where can farmers get scientific storage facilities?", a: "State Warehousing Corporations (SWC) and Central Warehousing Corporation (CWC) offer rental storage space with warehouse receipt facilities." }
      ],
      hi: [
        { q: "अनाज भंडारण के लिए सबसे अच्छा नमी प्रतिशत क्या है?", a: "गेहूं और धान जैसे अनाजों के लिए, भंडारण के दौरान फफूंद के विकास को रोकने के लिए नमी 12% से कम होनी चाहिए।" },
        { q: "किसानों को वैज्ञानिक भंडारण सुविधाएं कहां मिल सकती हैं?", a: "राज्य भंडारण निगम (SWC) और केंद्रीय भंडारण निगम (CWC) गोदाम रसीद सुविधाओं के साथ किराए पर भंडारण स्थान प्रदान करते हैं।" }
      ]
    },
    relatedArticles: ["mandi-online-sales-enam", "role-msp-grain-sales"]
  },
  {
    title: {
      en: "Weather-Smart Agriculture: Adapting to El Niño Cycles",
      hi: "मौसम-अनुकूल कृषि: अल नीनो चक्रों के अनुकूल ढलना"
    },
    slug: "weather-smart-el-nino",
    description: {
      en: "How El Niño impacts Indian monsoons, and drought-management strategies for farmers in low-rainfall zones.",
      hi: "अल नीनो भारतीय मानसून को कैसे प्रभावित करता है, और कम वर्षा वाले क्षेत्रों में किसानों के लिए सूखा-प्रबंधन रणनीतियाँ।"
    },
    author: {
      en: "Dr. Shruti Sen, Climatologist",
      hi: "डॉ. श्रुति सेन, जलवायु वैज्ञानिक"
    },
    publishedDate: "2026-06-10",
    updatedDate: "2026-06-18",
    category: "weather",
    tags: {
      en: ["el nino", "monsoon forecast", "dryland farming", "climate change"],
      hi: ["अल नीनो", "मानसून का पूर्वानुमान", "सूखी खेती", "जलवायु परिवर्तन"]
    },
    featuredImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `El Niño refers to the warming of sea surface temperatures in the central and eastern Pacific Ocean. For Indian agriculture, El Niño is historically linked to weak monsoons and drought-like conditions, reducing water levels in key reservoirs.

Farmers in dry regions of Maharashtra (Marathwada) and Karnataka must adapt. If the meteorological department forecasts an El Niño year, transition from water-intensive crops like sugarcane or paddy to drought-resistant crops like Pearl Millet (Bajra), Sorghum (Jowar), or Pigeon Pea (Tur/Arhar).

Implement water harvesting techniques like farm ponds (Shettale) to store rainwater. Apply organic mulching to crop beds to retain soil moisture. Use sprinkler or drip irrigation instead of flood irrigation to stretch available water resources.`,
      hi: `अल नीनो प्रशांत महासागर के मध्य और पूर्वी भागों में समुद्र की सतह के तापमान के गर्म होने को संदर्भित करता है। भारतीय कृषि के लिए, अल नीनो ऐतिहासिक रूप से कमजोर मानसून और सूखे जैसी स्थितियों से जुड़ा हुआ है, जिससे प्रमुख जलाशयों में पानी का स्तर कम हो जाता है।

महाराष्ट्र (मराठवाड़ा) और कर्नाटक के शुष्क क्षेत्रों के किसानों को अनुकूल होना चाहिए। यदि मौसम विभाग अल नीनो वर्ष का पूर्वानुमान लगाता है, तो गन्ने या धान जैसी अधिक पानी वाली फसलों से बाजरा, ज्वार, या अरहर जैसी सूखा-प्रतिरोधी फसलों की खेती की ओर रुख करें।

बारिश के पानी को स्टोर करने के लिए खेत के तालाबों (फार्म पॉन्ड) जैसी जल संचयन तकनीकों को लागू करें। मिट्टी की नमी बनाए रखने के लिए फसल के क्यारियों पर जैविक मल्चिंग का उपयोग करें। पानी के सीमित संसाधनों का अधिकतम उपयोग करने के लिए बाढ़ सिंचाई के बजाय ड्रिप या स्प्रिंकलर सिंचाई का उपयोग करें।`
    },
    faq: {
      en: [
        { q: "How does El Niño affect rainfall in India?", a: "El Niño often leads to delayed monsoons, erratic rainfall distribution, and higher summer temperatures." },
        { q: "What are the best crops to grow during drought years?", a: "Millets (Bajra, Ragi, Jowar) and pulses (Moong, Arhar) are excellent choices due to their low water needs." }
      ],
      hi: [
        { q: "अल नीनो भारत में वर्षा को कैसे प्रभावित करता है?", a: "अल नीनो अक्सर मानसून में देरी, वर्षा के अनियमित वितरण और गर्मियों में अधिक तापमान का कारण बनता है।" },
        { q: "सूखे के वर्षों में उगाने के लिए सबसे अच्छी फसलें कौन सी हैं?", a: "बाजरा, रागी, ज्वार और दालें (मूँग, अरहर) अपनी कम पानी की आवश्यकता के कारण उत्कृष्ट विकल्प हैं।" }
      ]
    },
    relatedArticles: ["kharif-crop-low-rainfall", "monsoon-prep-paddy-up"]
  },
  {
    title: {
      en: "Micro-Nutrient Deficiencies in Indian Soils and Solutions",
      hi: "भारतीय मिट्टी में सूक्ष्म पोषक तत्वों की कमी और उनका समाधान"
    },
    slug: "micronutrient-deficiencies-soil",
    description: {
      en: "A guide on identifying Zinc, Iron, and Boron deficiencies in crops and correct soil application protocols.",
      hi: "फसलों में जिंक, आयरन और बोरॉन की कमी की पहचान करने और सही मृदा अनुप्रयोग के तरीकों पर एक गाइड।"
    },
    author: {
      en: "Dr. H. S. Chahal, Soil Chemistry Expert",
      hi: "डॉ. एच. एस. चहल, मृदा रसायन विशेषज्ञ"
    },
    publishedDate: "2026-06-08",
    updatedDate: "2026-06-15",
    category: "soil",
    tags: {
      en: ["soil health", "micronutrients", "zinc deficiency", "boron application"],
      hi: ["मिट्टी का स्वास्थ्य", "सूक्ष्म पोषक तत्व", "जिंक की कमी", "बोरॉन का उपयोग"]
    },
    featuredImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `While Nitrogen, Phosphorus, and Potassium are vital, plants also require micro-nutrients in trace amounts. Intensive farming has depleted these from Indian soils, leading to hidden hunger in crops and low nutritional value in food.

The three most common deficiencies are:
1. **Zinc (Zn)**: Manifests as bronzing or yellowing of leaves in maize and paddy (Khaira disease). Correct by applying Zinc Sulphate (10 kg/acre).
2. **Iron (Fe)**: Shows as yellowing between leaf veins (interveinal chlorosis) in young leaves. Correct by spraying Ferrous Sulphate (0.5% solution).
3. **Boron (B)**: Causes cracked stems and poor seed setting in mustard and sunflower. Correct by applying Borax (2.5 kg/acre) to soil or foliar spray of Boron (0.1%).

Always run a micronutrient test alongside NPK soil health checkups.`,
      hi: `हालांकि नाइट्रोजन, फास्फोरस और पोटेशियम महत्वपूर्ण हैं, लेकिन पौधों को सूक्ष्म पोषक तत्वों की भी बहुत कम मात्रा में आवश्यकता होती है। सघन खेती ने भारतीय मिट्टी से इन पोषक तत्वों को खत्म कर दिया है, जिससे फसलों में छिपी हुई भूख पैदा हो रही है।

तीन सबसे आम कमियां हैं:
1. **जिंक (Zn)**: मक्का और धान में पत्तियों के तांबे जैसे या पीले होने के रूप में प्रकट होता है (खैरा रोग)। जिंक सल्फेट (10 किग्रा/एकड़) डालकर ठीक करें।
2. **आयरन (Fe)**: युवा पत्तियों की नसों के बीच पीलापन (इंटरवेनल क्लोरोसिस) के रूप में दिखाई देता है। फेरस सल्फेट (0.5% घोल) का छिड़काव करके ठीक करें।
3. **बोरॉन (B)**: सरसों और सूरजमुखी में तने के फटने और बीज के खराब विकास का कारण बनता है। बोरेक्स (2.5 किग्रा/एकड़) का उपयोग करके ठीक करें।

हमेशा एनपीके (NPK) मिट्टी स्वास्थ्य जांच के साथ-साथ सूक्ष्म पोषक तत्व परीक्षण भी चलाएं।`
    },
    faq: {
      en: [
        { q: "What is Khaira disease in paddy?", a: "Khaira disease is caused by Zinc deficiency, resulting in rusty brown spots on leaves." },
        { q: "Can I mix micronutrients with Urea?", a: "Zinc sulphate should not be mixed directly with phosphatic fertilizers (like DAP) as it forms insoluble zinc phosphate. Apply separately." }
      ],
      hi: [
        { q: "धान में खैरा रोग क्या है?", a: "खैरा रोग जिंक की कमी से होता है, जिसके परिणामस्वरूप पत्तियों पर जंग लगे भूरे रंग के धब्बे बन जाते हैं।" },
        { q: "क्या मैं सूक्ष्म पोषक तत्वों को यूरिया के साथ मिला सकता हूँ?", a: "जिंक सल्फेट को सीधे फास्फेटिक उर्वरकों (जैसे डीएपी) के साथ नहीं मिलाया जाना चाहिए क्योंकि यह अघुलनशील जिंक फास्फेट बनाता है। इन्हें अलग से डालें।" }
      ]
    },
    relatedArticles: ["soil-health-wheat-punjab", "fertilizer-management-npk"]
  },
  {
    title: {
      en: "Kharif Crop Selection Guide for Low-Rainfall Areas",
      hi: "कम वर्षा वाले क्षेत्रों के लिए खरीफ फसल चयन गाइड"
    },
    slug: "kharif-crop-low-rainfall",
    description: {
      en: "Selecting the right climate-resilient crops for regions facing delayed rains or weak monsoons.",
      hi: "देरी से होने वाली बारिश या कमजोर मानसून का सामना करने वाले क्षेत्रों के लिए जलवायु-अनुकूल फसलों का चयन करना।"
    },
    author: {
      en: "Mahendra Singh, Dryland Extension Specialist",
      hi: "महेन्द्र सिंह, शुष्क भूमि विस्तार विशेषज्ञ"
    },
    publishedDate: "2026-06-05",
    updatedDate: "2026-06-18",
    category: "weather",
    tags: {
      en: ["kharif crops", "low rainfall", "drought resistance", "pulse cultivation"],
      hi: ["खरीफ फसलें", "कम वर्षा", "सूखा प्रतिरोध", "दलहन की खेती"]
    },
    featuredImage: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `When the monsoon onset is delayed, planting paddy or cotton becomes highly risky. For areas in Central India receiving less than 600 mm of annual rainfall, selecting drought-tolerant short-duration crops is the key to ensuring household income.

Recommended crops include:
1. **Black Gram (Urad)**: Takes only 70-80 days to mature. Recommended varieties: IPU 2-43 or Pant U 31.
2. **Green Gram (Moong)**: Highly drought-resistant. Matures in 60-70 days. Varieties: IPM 02-3 or MH 125.
3. **Pearl Millet (Bajra)**: Thrives in sandy soils. Varieties: HHB 67 Improved.

If sowing is delayed beyond July 15th, avoid long-duration crops. Switch to short-duration pulses or fodder crops to feed livestock. This ensures that the season is not a total loss.`,
      hi: `जब मानसून की शुरुआत में देरी होती है, तो धान या कपास बोना अत्यधिक जोखिम भरा हो जाता है। मध्य भारत के उन क्षेत्रों के लिए जहां 600 मिमी से कम वार्षिक वर्षा होती है, सूखा-सहनशील लघु-अवधि की फसलों का चयन करना घरेलू आय सुनिश्चित करने की कुंजी है।

अनुशंसित फसलें शामिल हैं:
1. **उड़द (Black Gram)**: पकने में केवल 70-80 दिन लगते हैं। अनुशंसित किस्में: IPU 2-43 या पंत यू 31।
2. **मूंग (Green Gram)**: अत्यधिक सूखा-प्रतिरोधी। 60-70 दिनों में पकती है। किस्में: IPM 02-3 या MH 125।
3. **बाजरा (Pearl Millet)**: रेतीली मिट्टी में पनपता है। किस्में: एचएचबी 67 संशोधित (HHB 67 Improved)।

यदि बुवाई में 15 जुलाई से अधिक की देरी होती है, तो लंबी अवधि की फसलों से बचें। इसके बजाय कम अवधि वाली दालों या पशुओं के चारे वाली फसलों की खेती करें।`
    },
    faq: {
      en: [
        { q: "Which is the fastest-maturing Kharif crop?", a: "Moong (Green Gram) matures in 60-65 days, making it ideal for late-sowing conditions." },
        { q: "Does Bajra require heavy irrigation?", a: "No, Bajra is highly drought-tolerant and can survive on minimal rain spells." }
      ],
      hi: [
        { q: "सबसे तेजी से पकने वाली खरीफ फसल कौन सी है?", a: "मूंग 60-65 दिनों में पक जाती है, जिससे यह देर से बुवाई की स्थितियों के लिए आदर्श बन जाती है।" },
        { q: "क्या बाजरा को भारी सिंचाई की आवश्यकता होती है?", a: "नहीं, बाजरा अत्यधिक सूखा-सहनशील है और न्यूनतम वर्षा पर भी जीवित रह सकता है।" }
      ]
    },
    relatedArticles: ["weather-smart-el-nino", "monsoon-prep-paddy-up"]
  },
  {
    title: {
      en: "How to Avail Solar Pump Subsidies (PM-KUSUM)",
      hi: "सोलर पंप सब्सिडी (PM-KUSUM) कैसे प्राप्त करें"
    },
    slug: "solar-pump-subsidies-kusum",
    description: {
      en: "Step-by-step application instructions for the PM-KUSUM scheme to install solar water pumps with up to 90% subsidy.",
      hi: "90% तक सब्सिडी के साथ सोलर वाटर पंप स्थापित करने के लिए पीएम-कुसुम योजना के आवेदन की चरण-दर-चरण प्रक्रिया।"
    },
    author: {
      en: "Vikas Bishnoi, Renewable Energy Advisor",
      hi: "विकास बिश्नोई, नवीकरणीय ऊर्जा सलाहकार"
    },
    publishedDate: "2026-06-03",
    updatedDate: "2026-06-15",
    category: "schemes",
    tags: {
      en: ["solar pump", "PM-KUSUM", "clean energy", "irrigation subsidy"],
      hi: ["सोलर पंप", "PM-KUSUM", "स्वच्छ ऊर्जा", "सिंचाई सब्सिडी"]
    },
    featuredImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Diesel costs and erratic power supply make irrigation a heavy burden. The Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM) scheme solves this by helping farmers install solar agricultural pumps. Under this scheme, farmers pay only 10% of the cost, while the central and state governments provide a combined 60% subsidy, and banks finance the remaining 30%.

To apply, visit the official state renewable energy agency portal (e.g. UREDA in Uttarakhand, HAREDA in Haryana). Avoid fake websites. You will need land registration records (Jamabandi), bank details, Aadhaar card, and a declaration of pump requirements.

Solar pumps operate during daytime, eliminating the need to irrigate at night. Farmer Lalchand Gurjar from Jaipur installed a 5 HP solar pump. He now saves Rs. 45,000 annually in electricity and diesel bills, and has reliable water supply during daytime.`,
      hi: `डीजल की लागत और अनियमित बिजली आपूर्ति सिंचाई को एक भारी बोझ बना देती है। प्रधानमंत्री किसान ऊर्जा सुरक्षा उत्थान महाभियान (PM-KUSUM) योजना किसानों को सोलर पंप स्थापित करने में मदद करके इस समस्या को हल करती है। इस योजना के तहत किसान लागत का केवल 10% भुगतान करते हैं, जबकि केंद्र और राज्य सरकारें मिलकर 60% सब्सिडी प्रदान करती हैं, और बैंक शेष 30% का वित्तपोषण करते हैं।

आवेदन करने के लिए, आधिकारिक राज्य अक्षय ऊर्जा एजेंसी पोर्टल पर जाएं। नकली वेबसाइटों से बचें। आपको भूमि पंजीकरण रिकॉर्ड (जमाबंदी), बैंक विवरण, आधार कार्ड और पंप आवश्यकताओं की घोषणा की आवश्यकता होगी।

सोलर पंप दिन के समय काम करते हैं, जिससे रात में सिंचाई करने की आवश्यकता समाप्त हो जाती है। जयपुर के किसान लालचंद गुर्जर ने 5 एचपी का सोलर पंप लगवाया। अब वे सालाना 45,000 रुपये बचाते हैं।`
    },
    faq: {
      en: [
        { q: "What capacity pumps are supported under PM-KUSUM?", a: "Pumps ranging from 3 HP to 10 HP are subsidized, depending on the farmer's landholding and water table depth." },
        { q: "Can I sell excess solar power back to the grid?", a: "Yes, under Component-C of the scheme, farmers can grid-connect their solar pumps and sell surplus power to DISCOMs." }
      ],
      hi: [
        { q: "पीएम-कुसुम के तहत कितनी क्षमता के पंप समर्थित हैं?", a: "किसान की भूमि और जल स्तर की गहराई के आधार पर 3 एचपी से 10 एचपी तक के पंप सब्सिडी के पात्र हैं।" },
        { q: "क्या मैं अतिरिक्त सौर ऊर्जा वापस ग्रिड को बेच सकता हूँ?", a: "हां, योजना के घटक-सी के तहत, किसान अपने सोलर पंपों को ग्रिड से जोड़ सकते हैं और अधिशेष बिजली बेच सकते हैं।" }
      ]
    },
    relatedArticles: ["pm-kisan-subsidies-guide", "crop-insurance-pmfby"]
  },
  {
    title: {
      en: "Managing Rice Blast Disease in Coastal Regions",
      hi: "तटीय क्षेत्रों में धान के झोंका (राइस ब्लास्ट) रोग का प्रबंधन"
    },
    slug: "rice-blast-coastal-management",
    description: {
      en: "Spotting spindle-shaped lesions of Rice Blast, biological control using Trichoderma, and chemical spraying guidelines.",
      hi: "धान के झोंका (ब्लास्ट) रोग के धब्बों की पहचान, ट्राइकोडेरमा का उपयोग करके जैविक नियंत्रण और रासायनिक छिड़काव।"
    },
    author: {
      en: "Dr. K. Raghavan, Rice Research Station",
      hi: "डॉ. के. राघवन, चावल अनुसंधान केंद्र"
    },
    publishedDate: "2026-06-01",
    updatedDate: "2026-06-12",
    category: "disease",
    tags: {
      en: ["rice blast", "paddy disease", "fungicides", "coastal farming"],
      hi: ["राइस ब्लास्ट", "धान का रोग", "कवकनाशी", "तटीय खेती"]
    },
    featuredImage: "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Rice Blast, caused by the fungus Magnaporthe oryzae, is a severe threat to paddy, especially in warm, humid coastal zones like West Bengal and Andhra Pradesh. It infects leaves, nodes, and panicles. Leaf blast shows spindle-shaped lesions with grey centers and brown borders.

Severe neck blast breaks the panicle, resulting in unfilled grains and up to 50% yield loss. Warm days (25-30°C) with dew at night and high relative humidity favor the fungus.

To manage blast:
1. Treat seed with Tricyclazole 75 WP (1g/kg seed).
2. Maintain clean bunds to destroy alternate weed hosts.
3. If blast spots exceed 5% of leaf area, spray Tricyclazole 75% WP (e.g. Beam) at 120g per acre in 200 liters of water. Avoid excessive nitrogen application.`,
      hi: `मैग्नापोर्थे ओराइजी नामक कवक के कारण होने वाला धान का झोंका (राइस ब्लास्ट) रोग धान के लिए एक गंभीर खतरा है, विशेष रूप से पश्चिम बंगाल और आंध्र प्रदेश जैसे गर्म और आर्द्र तटीय क्षेत्रों में। यह पत्तियों, गांठों और बालियों को संक्रमित करता है। पत्ती के ब्लास्ट में राख जैसे रंग के केंद्र और भूरे रंग के किनारों वाले धब्बे दिखाई देते हैं।

गंभीर नेक ब्लास्ट बालियों को तोड़ देता है, जिससे अनाज नहीं भर पाता और 50% तक उपज का नुकसान होता है।

ब्लास्ट को प्रबंधित करने के लिए:
1. बीजों को ट्राइसाइक्लाजोल 75 डब्ल्यूपी (1 ग्राम/किग्रा बीज) से उपचारित करें।
2. मेढ़ों को साफ रखें ताकि खरपतवार नष्ट हो जाएं।
3. यदि ब्लास्ट के धब्बे पत्ती क्षेत्र के 5% से अधिक हो जाते हैं, तो प्रति एकड़ 120 ग्राम ट्राइसाइक्लाजोल 75% डब्ल्यूपी (Tricyclazole 75% WP) को 200 लीटर पानी में मिलाकर स्प्रे करें।`
    },
    faq: {
      en: [
        { q: "What does leaf blast look like?", a: "Spindle-shaped or eye-shaped spots with gray centers and reddish-brown borders." },
        { q: "What is neck blast?", a: "Infection at the base of the panicle which rots, turns black, and breaks, preventing grain filling." }
      ],
      hi: [
        { q: "पत्ती का झोंका (लीफ ब्लास्ट) कैसा दिखता है?", a: "ग्रे रंग के केंद्र और लाल-भूरे रंग के किनारों वाले धुरी के आकार (तर्कु आकार) या आंख के आकार के धब्बे।" },
        { q: "नेक ब्लास्ट क्या है?", a: "बाली के आधार पर संक्रमण जो सड़ जाता है, काला हो जाता है और टूट जाता है, जिससे अनाज नहीं भर पाता।" }
      ]
    },
    relatedArticles: ["yellow-rust-wheat-control", "late-blight-potato-cure"]
  },
  {
    title: {
      en: "Farming Logs: How Khet-Diary Boosts Profitability",
      hi: "कृषि लॉग: कैसे खेत-डायरी (Khet-Diary) कृषि मुनाफे को बढ़ाती है"
    },
    slug: "farming-logs-khet-diary",
    description: {
      en: "Why maintaining records of seed, fertilizer, and labor expenses helps farmers secure credits and identify waste.",
      hi: "बीज, उर्वरक और श्रम व्यय के रिकॉर्ड बनाए रखने से किसानों को ऋण प्राप्त करने और फालतू खर्चों की पहचान करने में कैसे मदद मिलती है।"
    },
    author: {
      en: "Preeti Sharma, Financial Inclusion Officer",
      hi: "प्रीति शर्मा, वित्तीय समावेशन अधिकारी"
    },
    publishedDate: "2026-06-07",
    updatedDate: "2026-06-19",
    category: "soil",
    tags: {
      en: ["farm logs", "Khet-Diary", "farm economics", "crop budget"],
      hi: ["कृषि लॉग", "खेत-डायरी", "कृषि अर्थशास्त्र", "फसल बजट"]
    },
    featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Farming is not just a lifestyle; it is a business. However, very few smallholders maintain financial ledger records. Without knowing the exact expenses on seed, fertilizers, water diesel, and labor, calculating net profit is impossible.

Maintaining a farm ledger helps in multiple ways:
1. **Reduces Waste**: Track fertilizer purchases to prevent duplicate applications.
2. **Access to Credit**: Banks require expense proofs for Crop Loans (KCC).
3. **Crop Comparison**: Evaluate if cotton yields more profit per acre than soybean.

Using KisaanBuddy's Khet-Diary tool, farmers can easily log costs on their phones. In Maharashtra's Akola district, farmer Nitin Kale logged all costs and discovered he spent 30% of his budget on manual weeding, which prompted him to switch to chemical herbicides, saving Rs. 8,000 per acre.`,
      hi: `खेती सिर्फ एक जीवनशैली नहीं है; यह एक व्यवसाय है। हालांकि, बहुत कम छोटे किसान वित्तीय रिकॉर्ड बनाए रखते हैं। बीज, उर्वरक, पानी, डीजल और श्रम पर होने वाले खर्चों को जाने बिना शुद्ध लाभ की गणना करना असंभव है।

कृषि बहीखाता बनाए रखने से कई तरीकों से मदद मिलती है:
1. **अपव्यय को कम करना**: उर्वरक खरीद को ट्रैक करें ताकि दोबारा छिड़काव से बचा जा सके।
2. **ऋण तक पहुंच**: बैंक फसल ऋण (KCC) के लिए खर्चों के प्रमाण मांगते हैं।
3. **फसल तुलना**: मूल्यांकन करें कि कपास से प्रति एकड़ अधिक लाभ मिल रहा है या सोयाबीन से।

किसानमित्र (KisaanBuddy) के खेत-डायरी (Khet-Diary) उपकरण का उपयोग करके, किसान आसानी से अपने फोन पर लागत दर्ज कर सकते हैं। महाराष्ट्र के अकोला जिले में, किसान नितिन काले ने सभी लागतों को दर्ज किया और पाया कि उन्होंने अपने बजट का 30% केवल खरपतवार हटाने पर खर्च किया, जिससे उन्हें रासायनिक शाकनाशियों का उपयोग करने की प्रेरणा मिली और प्रति एकड़ 8,000 रुपये की बचत हुई।`
    },
    faq: {
      en: [
        { q: "What should be recorded in a farm logbook?", a: "All expenses (seeds, fertilizers, labor, diesel, water) and all income from grain/produce sales, along with dates." },
        { q: "How does Khet-Diary help in KCC application?", a: "It provides a record of crop cost of cultivation, giving banks confidence during crop loan appraisals." }
      ],
      hi: [
        { q: "कृषि लॉगबुक में क्या दर्ज किया जाना चाहिए?", a: "सभी खर्च (बीज, उर्वरक, श्रम, डीजल, पानी) और अनाज/उपज की बिक्री से होने वाली सभी आय, तिथियों के साथ।" },
        { q: "खेत-डायरी केसीसी (KCC) आवेदन में कैसे मदद करती है?", a: "यह फसल की खेती की लागत का एक स्पष्ट रिकॉर्ड प्रदान करती है, जिससे फसल ऋण मूल्यांकन के दौरान बैंकों का विश्वास बढ़ता है।" }
      ]
    },
    relatedArticles: ["soil-health-wheat-punjab", "fertilizer-management-npk"]
  },
  {
    title: {
      en: "The Role of Minimum Support Price (MSP) in Grain Sales",
      hi: "अनाज बिक्री में न्यूनतम समर्थन मूल्य (MSP) की भूमिका"
    },
    slug: "role-msp-grain-sales",
    description: {
      en: "How MSP acts as a safety net, which crops are covered, and how procurement centers work.",
      hi: "न्यूनतम समर्थन मूल्य (MSP) सुरक्षा कवच के रूप में कैसे कार्य करता है, कौन सी फसलें शामिल हैं, और खरीद केंद्र कैसे काम करते हैं।"
    },
    author: {
      en: "Dr. Ramesh Chand, Agri-Economist",
      hi: "डॉ. रमेश चंद, कृषि अर्थशास्त्री"
    },
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-18",
    category: "mandi",
    tags: {
      en: ["MSP", "grain procurement", "APMC market", "farm income"],
      hi: ["MSP", "अनाज खरीद", "एपीएमसी बाजार", "कृषि आय"]
    },
    featuredImage: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `The Minimum Support Price (MSP) is a market intervention scheme by the Government of India to protect agricultural producers against any sharp fall in farm prices. Announced at the beginning of the sowing season, it guarantees a fixed minimum rate for crops.

The CACP recommends MSP based on the A2+FL cost formula (actual paid-out costs + imputed value of family labor). Currently, 22 crops are covered, including Paddy, Wheat, Maize, Gram, Mustard, and Cotton.

When market prices drop below MSP due to heavy yields, government agencies like the Food Corporation of India (FCI) open procurement centers in APMC mandis to buy grain directly from farmers at MSP. Ensure your grain matches the Fair Average Quality (FAQ) standards (dry, clean, insect-free) to get the full price.`,
      hi: `न्यूनतम समर्थन मूल्य (MSP) भारत सरकार द्वारा कृषि उत्पादकों को कृषि कीमतों में किसी भी तेज गिरावट से बचाने के लिए एक बाजार हस्तक्षेप योजना है। बुवाई के मौसम की शुरुआत में घोषित, यह फसलों के लिए एक निश्चित न्यूनतम दर की गारंटी देता है।

सीएसीपी (CACP) ए2+एफएल (A2+FL) लागत फार्मूले (वास्तविक भुगतान लागत + पारिवारिक श्रम का अनुमानित मूल्य) के आधार पर एमएसपी की सिफारिश करता है। वर्तमान में धान, गेहूं, मक्का, चना, सरसों और कपास सहित 22 फसलें शामिल हैं।

जब बाजार में कीमतें बंपर पैदावार के कारण एमएसपी से नीचे गिर जाती हैं, तो भारतीय खाद्य निगम (FCI) जैसी सरकारी एजेंसियां ​​एमएसपी पर किसानों से सीधे अनाज खरीदने के लिए एपीएमसी मंडियों में खरीद केंद्र खोलती हैं। पूरा मूल्य प्राप्त करने के लिए सुनिश्चित करें कि आपका अनाज साफ और सूखा हो।`
    },
    faq: {
      en: [
        { q: "What is the A2+FL formula in MSP?", a: "A2 covers actual cash expenses on seeds, fertilizers, fuel, and labor. FL is the estimated value of unpaid family labor." },
        { q: "How is grain quality graded at MSP centers?", a: "Grains are tested for moisture (typically limit is 12-14%), foreign matter, and shriveled grains before acceptance." }
      ],
      hi: [
        { q: "MSP में A2+FL formula क्या है?", a: "A2 बीजों, उर्वरकों, ईंधन और श्रम पर वास्तविक नकद खर्चों को कवर करता है। FL अवैतनिक पारिवारिक श्रम का अनुमानित मूल्य है।" },
        { q: "एमएसपी केंद्रों पर अनाज की गुणवत्ता का निर्धारण कैसे किया जाता है?", a: "एमएसपी केंद्रों पर स्वीकृति से पहले अनाज की नमी और साफ-सफाई की जांच की जाती है।" }
      ]
    },
    relatedArticles: ["mandi-online-sales-enam", "mandi-price-trends-timing"]
  },
  {
    title: {
      en: "Organic Farming Transition Guide for Smallholders",
      hi: "छोटे किसानों के लिए जैविक खेती में बदलाव की गाइड"
    },
    slug: "organic-farming-smallholders",
    description: {
      en: "A step-by-step roadmap to reduce chemical inputs, prepare Jeevamrut, and gain PGS organic certifications.",
      hi: "रासायनिक उर्वरकों को कम करने, जीवामृत तैयार करने और पीजीएस जैविक प्रमाणन प्राप्त करने के लिए स्टेप-बाय-स्टेप रोडमैप।"
    },
    author: {
      en: "Shripad Dabholkar, Organic Farm Practitioner",
      hi: "श्रीपाद दाभोलकर, जैविक कृषि चिकित्सक"
    },
    publishedDate: "2026-06-04",
    updatedDate: "2026-06-16",
    category: "soil",
    tags: {
      en: ["organic farming", "jeevamrut", "soil biology", "green manure"],
      hi: ["जैविक खेती", "जीवामृत", "मृदा जीव विज्ञान", "हरी खाद"]
    },
    featuredImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Transitioning from chemical to organic farming requires patience. Abruptly stopping chemical fertilizers leads to yield shocks. A phased conversion over 3 years is recommended to allow soil micro-organisms (earthworms, beneficial bacteria) to return.

In Phase 1, reduce chemical NPK by 30% and supplement with compost and green manures (like Dhaincha or Sunnhemp). In Phase 2, incorporate bio-fertilizers like Azotobacter and Rhizobium.

Use Jeevamrut—a liquid organic formulation prepared by mixing 10 kg fresh cow dung, 10 liters cow urine, 2 kg jaggery, 2 kg pulse flour, and a handful of forest soil in 200 liters of water. Ferment for 5-7 days and apply to soil during irrigation. It serves as a culture of beneficial microbes. For certification, apply under the Participatory Guarantee System (PGS-India) to sell at premium prices.`,
      hi: `रासायनिक से जैविक खेती में संक्रमण (बदलाव) के लिए धैर्य की आवश्यकता होती है। रासायनिक उर्वरकों को अचानक बंद करने से उपज में भारी कमी आ सकती है। मिट्टी के सूक्ष्म जीवों (केंचुए, लाभकारी बैक्टीरिया) को वापस सक्रिय करने के लिए 3 वर्षों में चरणबद्ध तरीके से बदलाव की सिफारिश की जाती है।

चरण 1 में, रासायनिक एनपीके (NPK) को 30% तक कम करें और खाद व हरी खाद (जैसे ढैंचा या सनई) का उपयोग करें। चरण 2 में, एज़ोटोबैक्टर और राइजोबियम जैसे जैव-उर्वरकों को शामिल करें।

जीवामृत का उपयोग करें—जो 10 किलो ताजे गाय के गोबर, 10 लीटर गोमूत्र, 2 किलो गुड़, 2 किलो दाल के आटे और मुट्ठी भर जंगल की मिट्टी को 200 लीटर पानी में मिलाकर तैयार किया जाता है। इसे 5-7 दिनों तक सड़ने दें और सिंचाई के दौरान मिट्टी में डालें। प्रमाणन के लिए, प्रीमियम कीमतों पर बेचने के लिए पीजीएस-इंडिया (PGS-India) के तहत आवेदन करें।`
    },
    faq: {
      en: [
        { q: "How long does organic certification take in India?", a: "Under PGS-India, the transition period typically takes 3 years before full organic status is granted." },
        { q: "What is Jeevamrut?", a: "Jeevamrut is a bio-fertilizer made from cow dung, urine, pulse flour, and jaggery, which activates soil microbial activity." }
      ],
      hi: [
        { q: "भारत में जैविक प्रमाणन में कितना समय लगता है?", a: "पीजीएस-इंडिया के तहत, पूर्ण जैविक दर्जा मिलने से पहले आमतौर पर 3 साल का समय लगता है।" },
        { q: "जीवामृत क्या है?", a: "जीवामृत गाय के गोबर, मूत्र, दाल के आटे और गुड़ से बना एक जैव-उर्वरक है, जो मिट्टी की सूक्ष्मजीव गतिविधि को सक्रिय करता है।" }
      ]
    },
    relatedArticles: ["soil-health-wheat-punjab", "fertilizer-management-npk"]
  },
  {
    title: {
      en: "Preventing Post-Harvest Losses in Pulse Crops",
      hi: "दलहनी फसलों में कटाई के बाद होने वाले नुकसान की रोकथाम"
    },
    slug: "post-harvest-losses-pulses",
    description: {
      en: "Best practices to dry, pack, and store Pigeon Pea (Arhar) and Chickpea (Chana) to prevent pulse beetle damage.",
      hi: "दालों को घुन (पल्स बीटल) के नुकसान से बचाने के लिए अरहर और चना को सुखाने, पैक करने और स्टोर करने के सर्वोत्तम तरीके।"
    },
    author: {
      en: "Dr. Sunita Deshpande, Post-Harvest Technologist",
      hi: "डॉ. सुनीता देशपांडे, कटाई उपरांत प्रौद्योगिकीविद्"
    },
    publishedDate: "2026-06-06",
    updatedDate: "2026-06-19",
    category: "mandi",
    tags: {
      en: ["post-harvest", "pulses storage", "pulse beetle", "farm economics"],
      hi: ["कटाई के बाद", "दालों का भंडारण", "घुन नियंत्रण", "कृषि अर्थशास्त्र"]
    },
    featuredImage: "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&w=800&q=80",
    content: {
      en: `Pulses like Chickpea (Chana), Pigeon Pea (Arhar), and Mung bean are prone to severe post-harvest losses. The major culprit is the Pulse Beetle (Callosobruchus maculatus), which infests grains in warehouses, drilling holes and leaving them hollow. Up to 15% of pulse value can be lost in storage if untreated.

Prevention begins in the field. Harvest when pods are dry. Sun-dry the threshed grains on clean tarpaulins until the moisture level drops below 9-10%. If a seed cracks with a clean sound when bitten, it is dry.

For storage, use Hermetic Bags (Pusa bin or triple-layer bags). These bags cut off oxygen supply, suffocating any insect eggs or larvae. If using traditional jute bags, treat bags with 5% Neem seed kernel extract. Avoid storing pulses near damp walls or mixing old grain stocks with new ones.`,
      hi: `चना, अरहर और मूंग जैसी दालों में कटाई के बाद भारी नुकसान होने का खतरा रहता है। इसका मुख्य कारण घुन (पल्स बीटल) है, जो गोदामों में अनाज को संक्रमित करता है, जिससे वे खोखले हो जाते हैं। यदि उपचार न किया जाए तो भंडारण में दालों के मूल्य का 15% तक नुकसान हो सकता है।

रोकथाम खेत से ही शुरू होती है। जब फलियां पूरी तरह सूख जाएं तब कटाई करें। नमी का स्तर 9-10% से नीचे आने तक अनाज को साफ तिरपाल पर धूप में सुखाएं। यदि दांत से चबाने पर कट की आवाज आए, तो समझें कि वह सूख चुका है।

भंडारण के लिए, हर्मेटिक बैग (हवाबंद बैग या पूसा बिन) का उपयोग करें। ये बैग ऑक्सीजन की आपूर्ति को काट देते हैं, जिससे कीड़े के अंडे या लार्वा का दम घुट जाता है। यदि जूट की थैलियों का उपयोग कर रहे हैं, तो उन्हें 5% नीम के बीज के अर्क से उपचारित करें।`
    },
    faq: {
      en: [
        { q: "How can I identify pulse beetle infestation?", a: "Infested grains show tiny round holes and white eggs cemented to the seed coat." },
        { q: "What is a hermetic bag?", a: "A multi-layered plastic storage bag that prevents air and moisture penetration, naturally killing insect pests." }
      ],
      hi: [
        { q: "मैं घुन (पल्स बीटल) के प्रकोप की पहचान कैसे कर सकता हूँ?", a: "संक्रमित दानों में छोटे गोल छेद दिखाई देते हैं और बीज की सतह पर सफेद अंडे चिपके होते हैं।" },
        { q: "हर्मेटिक बैग क्या है?", a: "एक बहु-स्तरीय प्लास्टिक भंडारण बैग जो हवा और नमी के प्रवेश को रोकता है, जिससे कीड़े प्राकृतिक रूप से मर जाते हैं।" }
      ]
    },
    relatedArticles: ["mandi-price-trends-timing", "role-msp-grain-sales"]
  }
];
