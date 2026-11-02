'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const hash=content=>createHash('sha256').update(content).digest('hex').slice(0,12);
// A single fingerprinted script prevents cached simulation/UI version mismatches.
const game="'use strict';\n"+read('sim.js')+'\n;\n'+read('app.js')+'\n';
const css=read('style.css');
const scriptPath='assets/game.'+hash(game)+'.js';
const cssPath='assets/style.'+hash(css)+'.css';
fs.mkdirSync(path.join(root,'assets'),{recursive:true});
fs.writeFileSync(path.join(root,scriptPath),game);
fs.writeFileSync(path.join(root,cssPath),css);
let html=read('index.html');
html=html.replace(/href="(?:style\.css|assets\/style\.[a-f0-9]+\.css)"/,'href="'+cssPath+'"');
html=html.replace(/<script src="sim\.js"><\/script><script src="app\.js"><\/script>|<script\b[^>]*src="assets\/game\.[a-f0-9]+\.js"[^>]*><\/script>/,
 '<script defer src="'+scriptPath+'" onerror="document.getElementById(\'load-error\').hidden=false"><\/script>');
fs.writeFileSync(path.join(root,'index.html'),html);
// Retain older fingerprinted assets so previously cached HTML can still run.
console.log('Built '+scriptPath+' and '+cssPath);
