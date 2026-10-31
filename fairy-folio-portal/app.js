/* The Fairy Folio Team Portal - front-end build. Data lives in localStorage (see README). */
const TZ='Asia/Karachi',K='ff_db',$=(s)=>document.querySelector(s),now=()=>Date.now(),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f=ms=>{ms=Math.max(0,Math.floor(ms/1000));return String(Math.floor(ms/60)).padStart(2,'0')+':'+String(ms%60).padStart(2,'0')};
const fh=ms=>{const m=Math.max(0,Math.floor(ms/60000));return Math.floor(m/60)+'h '+m%60+'m'};
const tm=t=>new Date(t).toLocaleTimeString('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit'});
const dt=t=>new Date(t).toLocaleDateString('en-GB',{timeZone:TZ,day:'2-digit',month:'short',year:'numeric'});
const badge=(t,c)=>`<span class="badge ${c}">${esc(t)}</span>`;
const BN={S1:'Short Break 1',S2:'Short Break 2',L:'Long Break',X:'Additional break'};

function seed(){const H=36e5,D=24*H,t=now();
 const users=[['u1','Ayesha Khan','ayesha@fairyfolio.com','Illustrators','employee'],['u2','Sara Ali','sara@fairyfolio.com','Illustrators','intern'],['u3','Zainab Malik','lead@fairyfolio.com','Illustrators','lead'],['u4','Portal Admin','admin@fairyfolio.com','Operations','admin']].map(([id,name,email,team,role])=>({id,name,email,team,role,pw:'fairy123',on:true}));
 const S=(u,d,br)=>{const st=t-d*D;return{id:uid(),uid:u,start:st,end:st+8*H,breaks:br.map(([ty,m,al],i)=>({t:ty,s:st+(2+i)*H,e:st+(2+i)*H+m*6e4,al})),report:{tasks:'Character sketches finished',wip:'Colour pass on book cover',blocks:'',next:'Client review',at:st+8*H,fb:''}}};
 const q=[{q:'How long is each short break?',o:['10 minutes','15 minutes','30 minutes'],a:1},{q:'What must be submitted before closing a session?',o:['A daily shift report','A selfie','Nothing'],a:0}];
 return{users,sessions:[S('u1',1,[['S1',12,15],['L',28,30]]),S('u2',1,[['S1',16,15],['L',38,30],['S2',10,15]]),S('u2',2,[['S1',9,15]])],
 ann:[{id:uid(),title:'Welcome to the Fairy Folio portal',msg:'Start your session each day, log breaks honestly and submit your shift report before closing. Please acknowledge this notice.',cat:'Policy',aud:'all',pin:true,ack:true,acks:{},at:t}],
 courses:[{id:uid(),title:'Digital Illustration Fundamentals',cat:'Craft',type:'Video',min:45,url:'',aud:'all',quiz:[]},{id:uid(),title:'Portal & Break Policy Guide',cat:'Onboarding',type:'Notes',min:10,url:'',aud:'all',quiz:q,pass:50}],
 prog:{},quiz:{},notifs:[],audit:[],policy:{short:15,long:30,endHour:20}}}
let db=JSON.parse(localStorage.getItem(K)||'null')||seed(),me=db.users.find(u=>u.id===sessionStorage.getItem('ffu')),view='',flt={u:'',d:''},last=now();
const save=()=>localStorage.setItem(K,JSON.stringify(db));
const log=(a,d='')=>{db.audit.unshift({by:me?me.name:'system',at:now(),a,d});save()};
const isMgr=u=>u&&(u.role==='lead'||u.role==='admin');
const cur=id=>db.sessions.find(s=>s.uid===id&&!s.end),actB=s=>s&&s.breaks.find(b=>!b.e);
const dur=b=>(b.e||now())-b.s,over=b=>Math.max(0,dur(b)-b.al*6e4),brk=s=>s.breaks.reduce((a,b)=>a+dur(b),0),net=s=>(s.end||now())-s.start-brk(s);
const staff=()=>db.users.filter(u=>!isMgr(u)&&(me.role==='admin'||u.team===me.team));
const A=()=>[['S1',db.policy.short],['S2',db.policy.short],['L',db.policy.long]];
function exc(s){const r=[];s.breaks.forEach(b=>{if(b.t==='X')r.push('Additional break');else if(over(b))r.push(BN[b.t]+' overrun +'+f(over(b)))});
 if(!s.end&&(now()-s.start>14*36e5||new Date(now()).getHours()>=db.policy.endHour))r.push('Session left open');if(s.report&&s.report.override)r.push('Closed by override: '+s.report.override);return r}
