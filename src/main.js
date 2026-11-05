import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/inter";
import "./base.css";
import "./hlp.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CYCLE, INTERESTS, PARTNERS, TEAM } from "./data.js";
import { PUBLICATIONS } from "./publications.js";

gsap.registerPlugin(ScrollTrigger);
// ?test: animazioni a tempo reale anche a pochi fotogrammi al secondo (verifiche automatiche)
if (new URLSearchParams(location.search).has("test")) gsap.ticker.lagSmoothing(0);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrowMq = window.matchMedia("(max-width: 880px)");
const isNarrow = () => narrowMq.matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

$("#year").textContent = new Date().getFullYear();

// ── Contenuti generati dai dati ──────────────────────────────────────────
const STEP_COLORS = ["#7ce0bf", "#e9dfc9", "#8fd8ff", "#f2a28f"];
$("#steps").innerHTML = CYCLE.map((s, i) => `
  <article class="step" style="--c:${STEP_COLORS[i]}" aria-labelledby="step-${s.key}">
    <p class="step-num">0${i + 1} · ${["Biochimica e sensoristica", "Biologia dell’invecchiamento", "Supercalcolo e AI", "Nanomedicina e riabilitazione"][i]}</p>
    <h3 class="step-verb" id="step-${s.key}">${s.verb}</h3>
    <p class="step-title">${esc(s.title)}</p>
    <ul class="step-points">${s.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
  </article>`).join("");

$("#interests").innerHTML = INTERESTS.map((t, i) => `
  <li data-reveal><span class="ik">${String(i + 1).padStart(2, "0")}</span><p>${esc(t)}</p></li>`).join("");

const initials = (name) => name.split(" ").map((w) => w[0]).join("");
const pubCount = (short) => PUBLICATIONS.filter((p) => p.authors.includes(short)).length;
const personCard = (p, lead = false) => {
  const n = pubCount(p.short);
  const tag = n ? "button" : "div";
  const attrs = n ? `type="button" data-author="${esc(p.short)}" aria-label="Mostra le pubblicazioni di ${esc(p.name)}"` : "";
  return `<${tag} class="person${lead ? " person-lead" : ""}" ${attrs} data-reveal>
    <span class="avatar" aria-hidden="true">${initials(p.name)}</span>
    <span><b>${lead ? `${p.title} ` : ""}${esc(p.name)}</b>${lead ? `<small>${esc(p.role)}</small>` : ""}</span>
    ${n ? `<span class="pc">${n} ${n === 1 ? "pubblicazione" : "pubblicazioni"} →</span>` : ""}
  </${tag}>`;
};
$("#team-grid").innerHTML = personCard(TEAM.lead, true) + TEAM.staff.map((p) => personCard(p)).join("");

// pubblicazioni: filtro per autore, prime 8 e poi tutte
const AUTHORS = [TEAM.lead, ...TEAM.staff].filter((p) => pubCount(p.short));
let author = null, expanded = false;
const filters = $("#pub-filters");
filters.innerHTML = [`<button class="chip" type="button" data-a="" aria-pressed="true">Tutte <span>${PUBLICATIONS.length}</span></button>`]
  .concat(AUTHORS.map((p) => `<button class="chip" type="button" data-a="${esc(p.short)}" aria-pressed="false">${esc(p.name)} <span>${pubCount(p.short)}</span></button>`))
  .join("");
