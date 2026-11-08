const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const fonts=[['Barlow Condensed',600,'BarlowCondensed.ttf'],['DM Sans',400,'DMSans.ttf']];
const css=fonts.map(([name,weight,file])=>`@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,'assets',file)).toString('base64')}) format('truetype');}`).join('\n');
const licenses=fonts.map(([, ,file])=>{const name=file==='BarlowCondensed.ttf'?'Barlow-OFL.txt':'DMSans-OFL.txt';return fs.readFileSync(path.join(root,'assets',name),'utf8');}).join('\n\n');
const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8').replace('__FONTS__',css).replace('__ENGINE__',fs.readFileSync(path.join(root,'src/engine.js'),'utf8')).replace('</head>',`<!-- Embedded fonts licensed under SIL OFL:\n${licenses}\n-->\n</head>`);
fs.writeFileSync(path.join(root,'index.html'),html);
console.log(`Built self-contained index.html (${Buffer.byteLength(html)} bytes)`);
