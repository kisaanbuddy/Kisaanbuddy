import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Never synthesize a diagnosis when the API fails. Forward farmer authentication. */
export async function POST(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const body = new FormData();
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const incoming = await request.formData();
      const file = incoming.get("file");
      if (file && typeof file !== "string") {
        if (file.size > 15 * 1024 * 1024) {
          return NextResponse.json({ detail: "Maximum image size is 15 MB." }, { status: 413 });
        }
        body.set("file", file);
      }
      for (const key of ["crop_hint", "symptom_notes"]) {
        const value = incoming.get(key);
        if (!query.has(key) && typeof value === "string") query.set(key, value);
      }
    } else {
      const incoming = await request.json();
      for (const key of ["crop_hint", "symptom_notes"]) {
        if (!query.has(key) && typeof incoming[key] === "string") query.set(key, incoming[key]);
      }
    }
    const base = process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production" ? "https://krishiai-api.onrender.com" : "http://127.0.0.1:8000");
    const headers = new Headers();
    for (const name of ["cookie", "authorization"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const response = await fetch(`${base}/api/disease/predict?${query}`, {
      method: "POST", body, headers, cache: "no-store", signal: AbortSignal.timeout(60000),
    });
    const result = await response.json().catch(() => ({ detail: "Crop Doctor returned an invalid response." }));
    return NextResponse.json(result, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "Crop Doctor is unavailable. Please retry shortly; no diagnosis has been generated." }, { status: 503 });
  }
}
