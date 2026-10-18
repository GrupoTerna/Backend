// Prueba (solo lectura) de _repartirSemanaConjunto_() de Base/src/18_CorreccionGuerra.gs, §PF122. Uso: node prueba_reparto_conjunto.js
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'../../../Base/src/18_CorreccionGuerra.gs'),'utf8');
function extraer(nombre){const i=src.indexOf('function '+nombre+'(');let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){if(src[k]=='{')d++;else if(src[k]=='}'){d--;if(!d)return src.slice(i,k+1);}}}
const consts=src.match(/var FAME_[A-Z_]+ = [^;]+;|var FAME_DUELO_RESULTADOS = \[[\s\S]*?\];/g).join('\n');
const code=consts+'\nvar _FAME_CATALOGO_DIA_CACHE_=null;\nvar GC={NUM:1,FECHA:2,TEMPORADA:3,SEMANA:4,DIA:5,PERIOD_IDX:6,DIA_GUERRA:7,ETAPA:8,CLAN:9,TAG:10,NOMBRE:11,ATAQUES_HOY:12,ATAQUES_SEM:13,FAME:14,BARCOS:15,ORIGEN:20};\nvar Logger={log(){}};\n'+
['_fameDescomposicionesDia_','_fameCatalogoDia_','_repartirSemanaConjunto_'].map(extraer).join('\n')+
'\nreturn {rep:_repartirSemanaConjunto_,cat:_fameCatalogoDia_,tabla:_fameDescomposicionesDia_};';
const M=new Function(code)();
let ok=0,fail=0;function t(n,c){c?ok++:(fail++,console.log('FALLA',n));}
t('catalogo 77',M.cat().length===77);
const mk=(h,s,f,b)=>{const r=new Array(20).fill('');r[11]=h;r[12]=s;r[13]=f;r[14]=b;return r;};
// 1) todo cuadra y ya esta bien: 2 dias (2 PvP 200=1G1P? n2 f300) y (4, 800)
let filas=[mk(2,2,300,0),mk(2,4,500,0)]; // dia1 n2 f300 ; dia2 n2 f200 ok (duelo 0-2 o 2x100)
let r=M.rep(filas,{0:0,1:1},{ataquesSemana:4,fame:500,barcos:0});
t('ya bien sin cambio',r.ok&&!r.huboCambio);
// 2) idempotencia tras corregir sobrante: totales 4 ataques 1700 fame en 1 dia -> imposible (max 900)
filas=[mk(4,4,1700,0)];
r=M.rep(filas,{3:0},{ataquesSemana:4,fame:1700,barcos:0});
t('sin combinacion no toca',!r.ok&&filas[0][13]===1700&&filas[0][11]===4);
// 3) 4 dias, 16 ataques 3600 -> cada dia 900
filas=[mk(0,0,0,0),mk(0,0,0,0),mk(0,0,0,0),mk(0,0,0,0)];
r=M.rep(filas,{0:0,1:1,2:2,3:3},{ataquesSemana:16,fame:3600,barcos:0});
t('3600 en 4 dias',r.ok&&filas.every(f=>f[11]===4)&&filas[3][13]===3600);
const antes=JSON.stringify(filas);r=M.rep(filas,{0:0,1:1,2:2,3:3},{ataquesSemana:16,fame:3600,barcos:0});
t('idempotente',r.ok&&!r.huboCambio&&JSON.stringify(filas)===antes);
// 4) 17 ataques imposibles
filas=[mk(0,0,0,0),mk(0,0,0,0),mk(0,0,0,0),mk(0,0,0,0)];
r=M.rep(filas,{0:0,1:1,2:2,3:3},{ataquesSemana:17,fame:3000,barcos:0});
t('17 ataques no',!r.ok);
// 5) barcos: 4 ataques, 4 barcos, fame 300..500 en un dia
filas=[mk(0,0,0,0)];r=M.rep(filas,{3:0},{ataquesSemana:4,fame:400,barcos:4});
t('4 barcos 400',r.ok&&filas[0][11]===4&&filas[0][14]===4&&filas[0][13]===400);
filas=[mk(0,0,0,0)];r=M.rep(filas,{3:0},{ataquesSemana:4,fame:600,barcos:4});t('4 barcos 600 no',!r.ok);
// 6) barcos null conserva
filas=[mk(2,2,200,2)];r=M.rep(filas,{3:0},{ataquesSemana:2,fame:200,barcos:null});
t('barcos null: 2 barcos 200 = 75+125',r.ok&&filas[0][14]===2);
// 7) la regla del ejemplo de la usuaria: 2 ataques a barcos con 200 medallas, sin dato de ataques: 
filas=[mk(1,1,200,1)];r=M.rep(filas,{3:0},{ataquesSemana:2,fame:200,barcos:2});
t('2 ataques 2 barcos 200 -> n2 b2',r.ok&&filas[0][11]===2&&filas[0][14]===2);
// 8) respeta dias buenos: j(n4,f900) v(n0,f0 invalido?) s(n1 f200) total 6/1400 d=3 dias
filas=[mk(4,4,900,0),mk(0,4,900,0),mk(1,5,1100,0)];
r=M.rep(filas,{0:0,1:1,2:2},{ataquesSemana:5,fame:1100,barcos:0});
t('dias buenos intactos',r.ok&&filas[0][11]===4&&filas[0][13]===900&&filas[2][11]===1&&filas[2][13]===1100);
console.log('ok',ok,'fallas',fail);

