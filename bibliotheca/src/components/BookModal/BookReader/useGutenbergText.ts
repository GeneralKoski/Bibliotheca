import { useEffect, useMemo, useState } from "react";

const WORDS_PER_PAGE = 280;
const textCache = new Map<number, string>();
const pendingTextRequests = new Map<number, Promise<string>>();

function stripBoilerplate(raw: string): string {
  const startMatch = raw.match(/\*\*\*\s*START OF [^\n]*\*\*\*/i);
  const endMatch = raw.match(/\*\*\*\s*END OF [^\n]*\*\*\*/i);
  let text = raw;
  if (startMatch && startMatch.index != null) {
    text = text.slice(startMatch.index + startMatch[0].length);
  }
  if (endMatch && endMatch.index != null) {
    const relativeEnd = endMatch.index - (startMatch?.index ?? 0) - (startMatch?.[0].length ?? 0);
    if (relativeEnd > 0) text = text.slice(0, relativeEnd);
  }
  return text.trim();
}

function paginate(text: string, wordsPerPage: number): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const pages: string[] = [];
  let currentWords: string[] = [];
  let currentParas: string[] = [];

  const flush = () => {
    if (currentParas.length) {
      pages.push(currentParas.join("\n\n"));
      currentParas = [];
      currentWords = [];
    }
  };

  for (const para of paragraphs) {
    const words = para.split(" ");
    if (currentWords.length + words.length > wordsPerPage && currentWords.length > 0) {
      flush();
    }
    currentParas.push(para);
    currentWords.push(...words);
    if (currentWords.length >= wordsPerPage) {
      flush();
    }
  }
  flush();
  return pages;
}

export interface GutenbergText {
  pages: string[];
  loading: boolean;
  error: string | null;
}

export function useGutenbergText(gutenbergId: number): GutenbergText {
  const cachedText = textCache.get(gutenbergId) ?? null;
  const [raw, setRaw] = useState<string | null>(cachedText);
  const [loading, setLoading] = useState(() => cachedText == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedText != null) {
      return;
    }

    let ignore = false;
    const url = `/api/gutenberg/${gutenbergId}`;

    setLoading(true);
    setError(null);
    setRaw(null);

    const request =
      pendingTextRequests.get(gutenbergId) ??
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .finally(() => {
          pendingTextRequests.delete(gutenbergId);
        });

    pendingTextRequests.set(gutenbergId, request);

    request
      .then((text) => {
        if (ignore) return;
        textCache.set(gutenbergId, text);
        setRaw(text);
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err?.message ?? "Failed to load book");
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [cachedText, gutenbergId]);

  const pages = useMemo(() => {
    if (!raw) return [];
    const cleaned = stripBoilerplate(raw);
    return paginate(cleaned, WORDS_PER_PAGE);
  }, [raw]);

  return { pages, loading, error };
}
