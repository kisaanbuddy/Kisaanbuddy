# Agricultural Marketplace Data Sources Evaluation
**KisaanBuddy Platform — Reference Catalogue & Live Marketplace Integration**
*Document Version: 1.0 | Date: October 2026*

---

## Executive Summary

To avoid an empty marketplace catalogue while farmers and equipment owners onboard, KisaanBuddy integrates publicly available, legally permitted, and authorized agricultural datasets. This document details the research, technical feasibility, legal terms, commercial reuse rights, and integration mechanisms for the 8 evaluated sources.

Crucially, **reference data (specifications, benchmark rates, APMC mandi prices)** is strictly separated from **live inventory (active produce batches and equipment offered for rent/sale by verified farmers)**.

---

## 1. Source-by-Source Evaluation Matrix

| Source | Primary Data Provided | Ingestion Method | Auth Required | Commercial Reuse Permission | Update Frequency | Data Type (Reference vs Live) |
|---|---|---|---|---|---|---|
| **1. Govt Farm Mechanization Portal (farmech.dac.gov.in / SMAM / FMTTI)** | Certified tractor & implement test reports, HP ratings, PTO power, fuel consumption, hydraulic lift, implement compatibility | Batch JSON/CSV ingestion of published FMTTI gazettes & public test codes | None (Public Domain / NDSAP) | Permitted under National Data Sharing and Accessibility Policy (NDSAP) for public factual data | Quarterly / Bi-annual | Reference Catalogue Only (No Live Inventory) |
| **2. FARMS Farm Machinery Solutions (farms.dac.gov.in / CHC)** | Custom Hiring Centre (CHC) locations, implement types, indicative regional hiring rates | Structured CSV/JSON reference import; Authorized REST API (subject to MoA approval) | API Key / Department Token for direct API; None for published CSV reports | Fair use for benchmark directory; direct booking requires MoU with DAC&FW | Monthly / Seasonal | Reference Specifications & Indicative Hiring Rates |
| **3. Official Agricultural Machinery Manufacturer Catalogues** | Technical specs, dimensions, working widths, engine RPM, compatible tractor ranges (Shaktiman, Maschio Gaspardo, LEMKEN, Fieldking) | Manufacturer specification ingestion pipeline (JSON/CSV) | None (Public Product Fact Sheets) | Factual engineering specifications are non-copyrightable facts; trademarks & copyrighted photos handled via fair attribution/vectors | Annual / Model Release | Reference Catalogue Only |
| **4. Official Tractor Manufacturer Product Pages** | Engine HP, PTO HP, cylinders, gearbox, lift capacity, weight, fuel efficiency (Mahindra, Swaraj, Sonalika, TAFE, John Deere, Escorts Kubota) | Structured manufacturer product model schemas | None (Public Product Specs) | Factual specifications and mechanical properties are public domain facts | Annual / Model Release | Reference Catalogue Only |
| **5. Government Open Data Platform (data.gov.in)** | Farm mechanization statistics, state-wise farm implement distributions, ICAR bulletins | data.gov.in REST API v2 | API Key (`DATA_GOV_API_KEY`) | Open Government Data (OGD) License - India (commercial reuse allowed with attribution) | Dynamic / Monthly | Reference & Historical Statistical Data |
| **6. AGMARKNET Mandi-Price Data (agmarknet.gov.in & data.gov.in)** | Daily mandi arrivals, minimum, maximum, and modal price by commodity, variety, state, and market center | data.gov.in Resource `9ef84268-d588-465a-a308-a864a43d0070` REST API | API Key (`DATA_GOV_API_KEY`) | OGD License - India (commercial & non-commercial reuse allowed) | Daily (Real-time updates) | Market-Price Reference (Never presented as farmer offer price) |
| **7. Authorized Marketplace APIs & Data Feeds (eNAM & KVK)** | eNAM trade volumes, commodity grade standards, Krishi Vigyan Kendra package of practices | eNAM Open Ticker Feeds & ICAR/KVK public bulletins | Open Feeds: None; Trading API: Registered Participant Token | Open ticker data is public; trade execution requires eNAM Unified License | Daily / Weekly | Market Reference & Educational Standards |
| **8. ONDC Integration Opportunities (ONDC Agriculture Network)** | B2B Agriculture buyer-app protocol, machinery rental discovery, input supply | Beckn Protocol (REST over HTTP with Ed25519 request signing) | ONDC Participant ID, Registry Key Pair | Open Network for Digital Commerce Network Participant Agreement | Real-time (Event-driven webhooks) | Live Multi-Seller Inventory (Future Federation) |

---

## 2. In-Depth Source Analysis

### Source 1: Government Farm Mechanization Portal & FMTTI
* **URL:** `https://farmech.dac.gov.in`
* **Institutes:**
  - Central Farm Machinery Training & Testing Institute (CFMTTI), Budni (MP) — Primary tractor testing authority.
  - Northern Region FMTTI (NRFMTTI), Hisar (Haryana) — Combine harvesters and straw reapers.
  - Southern Region FMTTI (SRFMTTI), Garladinne (Andhra Pradesh) — Power tillers and land development machinery.
  - North Eastern Region FMTTI (NERFMTTI), Biswanath Chariali (Assam) — Implements and small equipment.
