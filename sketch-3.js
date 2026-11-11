// Faces em Sintonia — p5.js 1.x. Código assistido por AI.
// Imagem: imagemfinal/finalfaces.jpg
// D: editor | S: exportar contornos | L: importar.
// Cada cara pisca aleatoriamente, com os seus olhos sincronizados.
// Limitação: mantém a reconstrução visual da versão anterior.
// Os contornos iniciais são aproximações e exigem afinação.
const BASE_W=1376, BASE_H=768;
const dados=[[66, 73, 45, 24, -30], [142, 39, 47, 23, -20], [227, 53, 38, 18, 8], [272, 80, 40, 20, 23], [47, 166, 28, 19, -8], [92, 171, 29, 19, -8], [172, 234, 38, 22, -30], [231, 218, 39, 21, -15], [333, 125, 39, 19, 8], [398, 143, 41, 20, 13], [501, 120, 40, 29, 0], [564, 130, 49, 27, 2], [613, 232, 36, 20, 21], [657, 260, 35, 20, 25], [782, 221, 39, 28, -35], [832, 184, 42, 25, -25], [911, 120, 44, 25, -30], [975, 79, 48, 24, -20], [1068, 87, 33, 18, -17], [1121, 79, 33, 17, 0], [1203, 105, 48, 27, -15], [1288, 116, 53, 26, 8], [1350, 181, 29, 17, 17], [83, 385, 69, 27, 0], [186, 409, 69, 29, 10], [388, 383, 48, 28, -42], [466, 352, 55, 23, -8], [579, 471, 39, 23, -35], [643, 425, 43, 22, -20], [847, 416, 54, 27, -28], [935, 371, 52, 24, -28], [1039, 310, 39, 21, 17], [1091, 327, 36, 22, 18], [1173, 421, 62, 30, -35], [1265, 367, 68, 31, -25], [752, 494, 31, 18, -10], [788, 475, 29, 18, -25], [1007, 459, 41, 23, -12], [1060, 472, 43, 23, 8], [1116, 542, 30, 18, -36], [1149, 517, 30, 18, -25], [63, 622, 31, 25, -42], [122, 593, 43, 22, -20], [291, 504, 40, 24, 25], [352, 540, 40, 26, 45], [298, 646, 36, 22, -20], [361, 654, 26, 31, -20], [433, 598, 72, 23, 0], [567, 600, 72, 22, 0], [809, 605, 41, 22, 0], [898, 609, 47, 23, -5], [1006, 647, 57, 20, -4], [1147, 647, 51, 20, -4], [1227, 650, 41, 29, -40], [1307, 616, 65, 27, -15]];
let olhos=dados.map(([x,y,w,h,a])=>({x,y,w,h,a,
  pontos:[[-w/2,0],[-w*.23,-h*.67],[w*.23,-h*.67],
          [w/2,0],[w*.23,h*.67],[-w*.23,h*.67]]}));
const gruposDeOlhos=[
  [0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],
  [16,17],[18,19],[20,21],[22,23],[24],[25,26],[27,28],
  [29,30],[31,32],[33,34],[35,36],[37,38],[39,40],
  [41,42],[43,44],[45,46],[47,48],[49,50],[51,52],[53,54]
];
let estadosDasCaras=[];
let imagem,pronta=false,erro=false,editor=false;
let alvoOlhar=null;
let selecionado=0,arrastar=-1,inputJSON;
const STORAGE='faces-contornos-v2';

