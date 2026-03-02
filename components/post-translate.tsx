"use client";

import { useEffect, useMemo, useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
  { code: "ur", label: "Urdu" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" }
];

type PostTranslateProps = {
  title: string;
  content: string;
};

type TranslateResponse = {
  translations?: string[];
  error?: string;
};

const PREFERRED_LANG_KEY = "tash_preferred_lang";

export function PostTranslate({ title, content }: PostTranslateProps) {
  const [targetLang, setTargetLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [showTranslated, setShowTranslated] = useState(false);

  const selectedLanguageLabel = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((language) => language.code === targetLang)?.label ??
      targetLang.toUpperCase(),
    [targetLang]
  );

  useEffect(() => {
    const fromStorage = window.localStorage.getItem(PREFERRED_LANG_KEY);
    if (fromStorage) {
      setTargetLang(fromStorage);
      return;
    }

    const browserCode = navigator.language.toLowerCase().split("-")[0];
    if (LANGUAGE_OPTIONS.some((language) => language.code === browserCode)) {
      setTargetLang(browserCode);
    }
  }, []);

  async function translatePost() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetLang,
          texts: [title, content]
        })
      });

      const data = (await response.json()) as TranslateResponse;
      if (!response.ok || !data.translations || data.translations.length < 2) {
        setError(data.error || "Translation failed.");
        return;
      }

      setTranslatedTitle(data.translations[0]);
      setTranslatedContent(data.translations[1]);
      setShowTranslated(true);
    } catch {
      setError("Translation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mb-8 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Read this post in your language.</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={targetLang}
            onChange={(event) => {
              const value = event.target.value;
              setTargetLang(value);
              window.localStorage.setItem(PREFERRED_LANG_KEY, value);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void translatePost()}
            disabled={isLoading}
            className="rounded-lg border border-border bg-foreground px-3 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>

          {showTranslated ? (
            <button
              type="button"
              onClick={() => setShowTranslated(false)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              Hide
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {showTranslated ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-xs uppercase tracking-wide text-muted">Translated - {selectedLanguageLabel}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight">{translatedTitle}</h2>
          <div className="mt-4">
            <MarkdownPreview content={translatedContent} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
