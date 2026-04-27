import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const OPEN_LIBRARY_FIELDS =
  "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject";

const openLibraryCache = new Map<string, string>();
const gutenbergCache = new Map<string, string>();

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendText(res: ServerResponse, status: number, body: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);
}

async function fetchOpenLibrary(query: string): Promise<string> {
  const cached = openLibraryCache.get(query);
  if (cached) return cached;

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", OPEN_LIBRARY_FIELDS);
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Bibliotheca/1.0 (local dev proxy)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Library returned ${response.status}`);
  }

  const text = await response.text();
  openLibraryCache.set(query, text);
  return text;
}

function pickTextFormat(formats: Record<string, string>): string | null {
  const preferredKeys = [
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "text/plain",
  ];

  for (const key of preferredKeys) {
    const url = formats[key];
    if (url) return url;
  }

  for (const [key, url] of Object.entries(formats)) {
    if (key.startsWith("text/plain")) return url;
  }

  return null;
}

async function fetchGutenbergText(bookId: string): Promise<string> {
  const cached = gutenbergCache.get(bookId);
  if (cached) return cached;

  const metaResponse = await fetch(`https://gutendex.com/books/${bookId}`);
  if (!metaResponse.ok) {
    throw new Error(`Gutendex returned ${metaResponse.status}`);
  }

  const meta = (await metaResponse.json()) as {
    formats?: Record<string, string>;
  };

  const formatUrl = meta.formats ? pickTextFormat(meta.formats) : null;
  const fallbackUrls = [
    `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,
    `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
    `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`,
  ];
  const candidateUrls = formatUrl ? [formatUrl, ...fallbackUrls] : fallbackUrls;

  for (const url of candidateUrls) {
    const response = await fetch(url);
    if (!response.ok) continue;
    const text = await response.text();
    if (text.trim().length === 0) continue;
    gutenbergCache.set(bookId, text);
    return text;
  }

  throw new Error(`No plain text format available for Gutenberg book ${bookId}`);
}

async function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) return false;

  const requestUrl = new URL(req.url, "http://localhost");

  if (requestUrl.pathname === "/api/openlibrary/search") {
    const query = requestUrl.searchParams.get("q")?.trim();
    if (!query) {
      sendJson(res, 400, { error: "Missing q parameter" });
      return true;
    }

    try {
      const payload = await fetchOpenLibrary(query);
      sendText(res, 200, payload);
    } catch (error) {
      void error;
      sendJson(res, 200, { docs: [] });
    }
    return true;
  }

  const gutenbergMatch = requestUrl.pathname.match(/^\/api\/gutenberg\/(\d+)$/);
  if (gutenbergMatch) {
    try {
      const payload = await fetchGutenbergText(gutenbergMatch[1]);
      sendText(res, 200, payload);
    } catch (error) {
      sendJson(res, 502, {
        error: error instanceof Error ? error.message : "Gutenberg request failed",
      });
    }
    return true;
  }

  return false;
}

function bibliothecaApiPlugin() {
  return {
    name: "bibliotheca-api",
    configureServer(server: {
      middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void };
    }) {
      server.middlewares.use((req, res, next) => {
        void handleApiRequest(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
    configurePreviewServer(server: {
      middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void };
    }) {
      server.middlewares.use((req, res, next) => {
        void handleApiRequest(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), bibliothecaApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "three";
            if (id.includes("@react-three")) return "r3f";
            if (id.includes("framer-motion")) return "motion";
          }
        },
      },
    },
  },
});
