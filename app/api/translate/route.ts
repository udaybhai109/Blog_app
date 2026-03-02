import { NextResponse } from "next/server";
import { translateText } from "@/lib/translation";

type TranslatePayload = {
  sourceLang?: string;
  targetLang?: string;
  texts?: string[];
};

export async function POST(request: Request) {
  let payload: TranslatePayload;
  try {
    payload = (await request.json()) as TranslatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const targetLang = payload.targetLang?.trim().toLowerCase();
  const sourceLang = payload.sourceLang?.trim().toLowerCase();
  const texts = Array.isArray(payload.texts)
    ? payload.texts.map((value) => String(value))
    : [];

  if (!targetLang) {
    return NextResponse.json({ error: "targetLang is required" }, { status: 400 });
  }

  if (texts.length === 0 || texts.length > 3) {
    return NextResponse.json(
      { error: "texts must be a non-empty array with up to 3 items" },
      { status: 400 }
    );
  }

  if (texts.some((text) => text.length > 20000)) {
    return NextResponse.json(
      { error: "Each text must be 20,000 characters or fewer" },
      { status: 400 }
    );
  }

  try {
    const translations = await Promise.all(
      texts.map((text) =>
        translateText(text, {
          sourceLang,
          targetLang
        })
      )
    );

    return NextResponse.json({
      targetLang,
      translations
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Translation service failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
