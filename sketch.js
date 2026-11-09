// OLHARES — artefacto digital interativo em p5.js
// Input: imagem (paleta), rato, microfone, tempo (noise)
// Expressão: módulos de olhos que se repetem, rodam em passos de 45° e combinam
// Output: mural generativo interativo, exportável em PNG
//
// Controlos:
//   rato      -> os olhos seguem e "acordam" quando te aproximas
//   M         -> ativar microfone (som abre os olhos, dilata pupilas, faz tremer)
//   clique    -> nova composição (nova semente)
//   1 / 2 / 3 -> layout: grelha / hexagonal / espalhado
//   ↑ / ↓     -> densidade (tamanho dos módulos)
//   S         -> guardar PNG

let img, imgOk = false, paleta = [], modulos = [];
const FICHEIRO_IMAGEM = 'finalfaces_-1.jpg'; // muda aqui se o nome do ficheiro for outro
let mic, micLigado = false, nivel = 0;
let modo = 0, semente = 1, passo = 150;
const CONTORNO = [20, 10, 25];

function preload() {
  img = loadImage(
    FICHEIRO_IMAGEM,
    () => { imgOk = true; },
    () => { console.error('Imagem não encontrada: ' + FICHEIRO_IMAGEM + ' (confirma o nome e a pasta)'); }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  extrairPaleta();
  construir();
}

// Input 1: a imagem -> paleta de cores saturadas
function extrairPaleta() {
  paleta = [];
  let tentativas = 0;
  while (imgOk && paleta.length < 12 && tentativas < 5000) {
    tentativas++;
    let c = img.get(floor(random(img.width)), floor(random(img.height)));
    let r = c[0], g = c[1], b = c[2];
    let sat = max(r, g, b) - min(r, g, b);
    if (sat < 90 || max(r, g, b) < 120) continue; // ignora contornos e cores baças
    let distinta = paleta.every(p => dist(r, g, b, p[0], p[1], p[2]) > 70);
    if (distinta) paleta.push([r, g, b]);
  }
  // segurança: se a paleta ficar curta, acrescenta cores base
  let reserva = [[230, 80, 30], [30, 160, 90], [40, 90, 200], [220, 40, 90], [250, 200, 30]];
  while (paleta.length < 5) paleta.push(reserva[paleta.length % reserva.length]);
}

function construir() {
  randomSeed(semente);
  noiseSeed(semente);
  modulos = [];
  let cols = ceil(width / passo) + 1;
  let rows = ceil(height / passo) + 1;

  if (modo === 2) {
    for (let i = 0; i < cols * rows * 0.8; i++) {
      modulos.push(new Modulo(random(width), random(height), passo * random(0.9, 1.8)));
    }
  } else {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let desfasar = (modo === 1 && j % 2) ? passo / 2 : 0;
        modulos.push(new Modulo(i * passo + desfasar, j * passo, passo * random(0.95, 1.3)));
      }
    }
  }
}

function draw() {
  // Input 2: som (com alternativa por noise se o microfone estiver desligado)
  let alvo = micLigado ? mic.getLevel() * 8 : noise(frameCount * 0.01) * 0.25;
  nivel = lerp(nivel, constrain(alvo, 0, 1), 0.1);

  background(paleta[0][0] * 0.35, paleta[0][1] * 0.35, paleta[0][2] * 0.35);
  desenharOndas();
  for (let m of modulos) m.mostrar();

  if (!imgOk) {
    fill(255);
    noStroke();
    textSize(16);
    text('Imagem não carregada: a usar paleta de reserva (' + FICHEIRO_IMAGEM + ')', 20, height - 20);
  }
}

// fundo ondulado, inspirado nas linhas fluidas da pintura
function desenharOndas() {
  noFill();
  strokeWeight(passo * 0.35);
  for (let k = 0; k < 7; k++) {
    stroke(paleta[(k + 2) % paleta.length]);
    beginShape();
    for (let x = -20; x <= width + 20; x += 30) {
      let y = (k + 0.5) * height / 7 + (noise(x * 0.004, k * 10, frameCount * 0.004) - 0.5) * 250;
      curveVertex(x, y);
    }
    endShape();
  }
}

