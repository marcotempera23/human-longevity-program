import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Scena dello Human Longevity Program: una sola nuvola di particelle che,
// mentre si scorre, si ricompone nelle cinque immagini del programma:
//
//   0  nanoparticella biomimetica (apertura)
//   1  corpo umano                (Misurare)
//   2  doppia elica               (Capire)
//   3  reticolo di calcolo        (Integrare)
//   4  vasi e nanoparticelle      (Intervenire)
//
// Ogni particella conosce la propria posizione in tutte e cinque le forme;
// lo shader le mescola con i pesi `state.w1..w4` (GSAP li interpola) e durante
// i passaggi aggiunge un vortice (`state.chaos`), così la trasformazione non
// è una semplice dissolvenza ma un movimento fisico della materia.

const N_SHAPES = 5;

const VERT = /* glsl */ `
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aFrom;
  attribute vec3 aRand;          // x: ritardo/colore, y: dimensione, z: fase
  uniform vec4 uW;               // pesi delle forme 1..4 (la forma 0 prende il resto)
  uniform float uAssemble;
  uniform float uChaos;
  uniform float uTime;
  uniform float uPixel;
  varying float vMix;
  varying float vAlpha;
  varying float vGlow;
  void main() {
    float w0 = clamp(1.0 - uW.x - uW.y - uW.z - uW.w, 0.0, 1.0);
    vec3 pos = position * w0 + aS1 * uW.x + aS2 * uW.y + aS3 * uW.z + aS4 * uW.w;

    // vortice durante i passaggi tra una forma e l'altra
    float ph = aRand.z * 6.2831;
    vec3 swirl = vec3(
      sin(ph + uTime * 0.9 + pos.y * 3.1),
      cos(ph * 1.3 + uTime * 0.7 + pos.x * 2.7),
      sin(ph * 0.7 + uTime * 0.8 + pos.z * 3.3));
    pos += swirl * uChaos * (0.18 + 0.32 * aRand.x);
    // respiro leggero a forma composta
    pos += normalize(pos + vec3(0.0001)) * sin(uTime * 1.4 + ph * 3.0) * 0.006;

    // ingresso: dalla polvere sparsa alla forma
    float p = clamp((uAssemble - aRand.x * 0.5) / 0.5, 0.0, 1.0);
    p = p < 0.5 ? 4.0 * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 3.0) / 2.0;
    pos = mix(aFrom, pos, p);

    // impulsi di dati che scorrono nel reticolo e nei vasi
    float flow = smoothstep(0.035, 0.0, abs(fract(pos.y * 0.45 - uTime * 0.22) - 0.5));
    vGlow = flow * (uW.z + uW.w * 0.8) * step(0.55, aRand.y);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.55 + aRand.y * 1.25) * (1.0 + vGlow * 0.5) * uPixel / -mv.z;
    vMix = aRand.x;
    vAlpha = mix(0.2, 1.0, p) * (0.62 + 0.38 * sin(uTime * 1.8 + ph * 5.0));
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vMix;
  varying float vAlpha;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(uColorA, uColorB, smoothstep(0.35, 1.0, vMix));
    c = mix(c, vec3(1.0), vGlow * 0.4);
    gl_FragColor = vec4(c, a * vAlpha * uOpacity * (1.0 + vGlow * 0.6));
  }
`;

// ── Forme ──────────────────────────────────────────────────────────────────
const rnd = (a = -1, b = 1) => a + Math.random() * (b - a);
const dirRandom = (v = new THREE.Vector3()) => v.randomDirection();

