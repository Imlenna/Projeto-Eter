import p5 from 'p5';
import * as Astronomy from 'astronomy-engine';
import './style.css';
import { CONST_PT, CONST_DESC, ZODIAC, STAR_INFO, NEARBY_EXTRA, BODIES } from './data.js';

const DEFAULTS = { latitude: -23.55, longitude: -46.63, elevation: 760, location: 'São Paulo, SP, Brasil', date: '2026-10-20', time: '22:00' };
const DATA_URL = `${import.meta.env.BASE_URL}data/`;
const COMPASS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
const AU_KM = 149597870.7;

const $ = id => document.getElementById(id);
const flag = id => $(id)?.checked ?? true;
const dirOf = az => COMPASS[Math.round(az / 45) % 8];
const conName = sym => CONST_PT[sym] || sym;

let observation = { ...DEFAULTS };
let catalog = null, sky = null, loadError = null;
let selected = null, hovered = null, pointer = { x: 0, y: 0 };
let touchScale = 1;

const observationDate = () => new Date(`${observation.date}T${observation.time}:00-03:00`);

/* ---------- Geocodificação de Cidades do Mundo ---------- */
async function fetchCoordinates(cityName) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`, {
      headers: { 'User-Agent': 'MapaCelesteApp/1.0' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    throw new Error('Local não encontrado');
  } catch (err) {
    console.warn('Erro ao buscar coordenadas, mantendo anterior:', err);
    alert('Não foi possível localizar esta cidade. Verifique o nome e tente novamente.');
    return null;
  }
}

/* ---------- Catálogo ---------- */
async function loadCatalog() {
  const files = ['stars.json', 'constellations.lines.json', 'constellations.json'];
  const [stars, lines, cons] = await Promise.all(
    files.map(f => fetch(DATA_URL + f).then(r => { if (!r.ok) throw new Error(`Falha ao carregar ${f}`); return r.json(); }))
  );
  const toRaDec = ([lon, lat]) => ({ ra: ((lon + 360) % 360) / 15, dec: lat });
  catalog = {
    stars: stars.features.map(f => {
      const hip = Number(f.id);
      return { id: `star-${hip}`, kind: 'star', hip, ...toRaDec(f.geometry.coordinates), mag: f.properties.mag, bv: parseFloat(f.properties.bv) };
    }),
    lines: lines.features.map(f => ({ id: f.id, segs: f.geometry.coordinates.map(l => l.map(toRaDec)) })),
    cons: cons.features.map(f => ({ id: f.id, en: f.properties.en || f.properties.name || f.id, ...toRaDec(f.geometry.coordinates) }))
  };
}

/* ---------- Astronomia ---------- */
function horizonOf(ra, dec, ctx) {
  const v = Astronomy.VectorFromSphere(new Astronomy.Spherical(dec, ra * 15, 1), ctx.time);
  const eq = Astronomy.EquatorFromVector(Astronomy.RotateVector(ctx.rot, v));
  const h = Astronomy.Horizon(ctx.time, ctx.observer, eq.ra, eq.dec, 'normal');
  return { az: h.azimuth, alt: h.altitude };
}

function buildSky() {
  if (!catalog) return;
  const time = Astronomy.MakeTime(observationDate());
  const observer = new Astronomy.Observer(observation.latitude, observation.longitude, observation.elevation);
  const ctx = { time, observer, rot: Astronomy.Rotation_EQJ_EQD(time) };
  const place = (ra, dec) => horizonOf(ra, dec, ctx);

  const bodies = BODIES.map(b => {
    const body = Astronomy.Body[b.body];
    const eq = Astronomy.Equator(body, time, observer, true, true);
    const h = Astronomy.Horizon(time, observer, eq.ra, eq.dec, 'normal');
    const eqJ = Astronomy.Equator(body, time, observer, false, true);
    let illum = null; try { illum = Astronomy.Illumination(body, time); } catch { /* ignora */ }
    const phase = b.body === 'Moon' ? Astronomy.MoonPhase(time) : null;
    return { ...b, kind: 'body', az: h.azimuth, alt: h.altitude, dist: eq.dist, mag: illum?.mag, fraction: illum?.phase_fraction, phase, con: Astronomy.Constellation(eqJ.ra, eqJ.dec).symbol };
  });

  sky = {
    stars: catalog.stars.map(s => ({ ...s, ...place(s.ra, s.dec) })).filter(s => s.alt > -10),
    nearby: NEARBY_EXTRA.map(n => ({ ...n, kind: 'nearby', ...place(n.ra, n.dec) })).filter(n => n.alt > -10),
    lines: catalog.lines.map(c => ({ id: c.id, segs: c.segs.map(l => l.map(pt => place(pt.ra, pt.dec))) })),
    labels: catalog.cons.map(c => ({ id: c.id, kind: 'constellation', en: c.en, ...place(c.ra, c.dec) })),
    bodies
  };
  selected = null; hovered = null;
  updateMeta(); showInfo(null);
}

/* ---------- Painel de informações e Fuso Horário Correto ---------- */
function updateMeta() {
  const [year, month, day] = observation.date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const formattedDateString = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(localDate);

  $('sky-caption').textContent = `${formattedDateString} · ${observation.time} · ${observation.location}`;
  $('meta-location').textContent = observation.location;
  
  const d = observationDate();
  $('meta-datetime').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

const moonPhaseName = a => ['Lua nova', 'Lua crescente', 'Quarto crescente', 'Crescente gibosa', 'Lua cheia', 'Minguante gibosa', 'Quarto minguante', 'Lua minguante'][Math.round(a / 45) % 8];
const whereText = o => (o.alt > 0 ? `${Math.round(o.alt)}° de altitude, direção ${dirOf(o.az)}` : 'abaixo do horizonte agora');
const magText = m => (m == null ? null : m.toFixed(2).replace('.', ','));

function describe(o) {
  const facts = [];
  const add = (k, v) => { if (v != null && v !== '') facts.push([k, v]); };

  if (o.kind === 'constellation') {
    const sym = o.id;
    add('Sigla IAU', sym);
    add('Nome em inglês', o.en);
    add('Zodíaco', ZODIAC.has(sym) ? 'Sim' : 'Não');
    add('Posição agora', whereText(o));
    return { kind: 'Constelação', title: conName(sym), facts, text: CONST_DESC[sym] || `${conName(sym)} é uma das 88 constelações oficiais.` };
  }

  if (o.kind === 'body') {
    add('Posição agora', whereText(o));
    add('Constelação', conName(o.con));
    if (o.body === 'Moon') {
      add('Fase', moonPhaseName(o.phase));
      add('Iluminação', o.fraction != null ? `${Math.round(o.fraction * 100)}%` : null);
      add('Distância', `${Math.round(o.dist * AU_KM).toLocaleString('pt-BR')} km`);
    } else if (o.body !== 'Sun') {
      add('Distância da Terra', `${o.dist.toFixed(2).replace('.', ',')} UA`);
    }
    if (o.body !== 'Moon') add('Magnitude', magText(o.mag));
    return { kind: o.body === 'Sun' || o.body === 'Moon' ? 'Astro' : 'Planeta', title: o.name, text: o.desc, facts };
  }

  if (o.kind === 'nearby') {
    add('Distância', `${String(o.ly).replace('.', ',')} anos-luz`);
    add('Magnitude', magText(o.mag));
    add('Classe espectral', o.cls);
    add('Constelação', conName(o.con));
    add('Posição agora', whereText(o));
    return { kind: 'Estrela próxima', title: o.name, text: `${o.desc} Invisível a olho nu.`, facts };
  }

  const info = STAR_INFO[o.hip];
  const sym = Astronomy.Constellation(o.ra, o.dec).symbol;
  const near = info && info.ly <= 26;
  add('Magnitude', magText(o.mag));
  add('Constelação', conName(sym));
  add('Distância', info ? `cerca de ${String(info.ly).replace('.', ',')} anos-luz` : null);
  add('Classe espectral', info?.cls);
  add('Posição agora', whereText(o));
  const title = info?.name || `HIP ${o.hip}`;
  let text = info?.desc || `Estrela do catálogo Hipparcos (HIP ${o.hip}).`;
  if (near) text += ` Está entre as estrelas mais próximas do Sol.`;
  return { kind: near ? 'Estrela próxima' : 'Estrela', title, text, facts };
}

function showInfo(o) {
  const dl = $('object-facts');
  dl.replaceChildren();
  if (!o) {
    $('object-kind').textContent = 'OBJETO SELECIONADO';
    $('object-name').textContent = 'Explore o mapa';
    $('object-description').textContent = 'Clique em um planeta, constelação ou estrela próxima. No celular, use dois dedos ou os botões + e − para ampliar.';
    return;
  }
  const d = describe(o);
  $('object-kind').textContent = d.kind.toUpperCase();
  $('object-name').textContent = d.title;
  $('object-description').textContent = d.text;
  for (const [k, v] of d.facts) {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    dl.append(dt, dd);
  }
}

/* ---------- Desenho e Suporte Web/Tablet ---------- */
function sketch(p) {
  let c = 0, r = 0, k = 1;
  let hits = { bodies: [], nearby: [], bright: [], stars: [], labels: [] }, segs = [];

  // Zoom e deslocamento do mapa (1 = céu inteiro). O centro do zoom é o centro do círculo.
  const MAX_ZOOM = 8;
  let zoom = 1, panX = 0, panY = 0, viewMoved = false; // viewMoved: o balão de constelação ficaria fora do lugar
  const inView = (x, y, m = 0) => Math.hypot(x - c, y - c) <= r + m; // dentro do círculo do mapa
  const clampPan = () => { const m = (zoom - 1) * r; panX = p.constrain(panX, -m, m); panY = p.constrain(panY, -m, m); };
  const zoomAt = (px, py, next) => {
    next = p.constrain(next, 1, MAX_ZOOM);
    const wx = (px - c - panX) / zoom, wy = (py - c - panY) / zoom; // ponto do céu sob o dedo
    zoom = next; panX = px - c - wx * zoom; panY = py - c - wy * zoom;
    clampPan(); viewMoved = true;
  };

  // Norte no topo e Leste à esquerda (céu visto de baixo para cima).
  const project = o => {
    const d = r * (90 - o.alt) / 90, a = o.az * Math.PI / 180;
    return { x: c + (-d * Math.sin(a)) * zoom + panX, y: c + (-d * Math.cos(a)) * zoom + panY };
  };
  
  const canvasWidth = () => {
    const box = $('sky-canvas').clientWidth || 600;
    return Math.max(280, box - 16);
  };

  p.setup = () => {
    const cv = p.createCanvas(canvasWidth(), canvasWidth());
    cv.parent('sky-canvas');
    p.pixelDensity(Math.min(devicePixelRatio || 1, 2));
    p.noLoop();
    const el = cv.elt;
    
    const toLocal = e => {
      const b = el.getBoundingClientRect();
      return {
        x: (e.clientX - b.left) * (p.width / b.width),
        y: (e.clientY - b.top) * (p.height / b.height)
      };
    };

    const pts = new Map();           // dedos/ponteiros ativos
    let tapStart = null, dragged = false, multi = false, pinch = null;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const setCursor = () => { el.style.cursor = zoom > 1 ? 'grab' : hovered ? 'pointer' : 'default'; };

    el.addEventListener('pointerdown', e => {
      el.setPointerCapture?.(e.pointerId);
      const pos = toLocal(e);
      pts.set(e.pointerId, pos);
      if (pts.size === 1) { tapStart = pos; dragged = false; multi = false; }
      else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: dist(a, b) || 1, zoom, mid: mid(a, b) };
        multi = true;
      }
    });

    el.addEventListener('pointermove', e => {
      const pos = toLocal(e);
      if (!pts.has(e.pointerId)) { // mouse sem botão: só passa por cima
        if (e.pointerType === 'touch') return;
        pointer = pos; hovered = pick(pos.x, pos.y); viewMoved = false; setCursor(); p.redraw(); return;
      }
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, pos);
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()], m = mid(a, b);
        panX += m.x - pinch.mid.x; panY += m.y - pinch.mid.y;
        zoomAt(m.x, m.y, pinch.zoom * dist(a, b) / pinch.d);
        pinch.mid = m; dragged = true; p.redraw();
      } else if (pts.size === 1) {
        if (!dragged && dist(pos, tapStart) > 10) dragged = true;
        if (dragged && zoom > 1) { panX += pos.x - prev.x; panY += pos.y - prev.y; clampPan(); viewMoved = true; el.style.cursor = 'grabbing'; p.redraw(); }
      }
    });

    const release = e => {
      if (!pts.has(e.pointerId)) return;
      const pos = toLocal(e);
      pts.delete(e.pointerId);
      pinch = null;
      if (pts.size === 1) { tapStart = [...pts.values()][0]; dragged = true; } // sobrou um dedo: não é toque
      if (pts.size > 0) return;
      // Toque curto, sem arrastar nem pinça: seleciona. Com zoom a área de toque encolhe, pois os objetos já estão afastados.
      if (e.type === 'pointerup' && !dragged && !multi) {
        touchScale = e.pointerType === 'touch' ? (zoom > 1.5 ? 2 : 3.5) : 1;
        pointer = pos; selected = pick(pos.x, pos.y); hovered = null; viewMoved = false;
        showInfo(selected);
      }
      setCursor(); p.redraw();
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', e => { if (!pts.has(e.pointerId)) { hovered = null; p.redraw(); } });

    el.addEventListener('wheel', e => {
      e.preventDefault();
      const pos = toLocal(e);
      zoomAt(pos.x, pos.y, zoom * Math.exp(-e.deltaY * 0.0015));
      setCursor(); p.redraw();
    }, { passive: false });

    ['toggle-lines', 'toggle-names', 'toggle-planets', 'toggle-sunmoon', 'toggle-nearby'].forEach(id => $(id)?.addEventListener('change', () => p.redraw()));
    loadCatalog().then(() => { buildSky(); p.redraw(); }).catch(err => { loadError = err; p.redraw(); });
  };

  p.draw = () => {
    c = p.width / 2; r = p.width * 0.435; k = p.width / 600;
    const compact = p.width < 520;
    
    p.textFont('Manrope, sans-serif');
    const fs = () => (compact ? 10 : Math.max(9, 10 * k));
    
    p.background('#050711');

    p.noFill(); p.stroke('#59617d'); p.strokeWeight(1); p.circle(c, c, r * 2);
    p.noStroke(); p.fill('#929bb9'); p.textAlign(p.CENTER, p.CENTER); p.textSize(Math.max(10, p.width * 0.018));
    p.text('N', c, c - r - 15); p.text('L', c - r - 15, c); p.text('S', c, c + r + 15); p.text('O', c + r + 15, c);

    if (!sky) {
      p.fill('#8f98b5'); p.textSize(13);
      p.text(loadError ? 'Não foi possível carregar o catálogo.' : 'Carregando catálogo de estrelas…', c, c);
      return;
    }

    hits = { bodies: [], nearby: [], bright: [], stars: [], labels: [] }; segs = [];
    const queue = [];
    const focus = hovered || selected;
    const ctx = p.drawingContext;
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, r - 0.5, 0, Math.PI * 2); ctx.clip();

    if (flag('toggle-lines')) {
      for (const con of sky.lines) {
        const active = focus?.kind === 'constellation' && focus.id === con.id;
        if (active) { p.stroke('#f7d783'); p.strokeWeight(2.3); } else { p.stroke(150, 170, 230, 110); p.strokeWeight(1.4); }
        for (const line of con.segs) {
          for (let i = 1; i < line.length; i++) {
            const a = line[i - 1], b = line[i];
            if (a.alt < -10 || b.alt < -10) continue;
            const A = project(a), B = project(b);
            p.line(A.x, A.y, B.x, B.y);
            segs.push({ id: con.id, x1: A.x, y1: A.y, x2: B.x, y2: B.y });
          }
        }
      }
    }

    p.noStroke();
    for (const s of sky.stars) {
      if (s.alt < 0) continue;
      const pos = project(s);
      if (!inView(pos.x, pos.y, 8)) continue; // fora do círculo (zoom): não desenha nem é clicável
      const size = p.constrain((4.8 - s.mag * 0.85) * k, 0.9, 5.2 * k) * Math.min(1.7, 1 + 0.12 * (zoom - 1));
      const bv = Number.isFinite(s.bv) ? s.bv : 0.5;
      p.fill(bv < 0.1 ? '#d6e2ff' : bv < 0.7 ? '#f4f6ff' : bv < 1.2 ? '#ffeccb' : '#ffcfa3');
      p.circle(pos.x, pos.y, size);
      const info = STAR_INFO[s.hip];
      const near = info && info.ly <= 26;
      const h = { obj: s, x: pos.x, y: pos.y, reach: Math.max(8, size / 2 + 5) };
      if (near) hits.bright.push(h);
      if (near && flag('toggle-nearby')) { p.noFill(); p.stroke('#7fe3d2'); p.strokeWeight(1); p.circle(pos.x, pos.y, size + 8); p.noStroke(); }
      if (flag('toggle-names') && info && s.mag < (compact ? 1.2 : 2.3)) queue.push({ text: info.name.split(' (')[0], x: pos.x + size / 2 + 5, y: pos.y - 5, align: 'left', size: fs(), fill: [232, 236, 255, 190], prio: 2 });
    }

    if (flag('toggle-nearby')) {
      for (const n of sky.nearby) {
        if (n.alt < 0) continue;
        const pos = project(n);
        if (!inView(pos.x, pos.y, 8)) continue;
        p.noFill(); p.stroke('#7fe3d2'); p.strokeWeight(1.1); p.circle(pos.x, pos.y, 9 * k + 2);
        p.noStroke(); p.fill('#7fe3d2'); p.circle(pos.x, pos.y, 2.2 * k);
        if (flag('toggle-names')) queue.push({ text: n.name, x: pos.x + 9 * k, y: pos.y - 5, align: 'left', size: fs(), fill: [127, 227, 210, 215], prio: 1 });
        hits.nearby.push({ obj: n, x: pos.x, y: pos.y, reach: 12 });
      }
    }

    if (flag('toggle-names')) {
      for (const l of sky.labels) {
        if (l.alt < 3) continue;
        const pos = project(l);
        if (!inView(pos.x, pos.y)) continue;
        queue.push({ text: conName(l.id), x: pos.x, y: pos.y, align: 'center', size: fs(), fill: [165, 177, 218, 190], prio: 3, obj: l });
      }
    }

    // Renderização separada para Planetas e para Sol/Lua
    for (const b of sky.bodies) {
      const isSunMoon = b.body === 'Sun' || b.body === 'Moon';
      if (isSunMoon && !flag('toggle-sunmoon')) continue;
      if (!isSunMoon && !flag('toggle-planets')) continue;
      if (b.alt < 0) continue;

      const pos = project(b), size = b.size * k * 0.9;
      if (!inView(pos.x, pos.y, 8)) continue;
      p.noStroke(); p.fill(b.color); p.circle(pos.x, pos.y, size);
      p.noFill(); p.stroke(b.color); p.strokeWeight(0.7); p.circle(pos.x, pos.y, size + 5);
      queue.push({ text: b.name, x: pos.x + size / 2 + 6, y: pos.y, align: 'left', size: fs(), fill: [238, 241, 255, 230], prio: 0 });
      hits.bodies.push({ obj: b, x: pos.x, y: pos.y, reach: Math.max(14, size / 2 + 8) });
    }

    placeLabels(queue);
    ctx.restore();

    if (focus) {
      const h = [...hits.bodies, ...hits.nearby, ...hits.bright, ...hits.stars].find(x => x.obj.id === focus.id);
      if (h) { if (inView(h.x, h.y)) { p.noFill(); p.stroke('#f7d783'); p.strokeWeight(1.3); p.circle(h.x, h.y, 18); tooltip(h.x, h.y, label(focus)); } }
      else if (focus.kind === 'constellation' && !viewMoved) tooltip(pointer.x, pointer.y, label(focus));
    }
  };

  function placeLabels(queue) {
    const placed = [];
    const inside = (x, y) => Math.hypot(x - c, y - c) <= r - 2;
    const hit = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
    queue.sort((a, b) => a.prio - b.prio);
    p.noStroke();
    for (const q of queue) {
      p.textFont('Manrope, sans-serif');
      p.textSize(q.size);
      const w = p.textWidth(q.text), h = q.size * 1.25;
      const steps = q.align === 'center' ? [0, 13, -13, 26, -26] : [0, h, -h];
      for (const dy of steps) {
        const y = q.y + dy;
        const x1 = q.align === 'center' ? q.x - w / 2 : q.x;
        const box = { x1: x1 - 2, x2: x1 + w + 2, y1: y - h / 2, y2: y + h / 2 };
        if (![[box.x1, box.y1], [box.x2, box.y1], [box.x1, box.y2], [box.x2, box.y2]].every(([px, py]) => inside(px, py))) continue;
        if (placed.some(o => hit(box, o))) continue;
        placed.push(box);
        p.fill(...q.fill);
        p.textAlign(q.align === 'center' ? p.CENTER : p.LEFT, p.CENTER);
        p.text(q.text, q.align === 'center' ? q.x : x1, y);
        if (q.obj) hits.labels.push({ obj: q.obj, x: (box.x1 + box.x2) / 2, y, reach: Math.max(w / 2 + 4, 20) });
        break;
      }
    }
  }

  const label = o => (o.kind === 'constellation' ? conName(o.id) : o.kind === 'star' ? (STAR_INFO[o.hip]?.name || `HIP ${o.hip}`) : o.name);

  function tooltip(x0, y0, text) {
    p.textFont('Manrope, sans-serif');
    p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
    const w = Math.min(p.width - 24, p.textWidth(text) + 22), h = 30;
    const x = p.constrain(x0 + 15, 12, p.width - w - 12), y = p.constrain(y0 - h - 12, 12, p.height - h - 12);
    p.noStroke(); p.fill(15, 19, 37, 245); p.rect(x, y, w, h, 7);
    p.noFill(); p.stroke('#6c769b'); p.strokeWeight(1); p.rect(x, y, w, h, 7);
    p.noStroke(); p.fill('#f5f6ff'); p.text(text, x + 11, y + h / 2);
  }

  function nearest(list, x, y, bias = () => 0) {
    let best = null, bestScore = Infinity;
    for (const h of list) {
      const d = Math.hypot(x - h.x, y - h.y);
      if (d <= h.reach * touchScale && d + bias(h) < bestScore) { bestScore = d + bias(h); best = h; }
    }
    return best?.obj ?? null;
  }

  function segDist(x, y, s) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, len2 = dx * dx + dy * dy;
    const t = len2 ? p.constrain(((x - s.x1) * dx + (y - s.y1) * dy) / len2, 0, 1) : 0;
    return Math.hypot(x - (s.x1 + t * dx), y - (s.y1 + t * dy));
  }

  function pickConstellation(x, y) {
    let best = null, bestD = 9 * touchScale;
    for (const s of segs) { const d = segDist(x, y, s); if (d < bestD) { bestD = d; best = s; } }
    if (!best) return null;
    return sky.labels.find(l => l.id === best.id) || { kind: 'constellation', id: best.id, en: best.id, az: 0, alt: 0 };
  }

  function pick(x, y) {
    if (!sky || Math.hypot(x - c, y - c) > r + 4) return null;
    
    const pickedBody = nearest(hits.bodies, x, y);
    let validBody = null;
    if (pickedBody) {
      const isSunMoon = pickedBody.body === 'Sun' || pickedBody.body === 'Moon';
      if ((isSunMoon && flag('toggle-sunmoon')) || (!isSunMoon && flag('toggle-planets'))) {
        validBody = pickedBody;
      }
    }

    return validBody
      ?? nearest(hits.nearby, x, y)
      ?? nearest(hits.bright, x, y, h => h.obj.mag)
      ?? pickConstellation(x, y)
      ?? nearest(hits.labels, x, y);
  }

  p.windowResized = () => {
    const w = canvasWidth();
    if (w !== p.width) { zoom = 1; panX = 0; panY = 0; p.resizeCanvas(w, w); p.redraw(); }
  };
  p.refresh = () => { buildSky(); p.redraw(); };
  p.zoomBy = f => { zoomAt(c, c, zoom * f); p.redraw(); };
  p.resetView = () => { zoom = 1; panX = 0; panY = 0; viewMoved = true; p.redraw(); };
}

const instance = new p5(sketch);
$('zoom-in').addEventListener('click', () => instance.zoomBy(1.6));
$('zoom-out').addEventListener('click', () => instance.zoomBy(1 / 1.6));
$('zoom-reset').addEventListener('click', () => instance.resetView());

/* ---------- Gerenciamento do Menu Sanduíche com Bloqueio de Clique no Fundo ---------- */
const menuBtn = $('menu-btn');
const dropdownMenu = $('dropdown-menu');

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('hidden');
});

// Impede que cliques e toques dentro do menu suspenso vazem para o canvas/fundo
['click', 'pointerdown', 'touchstart'].forEach(eventType => {
  dropdownMenu.addEventListener(eventType, (e) => {
    e.stopPropagation();
  });
});

document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) {
    dropdownMenu.classList.add('hidden');
  }
});

/* ---------- Botão Atualizar Céu & Geocodificação Global ---------- */
$('update-sky').addEventListener('click', async () => {
  const cityQuery = $('location').value.trim() || DEFAULTS.location;
  observation.date = $('date').value || DEFAULTS.date;
  observation.time = $('time').value || DEFAULTS.time;

  const coords = await fetchCoordinates(cityQuery);
  if (coords) {
    observation.latitude = coords.latitude;
    observation.longitude = coords.longitude;
    observation.location = cityQuery;
  }

  instance.refresh();
});