function notify(to,text){db.notifs.push({to,text,at:now()});save()}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600)}
function modal(h){const d=$('#dlg');d.innerHTML=h+'<form method="dialog" style="margin-top:12px"><button class="btn ghost">Close</button></form>';d.showModal()}
const navs={employee:[['dash','Dashboard'],['hist','My Attendance'],['learn','Learning Hub'],['ann','Announcements']],lead:[['team','Team Overview'],['reports','Attendance & Reports'],['learn','Learning Progress'],['ann','Announcements']]};
navs.intern=navs.employee;navs.admin=[...navs.lead.slice(0,2),['emps','Employees & Teams'],['learn','Learning Management'],['ann','Announcements'],['policy','Policy Settings'],['audit','Audit Log']];

/* ---------- views ---------- */
const V={
dash(){const s=cur(me.id),b=actB(s),td=db.sessions.filter(x=>x.uid===me.id&&x.end&&dt(x.end)===dt(now())).length;
 const st=!s?(td?'Closed':'Not Started'):b?(b.t==='L'?'On Long Break':b.t==='X'?'On Additional Break':'On Short Break'):'Working';
 const used=k=>s&&s.breaks.find(x=>x.t===k),all=s&&A().every(([k])=>used(k));
 const cards=A().map(([k,m])=>{const u=used(k);let body,btn='';
  if(!u){body=`<span class="mut">Available: ${m} minutes</span>`;btn=`<button class="btn" data-a="brk" data-t="${k}" ${!s||b?'disabled':''}>Start break</button>`}
  else if(!u.e){body=`<span class="tm" data-s="${u.s}" data-al="${u.al}"></span> of ${f(u.al*6e4)}`;btn='<button class="btn warn" data-a="endb">End break</button>'}
  else body=`Used ${f(dur(u))} of ${f(u.al*6e4)} `+(over(u)?badge('Overrun +'+f(over(u)),'bad'):badge('Within allowance','ok'));
  return`<div class="card"><h4>${BN[k]}</h4>${body}<div style="margin-top:8px">${btn}</div></div>`}).join('');
 const xs=(s?s.breaks.filter(x=>x.t==='X'):[]).map(x=>`<div class="card"><h4>Additional break</h4>${x.e?'Used '+f(dur(x)):`<span class="tm over" data-s="${x.s}" data-al="0"></span>`} ${badge('Flagged','bad')}<div style="margin-top:8px">${x.e?'':'<button class="btn warn" data-a="endb">End break</button>'}</div></div>`).join('');
 const r=(s&&s.report)||{},ns=db.notifs.filter(n=>n.to===me.id).slice(0,4),pend=db.ann.filter(a=>visA(a)&&a.ack&&!a.acks[me.id]).length;
 return`<h2>Hello, ${esc(me.name.split(' ')[0])}</h2><div id="al" class="banner bad" role="alert" hidden></div>
 <div class="card hero"><div><div class="mut">Status (${TZ})</div><div class="big">${st}</div>${badge(st,s?(b?'warn':'ok'):'info')} ${s?`<div>Started ${tm(s.start)} · Working time <b id="el" data-s="${s.start}"></b></div>`:''}</div>
  ${!s?'<button class="btn" data-a="start">Start session</button>':''}</div>
 ${pend?`<div class="banner" style="background:var(--cream)">You have ${pend} announcement(s) to acknowledge. <a href="#" data-a="go" data-v="ann">Open announcements</a></div>`:''}
 <h3>Break allowances</h3><div class="grid">${cards}${xs}</div>
 ${s&&all&&!b?'<button class="btn ghost" data-a="brk" data-t="X">Start additional break (will be flagged)</button>':''}
 ${s?`<div class="card"><h3>Daily shift report</h3><p class="mut">Required before you can close your session. Drafts save automatically.</p>
  ${[['tasks','Tasks completed *'],['wip','Work in progress *'],['blocks','Blockers / challenges'],['next','Next steps (optional)']].map(([k,l])=>`<label for="r_${k}">${l}</label><textarea id="r_${k}" rows="2" data-rep="${k}">${esc(r[k])}</textarea>`).join('')}
  <p><button class="btn" data-a="close">Submit report & close session</button></p></div>`:''}
 <div class="card"><h4>Alerts</h4>${ns.map(n=>`<div>${badge('Alert','warn')} ${esc(n.text)} <span class="mut">${tm(n.at)}</span></div>`).join('')||'<span class="mut">No alerts. All clear.</span>'}</div>
 <div class="card"><h4>Break policy</h4>Per session: two short breaks (${db.policy.short} min), one long break (${db.policy.long} min). Extra breaks are recorded and flagged for review.</div>`},
hist(){const L=db.sessions.filter(s=>s.uid===me.id).sort((a,b)=>b.start-a.start);return`<h2>My attendance</h2>${table(L,false)}`},
team(){const E=staff(),T=db.sessions.filter(s=>E.some(e=>e.id===s.uid)),open=T.filter(s=>!s.end),X=T.filter(s=>exc(s).length&&!s.rev).sort((a,b)=>b.start-a.start).slice(0,12);
 return`<h2>Team overview</h2><div class="grid">${[['Working',open.filter(s=>!actB(s)).length],['On break',open.filter(actB).length],['Not started',E.filter(e=>!cur(e.id)).length],['Open exceptions',X.length]].map(([l,n])=>`<div class="card"><div class="mut">${l}</div><div class="big tm">${n}</div></div>`).join('')}</div>
 <div class="scroll"><table><tr><th>Team member</th><th>Status</th><th>Started</th><th>Break</th><th>Action</th></tr>${E.map(e=>{const s=cur(e.id),b=actB(s);return`<tr><td>${esc(e.name)}<br><span class="mut">${esc(e.role)}</span></td><td>${s?(b?badge(over(b)&&b.t!=='X'?'Overrun':'On break','warn'):badge('Working','ok')):badge(e.on?'Not started':'Inactive','info')}</td><td>${s?tm(s.start):'-'}</td><td>${b?BN[b.t]+' '+f(dur(b)):'-'}</td><td>${s?`<button class="btn sm ghost" data-a="ovr" data-id="${s.id}">Close with override</button>`:''}</td></tr>`}).join('')}</table></div>
 <h3 style="margin-top:20px">Exceptions to review</h3>${X.map(s=>`<div class="card">${esc(uname(s.uid))} · ${dt(s.start)}<br>${exc(s).map(x=>badge(x,'bad')).join(' ')} <button class="btn sm" data-a="rev" data-id="${s.id}">Mark reviewed</button></div>`).join('')||'<div class="card mut">No exceptions waiting.</div>'}
 <h3>Alerts</h3><div class="card">${db.notifs.filter(n=>n.to==='mgr').slice(0,6).map(n=>`<div>${badge('Alert','warn')} ${esc(n.text)} <span class="mut">${dt(n.at)} ${tm(n.at)}</span></div>`).join('')||'<span class="mut">None.</span>'}</div>`},
reports(){const E=staff(),L=db.sessions.filter(s=>E.some(e=>e.id===s.uid)&&(!flt.u||s.uid===flt.u)&&(!flt.d||new Date(s.start).toISOString().slice(0,10)>=flt.d)).sort((a,b)=>b.start-a.start);
 return`<h2>Attendance & reports</h2><div class="card row"><div><label for="fu">Employee</label><select id="fu" data-flt="u"><option value="">All</option>${E.map(e=>`<option value="${e.id}" ${flt.u===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></div><div><label for="fd">From date</label><input type="date" id="fd" data-flt="d" value="${flt.d}"></div><button class="btn" data-a="csv">Export CSV</button></div>${table(L,true)}`},
learn(){const mg=isMgr(me),C=db.courses.filter(c=>mg||c.aud==='all'||c.aud===me.team),pr=db.prog[me.id]||[];
 return`<h2>${mg?'Learning management':'Learning Hub'}</h2><div class="grid">${C.map(c=>{const el=db.users.filter(u=>!isMgr(u)&&(c.aud==='all'||c.aud===u.team)),dn=el.filter(u=>(db.prog[u.id]||[]).includes(c.id)).length,done=pr.includes(c.id),qs=db.quiz[me.id]&&db.quiz[me.id][c.id];
  return`<div class="card"><h4>${esc(c.title)}</h4>${badge(c.cat,'info')} ${badge(c.type,'info')} <span class="mut">${c.min} min</span><br>
  ${mg?`<p>Completion: <b>${dn}/${el.length}</b> assigned (${c.aud==='all'?'all staff':esc(c.aud)})</p>`:`<p>${done?badge('Completed','ok'):badge('Not completed','warn')} ${qs?`Quiz ${qs.score}%`:''}</p>
  ${c.url?`<a class="btn sm ghost" href="${esc(c.url)}" target="_blank" rel="noopener">Open resource</a> `:''}${done?'':`<button class="btn sm" data-a="done" data-id="${c.id}">Mark complete</button> `}${c.quiz.length?`<button class="btn sm" data-a="quiz" data-id="${c.id}">${qs?'Retake':'Take'} quiz</button>`:''}`}</div>`}).join('')}</div>
 ${me.role==='admin'?`<div class="card"><h3>Add learning item</h3><form data-f="course"><div class="row"><div><label>Title<input name="title" required></label></div><div><label>Category<input name="cat" value="General"></label></div><div><label>Type<select name="type"><option>Video</option><option>Notes</option><option>PDF</option><option>Link</option><option>Lesson</option></select></label></div><div><label>Minutes<input name="min" type="number" value="15" min="1"></label></div></div>
 <div class="row"><div><label>Link / video URL<input name="url" type="url"></label></div><div><label>Audience<select name="aud"><option value="all">All staff</option>${[...new Set(db.users.map(u=>u.team))].map(t=>`<option>${esc(t)}</option>`).join('')}</select></label></div></div>
 <label>Quiz (optional, one per line: Question | option A ; option B ; option C | correct number)<textarea name="quiz" rows="3" placeholder="Which colour is sage? | Green ; Pink | 1"></textarea></label><p><button class="btn">Publish item</button></p></form></div>`:''}`},
ann(){const L=db.ann.filter(visA).sort((a,b)=>(b.pin-a.pin)||b.at-a.at),mg=isMgr(me);
 return`<h2>Announcements</h2>${L.map(a=>`<div class="card">${a.pin?badge('Pinned','info')+' ':''}${badge(a.cat,'info')} <h3>${esc(a.title)}</h3><p>${esc(a.msg)}</p><span class="mut">${dt(a.at)} · for ${a.aud==='all'?'all staff':esc(a.aud)}</span><br>
  ${a.ack?(mg?badge(Object.keys(a.acks).length+' acknowledged','ok'):(a.acks[me.id]?badge('Acknowledged '+tm(a.acks[me.id]),'ok'):`<button class="btn sm" data-a="ack" data-id="${a.id}">Acknowledge</button>`)):''}</div>`).join('')||'<div class="card mut">Nothing posted yet.</div>'}
 ${mg?`<div class="card"><h3>Publish announcement</h3><form data-f="ann"><label>Title<input name="title" required></label><label>Message<textarea name="msg" rows="3" required></textarea></label><div class="row"><div><label>Category<input name="cat" value="General"></label></div><div><label>Audience<select name="aud"><option value="all">All staff</option>${[...new Set(db.users.map(u=>u.team))].map(t=>`<option>${esc(t)}</option>`).join('')}</select></label></div></div>
 <label><input type="checkbox" name="pin" style="width:auto"> Pin to top</label><label><input type="checkbox" name="ack" style="width:auto"> Require acknowledgement</label><p><button class="btn">Publish</button></p></form></div>`:''}`},
emps(){return`<h2>Employees & teams</h2><div class="scroll"><table><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Status</th><th></th></tr>${db.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td>${esc(u.team)}</td><td>${u.on?badge('Active','ok'):badge('Inactive','bad')}</td><td>${u.id===me.id?'':`<button class="btn sm ghost" data-a="tog" data-id="${u.id}">${u.on?'Deactivate':'Activate'}</button>`}</td></tr>`).join('')}</table></div>
 <div class="card" style="margin-top:14px"><h3>Invite team member</h3><p class="mut">No public sign-up. New accounts start with password <b>fairy123</b>.</p><form data-f="emp"><div class="row"><div><label>Name<input name="name" required></label></div><div><label>Email<input name="email" type="email" required></label></div><div><label>Team<input name="team" value="Illustrators" required></label></div><div><label>Role<select name="role"><option>employee</option><option>intern</option><option>lead</option><option>admin</option></select></label></div></div><p><button class="btn">Create account</button></p></form></div>`},
policy(){const p=db.policy;return`<h2>Policy settings</h2><div class="card"><form data-f="pol"><div class="row"><div><label>Short break (minutes)<input name="short" type="number" min="1" value="${p.short}"></label></div><div><label>Long break (minutes)<input name="long" type="number" min="1" value="${p.long}"></label></div><div><label>Expected session end (hour, 0-23)<input name="endHour" type="number" min="0" max="23" value="${p.endHour}"></label></div></div><p class="mut">Tip: set breaks to 1 minute to test overrun alerts quickly. Changes apply to new breaks only.</p><button class="btn">Save policy</button></form></div>`},
audit(){return`<h2>Audit log</h2><div class="scroll"><table><tr><th>When</th><th>Actor</th><th>Action</th><th>Details</th></tr>${db.audit.slice(0,150).map(a=>`<tr><td>${dt(a.at)} ${tm(a.at)}</td><td>${esc(a.by)}</td><td>${esc(a.a)}</td><td>${esc(a.d)}</td></tr>`).join('')}</table></div>`}};
const uname=id=>(db.users.find(u=>u.id===id)||{}).name||'?';
const visA=a=>isMgr(me)||a.aud==='all'||a.aud===me.team;
function table(L,mg){return`<div class="scroll"><table><tr><th>Date</th>${mg?'<th>Employee</th>':''}<th>Start - End</th><th>Net work</th><th>Breaks</th><th>Status</th><th></th></tr>${L.map(s=>{const x=exc(s);return`<tr><td>${dt(s.start)}</td>${mg?`<td>${esc(uname(s.uid))}</td>`:''}<td>${tm(s.start)} - ${s.end?tm(s.end):'open'}</td><td>${fh(net(s))}</td><td>${s.breaks.map(b=>`${b.t} ${f(dur(b))}`).join(', ')||'-'}</td><td>${x.length?x.map(e=>badge(e,'bad')).join(' '):badge('Normal','ok')}${s.rev?' '+badge('Reviewed','info'):''}</td><td><button class="btn sm ghost" data-a="view" data-id="${s.id}">Details</button>${me.role==='admin'&&mg?` <button class="btn sm ghost" data-a="fix" data-id="${s.id}">Correct</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="7" class="mut">No records yet.</td></tr>'}</table></div>`}

/* ---------- rendering ---------- */
function render(){const app=$('#app');
 if(!me){app.innerHTML=`<div class="login"><div class="card"><img src="assets/logo.png" alt="The Fairy Folio fairy logo"><h2>The Fairy Folio</h2><p class="mut">Where Imagination Meets Creativity<br>Team Management & Learning Portal</p><form data-f="login"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="username"><label for="pw">Password</label><input id="pw" name="pw" type="password" required autocomplete="current-password"><p><button class="btn" style="width:100%">Sign in</button></p></form>
 <p class="mut">Demo accounts (password fairy123):</p><div class="demo">${db.users.map(u=>`<button class="btn sm ghost" data-a="fill" data-e="${u.email}">${u.role}</button>`).join('')}</div></div></div>`;return}
 const n=navs[me.role];if(!view||!n.some(x=>x[0]===view))view=n[0][0];
 app.innerHTML=`<aside><div class="brand"><img src="assets/logo.png" alt="">The Fairy Folio</div>${n.map(([k,l])=>`<button class="nav ${k===view?'on':''}" data-a="go" data-v="${k}">${l}</button>`).join('')}<div class="who">${esc(me.name)}<br><span class="mut" style="color:#fff9">${me.role} · ${esc(me.team)}</span><br><button class="btn sm" style="margin-top:8px" data-a="out">Log out</button></div></aside><main>${V[view]()}</main>`;tick()}
function tick(){document.querySelectorAll('.tm[data-s]').forEach(e=>{const d=now()-e.dataset.s,al=e.dataset.al*6e4;e.textContent=f(d);e.classList.toggle('over',d>al)});
 const el=$('#el');if(el)el.textContent=fh(net(cur(me.id)||{start:+el.dataset.s,breaks:[]}));
 const s=me&&cur(me.id),b=actB(s),al=$('#al');
 if(b&&b.t!=='X'&&now()-b.s>b.al*6e4){const o=f(now()-b.s-b.al*6e4);if(al){al.hidden=false;al.textContent=`${BN[b.t]} overrun by ${o}. Please end your break.`}
  if(!b.n){b.n=1;notify(me.id,`${BN[b.t]} exceeded its allowance`);notify('mgr',`${me.name}: ${BN[b.t]} exceeded its allowance`);save();toast('Break allowance reached')}}else if(al)al.hidden=true}
setInterval(()=>{if(!me)return;if(now()-last>30*6e4){out();toast('Signed out after inactivity')}else tick()},1000);
setInterval(()=>{if(me&&view==='team'&&!$('#dlg').open)render()},15000);
['click','keydown'].forEach(e=>document.addEventListener(e,()=>last=now()));

/* ---------- actions ---------- */
function out(){log('Logout');sessionStorage.removeItem('ffu');me=null;view='';render()}
function csv(L){const r=[['Date','Employee','Start','End','Net minutes','Breaks','Exceptions']];L.forEach(s=>r.push([dt(s.start),uname(s.uid),tm(s.start),s.end?tm(s.end):'',Math.round(net(s)/6e4),s.breaks.map(b=>b.t+':'+f(dur(b))).join(' '),exc(s).join('; ')]));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.map(x=>x.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'}));a.download='attendance.csv';a.click();log('Export','attendance CSV')}
const Act={
 fill(d){$('#em').value=d.e;$('#pw').value='fairy123'},go(d){view=d.v;render()},out,
 start(){if(cur(me.id))return;db.sessions.push({id:uid(),uid:me.id,start:now(),end:null,breaks:[],report:{}});log('Session started');render()},
 brk(d){const s=cur(me.id);if(!s||actB(s))return;const k=d.t;if(k!=='X'&&s.breaks.some(b=>b.t===k))return;if(k==='X'&&!A().every(([t])=>s.breaks.some(b=>b.t===t)))return;
  s.breaks.push({t:k,s:now(),e:null,al:k==='X'?0:Object.fromEntries(A())[k]});if(k==='X'){notify('mgr',me.name+' started an additional break');}log('Break started',BN[k]);render()},
 endb(){const b=actB(cur(me.id));if(!b)return;b.e=now();log('Break ended',BN[b.t]+' '+f(dur(b)));render()},
 close(){const s=cur(me.id);if(!s)return;if(actB(s))return toast('End your active break first');const r=s.report;if(!(r.tasks||'').trim()||!(r.wip||'').trim())return toast('Complete tasks and work in progress to close');
  s.end=now();r.at=now();log('Session closed',fh(net(s)));toast('Session closed. Net work '+fh(net(s)));render()},
 ovr(d){const s=db.sessions.find(x=>x.id===d.id),why=prompt('Reason for closing this session on the employee\'s behalf?');if(!why)return;if(actB(s))actB(s).e=now();s.end=now();s.report={...s.report,override:why,at:now()};log('Override close',uname(s.uid)+': '+why);render()},
 rev(d){const s=db.sessions.find(x=>x.id===d.id),n=prompt('Review note (optional)')||'';s.rev={by:me.name,n,at:now()};log('Exception reviewed',uname(s.uid)+' '+n);render()},
 fix(d){const s=db.sessions.find(x=>x.id===d.id),t=prompt('Break to correct (S1, S2, L or X)'),b=s.breaks.find(x=>x.t===t);if(!b)return toast('No such break');const m=parseFloat(prompt('New break length in minutes'));if(isNaN(m))return;const why=prompt('Reason for correction (required)');if(!why)return;
  const old=f(dur(b));b.e=b.s+m*6e4;b.fix=true;log('Break corrected',`${uname(s.uid)} ${t}: ${old} to ${f(dur(b))}. Reason: ${why}`);render()},
 view(d){const s=db.sessions.find(x=>x.id===d.id),r=s.report||{};modal(`<h3>${esc(uname(s.uid))} · ${dt(s.start)}</h3><p>Net work: <b>${fh(net(s))}</b></p>${s.breaks.map(b=>`<div>${BN[b.t]}: ${f(dur(b))} ${over(b)?badge('Overrun +'+f(over(b)),'bad'):''}${b.fix?badge('Corrected','info'):''}</div>`).join('')}
  <h4 style="margin-top:12px">Shift report</h4>${[['tasks','Completed'],['wip','In progress'],['blocks','Blockers'],['next','Next steps']].map(([k,l])=>`<p><b>${l}:</b> ${esc(r[k])||'-'}</p>`).join('')}<p><b>Feedback:</b> ${esc(r.fb)||'-'}</p>
  ${isMgr(me)&&s.end?`<form data-f="fb" data-id="${s.id}"><label>Add feedback<textarea name="fb" rows="2"></textarea></label><button class="btn sm">Save feedback</button></form>`:''}`)},
 csv(){csv(db.sessions.filter(s=>staff().some(e=>e.id===s.uid)&&(!flt.u||s.uid===flt.u)))},
 done(d){(db.prog[me.id]=db.prog[me.id]||[]).push(d.id);save();render()},
 quiz(d){const c=db.courses.find(x=>x.id===d.id);modal(`<h3>${esc(c.title)} quiz</h3><form data-f="quiz" data-id="${c.id}">${c.quiz.map((q,i)=>`<fieldset><legend><b>${esc(q.q)}</b></legend>${q.o.map((o,j)=>`<label style="font-weight:400"><input type="radio" name="q${i}" value="${j}" style="width:auto" required> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}<p><button class="btn">Submit answers</button></p></form>`)},
 ack(d){db.ann.find(a=>a.id===d.id).acks[me.id]=now();log('Acknowledged announcement');render()},
 tog(d){const u=db.users.find(x=>x.id===d.id);u.on=!u.on;log(u.on?'Account activated':'Account deactivated',u.name);render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&Act[b.dataset.a]){e.preventDefault();Act[b.dataset.a](b.dataset)}});
document.addEventListener('input',e=>{const k=e.target.dataset.rep;if(k){const s=cur(me.id);if(s){s.report[k]=e.target.value;save()}}});
document.addEventListener('change',e=>{const k=e.target.dataset.flt;if(k){flt[k]=e.target.value;render()}});
document.addEventListener('submit',e=>{const F=e.target.dataset.f;if(!F)return;e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 if(F==='login'){const lk=+sessionStorage.getItem('lock')||0;if(now()<lk)return toast('Too many attempts. Wait 30 seconds.');const u=db.users.find(x=>x.email===d.email.trim().toLowerCase()&&x.pw===d.pw&&x.on);
  if(!u){const n=(+sessionStorage.getItem('fails')||0)+1;sessionStorage.setItem('fails',n);if(n>=5){sessionStorage.setItem('lock',now()+3e4);sessionStorage.setItem('fails',0)}db.audit.unshift({by:d.email,at:now(),a:'Failed login',d:''});save();return toast('Email or password is incorrect')}
  me=u;sessionStorage.setItem('ffu',u.id);log('Login');view='';render();return}
 if(F==='quiz'){const c=db.courses.find(x=>x.id===e.target.dataset.id),ok=c.quiz.filter((q,i)=>+d['q'+i]===q.a).length,sc=Math.round(ok/c.quiz.length*100),q=(db.quiz[me.id]=db.quiz[me.id]||{}),n=(q[c.id]?q[c.id].n:0)+1;q[c.id]={score:sc,n,at:now()};
  const pass=sc>=(c.pass||50);if(pass&&!(db.prog[me.id]||[]).includes(c.id))(db.prog[me.id]=db.prog[me.id]||[]).push(c.id);save();$('#dlg').close();render();return toast(`Score ${sc}%. ${pass?'Passed!':'Not passed yet. Try again.'}`)}
 if(F==='fb'){const s=db.sessions.find(x=>x.id===e.target.dataset.id);s.report.fb=d.fb;log('Feedback added',uname(s.uid));$('#dlg').close();return toast('Feedback saved')}
 if(F==='course'){const quiz=d.quiz.split('\n').filter(x=>x.trim()).map(l=>{const p=l.split('|');return{q:p[0].trim(),o:(p[1]||'').split(';').map(x=>x.trim()),a:(+p[2]||1)-1}});db.courses.push({id:uid(),title:d.title,cat:d.cat,type:d.type,min:+d.min,url:d.url,aud:d.aud,quiz});log('Learning published',d.title)}
 if(F==='ann'){db.ann.push({id:uid(),title:d.title,msg:d.msg,cat:d.cat,aud:d.aud,pin:!!d.pin,ack:!!d.ack,acks:{},at:now()});log('Announcement published',d.title)}
 if(F==='emp'){db.users.push({id:uid(),name:d.name,email:d.email.toLowerCase(),team:d.team,role:d.role,pw:'fairy123',on:true});log('Account created',d.email)}
 if(F==='pol'){db.policy={short:+d.short,long:+d.long,endHour:+d.endHour};log('Policy changed',JSON.stringify(db.policy))}
 save();render();toast('Saved')});
render();
