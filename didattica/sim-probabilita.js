// ===== Simulatori Probabilità — Didattica GiGi =====

// --- utilità ---
function factBig(n){ // fattoriale come Number (ok fino a ~170)
  let r=1; for(let i=2;i<=n;i++) r*=i; return r;
}
function fmt(x){
  if(!isFinite(x)) return "∞";
  if(x>=1e15||(x!==0&&Math.abs(x)<1e-4)) return x.toExponential(4);
  return (Math.round(x*10000)/10000).toLocaleString('it-IT');
}

// --- 1. Calcolatore combinatorio ---
function calcComb(){
  const n=parseInt(document.getElementById('cn').value);
  const k=parseInt(document.getElementById('ck').value);
  const setT=(id,v)=>document.getElementById(id).textContent=v;
  if(isNaN(n)||isNaN(k)||n<0||k<0){ setT('rPn','—');setT('rD','—');setT('rDr','—');setT('rC','—'); return; }
  setT('rPn', fmt(factBig(n)));
  if(k>n){ setT('rD','k>n'); setT('rC','k>n'); }
  else{
    setT('rD', fmt(factBig(n)/factBig(n-k)));
    setT('rC', fmt(factBig(n)/(factBig(k)*factBig(n-k))));
  }
  setT('rDr', fmt(Math.pow(n,k)));
}

// --- 6. Bayes ---
function calcBayes(){
  const prev=parseFloat(document.getElementById('prev').value)/100;
  const sens=parseFloat(document.getElementById('sens').value)/100;
  const fp=parseFloat(document.getElementById('fp').value)/100;
  document.getElementById('vPrev').textContent=(prev*100).toFixed(1)+'%';
  document.getElementById('vSens').textContent=(sens*100).toFixed(0)+'%';
  document.getElementById('vFp').textContent=(fp*100).toFixed(1)+'%';
  const pPos=sens*prev + fp*(1-prev);
  const post= pPos>0 ? (sens*prev)/pPos : 0;
  document.getElementById('bayesOut').textContent=(post*100).toFixed(1)+'%';
  let note="";
  if(post<0.5) note="Anche con test positivo, è più probabile NON essere malati: l'effetto della rarità della malattia domina.";
  else note="Con questa prevalenza, un test positivo rende la malattia più probabile che no.";
  document.getElementById('bayesNote').textContent=note;
}

// --- 7.1 Moneta ---
let coinH=0, coinT=0;
function simCoin(){
  const p=parseFloat(document.getElementById('coinP').value);
  const n=parseInt(document.getElementById('coinN').value);
  for(let i=0;i<n;i++){ if(Math.random()<p) coinH++; else coinT++; }
  const tot=coinH+coinT;
  document.getElementById('coinH').textContent=coinH;
  document.getElementById('coinT').textContent=coinT;
  document.getElementById('coinF').textContent= tot? (coinH/tot).toFixed(4):'–';
  document.getElementById('coinE').textContent= p.toFixed(4);
}
function resetCoin(){ coinH=0;coinT=0;
  document.getElementById('coinH').textContent='0';
  document.getElementById('coinT').textContent='0';
  document.getElementById('coinF').textContent='–';
  document.getElementById('coinE').textContent='–';
}

// --- 7.2 Dadi (istogramma) ---
function simDice(){
  const faces=parseInt(document.getElementById('diceType').value);
  const k=parseInt(document.getElementById('diceK').value);
  const n=parseInt(document.getElementById('diceN').value);
  const min=k, max=k*faces;
  const counts=new Array(max-min+1).fill(0);
  for(let i=0;i<n;i++){
    let s=0; for(let d=0;d<k;d++) s+=1+Math.floor(Math.random()*faces);
    counts[s-min]++;
  }
  drawBars('diceChart', counts, min);
}
function drawBars(canvasId, counts, labelStart){
  const cv=document.getElementById(canvasId);
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth, H=cv.clientHeight;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const maxC=Math.max(...counts,1);
  const pad=26, bw=(W-2*pad)/counts.length;
  ctx.font='10px system-ui'; ctx.textAlign='center';
  for(let i=0;i<counts.length;i++){
    const h=(counts[i]/maxC)*(H-2*pad);
    const x=pad+i*bw, y=H-pad-h;
    const grad=ctx.createLinearGradient(0,y,0,H-pad);
    grad.addColorStop(0,'#5cf3ff'); grad.addColorStop(1,'#3b82f6');
    ctx.fillStyle=grad;
    ctx.fillRect(x+1,y,Math.max(bw-2,1),h);
    if(counts.length<=20){ ctx.fillStyle='#9db1d6'; ctx.fillText(labelStart+i, x+bw/2, H-pad+12); }
  }
  ctx.strokeStyle='rgba(110,160,255,.3)'; ctx.beginPath();
  ctx.moveTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
}

// --- 7.3 Carte ---
function buildDeck(){ // 52 carte: valore 1..13, seme 0..3 (0=cuori)
  const d=[]; for(let s=0;s<4;s++) for(let v=1;v<=13;v++) d.push({v,s}); return d;
}
function simCards(){
  const k=parseInt(document.getElementById('cardK').value);
  const rep=document.getElementById('cardRep').value==='1';
  const n=parseInt(document.getElementById('cardN').value);
  let aceRounds=0, heartRounds=0;
  for(let g=0; g<n; g++){
    let deck=buildDeck();
    let hasAce=false, hasHeart=false;
    for(let e=0;e<k;e++){
      let idx=Math.floor(Math.random()*deck.length);
      const c=deck[idx];
      if(c.v===1) hasAce=true;
      if(c.s===0) hasHeart=true;
      if(!rep) deck.splice(idx,1);
    }
    if(hasAce) aceRounds++;
    if(hasHeart) heartRounds++;
  }
  document.getElementById('cardAce').textContent=aceRounds;
  document.getElementById('cardF').textContent=(aceRounds/n).toFixed(4);
  document.getElementById('cardHearts').textContent=(heartRounds/n).toFixed(4);
}

// init
window.addEventListener('load', function(){ calcComb(); calcBayes(); });