class Modulo {
  constructor(x, y, tam) {
    this.x = x;
    this.y = y;
    this.tam = tam;
    this.pele = random(paleta);
    this.palpebra = random(paleta);
    this.iris = random(paleta);
    // rotação modular: múltiplos de 45°
    this.rotBase = floor(random(8)) * QUARTER_PI;
    this.n = random(1000);
  }

  mostrar() {
    // proximidade ao rato: os olhos "acordam" quando te aproximas
    let d = dist(mouseX, mouseY, this.x, this.y);
    let perto = map(d, 0, 450, 1, 0.12, true);
    let respirar = noise(this.n, frameCount * 0.01) * 0.3;
    let ab = constrain(perto + nivel * 1.5 + respirar - 0.15, 0.08, 1);

    // tremor/rotação extra com o som
    let rot = this.rotBase + (noise(this.n + 50, frameCount * 0.008) - 0.5) * (0.3 + nivel * 2);

    push();
    translate(this.x, this.y);
    rotate(rot);
    scale(this.tam / 120);

    this.rosto();
    this.olho(ab, rot);
    pop();
  }

  // forma orgânica do "rosto-azulejo"
  rosto() {
    fill(this.pele);
    stroke(CONTORNO);
    strokeWeight(5);
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.4) {
      let r = 68 + (noise(this.n + cos(a) * 0.8, sin(a) * 0.8) - 0.5) * 40;
      curveVertex(cos(a) * r, sin(a) * r * 1.1);
    }
    endShape(CLOSE);
  }

  olho(ab, rot) {
    // olho em amêndoa
    fill(255);
    stroke(CONTORNO);
    strokeWeight(5);
    beginShape();
    vertex(-50, 0);
    bezierVertex(-25, -40 * ab, 25, -40 * ab, 50, 0);
    bezierVertex(25, 28 * ab, -25, 28 * ab, -50, 0);
    endShape(CLOSE);

    // íris segue o rato (corrigindo a rotação do módulo)
    let ang = atan2(mouseY - this.y, mouseX - this.x) - rot;
    let ox = cos(ang) * 14;
    let oy = sin(ang) * 14 * ab;
    let alt = min(34, 70 * ab);
    fill(this.iris);
    ellipse(ox, oy, 34, alt);
    fill(CONTORNO);
    ellipse(ox, oy, 14 + nivel * 20, min(14 + nivel * 20, alt * 0.8)); // pupila dilata com o som

    // pálpebra pesada
    fill(this.palpebra);
    beginShape();
    vertex(-54, 0);
    bezierVertex(-25, -50 * ab - 10, 25, -50 * ab - 10, 54, 0);
    bezierVertex(25, -40 * ab, -25, -40 * ab, -54, 0);
    endShape(CLOSE);

    // pestanas
    strokeWeight(3);
    for (let i = -3; i <= 3; i++) {
      let x = i * 15;
      let y = -30 * ab * (1 - (x / 54) ** 2) - 6;
      line(x, y, x + i * 2, y - 10);
    }
  }
}

function mousePressed() {
  semente++;
  construir();
}

function keyPressed() {
  userStartAudio();
  if (key === 'm' || key === 'M') { mic.start(); micLigado = true; }
  if (key === 's' || key === 'S') saveCanvas('olhares', 'png');
  if (key === '1') { modo = 0; construir(); }
  if (key === '2') { modo = 1; construir(); }
  if (key === '3') { modo = 2; construir(); }
  if (keyCode === UP_ARROW) { passo = min(passo + 20, 300); construir(); }
  if (keyCode === DOWN_ARROW) { passo = max(passo - 20, 70); construir(); }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  construir();
}