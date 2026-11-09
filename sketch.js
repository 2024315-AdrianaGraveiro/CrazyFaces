
/*
  MULTIDAO — Rostos em Movimento
  Projeto de Design de Inovacao
  p5.js

  INPUT:
  Movimento do rato e cliques.

  EXPRESSAO:
  Fragmentacao em quatro quadrantes,
  ecos visuais, transparencia e movimento.

  OUTPUT:
  Pintura digital interativa.
*/

let pintura;

// Dimensoes dos quadrantes
let margem = 12;
let espacamento = 12;

let larguraQ;
let alturaQ;

// Interacao entre quadrantes
let inicioPulso = -10000;
let quadranteOrigem = 0;

// Cores dos ecos
let cores = [
  [0, 220, 255],
  [255, 35, 145],
  [255, 180, 0],
  [90, 255, 150]
];

// Velocidade da animacao
let velocidade = 1;

function setup() {
  createCanvas(920, 1350);
  pintura = criarPinturaAlternativa();
  loadImage(
    "pintura.png",
    (imagem) => pintura = imagem,
    (erro) => console.error("Nao foi possivel carregar pintura.png:", erro)
  );

  larguraQ = (width - margem * 2 - espacamento) / 2;
  alturaQ = (height - margem * 2 - espacamento) / 2;

  imageMode(CORNER);
  noStroke();
}

function criarPinturaAlternativa() {
  let retrato = createGraphics(460, 675);

  retrato.background(22, 16, 42);
  retrato.noStroke();
  retrato.fill(255, 35, 145, 90);
  retrato.ellipse(110, 150, 210, 210);
  retrato.fill(0, 220, 255, 75);
  retrato.ellipse(360, 390, 260, 260);

  retrato.fill(38, 22, 48);
  retrato.ellipse(230, 315, 300, 385);
  retrato.fill(255, 180, 130);
  retrato.rect(185, 450, 90, 110, 36);
  retrato.ellipse(230, 320, 220, 300);

  retrato.fill(45, 24, 50);
  retrato.arc(230, 235, 230, 185, Math.PI, 0, CHORD);
  retrato.rect(115, 220, 230, 62);

  retrato.fill(255);
  retrato.ellipse(183, 320, 58, 34);
  retrato.ellipse(277, 320, 58, 34);
  retrato.fill(0, 220, 255);
  retrato.ellipse(183, 320, 25, 30);
  retrato.ellipse(277, 320, 25, 30);
  retrato.fill(22, 16, 42);
  retrato.ellipse(183, 320, 11, 20);
  retrato.ellipse(277, 320, 11, 20);

  retrato.noFill();
  retrato.stroke(255, 35, 145);
  retrato.strokeWeight(9);
  retrato.arc(183, 290, 65, 28, Math.PI, 0);
  retrato.arc(277, 290, 65, 28, Math.PI, 0);
  retrato.stroke(255, 180, 130);
  retrato.strokeWeight(7);
  retrato.line(230, 325, 210, 380);
  retrato.line(210, 380, 235, 386);
  retrato.stroke(255, 35, 145);
  retrato.strokeWeight(11);
  retrato.arc(230, 414, 80, 45, 0, Math.PI);

  return retrato;
}

function draw() {

  background(12, 9, 23);

  // Desenhar os quatro quadrantes
  for (let i = 0; i < 4; i++) {
    desenharQuadrante(i);
  }
}

// ----------------------------------
// DESENHAR CADA QUADRANTE
// ----------------------------------