function shapeCell(n) {
  const out = new Float32Array(n * 3);
  const R = 0.8;
  const spikes = Array.from({ length: 150 }, () => dirRandom());
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nSurf = Math.floor(n * 0.5);
  for (let i = 0; i < n; i++) {
    let x, y, z;
    if (i < nSurf) {                               // membrana: sfera di Fibonacci
      const yy = 1 - (i / (nSurf - 1)) * 2;
      const r = Math.sqrt(1 - yy * yy);
      const t = golden * i;
      const k = R + rnd(-0.012, 0.012);
      x = Math.cos(t) * r * k; y = yy * k; z = Math.sin(t) * r * k;
    } else if (i < n * 0.66) {                     // nucleo
      const d = dirRandom();
      const k = 0.26 * Math.cbrt(Math.random());
      x = d.x * k; y = d.y * k; z = d.z * k;
    } else if (i < n * 0.88) {                     // ligandi di superficie
      const d = spikes[Math.floor(Math.random() * spikes.length)];
      const t = Math.random();
      const k = R + t * 0.16;
      const end = t > 0.86 ? 0.018 : 0.004;      // piccola testa sulla punta
      x = d.x * k + rnd(-end, end); y = d.y * k + rnd(-end, end); z = d.z * k + rnd(-end, end);
    } else {                                       // corona rada
      const d = dirRandom();
      const k = rnd(1.05, 1.5);
      x = d.x * k; y = d.y * k; z = d.z * k;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function shapeHelix(n) {
  const out = new Float32Array(n * 3);
  const turns = 2.6, rad = 0.4, rungs = 34;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let x, y, z;
    if (r < 0.58) {                                // i due filamenti
      const u = Math.random();
      const a = u * turns * Math.PI * 2 + (r < 0.29 ? 0 : Math.PI);
      y = u * 2 - 1;
      const j = 0.03;
      x = Math.cos(a) * rad + rnd(-j, j); z = Math.sin(a) * rad + rnd(-j, j); y += rnd(-j, j);
    } else if (r < 0.9) {                          // coppie di basi
      const k = Math.floor(Math.random() * rungs);
      const u = (k + 0.5) / rungs;
      const a = u * turns * Math.PI * 2;
      const t = Math.random();
      y = u * 2 - 1 + rnd(-0.006, 0.006);
      x = Math.cos(a) * rad * (1 - 2 * t); z = Math.sin(a) * rad * (1 - 2 * t);
    } else {                                       // nucleotidi liberi
      const a = Math.random() * Math.PI * 2;
      const k = rnd(0.55, 0.95);
      x = Math.cos(a) * k; z = Math.sin(a) * k; y = rnd(-1.05, 1.05);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function shapeLattice(n) {
  const out = new Float32Array(n * 3);
  const g = 5, side = 1.3, step = side / (g - 1);
  const node = (i, j, k) => [-side / 2 + i * step, -side / 2 + j * step, -side / 2 + k * step];
  for (let p = 0; p < n; p++) {
    const r = Math.random();
    const i = Math.floor(Math.random() * g), j = Math.floor(Math.random() * g), k = Math.floor(Math.random() * g);
    let [x, y, z] = node(i, j, k);
    if (r < 0.36) {                                // nodi
      const s = 0.028;
      x += rnd(-s, s); y += rnd(-s, s); z += rnd(-s, s);
    } else if (r < 0.94) {                         // connessioni lungo gli assi
      const axis = Math.floor(Math.random() * 3);
      const t = Math.random() * step;
      if (axis === 0 && i < g - 1) x += t;
      else if (axis === 1 && j < g - 1) y += t;
      else if (axis === 2 && k < g - 1) z += t;
      else { x += rnd(-0.01, 0.01); }
    } else {                                       // scintille
      x = rnd(-0.9, 0.9); y = rnd(-0.9, 0.9); z = rnd(-0.9, 0.9);
    }
    out.set([x, y, z], p * 3);
  }
  // un quarto di giro: il cubo si presenta di spigolo, più tridimensionale
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.5, 0.75, 0));
  const v = new THREE.Vector3();
  for (let p = 0; p < n; p++) {
    v.fromArray(out, p * 3).applyMatrix4(m);
    v.toArray(out, p * 3);
  }
  return out;
}

function shapeVessels(n) {
  // albero vascolare: un tronco che si ramifica, con nanoparticelle all'interno
  const segs = [];
  function grow(a, dir, len, r, depth) {
    const b = a.clone().addScaledVector(dir, len);
    segs.push({ a, b, r, len });
    if (depth === 0) return;
    const axis = new THREE.Vector3().crossVectors(dir, dirRandom()).normalize();
    for (const s of [-1, 1]) {
      const d = dir.clone().applyAxisAngle(axis, s * rnd(0.35, 0.65)).applyAxisAngle(dir, rnd(-0.6, 0.6)).normalize();
      grow(b, d, len * rnd(0.68, 0.82), r * 0.7, depth - 1);
    }
  }
  grow(new THREE.Vector3(0, -1.1, 0), new THREE.Vector3(0, 1, 0), 0.62, 0.085, 4);
  const weights = segs.map((s) => s.len * s.r);
  const total = weights.reduce((a, b) => a + b, 0);
  const pick = () => {
    let x = Math.random() * total;
    for (let i = 0; i < segs.length; i++) if ((x -= weights[i]) <= 0) return segs[i];
    return segs[segs.length - 1];
  };
  const particles = Array.from({ length: 90 }, () => {
    const s = segs[Math.floor(Math.random() * segs.length)];
    return s.a.clone().lerp(s.b, Math.random());
  });
  const out = new Float32Array(n * 3);
  const v = new THREE.Vector3(), axis = new THREE.Vector3(), ortho = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.74) {                    // pareti dei vasi
      const s = pick();
      axis.subVectors(s.b, s.a).normalize();
      ortho.crossVectors(axis, Math.abs(axis.y) < 0.9 ? THREE.Object3D.DEFAULT_UP : new THREE.Vector3(1, 0, 0)).normalize();
      v.copy(s.a).lerp(s.b, Math.random());
      ortho.applyAxisAngle(axis, Math.random() * Math.PI * 2);
      v.addScaledVector(ortho, s.r * rnd(0.92, 1.05));
    } else {                                       // nanoparticelle in circolo
      const c = particles[Math.floor(Math.random() * particles.length)];
      v.copy(dirRandom()).multiplyScalar(0.028).add(c);
    }
    v.toArray(out, i * 3);
  }
  // normalizza: altezza 2, centrato
  const box = new THREE.Box3().setFromArray(out);
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const s = 2 / Math.max(size.y, size.x * 1.1);
  for (let i = 0; i < n * 3; i += 3) {
    out[i] = (out[i] - ctr.x) * s; out[i + 1] = (out[i + 1] - ctr.y) * s; out[i + 2] = (out[i + 2] - ctr.z) * s;
  }
  return out;
}

function bodyFromModel(gltf, n) {
  const verts = [];
  const v = new THREE.Vector3();
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((c) => {
    if (!c.isMesh) return;
    const p = c.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(c.matrixWorld);
      verts.push(v.x, v.y, v.z);
    }
  });
  const all = new Float32Array(verts);
  const box = new THREE.Box3().setFromArray(all);
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const s = 2 / size.y;
  const total = all.length / 3;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * total) * 3;
    out[i * 3] = (all[k] - ctr.x) * s;
    out[i * 3 + 1] = (all[k + 1] - ctr.y) * s;
    out[i * 3 + 2] = (all[k + 2] - ctr.z) * s;
  }
  return out;
}

