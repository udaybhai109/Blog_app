type TranslateOptions = {
  sourceLang?: string;
  targetLang: string;
};

function normalizeLanguage(code?: string) {
  if (!code) {
    return "auto";
  }
  return code.toLowerCase().split("-")[0];
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translateWithGoogleApi(
  text: string,
  options: TranslateOptions
) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: options.sourceLang && options.sourceLang !== "auto" ? options.sourceLang : undefined,
        target: options.targetLang,
        format: "text"
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Google Translate request failed.");
  }

  const data = (await response.json()) as {
    data?: {
      translations?: Array<{
        translatedText?: string;
      }>;
    };
  };

  const translated = data.data?.translations?.[0]?.translatedText;
  if (!translated) {
    throw new Error("Google Translate returned an empty response.");
  }

  return decodeHtmlEntities(translated);
}

async function translateWithLibreTranslate(
  text: string,
  options: TranslateOptions
) {
  const baseUrl = process.env.LIBRETRANSLATE_URL;
  if (!baseUrl) {
    return null;
  }

  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: text,
      source: options.sourceLang && options.sourceLang !== "auto" ? options.sourceLang : "auto",
      target: options.targetLang,
      format: "text",
      api_key: apiKey || undefined
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("LibreTranslate request failed.");
  }

  const data = (await response.json()) as { translatedText?: string };
  if (!data.translatedText) {
    throw new Error("LibreTranslate returned an empty response.");
  }

  return data.translatedText;
}

async function translateWithGooglePublicEndpoint(
  text: string,
  options: TranslateOptions
) {
  const query = new URLSearchParams({
    client: "gtx",
    sl: options.sourceLang && options.sourceLang !== "auto" ? options.sourceLang : "auto",
    tl: options.targetLang,
    dt: "t",
    q: text
  });

  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Fallback translate request failed.");
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Fallback translate response format is invalid.");
  }

  const translated = (data[0] as Array<unknown>)
    .map((part) => (Array.isArray(part) ? part[0] : ""))
    .filter((part): part is string => typeof part === "string")
    .join("");

  if (!translated) {
    throw new Error("Fallback translate returned an empty response.");
  }

  return translated;
}

export async function translateText(
  text: string,
  options: TranslateOptions
) {
  const input = text.trim();
  if (!input) {
    return "";
  }

  const targetLang = normalizeLanguage(options.targetLang);
  const sourceLang = normalizeLanguage(options.sourceLang);
  if (!targetLang || targetLang === "auto") {
    throw new Error("A valid target language is required.");
  }

  const translatedByGoogleApi = await translateWithGoogleApi(input, {
    sourceLang,
    targetLang
  });
  if (translatedByGoogleApi) {
    return translatedByGoogleApi;
  }

  const translatedByLibre = await translateWithLibreTranslate(input, {
    sourceLang,
    targetLang
  });
  if (translatedByLibre) {
    return translatedByLibre;
  }

  return translateWithGooglePublicEndpoint(input, {
    sourceLang,
    targetLang
  });
}
