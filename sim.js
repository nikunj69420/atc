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
 const alt=n=>String(Math.round(n/100)).padStart(3,'0');
 const automatic=a.established&&a.clearance==='ILS';
 const bearing=a.route.length?(Math.atan2(a.route[0].x-a.x,a.route[0].y-a.y)*180/Math.PI+360)%360:a.heading;
 const heading=n=>String(Math.round(n)%360||360).padStart(3,'0');
 return [a.call+' / '+a.type,
  'ALT '+alt(a.alt)+' → '+(automatic?'GS':a.targetAlt===null?'UNR':alt(a.targetAlt)),
  'SPD '+Math.round(a.speed)+' → '+(automatic?approachSpeed(a):a.targetSpeed===null?'UNR':a.targetSpeed)+' KT',
  'HDG '+heading(a.heading)+(a.route.length?' → '+(a.route[0].name||heading(bearing)):'')+' · '+(a.transferred?'TWR':a.established?a.clearance+' EST':a.clearance?a.clearance+' CLR':a.kind==='arrival'?'ARR':'DEP')];
}
const stormTemplates=[{id:'CB01',x:-17,y:10,radius:4.2,vx:5,vy:1.5},{id:'CB02',x:22,y:-15,radius:4.8,vx:-3,vy:2},{id:'CB03',x:20,y:22,radius:3.8,vx:-4,vy:-2},{id:'CB04',x:-21,y:-20,radius:4.4,vx:3,vy:2}];
class Simulation{
 constructor(level='easy',random=Math.random){this.random=random;this.level=level;this.aircraft=[];this.time=0;this.handled=0;this.serial=0;this.spawnTimer=0;this.events=[];this.conflicts=[];this.weatherAlerts=[];this.storms=stormTemplates.slice(0,{easy:2,medium:3,hard:4}[level]).map(s=>({...s}));const n={easy:4,medium:7,hard:10}[level];for(let i=0;i<n;i++)this.spawn(i);}
 sequence(){return this.aircraft.filter(a=>a.kind==='arrival'&&a.established&&a.x>0).sort((a,b)=>a.x-b.x).map((a,i,all)=>({aircraft:a,position:i+1,distance:a.x,gap:i? a.x-all[i-1].x:null,eta:touchdownSeconds(a),estimated:a.clearance!=='ILS'}));}
 emit(message){this.events.unshift(message);this.events=this.events.slice(0,8);}
 spawn(index){const i=index??this.serial;const f=fleet[this.serial%fleet.length];const arrival=this.serial%4!==3;const positions=[{x:32,y:23,h:220},{x:36,y:-17,h:310},{x:-24,y:25,h:105},{x:-3,y:-1,h:270},{x:20,y:31,h:180},{x:30,y:-29,h:340},{x:-30,y:-20,h:65},{x:-6,y:0,h:270},{x:38,y:9,h:265},{x:-15,y:33,h:140}];const p=positions[i%positions.length];const a={id:++this.serial,call:f[0]+(210+Math.floor(this.random()*700)+this.serial),type:f[1],kind:arrival?'arrival':'departure',x:p.x,y:p.y,heading:p.h,alt:arrival?6000+(i%3)*1000:2400,speed:arrival?250:190,targetAlt:null,targetSpeed:null,route:[],trail:[],clearance:null,established:false,transferred:false,landingSpeed:f[3],conflict:false};this.aircraft.push(a);this.emit(a.call+' checked in · '+(arrival?'arrival':'departure'));return a;}
 setRoute(a,points){if(a.transferred||a.established)return; a.route=points.map(p=>({...p}));this.emit(a.call+' route assigned · '+points.length+' points');}
 command(a,key,value){if(a.transferred||a.established&&a.clearance==='ILS')return;a[key]=value;this.emit(a.call+' '+(key==='targetAlt'?'altitude ':'speed ')+(value===null?'unrestricted':value+(key==='targetAlt'?' FT':' KT')));}
 clear(a,kind){if(a.kind!=='arrival'||a.transferred)return;a.clearance=kind;this.emit(a.call+' cleared '+kind+' runway 27');}
 transfer(a){if(!a.established||a.clearance!=='ILS'||a.transferred)return;a.transferred=true;this.emit(a.call+' transferred to Mumbai tower');this.handled++;}
 step(dt){this.time+=dt;this.spawnTimer+=dt;for(const s of this.storms){s.x+=s.vx/3600*dt;s.y+=s.vy/3600*dt;if(Math.abs(s.x)>34)s.vx=-Math.sign(s.x)*Math.abs(s.vx);if(Math.abs(s.y)>30)s.vy=-Math.sign(s.y)*Math.abs(s.vy);}const interval={easy:130,medium:85,hard:55}[this.level];if(this.spawnTimer>interval&&this.aircraft.length<18){this.spawnTimer=0;this.spawn();}
 for(const a of [...this.aircraft]){const prev={x:a.x,y:a.y};a.trail.push(prev);if(a.trail.length>80)a.trail.shift();
 let desired=a.heading;if(a.established)desired=270;else if(a.route.length){const p=a.route[0];if(distance(a,p)<Math.max(.3,a.speed/3600*dt*1.5))a.route.shift();if(a.route.length){const p=a.route[0];desired=(Math.atan2(p.x-a.x,p.y-a.y)*180/Math.PI+360)%360;}}
 a.heading=(a.heading+Math.max(-3*dt,Math.min(3*dt,angleDiff(desired,a.heading)))+360)%360;
 let ta=a.targetAlt??(a.kind==='departure'?14000:6000);let ts=a.targetSpeed??(a.kind==='departure'?(a.alt<10000?250:280):250);
 if(a.established&&a.clearance==='ILS'){ta=Math.min(a.alt,Math.max(38,a.x*318+38));ts=approachSpeed(a);}
 a.alt+=Math.max(-1500/60*dt,Math.min(1800/60*dt,ta-a.alt));a.speed+=Math.max(-1.5*dt,Math.min(1.2*dt,ts-a.speed));
 const r=a.heading*Math.PI/180;a.x+=Math.sin(r)*a.speed/3600*dt;a.y+=Math.cos(r)*a.speed/3600*dt;
 if(a.kind==='arrival'&&a.clearance&&!a.established&&a.x>=2&&a.x<=25&&a.alt<=4000&&Math.abs(angleDiff(a.heading,270))<=60&&((prev.y*a.y<=0)||Math.abs(a.y)<.22)){
 a.established=true;a.y=0;a.heading=270;a.route=[];this.emit(a.call+' '+a.clearance+' established');}
 if(a.established)a.y=0;
 if((a.established&&a.x<=0)||Math.hypot(a.x,a.y)>49){this.aircraft=this.aircraft.filter(b=>b!==a);if(!a.transferred){if(a.kind==='departure'){this.handled++;this.emit(a.call+' left sector · en route');}else this.emit(a.call+(a.established?' landed without tower handoff':' left controlled airspace'));}}
 }
 this.weatherAlerts=[];for(const a of this.aircraft){const cell=this.storms.find(s=>distance(a,s)<s.radius);const near=cell||this.storms.find(s=>distance(a,s)<s.radius+3);const prior=a.weather;a.weather=cell?'CORE':near?'NEAR':null;if(a.weather!==prior&&a.weather)this.emit(a.call+' '+(cell?'entered storm core':'near storm')+' · '+near.id);if(near)this.weatherAlerts.push(a.call+' · '+near.id+' '+(cell?'CORE':'NEAR'));}
 this.conflicts=[];for(const a of this.aircraft)a.conflict=false;for(let i=0;i<this.aircraft.length;i++)for(let j=i+1;j<this.aircraft.length;j++){const a=this.aircraft[i],b=this.aircraft[j];if(distance(a,b)<3&&Math.abs(a.alt-b.alt)<1000){a.conflict=b.conflict=true;this.conflicts.push(a.call+' / '+b.call);}}
 }
}
const api={Simulation,fixes,distance,angleDiff,touchdownSeconds,aircraftLabel};if(typeof module!=='undefined')module.exports=api;root.ATC=api;
})(typeof window!=='undefined'?window:globalThis);
