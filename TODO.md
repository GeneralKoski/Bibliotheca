# TODO — Bibliotheca

Possibili aggiunte e migliorie. Filtrato verificando cosa esiste già nel codice.

---

## Reader — estensioni

- [x] **Salva progresso lettura** in localStorage per `gutenbergId`, ripartire dall'ultima pagina aperta.
- [x] **Bookmark multipli per libro** con etichetta opzionale, mostrati in una sidebar del reader.
- [x] **Ricerca testo dentro il libro** (Cmd/Ctrl+F custom): match nelle pagine con jump diretto.
- [x] **Indice capitoli**: parsing dell'header Gutenberg per estrarre capitoli e mostrarli in un menu navigabile.
- [x] **Note / highlight per pagina** salvate in localStorage, esportabili in markdown.
- [x] **Stima tempo di lettura rimanente** in base a parole/min impostabile.
- [x] **Theme reader**: alternative al fondo crema attuale (sepia, dark, alto contrasto), font size e font family configurabili.
- [x] **Cache offline**: salvare i testi Gutenberg già scaricati in IndexedDB per riapertura senza rete.

## Libreria personale

- [x] **Stato libro**: *letto / in lettura / wishlist* con badge sul carosello e filtro dedicato (persistenza localStorage).
- [x] **Rating personale** distinto da quello dei dati statici.
- [x] **Citazioni preferite** salvate dalla vista reader con back-link alla pagina.
- [x] **Sort esplicito**: anno, autore, rating, ultimo aperto (oggi solo filtro categoria + search).

## UX / Design

- [ ] **Mobile**: il carosello angolato non funziona bene su touch < 768px — variante swipe-card verticale.
- [x] **Search/filter bar mobile**: oggi `SearchFilter` è `hidden md:flex`, su mobile non c'è modo di cercare.
- [ ] **Vista alternativa "griglia"**: toggle tra carosello 3D e griglia 2D (utile per scansione veloce e mobile).
- [ ] **Onboarding hint** al primo caricamento ("scroll · drag · ← →" è in alto a destra ma poco visibile).
- [ ] **Light/sepia mode** globale come alternativa al mood scuro attuale.
- [ ] **Hover sui libri**: al momento il focus è solo sul libro centrato, aggiungere hover-tilt sui laterali.
- [ ] **Transizione modal più cinematica**: shared layout Framer Motion che fa "uscire" il libro dallo scaffale invece dello scale-in.
- [ ] **Suono opzionale** di pagina che si gira nel reader (toggle on/off).

## Performance

- [ ] **Audit FPS** del carosello su laptop integrati e mobile mid-range.
- [ ] **Lazy loading copertine OpenLibrary**: pre-caricare solo i libri visibili + N adiacenti, non tutti.
- [ ] **Compressione/ridimensionamento copertine procedurali**: `generateCoverTexture` viene chiamata in più punti (carousel, modal) — memoizzare globalmente.
- [ ] **Code splitting**: `BookReader` + R3F del reader caricati on-demand quando si apre il modal (oggi importati eagermente).
- [ ] **Bundle size**: misurare e tree-shaking aggressivo su Three.js.

## Tecnico

- [ ] **Error boundary** per crash WebGL (alcuni device disabilitano WebGL → app bianca).
- [ ] **Test**: smoke test con Vitest su `useBooks`, filtri, `usePageFlip`.
- [ ] **CI**: GitHub Action con lint + build + type-check su PR.
- [ ] **Deploy**: pipeline Vercel/Netlify con preview deploy per branch.
- [ ] **Analytics minimal** (Plausible/Umami) per capire cosa viene aperto davvero.
- [ ] **A11y pass**: il carosello 3D non è navigabile da tastiera/screen reader — alternativa lista accessibile dietro skip-link.
- [ ] **SEO**: meta tag, OG image dinamica con la copertina del libro corrente, sitemap.
- [ ] **Deep-link** a libro specifico (`?book=slug` o `#book/slug`) per condivisione e refresh-safe.

## Contenuti / framing

- [ ] **README serio**: cosa è, perché esiste, screenshot, link demo, stack, scelte di design (oggi è il README default Vite/CRA).
- [ ] **Case study sul portfolio**: 1 paragrafo + 3-4 screenshot + clip 10s del reader in azione.
- [ ] **Crediti**: Project Gutenberg, OpenLibrary covers, font, librerie, ispirazioni di design.
- [ ] **About / colophon page** dentro l'app stessa.

## Idee più ambiziose (opzionali)

- [ ] **Modalità "stanza 3D"**: stanza navigabile con scaffali invece del carosello, stesso dataset.
- [ ] **AI suggestion**: "consigliami un libro in base al mio mood" con Claude API + lista libri come contesto.
- [ ] **Backend Laravel + auth**: ogni utente la sua libreria (allineato al tuo stack principale, buon portfolio piece full-stack).
- [ ] **Statistiche di lettura** stile Spotify Wrapped (libri completati, tempo, generi).
- [ ] **Import da Goodreads CSV** per popolare la libreria personale.