* **Available Data:** Official test codes, drawbar pull, PTO horsepower at rated engine speed, hydraulic lift capacity at 610 mm behind hitch point, specific fuel consumption (SFC in g/kWh), working width, sound levels, safety ROPS certification.
* **Legal & Reuse Terms:** Reports are official public documents issued under statutory government testing protocols. Factual engineering figures are in the public domain under the National Data Sharing and Accessibility Policy (NDSAP).
* **Inventory Classification:** **Reference Specifications Only**. Not available for direct booking or purchase on KisaanBuddy.

### Source 2: FARMS Farm Machinery Solutions (FARMS-CHC)
* **URL:** `https://farms.dac.gov.in`
* **Authority:** Mechanization & Technology Division, Ministry of Agriculture & Farmers Welfare, GoI.
* **Available Data:** Implement categorisation, benchmark custom hiring rates across agro-climatic zones, standard operational capacity (acres/hour).
* **API Availability:** Direct REST API is currently restricted to registered state nodal agencies and designated Custom Hiring Centres (CHCs).
* **Integration Strategy:** Ingest published district-level benchmark rental rate brackets as reference indicators (e.g., "Typical regional CHC rate: ₹700–900/hr") while allowing verified local machine owners to set their actual rental prices.

### Source 3 & 4: Agricultural Machinery & Tractor Manufacturers
* **Manufacturers Covered:**
  - **Tractors:** Mahindra & Mahindra, Swaraj (M&M Ltd), International Tractors Ltd (Sonalika), TAFE (Massey Ferguson), John Deere India, Escorts Kubota (Powertrac / Farmtrac), Kubota Agricultural Machinery India, Eicher Tractors.
  - **Implements:** Shaktiman (Tirth Agro Technology), Maschio Gaspardo India, LEMKEN India, Fieldking (Beroni Agro), Dasmesh Mechanical Works, Preet Agro, ASPEE Group (sprayers), Jain Irrigation Systems (micro-irrigation).
* **Available Data:** Manufacturer, brand, model designation, engine displacement, rated RPM, PTO power, transmission speeds, tire sizes, dimensions, weight, recommended PTO input.
* **Legal & Intellectual Property:**
  - Technical measurements (horsepower, blade count, millimeters) are empirical facts and not copyrightable under Indian and international IP law.
  - Manufacturer brand names and trademarks are used strictly nominatively to identify the equipment accurately.
  - High-resolution copyrighted marketing photography from manufacturer brochures is **not scraped**. Instead, KisaanBuddy utilizes authorized media assets, clean SVG category technical blueprints, or farmer-uploaded photos of their actual machinery.

### Source 5 & 6: AGMARKNET and data.gov.in
* **Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070`
* **Portal:** `https://data.gov.in` & `https://agmarknet.gov.in`
* **Data Fields:** State, District, Market, Commodity, Variety, Arrival_Date, Min_Price, Max_Price, Modal_Price.
* **Commercial Reuse:** Fully permitted under Open Government Data (OGD) License - India:
  > *"Users are granted a worldwide, royalty-free, non-exclusive license to use, adapt, and distribute the data for commercial and non-commercial purposes, with attribution to the data provider."*
* **Strict Rule in KisaanBuddy:** Mandi modal prices are presented exclusively in the **"Benchmark Market Prices"** analytics panel with clear source attribution. They are never confused with or displayed as a farmer's asking price.

### Source 7: eNAM (National Agriculture Market)
* **URL:** `https://enam.gov.in`
* **Available Data:** Electronic trading volumes, inter-state trade indices, quality assaying parameters (moisture, foreign matter, admixture percentages for FAQ grade commodities).
* **Integration Strategy:** Reference commodity assaying benchmarks (e.g., FAQ Wheat moisture standard < 12%) to guide farmers when listing their harvest lots.

### Source 8: ONDC (Open Network for Digital Commerce)
* **Architecture:** Decentralized Beckn Protocol (`search`, `select`, `init`, `confirm`, `status`, `track`).
* **Agriculture Domain:** B2B Agriculture Buyer App schema for bulk produce and equipment rental contracts.
* **Readiness:** KisaanBuddy's data schemas for `ProduceListing` and `EquipmentListing` are modeled to map 1:1 to Beckn Core Retail and Rental schemas, enabling smooth federation when connecting as an ONDC Network Participant.

---

## 3. Data Governance & Provenance Rules

1. **No Phantom Inventory:**
   - A catalogue record (`EQUIPMENT_CATALOG`) MUST have `is_reference_only = True`.
   - The UI displays: *"Reference Specifications only. Not an active rental/sale listing."*
2. **Provenance Tracking:**
   - Every imported catalogue and price record stores: `provenance_source`, `official_source_url`, `source_verification_date`, and `provenance_license`.
3. **Verified Seller Listings:**
   - An active listing (`EQUIPMENT_LISTING` or `PRODUCE_LISTING`) is only created when an actual farmer, equipment owner, or dealer explicitly lists the item with consent.
4. **No Price Invention:**
   - If technical specs or rental rates are unknown, they are displayed as "—" or "Contact owner for quote", never estimated or fabricated.
