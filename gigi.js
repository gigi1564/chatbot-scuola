// ===== Effetto rete neurale di sfondo =====
(function(){
  const cv=document.getElementById('neural'), ctx=cv.getContext('2d');
  let w,h,nodes;
  function resize(){
    w=cv.width=window.innerWidth; h=cv.height=window.innerHeight;
    const count=Math.min(80,Math.floor(w*h/16000));
    nodes=Array.from({length:count},function(){return {x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45};});
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    for(const n of nodes){ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; }
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if(d<130){ ctx.strokeStyle="rgba(34,211,238,"+(.16*(1-d/130))+")"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
    }
    for(const n of nodes){ ctx.fillStyle="rgba(92,243,255,.7)"; ctx.beginPath(); ctx.arc(n.x,n.y,1.6,0,Math.PI*2); ctx.fill(); }
    requestAnimationFrame(step);
  }
  window.addEventListener("resize",resize);
  resize(); step();
})();

// ===== Demo chat di GiGi (risposte dimostrative; Fase 2: da knowledge base) =====
const RISPOSTE = [
  {k:["iscriv","iscrizion","iscriver"], a:"Le iscrizioni si effettuano online sul portale del Ministero nei periodi stabiliti ogni anno. Sul sito trovi la guida passo-passo e il codice meccanografico: [link]. Per assistenza puoi scrivere alla segreteria a [email]. Vuoi i requisiti o le scadenze?"},
  {k:["indirizz","studio","corso","liceo","tecnico"], a:"Il nostro istituto propone diversi indirizzi di studio: [elenco indirizzi]. Per ciascuno trovi quadro orario e sbocchi nella sezione Offerta Formativa: [link]. Se mi dici cosa ti interessa, ti indico l'indirizzo più adatto."},
  {k:["assenz","giustific"], a:"Le assenze si giustificano [tramite registro elettronico / libretto], secondo il regolamento d'istituto: [link]. Se hai problemi con le credenziali, scrivi alla segreteria a [email]. Ti serve la procedura passo-passo?"},
  {k:["credenzial","registro","password","accesso"], a:"Per il recupero delle credenziali del registro occorre rivolgersi alla segreteria, che gestisce gli accessi: [email] / [telefono]. Per sicurezza non inserire qui dati personali. Vuoi il link alla pagina del registro?"},
  {k:["stem","laboratori","robotica","informatica","scienz"], a:"Sì! L'istituto ha laboratori e progetti in area STEM (es. informatica, robotica, fisica). Le attività sono descritte qui: [link]. Se ti interessa un progetto specifico, ti indico la pagina o il docente referente."},
  {k:["pago","tassa","pagamento","contribut","costo","quanto cost"], a:"I pagamenti si effettuano tramite PagoPA dalla sezione dedicata: [link]. Gli importi possono variare di anno in anno: ti conviene verificarli sulla pagina ufficiale o chiedere alla segreteria a [email]."},
  {k:["certificat","modulo","nulla osta","trasferiment"], a:"I certificati e i moduli si richiedono alla segreteria didattica: [link]. Tempi e modalità sono indicati nella stessa pagina. Posso aiutarti a trovare il documento giusto?"},
  {k:["calendar","quando inizi","vacanz","festiv","orario lezion"], a:"Il calendario scolastico con inizio lezioni, festività e sospensioni è pubblicato qui: [link]. Sono date che possono aggiornarsi, quindi ti consiglio di confermarle su quella pagina."}
];
const FALLBACK = "Su questo non ho un'informazione certa e preferisco non darti un dato sbagliato. Puoi scrivere alla segreteria a [email] (tel. [numero]) oppure compilare il modulo di contatto qui sotto. Vuoi che ti indichi la pagina giusta?";
const VIETATO = "Non posso fornire dati personali di singoli studenti o del personale. Queste informazioni si trovano nel registro elettronico con le proprie credenziali, oppure puoi chiederle alla segreteria a [email].";

// GiGi: personalità mista 70% Tutor (neutro, sobrio, senza emoji) + 30% Lei (cortese).
function voceGiGi(t){
  return t.replace(/\s*[🙂👍⚡✨]+/gu,"").replace(/Sì!/g,"Sì, certo.").replace(/!+/g,".");
}
function aggiungi(testo, chi){
  const body=document.getElementById('chatBody');
  const d=document.createElement('div');
  d.className='b '+chi;
  d.textContent=testo;
  body.appendChild(d);
  body.scrollTop=body.scrollHeight;
}
function rispondi(q){
  const t=q.toLowerCase();
  let base;
  if(/(voti|quante assenze|mio figlio|mia figlia|numero di|telefono del prof|indirizzo di casa)/.test(t)) base=VIETATO;
  else { base=FALLBACK; for(const r of RISPOSTE){ if(r.k.some(function(x){return t.includes(x);})){ base=r.a; break; } } }
  return voceGiGi(base);
}
function ask(q){
  aggiungi(q,'user');
  setTimeout(function(){aggiungi(rispondi(q),'bot');},420);
}
function sendMsg(e){
  e.preventDefault();
  const inp=document.getElementById('chatInput');
  const v=inp.value.trim();
  if(!v) return false;
  ask(v);
  inp.value='';
  return false;
}
function submitForm(e){
  e.preventDefault();
  document.getElementById('formMsg').style.display='block';
  e.target.reset();
  return false;
}
