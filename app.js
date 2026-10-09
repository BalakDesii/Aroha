(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg) { tg.ready(); tg.expand(); try { tg.setHeaderColor('#f7f5ed'); tg.setBackgroundColor('#f7f5ed'); } catch (_) {} }
  const tasks = [
    {id:'T001',name:'Study / Work',detail:'Focused time',icon:'📚',unit:'hours',value:0,step:.5},
    {id:'T002',name:'Workout',detail:'Move with intention',icon:'🏃',unit:'intensity',value:0,options:['Light','Moderate','Intense']},
    {id:'T003',name:'Meditation',detail:'Minutes of stillness',icon:'☼',unit:'minutes',value:0,step:5},
    {id:'T007',name:'Drink water',detail:'Litres throughout the day',icon:'💧',unit:'litres',value:0,step:.25},
    {id:'T008',name:'Intellectual reading',detail:'Read with attention',icon:'📖',unit:'boolean',value:0},
    {id:'T009',name:'Daily reflection',detail:'Pause and review',icon:'✍️',unit:'boolean',value:0}
  ];
  const $tasks = tasks.map(t => ({...t}));
  const firstName = tg?.initDataUnsafe?.user?.first_name || '';
  if (firstName) $('profile').textContent = '🌱';
  const fmt = new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long',timeZone:'Asia/Kolkata'}).format(new Date());
  $('dateLabel').textContent = fmt.toUpperCase();
  if (firstName) $('.sub').textContent = `Welcome, ${firstName}. Small, honest actions. A little better each day.`;
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function done(t){return Number(t.value)>0;}
  function valueText(t){if(t.unit==='boolean')return done(t)?'Completed':'Not yet checked';if(t.unit==='intensity')return t.value?t.options[Number(t.value)-1]:'Choose intensity';return `${t.value||0} ${t.unit}`;}
  function showToast(text){const e=$('toast');e.textContent=text;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600);}
  function render(){
    $('tasks').innerHTML=$tasks.map((t,i)=>{const isDone=done(t);let controls='';
      if(t.unit==='boolean')controls=`<button class="check" data-action="toggle" data-i="${i}" aria-label="Toggle ${escapeHtml(t.name)}">✓</button>`;
      else if(t.unit==='intensity')controls=`<select class="intensity" data-action="intensity" data-i="${i}" aria-label="Workout intensity"><option value="0">Choose</option>${t.options.map((v,j)=>`<option value="${j+1}" ${Number(t.value)===j+1?'selected':''}>${v}</option>`).join('')}</select>`;
      else controls=`<div class="stepper"><button data-action="minus" data-i="${i}" aria-label="Decrease">−</button><output>${escapeHtml(t.value)}</output><button data-action="plus" data-i="${i}" aria-label="Increase">+</button></div>`;
      return `<article class="task ${isDone?'done':''}"><div class="task-icon">${t.icon}</div><div class="task-copy"><b>${escapeHtml(t.name)}</b><span>${escapeHtml(t.detail)} · ${escapeHtml(valueText(t))}</span></div><div class="controls">${controls}</div></article>`;
    }).join('');
    const count=$tasks.filter(done).length,pct=Math.round(count/$tasks.length*100);const xp=$tasks.reduce((s,t)=>s+(done(t)?(t.unit==='intensity'?Number(t.value):t.unit==='hours'?Number(t.value):t.unit==='minutes'?Math.min(3,Number(t.value)/10):t.unit==='litres'?.5:.5):0),0);
    $('ring').style.setProperty('--pct',pct);$('percent').textContent=`${pct}%`;$('doneCount').innerHTML=`${count} <small>/ ${$tasks.length}</small>`;$('xp').textContent=`${xp.toFixed(xp%1?1:0)} XP`;$('points').textContent=`${xp.toFixed(xp%1?1:0)} XP`;$('momentum').textContent=count===0?'Start with one small step.':count===$tasks.length?'You showed up fully.':"You're showing up.";
  }
  $('tasks').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const t=$tasks[Number(b.dataset.i)];if(!t)return;switch(b.dataset.action){case'toggle':t.value=t.value?0:1;break;case'minus':t.value=Math.max(0,Number((Number(t.value)-t.step).toFixed(2)));break;case'plus':t.value=Number((Number(t.value)+t.step).toFixed(2));break;}render();});
  $('tasks').addEventListener('change',e=>{const s=e.target.closest('select[data-action="intensity"]');if(!s)return;$tasks[Number(s.dataset.i)].value=Number(s.value);render();});
  $('save').addEventListener('click',()=>{
    const selected=$tasks.filter(done).map(t=>({task_id:t.id,value:t.value,unit:t.unit,description:t.unit==='intensity'?t.options[Number(t.value)-1]:`${t.name}: ${t.value}${t.unit==='boolean'?'':' '+t.unit}`}));
    if(!selected.length){showToast('Choose at least one activity first.');return;}
    const payload={type:'aroha_miniapp_checkin_v1',activities:selected,submitted_at:new Date().toISOString()};
    if(tg && typeof tg.sendData==='function'){
      try{tg.sendData(JSON.stringify(payload));$('saveStatus').textContent='Sent to Telegram. The bot must confirm and process the submission before it counts as saved.';showToast('Sent to Aroha for processing.');}
      catch(err){$('saveStatus').textContent='Could not send to Telegram. No save was confirmed.';showToast('Could not send. Please retry inside Telegram.');}
    } else {$('saveStatus').textContent='Preview only — this browser session did not write to your bot.';showToast('Preview only · Open inside Telegram to send.');}
  });
  $('reset').addEventListener('click',()=>{$tasks.forEach(t=>t.value=0);render();showToast('Preview reset.');});
  $('profile').addEventListener('click',()=>showToast(firstName?`Telegram Mini App · ${firstName}`:'Open this app from Telegram for account context.'));
  document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.nav button').forEach(n=>n.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.go).scrollIntoView({behavior:'smooth',block:'start'});}));
  render();
})();