function desenharQuadrante(i) {

  let coluna = i % 2;
  let linha = floor(i / 2);

  let x = margem + coluna * (larguraQ + espacamento);
  let y = margem + linha * (alturaQ + espacamento);

  // Centro do quadrante
  let centroX = x + larguraQ / 2;
  let centroY = y + alturaQ / 2;

  // Distancia entre rato e quadrante
  let distancia = dist(
    mouseX,
    mouseY,
    centroX,
    centroY
  );

  // Influencia do rato
  let influencia = exp(-distancia / 230);

  // Distancia entre o quadrante atual e a origem do clique
  let distanciaEntre = 
    abs(coluna - (quadranteOrigem % 2)) +
    abs(linha - floor(quadranteOrigem / 2));

  // O pulso propaga-se pelos quadrantes
  let idadePulso =
    millis() - inicioPulso - distanciaEntre * 200;

  let onda = 0;

  if (idadePulso > 0) {
    onda =
      exp(-idadePulso / 1300) *
      (0.5 + 0.5 * sin(idadePulso * 0.018));
  }

  // Movimento organico independente
  let tempo = frameCount * 0.025 * velocidade;

  let movimentoX =
    sin(tempo + i * 1.7) *
    (3 + influencia * 13 + onda * 18);

  let movimentoY =
    cos(tempo + i * 1.4) *
    (3 + influencia * 10 + onda * 15);

  // Regiao da imagem original correspondente
  let sx = coluna * pintura.width / 2;
  let sy = linha * pintura.height / 2;

  let sw = pintura.width / 2;
  let sh = pintura.height / 2;

  // Limitar efeitos ao quadrante
  drawingContext.save();

  drawingContext.beginPath();
  drawingContext.rect(
    x, y,
    larguraQ, alturaQ
  );

  drawingContext.clip();

  // ----------------------------------
  // IMAGEM ORIGINAL
  // ----------------------------------

  // Pequena respiracao de luminosidade
  let respiracao =
    sin(tempo + i) * 5;

  tint(
    255,
    255,
    255,
    250 + respiracao
  );

  image(
    pintura,
    x, y,
    larguraQ, alturaQ,
    sx, sy, sw, sh
  );

  noTint();

  // ----------------------------------
  // PRIMEIRO ECO — COLORIDO
  // ----------------------------------

  let alphaEco =
    15 +
    influencia * 65 +
    onda * 100 +
    (sin(tempo * 1.5 + i) + 1) * 12;

  alphaEco = constrain(alphaEco, 0, 125);

  tint(
    cores[i][0],
    cores[i][1],
    cores[i][2],
    alphaEco
  );

  image(
    pintura,
    x + movimentoX,
    y + movimentoY,
    larguraQ,
    alturaQ,
    sx, sy, sw, sh
  );

  noTint();

  // ----------------------------------
  // SEGUNDO ECO — DESVANECIMENTO
  // ----------------------------------

  let pulsacao =
    (sin(tempo * 0.8 + i * 2) + 1) / 2;

  let alphaDesvanecer =
    8 +
    pulsacao * 32 +
    influencia * 40 +
    onda * 65;

  alphaDesvanecer = constrain(
    alphaDesvanecer,
    0,
    105
  );

  tint(
    255,
    255,
    255,
    alphaDesvanecer
  );

  image(
    pintura,
    x - movimentoX * 1.6,
    y - movimentoY * 1.6,
    larguraQ,
    alturaQ,
    sx, sy, sw, sh
  );

  noTint();

  // ----------------------------------
  // TERCEIRO ECO — RASTO FANTASMA
  // ----------------------------------

  let alphaFantasma =
    10 + influencia * 45 + onda * 55;

  tint(
    cores[(i + 1) % 4][0],
    cores[(i + 1) % 4][1],
    cores[(i + 1) % 4][2],
    alphaFantasma
  );

  image(
    pintura,
    x + movimentoX * 2.2,
    y - movimentoY * 2.2,
    larguraQ,
    alturaQ,
    sx, sy, sw, sh
  );

  noTint();

  drawingContext.restore();

  // ----------------------------------
  // CONTORNO DOS QUADRANTES
  // ----------------------------------

  noFill();

  stroke(
    255,
    255,
    255,
    65 + onda * 100
  );

  strokeWeight(1);

  rect(
    x, y,
    larguraQ, alturaQ
  );

  noStroke();
}

// ----------------------------------
// INTERACAO COM O RATO
// ----------------------------------

function mousePressed() {

  let coluna = floor(
    (mouseX - margem) /
    (larguraQ + espacamento)
  );

  let linha = floor(
    (mouseY - margem) /
    (alturaQ + espacamento)
  );

  // Verificar se o clique foi dentro da pintura
  if (
    coluna >= 0 && coluna < 2 &&
    linha >= 0 && linha < 2
  ) {

    quadranteOrigem = linha * 2 + coluna;

    // Iniciar uma nova onda
    inicioPulso = millis();
  }
}

// ----------------------------------
// TECLAS DE INTERACAO
// ----------------------------------

function keyPressed() {

  // Aumentar velocidade
  if (key === " ") {
    velocidade = velocidade === 1 ? 2 : 1;
  }

  // Reiniciar animacao
  if (key === "r" || key === "R") {
    inicioPulso = -10000;
    velocidade = 1;
  }
}
