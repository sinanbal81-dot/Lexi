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
function rate(c,q){const L=S.log[day()]??={n:0,ok:0,new:0};if(!c.reps)L.new++;if(c.rv!==day())L.n++;c.rv=day();L.r=(L.r||0)+1;c.seen++;
if(q=='again'){c.lapses++;c.int=0;c.ease=Math.max(1.3,c.ease-.2);c.due=now()+6e5}
else{c.ok++;L.ok++;if(q=='hard'){c.ease=Math.max(1.3,c.ease-.15);c.int=Math.max(1,c.int*1.2)}else{c.int=c.int<1?4:Math.round(c.int*c.ease*1.3);c.ease=Math.min(3,c.ease+.05)}c.due=now()+c.int*864e5}
c.reps++;save()}
/*END*/
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),byId=i=>S.cards.find(c=>c.id==i);
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
let Q=[],cur=null,flip=false,rev=false,H=[],hi=-1;const tried=new Set();let lastErr='';const VER='6';
function say(t){if(!window.speechSynthesis)return alert('Speech is not available in this browser.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),vs=speechSynthesis.getVoices(),n=v=>v.lang.replace('_','-');
u.voice=vs.find(v=>n(v)=='en-AU')||vs.find(v=>/^en-(GB|NZ|US)/.test(n(v)))||vs.find(v=>/^en/.test(n(v)))||null;u.lang=u.voice?n(u.voice):'en-AU';u.rate=S.set.rate;speechSynthesis.speak(u);return u.voice}
function dl(n,t,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type}));a.download=n;a.click()}
function build(){const s=S.set,n=now(),L=S.cards.filter(c=>!s.cat||c.cat===s.cat),nw=L.filter(c=>!c.reps);
Q=s.mode=='daily'?[...L.filter(c=>c.reps&&c.due<=n).sort((a,b)=>a.ease-b.ease),...nw.slice(0,Math.max(0,s.daily-(S.log[day()]?.new||0)))]
:s.mode=='new'?nw.slice(0,50):s.mode=='hard'?shuf(L.filter(c=>c.lapses||(c.reps&&c.ease<2.2))):s.mode=='fav'?shuf(L.filter(c=>c.fav)):shuf(L);H=[];hi=-1;cur=null;next()}
function show(e){cur=e?e.c:null;rev=e?e.rev:false;flip=false;view();if(cur){getPh(cur);if(!rev&&S.set.auto&&$('#study').classList.contains('on'))say(cur.en)}}
function next(){if(hi<H.length-1){hi++;return show(H[hi])}const c=Q.shift();if(!c)return show(null);const e={c,rev:S.set.dir=='tr'||(S.set.dir=='mix'&&Math.random()<.5)};H.push(e);if(H.length>50)H.shift();hi=H.length-1;show(e)}
function prev(){const i=cur?hi-1:hi;if(i<0)return;hi=i;show(H[hi])}
async function phWiki(w){const r=await fetch('https://en.wiktionary.org/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&origin=*&page='+encodeURIComponent(w.toLowerCase()));if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j.error)return'';const t=j.parse&&j.parse.wikitext&&j.parse.wikitext['*']||'',m=[...t.matchAll(/\{\{IPA\|en\|([^}]*)\}\}/g)];
if(!m.length)return'';const pick=m.find(x=>/US|General American/.test(t.slice(Math.max(0,x.index-60),x.index)))||m[0];const p=pick[1].split('|').find(x=>/^\s*[\/\[]/.test(x));return p?p.trim().replace(/^[\/\[]|[\/\]]$/g,''):''}
async function phDict(w){const r=await fetch('https://api.dictionaryapi.dev/v2/entries/en/'+encodeURIComponent(w.toLowerCase()));if(!r.ok)return'';const j=await r.json();for(const e of j){let t=e.phonetic||'';if(!t)for(const p of e.phonetics||[])if(p.text){t=p.text;break}if(t)return t.replace(/^\/|\/$/g,'')}return''}
async function phWord(w){const t=await phWiki(w);if(t)return t;try{return await phDict(w)}catch(e){return''}}
async function getPh(c){if(c.ph!==undefined||tried.has(c.id))return;tried.add(c.id);const ws=c.en.replace(/[^\p{L}'’\- ]/gu,' ').split(' ').filter(Boolean);if(!ws.length||ws.length>4)return;
try{const p=await Promise.all(ws.map(phWord));if(p.every(Boolean)){c.ph='/'+p.join(' ')+'/';save();if(cur===c)view()}}catch(e){lastErr=String(e&&e.message||e)}}
const sel=(k,arr,v)=>`<select data-s="${k}">${arr.map(([a,b])=>`<option value="${esc(a)}"${a==v?' selected':''}>${esc(b)}</option>`).join('')}</select>`;
function drawStudy(){const s=S.set,cats=[...new Set(S.cards.map(c=>c.cat).filter(Boolean))].sort(),due=S.cards.filter(c=>c.reps&&c.due<=now()).length;
let h=`<div class="row">${sel('mode',[['daily','Daily review'],['new','New words'],['hard','Difficult words'],['all','All words'],['fav','Favourites']],s.mode)}${sel('dir',[['mix','Mixed'],['en','English first'],['tr','Turkish first']],s.dir)}${sel('cat',[['','All categories'],...cats.map(c=>[c,c])],s.cat)}</div>`;
if(!S.cards.length)h+='<p class="empty">No words yet. Open Add to import your Google Translate list.</p>';
else if(!cur)h+=`<p class="empty">All done for this set. Words due now: ${due}.<br>Try another mode above.</p>${hi>=0?'<div class="row"><button data-nav="prev">‹ Previous</button></div>':''}`;
else{const c=cur,f=rev?c.tr:c.en,b=rev?c.en:c.tr;
h+=`<div class="card" id="card"><small>${rev?'Turkish → English':'English → Turkish'}, ${Q.length} more after this</small><div class="big">${esc(f)||'(empty)'}</div>${!rev&&c.ph?`<div class="ph">${esc(c.ph)}</div>`:''}${flip?`<hr><div class="big2">${esc(b)||'(no translation)'}</div>${rev&&c.ph?`<div class="ph">${esc(c.ph)}</div>`:''}${c.ex?`<p class="ex">${esc(c.ex)}<br><i>${esc(c.exTr)}</i></p>`:`<p class="ex"><a target="_blank" rel="noopener" href="https://tatoeba.org/en/sentences/search?from=eng&to=tur&query=${encodeURIComponent(c.en)}">Find example sentences</a> or <a href="#" data-edit="${c.id}">add your own</a></p>`}`:'<p class="hint">Tap to reveal</p>'}</div>
<div class="row"><button data-nav="prev"${hi>0?'':' disabled'}>‹ Previous</button><button data-nav="next">Next ›</button></div>
<div class="row"><button id="spk">🔊 Listen</button><button data-fav="${c.id}">${c.fav?'★ Favourite':'☆ Favourite'}</button><button data-edit="${c.id}">✎ Edit</button></div>`;
if(flip)h+='<div class="row3"><button class="again" data-r="again">Again</button><button class="hard" data-r="hard">Hard</button><button class="easy" data-r="easy">Easy</button></div>'}
$('#study').innerHTML=h}
function drawWords(){const q=$('#q').value.toLowerCase(),L=S.cards.filter(c=>(c.en+' '+c.tr+' '+c.cat).toLowerCase().includes(q)).sort((a,b)=>a.en.localeCompare(b.en));
$('#wl').innerHTML=`<p class="meta">${L.length} of ${S.cards.length} words${L.length>200?' (showing 200, search to narrow)':''}</p>`+L.slice(0,200).map(c=>`<div class="w" data-edit="${c.id}"><div><b>${esc(c.en)}</b><br>${esc(c.tr)}</div><div class="meta">${c.fav?'★ ':''}${esc(c.cat)}</div></div>`).join('')}
function drawStats(){const t=S.log[day()]||{n:0,ok:0,new:0},C=S.cards;let n=0,ok=0;for(const k in S.log){n+=S.log[k].r??S.log[k].n;ok+=S.log[k].ok}
const days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5);return[d.toLocaleDateString('en-CA'),d.toLocaleDateString('en-AU',{weekday:'short'})]}),mx=Math.max(1,...days.map(d=>S.log[d[0]]?.n||0)),pc=(a,b)=>b?Math.round(100*a/b)+'%':'–';
$('#stats').innerHTML=`<h2>Progress</h2><div class="k"><div><b>${t.n}</b>reviewed today</div><div><b>${pc(t.ok,t.r??t.n)}</b>accuracy today</div><div><b>${t.new}</b>new words today</div><div><b>${C.filter(c=>c.reps&&c.due<=now()).length}</b>due now</div><div><b>${C.filter(c=>c.reps).length}</b>words learned (seen at least once)</div><div><b>${C.filter(c=>c.int>=21).length}</b>well known (21+ day gap)</div><div><b>${C.filter(c=>c.lapses||(c.reps&&c.ease<2.2)).length}</b>difficult words</div><div><b>${pc(ok,n)}</b>all-time accuracy</div></div>
<h3>Last 7 days</h3><div class="bars" style="margin-bottom:24px">${days.map(d=>`<div style="height:${Math.max(3,100*(S.log[d[0]]?.n||0)/mx)}%"><span>${d[1]}</span></div>`).join('')}</div><p class="meta">Accuracy counts Hard and Easy as correct, Again as incorrect. ${C.length} words in total.</p>`}
function tab(v){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id==v));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));view()}
function view(){const v=$('section.on').id;v=='study'?drawStudy():v=='words'?drawWords():v=='stats'?drawStats():0}
let eid=null;function edit(id){const c=byId(id);if(!c)return;eid=id;for(const f of['en','tr','ex','exTr','cat'])$('#e_'+f).value=c[f];$('#e_ph').value=c.ph||'';$('#dlg').showModal()}
document.addEventListener('click',e=>{const el=e.target.closest('[data-nav],[data-r],[data-fav],[data-edit],[data-v],#card,#spk'),d=el&&el.dataset;if(!el)return;
if(d.v)return tab(d.v);
if(d.nav)return d.nav=='prev'?prev():next();
if(d.r){rate(cur,d.r);if(d.r=='again')Q.push(cur);return next()}
if(d.fav){const c=byId(d.fav);c.fav^=1;save();return view()}
if(d.edit){e.preventDefault();return edit(d.edit)}
if(el.id=='spk')return say(cur.en+(flip&&cur.ex?'. '+cur.ex:''));
if(el.id=='card'&&!flip&&!e.target.closest('a')){flip=true;if(cur.rv!==day()){(S.log[day()]??={n:0,ok:0,new:0}).n++;cur.rv=day();save()}drawStudy();if(rev&&S.set.auto)say(cur.en)}});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset.s;if(!k)return;S.set[k]=t.type=='checkbox'?t.checked:(t.type=='number'||t.type=='range')?+t.value:t.value;save();if(['mode','dir','cat','daily'].includes(k))build()});
$('#q').oninput=drawWords;
$('#sv').onclick=()=>{const c=byId(eid);for(const f of['en','tr','ex','exTr','cat'])c[f]=nk($('#e_'+f).value);const p=nk($('#e_ph').value);if(p)c.ph=p;else delete c.ph;save();$('#dlg').close();view()};
$('#cx').onclick=()=>$('#dlg').close();
$('#del').onclick=()=>{if(confirm('Delete this word?')){S.cards=S.cards.filter(c=>c.id!=eid);save();$('#dlg').close();build()}};
$('#file').onchange=async e=>{const f=e.target.files[0];if(f)$('#paste').value=await f.text()};
$('#imp').onclick=()=>{const t=$('#paste').value;if(!t.trim())return $('#msg').textContent='Choose a file or paste some rows first.';
const cs=toCards(csv(t),$('#swap').checked),r=add(cs);$('#msg').textContent=`Read ${cs.length} rows: ${r.a} added, ${r.d} duplicates merged or skipped.`;$('#paste').value='';$('#file').value='';build()};
$('#addone').onclick=()=>{const o={};for(const f of['en','tr','ex','exTr','cat'])o[f]=$('#m_'+f).value;if(!nk(o.en))return;const r=add([o]);for(const f of['en','tr','ex','exTr','cat'])$('#m_'+f).value='';$('#msg').textContent=r.a?'Word added.':'That word already exists, so I filled any blanks.';build()};
$('#testv').onclick=()=>{const v=say('G’day! This is your English voice.');$('#vinfo').textContent=v?'Using voice: '+v.name+' ('+v.lang+')':'No English voice found. Install one in Android Settings > General management > Text-to-speech.'};
$('#rem').onclick=()=>{const[h,m]=$('#rt').value.split(':'),d=new Date(),p=n=>String(n).padStart(2,'0'),ds=`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(h)}${p(m)}00`;
dl('flashcards-reminder.ics',['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//baLexi//EN','BEGIN:VEVENT','UID:balexi-daily@local','DTSTAMP:'+ds,'DTSTART:'+ds,'RRULE:FREQ=DAILY','SUMMARY:Vocabulary flashcards','BEGIN:VALARM','TRIGGER:PT0S','ACTION:DISPLAY','DESCRIPTION:Time for your words','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n'),'text/calendar')};
$('#bk').onclick=()=>dl('balexi-backup-'+day()+'.json',JSON.stringify(S),'application/json');
$('#csvx').onclick=()=>{const q=s=>'"'+String(s).replace(/"/g,'""')+'"';dl('balexi-words.csv','English,Turkish,Example,Example TR,Category\n'+S.cards.map(c=>[c.en,c.tr,c.ex,c.exTr,c.cat].map(q).join(',')).join('\n'),'text/csv')};
$('#rs').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!Array.isArray(j.cards))throw 0;if(!confirm('Replace everything on this phone with the backup ('+j.cards.length+' words)?'))return;S.cards=j.cards;S.log=j.log||{};S.set={...S.set,...j.set};save();init();alert('Restored.')}catch(x){alert('That file is not a valid baLexi backup.')}e.target.value=''};
$('#reset').onclick=()=>{if(confirm('Delete ALL words and progress on this phone? Back up first.')&&confirm('Really delete everything?')){S.cards=[];S.log={};save();build()}};
function init(){document.querySelectorAll('#set [data-s]').forEach(i=>{const v=S.set[i.dataset.s];i.type=='checkbox'?i.checked=v:i.value=v});build()}
init();try{navigator.storage?.persist?.()}catch(e){}if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
$('#phall').onclick=async()=>{const m=$('#phmsg');m.textContent='Testing lookup…';try{const t=await phWord('hello');m.textContent=t?'Lookup works: hello = /'+t+'/. Downloading…':'Lookup reached the service but found no result for "hello".'}catch(e){return m.textContent='Lookup failed: '+(e.message||e)+'. Check internet, then try again.'}lastErr='';const L=S.cards.filter(c=>c.ph===undefined),b=$('#phall');let i=0;b.disabled=true;
const w=async()=>{while(i<L.length){const c=L[i++];tried.delete(c.id);await getPh(c);$('#phmsg').textContent=`Checked ${i} of ${L.length}…`}};await Promise.all([w(),w(),w()]);b.disabled=false;
$('#phmsg').textContent=`Done. ${S.cards.filter(c=>c.ph).length} of ${S.cards.length} words have pronunciation.${lastErr?' Some lookups failed ('+lastErr+'); tap again to retry those.':''} Words not in the dictionary are skipped; you can type them in via Edit.`};
$('#phmsg').textContent='App version '+VER;