// ── Scena ──────────────────────────────────────────────────────────────────
export function createScene({ canvas, mobile = false, reduced = false, onProgress }) {
  const n = mobile ? 7000 : 16000;
  const state = {
    w1: 0, w2: 0, w3: 0, w4: 0,   // pesi delle forme 1..4 (corpo, elica, reticolo, vasi)
    assemble: 0,
    chaos: 0,
    dist: 1.5,         // distanza della camera (multipli dell'inquadratura)
    ty: 0,             // quota inquadrata
    sx: 0,             // spostamento laterale della figura (frazione della larghezza)
    spin: 1,           // velocità di rotazione
    halo: 1,           // anelli attorno alla nanoparticella
  };
  const colors = { a: new THREE.Color("#8fd8ff"), b: new THREE.Color("#7ce0bf") };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  // Con il post-processing (EffectComposer + OutputPass) il colore di sfondo viene
  // convertito in sRGB due volte e risulta grigio-azzurro (≈ #26353b invece di
  // #04090c). Lo si compensa decodificandolo una volta in più.
  const bg = new THREE.Color("#04090c");
  renderer.setClearColor(new THREE.Color().setRGB(bg.r, bg.g, bg.b, THREE.SRGBColorSpace), 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04090c, 0.05);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.42, 0.18);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const root = new THREE.Group();
  scene.add(root);

  // polvere di fondo
  const dust = (() => {
    const m = mobile ? 400 : 1100;
    const pos = new Float32Array(m * 3);
    for (let i = 0; i < m; i++) {
      const r = 3 + Math.random() * 10, t = Math.random() * Math.PI * 2;
      pos.set([Math.cos(t) * r, (Math.random() - 0.5) * 10, Math.sin(t) * r - 2], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fd8ff, size: 0.02, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(p);
    return p;
  })();

  // anelli orbitali attorno alla nanoparticella
  const halos = [0.0, 1.1, 2.2].map((rot, i) => {
    const curve = new THREE.EllipseCurve(0, 0, 1.18 + i * 0.12, 1.18 + i * 0.12, 0, Math.PI * 2);
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(180)),
      new THREE.LineBasicMaterial({ color: i === 1 ? 0xe9dfc9 : 0x8fd8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    line.rotation.set(Math.PI / 2 + 0.35 * (i - 1), rot, 0);
    root.add(line);
    return line;
  });

  // geometria con le cinque forme
  const geo = new THREE.BufferGeometry();
  const s0 = shapeCell(n);
  const from = new Float32Array(n * 3);
  const rand = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const d = dirRandom(), r = 2 + Math.random() * 4;
    from.set([d.x * r, d.y * r * 0.8, d.z * r], i * 3);
    rand.set([Math.random(), Math.random(), Math.random()], i * 3);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(s0, 3));
  geo.setAttribute("aS1", new THREE.BufferAttribute(s0.slice(), 3));   // il corpo arriva col modello
  geo.setAttribute("aS2", new THREE.BufferAttribute(shapeHelix(n), 3));
  geo.setAttribute("aS3", new THREE.BufferAttribute(shapeLattice(n), 3));
  geo.setAttribute("aS4", new THREE.BufferAttribute(shapeVessels(n), 3));
  geo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uW: { value: new THREE.Vector4() }, uAssemble: { value: 0 }, uChaos: { value: 0 },
      uTime: { value: 0 }, uPixel: { value: 6 }, uOpacity: { value: 0.8 },
      uColorA: { value: colors.a }, uColorB: { value: colors.b },
    },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  root.add(points);

  const loaded = new Promise((resolve) => {
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}avatar.glb`,
      (gltf) => {
        geo.getAttribute("aS1").array.set(bodyFromModel(gltf, n));
        geo.getAttribute("aS1").needsUpdate = true;
        resolve();
      },
      (xhr) => { if (xhr.total) onProgress?.(xhr.loaded / xhr.total); },
      () => resolve()   // senza modello il corpo resta una sfera: la pagina funziona lo stesso
    );
  });

  // inquadratura
  let W = 1, H = 1;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
    composer.setSize(W, H);
    mat.uniforms.uPixel.value = renderer.getPixelRatio() * (mobile ? 5.2 : 4.4) * (H / 900);
  }
  window.addEventListener("resize", resize);
  resize();
  const fitDistance = () => {
    const half = THREE.MathUtils.degToRad(camera.fov) / 2;
    const aspect = Math.max(camera.aspect, 0.45);
    return Math.max(1.15 / Math.tan(half), 0.9 / (Math.tan(half) * aspect)) * 1.12;
  };

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!reduced) {
    window.addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / W) * 2 - 1;
      pointer.y = (e.clientY / H) * 2 - 1;
    }, { passive: true });
  }

  let visible = true, angle = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    const t = clock.elapsedTime;
    const u = mat.uniforms;
    u.uW.value.set(state.w1, state.w2, state.w3, state.w4);
    u.uAssemble.value = state.assemble;
    u.uChaos.value = state.chaos;
    u.uTime.value = t;

    if (!reduced) angle += dt * 0.14 * state.spin;
    root.rotation.y = angle;
    root.rotation.x = Math.sin(t * 0.15) * 0.06;

    const w0 = Math.max(0, 1 - state.w1 - state.w2 - state.w3 - state.w4);
    halos.forEach((h, i) => {
      h.material.opacity = 0.2 * w0 * state.halo * state.assemble;
      h.rotation.z = t * (0.12 + i * 0.05) * (i % 2 ? -1 : 1);
    });

    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 2.5);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 2.5);
    const d = fitDistance() * state.dist;
    camera.position.set(pointer.sx * 0.14 * d, state.ty + 0.1 * d - pointer.sy * 0.07 * d, d);
    camera.lookAt(0, state.ty, 0);
    camera.setViewOffset(W, H, -state.sx * W, 0, W, H);
    dust.rotation.y = t * 0.012;
    composer.render();
  });

  return { state, colors, loaded, setVisible(v) { visible = v; } };
}

export const SHAPE_COUNT = N_SHAPES;
