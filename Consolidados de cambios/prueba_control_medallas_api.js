// Prueba de solo lectura de _cmaControlClanes_ (Base/src/60_Control_Medallas_API.gs, §PF584 parte 1) contra las capturas reales de Datos descargados/. Uso, desde la raíz del repo: node "Consolidados de cambios/prueba_control_medallas_api.js"
const fs=require('fs'),path=require('path'),vm=require('vm');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','Base','src','60_Control_Medallas_API.gs'),'utf8'));
const raiz=path.join(__dirname,'..','Datos descargados','JSON','Endpoints','CurrentRiverRace');
function* walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())yield* walk(p);else if(e.name.endsWith('.json'))yield p;}}
const cnt={},malos=[];let n=0;
for(const f of walk(raiz)){const rr=JSON.parse(fs.readFileSync(f,'utf8'));n++;
 for(const x of _cmaControlClanes_(rr)){const k=rr.periodType+'/'+x.estado;cnt[k]=(cnt[k]||0)+1;
  if(x.estado==='difiere')malos.push([path.basename(f).slice(0,40),x.nombre,x.residuo,x.sumaFame,x.periodPoints,x.sumaPointsEarned]);}}
console.log(n,cnt);
const r=malos.map(m=>m[2]);console.log('difiere:',malos.length,'neg',r.filter(v=>v<0).length,'pos',r.filter(v=>v>0).length);
malos.slice(0,12).forEach(m=>console.log(JSON.stringify(m)));
