# Human Longevity Program · sito

Sito di presentazione dello Human Longevity Program dell'IRCCS San Raffaele (responsabile Prof. Ennio Tasciotti). L'utente fa parte dello staff del programma. Rispondere in italiano.

## Origine
- Contenuti presi da "Human Longevity Program sito.docx" e dal poster "Postre HLP.pptx" (stanno in ~/Desktop/HORIZON HEALTH/).
- Nato il 5 nov 2026 come pagina /hlp/ della landing HorAIzon, poi separato in questo progetto autonomo: dal sito HLP non si deve poter arrivare a HorAIzon. Non reintrodurre riferimenti a HorAIzon.
- Link al San Raffaele, ovunque: https://sanraffaele.it/strutture/irccs-san-raffaele/
- Sito gemello del Prof. Tasciotti: https://sito-ennio.vercel.app (progetto separato in ~/Desktop/sito-tasciotti, repo GitHub marcotempera23/SITO-ENNIO, Next.js). Unico legame tra i due siti: i link (qui `TASCIOTTI_URL` in `src/data.js`, scheda del responsabile nel team, menu mobile, footer). Il sito di Tasciotti riprende stile, scena 3D e animazioni di questo.

## Struttura
- `index.html`: sezioni (hero, manifesto, ciclo, supercalcolo, ricerca, missione, team, pubblicazioni, collaborazioni, contatti, footer) e menu mobile `#mmenu`.
- `src/main.js`: costruisce team, interessi, pubblicazioni, loghi; animazioni GSAP + ScrollTrigger; `SCENES`/`go()` cambiano la forma della scena per sezione; con `?test` nell'URL GSAP non rallenta (utile per screenshot headless).
- `src/scene.js`: Three.js r160, un'unica nuvola di particelle che si trasforma: nanoparticella → corpo (`public/avatar.glb`) → doppia elica → reticolo di calcolo → vasi.
- `src/data.js`: TEAM, INTERESTS, CYCLE, PARTNERS (`zoom` e `dark` per i loghi). `src/publications.js`: 19 pubblicazioni con DOI.
- Il logo "101100" del poster non è identificato: mostrato come "Partner del programma".

## Trappole già risolte (non reintrodurle)
- `backdrop-filter` sulla barra crea un contenitore per gli elementi `position: fixed`: per questo il menu mobile è un pannello separato (`#mmenu`) fuori dall'header.
- EffectComposer + OutputPass convertono il colore di sfondo in sRGB due volte: in scene.js il colore è decodificato una volta in più.
- Su telefono controllare sempre a 390 px di larghezza.

## Comandi
- `npm run dev` (porta 5176), `npm run build` → `dist/`, `npm run preview` (porta 5176).
- Link pubblico temporaneo: `cloudflared tunnel --no-autoupdate --url http://localhost:5176`. Non usare ngrok: il suo avviso blocca CSS/JS su Safari e nei browser delle app. L'indirizzo *.trycloudflare.com cambia a ogni avvio e muore se il Mac va in stop.
- Per un indirizzo fisso: pubblicare `dist/` su un hosting statico (Cloudflare Pages / Netlify), non ancora fatto.

## Modo di lavorare
L'utente preferisce che si proceda da soli tra un passo e l'altro e si riferisca alla fine. Verificare le modifiche con screenshot (mobile e desktop) prima di dire che sono fatte.
