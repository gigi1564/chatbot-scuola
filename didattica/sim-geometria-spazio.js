// ===== Simulatori 3D Geometria dello Spazio — Didattica GiGi (Three.js r128) =====
let scene, camera, renderer, world, objGroup;
let rotX=-0.5, rotY=0.6, camDist=14;
const host = document.getElementById('scene3d');

function v(id){ return parseFloat(document.getElementById(id).value)||0; }
function setRes(html){ document.getElementById('gres').innerHTML=html; }

function initScene(){
  scene=new THREE.Scene();
  const W=host.clientWidth, H=host.clientHeight;
  camera=new THREE.PerspectiveCamera(45, W/H, 0.1, 1000);
  renderer=new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(W,H); renderer.setClearColor(0x000000,0);
  host.appendChild(renderer.domElement);

  world=new THREE.Group(); scene.add(world);
  addAxes(world, 5);
  objGroup=new THREE.Group(); world.add(objGroup);

  scene.add(new THREE.AmbientLight(0xffffff,0.85));
  const dl=new THREE.DirectionalLight(0xffffff,0.6); dl.position.set(5,10,7); scene.add(dl);

  // interazione
  let dragging=false, lx=0, ly=0;
  const dn=(e)=>{dragging=true; const p=pt(e); lx=p.x; ly=p.y; host.style.cursor='grabbing';};
  const mv=(e)=>{ if(!dragging)return; const p=pt(e); rotY+=(p.x-lx)*0.01; rotX+=(p.y-ly)*0.01; lx=p.x; ly=p.y; };
  const up=()=>{dragging=false; host.style.cursor='grab';};
  host.addEventListener('mousedown',dn); window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
  host.addEventListener('touchstart',dn,{passive:true}); host.addEventListener('touchmove',mv,{passive:true}); window.addEventListener('touchend',up);
  host.addEventListener('wheel',(e)=>{ e.preventDefault(); camDist*=(e.deltaY>0?1.1:0.9); camDist=Math.max(5,Math.min(40,camDist)); },{passive:false});
  window.addEventListener('resize',onResize);
  animate();
}
function pt(e){ const t=e.touches?e.touches[0]:e; return {x:t.clientX,y:t.clientY}; }
function onResize(){ if(!renderer)return; const W=host.clientWidth,H=host.clientHeight; camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H); }
function animate(){
  requestAnimationFrame(animate);
  world.rotation.x=rotX; world.rotation.y=rotY;
  camera.position.set(0,0,camDist); camera.lookAt(0,0,0);
  renderer.render(scene,camera);
}
function resetView(){ rotX=-0.5; rotY=0.6; camDist=14; }

function addAxes(g, L){
  const ax=[[ [ -L,0,0],[L,0,0],0xff6b6b ], [ [0,-L,0],[0,L,0],0x7df9c0 ], [ [0,0,-L],[0,0,L],0x5c9bff ]];
  for(const [a,b,col] of ax){
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);
    g.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:col})));
  }
}
function clearObj(){ while(objGroup.children.length) objGroup.remove(objGroup.children[0]); }
function arrow(dir,origin,len,color){ return new THREE.ArrowHelper(dir.clone().normalize(), origin, len, color, len*0.18, len*0.10); }
function sphere(p,color,r){ const m=new THREE.Mesh(new THREE.SphereGeometry(r||0.12,16,16),new THREE.MeshLambertMaterial({color:color})); m.position.copy(p); return m; }

// ---- modi ----
function switchMode(){
  const m=document.getElementById('mode').value;
  document.querySelectorAll('.panel-mode').forEach(p=>p.classList.remove('active'));
  document.getElementById('p-'+(m==='plane3'?'plane3':m)).classList.add('active');
}
function visualize(){
  clearObj();
  const m=document.getElementById('mode').value;
  if(m==='plane') doPlane();
  else if(m==='plane3') doPlane3();
  else if(m==='line') doLine();
  else if(m==='cross') doCross();
}

function addPlane(nrm, point, color, size){
  const n=nrm.clone().normalize();
  const geo=new THREE.PlaneGeometry(size||7,size||7);
  const mat=new THREE.MeshLambertMaterial({color:color,transparent:true,opacity:0.32,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geo,mat);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), n);
  mesh.quaternion.copy(q); mesh.position.copy(point);
  objGroup.add(mesh);
}

