# Bibliotheca — Istruzioni di sviluppo per Claude Code

Leggi questo file integralmente prima di scrivere una sola riga di codice.
Sviluppa il progetto **sezione per sezione** seguendo l'ordine indicato.
Dopo aver completato ogni sezione, esegui un commit git con il messaggio indicato.
Non procedere alla sezione successiva prima di aver committato quella corrente.

---

## Sezione 0 — Setup progetto

```bash
npx create-react-app bibliotheca --template typescript
cd bibliotheca
npm install three @react-three/fiber @react-three/drei
npm install framer-motion
npm install @types/three
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configura `tailwind.config.js`:
```js
content: ["./src/**/*.{js,ts,jsx,tsx}"]
```

In `src/index.css` aggiungi in cima:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

In `public/index.html` aggiungi nel `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
```

Inizializza il repository git e fai il primo commit.

> **COMMIT:** `git commit -m "feat: project setup – React TS + Three.js + Tailwind + fonts"`

---

## Sezione 1 — Struttura cartelle e tipi

Crea la seguente struttura in `src/`:

```
src/
├── components/
│   ├── BookCarousel/
│   │   ├── BookCarousel.tsx
│   │   ├── Book3D.tsx
│   │   └── useCarouselScroll.ts
│   ├── PreviewPanel/
│   │   └── PreviewPanel.tsx
│   ├── BookModal/
│   │   ├── BookModal.tsx
│   │   └── BookReader/
│   │       ├── BookReader.tsx
│   │       ├── PageMesh.tsx
│   │       └── usePageFlip.ts
├── data/
│   └── books.ts
├── types/
│   └── index.ts
└── App.tsx
```

In `src/types/index.ts` definisci:

```typescript
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
  rating: number;
  tags: string[];
}
```

> **COMMIT:** `git commit -m "feat: folder structure and TypeScript types"`

---

## Sezione 2 — Dataset libri

Popola `src/data/books.ts` con questi 20 libri (tutti gratuiti su Project Gutenberg):

```typescript
import { Book } from '../types';

