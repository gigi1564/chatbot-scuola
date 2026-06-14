// ===== Simulatore Campo Elettrico — Didattica GiGi =====
const KE = 8.99e9;

// ---------- Simulatore linee di campo (canvas, coordinate astratte) ----------
let charges = [];      // {x,y,q}  x,y in pixel logici; q = ±1 (adimensionale)
let tool = 1;          // segno carica da posizionare
let dragIdx = -1;
const cv = document.getElementById('field');
const ctx = cv.getContext('2d');

function setTool(s){
  tool = s;
  document.getElementById('btnPlus').classList.toggle('btn-primary', s===1);
  document.getElementById('btnPlus').classList.toggle('btn-ghost', s!==1);
  document.getElementById('btnMinus').classList.toggle('btn-primary', s===-1);
  document.getElementById('btnMinus').classList.toggle('btn-ghost', s!==-1);
}
function resetField(){ charges=[]; drawField(); }

function sizeCanvas(){
  const dpr=window.devicePixelRatio||1;
  cv.width=cv.clientWidth*dpr; cv.height=cv.clientHeight*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function fieldAt(px,py){
  let ex=0, ey=0;
  for(const c of charges){
    const dx=px-c.x, dy=py-c.y;
    let r2=dx*dx+dy*dy; if(r2<100) r2=100; // evita divergenza vicino alla carica
    const r=Math.sqrt(r2);
    const e=c.q/r2;
    ex+=e*dx/r; ey+=e*dy/r;
  }
  return [ex,ey];
}
function colorFor(mag){
  // mappa magnitudine -> ciano(basso) -> viola(alto)
  const t=Math.min(1, mag*9000);
  const r=Math.round(34+(139-34)*t);
  const g=Math.round(211+(92-211)*t);
  const b=Math.round(238+(255-238)*t);
  return `rgb(${r},${g},${b})`;
}
function drawArrows(W,H){
  const step=34;
  for(let x=step/2;x<W;x+=step){
    for(let y=step/2;y<H;y+=step){
      const [ex,ey]=fieldAt(x,y);
      const mag=Math.hypot(ex,ey);
      if(mag<1e-9) continue;
      const ux=ex/mag, uy=ey/mag;
      const len=Math.min(15, 6+mag*4000);
      const x2=x+ux*len, y2=y+uy*len;
      ctx.strokeStyle=colorFor(mag); ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke();
      // punta freccia
      const a=Math.atan2(uy,ux);
      ctx.beginPath(); ctx.moveTo(x2,y2);
      ctx.lineTo(x2-4*Math.cos(a-0.4), y2-4*Math.sin(a-0.4));
      ctx.lineTo(x2-4*Math.cos(a+0.4), y2-4*Math.sin(a+0.4));
      ctx.closePath(); ctx.fillStyle=colorFor(mag); ctx.fill();
    }
  }
}
function drawLines(W,H){
  // streamline dalle cariche positive
  ctx.strokeStyle='rgba(92,243,255,.55)'; ctx.lineWidth=1.2;
  const nLines=12;
  for(const c of charges){
    if(c.q<=0) continue;
    for(let i=0;i<nLines;i++){
      const ang=(2*Math.PI*i)/nLines;
      let x=c.x+12*Math.cos(ang), y=c.y+12*Math.sin(ang);
      ctx.beginPath(); ctx.moveTo(x,y);
      for(let step=0;step<260;step++){
        const [ex,ey]=fieldAt(x,y);
        const mag=Math.hypot(ex,ey); if(mag<1e-9) break;
        x+=2.2*ex/mag; y+=2.2*ey/mag;
        if(x<-20||x>W+20||y<-20||y>H+20) break;
        // ferma vicino a una carica negativa
        let near=false;
        for(const d of charges){ if(d.q<0 && Math.hypot(x-d.x,y-d.y)<10){near=true;break;} }
        ctx.lineTo(x,y);
        if(near) break;
      }
      ctx.stroke();
    }
  }
}
function drawCharges(){
  for(const c of charges){
    ctx.beginPath(); ctx.arc(c.x,c.y,12,0,2*Math.PI);
    ctx.fillStyle = c.q>0 ? '#ff6b6b' : '#5c9bff';
    ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 15px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(c.q>0?'+':'−', c.x, c.y);
  }
}
function drawField(){
  sizeCanvas();
  const W=cv.clientWidth, H=cv.clientHeight;
  ctx.clearRect(0,0,W,H);
  const mode=document.getElementById('mode').value;
  if(charges.length){
    if(mode==='both'||mode==='arrows') drawArrows(W,H);
    if(mode==='both'||mode==='lines') drawLines(W,H);
  }
  drawCharges();
  document.getElementById('qCount').textContent=charges.length;
}
function canvasPos(ev){
  const r=cv.getBoundingClientRect();
  const cx=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left;
  const cy=(ev.touches?ev.touches[0].clientY:ev.clientY)-r.top;
  return [cx,cy];
}
function onDown(ev){
  const [x,y]=canvasPos(ev);
  dragIdx=-1;
  for(let i=0;i<charges.length;i++){ if(Math.hypot(x-charges[i].x,y-charges[i].y)<16){dragIdx=i;return;} }
  if(charges.length<4){ charges.push({x,y,q:tool}); drawField(); }
}
function onMove(ev){
  if(dragIdx>=0){ if(ev.cancelable) ev.preventDefault(); const [x,y]=canvasPos(ev); charges[dragIdx].x=x; charges[dragIdx].y=y; drawField(); }
}
function onUp(){ dragIdx=-1; }
cv.addEventListener('mousedown', onDown);
cv.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
cv.addEventListener('touchstart', function(ev){ if(ev.cancelable) ev.preventDefault(); onDown(ev); }, {passive:false});
cv.addEventListener('touchmove', function(ev){ onMove(ev); }, {passive:false});
window.addEventListener('touchend', onUp);
window.addEventListener('resize', drawField);

// ---------- Calcolatore E nel punto P ----------
function unitToC(u){ return {mC:1e-3,'µC':1e-6,nC:1e-9,pC:1e-12}[u]; }
function unitToM(u){ return {m:1,cm:1e-2,mm:1e-3}[u]; }
function calcE(){
  const px=parseFloat(document.getElementById('px').value)*unitToM(document.getElementById('pu').value);
  const py=parseFloat(document.getElementById('py').value)*unitToM(document.getElementById('pu').value);
  let Ex=0, Ey=0; let rows=[];
  for(let i=1;i<=4;i++){
    const qv=parseFloat(document.getElementById('q'+i).value);
    if(!qv) continue;
    const q=qv*unitToC(document.getElementById('u'+i).value);
    const pu=unitToM(document.getElementById('p'+i).value);
    const cx=parseFloat(document.getElementById('x'+i).value)*pu;
    const cy=parseFloat(document.getElementById('y'+i).value)*pu;
    const dx=px-cx, dy=py-cy; const r2=dx*dx+dy*dy; const r=Math.sqrt(r2);
    if(r===0){ rows.push(`#${i}: punto coincidente con la carica (singolarità)`); continue; }
    const e=KE*q/r2; const exi=e*dx/r, eyi=e*dy/r;
    Ex+=exi; Ey+=eyi;
    rows.push(`#${i}: |E| = ${sci(Math.abs(e))} N/C, a r = ${fmtm(r)} m`);
  }
  const mag=Math.hypot(Ex,Ey);
  const ang=Math.atan2(Ey,Ex)*180/Math.PI;
  const box=document.getElementById('eres');
  if(mag===0 && rows.length===0){ box.innerHTML='<span class="muted">Nessuna carica attiva.</span>'; return; }
  box.innerHTML =
    `<div class="row"><b>Modulo |E| =</b> <span class="bigval">${sci(mag)} N/C</span></div>`+
    `<div class="row"><b>Componenti:</b> Eₓ = ${sci(Ex)} N/C · E_y = ${sci(Ey)} N/C</div>`+
    `<div class="row"><b>Angolo:</b> ${ang.toFixed(1)}° rispetto all'asse x</div>`+
    `<div class="row" style="margin-top:8px"><b>Contributi individuali:</b></div>`+
    rows.map(r=>`<div class="row muted">${r}</div>`).join('');
}
function sci(x){ if(!isFinite(x))return '∞'; if(x===0)return '0'; return x.toExponential(3); }
function fmtm(x){ return (Math.round(x*1000)/1000); }

// init
window.addEventListener('load', function(){ setTool(1); drawField(); });
