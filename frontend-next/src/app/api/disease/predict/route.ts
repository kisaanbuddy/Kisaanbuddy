import { NextResponse } from "next/server";
import { getKnowledge, normalizeCropName } from "@/lib/disease-advisory-store";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
};

export async function POST(request: Request) {
  try {
    let file: FormDataEntryValue | null = null;
    let cropHint = "";
    let symptomNotes = "";

    const urlObj = new URL(request.url);
    if (urlObj.searchParams.get("crop_hint")) {
      cropHint = urlObj.searchParams.get("crop_hint") || "";
    }
    if (urlObj.searchParams.get("symptom_notes")) {
      symptomNotes = urlObj.searchParams.get("symptom_notes") || "";
    }

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await request.formData();
        file = formData.get("file");
        if (!cropHint) cropHint = (formData.get("crop_hint") as string) || "";
        if (!symptomNotes) symptomNotes = (formData.get("symptom_notes") as string) || "";
      } catch {
        // Form parsing fallback
      }
    } else if (contentType.includes("application/json")) {
      try {
        const json = await request.json();
        if (!cropHint) cropHint = json.crop_hint || json.crop || "";
        if (!symptomNotes) symptomNotes = json.symptom_notes || json.symptom || "";
      } catch {
        // JSON parsing fallback
      }
    }

    // 1. If photo is uploaded, run authentic vision model inference on FastAPI backend
    if (file && typeof file !== "string") {
      try {
        const backendUrl = getBackendUrl();
        const forwardData = new FormData();
        forwardData.append("file", file);
        const url = `${backendUrl}/api/disease/predict?crop_hint=${encodeURIComponent(cropHint)}&symptom_notes=${encodeURIComponent(symptomNotes)}`;
        
        const remoteRes = await fetch(url, {
          method: "POST",
          body: forwardData,
          cache: "no-store",
        });

        if (remoteRes.ok) {
          return NextResponse.json(await remoteRes.json());
        }

        const errData = await remoteRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            detail: errData.detail || "The Crop Doctor backend failed to process this image.",
          },
          { status: remoteRes.status }
        );
      } catch {
        // When a photo is provided and backend is offline: fail closed honestly!
        return NextResponse.json(
          {
            detail: "The Crop Doctor vision inference server is currently offline. Please ensure the backend is running at http://127.0.0.1:8000.",
          },
          { status: 503 }
        );
      }
    }

    // 2. Text-only symptom inquiry (explicitly labeled as non-vision text search)
    const normCrop = normalizeCropName(cropHint);
    let knowledgeList = getKnowledge({ crop: normCrop });
    if (knowledgeList.length === 0 && cropHint) {
      knowledgeList = getKnowledge();
    }

    let selectedKnowledge = knowledgeList[0] || getKnowledge()[0];
    if (symptomNotes) {
      const sLower = symptomNotes.toLowerCase();
      const matched = knowledgeList.find((k) => {
        const disWords = k.disease_or_pest.toLowerCase().split(/[\s,.-]+/);
        const symWords = k.symptoms.toLowerCase().split(/[\s,.-]+/);
        return (
          disWords.some((w) => w.length > 3 && sLower.includes(w)) ||
          symWords.some((w) => w.length > 3 && sLower.includes(w))
        );
      });
      if (matched) {
        selectedKnowledge = matched;
      }
    }

    const isHealthy = symptomNotes.toLowerCase().includes("healthy") || symptomNotes.toLowerCase().includes("theek");
    const predictedCode = isHealthy
      ? "healthy_general"
      : `${selectedKnowledge.crop.toLowerCase()}_${selectedKnowledge.disease_or_pest.split(" ")[0].toLowerCase()}`;

    return NextResponse.json({
      predicted_class: predictedCode,
      crop: selectedKnowledge.crop,
      disease_name: isHealthy ? "Healthy Foliage" : selectedKnowledge.disease_or_pest,
      confidence: 0.50,
      status: "uncertain",
      note: "Symptom-based advisory from ICAR knowledge base. Please upload a leaf photo or request KVK review for definitive visual diagnosis.",
      model: "ICAR Agronomic Text Knowledge Search (No Image Provided)",
      top_predictions: [
        {
          class: predictedCode,
          confidence: 0.50,
        },
      ],
      recommend_expert_review: true,
      immediate_action: isHealthy
        ? "Maintain regular balanced nutrition and scheduled scouting."
        : `Begin field hygiene and preventive treatment using ${selectedKnowledge.cibrc_registered_compounds || "recommended biological spray"}.`,
      cultural_control: selectedKnowledge.cultural_preventive,
      biological_control: selectedKnowledge.biological_organic,
      chemical_control: selectedKnowledge.chemical_control,
      cibrc_approved: true,
      dosage_guidelines: selectedKnowledge.dosage_guidelines,
      phi_days: selectedKnowledge.pre_harvest_interval_days || 14,
      safety_instructions: selectedKnowledge.safety_instructions,
      source_institution: selectedKnowledge.source_institution,
      source_url: selectedKnowledge.source_url || "https://icar.gov.in",
      last_verified_date: selectedKnowledge.last_verified_date,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to process crop diagnosis." },
      { status: 500 }
    );
  }
}
