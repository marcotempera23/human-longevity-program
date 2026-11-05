# Human Longevity Program · sito

Sito del programma Human Longevity dell'IRCCS San Raffaele. Pagina unica, statica.

## Comandi

    npm install        # la prima volta
    npm run dev        # sviluppo, http://localhost:5176
    npm run build      # crea la cartella dist/ (è il sito da pubblicare)
    npm run preview    # serve dist/ su http://localhost:5176

## Dove sono i contenuti

- `index.html`: testi delle sezioni
- `src/data.js`: team, interessi di ricerca, ciclo Misurare/Capire/Integrare/Intervenire, collaborazioni
- `src/publications.js`: pubblicazioni
- `src/scene.js`: scena 3D a particelle
- `src/hlp.css`, `src/base.css`: stile
- `public/`: loghi, favicon, modello 3D del corpo (`avatar.glb`)

## Mostrarlo da fuori (link temporaneo)

    npm run build && npm run preview
    cloudflared tunnel --no-autoupdate --url http://localhost:5176

Il link *.trycloudflare.com cambia a ogni avvio. Per un indirizzo fisso, pubblicare `dist/` su un hosting statico (Netlify, Vercel, Cloudflare Pages).