// ---- datos reales ----
function parse(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==','){r.push(c);c=''}else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows}
const R=parse(fs.readFileSync(require('path').join(__dirname,'../Hojas/Backup_Guerra.csv'),'utf8').replace(/^\uFEFF/,''));
const H=R.shift();const g=new Map();
R.forEach((f,i)=>{if(f[7]!=='Guerra')return;const pidx=Number(f[5]),sem=Number(f[3]);const off=pidx-((sem-1)*7+3);if(!(off>=0&&off<=3))return;
 const k=[f[2],f[3],f[9],f[8]].join('|');if(!g.has(k))g.set(k,{});g.get(k)[off]=f;});
let tot=0,sinCambio=0,cambia=0,noComb=0,idem=0,viol=0,motivos={};
for(const [k,m] of g){tot++;
 const offs=Object.keys(m).map(Number).sort((a,b)=>a-b);
 const filas=offs.map(o=>{const f=m[o].slice();return f.map((v,i)=>[11,12,13,14].includes(i)?(Number(v)||0):v)});
 const idx={};offs.forEach((o,i)=>idx[o]=i);
 const last=filas[filas.length-1];
 const v={ataquesSemana:last[12],fame:last[13],barcos:last[14]};
 const copia=JSON.stringify(filas);
 const r=M.rep(filas,idx,v);
 if(!r.ok){noComb++;const mm=r.motivo.replace(/\d+/g,'N');motivos[mm]=(motivos[mm]||0)+1;if(JSON.stringify(filas)!==copia)viol++;continue;}
 if(r.huboCambio)cambia++;else sinCambio++;
 // topes tras repartir y totales intactos
 let a=0,b=0,f=0;filas.forEach(x=>{if(x[11]>4)viol++;});
 const l2=filas[filas.length-1];if(l2[12]!==v.ataquesSemana||l2[13]!==v.fame||l2[14]!==v.barcos)viol++;
 const r2=M.rep(filas,idx,v);if(r2.ok&&!r2.huboCambio)idem++;
}
console.log({gruposClanSemana:tot,sinCambio,cambia,sinCombinacion:noComb,idempotentes:idem,violaciones:viol});console.log(motivos);
// desglose de las sin combinacion
const porK={},porB={},ej=[];
for(const [k,m] of g){const offs=Object.keys(m).map(Number).sort((a,b)=>a-b);
 const filas=offs.map(o=>m[o].slice().map((v,i)=>[11,12,13,14].includes(i)?(Number(v)||0):v));const idx={};offs.forEach((o,i)=>idx[o]=i);
 const last=filas[filas.length-1];const r=M.rep(filas,idx,{ataquesSemana:last[12],fame:last[13],barcos:last[14]});
 if(r.ok)continue;porK[offs.length]=(porK[offs.length]||0)+1;const bz=last[14]===0?'barcos=0':'barcos>0';porB[bz]=(porB[bz]||0)+1;
 if(ej.length<6)ej.push(k+' dias='+offs+' A='+last[12]+' F='+last[13]+' B='+last[14]);}
console.log('por n de dias existentes',porK,porB);console.log(ej.join('\n'));
