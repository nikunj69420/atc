'use strict';
const $=id=>document.getElementById(id),canvas=$('radar'),ctx=canvas.getContext('2d');
const DEFAULT_ZOOM=1.25;
let sim,level='easy',selected=null,plot=null,points=[],hover=null,paused=false,rate=1,last=0,w=0,h=0,scale=1,cx=0,cy=0,uiTimer=0,zoom=DEFAULT_ZOOM,baseScale=1,panX=0,panY=0;
const colors={arrival:'#e9c76a',departure:'#6dbbef',transferred:'#74b59c'};
let drag=null,suppressClick=false;
function screen(p){return {x:cx+p.x*scale,y:cy-p.y*scale};}function world(p){return{x:(p.x-cx)/scale,y:(cy-p.y)/scale};}
function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=devicePixelRatio||1;canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);baseScale=Math.min(w/91,h/86);applyView();}
function applyView(){scale=baseScale*zoom;cx=w*.47+panX;cy=h*.52+panY;$('zoom-reset').textContent=Math.round(zoom*100)+'%';$('map-scale').textContent='SCROLL TO ZOOM · RANGE '+Math.round(80/zoom)+' NM';}
function zoomAt(factor,p={x:w/2,y:h/2}){const anchor=world(p);zoom=Math.max(.65,Math.min(5,zoom*factor));scale=baseScale*zoom;panX=p.x-anchor.x*scale-w*.47;panY=p.y+anchor.y*scale-h*.52;applyView();hideMenu();}
$('zoom-in').onclick=()=>zoomAt(1.25);
$('zoom-out').onclick=()=>zoomAt(1/1.25);
$('zoom-reset').onclick=()=>{zoom=DEFAULT_ZOOM;panX=panY=0;applyView();};
$('traffic-toggle').onclick=()=>{const panel=$('traffic-panel');panel.hidden=!panel.hidden;$('traffic-toggle').setAttribute('aria-expanded',String(!panel.hidden));};
canvas.addEventListener('wheel',e=>{if(!sim||!$('guide').hidden)return;e.preventDefault();zoomAt(Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*.002),local(e));},{passive:false});
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=b.dataset.level;document.querySelector('.workloads .selected').classList.remove('selected');b.classList.add('selected');});
$('start').onclick=()=>{sim=new ATC.Simulation(level);zoom=DEFAULT_ZOOM;panX=panY=0;$('traffic-panel').hidden=true;$('traffic-toggle').setAttribute('aria-expanded','false');$('home').hidden=true;$('game').hidden=false;$('level-label').textContent=level.toUpperCase();paused=false;rate=1;selected=null;plot=null;points=[];$('pause').textContent='Ⅱ PAUSE';$('rate').textContent='1×';$('menu').hidden=true;resize();updateUI();};
$('exit').onclick=e=>{e.preventDefault();$('game').hidden=true;$('home').hidden=false;sim=null;};
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'▶ RESUME':'Ⅱ PAUSE';};
$('rate').onclick=()=>{rate=rate===1?2:rate===2?4:1;$('rate').textContent=rate+'×';};
$('help').onclick=()=>{$('guide').hidden=false;};$('close-guide').onclick=()=>{$('guide').hidden=true;};
window.addEventListener('resize',resize);
function path(coords,stroke,fill){ctx.beginPath();coords.forEach((p,i)=>{const q=screen({x:p[0],y:p[1]});i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function text(t,x,y,color='#607b80',size=9){ctx.fillStyle=color;ctx.font=size+'px "IBM Plex Mono",monospace';ctx.fillText(t,x,y);}
function draw(){ctx.clearRect(0,0,w,h);ctx.lineWidth=1;
 // Stylised west coast and Mumbai's island chain, in nautical miles around VABB.
 path([[8,46],[7,35],[3,28],[5,23],[2,18],[4,13],[1,9],[-1,6],[-2,2],[-3,-2],[-5,-6],[-5,-12],[-3,-15],[-1,-10],[1,-8],[4,-9],[5,-13],[4,-19],[7,-24],[9,-31],[11,-44],[60,-44],[60,46]],'#274248','#12262b');
 path([[6,14],[8,9],[6,4],[9,-1],[7,-6],[10,-13],[12,-18],[11,-26]],'#243c42');
 for(let x=-40;x<=40;x+=10){path([[x,-45],[x,45]],'#192c32');path([[-48,x],[48,x]],'#192c32');}
 for(const radius of [10,20,30,40]){ctx.beginPath();ctx.arc(cx,cy,radius*scale,0,Math.PI*2);ctx.strokeStyle='#35505455';ctx.stroke();text(radius+' NM',cx+radius*scale+3,cy+12,'#3e5b60',8);}
 ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(cx,cy,43*scale,0,Math.PI*2);ctx.strokeStyle='#47645e';ctx.stroke();ctx.setLineDash([]);
 let p=screen({x:-24,y:4});text('A R A B I A N   S E A',p.x,p.y,'#37545e',10);p=screen({x:8,y:-7});text('MUMBAI',p.x,p.y,'#47656a',10);p=screen({x:21,y:-13});text('NAVI MUMBAI',p.x,p.y,'#365057',8);
 // Westbound runway 27 and its extended localiser, east of the threshold.
 ctx.setLineDash([7,5]);path([[0,0],[28,0]],'#79a88b88');ctx.setLineDash([]);path([[0,0],[25,1.6]],'#74b59c22');path([[0,0],[25,-1.6]],'#74b59c22');
 for(const x of [5,10,15,20,25])path([[x,-.35],[x,.35]],'#668f7b');
 ctx.lineWidth=4;path([[-1.9,0],[0,0]],'#b2c4bf');ctx.lineWidth=2;path([[-1.2,-.8],[-.1,1.4]],'#5a7778');ctx.lineWidth=1;
 p=screen({x:-2,y:-2.4});text('VABB  /  RWY 27',p.x,p.y,'#a5b9b3',9);p=screen({x:15,y:-2.1});text('ILS 27 · 109.5',p.x,p.y,'#638b78',8);
 for(const f of ATC.fixes){if(f.name==='BOM')continue;const p=screen(f);ctx.beginPath();ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x+4,p.y+3);ctx.lineTo(p.x-4,p.y+3);ctx.closePath();ctx.strokeStyle='#577a7b';ctx.stroke();text(f.name,p.x+8,p.y+3,'#638184',8);}
 for(const a of sim.aircraft){let color=a.conflict?'#ff8d7e':a.transferred?colors.transferred:colors[a.kind];
 if(a===selected&&a.route.length){ctx.setLineDash([4,4]);path([[a.x,a.y],...a.route.map(p=>[p.x,p.y])],color+'99');ctx.setLineDash([]);for(const q of a.route){const p=screen(q);ctx.strokeStyle=color;ctx.strokeRect(p.x-3,p.y-3,6,6);}}
 a.trail.forEach((p,i)=>{if(i%8)return;const q=screen(p);ctx.fillStyle=color+'55';ctx.fillRect(q.x-1,q.y-1,2,2);});
 const p=screen(a);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a.heading*Math.PI/180);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,6);ctx.moveTo(-5,1);ctx.lineTo(0,-2);ctx.lineTo(5,1);ctx.moveTo(-2.5,5);ctx.lineTo(2.5,5);ctx.stroke();ctx.restore();ctx.lineWidth=1;
 if(a===selected){ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.strokeStyle=color+'99';ctx.stroke();}
 const dx=p.x>w-135?-112:16;ctx.strokeStyle=color+'66';ctx.beginPath();ctx.moveTo(p.x+Math.sign(dx)*7,p.y-5);ctx.lineTo(p.x+dx,p.y-17);ctx.stroke();text(a.call+' '+a.type,p.x+dx,p.y-20,color,10);text(String(Math.round(a.alt/100)).padStart(3,'0')+'  '+Math.round(a.speed)+'  '+(a.transferred?'TWR':a.established?a.clearance:a.clearance?'CLR '+a.clearance:a.kind==='arrival'?'↓':'↑'),p.x+dx,p.y-7,color,9);
 }
 if(plot){const coords=[[plot.x,plot.y],...points.map(p=>[p.x,p.y])];if(hover)coords.push([hover.x,hover.y]);ctx.setLineDash([5,4]);path(coords,'#f4e5b3');ctx.setLineDash([]);for(const q of points){const p=screen(q);ctx.strokeStyle='#f4e5b3';ctx.strokeRect(p.x-3,p.y-3,6,6);}}
}
function updateUI(){if(!sim)return;$('traffic-count').textContent=sim.aircraft.length;$('handled').textContent=sim.handled;$('clock').textContent=new Date(Date.UTC(2026,0,1,10,0,sim.time)).toISOString().slice(11,19)+' UTC';$('flight-list').replaceChildren();for(const a of sim.aircraft){const b=document.createElement('button');b.className='flight '+a.kind+(a===selected?' active':'')+(a.transferred?' transferred':'');b.innerHTML='<span>'+a.call+'<small>'+a.type+' · '+(a.transferred?'TOWER':a.established?a.clearance+' EST':a.kind.toUpperCase())+'</small></span><span>'+Math.round(a.alt).toLocaleString()+'<small>'+Math.round(a.speed)+' KT</small></span>';b.onclick=()=>{selected=a;updateUI();};b.oncontextmenu=e=>{e.preventDefault();openMenu(a,{x:20,y:100});};$('flight-list').append(b);}$('log').replaceChildren(...sim.events.slice(0,5).map(e=>{const d=document.createElement('div');d.textContent=e;return d;}));$('alert').hidden=!sim.conflicts.length;$('alert').textContent='⚠ SEPARATION · '+sim.conflicts.join(' · ');$('status').textContent=paused?'SIMULATION PAUSED':sim.conflicts.length?'Separation alert — issue corrective vectors or altitude.':plot?'Plotting '+plot.call+' · double click the last point to confirm.':'Maintain a safe, orderly flow.';}
function local(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function hit(p){return sim.aircraft.map(a=>({a,d:Math.hypot(screen(a).x-p.x,screen(a).y-p.y)})).filter(v=>v.d<20).sort((a,b)=>a.d-b.d)[0]?.a;}
function hideMenu(){$('menu').hidden=true;}function cancelPlot(){plot=null;points=[];$('route-hint').hidden=true;}
function snap(p){const q=world(p),fix=ATC.fixes.find(f=>ATC.distance(q,f)*scale<13);return fix?{x:fix.x,y:fix.y,name:fix.name}:q;}
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0||!sim||!$('guide').hidden)return;
 suppressClick=false;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX,panY,moved:false};
 canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(!drag.moved&&Math.hypot(dx,dy)<5)return;
 drag.moved=true;suppressClick=true;hideMenu();
 panX=drag.panX+dx;panY=drag.panY+dy;applyView();
 hover=snap(local(e));canvas.classList.add('panning');
});
function endPan(e){
 if(!drag||drag.id!==e.pointerId)return;
 if(drag.moved)suppressClick=true;
 drag=null;canvas.classList.remove('panning');
 if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
}
canvas.addEventListener('pointerup',endPan);
canvas.addEventListener('pointercancel',endPan);
canvas.addEventListener('lostpointercapture',endPan);
canvas.addEventListener('click',e=>{if(suppressClick){suppressClick=false;return;}if(!sim||!$('guide').hidden)return;hideMenu();const p=local(e);if(plot){const q=snap(p);if(!points.length||ATC.distance(q,points.at(-1))>.15)points.push(q);return;}const a=hit(p);selected=a||null;if(a&&!a.transferred&&!a.established){plot=a;points=[];$('route-hint').hidden=false;}updateUI();});
canvas.addEventListener('dblclick',e=>{if(!plot||!points.length)return;sim.setRoute(plot,points);cancelPlot();updateUI();});
canvas.addEventListener('mousemove',e=>{hover=snap(local(e));});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();if(!sim||!$('guide').hidden)return;cancelPlot();const p=local(e),a=hit(p);if(a){selected=a;openMenu(a,p);}else hideMenu();updateUI();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelPlot();hideMenu();$('guide').hidden=true;}});
document.addEventListener('pointerdown',e=>{if(!$('menu').contains(e.target)&&e.target!==canvas)hideMenu();});
function openMenu(a,p){const menu=$('menu');menu.replaceChildren();if(a.transferred){hideMenu();return;}const title=document.createElement('h3');title.textContent=a.call+' / '+a.type;menu.append(title);
 const action=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{fn();hideMenu();updateUI();};menu.append(b);};
 if(a.established&&a.clearance==='ILS'){const note=document.createElement('p');note.textContent='ILS 27 ESTABLISHED · Automatic descent and speed control.';menu.append(note);action('TRANSFER TO TOWER · 118.1',()=>sim.transfer(a));}
 else{for(const [label,key,min,max,step,unit] of [['ALTITUDE','targetAlt',2000,16000,1000,' FT'],['SPEED','targetSpeed',140,300,10,' KT']]){const l=document.createElement('label');l.textContent=label+' · SCROLL TO ADJUST';const s=document.createElement('select');s.setAttribute('aria-label',label);const any=document.createElement('option');any.value='';any.textContent='UNRESTRICTED';s.append(any);for(let n=min;n<=max;n+=step){const o=document.createElement('option');o.value=n;o.textContent=n.toLocaleString()+unit;s.append(o);}s.value=a[key]===null?'':String(a[key]);s.onchange=()=>{sim.command(a,key,s.value===''?null:Number(s.value));updateUI();};s.addEventListener('wheel',e=>{e.preventDefault();s.selectedIndex=Math.max(0,Math.min(s.options.length-1,s.selectedIndex+(e.deltaY>0?-1:1)));s.dispatchEvent(new Event('change'));},{passive:false});l.append(s);menu.append(l);}
 if(a.kind==='arrival'){action((a.clearance==='LOC'?'✓ ':'')+'CLEAR LOCALISER · RWY 27',()=>sim.clear(a,'LOC'));action((a.clearance==='ILS'?'✓ ':'')+'CLEAR ILS APPROACH · RWY 27',()=>sim.clear(a,'ILS'));}}
 menu.hidden=false;menu.style.left=Math.max(8,Math.min(w-menu.offsetWidth-8,p.x+15))+'px';menu.style.top=Math.max(8,Math.min(h-menu.offsetHeight-8,p.y+10))+'px';}
function frame(now){const elapsed=Math.min((now-last)/1000,.1);last=now;if(sim&&!$('game').hidden){if(!paused){let remaining=elapsed*rate;while(remaining>0){const dt=Math.min(remaining,.1);sim.step(dt);remaining-=dt;}if(selected&&!sim.aircraft.includes(selected)){if(plot===selected)cancelPlot();selected=null;hideMenu();}}draw();uiTimer+=elapsed;if(uiTimer>.4){updateUI();uiTimer=0;}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
