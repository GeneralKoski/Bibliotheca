import { createContext, useContext } from "react";

export type ThemeId = "cream" | "sepia" | "dark" | "contrast";
export type FontId = "sans" | "serif";
export type SizeId = "s" | "m" | "l";

export interface ReaderTheme {
  id: ThemeId;
  label: string;
  bgTop: string;
  bgBottom: string;
  textColor: string;
  metaColor: string;
  borderColor: string;
  panelTint: string;
}

export interface ReaderFont {
  id: FontId;
  label: string;
  family: string;
}

export interface ReaderSize {
  id: SizeId;
  label: string;
  basePx: number;
  lineHeightPx: number;
  metaPx: number;
}

export const THEMES: Record<ThemeId, ReaderTheme> = {
  cream: {
    id: "cream",
    label: "Cream",
    bgTop: "#F7F1E4",
    bgBottom: "#EFE7D4",
    textColor: "#1a1a1a",
    metaColor: "#7a6a52",
    borderColor: "rgba(74, 55, 40, 0.15)",
    panelTint: "#1a1610",
  },
  sepia: {
    id: "sepia",
    label: "Sepia",
    bgTop: "#EBDDC2",
    bgBottom: "#D9C7A3",
    textColor: "#3a2814",
    metaColor: "#7a5a3a",
    borderColor: "rgba(74, 40, 20, 0.2)",
    panelTint: "#241a10",
  },
  dark: {
    id: "dark",
    label: "Dark",
    bgTop: "#1f1d1a",
    bgBottom: "#16140f",
    textColor: "#E8E0D0",
    metaColor: "#9a9286",
    borderColor: "rgba(232, 224, 208, 0.12)",
    panelTint: "#0a0908",
  },
  contrast: {
    id: "contrast",
    label: "Contrast",
    bgTop: "#000000",
    bgBottom: "#000000",
    textColor: "#ffffff",
    metaColor: "#cccccc",
    borderColor: "rgba(255, 255, 255, 0.3)",
    panelTint: "#000000",
  },
};

export const FONTS: Record<FontId, ReaderFont> = {
  sans: { id: "sans", label: "Sans", family: '"Inter", sans-serif' },
  serif: {
    id: "serif",
    label: "Serif",
    family: '"Playfair Display", Georgia, serif',
  },
};

export const SIZES: Record<SizeId, ReaderSize> = {
  s: { id: "s", label: "S", basePx: 16, lineHeightPx: 23, metaPx: 12 },
  m: { id: "m", label: "M", basePx: 18, lineHeightPx: 26, metaPx: 14 },
  l: { id: "l", label: "L", basePx: 21, lineHeightPx: 30, metaPx: 15 },
};

export interface ReaderStyle {
  theme: ReaderTheme;
  font: ReaderFont;
  size: ReaderSize;
}

const STORAGE_KEY = "bibliotheca:readerStyle";

interface StoredPrefs {
  themeId: ThemeId;
  fontId: FontId;
  sizeId: SizeId;
}

export const DEFAULT_PREFS: StoredPrefs = {
  themeId: "cream",
  fontId: "sans",
  sizeId: "m",
};

export function loadReaderPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      themeId: parsed.themeId in THEMES ? parsed.themeId : DEFAULT_PREFS.themeId,
      fontId: parsed.fontId in FONTS ? parsed.fontId : DEFAULT_PREFS.fontId,
      sizeId: parsed.sizeId in SIZES ? parsed.sizeId : DEFAULT_PREFS.sizeId,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveReaderPrefs(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function resolveStyle(prefs: StoredPrefs): ReaderStyle {
  return {
    theme: THEMES[prefs.themeId],
    font: FONTS[prefs.fontId],
    size: SIZES[prefs.sizeId],
  };
}

export const ReaderStyleContext = createContext<ReaderStyle>(
  resolveStyle(DEFAULT_PREFS)
);

export function useReaderStyle(): ReaderStyle {
  return useContext(ReaderStyleContext);
}
