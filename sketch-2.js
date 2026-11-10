// OLHARES — a TUA pintura a mexer (p5.js 2.x)
// Input: rato/toque + clique + tempo (noise)
// Expressão: a imagem original dividida em azulejos (módulos) que ondulam, ampliam e rodam
// Output: visualização interativa sobre a imagem real do desenho
//
// Precisa de: imagem_finalfaces.jpg na mesma pasta do index.html (usar Go Live)
// Teclas: M = modo (lupa / redemoinho) | + / - = tamanho dos azulejos
//         S = guardar PNG | clique = onda que se espalha

const FILE = 'imagem_finalfaces.jpg'; // muda aqui se o nome/extensão for outro

let img;
let tile = 48;     // tamanho do azulejo em pixéis do ecrã
let mode = 0;      // 0 = lupa, 1 = redemoinho
let ripples = [];
let tiles = [];
let sc, ox, oy;    // escala e deslocamento da imagem (modo "cover")

async function setup() {
  createCanvas(windowWidth, windowHeight);
  img = await loadImage(FILE);
  layout();
}

// ajusta a imagem ao ecrã (preenche tudo, sem deformar) e cria a grelha
function layout() {
  sc = max(width / img.width, height / img.height);
  ox = (width - img.width * sc) / 2;
  oy = (height - img.height * sc) / 2;
  tiles = [];
  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      tiles.push({ x, y, cx: x + tile / 2, cy: y + tile / 2, seed: random(1000) });
    }
  }
}

function draw() {
  background(20);
  if (!img) return;                // ainda a carregar
  const t = frameCount * 0.01;
  const R = min(width, height) * 0.28;  // raio de influência do rato
  const now = millis() / 1000;

  // limpa ondas antigas
  ripples = ripples.filter(r => now - r.t0 < 4);

  const items = [];
  for (const tl of tiles) {
    let px = tl.cx, py = tl.cy;

    // 1) respiração suave com noise (a imagem nunca fica parada)
    px += (noise(tl.seed, t) - 0.5) * 10;
    py += (noise(tl.seed + 50, t) - 0.5) * 10;

    // 2) rato
    const dx = tl.cx - mouseX, dy = tl.cy - mouseY;
    const d = sqrt(dx * dx + dy * dy);
    const f = constrain(1 - d / R, 0, 1);
    const fe = f * f * (3 - 2 * f);       // suavizado
    let rot = 0, s = 1;

    if (mode === 0) {
      // lupa: empurra para fora, amplia e inclina
      const k = d > 0.001 ? 1 / d : 0;
      px += dx * k * fe * 45;
      py += dy * k * fe * 45;
      s = 1 + fe * 0.9;
      rot = fe * 0.25 * sin(tl.seed + t * 3);
    } else {
      // redemoinho: roda à volta do cursor
      const ang = fe * 1.4;
      const c = cos(ang), sn = sin(ang);
      px = mouseX + dx * c - dy * sn;
      py = mouseY + dx * sn + dy * c;
      rot = ang;
      s = 1 + fe * 0.25;
    }

    // 3) ondas dos cliques
    for (const r of ripples) {
      const rx = tl.cx - r.x, ry = tl.cy - r.y;
      const rd = sqrt(rx * rx + ry * ry);
      const age = now - r.t0;
      const front = age * 520;
      const env = exp(-abs(rd - front) / 90) * exp(-age * 1.1);
      const w = sin((rd - front) * 0.05) * env * 28;
      const k = rd > 0.001 ? 1 / rd : 0;
      px += rx * k * w;
      py += ry * k * w;
      s += env * 0.15;
    }

    items.push({ tl, px, py, rot, s, order: fe });
  }

  // os azulejos mais perto do rato desenham-se por cima
  items.sort((a, b) => a.order - b.order);

  noStroke();
  for (const it of items) drawTile(it);
}

function drawTile({ tl, px, py, rot, s }) {
  const pad = 2; // sobreposição para não aparecerem frinchas
  const w = tile + pad, h = tile + pad;

  // área correspondente na imagem original
  const sx = constrain((tl.x - pad / 2 - ox) / sc, 0, img.width - 1);
  const sy = constrain((tl.y - pad / 2 - oy) / sc, 0, img.height - 1);
  const sw = min(w / sc, img.width - sx);
  const sh = min(h / sc, img.height - sy);

  push();
  translate(px, py);
  rotate(rot);
  scale(s);
  image(img, -w / 2, -h / 2, w, h, sx, sy, sw, sh);
  pop();
}

function mousePressed() {
  ripples.push({ x: mouseX, y: mouseY, t0: millis() / 1000 });
}

function keyPressed() {
  if (key === 'm' || key === 'M') mode = (mode + 1) % 2;
  if (key === '+') { tile = max(20, tile - 8); layout(); }
  if (key === '-') { tile = min(120, tile + 8); layout(); }
  if (key === 's' || key === 'S') saveCanvas('olhares-imagem', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (img) layout();
}