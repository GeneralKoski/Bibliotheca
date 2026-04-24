import { useEffect, useMemo, useState } from "react";

const WORDS_PER_PAGE = 280;

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
  const [raw, setRaw] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const directUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;

    setLoading(true);
    setError(null);
    setRaw(null);

    const tryFetch = (url: string) =>
      fetch(url, { signal: controller.signal }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

    tryFetch(directUrl)
      .catch(() => tryFetch(proxyUrl))
      .then((text) => {
        if (controller.signal.aborted) return;
        setRaw(text);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err?.message ?? "Failed to load book");
        setLoading(false);
      });

    return () => controller.abort();
  }, [gutenbergId]);

  const pages = useMemo(() => {
    if (!raw) return [];
    const cleaned = stripBoilerplate(raw);
    return paginate(cleaned, WORDS_PER_PAGE);
  }, [raw]);

  return { pages, loading, error };
}
