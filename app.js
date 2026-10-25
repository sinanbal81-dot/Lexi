/*PURE*/
const K='lexi1',day=()=>new Date().toLocaleDateString('en-CA'),now=()=>Date.now(),nk=s=>String(s||'').trim().replace(/\s+/g,' '),uid=()=>Math.random().toString(36).slice(2,10);
let S;try{S=JSON.parse(localStorage[K])}catch(e){}
S=S||{};S.cards=S.cards||[];S.log=S.log||{};S.set={daily:20,mode:'daily',dir:'mix',cat:'',rate:.9,auto:true,...S.set};
function save(){try{localStorage[K]=JSON.stringify(S)}catch(e){if(typeof alert!='undefined')alert('Could not save: storage is full or blocked.')}}
function add(list){let a=0,d=0;const m=new Map(S.cards.map(c=>[c.en.toLowerCase(),c]));
for(const r of list){const en=nk(r.en);if(!en)continue;const o=m.get(en.toLowerCase());
if(o){d++;for(const f of['tr','ex','exTr','cat'])if(!o[f]&&r[f])o[f]=nk(r[f]);continue}
const c={id:uid(),en,tr:nk(r.tr),ex:nk(r.ex),exTr:nk(r.exTr),cat:nk(r.cat),fav:0,due:0,int:0,ease:2.5,reps:0,lapses:0,seen:0,ok:0};S.cards.push(c);m.set(en.toLowerCase(),c);a++}
save();return{a,d}}
function csv(t){t=t.replace(/^\uFEFF/,'');const f=t.split(/\r?\n/)[0],d=[',','\t',';'].sort((a,b)=>f.split(b).length-f.split(a).length)[0],rows=[];let r=[],v='',q=0;
for(let i=0;i<t.length;i++){const ch=t[i];
if(q){if(ch=='"'){if(t[i+1]=='"'){v+='"';i++}else q=0}else v+=ch}
else if(ch=='"')q=1;else if(ch==d){r.push(v);v=''}else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;r.push(v);rows.push(r);r=[];v=''}else v+=ch}
if(v||r.length){r.push(v);rows.push(r)}return rows.filter(r=>r.some(x=>x.trim()))}
function toCards(rows,swap){const L=x=>/^(english|turkish|türkçe|ingilizce)$/i.test((x||'').trim()),out=[];let col=null;
for(const r of rows){
if(r.length>=4&&L(r[0])&&L(r[1])&&!/^(example|sentence)/i.test(r[2])){let[a,b]=[r[2],r[3]];if(/^(turkish|türkçe)/i.test(r[0].trim()))[a,b]=[b,a];out.push({en:a,tr:b});continue}
const h=r.map(x=>x.trim().toLowerCase());
if(!col&&h.length>1&&h.some(x=>/^(english|word|phrase|en)$/.test(x))){const g=re=>h.findIndex(x=>re.test(x));col={en:g(/^(english|word|phrase|en)$/),tr:g(/^(turkish|türkçe|translation|tr|meaning)$/),ex:g(/^(example|sentence)$/),exTr:g(/example.*(tr|turk)|(tr|turk).*(example|sentence)/),cat:g(/categ|tag|group/)};continue}
const c=col||{en:0,tr:1,ex:2,exTr:3,cat:4},p=k=>c[k]>=0?r[c[k]]||'':'';
const o={en:p('en'),tr:p('tr'),ex:p('ex'),exTr:p('exTr'),cat:p('cat')};if(swap&&!col)[o.en,o.tr]=[o.tr,o.en];out.push(o)}
return out}
function rate(c,q){const L=S.log[day()]??={n:0,ok:0,new:0};if(!c.reps)L.new++;L.n++;c.seen++;
if(q=='again'){c.lapses++;c.int=0;c.ease=Math.max(1.3,c.ease-.2);c.due=now()+6e5}
else{c.ok++;L.ok++;if(q=='hard'){c.ease=Math.max(1.3,c.ease-.15);c.int=Math.max(1,c.int*1.2)}else{c.int=c.int<1?4:Math.round(c.int*c.ease*1.3);c.ease=Math.min(3,c.ease+.05)}c.due=now()+c.int*864e5}
c.reps++;save()}
/*END*/
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),byId=i=>S.cards.find(c=>c.id==i);
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
let Q=[],cur=null,flip=false,rev=false,H=[],hi=-1;const tried=new Set();let lastErr='';const VER='9';
function say(t){if(!window.speechSynthesis)return alert('Speech is not available in this browser.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),vs=speechSynthesis.getVoices(),n=v=>v.lang.replace('_','-');
u.voice=vs.find(v=>n(v)=='en-AU')||vs.find(v=>/^en-(GB|NZ|US)/.test(n(v)))||vs.find(v=>/^en/.test(n(v)))||null;u.lang=u.voice?n(u.voice):'en-AU';u.rate=S.set.rate;speechSynthesis.speak(u);return u.voice}
function dl(n,t,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type}));a.download=n;a.click()}
function build(){const s=S.set,n=now(),L=S.cards.filter(c=>!s.cat||c.cat===s.cat),nw=L.filter(c=>!c.reps);
Q=s.mode=='daily'?[...L.filter(c=>c.reps&&c.due<=n).sort((a,b)=>a.ease-b.ease),...nw.slice(0,Math.max(0,s.daily-(S.log[day()]?.new||0)))]
:s.mode=='new'?nw.slice(0,50):s.mode=='hard'?shuf(L.filter(c=>c.lapses||(c.reps&&c.ease<2.2))):s.mode=='fav'?shuf(L.filter(c=>c.fav)):shuf(L);H=[];hi=-1;cur=null;next()}
function show(e){cur=e?e.c:null;rev=e?e.rev:false;flip=false;view();if(cur){getPh(cur);if(!rev&&S.set.auto&&$('#study').classList.contains('on'))say(cur.en)}}
function next(){if(hi<H.length-1){hi++;return show(H[hi])}const c=Q.shift();if(!c)return show(null);const e={c,rev:S.set.dir=='tr'||(S.set.dir=='mix'&&Math.random()<.5)};H.push(e);if(H.length>50)H.shift();hi=H.length-1;show(e)}
function prev(){const i=cur?hi-1:hi;if(i<0)return;hi=i;show(H[hi])}
const POS={noun:'noun','proper noun':'proper noun',verb:'verb',adjective:'adj.',adverb:'adv.',preposition:'prep.',conjunction:'conj.',pronoun:'pron.',interjection:'interj.',determiner:'det.',article:'article',numeral:'number',particle:'particle',contraction:'contraction','phrasal verb':'phrasal verb',idiom:'idiom',phrase:'phrase','prepositional phrase':'phrase',proverb:'proverb',abbreviation:'abbr.',initialism:'abbr.',acronym:'abbr.'};
function ipaOf(t){const m=[...t.matchAll(/\{\{IPA\|en\|([^}]*)\}\}/g)];if(!m.length)return'';const pick=m.find(x=>/US|General American/.test(t.slice(Math.max(0,x.index-60),x.index)))||m[0];const p=pick[1].split('|').find(x=>/^\s*[\/\[]/.test(x));return p?p.trim().replace(/^[\/\[]|[\/\]]$/g,''):''}
function posOf(t){const i=t.search(/^==\s*English\s*==\s*$/m);if(i<0)return'';let s=t.slice(i+3);const e=s.search(/^==[^=]/m);if(e>=0)s=s.slice(0,e);const out=new Set();
for(const m of s.matchAll(/^={3,5}[ \t]*([^=\n]+?)[ \t]*={3,5}[ \t]*$/gm)){const p=POS[m[1].toLowerCase()];if(p)out.add(p)}return[...out].slice(0,4).join(', ')}
const wic=new Map();
function wiki(w){const k=w.toLowerCase();if(!wic.has(k))wic.set(k,(async()=>{const r=await fetch('https://en.wiktionary.org/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&origin=*&page='+encodeURIComponent(k));if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j.error)return{ph:'',pos:''};const t=j.parse&&j.parse.wikitext&&j.parse.wikitext['*']||'';return{ph:ipaOf(t),pos:posOf(t)}})().catch(e=>{wic.delete(k);throw e}));return wic.get(k)}
const phWiki=async w=>(await wiki(w)).ph,posWord=async w=>(await wiki(w)).pos;
async function phDict(w){const r=await fetch('https://api.dictionaryapi.dev/v2/entries/en/'+encodeURIComponent(w.toLowerCase()));if(!r.ok)return'';const j=await r.json();for(const e of j){let t=e.phonetic||'';if(!t)for(const p of e.phonetics||[])if(p.text){t=p.text;break}if(t)return t.replace(/^\/|\/$/g,'')}return''}
async function phWord(w){const t=await phWiki(w);if(t)return t;try{return await phDict(w)}catch(e){return''}}
let defGate=Promise.resolve();const gate=()=>defGate=defGate.then(()=>new Promise(r=>setTimeout(r,700)));
const cut=s=>s.length>220?s.slice(0,217)+'…':s;
async function dictDef(w){const j=await dictJson(w),out=[],seen=new Set(),ms=j.flatMap(e=>e.meanings||[]);
for(const m of ms){const d=m.definitions&&m.definitions[0]&&m.definitions[0].definition;if(!d||seen.has(m.partOfSpeech))continue;seen.add(m.partOfSpeech);out.push('('+m.partOfSpeech+') '+cut(d));if(out.length>=3)break}
if(out.length==1&&ms[0]&&ms[0].definitions[1])out.push('('+ms[0].partOfSpeech+') '+cut(ms[0].definitions[1].definition));return out.join('\n')}
async function dmJson(q){const r=await fetch('https://api.datamuse.com/words?'+q);if(!r.ok)throw new Error('Datamuse HTTP '+r.status);return r.json()}
const NP={n:'noun',v:'verb',adj:'adjective',adv:'adverb'},fmt=x=>{const i=x.indexOf('\t'),k=x.slice(0,i);return'('+(NP[k]||k||'?')+') '+cut(x.slice(i+1).trim())};
async function dmDef(w){const j=await dmJson('md=d&max=5&sp='+encodeURIComponent(w)),e=j.find(x=>x.word.toLowerCase()==w.toLowerCase());if(!e||!e.defs||!e.defs.length)return'';const out=[],seen=new Set();
for(const x of e.defs){const k=x.slice(0,x.indexOf('\t'));if(seen.has(k))continue;seen.add(k);out.push(fmt(x));if(out.length>=3)break}
if(out.length<2)for(const x of e.defs)if(!out.includes(fmt(x))){out.push(fmt(x));break}return out.join('\n')}
async function defWord(w){let err;try{const d=await dictDef(w);if(d)return d}catch(e){err=e}try{const d=await dmDef(w);if(d)return d}catch(e){err=err||e}if(err)throw err;return''}
async function synWord(w){const j=await dmJson('max=8&rel_syn='+encodeURIComponent(w));return j.map(x=>x.word).filter(x=>x.toLowerCase()!=w.toLowerCase()).slice(0,6).join(', ')}
async function trWord(w){const r=await fetch('https://api.mymemory.translated.net/get?langpair=en%7Ctr&q='+encodeURIComponent(w));if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(+j.responseStatus!=200)throw new Error(String(j.responseDetails||'status '+j.responseStatus).slice(0,80));
const dec=s=>new DOMParser().parseFromString(String(s||''),'text/html').documentElement.textContent.trim(),key=s=>s.toLocaleLowerCase('tr').replace(/[.!?]+$/,''),src=key(w),low=w==w.toLowerCase(),out=[],seen=new Set([src]);
const add=s=>{s=dec(s);if(!s||/MYMEMORY WARNING/i.test(s)||s.length>80)return;const k=key(s);if(seen.has(k))return;seen.add(k);out.push(low?s[0].toLocaleLowerCase('tr')+s.slice(1):s)};
add(j.responseData&&j.responseData.translatedText);for(const m of(j.matches||[]).filter(m=>key(dec(m.segment))==src).sort((a,b)=>(+b.match||0)-(+a.match||0)))add(m.translation);return out.slice(0,3).join(', ')}
const djc=new Map();
function dictJson(w){const k=w.toLowerCase();if(!djc.has(k))djc.set(k,(async()=>{await gate();const r=await fetch('https://api.dictionaryapi.dev/v2/entries/en/'+encodeURIComponent(k));if(r.status==404)return[];if(!r.ok)throw new Error('dictionary HTTP '+r.status);const j=await r.json();return Array.isArray(j)?j:[]})().then(v=>{setTimeout(()=>djc.delete(k),6e4);return v},e=>{djc.delete(k);throw e}));return djc.get(k)}
async function mmText(t){const r=await fetch('https://api.mymemory.translated.net/get?langpair=en%7Ctr&q='+encodeURIComponent(t));if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(+j.responseStatus!=200)throw new Error(String(j.responseDetails||'status '+j.responseStatus).slice(0,80));const x=new DOMParser().parseFromString(String(j.responseData&&j.responseData.translatedText||''),'text/html').documentElement.textContent.trim();return/MYMEMORY WARNING/i.test(x)?'':x}
async function exWord(w){let err;const re=new RegExp('(^|[^\\p{L}])'+w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^\\p{L}]|$)','iu');
try{const r=await fetch('https://tatoeba.org/en/api_v0/search?from=eng&to=tur&trans_filter=limit&trans_to=tur&sort=relevance&query='+encodeURIComponent(w));if(!r.ok)throw new Error('Tatoeba HTTP '+r.status);const j=await r.json();
const c=(j.results||[]).map(x=>({ex:String(x.text||'').trim(),t:(x.translations||[]).flat().find(y=>y&&y.lang=='tur')})).filter(x=>x.t&&x.t.text&&x.ex.length>=12&&x.ex.length<=100&&re.test(x.ex)).sort((a,b)=>Math.abs(a.ex.length-50)-Math.abs(b.ex.length-50));
if(c.length)return{ex:c[0].ex,exTr:String(c[0].t.text).trim()}}catch(e){err=e}
try{for(const m of(await dictJson(w)).flatMap(e=>e.meanings||[]))for(const d of m.definitions||[])if(d.example){const x=String(d.example).trim();return{ex:x[0].toUpperCase()+x.slice(1)+(/[.!?]$/.test(x)?'':'.'),exTr:''}}}catch(e){err=err||e}
if(err)throw err;return null}
async function extras(c){const job=async f=>{try{return await f()}catch(e){lastErr=String(e&&e.message||e)}};
if(!c.ex){const e=await job(()=>exWord(c.en));if(e){c.ex=e.ex;if(e.exTr&&!c.exTr)c.exTr=e.exTr}}
if(c.ex&&!c.exTr){const t=await job(()=>mmText(c.ex));if(t)c.exTr=t}
if(!c.cat&&c.pos)c.cat=c.pos.split(',')[0].trim();save()}
async function getPh(c){const ws=c.en.replace(/[^\p{L}'’\- ]/gu,' ').split(' ').filter(Boolean),short=ws.length>0&&ws.length<=4,en=ws.join(' '),np=short&&c.ph===undefined,nq=short&&c.pos===undefined,nd=short&&c.def===undefined,ns=short&&c.syn===undefined,nt=!c.tr&&ws.length>0&&c.en.length<=100;if(!(np||nq||nd||ns||nt)||tried.has(c.id))return;tried.add(c.id);
const job=async f=>{try{return await f()}catch(e){lastErr=String(e&&e.message||e)}};const[p,q,d,t,y]=await Promise.all([np?job(()=>Promise.all(ws.map(phWord))):0,nq?job(()=>posWord(en)):0,nd?job(()=>defWord(en)):0,nt?job(()=>trWord(c.en)):0,ns?job(()=>synWord(en)):0]);let ch=0;
if(p&&p.every(Boolean)){c.ph='/'+p.join(' ')+'/';ch=1}if(q){c.pos=q;ch=1}if(d){c.def=d;ch=1}if(y){c.syn=y;ch=1}if(t&&!c.tr){c.tr=t;ch=1}if(ch){save();if(cur===c)view()}}
const sel=(k,arr,v)=>`<select data-s="${k}">${arr.map(([a,b])=>`<option value="${esc(a)}"${a==v?' selected':''}>${esc(b)}</option>`).join('')}</select>`;
function drawStudy(){const s=S.set,cats=[...new Set(S.cards.map(c=>c.cat).filter(Boolean))].sort(),due=S.cards.filter(c=>c.reps&&c.due<=now()).length;
let h=`<div class="row">${sel('mode',[['daily','Daily review'],['new','New words'],['hard','Difficult words'],['all','All words'],['fav','Favourites']],s.mode)}${sel('dir',[['mix','Mixed'],['en','English first'],['tr','Turkish first']],s.dir)}${sel('cat',[['','All categories'],...cats.map(c=>[c,c])],s.cat)}</div>`;
if(!S.cards.length)h+='<p class="empty">No words yet. Open Add to import your Google Translate list.</p>';
else if(!cur)h+=`<p class="empty">All done for this set. Words due now: ${due}.<br>Try another mode above.</p>${hi>=0?'<div class="row"><button data-nav="prev">‹ Previous</button></div>':''}`;
else{const c=cur,f=rev?c.tr:c.en,b=rev?c.en:c.tr;
h+=`<div class="card" id="card"><small>${rev?'Turkish → English':'English → Turkish'}, ${Q.length} more after this</small><div class="big">${esc(f)||'(empty)'}</div>${!rev&&c.ph?`<div class="ph">${esc(c.ph)}</div>`:''}${!rev&&c.pos?`<div class="pos">${esc(c.pos)}</div>`:''}${flip?`<hr><div class="big2">${esc(b)||'(no translation)'}</div>${rev&&c.ph?`<div class="ph">${esc(c.ph)}</div>`:''}${rev&&c.pos?`<div class="pos">${esc(c.pos)}</div>`:''}${c.def?`<p class="def">${esc(c.def).replace(/\n/g,'<br>')}</p>`:''}${c.syn?`<p class="def">Synonyms: ${esc(c.syn)}</p>`:''}${c.ex?`<p class="ex">${esc(c.ex)}<br><i>${esc(c.exTr)}</i></p>`:`<p class="ex"><a target="_blank" rel="noopener" href="https://tatoeba.org/en/sentences/search?from=eng&to=tur&query=${encodeURIComponent(c.en)}">Find example sentences</a> or <a href="#" data-edit="${c.id}">add your own</a></p>`}`:'<p class="hint">Tap to reveal</p>'}</div>
<div class="row"><button data-nav="prev"${hi>0?'':' disabled'}>‹ Previous</button><button data-nav="next">Next ›</button></div>
<div class="row"><button id="spk">🔊 Listen</button><button data-fav="${c.id}">${c.fav?'★ Favourite':'☆ Favourite'}</button><button data-edit="${c.id}">✎ Edit</button></div>`;
if(flip)h+='<div class="row3"><button class="again" data-r="again">Again</button><button class="hard" data-r="hard">Hard</button><button class="easy" data-r="easy">Easy</button></div>'}
$('#study').innerHTML=h}
function drawWords(){const q=$('#q').value.toLowerCase(),L=S.cards.filter(c=>(c.en+' '+c.tr+' '+c.cat).toLowerCase().includes(q)).sort((a,b)=>a.en.localeCompare(b.en));
$('#wl').innerHTML=`<p class="meta">${L.length} of ${S.cards.length} words${L.length>200?' (showing 200, search to narrow)':''}</p>`+L.slice(0,200).map(c=>`<div class="w" data-edit="${c.id}"><div><b>${esc(c.en)}</b><br>${esc(c.tr)}</div><div class="meta">${c.fav?'★ ':''}${esc(c.cat)}</div></div>`).join('')}
function drawStats(){const t=S.log[day()]||{n:0,ok:0,new:0},C=S.cards;let n=0,ok=0;for(const k in S.log){n+=S.log[k].n;ok+=S.log[k].ok}
const days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5);return[d.toLocaleDateString('en-CA'),d.toLocaleDateString('en-AU',{weekday:'short'})]}),mx=Math.max(1,...days.map(d=>S.log[d[0]]?.n||0)),pc=(a,b)=>b?Math.round(100*a/b)+'%':'–';
$('#stats').innerHTML=`<h2>Progress</h2><div class="k"><div><b>${t.n}</b>reviewed today</div><div><b>${pc(t.ok,t.n)}</b>accuracy today</div><div><b>${t.new}</b>new words today</div><div><b>${C.filter(c=>c.reps&&c.due<=now()).length}</b>due now</div><div><b>${C.filter(c=>c.reps).length}</b>words learned (seen at least once)</div><div><b>${C.filter(c=>c.int>=21).length}</b>well known (21+ day gap)</div><div><b>${C.filter(c=>c.lapses||(c.reps&&c.ease<2.2)).length}</b>difficult words</div><div><b>${pc(ok,n)}</b>all-time accuracy</div></div>
<h3>Last 7 days</h3><div class="bars" style="margin-bottom:24px">${days.map(d=>`<div style="height:${Math.max(3,100*(S.log[d[0]]?.n||0)/mx)}%"><span>${d[1]}</span></div>`).join('')}</div><p class="meta">Accuracy counts Hard and Easy as correct, Again as incorrect. ${C.length} words in total.</p>`}
function tab(v){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id==v));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));view()}
function view(){const v=$('section.on').id;v=='study'?drawStudy():v=='words'?drawWords():v=='stats'?drawStats():0}
let eid=null;function edit(id){const c=byId(id);if(!c)return;eid=id;for(const f of['en','tr','ex','exTr','cat'])$('#e_'+f).value=c[f];$('#e_ph').value=c.ph||'';$('#e_pos').value=c.pos||'';$('#e_def').value=c.def||'';$('#e_syn').value=c.syn||'';$('#dlg').showModal()}
document.addEventListener('click',e=>{const el=e.target.closest('[data-nav],[data-r],[data-fav],[data-edit],[data-v],#card,#spk'),d=el&&el.dataset;if(!el)return;
if(d.v)return tab(d.v);
if(d.nav)return d.nav=='prev'?prev():next();
if(d.r){rate(cur,d.r);if(d.r=='again')Q.push(cur);return next()}
if(d.fav){const c=byId(d.fav);c.fav^=1;save();return view()}
if(d.edit){e.preventDefault();return edit(d.edit)}
if(el.id=='spk')return say(cur.en+(flip&&cur.ex?'. '+cur.ex:''));
if(el.id=='card'&&!flip&&!e.target.closest('a')){flip=true;drawStudy();if(rev&&S.set.auto)say(cur.en)}});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset.s;if(!k)return;S.set[k]=t.type=='checkbox'?t.checked:(t.type=='number'||t.type=='range')?+t.value:t.value;save();if(['mode','dir','cat','daily'].includes(k))build()});
$('#q').oninput=drawWords;
$('#sv').onclick=()=>{const c=byId(eid);for(const f of['en','tr','ex','exTr','cat'])c[f]=nk($('#e_'+f).value);const p=nk($('#e_ph').value);if(p)c.ph=p;else delete c.ph;const q=nk($('#e_pos').value);if(q)c.pos=q;else delete c.pos;const dd=$('#e_def').value.trim();if(dd)c.def=dd;else delete c.def;const ss=nk($('#e_syn').value);if(ss)c.syn=ss;else delete c.syn;save();$('#dlg').close();view()};
$('#cx').onclick=()=>$('#dlg').close();
$('#del').onclick=()=>{if(confirm('Delete this word?')){S.cards=S.cards.filter(c=>c.id!=eid);save();$('#dlg').close();build()}};
$('#file').onchange=async e=>{const f=e.target.files[0];if(f)$('#paste').value=await f.text()};
$('#imp').onclick=()=>{const t=$('#paste').value;if(!t.trim())return $('#msg').textContent='Choose a file or paste some rows first.';
const cs=toCards(csv(t),$('#swap').checked),r=add(cs);$('#msg').textContent=`Read ${cs.length} rows: ${r.a} added, ${r.d} duplicates merged or skipped.`;$('#paste').value='';$('#file').value='';build()};
const AF=['en','tr','def','syn','ex','exTr','cat'];let aid=null;
const fillBlank=c=>{for(const f of AF)if(!$('#m_'+f).value.trim()&&c[f])$('#m_'+f).value=c[f]};
$('#newone').onclick=()=>{aid=null;for(const f of AF)$('#m_'+f).value='';$('#addone').textContent='Add word';$('#msg2').textContent=''};
$('#addone').onclick=async()=>{const m=$('#msg2'),b=$('#addone'),en=nk($('#m_en').value);if(!en)return;let c=aid&&byId(aid);
if(c){for(const f of['en','tr','ex','exTr','cat'])c[f]=nk($('#m_'+f).value);const d=$('#m_def').value.trim(),y=nk($('#m_syn').value);d?c.def=d:delete c.def;y?c.syn=y:delete c.syn;save();m.textContent='Saved "'+c.en+'".';build();return}
const o={en};for(const f of['tr','ex','exTr','cat'])o[f]=$('#m_'+f).value;const r=add([o]);c=S.cards.find(x=>x.en.toLowerCase()==en.toLowerCase());if(!c)return;
const d=$('#m_def').value.trim(),y=nk($('#m_syn').value);if(d&&!c.def)c.def=d;if(y&&!c.syn)c.syn=y;save();aid=c.id;b.disabled=true;lastErr='';m.textContent=(r.a?'Added "':'"')+c.en+(r.a?'". ':'" is already in your list. ')+'Looking up the other lines…';fillBlank(c);
try{tried.delete(c.id);await getPh(c);await extras(c)}finally{b.disabled=false}
b.textContent='Save changes';fillBlank(c);
const got=[],miss=[];[['Turkish',c.tr],['English meaning',c.def],['synonyms',c.syn],['example',c.ex],['example translation',c.exTr]].forEach(([n,v])=>(v?got:miss).push(n));
m.textContent=(r.a?'Added "':'Found "')+c.en+'". '+(got.length?'Filled in: '+got.join(', ')+'. ':'')+(miss.length?'Not found: '+miss.join(', ')+' (you can type them in). ':'')+'Check and correct the lines, then tap Save changes.'+(lastErr&&miss.length?' Lookup problem: '+lastErr:'');build()};
$('#testv').onclick=()=>{const v=say('G’day! This is your English voice.');$('#vinfo').textContent=v?'Using voice: '+v.name+' ('+v.lang+')':'No English voice found. Install one in Android Settings > General management > Text-to-speech.'};
$('#rem').onclick=()=>{const[h,m]=$('#rt').value.split(':'),d=new Date(),p=n=>String(n).padStart(2,'0'),ds=`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(h)}${p(m)}00`;
dl('flashcards-reminder.ics',['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//baLexi//EN','BEGIN:VEVENT','UID:balexi-daily@local','DTSTAMP:'+ds,'DTSTART:'+ds,'RRULE:FREQ=DAILY','SUMMARY:Vocabulary flashcards','BEGIN:VALARM','TRIGGER:PT0S','ACTION:DISPLAY','DESCRIPTION:Time for your words','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n'),'text/calendar')};
$('#bk').onclick=()=>dl('balexi-backup-'+day()+'.json',JSON.stringify(S),'application/json');
$('#csvx').onclick=()=>{const q=s=>'"'+String(s).replace(/"/g,'""')+'"';dl('balexi-words.csv','English,Turkish,Example,Example TR,Category\n'+S.cards.map(c=>[c.en,c.tr,c.ex,c.exTr,c.cat].map(q).join(',')).join('\n'),'text/csv')};
$('#rs').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!Array.isArray(j.cards))throw 0;if(!confirm('Replace everything on this phone with the backup ('+j.cards.length+' words)?'))return;S.cards=j.cards;S.log=j.log||{};S.set={...S.set,...j.set};save();init();alert('Restored.')}catch(x){alert('That file is not a valid baLexi backup.')}e.target.value=''};
$('#reset').onclick=()=>{if(confirm('Delete ALL words and progress on this phone? Back up first.')&&confirm('Really delete everything?')){S.cards=[];S.log={};save();build()}};
function init(){document.querySelectorAll('#set [data-s]').forEach(i=>{const v=S.set[i.dataset.s];i.type=='checkbox'?i.checked=v:i.value=v});build()}
init();try{navigator.storage?.persist?.()}catch(e){}if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
$('#phall').onclick=async()=>{const m=$('#phmsg');m.textContent='Testing lookup…';try{const t=await phWord('hello');m.textContent=t?'Lookup works: hello = /'+t+'/. Downloading…':'Lookup reached the service but found no result for "hello".'}catch(e){return m.textContent='Lookup failed: '+(e.message||e)+'. Check internet, then try again.'}lastErr='';const L=S.cards.filter(c=>c.ph===undefined||c.pos===undefined||c.def===undefined||c.syn===undefined||!c.tr),b=$('#phall');let i=0;b.disabled=true;
const w=async()=>{while(i<L.length){const c=L[i++];tried.delete(c.id);await getPh(c);$('#phmsg').textContent=`Checked ${i} of ${L.length}…`}};await Promise.all([w(),w(),w()]);b.disabled=false;
$('#phmsg').textContent=`Done. ${S.cards.filter(c=>c.ph).length} of ${S.cards.length} words have pronunciation, ${S.cards.filter(c=>c.pos).length} have a word type, ${S.cards.filter(c=>c.def).length} have an English meaning, ${S.cards.filter(c=>c.syn).length} have synonyms.${lastErr?' Some lookups failed ('+lastErr+'); tap again to retry those.':''} Words not in the dictionary are skipped; you can type them in via Edit.`};
$('#phmsg').textContent='App version '+VER;
