// OLHARES — os olhos da tua pintura seguem o cursor (p5.js 2.x)
// Input: rato/toque + tempo (noise)
// Expressão: a pintura original intacta; os olhos são módulos redondos (amêndoa)
//            com íris, pupila e pálpebra pesada, que olham, piscam e arregalam
// Output: visualização interativa sobre a imagem real do desenho
//
// Precisa de: imagemfinal/finalfaces.jpg (pasta ao lado do index.html) e Go Live
// Teclas: S = guardar PNG | E = mostrar/esconder os olhos animados (comparar com o original)
// Clique = os olhos arregalam | sem mexer o rato = os olhos passeiam sozinhos

const FILE = 'imagemfinal/finalfaces.jpg'; // pasta/ficheiro, relativo ao index.html
const COVER = false; // false = vê-se a pintura inteira | true = preenche o ecrã (corta nas margens)

// Posição dos olhos em píxeis da imagem ORIGINAL (1376 x 768):
// [x, y, largura, altura, ângulo em graus, cor da íris]
const EYES = [
  [145, 39, 44, 22, -15, '#141414'], [70, 72, 50, 24, -37, '#141414'],
  [228, 52, 30, 14, 0, '#141414'], [272, 80, 35, 15, 15, '#141414'],
  [47, 167, 25, 12, 0, '#141414'], [93, 170, 22, 11, 10, '#141414'],
  [170, 234, 28, 14, 20, '#141414'], [230, 217, 40, 18, -15, '#141414'],
  [330, 125, 38, 16, -5, '#c98a1d'], [397, 142, 40, 16, 15, '#c98a1d'],
  [498, 119, 36, 16, -5, '#141414'], [570, 127, 46, 18, 10, '#141414'],
  [612, 232, 34, 14, 0, '#141414'], [659, 260, 34, 14, 20, '#141414'],
  [472, 352, 50, 18, -5, '#6b6b2a'], [387, 385, 46, 20, -36, '#6b6b2a'],
  [89, 382, 72, 28, 3, '#2a6fd0'], [187, 402, 75, 30, 12, '#a8742e'],
  [982, 75, 45, 22, -20, '#141414'], [907, 122, 45, 22, -15, '#141414'],
  [1070, 86, 30, 14, -5, '#141414'], [1122, 77, 35, 12, 0, '#141414'],
  [1200, 105, 55, 24, -15, '#d9531e'], [1292, 115, 60, 26, 10, '#d9531e'],
  [832, 185, 45, 20, -15, '#141414'], [785, 220, 40, 28, 70, '#141414'],
  [1352, 177, 24, 10, 0, '#141414'], [1037, 307, 35, 16, 10, '#141414'],
  [1090, 325, 35, 16, 15, '#141414'], [940, 370, 60, 24, -10, '#141414'],
  [1272, 362, 72, 30, -25, '#c98a1d'],
  [642, 425, 45, 20, -25, '#e07a1f'], [575, 467, 45, 20, -20, '#e07a1f'],
  [287, 502, 40, 18, 10, '#6a1530'], [350, 540, 45, 20, 36, '#6a1530'],
  [120, 592, 50, 22, -10, '#141414'], [62, 625, 35, 26, 60, '#141414'],
  [297, 645, 30, 14, -5, '#141414'], [360, 655, 22, 18, 80, '#141414'],
  [432, 596, 72, 24, 0, '#141414'], [572, 597, 70, 22, 0, '#141414'],
  [855, 415, 70, 28, -15, '#d9a21e'], [785, 475, 25, 12, -20, '#141414'],
  [752, 495, 25, 12, 15, '#141414'], [1005, 457, 35, 16, -10, '#141414'],
  [1065, 469, 40, 16, 10, '#141414'], [1180, 425, 65, 36, -25, '#c98a1d'],
  [1142, 517, 30, 14, -30, '#141414'], [1120, 542, 30, 14, 25, '#141414'],
  [812, 607, 45, 18, 5, '#141414'], [900, 605, 55, 20, 0, '#141414'],
  [1005, 644, 50, 18, 0, '#141414'], [1145, 646, 50, 18, 0, '#141414'],
  [1315, 614, 70, 26, -15, '#141414'], [1230, 652, 50, 22, -25, '#141414'],
];

let img;
let loadError = false;
let eyes = [];
let sc = 1, ox = 0, oy = 0;       // escala e deslocamento da imagem no ecrã
let moved = false, lastMove = 0;  // para os olhos passearem quando o rato pára
let wide = 0;                     // arregalar (clique)
let showEyes = true;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  try {
    img = await loadImage(FILE);
    fit();
    initEyes();
  } catch (e) {
    loadError = true;
    console.error('Não encontrei a imagem em: ' + FILE, e);
  }
}

function fit() {
  sc = COVER ? max(width / img.width, height / img.height)
             : min(width / img.width, height / img.height);
  ox = (width - img.width * sc) / 2;
  oy = (height - img.height * sc) / 2;
}

function initEyes() {
  eyes = EYES.map(([x, y, w, h, a, col]) => {
    const rot = radians(a);
    return {
      x, y, rot, col,
      w: w * 1.12, h: h * 1.3,          // um pouco maior para cobrir o olho original
      ix: 0, iy: 0,                     // posição da íris (suavizada)
      lidBase: random(0.28, 0.42),      // pálpebra pesada, como na pintura
      blinkAt: millis() + random(1500, 7000),
      blinkT: -1,
      lidCol: skin(x, y, w, h, rot),    // cor da pele, tirada da própria pintura
    };
  });
}

