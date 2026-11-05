// Contenuti dello Human Longevity Program, presi da
// "Human Longevity Program sito.docx" e dal poster "Postre HLP.pptx".

// sito personale del responsabile del programma (progetto separato)
export const TASCIOTTI_URL = "https://sito-ennio.vercel.app";

export const TEAM = {
  lead: { name: "Ennio Tasciotti", title: "Prof.", role: "Responsabile del programma", short: "E. Tasciotti" },
  staff: [
    { name: "Sabina Pulone", short: "S. Pulone" },
    { name: "Anna Baroni", short: "A. Baroni" },
    { name: "Chantalle Moulton", short: "C. Moulton" },
    { name: "Eugenia Romano", short: "E. Romano" },
    { name: "Marco Tempera", short: "M. Tempera" },
    { name: "Alessandro Nawaz", short: "A. Nawaz" },
  ],
};

export const INTERESTS = [
  "Monitoraggio dei parametri fisiologici con sensori e dispositivi indossabili",
  "Identificazione di biomarcatori nei fluidi biologici",
  "Regolazione dell’infiammazione a livello sistemico e dell’unità neurovascolare",
  "Stress ossidativo, funzione mitocondriale e traiettorie di invecchiamento",
  "Modelli predittivi basati su supercalcolo e intelligenza artificiale",
  "Nanoparticelle biomimetiche per superare le barriere biologiche",
  "Nanoformulazioni nutraceutiche e farmaceutiche",
  "Terapie e percorsi riabilitativi personalizzati contro il declino cognitivo e funzionale",
];

// Il ciclo del poster: Misurare → Capire → Integrare → Intervenire,
// attorno a "Prevenzione e riabilitazione".
export const CYCLE = [
  {
    key: "misurare", verb: "Misurare",
    title: "Biochimica e biologia molecolare. Sensoristica digitale e funzionale",
    points: [
      "Approccio multi-omico: esosomi e biomarcatori circolanti",
      "Monitoraggio continuo dei parametri fisiologici con wearable e sensori",
      "I biomarcatori funzionali tradotti in dati digitali integrabili e interrogabili",
    ],
  },
  {
    key: "capire", verb: "Capire",
    title: "Biochimica e biologia dell’invecchiamento. Target molecolari e funzionali attuabili",
    points: [
      "Il ruolo di infiammazione, stress ossidativo e funzione mitocondriale",
      "Modelli di popolazione cellulare per simulare le traiettorie di invecchiamento",
      "Parametri rilevanti per monitorare e predire l’esito del percorso riabilitativo",
    ],
  },
  {
    key: "integrare", verb: "Integrare",
    title: "Centro di Supercalcolo. Piattaforma predittiva AI",
    points: [
      "Integrazione dei dati multi-omici per individuare bersagli e biomarcatori",
      "Gemelli digitali che simulano le traiettorie e la risposta agli interventi",
      "Modelli di intelligenza artificiale che predicono l’esito e guidano la riabilitazione",
    ],
  },
  {
    key: "intervenire", verb: "Intervenire",
    title: "Nanoparticelle e microformulazioni. Ottimizzazione del percorso riabilitativo",
    points: [
      "Nanoparticelle per il rilascio controllato di principi attivi ai tessuti bersaglio",
      "Formulazioni e tempi di intervento personalizzati sulla traiettoria di ogni paziente",
      "Un percorso riabilitativo che si adatta nel tempo sulla base di parametri predittivi",
    ],
  },
];

// Collaborazioni nazionali e internazionali (loghi del poster)
export const PARTNERS = [
  { name: "Sapienza Università di Roma", file: "sapienza.png", zoom: 2.3 },
  { name: "Università degli Studi di Napoli Federico II", file: "federico-ii.png" },
  { name: "Università degli Studi di Milano-Bicocca", file: "bicocca.png" },
  { name: "Università degli Studi della Tuscia", file: "tuscia.png" },
  { name: "Università degli Studi della Campania Luigi Vanvitelli", file: "vanvitelli.jpg" },
  { name: "Universität Münster", file: "munster.png" },
  { name: "American University of Madaba", file: "madaba.jpg" },
  { name: "Fondazione Policlinico Universitario Agostino Gemelli IRCCS", file: "gemelli.png" },
  { name: "CEINGE Biotecnologie Avanzate", file: "ceinge.jpg" },
  { name: "LILT · Lega Italiana per la Lotta contro i Tumori", file: "lilt.jpg" },
  { name: "MedOr Italian Foundation", file: "medor.png" },
  { name: "Khymeia", file: "khymeia.png" },
  { name: "Cube Labs", file: "cube-labs.png", zoom: 2.6 },
  { name: "Plastic Free", file: "plastic-free.jpg", dark: true },
  { name: "Partner del programma", file: "partner-101100.jpg", zoom: 1.0 },
];
