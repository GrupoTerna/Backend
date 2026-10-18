#!/usr/bin/env python3
"""Tanda 3 (PF120 punto 13), SOLO LECTURA (18-oct-2026): para los casos C y F de conflictos_clasificados.csv mira, en cada captura
de JSON/Endpoints/Clans (clans.json), si el tag estaba en el memberList del clan esa semana. No modifica nada."""
import json,glob,re,csv,collections,os,datetime as dt
AQUI=os.path.dirname(os.path.abspath(__file__)); JS=os.path.join(AQUI,'..','..','JSON','Endpoints')
pat=re.compile(r'T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)-([LMXJVSD])\s+(\d\d)-(\d\d)-(\d{4}) (\d\d)\.(\d\d) - (.+) - clans\.json$')
snap=collections.defaultdict(list)  # (T,S) -> [(clan, datetime, set(tags))]
for f in glob.glob(os.path.join(JS,'Clans','**','*clans.json'),recursive=True):
    m=pat.search(os.path.basename(f))
    if not m: continue
    t=dt.datetime(int(m[7]),int(m[6]),int(m[5]),int(m[8]),int(m[9]))
    tags={x['tag'] for x in json.load(open(f,encoding='utf-8')).get('memberList',[])}
    snap[(str(int(m[1])),str(int(m[2])))].append((m[10],t,tags))
rows=list(csv.DictReader(open(os.path.join(AQUI,'conflictos_clasificados.csv'),encoding='utf-8')))
res=collections.Counter(); det=[]
for a in rows:
    if a['clase'] not in 'CF': continue
    S=snap.get((a['T'],a['S']),[])
    mine=[(t,tg) for c,t,tg in S if c==a['clan']]
    otros=[c for c,t,tg in S if c!=a['clan'] and a['tag'] in tg]
    if not mine: k='sin capturas de clans.json de ese clan y semana'
    else:
        dentro=[a['tag'] in tg for t,tg in sorted(mine)]
        if all(dentro): k='en el memberList en todas las capturas'
        elif not any(dentro): k='en ninguna captura del memberList'+(' (sí en otro clan)' if otros else '')
        else:
            prim=dentro.index(True); ult=len(dentro)-1-dentro[::-1].index(True)
            k='entra a mitad de semana' if not dentro[0] and dentro[-1] else 'sale a mitad de semana' if dentro[0] and not dentro[-1] else 'intermitente'
    res[(a['clase'],k,len(mine)>0)]+=1; det.append((a['clase'],a['T'],a['S'],a['clan'],a['tag'],k,len(mine)))
for k,v in sorted(res.items()): print(k,v)
print('capturas por semana (min/max):',min(len([1 for c,t,tg in v]) for v in snap.values()),max(len(v) for v in snap.values()))
print('--- capturas del clan en la semana (C y F)')
cnt=collections.Counter()
for a in rows:
    if a['clase'] not in 'CF': continue
    S=[(t,tg) for c,t,tg in snap.get((a['T'],a['S']),[]) if c==a['clan']]
    cnt[(a['clase'],min(len(S),5))]+=1
print(sorted(cnt.items()))
print('--- C detalle')
for a in rows:
    if a['clase']!='C': continue
    S=sorted((t,tg) for c,t,tg in snap.get((a['T'],a['S']),[]) if c==a['clan'])
    print(a['T'],a['S'],a['clan'][:9],a['tag'],'capturas:',len(S),'primera',S[0][0].strftime('%d/%m %H:%M') if S else '-','ultima',S[-1][0].strftime('%d/%m %H:%M') if S else '-','| dias sistema:',a['dias_sistema'])