function doPlane(){
  const a=v('pa'),b=v('pb'),c=v('pc'),d=v('pd');
  const L=Math.hypot(a,b,c);
  if(L===0){ setRes('Vettore normale nullo: piano non definito.'); return; }
  const n=new THREE.Vector3(a,b,c);
  const p0=n.clone().normalize().multiplyScalar(-d/L);
  addPlane(n,p0,0x22d3ee);
  objGroup.add(arrow(n,p0,2.5,0x8b5cff));
  objGroup.add(sphere(p0,0xffffff));
  setRes(`<div class="row"><b>Equazione:</b> ${a}x + ${b}y + ${c}z + ${d} = 0</div>`+
    `<div class="row"><b>Vettore normale:</b> n = (${a}, ${b}, ${c})</div>`+
    `<div class="row"><b>Distanza dall'origine:</b> ${(Math.abs(d)/L).toFixed(3)}</div>`);
}
function doPlane3(){
  const A=new THREE.Vector3(v('ax'),v('ay'),v('az'));
  const B=new THREE.Vector3(v('bx'),v('by'),v('bz'));
  const C=new THREE.Vector3(v('cx'),v('cy'),v('cz'));
  const AB=B.clone().sub(A), AC=C.clone().sub(A);
  const n=AB.clone().cross(AC);
  if(n.length()===0){ setRes('Punti allineati: piano non definito.'); return; }
  // triangolo
  const tg=new THREE.BufferGeometry().setFromPoints([A,B,C]);
  tg.setIndex([0,1,2]); tg.computeVertexNormals();
  objGroup.add(new THREE.Mesh(tg,new THREE.MeshLambertMaterial({color:0x22d3ee,transparent:true,opacity:0.5,side:THREE.DoubleSide})));
  addPlane(n,A,0x22d3ee);
  [A,B,C].forEach(P=>objGroup.add(sphere(P,0xffffff)));
  objGroup.add(arrow(n,A,2.5,0x8b5cff));
  const d=-(n.x*A.x+n.y*A.y+n.z*A.z);
  setRes(`<div class="row"><b>Normale n = AB×AC =</b> (${n.x}, ${n.y}, ${n.z})</div>`+
    `<div class="row"><b>Equazione piano:</b> ${n.x}x + ${n.y}y + ${n.z}z + ${d} = 0</div>`+
    `<div class="row"><b>Area triangolo:</b> ${(n.length()/2).toFixed(3)}</div>`);
}
function doLine(){
  const A=new THREE.Vector3(v('lax'),v('lay'),v('laz'));
  const B=new THREE.Vector3(v('lbx'),v('lby'),v('lbz'));
  const dir=B.clone().sub(A);
  if(dir.length()===0){ setRes('A e B coincidenti: retta non definita.'); return; }
  const u=dir.clone().normalize();
  const p1=A.clone().add(u.clone().multiplyScalar(-6));
  const p2=A.clone().add(u.clone().multiplyScalar(6));
  const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]);
  objGroup.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x22d3ee})));
  objGroup.add(sphere(A,0xffffff)); objGroup.add(sphere(B,0xffd27d));
  objGroup.add(arrow(dir,A,Math.min(dir.length(),4),0x8b5cff));
  setRes(`<div class="row"><b>Vettore direttore v = B−A =</b> (${dir.x}, ${dir.y}, ${dir.z})</div>`+
    `<div class="row"><b>Parametriche:</b> x=${A.x}+${dir.x}t, y=${A.y}+${dir.y}t, z=${A.z}+${dir.z}t</div>`);
}
function doCross(){
  const u=new THREE.Vector3(v('ux'),v('uy'),v('uz'));
  const w=new THREE.Vector3(v('vx'),v('vy'),v('vz'));
  const c=u.clone().cross(w);
  const O=new THREE.Vector3(0,0,0);
  if(u.length()>0) objGroup.add(arrow(u,O,u.length(),0x22d3ee));
  if(w.length()>0) objGroup.add(arrow(w,O,w.length(),0x7df9c0));
  if(c.length()>0) objGroup.add(arrow(c,O,c.length(),0x8b5cff));
  // parallelogramma
  const u2=u.clone().add(w);
  const pg=new THREE.BufferGeometry().setFromPoints([O,u,u2,w]);
  pg.setIndex([0,1,2, 0,2,3]); pg.computeVertexNormals();
  objGroup.add(new THREE.Mesh(pg,new THREE.MeshLambertMaterial({color:0x22d3ee,transparent:true,opacity:0.25,side:THREE.DoubleSide})));
  const theta = (u.length()&&w.length()) ? Math.acos(Math.max(-1,Math.min(1,u.dot(w)/(u.length()*w.length()))))*180/Math.PI : 0;
  setRes(`<div class="row"><b>u×v =</b> (${c.x}, ${c.y}, ${c.z})</div>`+
    `<div class="row"><b>|u×v| =</b> ${c.length().toFixed(3)} (area parallelogramma)</div>`+
    `<div class="row"><b>Area triangolo:</b> ${(c.length()/2).toFixed(3)} · <b>angolo u,v:</b> ${theta.toFixed(1)}°</div>`);
}

window.addEventListener('load', function(){ initScene(); visualize(); });
