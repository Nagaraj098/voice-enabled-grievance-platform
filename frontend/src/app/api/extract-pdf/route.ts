import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json({ error: "fileUrl is required" }, { status: 500 });
    }

    const pdfRes = await fetch(fileUrl);
    if (!pdfRes.ok) {
      return NextResponse.json({ error: "Failed to fetch PDF file" }, { status: 500 });
    }

    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const extractedText = (parsed.text || "").trim();

    if (!extractedText) {
      return NextResponse.json({ error: "No readable text could be extracted from this PDF." }, { status: 500 });
    }

    return NextResponse.json({
      text: extractedText,
      pages: parsed.numpages,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to extract PDF text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