// cor da pele junto ao olho (mediana de 3 amostras acima do olho)
function skin(x, y, w, h, rot) {
  const c = cos(rot), s = sin(rot);
  const pts = [[0, -h * 1.4], [-w * 0.3, -h * 1.4], [w * 0.3, -h * 1.4]];
  const cols = pts.map(([px, py]) => {
    const sx = constrain(round(x + px * c - py * s), 0, img.width - 1);
    const sy = constrain(round(y + px * s + py * c), 0, img.height - 1);
    const col = color(img.get(sx, sy));
    return [red(col), green(col), blue(col)];
  });
  cols.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
  const m = cols[1];
  return 'rgb(' + round(m[0]) + ',' + round(m[1]) + ',' + round(m[2]) + ')';
}

function draw() {
  background(17);
  if (loadError) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text('Não encontrei a imagem:\n' + FILE + '\n\nVerifica o nome da pasta e do ficheiro.', width / 2, height / 2);
    return;
  }
  if (!img) return; // ainda a carregar

  image(img, ox, oy, img.width * sc, img.height * sc);
  if (!showEyes) return;

  const now = millis();
  const t = now * 0.001;

  // para onde olham: o cursor, ou um passeio com noise se o rato estiver parado
  let tx = mouseX, ty = mouseY;
  if (!moved || now - lastMove > 4000) {
    tx = width / 2 + (noise(t * 0.15) - 0.5) * width * 1.3;
    ty = height / 2 + (noise(t * 0.15 + 100) - 0.5) * height * 1.3;
  }

  wide *= 0.94;
  for (const e of eyes) drawEye(drawingContext, e, tx, ty, now);
}

function almondPath(ctx, hw, h) {
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.quadraticCurveTo(0, -h, hw, 0);
  ctx.quadraticCurveTo(0, h, -hw, 0);
  ctx.closePath();
}

function drawEye(ctx, e, tx, ty, now) {
  const X = ox + e.x * sc, Y = oy + e.y * sc;
  const dx = tx - X, dy = ty - Y;
  const d = sqrt(dx * dx + dy * dy);

  // piscar
  let blink = 0;
  if (e.blinkT < 0 && now > e.blinkAt) e.blinkT = now;
  if (e.blinkT >= 0) {
    const p = (now - e.blinkT) / 180;
    if (p >= 1) { e.blinkT = -1; e.blinkAt = now + random(2000, 7500); }
    else blink = sin(p * PI);
  }

  // pálpebra: abre mais quando o cursor está perto; arregala com o clique
  const near = constrain(1 - d / (min(width, height) * 0.6), 0, 1);
  let lid = e.lidBase * (1 - 0.6 * near) * (1 - wide);
  lid = lerp(lid, 1, blink);

  // íris segue o alvo
  const r = e.h * 0.5 * (1 + wide * 0.2);
  const a = atan2(dy, dx) - e.rot;
  const k = constrain(d / (60 * sc), 0, 1);
  const gx = cos(a) * (e.w / 2 - r * 0.9) * 0.8 * k;
  const gy = sin(a) * (e.h / 2 - r * 0.4) * 0.6 * k;
  e.ix = lerp(e.ix, gx, 0.2);
  e.iy = lerp(e.iy, gy, 0.2);

  const hw = e.w / 2, h = e.h;
  ctx.save();
  ctx.translate(X, Y);
  ctx.rotate(e.rot);
  ctx.scale(sc, sc);

  // interior do olho (recortado em amêndoa)
  ctx.save();
  almondPath(ctx, hw, h);
  ctx.clip();
  ctx.fillStyle = '#fbf6ea';
  ctx.fillRect(-hw - 2, -h, e.w + 4, h * 2);

  ctx.fillStyle = e.col;
  ctx.beginPath(); ctx.arc(e.ix, e.iy, r, 0, TWO_PI); ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath(); ctx.arc(e.ix, e.iy, r * 0.5, 0, TWO_PI); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(e.ix - r * 0.35, e.iy - r * 0.35, r * 0.2, 0, TWO_PI); ctx.fill();

  // pálpebra
  const yl = -h / 2 + lid * h;
  ctx.fillStyle = e.lidCol;
  ctx.beginPath();
  ctx.moveTo(-hw - 2, -h);
  ctx.lineTo(hw + 2, -h);
  ctx.lineTo(hw + 2, 0);
  ctx.quadraticCurveTo(0, 2 * yl, -hw - 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(hw + 2, 0);
  ctx.quadraticCurveTo(0, 2 * yl, -hw - 2, 0);
  ctx.stroke();
  ctx.restore();

  // contorno do olho
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 2.2;
  almondPath(ctx, hw, h);
  ctx.stroke();
  ctx.restore();
}

function mouseMoved() { moved = true; lastMove = millis(); }
function mouseDragged() { moved = true; lastMove = millis(); }
function touchMoved() { moved = true; lastMove = millis(); return false; }
function mousePressed() { wide = 1; }

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('olhares', 'png');
  if (key === 'e' || key === 'E') showEyes = !showEyes;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (img) fit();
}