const teamShorts = [TEAM.lead, ...TEAM.staff].map((p) => p.short);
const markTeam = (s) => teamShorts.reduce((acc, n) => acc.replaceAll(esc(n), `<mark>${esc(n)}</mark>`), esc(s));
const MESE = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function renderPubs(animate = true) {
  const list = PUBLICATIONS.filter((p) => !author || p.authors.includes(author));
  const shown = expanded || author ? list : list.slice(0, 8);
  $("#pub-list").innerHTML = shown.map((p) => `
    <li class="pub">
      <div class="pub-date"><b>${p.year}</b>${MESE[(p.key % 100) - 1]}</div>
      <div>
        <h3>${esc(p.title)}</h3>
        <p class="journal">${esc(p.journal)}</p>
        <p class="authors">${markTeam(p.authors)}</p>
      </div>
      <div class="pub-side">
        <span class="pub-kind">${esc(p.kind)}</span>
        ${p.doi ? `<a class="pub-link" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener" aria-label="Apri l’articolo: ${esc(p.title)}">Leggi <span aria-hidden="true">↗</span></a>` : ""}
      </div>
    </li>`).join("");
  const more = $("#pub-more");
  more.parentElement.hidden = !!author || list.length <= 8;
  more.textContent = expanded ? "Mostra meno" : `Mostra tutte (${list.length})`;
  for (const c of $$(".chip", filters)) c.setAttribute("aria-pressed", String((c.dataset.a || null) === author));
  for (const c of $$(".person[data-author]")) c.classList.toggle("active", c.dataset.author === author);
  if (animate && !reduced) gsap.from($$(".pub", $("#pub-list")), { y: 18, opacity: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" });
  ScrollTrigger.refresh();
}
filters.addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  author = b.dataset.a || null;
  renderPubs();
});
$("#pub-more").addEventListener("click", () => {
  expanded = !expanded;
  renderPubs(expanded);
  if (!expanded) $("#pubblicazioni").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
});
$("#team-grid").addEventListener("click", (e) => {
  const b = e.target.closest(".person[data-author]");
  if (!b) return;
  author = b.dataset.author;
  renderPubs();
  $("#pubblicazioni").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
});
renderPubs(false);

// collaborazioni: due file di loghi che scorrono in versi opposti
// zoom: alcuni file sono quadrati con il logo piccolo al centro
const tile = (p) => `<div class="logo-tile${p.dark ? " dark" : ""}"><img src="/partners/${p.file}" alt="" loading="lazy" decoding="async"${p.zoom ? ` style="--z:${p.zoom}"` : ""} /></div>`;
const half = Math.ceil(PARTNERS.length / 2);
const rows = [PARTNERS.slice(0, half), PARTNERS.slice(half)];
$("#logo-rows").innerHTML = rows.map((r, i) => {
  const items = r.map(tile).join("");
  // la fila è ripetuta più volte perché il nastro non mostri mai un vuoto
  return `<div class="logo-track${i ? " rev" : ""}" aria-hidden="true">${items.repeat(4)}</div>`;
}).join("");
$("#partner-names").innerHTML = PARTNERS.filter((p) => !p.name.startsWith("Partner")).map((p) => `<li>${esc(p.name)}</li>`).join("");

// ── Navigazione ──────────────────────────────────────────────────────────
const nav = $("#nav");
const toggle = $("#nav-toggle");
const mmenu = $("#mmenu");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
// menu per telefono: pannello a schermo intero, la pagina sotto non scorre
function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  mmenu.classList.toggle("open", open);
  mmenu.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
  if (open && !reduced) {
    gsap.fromTo($$(".mmenu-links a, .mmenu-foot", mmenu), { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.1, overwrite: true });
  }
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
for (const a of $$("a", mmenu)) a.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mmenu.classList.contains("open")) setMenu(false); });
narrowMq.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });
gsap.to("#progress-fill", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

// titolo e testi "che si accendono": parole separate
for (const el of $$(".hero-title .split")) {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");
}
for (const el of $$("[data-scrub]")) {
  el.setAttribute("aria-label", el.textContent.trim());
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
}

// ── Inquadrature della scena per ogni momento ────────────────────────────
// w: pesi delle forme 1..4 (corpo, elica, reticolo, vasi); 0 = nanoparticella
const ONE = (i) => ({ w1: +(i === 1), w2: +(i === 2), w3: +(i === 3), w4: +(i === 4) });
const SCENES = {
  hero:        () => ({ shape: 0, colors: ["#8fd8ff", "#e9dfc9"], dist: isNarrow() ? 1.0 : 1.02, ty: isNarrow() ? -0.42 : 0, sx: isNarrow() ? 0 : 0.18, halo: 1, spin: 1 }),
  manifesto:   () => ({ shape: 0, colors: ["#8fd8ff", "#7ce0bf"], dist: isNarrow() ? 0.62 : 0.55, ty: 0, sx: 0, halo: 0, spin: 0.6 }),
  misurare:    () => ({ shape: 1, colors: ["#7ce0bf", "#8fd8ff"], dist: isNarrow() ? 1.0 : 1.04, ty: isNarrow() ? -0.38 : 0, sx: isNarrow() ? 0 : 0.17, halo: 0, spin: 1 }),
  capire:      () => ({ shape: 2, colors: ["#e9dfc9", "#7ce0bf"], dist: isNarrow() ? 1.05 : 0.95, ty: isNarrow() ? -0.38 : 0, sx: isNarrow() ? 0 : 0.17, halo: 0, spin: 1.6 }),
  integrare:   () => ({ shape: 3, colors: ["#5aa7c9", "#c4ecff"], dist: isNarrow() ? 1.05 : 1.0, ty: isNarrow() ? -0.38 : 0, sx: isNarrow() ? 0 : 0.17, halo: 0, spin: 0.8 }),
  intervenire: () => ({ shape: 4, colors: ["#f2a28f", "#8fd8ff"], dist: isNarrow() ? 1.05 : 0.98, ty: isNarrow() ? -0.38 : 0, sx: isNarrow() ? 0 : 0.17, halo: 0, spin: 0.9 }),
};
const STEP_SCENES = ["misurare", "capire", "integrare", "intervenire"];

let world = null, current = "hero", shapeNow = 0;
function go(name, duration = 1.8) {
  current = name;
  if (!world) return;
  const { shape, colors, ...num } = SCENES[name]();
  const d = reduced ? 0 : duration;
  const s = world.state;
  gsap.to(s, { ...ONE(shape), ...num, duration: d, ease: "power3.inOut", overwrite: "auto" });
  if (shape !== shapeNow && !reduced) {
    // la materia si scioglie in un vortice e si ricompone
    gsap.timeline({ overwrite: "auto" })
      .to(s, { chaos: 1, duration: d * 0.45, ease: "power2.out" })
      .to(s, { chaos: 0, duration: d * 0.75, ease: "power2.inOut" });
  }
  shapeNow = shape;
  for (const [k, hex] of [["a", colors[0]], ["b", colors[1]]]) {
    const c = new world.Color(hex);
    gsap.to(world.colors[k], { r: c.r, g: c.g, b: c.b, duration: d, ease: "power2.inOut" });
  }
}
narrowMq.addEventListener("change", () => go(current, 0.6));

// ── Avvio ────────────────────────────────────────────────────────────────
const loader = $("#loader");
const fill = $("#loader-fill");
document.body.classList.add("loading");
const started = performance.now();

function finishLoader() {
  const wait = Math.max(0, 1100 - (performance.now() - started));
  return new Promise((r) => setTimeout(() => {
    loader.classList.add("done");
    document.body.classList.remove("loading");
    r();
  }, wait));
}

function intro() {
  const sc = SCENES.hero();
  if (world) {
    const { shape, colors, ...num } = sc;
    Object.assign(world.state, { ty: num.ty, sx: num.sx });
  }
  if (reduced) {
    if (world) Object.assign(world.state, { assemble: 1, dist: sc.dist, halo: 1 });
    gsap.set(".hud-chip", { opacity: 1 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (world) {
    tl.to(world.state, { assemble: 1, duration: 3.6, ease: "power2.out" }, 0)
      .to(world.state, { dist: sc.dist, duration: 4.6 }, 0);
  }
  tl.from(".hero-title .word", { yPercent: 115, opacity: 0, duration: 1.3, stagger: 0.09, ease: "power4.out" }, 0.4)
    .from(".hero-in", { y: 26, opacity: 0, duration: 1.1, stagger: 0.12 }, 1.0)
    .from(".nav", { y: -30, opacity: 0, duration: 1 }, 1.2)
    .to(".hud-chip", { opacity: 1, duration: 0.9, stagger: 0.3 }, 3.0);
}

async function boot() {
  try {
    const [{ createScene }, THREE] = await Promise.all([import("./scene.js"), import("three")]);
    const scene = createScene({
      canvas: $("#scene-canvas"), mobile: isNarrow(), reduced,
      onProgress: (p) => { fill.style.width = `${Math.round(p * 100)}%`; },
    });
    world = { ...scene, Color: THREE.Color };
    await scene.loaded;
    fill.style.width = "100%";
  } catch (err) {
    // senza WebGL la pagina resta pienamente leggibile
    console.warn("Scena 3D non disponibile:", err);
    world = null;
    $("#stage").style.display = "none";
  }
  await finishLoader();
  intro();
  setupScroll();
}

// ── Scroll ───────────────────────────────────────────────────────────────
function setupScroll() {
  if (!reduced) {
    gsap.to([".hero-copy", ".hud", ".scroll-cue"], {
      opacity: 0, y: -80, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: true },
    });
  }
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom center", onEnterBack: () => go("hero") });

  // manifesto: la camera entra nella nanoparticella, le parole si accendono
  ScrollTrigger.create({
    trigger: ".manifesto", start: "top 60%", end: "bottom 40%",
    onEnter: () => go("manifesto", 2.2), onEnterBack: () => go("manifesto", 1.6),
  });
  for (const el of $$("[data-scrub]")) {
    const words = $$(".w", el);
    if (reduced) { gsap.set(words, { opacity: 1 }); continue; }
    gsap.to(words, {
      opacity: 1, stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 62%", scrub: 0.6 },
    });
  }

  // i quattro passi del ciclo
  const nodes = $$(".cy-node");
  const arc = $("#cy-arc");
  $$(".step").forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: "top center", end: "bottom center",
      onToggle: (self) => {
        step.classList.toggle("active", self.isActive);
        if (!self.isActive) return;
        go(STEP_SCENES[i]);
        nodes.forEach((n, k) => { n.classList.toggle("on", k === i); n.classList.toggle("done", k < i); });
      },
    });
    if (!reduced) {
      gsap.from(step.children, {
        y: 44, opacity: 0, duration: 1.1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 70%", toggleActions: "play none none reverse" },
      });
    }
  });
  // l'arco del ciclo avanza con la lettura dei quattro passi
  ScrollTrigger.create({
    trigger: "#steps", start: "top center", end: "bottom center",
    onUpdate: (self) => { arc.style.strokeDasharray = `${Math.min(0.999, self.progress)} 1`; },
    toggleClass: { targets: document.body, className: "in-story" },
  });
  ScrollTrigger.create({ trigger: ".story-intro", start: "top center", end: "bottom center", onEnter: () => go("misurare"), onEnterBack: () => go("manifesto") });

  // la scena sfuma quando arrivano le sezioni a fondo pieno
  const stage = $("#stage");
  ScrollTrigger.create({
    trigger: "#supercalcolo", start: "top bottom", end: "top 20%", scrub: true,
    onUpdate: (self) => {
      stage.style.opacity = String(1 - self.progress);
      world?.setVisible(self.progress < 0.999);
    },
  });

  if (!reduced) {
    for (const el of $$("[data-reveal]")) {
      gsap.from(el, { y: 48, opacity: 0, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    }
    gsap.from(".logo-rows", { opacity: 0, y: 40, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".logo-rows", start: "top 90%", once: true } });
    gsap.fromTo(".mission-glow", { scale: 0.6, opacity: 0.4 }, {
      scale: 1.2, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".mission", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(".final-glow", { scale: 1.25, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "bottom bottom", scrub: true } });
  }
}

// ── Numeri che contano ───────────────────────────────────────────────────
const countIo = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    countIo.unobserve(e.target);
    const end = Number(e.target.dataset.count);
    if (reduced) continue;
    const obj = { v: 0 };
    gsap.to(obj, { v: end, duration: 1.8, delay: 1.4, ease: "power2.out", onUpdate: () => { e.target.textContent = Math.round(obj.v); } });
  }
}, { threshold: 0.6 });
$$("[data-count]").forEach((el) => countIo.observe(el));

// ── Luce che segue il puntatore ──────────────────────────────────────────
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest?.(".card, .person");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}, { passive: true });

boot();
