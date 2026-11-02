(function(root){
'use strict';
// Gameplay fixes, distributed across entry routes, downwind and final approach.
const fixes=[
 {name:'ALFA',x:-26,y:19},{name:'BOM',x:0,y:0},
 {name:'BETEL',x:26,y:23},{name:'GAMMA',x:34,y:3},
 {name:'DOLSI',x:24,y:-20},{name:'ELMON',x:-13,y:-29},
 {name:'FALCO',x:-33,y:-9},{name:'NORTH',x:4,y:33},
 {name:'ARION',x:-15,y:24},{name:'BAYEN',x:-29,y:5},
 {name:'CORAL',x:-20,y:-13},{name:'DELTA',x:-5,y:17},
 {name:'EMBER',x:9,y:22},{name:'FINCH',x:19,y:14},
 {name:'GROVE',x:30,y:13},{name:'HAVEN',x:13,y:8},
 {name:'IVORY',x:23,y:7},{name:'JASPER',x:26,y:-7},
 {name:'KORAL',x:15,y:-8},{name:'LOTUS',x:5,y:-17},
 {name:'MAPLE',x:-7,y:-13},{name:'NIMBUS',x:15,y:-26},
 {name:'FINAL',x:8,y:0},{name:'INTER',x:18,y:0}
];
// Fictional runway 27 procedures for this game's waypoint network.
const procedures=[
 {id:'BETEL1A',kind:'STAR',name:'BETEL 1A',legs:[['BETEL',7000,250],['GROVE',6000,230],['IVORY',4000,210],['INTER',3000,180],['FINAL',2500,160]]},
 {id:'GAMMA1A',kind:'STAR',name:'GAMMA 1A',legs:[['GAMMA',6000,250],['IVORY',4000,210],['INTER',3000,180],['FINAL',2500,160]]},
 {id:'DOLSI1A',kind:'STAR',name:'DOLSI 1A',legs:[['DOLSI',7000,250],['JASPER',4000,210],['INTER',3000,180],['FINAL',2500,160]]},
 {id:'ARION1A',kind:'STAR',name:'ARION 1A',legs:[['ARION',8000,250],['EMBER',7000,250],['GROVE',6000,230],['IVORY',4000,210],['INTER',3000,180],['FINAL',2500,160]]},
 {id:'ALFA1D',kind:'SID',name:'ALFA 1D',legs:[['WEST',4000,210],['BAYEN',7000,250],['ALFA',10000,250],['NWOUT',14000,280]]},
 {id:'CORAL1D',kind:'SID',name:'CORAL 1D',legs:[['WEST',4000,210],['CORAL',7000,250],['ELMON',10000,250],['SWOUT',14000,280]]},
 {id:'FALCO1D',kind:'SID',name:'FALCO 1D',legs:[['WEST',4000,210],['BAYEN',7000,250],['FALCO',10000,250],['WEXIT',14000,280]]}
];
fixes.push({name:'WEST',x:-9,y:0},{name:'NWOUT',x:-35,y:36},{name:'SWOUT',x:-30,y:-41},{name:'WEXIT',x:-49,y:-9});
function procedureRoute(id){const p=procedures.find(p=>p.id===id);return p?p.legs.map(([name,alt,speed])=>({...fixes.find(f=>f.name===name),alt,speed})):[];}
const fleet=[['IGO','A320',250,140],['AIC','A321',250,145],['AKJ','B738',250,145],['UAE','B77W',250,150],['ETD','B789',250,145],['QTR','A359',250,145],['AXB','B738',250,145],['SVA','B789',250,145]];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angleDiff=(a,b)=>((a-b+540)%360)-180;
const approachSpeed=(a,x=a.x)=>x>10?180:x>5?160:a.landingSpeed;
function touchdownSeconds(a){
 if(!a.established||a.kind!=='arrival'||a.x<=0)return null;
 let x=a.x,speed=Math.max(1,a.speed),seconds=0;
 // Forecast using the same staged ILS speeds and acceleration as the simulation.
 while(x>0&&seconds<3600){const target=a.clearance==='ILS'?approachSpeed(a,x):(a.targetSpeed??250);speed+=Math.max(-1.5,Math.min(1.2,target-speed));const dt=Math.min(1,x*3600/Math.max(1,speed));x-=speed/3600*dt;seconds+=dt;}
 return seconds;
}
function aircraftLabel(a){
 const altitude=String(Math.round(a.alt/100)).padStart(3,'0');
 const status=a.transferred?'TWR':a.established?a.clearance+' EST':a.clearance?'CLR '+a.clearance:a.kind==='arrival'?'↓':'↑';
 return [a.call+' '+a.type,altitude+'  '+Math.round(a.speed)+'  '+status];
}

const stormTemplates=[{id:'CB01',x:-17,y:10,radius:4.2,vx:5,vy:1.5},{id:'CB02',x:22,y:-15,radius:4.8,vx:-3,vy:2},{id:'CB03',x:20,y:22,radius:3.8,vx:-4,vy:-2},{id:'CB04',x:-21,y:-20,radius:4.4,vx:3,vy:2}];
class Simulation{
 constructor(level='easy',random=Math.random){this.random=random;this.level=level;this.aircraft=[];this.time=0;this.handled=0;this.serial=0;this.spawnTimer=0;this.events=[];this.conflicts=[];this.weatherAlerts=[];this.storms=stormTemplates.slice(0,{easy:2,medium:3,hard:4}[level]).map(s=>({...s}));const n={easy:4,medium:7,hard:10}[level];for(let i=0;i<n;i++)this.spawn(i);}
 sequence(){return this.aircraft.filter(a=>a.kind==='arrival'&&a.established&&a.x>0).sort((a,b)=>a.x-b.x).map((a,i,all)=>({aircraft:a,position:i+1,distance:a.x,gap:i? a.x-all[i-1].x:null,eta:touchdownSeconds(a),estimated:a.clearance!=='ILS'}));}
 emit(message){this.events.unshift(message);this.events=this.events.slice(0,8);}
 spawn(index){const i=index??this.serial;const f=fleet[this.serial%fleet.length];const arrival=this.serial%4!==3;const positions=[{x:32,y:23,h:220},{x:36,y:-17,h:310},{x:-24,y:25,h:105},{x:-3,y:-1,h:270},{x:20,y:31,h:180},{x:30,y:-29,h:340},{x:-30,y:-20,h:65},{x:-6,y:0,h:270},{x:38,y:9,h:265},{x:-15,y:33,h:140}];const p=positions[i%positions.length];const a={id:++this.serial,call:f[0]+(210+Math.floor(this.random()*700)+this.serial),type:f[1],kind:arrival?'arrival':'departure',x:p.x,y:p.y,heading:p.h,alt:arrival?6000+(i%3)*1000:2400,speed:arrival?250:190,targetAlt:null,targetSpeed:null,route:[],trail:[],clearance:null,established:false,transferred:false,landingSpeed:f[3],conflict:false};this.aircraft.push(a);this.emit(a.call+' checked in · '+(arrival?'arrival':'departure'));return a;}
 endProcedure(a){if(a.procedure?.via){if(a.targetAlt===null)a.targetAlt=a.alt;if(a.targetSpeed===null)a.targetSpeed=a.speed;}a.procedure=null;}
 setRoute(a,points){if(a.transferred||a.established)return;this.endProcedure(a);a.route=points.map(p=>({...p}));this.emit(a.call+' radar vectors · '+points.length+' points');}
 assignProcedure(a,id,via=false,joinIndex=0){const p=procedures.find(p=>p.id===id);if(!p||a.transferred||a.established||(p.kind==='STAR')!==(a.kind==='arrival')||!Number.isInteger(joinIndex)||joinIndex<0||joinIndex>=p.legs.length)return false;
  a.route=procedureRoute(id).slice(joinIndex);a.procedure={id,name:p.name,kind:p.kind,via,completed:false};this.emit(a.call+' cleared '+p.name+' '+p.kind+' via '+a.route[0].name+(via?' · '+(p.kind==='STAR'?'descend':'climb')+' via':' · lateral only'));return true;
 }
 cancelProcedure(a){if(a.transferred||a.established||!a.procedure)return false;this.endProcedure(a);a.route=[];this.emit(a.call+' procedure cancelled · maintain heading');return true;}
 command(a,key,value){if(a.transferred||a.established&&a.clearance==='ILS')return;a[key]=value;this.emit(a.call+' '+(key==='targetAlt'?'altitude ':'speed ')+(value===null?'unrestricted':value+(key==='targetAlt'?' FT':' KT')));}
 clear(a,kind){if(a.kind!=='arrival'||a.transferred)return;a.clearance=kind;this.emit(a.call+' cleared '+kind+' runway 27');}
 transfer(a){if(!a.established||a.clearance!=='ILS'||a.transferred)return;a.transferred=true;this.emit(a.call+' transferred to Mumbai tower');this.handled++;}
 step(dt){this.time+=dt;this.spawnTimer+=dt;for(const s of this.storms){s.x+=s.vx/3600*dt;s.y+=s.vy/3600*dt;if(Math.abs(s.x)>34)s.vx=-Math.sign(s.x)*Math.abs(s.vx);if(Math.abs(s.y)>30)s.vy=-Math.sign(s.y)*Math.abs(s.vy);}const interval={easy:130,medium:85,hard:55}[this.level];if(this.spawnTimer>interval&&this.aircraft.length<18){this.spawnTimer=0;this.spawn();}
 for(const a of [...this.aircraft]){const prev={x:a.x,y:a.y};a.trail.push(prev);if(a.trail.length>80)a.trail.shift();
 let desired=a.heading;if(a.established)desired=270;else if(a.route.length){const p=a.route[0];const capture=a.procedure?Math.max(.4,a.speed/3600/(3*Math.PI/180)):.3;if(distance(a,p)<Math.max(capture,a.speed/3600*dt*1.5)){a.route.shift();if(a.procedure){this.emit(a.call+' passed '+p.name);if(!a.route.length){a.procedure.completed=true;if(a.procedure.via){if(a.targetAlt===null)a.targetAlt=p.alt;if(a.targetSpeed===null)a.targetSpeed=p.speed;}this.emit(a.call+' '+a.procedure.name+' complete · '+(a.kind==='arrival'?'await approach clearance':'continue en route'));}}}if(a.route.length){const p=a.route[0];desired=(Math.atan2(p.x-a.x,p.y-a.y)*180/Math.PI+360)%360;}}
 a.heading=(a.heading+Math.max(-3*dt,Math.min(3*dt,angleDiff(desired,a.heading)))+360)%360;
 let ta=a.targetAlt??(a.kind==='departure'?14000:6000);let ts=a.targetSpeed??(a.kind==='departure'?(a.alt<10000?250:280):250);
 if(a.procedure?.via&&a.route.length){const leg=a.route[0];if(a.targetAlt===null)ta=leg.alt;if(a.targetSpeed===null)ts=Math.min(leg.speed,a.alt<10000?250:300);}
 if(a.established&&a.clearance==='ILS'){ta=Math.min(a.alt,Math.max(38,a.x*318+38));ts=approachSpeed(a);}
 a.alt+=Math.max(-1500/60*dt,Math.min(1800/60*dt,ta-a.alt));a.speed+=Math.max(-1.5*dt,Math.min(1.2*dt,ts-a.speed));
 const r=a.heading*Math.PI/180;a.x+=Math.sin(r)*a.speed/3600*dt;a.y+=Math.cos(r)*a.speed/3600*dt;
 if(a.kind==='arrival'&&a.clearance&&!a.established&&a.x>=2&&a.x<=25&&a.alt<=4000&&Math.abs(angleDiff(a.heading,270))<=60&&((prev.y*a.y<=0)||Math.abs(a.y)<.22)){
 a.established=true;a.y=0;a.heading=270;a.route=[];if(a.procedure)a.procedure.completed=true;this.emit(a.call+' '+a.clearance+' established');}
 if(a.established)a.y=0;
 if((a.established&&a.x<=0)||Math.hypot(a.x,a.y)>49){this.aircraft=this.aircraft.filter(b=>b!==a);if(!a.transferred){if(a.kind==='departure'){this.handled++;this.emit(a.call+' left sector · en route');}else this.emit(a.call+(a.established?' landed without tower handoff':' left controlled airspace'));}}
 }
 this.weatherAlerts=[];for(const a of this.aircraft){const cell=this.storms.find(s=>distance(a,s)<s.radius);const near=cell||this.storms.find(s=>distance(a,s)<s.radius+3);const prior=a.weather;a.weather=cell?'CORE':near?'NEAR':null;if(a.weather!==prior&&a.weather)this.emit(a.call+' '+(cell?'entered storm core':'near storm')+' · '+near.id);if(near)this.weatherAlerts.push(a.call+' · '+near.id+' '+(cell?'CORE':'NEAR'));}
 this.conflicts=[];for(const a of this.aircraft)a.conflict=false;for(let i=0;i<this.aircraft.length;i++)for(let j=i+1;j<this.aircraft.length;j++){const a=this.aircraft[i],b=this.aircraft[j];if(distance(a,b)<3&&Math.abs(a.alt-b.alt)<1000){a.conflict=b.conflict=true;this.conflicts.push(a.call+' / '+b.call);}}
 }
}
const api={Simulation,fixes,procedures,procedureRoute,distance,angleDiff,touchdownSeconds,aircraftLabel};if(typeof module!=='undefined')module.exports=api;root.ATC=api;
})(typeof window!=='undefined'?window:globalThis);
