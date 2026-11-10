// OLHARES — (com)FORMA · Ingredientes
// Input: rato/toque (posição) + tempo (noise)
// Expressão: módulos de rosto inspirados na pintura de referência (formas orgânicas,
//            cores saturadas, contorno grosso, pálpebras pesadas)
// Output: visualização interativa / gerador de padrão modular
//
// Teclas: ESPAÇO = nova paleta | + / - = densidade | R = recomeçar | S = guardar PNG
// Clique = os rostos à volta rodam e mudam de cor

const PALETTES = [
  ['#e8632a', '#d93a6a', '#2f9e8f', '#2f5fd0', '#f2c230', '#8c1c3a', '#4aa86b'], // pintura
  ['#ff5a5f', '#ffb400', '#00a6a6', '#5c4dff', '#ff8fb1', '#1b1b3a', '#9be564'],
  ['#f94144', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#9d4edd'],
];
let pal = 0;
let cell = 150;
let faces = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  buildFaces();
}

function buildFaces() {
  faces = [];
  const P = PALETTES[pal];
  for (let y = 0; y < height + cell; y += cell * 0.82) {
    const offset = (round(y / cell) % 2) * cell * 0.5; // quincôncio
    for (let x = -cell; x < width + cell; x += cell * 0.9) {
      faces.push({
        x: x + offset + random(-18, 18),
        y: y + random(-18, 18),
        r: cell * random(0.45, 0.7),
        rot: random(-0.9, 0.9),
        col: random(P),
        seed: random(1000),
        gap: random(0.24, 0.34),
        extra: random(1) < 0.12, // alguns rostos têm um terceiro olho
      });
    }
  }
}

function draw() {
  background('#f2c230');
  const t = frameCount * 0.01;
  for (const f of faces) {
    // rotação suavizada de volta ao valor-base + animação por noise
    f.rotShow = f.rot + (noise(f.seed, t * 0.5) - 0.5) * 0.4;
    drawFace(f, t);
  }
}

function drawFace(f, t) {
  // quão perto está o rato → olhos mais abertos ("pescam" a atenção)
  const d = dist(mouseX, mouseY, f.x, f.y);
  const attention = constrain(map(d, 0, 320, 0, 1), 0, 1);
  const lid = lerp(0.05, 0.62, attention) * map(noise(f.seed, t), 0, 1, 0.7, 1.2);

  // ângulo para o alvo, em coordenadas locais do rosto
  const ang = atan2(mouseY - f.y, mouseX - f.x) - f.rotShow;

  push();
  translate(f.x, f.y);
  rotate(f.rotShow);

  // cabeça orgânica (noise)
  stroke(25);
  strokeWeight(4);
  fill(f.col);
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.25) {
    const rr = f.r * (0.78 + 0.4 * noise(cos(a) + f.seed, sin(a) + f.seed, t * 0.3));
    vertex(rr * cos(a) * 0.78, rr * sin(a));
  }
  endShape(CLOSE);

  // olhos
  const ey = -f.r * 0.12;
  drawEye(-f.r * f.gap * 2, ey, f.r * 0.34, ang, lid, f.col);
  drawEye(f.r * f.gap * 2, ey, f.r * 0.34, ang, lid, f.col);
  if (f.extra) drawEye(0, -f.r * 0.45, f.r * 0.24, ang, lid, f.col);

  // boca
  noStroke();
  fill(25, 60);
  stroke(25);
  strokeWeight(3);
  fill('#7a1f3a');
  const my = f.r * 0.42;
  const open = 3 + attention * 0 + (1 - attention) * f.r * 0.12; // abre quando há atenção
  ellipse(0, my, f.r * 0.5, open);
  pop();
}

function drawEye(x, y, w, ang, lid, faceCol) {
  push();
  translate(x, y);
  const h = w * 0.5;
  const ctx = drawingContext;

  // amêndoa recortada
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.quadraticCurveTo(0, -h * 1.7, w, 0);
  ctx.quadraticCurveTo(0, h * 1.7, -w, 0);
  ctx.clip();

  noStroke();
  fill(250);
  rect(-w, -h * 2, w * 2, h * 4);
  // íris segue o alvo
  const ix = cos(ang) * w * 0.3;
  const iy = sin(ang) * h * 0.4;
  fill(20);
  circle(ix, iy, h * 1.1);
  fill(255);
  circle(ix - 3, iy - 3, h * 0.25);
  // pálpebra pesada
  fill(faceCol);
  rect(-w, -h * 2, w * 2, h * 2 * lid * 1.6);
  ctx.restore();

  // contorno + pestanas
    ctx.save();
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.quadraticCurveTo(0, -h * 1.7, w, 0);
  ctx.quadraticCurveTo(0, h * 1.7, -w, 0);
  ctx.strokeStyle = 'rgb(25,25,25)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  stroke(25);
  strokeWeight(2);
  for (let i = -3; i <= 3; i++) {
    const lx = i * w * 0.28;
    const ly = -h * 1.7 * 0.5 * (1 - sq(lx / w));
    line(lx, ly, lx * 1.1, ly - h * 0.35);
  }
  pop();
}

function mousePressed() {
  for (const f of faces) {
    if (dist(mouseX, mouseY, f.x, f.y) < 260) {
      f.rot += random(-1.2, 1.2);
      f.col = random(PALETTES[pal]);
    }
  }
}

function keyPressed() {
  if (key === ' ') { pal = (pal + 1) % PALETTES.length; buildFaces(); }
  if (key === '+') { cell = max(80, cell - 20); buildFaces(); }
  if (key === '-') { cell = min(260, cell + 20); buildFaces(); }
  if (key === 'r' || key === 'R') buildFaces();
  if (key === 's' || key === 'S') saveCanvas('olhares', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildFaces();
}