export const books: Book[] = [
  {
    id: 1,
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    year: 1865,
    category: "Fantasy",
    pages: 96,
    color: "#7B2FBE",
    description: "Alice follows a White Rabbit down a rabbit hole into a fantastical world of impossible creatures and nonsensical logic.",
    longDescription: "One of the most beloved children's novels ever written, Alice's Adventures in Wonderland is a masterpiece of literary nonsense. Carroll's tale follows young Alice as she tumbles into a magical underground world, encountering the Mad Hatter, the Cheshire Cat, the Queen of Hearts, and a cast of impossibly strange characters. Beneath its whimsical surface lies sharp social satire and rich philosophical puzzles that have captivated readers for over 150 years.",
    gutenbergId: 11,
    coverUrl: null,
    rating: 4.8,
    tags: ["classic", "fantasy", "children", "adventure"]
  },
  {
    id: 2,
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    year: 1890,
    category: "Gothic Fiction",
    pages: 254,
    color: "#1A1A2E",
    description: "A young man sells his soul for eternal youth, while a portrait bears the marks of his moral decay.",
    longDescription: "Oscar Wilde's only novel is a razor-sharp exploration of vanity, moral corruption, and the cult of beauty. Dorian Gray, a beautiful young man, wishes that his portrait would age in his place while he remains forever young. The wish is granted, and Dorian descends into a life of hedonism and crime, his soul rotting while his face stays pristine. A devastating critique of Victorian aestheticism and the price of superficiality.",
    gutenbergId: 174,
    coverUrl: null,
    rating: 4.7,
    tags: ["classic", "gothic", "philosophy"]
  },
  {
    id: 3,
    title: "Frankenstein",
    author: "Mary Shelley",
    year: 1818,
    category: "Horror / Sci-Fi",
    pages: 280,
    color: "#2D4A3E",
    description: "A scientist creates life from dead matter and must confront the consequences of playing God.",
    longDescription: "Written when Mary Shelley was just nineteen, Frankenstein is one of the most enduring works of Gothic horror and the founding text of science fiction. Victor Frankenstein, brilliant and obsessed, assembles a creature from corpse parts and galvanises it to life — only to recoil in horror at his own creation. The novel asks timeless questions about responsibility, humanity, and the ethics of scientific ambition, told through nested narratives of heartbreaking power.",
    gutenbergId: 84,
    coverUrl: null,
    rating: 4.6,
    tags: ["classic", "horror", "science-fiction"]
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    category: "Romance",
    pages: 432,
    color: "#C9A96E",
    description: "The witty Elizabeth Bennet navigates love, class, and family in Regency England.",
    longDescription: "Austen's most beloved novel opens with one of the most famous lines in English literature and never lets go. Elizabeth Bennet, the second of five sisters in a family teetering on genteel poverty, must navigate a world where marriage is economic survival. Her sparring with the proud and initially insufferable Mr. Darcy is a masterclass in romantic tension, social comedy, and psychological insight. A novel that invented the modern romance.",
    gutenbergId: 1342,
    coverUrl: null,
    rating: 4.9,
    tags: ["classic", "romance", "social"]
  },
  {
    id: 5,
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    year: 1892,
    category: "Mystery",
    pages: 307,
    color: "#8B4513",
    description: "Twelve short stories featuring literature's most famous detective and his faithful companion Dr. Watson.",
    longDescription: "The first collection of Sherlock Holmes stories collects twelve tales from the Strand Magazine, including A Scandal in Bohemia, The Red-Headed League, and The Speckled Band. Conan Doyle's consulting detective — cold, methodical, brilliantly observant — became the template for every fictional detective who followed. Read alongside Watson, you feel the fog of Baker Street, the thrill of the chase, and the satisfaction of an impossible mystery solved.",
    gutenbergId: 1661,
    coverUrl: null,
    rating: 4.8,
    tags: ["mystery", "detective", "classic"]
  },
  {
    id: 6,
    title: "Dracula",
    author: "Bram Stoker",
    year: 1897,
    category: "Horror",
    pages: 418,
    color: "#4A0E0E",
    description: "Jonathan Harker travels to Transylvania and awakens an ancient, immortal evil.",
    longDescription: "Told entirely through journals, letters, and newspaper clippings, Dracula is a masterwork of epistolary horror. Solicitor Jonathan Harker travels to the Carpathian Mountains to assist a mysterious Transylvanian nobleman — and realises too late that he is a prisoner in the castle of a vampire. Back in England, Count Dracula begins preying on the innocent, and a small band of friends must race to destroy him. The novel that defined vampires for all time.",
    gutenbergId: 345,
    coverUrl: null,
    rating: 4.7,
    tags: ["horror", "gothic", "classic"]
  },
  {
    id: 7,
    title: "The Metamorphosis",
    author: "Franz Kafka",
    year: 1915,
    category: "Absurdism",
    pages: 84,
    color: "#3D3D3D",
    description: "A travelling salesman wakes one morning to find himself transformed into a monstrous insect.",
    longDescription: "One of the most discussed works of 20th-century literature, Kafka's short novella begins with its premise already delivered: Gregor Samsa has become a giant insect. What follows is not an explanation, but an unflinching study of alienation, family obligation, and the dehumanising effects of modern work. The horror is not the transformation itself but the way his family slowly ceases to see him as human at all. Disturbing, darkly comic, and utterly original.",
    gutenbergId: 5200,
    coverUrl: null,
    rating: 4.5,
    tags: ["absurdism", "existential", "classic"]
  },
  {
    id: 8,
    title: "A Room with a View",
    author: "E.M. Forster",
    year: 1908,
    category: "Romance",
    pages: 226,
    color: "#4E8098",
    description: "A young Englishwoman's trip to Florence awakens in her a passion that challenges every social convention.",
    longDescription: "Lucy Honeychurch arrives in Florence with her chaperone cousin and finds her sheltered worldview shattered by the passionate Emerson family. Back in the Surrey countryside, she is engaged to the cultivated but emotionally sterile Cecil Vyse — and must choose between security and feeling. Forster's comedy of manners is as warm as Italian sunlight, satirising Edwardian repression with great affection and sharp wit.",
    gutenbergId: 2641,
    coverUrl: null,
    rating: 4.4,
    tags: ["romance", "travel", "classic"]
  },
  {
    id: 9,
    title: "The War of the Worlds",
    author: "H.G. Wells",
    year: 1898,
    category: "Science Fiction",
    pages: 192,
    color: "#1C3A1C",
    description: "Martian invaders devastate Victorian England in the original alien invasion story.",
    longDescription: "When a series of mysterious cylinders land in the English countryside, the narrator — a writer living in Surrey — witnesses the emergence of towering, heat-ray-wielding Martian fighting machines. Wells' novel is a sustained exercise in cosmic horror: the empire that ruled the world is helpless, and humans are simply prey. A savage commentary on imperialism, wrapped in the first great alien invasion narrative. The ending remains one of the most surprising in science fiction.",
    gutenbergId: 36,
    coverUrl: null,
    rating: 4.6,
    tags: ["sci-fi", "alien", "classic"]
  },
  {
    id: 10,
    title: "The Time Machine",
    author: "H.G. Wells",
    year: 1895,
    category: "Science Fiction",
    pages: 118,
    color: "#2C4A7C",
    description: "A Victorian inventor travels 800,000 years into the future and discovers what humanity has become.",
    longDescription: "Wells' first novel invented the concept of time travel as we know it. The Time Traveller arrives in the year 802,701 to find humanity split into two species: the beautiful, childlike Eloi who live in crumbling palaces, and the subterranean Morlocks who feed them — and feed on them. A breathtaking piece of class satire and evolutionary speculation, it remains bracingly dark and imaginative more than a century after publication.",
    gutenbergId: 35,
    coverUrl: null,
    rating: 4.5,
    tags: ["sci-fi", "time-travel", "classic"]
  },
  {
    id: 11,
    title: "Moby Dick",
    author: "Herman Melville",
    year: 1851,
    category: "Adventure",
    pages: 635,
    color: "#1A3A5C",
    description: "Captain Ahab's monomaniacal obsession with a white whale drives his crew toward destruction.",
    longDescription: "Call me Ishmael. Melville's great white whale of a novel is at once a technical treatise on 19th-century whaling, a meditation on obsession and fate, and a work of cosmic philosophical ambition. Captain Ahab, his leg lost to the legendary white sperm whale Moby Dick, pursues the creature across the Pacific with a fervour that borders on madness. A book that rewards re-reading at every stage of life and gives back more than you put in.",
    gutenbergId: 2701,
    coverUrl: null,
    rating: 4.3,
    tags: ["adventure", "sea", "classic"]
  },
  {
    id: 12,
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    year: 1844,
    category: "Adventure",
    pages: 1276,
    color: "#5C3A1A",
    description: "A wrongly imprisoned sailor escapes, amasses a fortune, and returns to destroy those who betrayed him.",
    longDescription: "The ultimate revenge fantasy and one of the most gripping adventure novels ever written. Edmond Dantès, a young sailor on the cusp of happiness, is betrayed by jealous rivals and imprisoned for thirteen years in the Château d'If. He escapes, discovers a vast treasure, and reinvents himself as the mysterious Count of Monte Cristo — patient, brilliant, and pitiless in his vengeance. Epic in scale, relentlessly entertaining, and surprisingly moving.",
    gutenbergId: 1184,
    coverUrl: null,
    rating: 4.9,
    tags: ["adventure", "revenge", "classic"]
  },
  {
    id: 13,
    title: "Emma",
    author: "Jane Austen",
    year: 1815,
    category: "Romance",
    pages: 474,
    color: "#A8C5A0",
    description: "A self-appointed matchmaker meddles in everyone's affairs but her own.",
    longDescription: "Austen's most technically accomplished novel centres on Emma Woodhouse — handsome, clever, and rich — who fancies herself a matchmaker and spends the novel disastrously proving she is not. The humour is subtler and more psychological than Pride and Prejudice, the social world more tightly circumscribed. Mr. Knightley is the ideal romantic hero: honest, consistent, and the only person willing to tell Emma the truth. One of the greatest comedies of manners in English.",
    gutenbergId: 158,
    coverUrl: null,
    rating: 4.6,
    tags: ["romance", "comedy", "classic"]
  },
  {
    id: 14,
    title: "Dr Jekyll and Mr Hyde",
    author: "Robert Louis Stevenson",
    year: 1886,
    category: "Gothic Horror",
    pages: 141,
    color: "#2A2A4A",
    description: "A doctor's experiment in separating good from evil unleashes a monster from within.",
    longDescription: "Stevenson's chilling novella has seeped so deeply into culture that 'Jekyll and Hyde' is now a common phrase — yet the original remains far stranger and darker than its reputation suggests. Told from the perspective of the lawyer Utterson, it is a mystery as much as a horror story: who is the brutish Mr. Hyde, and why does the respected Dr. Jekyll protect him? The revelation, when it comes, is still shocking. A perfect Victorian nightmare about the duality of human nature.",
    gutenbergId: 43,
    coverUrl: null,
    rating: 4.5,
    tags: ["horror", "psychology", "classic"]
  },
  {
    id: 15,
    title: "Twenty Thousand Leagues Under the Sea",
    author: "Jules Verne",
    year: 1870,
    category: "Science Fiction",
    pages: 360,
    color: "#0A3A5C",
    description: "Three prisoners aboard the futuristic submarine Nautilus explore the ocean's deepest mysteries.",
    longDescription: "Verne's most scientifically ambitious novel follows Professor Aronnax, his servant Conseil, and the harpooner Ned Land as unwilling guests of the enigmatic Captain Nemo aboard the Nautilus — a submarine decades ahead of anything that existed. Together they explore coral reefs, encounter giant squid, walk on the ocean floor, and discover the ruins of Atlantis. Nemo himself — brilliant, tormented, and implacably hostile to the surface world — remains one of literature's great anti-heroes.",
    gutenbergId: 164,
    coverUrl: null,
    rating: 4.7,
    tags: ["sci-fi", "adventure", "ocean"]
  },
  {
    id: 16,
    title: "The Scarlet Letter",
    author: "Nathaniel Hawthorne",
    year: 1850,
    category: "Historical Fiction",
    pages: 238,
    color: "#8B0000",
    description: "A woman condemned to wear a scarlet 'A' for adultery refuses to be destroyed by Puritan judgment.",
    longDescription: "Set in 17th-century Puritan Boston, Hawthorne's masterwork follows Hester Prynne, condemned to wear a scarlet letter as punishment for adultery and to raise her illegitimate daughter Pearl alone. Her secret lover, the Reverend Dimmesdale, wastes away under hidden guilt, while her estranged husband plots revenge. A profound study of guilt, identity, social hypocrisy, and the destructive power of repressed shame — as relevant now as when it was written.",
    gutenbergId: 25344,
    coverUrl: null,
    rating: 4.2,
    tags: ["historical", "puritan", "classic"]
  },
  {
    id: 17,
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    category: "Gothic Romance",
    pages: 532,
    color: "#4A3728",
    description: "An orphaned governess falls for her brooding employer, but Thornfield Hall hides a terrible secret.",
    longDescription: "One of the most passionate and psychologically complex novels of the 19th century, Jane Eyre follows its fiercely independent protagonist from a miserable childhood through to a love that tests every principle she holds. Rochester is the original Byronic hero — dark, damaged, magnetic — and Bertha Mason in the attic is one of literature's most haunting figures. The novel invented the template for Gothic romance and gave us a heroine who refuses to compromise her selfhood for anyone.",
    gutenbergId: 1260,
    coverUrl: null,
    rating: 4.8,
    tags: ["romance", "gothic", "classic"]
  },
  {
    id: 18,
    title: "Wuthering Heights",
    author: "Emily Brontë",
    year: 1847,
    category: "Gothic Romance",
    pages: 342,
    color: "#3A3A2A",
    description: "A savage love story set on the wild Yorkshire moors that spans two generations of obsession.",
    longDescription: "Emily Brontë's only novel remains one of the strangest and most powerful in English. The love between Heathcliff — a foundling of unknown origin — and Catherine Earnshaw is not romantic in any conventional sense: it is consuming, destructive, and survives death itself. The novel is told through nested narratives, spanning two generations, with a violence and a psychological intensity that shocked Victorian readers. Set against the brutal beauty of the Yorkshire moors, it is utterly unlike anything before or since.",
    gutenbergId: 768,
    coverUrl: null,
    rating: 4.6,
    tags: ["romance", "gothic", "tragedy"]
  },
  {
    id: 19,
    title: "The Call of the Wild",
    author: "Jack London",
    year: 1903,
    category: "Adventure",
    pages: 172,
    color: "#5C4A1A",
    description: "A domestic dog stolen from his California home is thrust into the brutal Yukon wilderness.",
    longDescription: "Jack London's most enduring novel follows Buck — a large, comfortable dog from a Californian estate — who is stolen and sold into service as a sled dog in the Klondike Gold Rush. Brutally initiated into the law of club and fang, Buck must shed every domestic instinct to survive. London's narrative is a primal, muscular story of adaptation and the call of the ancestral wild — told entirely from a dog's perspective with remarkable psychological conviction.",
    gutenbergId: 215,
    coverUrl: null,
    rating: 4.7,
    tags: ["adventure", "nature", "animals"]
  },
  {
    id: 20,
    title: "Treasure Island",
    author: "Robert Louis Stevenson",
    year: 1883,
    category: "Adventure",
    pages: 311,
    color: "#2A5C3A",
    description: "Young Jim Hawkins sails for buried pirate treasure and discovers that villainy has a human face.",
    longDescription: "The original pirate adventure and the source of almost every pirate trope that followed — treasure maps marked with an X, one-legged sailors, parrots, buried gold. But Treasure Island is far more than its clichés. Long John Silver is one of the great characters in adventure fiction: charming, intelligent, duplicitous, and genuinely menacing. Stevenson's prose crackles with energy and his young narrator Jim Hawkins is one of the most believable boys in Victorian literature.",
    gutenbergId: 120,
    coverUrl: null,
    rating: 4.6,
    tags: ["adventure", "pirates", "classic"]
  }
];
```

Per il testo dei libri usa l'API pubblica di Project Gutenberg:
```
https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt
```
Carica il testo lazily solo quando l'utente apre il reader, con fetch + AbortController.

> **COMMIT:** `git commit -m "feat: books dataset – 20 classic titles from Project Gutenberg"`

---

## Sezione 3 — Tema globale e App shell

In `src/App.tsx` imposta il layout base:
- Background globale: `#0A0A0F`
- Font family: `'Playfair Display'` per titoli, `'Inter'` per corpo
- Colore testo base: `#E8E0D0`
- Colore accent oro: `#C9A96E`

