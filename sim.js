(function(root){
'use strict';
const fixes=[{name:'ALFA',x:-26,y:19},{name:'BOM',x:0,y:0},{name:'BETEL',x:26,y:23},{name:'GAMMA',x:34,y:3},{name:'DOLSI',x:24,y:-20},{name:'ELMON',x:-13,y:-29},{name:'FALCO',x:-33,y:-9},{name:'NORTH',x:4,y:33}];
const fleet=[['IGO','A320',250,140],['AIC','A321',250,145],['AKJ','B738',250,145],['UAE','B77W',250,150],['ETD','B789',250,145],['QTR','A359',250,145],['AXB','B738',250,145],['SVA','B789',250,145]];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angleDiff=(a,b)=>((a-b+540)%360)-180;
class Simulation{
 constructor(level='easy',random=Math.random){this.random=random;this.level=level;this.aircraft=[];this.time=0;this.handled=0;this.serial=0;this.spawnTimer=0;this.events=[];this.conflicts=[];const n={easy:4,medium:7,hard:10}[level];for(let i=0;i<n;i++)this.spawn(i);}
 emit(message){this.events.unshift(message);this.events=this.events.slice(0,8);}
 spawn(index){const i=index??this.serial;const f=fleet[this.serial%fleet.length];const arrival=this.serial%4!==3;const positions=[{x:32,y:23,h:220},{x:36,y:-17,h:310},{x:-24,y:25,h:105},{x:-3,y:-1,h:270},{x:20,y:31,h:180},{x:30,y:-29,h:340},{x:-30,y:-20,h:65},{x:-6,y:0,h:270},{x:38,y:9,h:265},{x:-15,y:33,h:140}];const p=positions[i%positions.length];const a={id:++this.serial,call:f[0]+(210+Math.floor(this.random()*700)+this.serial),type:f[1],kind:arrival?'arrival':'departure',x:p.x,y:p.y,heading:p.h,alt:arrival?6000+(i%3)*1000:2400,speed:arrival?250:190,targetAlt:null,targetSpeed:null,route:[],trail:[],clearance:null,established:false,transferred:false,landingSpeed:f[3],conflict:false};this.aircraft.push(a);this.emit(a.call+' checked in · '+(arrival?'arrival':'departure'));return a;}
 setRoute(a,points){if(a.transferred||a.established)return; a.route=points.map(p=>({...p}));this.emit(a.call+' route assigned · '+points.length+' points');}
 command(a,key,value){if(a.transferred||a.established&&a.clearance==='ILS')return;a[key]=value;this.emit(a.call+' '+(key==='targetAlt'?'altitude ':'speed ')+(value===null?'unrestricted':value+(key==='targetAlt'?' FT':' KT')));}
 clear(a,kind){if(a.kind!=='arrival'||a.transferred)return;a.clearance=kind;this.emit(a.call+' cleared '+kind+' runway 27');}
 transfer(a){if(!a.established||a.clearance!=='ILS'||a.transferred)return;a.transferred=true;this.emit(a.call+' transferred to Mumbai tower');this.handled++;}
 step(dt){this.time+=dt;this.spawnTimer+=dt;const interval={easy:130,medium:85,hard:55}[this.level];if(this.spawnTimer>interval&&this.aircraft.length<18){this.spawnTimer=0;this.spawn();}
 for(const a of [...this.aircraft]){const prev={x:a.x,y:a.y};a.trail.push(prev);if(a.trail.length>80)a.trail.shift();
 let desired=a.heading;if(a.established)desired=270;else if(a.route.length){const p=a.route[0];if(distance(a,p)<Math.max(.3,a.speed/3600*dt*1.5))a.route.shift();if(a.route.length){const p=a.route[0];desired=(Math.atan2(p.x-a.x,p.y-a.y)*180/Math.PI+360)%360;}}
 a.heading=(a.heading+Math.max(-3*dt,Math.min(3*dt,angleDiff(desired,a.heading)))+360)%360;
 let ta=a.targetAlt??(a.kind==='departure'?14000:6000);let ts=a.targetSpeed??(a.kind==='departure'?(a.alt<10000?250:280):250);
 if(a.established&&a.clearance==='ILS'){ta=Math.min(a.alt,Math.max(38,a.x*318+38));ts=a.x>10?180:a.x>5?160:a.landingSpeed;}
 a.alt+=Math.max(-1500/60*dt,Math.min(1800/60*dt,ta-a.alt));a.speed+=Math.max(-1.5*dt,Math.min(1.2*dt,ts-a.speed));
 const r=a.heading*Math.PI/180;a.x+=Math.sin(r)*a.speed/3600*dt;a.y+=Math.cos(r)*a.speed/3600*dt;
 if(a.kind==='arrival'&&a.clearance&&!a.established&&a.x>=2&&a.x<=25&&a.alt<=4000&&Math.abs(angleDiff(a.heading,270))<=60&&((prev.y*a.y<=0)||Math.abs(a.y)<.22)){
 a.established=true;a.y=0;a.heading=270;a.route=[];this.emit(a.call+' '+a.clearance+' established');}
 if(a.established)a.y=0;
 if((a.established&&a.x<=0)||Math.hypot(a.x,a.y)>49){this.aircraft=this.aircraft.filter(b=>b!==a);if(!a.transferred){if(a.kind==='departure'){this.handled++;this.emit(a.call+' left sector · en route');}else this.emit(a.call+(a.established?' landed without tower handoff':' left controlled airspace'));}}
 }
 this.conflicts=[];for(const a of this.aircraft)a.conflict=false;for(let i=0;i<this.aircraft.length;i++)for(let j=i+1;j<this.aircraft.length;j++){const a=this.aircraft[i],b=this.aircraft[j];if(distance(a,b)<3&&Math.abs(a.alt-b.alt)<1000){a.conflict=b.conflict=true;this.conflicts.push(a.call+' / '+b.call);}}
 }
}
const api={Simulation,fixes,distance,angleDiff};if(typeof module!=='undefined')module.exports=api;root.ATC=api;
})(typeof window!=='undefined'?window:globalThis);