function setup(){
  const c=createCanvas(800,450);
  cursor('none');
  const main=document.querySelector('main');
  if(main)c.parent(main);
  pixelDensity(1);
  try{
    const guardados=JSON.parse(localStorage.getItem(STORAGE));
    if(validar(guardados))olhos=guardados;
  }catch(e){console.warn(e);}
  inputJSON=createFileInput(carregarJSON);
  inputJSON.attribute('accept','.json');inputJSON.hide();
  loadImage('imagemfinal/finalfaces.jpg',img=>{
    imagem=img;prepararCores();prepararCoresDasIris();ajustar();pronta=true;
  },e=>{erro=true;console.error(e);});
}
function validar(v){
  return Array.isArray(v)&&v.length===dados.length&&v.every(o=>
    ['x','y','w','h','a'].every(k=>Number.isFinite(o[k]))&&
    Array.isArray(o.pontos)&&o.pontos.length===6&&
    o.pontos.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)));
}
function prepararCores(){
  for(const o of olhos){
    if(o.cor)continue;
    const a=o.a*Math.PI/180,d=o.h*1.15;
    const x=constrain(Math.round((o.x+Math.sin(a)*d)/BASE_W*imagem.width),0,imagem.width-1);
    const y=constrain(Math.round((o.y-Math.cos(a)*d)/BASE_H*imagem.height),0,imagem.height-1);
    o.cor=imagem.get(x,y);
  }
}
function prepararCoresDasIris(){
  imagem.loadPixels();
  for(const o of olhos){
    const angulo=o.a*Math.PI/180,cos=Math.cos(angulo),sin=Math.sin(angulo);
    const xs=o.pontos.map(p=>p[0]),ys=o.pontos.map(p=>p[1]);
    const cores=new Map();
    for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++){
      for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++){
        let dentro=false;
        for(let i=0,j=o.pontos.length-1;i<o.pontos.length;j=i++){
          const [xi,yi]=o.pontos[i],[xj,yj]=o.pontos[j];
          if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)dentro=!dentro;
        }
        if(!dentro)continue;
        const ix=Math.round((o.x+x*cos-y*sin)/BASE_W*imagem.width);
        const iy=Math.round((o.y+x*sin+y*cos)/BASE_H*imagem.height);
        if(ix<0||iy<0||ix>=imagem.width||iy>=imagem.height)continue;
        const indice=4*(iy*imagem.width+ix);
        const r=imagem.pixels[indice],g=imagem.pixels[indice+1],b=imagem.pixels[indice+2];
        const max=Math.max(r,g,b),min=Math.min(r,g,b);
        if(max<55||max-min<35)continue;
        const delta=max-min;
        let hue;
        if(max===r)hue=((g-b)/delta+6)%6;
        else if(max===g)hue=(b-r)/delta+2;
        else hue=(r-g)/delta+4;
        const chave=Math.floor(hue*10)%60;
        if(!cores.has(chave))cores.set(chave,{n:0,r:0,g:0,b:0});
        const grupo=cores.get(chave);
        grupo.n++;grupo.r+=r;grupo.g+=g;grupo.b+=b;
      }
    }
    let dominante=null;
    for(const grupo of cores.values()){
      if(!dominante||grupo.n>dominante.n)dominante=grupo;
    }
    o.corIris=dominante
      ? [dominante.r,dominante.g,dominante.b].map(v=>Math.round(v/dominante.n))
      : [80,80,80];
  }
}
function draw(){
  background(24);
  if(!pronta){
    fill(255);noStroke();textAlign(CENTER,CENTER);
    text(erro?'Verifica imagemfinal/finalfaces.jpg':'A carregar...',width/2,height/2);
    return;
  }
  push();scale(width/BASE_W,height/BASE_H);
  image(imagem,0,0,BASE_W,BASE_H);
  if(!editor){
    // Atualiza cada cara uma única vez por frame, mantendo o par sincronizado.
    const fechos=atualizarPiscares();
    olhos.forEach((o,i)=>desenharOlho(o,fechos[i]||0));
  }else desenharEditor();
  pop();
  if(editor){
    noStroke();fill(0,210);rect(0,0,width,48);
    fill(255);textAlign(LEFT,TOP);textSize(12);
    text(`EDITOR — olho ${selecionado+1}/${olhos.length}: clica num olho e arrasta os pontos.\nD: animação | S: exportar contornos | L: importar`,8,7);
  }
  desenharPincel();
}
function desenharPincel(){
  if(mouseX<0||mouseY<0||mouseX>width||mouseY>height)return;
  push();
  translate(mouseX,mouseY);
  rotate(-Math.PI/4);
  stroke('#3a2115');strokeWeight(1.5);strokeJoin(ROUND);
  fill('#f28a20');
  beginShape();
  vertex(8,-3);vertex(29,-3);vertex(33,0);vertex(29,3);vertex(8,3);
  endShape(CLOSE);
  noStroke();fill('#ffc04a');rect(15,-1.5,13,1.2,1);
  stroke('#3a2115');strokeWeight(1.5);
  fill('#d7d0bc');rect(7,-4,4,8,1);
  fill('#f28a20');
  beginShape();
  vertex(7,-3.5);vertex(3,-3);vertex(0,0);vertex(3,3);vertex(7,3.5);
  endShape(CLOSE);
  line(2,-1.5,2,1.5);
  pop();
}
function atualizarPiscares(){
  const agora=millis();
  if(estadosDasCaras.length===0){
    estadosDasCaras=gruposDeOlhos.map(()=>({
      inicio:agora+random(300,2200),duracao:random(180,280)
    }));
  }
  const fechos=Array(olhos.length).fill(0);
  gruposDeOlhos.forEach((grupo,i)=>{
    const estado=estadosDasCaras[i];
    if(agora<estado.inicio)return;
    const progresso=(agora-estado.inicio)/estado.duracao;
    if(progresso>=1){
      estado.inicio=agora+random(900,3500);
      estado.duracao=random(180,280);
      return;
    }
    const t=progresso<.4?progresso/.4:progresso<.6?1:(1-progresso)/.4;
    const fecho=t*t*(3-2*t);
    grupo.forEach(indice=>{fechos[indice]=fecho;});
  });
  return fechos;
}
function contextoOlho(o){translate(o.x,o.y);rotate(radians(o.a));}
function caminho(ctx,p){
  ctx.beginPath();ctx.moveTo(...p[0]);
  ctx.bezierCurveTo(...p[1],...p[2],...p[3]);
  ctx.bezierCurveTo(...p[4],...p[5],...p[0]);ctx.closePath();
}
function ratoLocal(o){
  const alvo=!editor&&alvoOlhar
    ? alvoOlhar
    : [mouseX/width*BASE_W,mouseY/height*BASE_H];
  const dx=alvo[0]-o.x,dy=alvo[1]-o.y;
  const a=radians(o.a);
  return[dx*Math.cos(a)+dy*Math.sin(a),-dx*Math.sin(a)+dy*Math.cos(a)];
}
function centroCara(grupo){
  const olhosDaCara=grupo.map(i=>olhos[i]);
  const x=olhosDaCara.reduce((s,o)=>s+o.x,0)/olhosDaCara.length;
  const y=olhosDaCara.reduce((s,o)=>s+o.y,0)/olhosDaCara.length;
  const altura=olhosDaCara.reduce((s,o)=>s+o.h,0)/olhosDaCara.length;
  return [x,constrain(y+altura*2,0,BASE_H)];
}
function desenharOlho(o,f){
  push();contextoOlho(o);
  const ctx=drawingContext,p=o.pontos;
  ctx.save();caminho(ctx,p);ctx.clip();
  // Interior reconstruído, com a cor da íris amostrada da imagem original.
  noStroke();fill(249,239,218);rect(-BASE_W,-BASE_H,BASE_W*2,BASE_H*2);
  const[mx,my]=ratoLocal(o);
  const ang=Math.atan2(my,mx),alcance=Math.min(Math.hypot(mx,my)/180,1);
  const px=Math.cos(ang)*o.w*.17*alcance,py=Math.sin(ang)*o.h*.16*alcance;
  fill(o.corIris||[80,80,80]);ellipse(px,py,o.h*1.04,o.h*1.08);
  fill(24,30,31);ellipse(px,py,o.h*.79,o.h*.92);
  fill(255,245,224);ellipse(px-o.h*.12,py-o.h*.16,o.h*.14,o.h*.14);
  const mistura=(a,b)=>[lerp(a[0],b[0],f),lerp(a[1],b[1],f)];
  const c1=mistura(p[1],p[5]),c2=mistura(p[2],p[4]);
  if(f>0){
    ctx.beginPath();ctx.moveTo(...p[0]);
    ctx.bezierCurveTo(...p[1],...p[2],...p[3]);
    ctx.bezierCurveTo(...c2,...c1,...p[0]);ctx.closePath();
    fill(o.cor);ctx.fill();
  }
  ctx.restore();ctx.strokeStyle='#28151b';ctx.lineWidth=1.8;
  caminho(ctx,p);ctx.stroke();
  if(f>0){
    ctx.beginPath();ctx.moveTo(...p[0]);
    ctx.bezierCurveTo(...c1,...c2,...p[3]);ctx.stroke();
  }
  pop();
}
function desenharEditor(){
  olhos.forEach((o,i)=>{
    push();contextoOlho(o);
    const ctx=drawingContext;
    caminho(ctx,o.pontos);ctx.strokeStyle=i===selecionado?'#ffff00':'#00ffb0';
    ctx.lineWidth=i===selecionado?2:1;ctx.stroke();
    if(i===selecionado){
      stroke(255,200,0);strokeWeight(1);
      const p=o.pontos;
      line(...p[0],...p[1]);line(...p[2],...p[3]);
      line(...p[3],...p[4]);line(...p[5],...p[0]);
      p.forEach((v,j)=>{fill(j===0||j===3?'#ff4545':'#ffff00');noStroke();circle(v[0],v[1],9);});
    }
    pop();
  });
}
function mousePressed(){
  if(!pronta||mouseX<0||mouseY<0||mouseX>width||mouseY>height)return;
  if(!editor){
    const x=mouseX/width*BASE_W,y=mouseY/height*BASE_H;
    let menor=Infinity;
    for(const grupo of gruposDeOlhos){
      const centro=centroCara(grupo);
      const distancia=Math.hypot(x-centro[0],y-centro[1]);
      if(distancia<menor){menor=distancia;alvoOlhar=centro;}
    }
    return;
  }
  if(mouseY<48)return;
  const o=olhos[selecionado],q=ratoLocal(o),limite=12*BASE_W/width;
  arrastar=o.pontos.findIndex(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<limite);
  if(arrastar>=0)return;
  let menor=Infinity;
  olhos.forEach((e,i)=>{
    const d=Math.hypot(mouseX/width*BASE_W-e.x,mouseY/height*BASE_H-e.y);
    if(d<menor){menor=d;selecionado=i;}
  });
}
function mouseDragged(){
  if(editor&&arrastar>=0){
    const o=olhos[selecionado];o.pontos[arrastar]=ratoLocal(o);return false;
  }
}
function mouseReleased(){
  if(arrastar>=0){
    prepararCoresDasIris();
    try{localStorage.setItem(STORAGE,JSON.stringify(olhos));}catch(e){console.warn(e);}
  }
  arrastar=-1;
}
function keyPressed(){
  if(key===' '){alvoOlhar=null;return false;}
  if(key==='d'||key==='D'){
    editor=!editor;arrastar=-1;
    if(!editor){prepararCoresDasIris();estadosDasCaras=[];}
  }
  if(editor&&(key==='s'||key==='S'))saveJSON(olhos,'contornos-olhos.json');
  if(editor&&(key==='l'||key==='L'))inputJSON.elt.click();
}
function carregarJSON(file){
  try{
    const v=typeof file.data==='string'?JSON.parse(file.data):file.data;
    if(!validar(v))throw Error('Estrutura inválida');
    olhos=v;prepararCores();prepararCoresDasIris();localStorage.setItem(STORAGE,JSON.stringify(olhos));
  }catch(e){alert('Não foi possível importar os contornos.');console.error(e);}
}
function ajustar(){
  const w=Math.max(1,Math.min(windowWidth-40,1200));resizeCanvas(w,w*BASE_H/BASE_W);
}
function windowResized(){if(pronta)ajustar();}