import type { Book } from "../../types";

interface PreviewPanelProps {
  book: Book | null;
  onOpen: (book: Book) => void;
}

export function PreviewPanel(_props: PreviewPanelProps) {
  return null;
}
