# Bibliotheca

An editorial 3D library to browse and read public-domain books.

A horizontally-scrolling shelf rendered with React Three Fiber, paired with a 3D
page-flip reader for full books streamed from Project Gutenberg.

## Features

- **3D shelf** with angled books, hover lift, and a focused-volume preview panel.
- **Grid view** as a 2D alternative (default on mobile).
- **Filters**: search, category, status (read / reading / wishlist), sort
  (year, author, personal rating, last opened).
- **Reader**:
  - Drag, click or arrow keys to flip pages; multi-page jumps with `goTo`.
  - Themes (cream / sepia / dark / contrast), font (sans / serif), font size.
  - In-book search (Cmd/Ctrl+F), chapter index, bookmarks, notes & quotes
    (with markdown export), reading-time estimate, optional page-flip sound.
  - Reading progress and downloaded text persisted (localStorage + IndexedDB)
    for offline re-opening.
- **Deep links** (`?book=<id>`), accessible book list behind a skip-link,
  error boundary that falls back to grid view on WebGL failure.

## Stack

- React 19 + TypeScript + Vite
- React Three Fiber + Three.js for the 3D shelf and reader
- Framer Motion for transitions
- Tailwind CSS for layout and tokens
- Project Gutenberg as the text source, OpenLibrary for cover images

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

Texts are fetched through a `/api/gutenberg/:id` endpoint configured in
`vite.config.ts` so requests proxy to Gutenberg without CORS issues during dev.

## Credits

- **Project Gutenberg** — full text of public-domain books.
- **OpenLibrary** — cover images.
- **Fonts**: Playfair Display & Inter (Google Fonts).
- **Libraries**: react-three/fiber, react-three/drei, three, framer-motion.

## License

Code: MIT. Books: public domain. Cover images: per OpenLibrary terms.
