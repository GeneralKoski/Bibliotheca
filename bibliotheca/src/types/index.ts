export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  category: string;
  pages: number;
  color: string;
  description: string;
  longDescription: string;
  gutenbergId: number;
  coverUrl: null;
  coverId: number | null;
  rating: number;
  tags: string[];
}