Il componente `App` deve rendere:
1. Un wrapper `div` fullscreen (h-screen, w-screen, overflow-hidden, bg-[#0A0A0F])
2. `<BookCarousel />` che occupa tutta la viewport come layer base
3. `<PreviewPanel />` posizionato in `absolute top-0 right-0 w-[45%] h-[50%]`
4. `<BookModal />` (renderizzato solo se un libro è aperto, gestito con stato)

Usa `useState<Book | null>` per tracciare `selectedBook` (quello in focus nel carousel) e `openBook` (quello aperto nella modale).

> **COMMIT:** `git commit -m "feat: App shell – layout, theme, global state structure"`

---

## Sezione 4 — Generazione procedurale delle copertine

Crea `src/utils/generateCover.ts`:

```typescript
export function generateCoverTexture(book: Book): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  // Gradiente di sfondo usando il colore principale del libro
  const gradient = ctx.createLinearGradient(0, 0, 512, 768);
  gradient.addColorStop(0, lightenColor(book.color, 30));
  gradient.addColorStop(1, darkenColor(book.color, 20));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 768);

  // Decorazione geometrica (bordo, pattern, linee ornamentali)
  // ...implementa pattern decorativi SVG-style con ctx

  // Titolo in Playfair Display bold, bianco/oro, centrato
  ctx.fillStyle = '#E8E0D0';
  ctx.font = 'bold 48px "Playfair Display", serif';
  ctx.textAlign = 'center';
  // wrap del testo su più righe se lungo

  // Autore in Inter, più piccolo, sotto il titolo
  ctx.fillStyle = '#C9A96E';
  ctx.font = '28px "Inter", sans-serif';

  return canvas;
}
```

Includi le funzioni helper `lightenColor` e `darkenColor` che manipolano hex color.

> **COMMIT:** `git commit -m "feat: procedural cover texture generator"`

---

## Sezione 5 — Carousel 3D diagonale

Implementa `src/components/BookCarousel/BookCarousel.tsx`:

**Canvas Three.js:**
- Usa `<Canvas>` di `@react-three/fiber` con `dpr={[1, 2]}` e `performance={{ min: 0.5 }}`
- Il canvas è fullscreen (`position: fixed, inset: 0`)
- Camera: `PerspectiveCamera` con `fov=60`, `position=[0, 0, 10]`

**Disposizione diagonale:**
- I libri sono disposti lungo la diagonale della viewport
- Angolo: `Math.atan2(window.innerHeight, window.innerWidth)`
- La parte **superiore** (dorso) di ogni libro tocca la linea diagonale
- I libri sono ruotati in world space per seguire l'angolo della diagonale
- Distanza tra i libri lungo la diagonale: costante (es. 2.5 unità Three.js)

**Scroll fluido:**
Implementa `src/components/BookCarousel/useCarouselScroll.ts`:
```typescript
// scrollTarget: aggiornato da wheel/touch events
// scrollCurrent: lerp(scrollCurrent, scrollTarget, 0.08) ogni frame
// usato per traslare i libri lungo la diagonale
```

**Effetto focus:**
- Il libro "in focus" (quello più vicino al centro schermo) viene determinato ogni frame
- Viene animato con scale 1.2 e traslazione verso la camera (z + 0.5) con spring

**Illuminazione:**
```jsx
<ambientLight intensity={0.6} />
<directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
<pointLight position={[-3, 5, 3]} intensity={0.8} color="#C9A96E" />
```

> **COMMIT:** `git commit -m "feat: diagonal 3D book carousel with smooth scroll"`

---

## Sezione 6 — Componente libro 3D

Implementa `src/components/BookCarousel/Book3D.tsx`:

Ogni libro è un gruppo Three.js composto da:
- **Copertina frontale**: `BoxGeometry(1.5, 2.2, 0.15)` con `CanvasTexture` generata da `generateCoverTexture`
- **Dorso**: faccia laterale sinistra del box, testo verticale (titolo + autore)
- **Pagine**: faccia laterale destra con texture paginata chiara
- **Effetto hover**: al mouse over, rotazione leggera verso la camera (Y +15°) con `useSpring`
- **Click**: emette evento `onSelect(book)` che aggiorna lo stato in App

Usa `useTexture` di `@react-three/drei` se carichi texture esterne, altrimenti `CanvasTexture` per quelle generate.

> **COMMIT:** `git commit -m "feat: Book3D mesh with procedural cover and hover effect"`

---

## Sezione 7 — Preview Panel

Implementa `src/components/PreviewPanel/PreviewPanel.tsx`:

**Stile:**
- Posizione: `absolute top-0 right-0`
- Dimensioni: `w-[45%] h-[55%]`
- Sfondo: `backdrop-blur-md bg-black/40 border border-white/10`
- Padding: `p-8`
- Bordo-radius angolo basso-sinistra: `rounded-bl-3xl`

**Contenuto** (basato su `selectedBook`):
- Badge categoria con colore del libro
- Titolo in Playfair Display 32px
- Autore e anno in Inter, colore `#C9A96E`
- 5 stelle rating (piene/vuote/mezze)
- Tags come chip/badge
- Descrizione breve (max 3 righe con `line-clamp-3`)
- Numero di pagine
- Pulsante "Open Book" con hover glow oro

**Animazione:**
Usa `AnimatePresence` e `motion.div` di framer-motion:
- Quando cambia `selectedBook`: fade out del vecchio + slide-in dal basso del nuovo
- Durata: 300ms, easing: `easeOut`

> **COMMIT:** `git commit -m "feat: PreviewPanel with AnimatePresence transitions"`

---

## Sezione 8 — Modale dettaglio libro

Implementa `src/components/BookModal/BookModal.tsx`:

**Overlay:**
- Fullscreen fixed
- `backdrop-blur-xl bg-black/75`
- Click outside → chiudi
- ESC → chiudi

**Layout interno** (max-w-5xl, centrato):
- **Colonna sinistra (40%)**: copertina grande (dalla stessa texture procedurale, renderizzata come `<img>` con canvas.toDataURL), rating visivo, info tecniche (pagine, anno, lingua, licenza "Public Domain")
- **Colonna destra (60%)**: titolo, autore, categoria, tags, sinossi lunga (`longDescription`), link esterno a Project Gutenberg, pulsante prominente "Sfoglia il libro →"

**Animazione apertura:**
- `scale: 0.85 → 1` + `opacity: 0 → 1`
- Durata 350ms, spring stiffness 300

> **COMMIT:** `git commit -m "feat: BookModal with full details and open animation"`

---

## Sezione 9 — Book Reader (Sfoglia)

Implementa `src/components/BookModal/BookReader/BookReader.tsx`:

**Canvas fullscreen** che mostra il libro aperto in 3D:

**Struttura geometrica:**
- Il libro aperto ha due metà: pagina sinistra e pagina destra
- Ogni pagina: `PlaneGeometry(3, 4)` con materiale `MeshStandardMaterial`
- Le due pagine sono unite al centro (costola visibile come `BoxGeometry(0.1, 4, 0.3)`)
- La copertina è gestita come prima/ultima pagina

**Texture pagine:**
Crea `src/components/BookModal/BookReader/PageMesh.tsx`:
- Ogni pagina ha testo reale del libro renderizzato su `CanvasTexture` (512×768)
- Font: Inter 16px, colore `#1A1A1A`, sfondo `#F5F0E8` (carta)
- Header di pagina: numero pagina + titolo libro
- Testo del libro caricato da Gutenberg (paginato a ~300 parole per pagina)

**Animazione flip pagina:**
Implementa `src/components/BookModal/BookReader/usePageFlip.ts`:
- Flip con rotazione attorno all'asse Y locale da `0` a `-Math.PI`
- Durante il flip: suddividi la pagina in **10 segmenti verticali** e applica deformazione sinusoidale `Math.sin(progress * Math.PI) * curvature` per simulare la flessione della carta
- Ombra dinamica: il materiale diventa più scuro (multiply factor 0.4) nel punto di massima curvatura
- Durata: 600ms, easing `cubic-bezier(0.25, 0.1, 0.25, 1)`

**Controlli:**
- Drag mouse sulla pagina destra → flip avanti
- Drag mouse sulla pagina sinistra → flip indietro
- Touch swipe per mobile
- Frecce HTML `←` `→` ai lati (stile `absolute left-4` / `absolute right-4`, centrate verticalmente)
- Indicatore pagina in basso: `"12 / 248"` in stile elegante
- Pulsante × in alto destra

**Illuminazione reader:**
```jsx
<ambientLight intensity={0.5} />
<directionalLight position={[-3, 5, 3]} intensity={1.0} castShadow />
<pointLight position={[0, 3, 4]} intensity={1.2} color="#FFF8E7" />
```

> **COMMIT:** `git commit -m "feat: BookReader 3D with page flip animation and Gutenberg text"`

---

## Sezione 10 — Rifinitura, responsività e accessibilità

**Responsive:**
- Su viewport < 768px: il PreviewPanel va sotto il carousel (`flex-col`, occupa `h-[40%]` della viewport dal basso)
- I libri nel carousel si ridimensionano proporzionalmente

**Accessibilità:**
- Tutti i pulsanti interattivi hanno `aria-label`
- Il BookReader ha `role="document"` e supporto navigazione tastiera (← → per pagine, ESC per chiudere)
- Focus trap nella modale aperta

**Performance:**
- Usa `React.memo` per `Book3D`
- Usa `useMemo` per il calcolo delle posizioni dei libri nel carousel
- Implementa lazy loading del testo Gutenberg (solo quando il reader si apre)
- Usa `AbortController` per cancellare il fetch del testo se il reader viene chiuso prima del completamento

**Polishing visivo:**
- Cursore custom: `cursor: pointer` con icona libro su hover dei libri 3D
- Transizione colore sfondo del PreviewPanel che segue il colore del libro selezionato (blend sottile)
- Particelle/polvere animate opzionali sullo sfondo (usa `Points` di Three.js con bassa densità)

> **COMMIT:** `git commit -m "feat: responsive layout, accessibility, performance optimizations"`

---

## Sezione 11 — Commit finale

Verifica che `npm start` funzioni senza errori.
Controlla che tutti e 20 i libri siano navigabili nel carousel.
Testa l'apertura della modale, i dettagli e la modalità sfoglia su almeno 3 libri.

```bash
git add .
git commit -m "chore: final polish and production-ready build"
```

---

## Note tecniche finali

- Usa sempre **TypeScript strict mode**
- Non usare `any` — definisci tutti i tipi in `src/types/index.ts`
- I `useEffect` con Three.js devono sempre fare cleanup (`return () => { ... }`)
- Il fetch da Gutenberg fallisce spesso per CORS — in quel caso usa il proxy: `https://cors-anywhere.herokuapp.com/https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt` oppure mostra testo segnaposto formattato realisticamente
- Se Three.js mostra warning su disposal, assicurati di chiamare `.dispose()` su geometrie e materiali quando i componenti vengono smontati
