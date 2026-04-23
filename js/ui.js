/* ════════════════════════════════════════════
   js/ui.js  —  UI Rendering (Chronicle Design)
   ════════════════════════════════════════════ */

const UI = (() => {
  const fmt = n => n >= 0 ? '+' + n : '' + n;
  const fmtPct = (v,mx) => Math.max(0,Math.min(100,Math.round((v/mx)*100)));
  const tierLabel = t => t==='success'?'✓ Success':t==='partial'?'~ Partial':'✗ Failure';
  const etClass = e => e.type==='hp'?(e.delta>=0?'hp-gain':'hp-loss'):e.type==='gold'?'gold':e.type==='notoriety'?'not':'item';
  const etLabel = e => e.type==='hp'?(e.delta>=0?'+':'')+e.delta+' HP':e.type==='gold'?(e.delta>=0?'+':'')+e.delta+' Gold':e.type==='notoriety'?(e.delta>=0?'+':'')+e.delta+' Notoriety':e.type==='minions'?(e.delta>=0?'+':'')+e.delta+' Minion':e.type==='maxhp'?'+'+e.delta+' Max HP':e.type==='item'?'+'+e.name:e.type==='rest'?'Rest':e.type;

  function setText(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}
  function setHTML(id,v){const el=document.getElementById(id);if(el)el.innerHTML=v;}

  function renderSidebar() {
    const s=State.get(), c=s.character;
    const circ = 2*Math.PI*34;
    const pct = fmtPct(c.hp,c.maxHp);
    const fill=document.getElementById('hp-ring-fill');
    if(fill){fill.style.strokeDasharray=circ;fill.style.strokeDashoffset=circ*(1-pct/100);}
    setText('hp-ring-val',c.hp);
    setText('hp-ring-max','/'+c.maxHp+' HP');
    setText('char-name',c.name);
    setText('char-class',c.class+' · Level '+c.level);
    setText('cg-hp',c.hp);
    setText('cg-atk',fmt(c.atk));
    setText('cg-def',(c.def+c.atk));
    setText('cg-dmg','1'+c.dmg+(c.atk>0?'+'+c.atk:''));
    const traits=[['STR',c.str],['DEX',c.dex],['CON',c.con],['INT',c.int],['WIS',c.wis]];
    setHTML('traits-list',traits.map(([k,v])=>'<div class="trait-row"><span class="trait-name">'+k+'</span><span class="trait-val '+(v>0?'pos':v<0?'neg':'zero')+'">'+fmt(v)+'</span></div>').join(''));
    setText('ability-count',(c.abilities||[]).length);
    setHTML('abilities-list',(c.abilities||[]).map(a=>'<div class="ability-entry"><span class="ability-name'+(a.perPage&&a.used?' used':'')+'">'+a.name+'</span><span class="ability-desc">'+a.desc+'</span></div>').join(''));
    const inv=Object.entries(c.inventory||{}).filter(([,v])=>v>0);
    setHTML('inventory-list',inv.length?inv.map(([k,v])=>'<div class="inv-row"><span class="inv-name">'+k+'</span><span class="inv-qty">×'+v+'</span></div>').join(''):'<span class="inv-name" style="opacity:0.4">Empty</span>');
    setText('sr-days',s.journal.length+' days');
    const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const d=s.currentDate;
    const dow=new Date(d.year,d.month-1,d.day).toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
    setText('day-eyebrow',dow+' · DAY '+d.day+' OF THE CHRONICLE');
    setHTML('day-h2',months[d.month-1]+' <em>'+d.day+'</em>, '+d.year);
    renderJournal();
  }

  function renderJournal() {
    const entries=[...State.get().journal].reverse();
    setHTML('journal-feed',entries.map((e,i)=>{
      const dot='<div class="jf-dot'+(i<3?' recent':'')+'"></div>';
      const title=e.text.split('.')[0];
      const fx=(e.effects||[]).map(f=>{const p=f.startsWith('+')||f.includes('full')||f.includes('Rest');const n=f.startsWith('-');return '<span class="jf-tag '+(p?'pos':n?'neg':'neu')+'">'+f+'</span>';}).join('');
      return '<div class="jf-entry">'+dot+'<div class="jf-content"><span class="jf-date">'+e.date+'</span><span class="jf-title">'+title+'</span><span class="jf-desc">'+e.text+'</span>'+(fx?'<div class="jf-effects">'+fx+'</div>':'')+'</div></div>';
    }).join('')||'<div style="color:var(--text-muted);font-style:italic;font-size:0.85rem">No entries yet.</div>');
  }

  function showLoading(dateStr) {
    setText('day-chapter','');
    document.getElementById('day-card').innerHTML='<div class="day-loading"><div class="loading-glyph">☽</div><div class="loading-text">The chronicle stirs…</div></div>';
  }

  function showError(dateStr,message) {
    document.getElementById('day-card').innerHTML='<div class="scene-block" style="border-color:var(--blood)"><div class="scene-block-label" style="color:var(--blood-bright)">⚠ Error</div><div class="scene-prose"><p>'+message+'</p><p>Check your API key and retry.</p></div></div><div class="your-move-block"><div class="action-buttons"><button class="action-btn primary" onclick="App.reloadDay()">↺ Retry</button></div></div>';
  }

  function renderDayCard(gm,state){
    const s=state||State.get(), c=s.character;
    if(gm.fantasyDate) setText('day-chapter',gm.fantasyDate);
    if(gm.sceneTitle||gm.fantasyDate) setText('scene-title',(gm.sceneTitle||gm.fantasyDate||'').toUpperCase());
    const totalTasks=(gm.tasks||[]).length;
    let html='';
    if(gm.prevDayNote) html+='<div class="prev-day-note">📖 '+gm.prevDayNote+'</div>';
    if(gm.narrativeHtml) html+='<div class="scene-block"><div class="scene-block-label">The Scene Before You</div><div class="scene-prose"><div class="drop-cap">'+gm.narrativeHtml+'</div></div></div>';
    if(gm.specialNotes) html+='<div class="hint-box">📋 '+gm.specialNotes+'</div>';
    if(gm.isSundayLottery) html+='<div class="lottery-block"><div class="lottery-title">Sunday Lottery — Optional</div><div class="lottery-table">Roll d6 · 1=−2g · 2=−1g · 3=+1g · 4=+2g · 5=+3g · 6=+4g</div><div class="roll-input-row"><input type="number" class="roll-input" id="lottery-input" min="1" max="6" placeholder="d6"><button class="btn-resolve" id="btn-lottery" onclick="UI.resolveLottery()">Apply</button></div><div id="lottery-result"></div></div>';
    if(gm.itemChoices&&gm.itemChoices.length&&s.pendingItemChoice){
      html+='<div class="item-choice-section"><div class="item-choice-label">⚗ High Mage\'s Final Gift — Choose One</div>';
      gm.itemChoices.forEach((item,i)=>{
        const safe=JSON.stringify(JSON.stringify(item)).replace(/"/g,"'");
        html+='<button class="item-choice-btn" id="item-choice-'+i+'" onclick="UI.chooseItem('+i+','+safe+')"><strong>'+item.name+' <span style="color:var(--text-muted);font-weight:400">['+item.slot+']</span></strong><span class="item-slot">'+(item.desc||'')+'</span><span class="item-bonus">'+(item.bonusText||'')+'</span></button>';
      });
      html+='</div>';
    }
    if(gm.choices&&gm.choices.length){
      gm.choices.forEach(ch=>{
        html+='<div class="choice-section"><div class="choice-label">⟁ '+(ch.label||'Choose your approach')+'</div>';
        ch.options.forEach(opt=>{html+='<button class="choice-btn" id="choice-'+opt.id+'" onclick="UI.selectChoice(\''+ch.id+'\',\''+opt.id+'\',this)">'+opt.label+'</button>';});
        html+='</div>';
      });
    }
    if(gm.combatBlocks&&gm.combatBlocks.length){
      gm.combatBlocks.forEach(cb=>{
        html+='<div class="combat-block"><div class="combat-title">⚔ Enemy — '+cb.enemyName+'</div><div class="enemy-stats"><div class="enemy-stat">DEF <span>'+cb.enemyDef+'</span></div><div class="enemy-stat">HP <span>'+cb.enemyHp+'</span></div><div class="enemy-stat">ATK <span>'+cb.enemyAtk+'</span></div><div class="enemy-stat">Full <span>'+cb.enemyFullDmg+'</span></div><div class="enemy-stat">Partial <span>'+cb.enemyPartialDmg+'</span></div><div class="enemy-stat">Gold <span>'+cb.enemyGold+'</span></div>'+(cb.totalRounds?'<div class="enemy-stat">Rounds <span>'+cb.totalRounds+'</span></div>':'')+'</div><div class="combat-formula">Roll d20 '+fmt(c.atk)+' vs DEF '+cb.enemyDef+'. On hit, roll '+c.dmg+' vs HP '+cb.enemyHp+'.'+(cb.notes?' '+cb.notes:'')+'</div></div>';
      });
    }
    const noTasks=!gm.tasks||!gm.tasks.length;
    const noItem=!gm.itemChoices||!gm.itemChoices.length||!s.pendingItemChoice;
    const canAdv=noTasks&&noItem;
    html+='<div class="your-move-block"><div class="ym-header"><span class="ym-label">Your Move</span><span class="ym-remaining" id="tasks-remaining">'+(totalTasks>0?totalTasks+' action'+(totalTasks>1?'s':'')+' remaining today':canAdv?'Ready to advance':'')+'</span></div>';
    if(canAdv) html+='<p class="ym-question" style="font-size:1rem;color:var(--text-muted)">The chronicle awaits your advance.</p>';
    if(gm.tasks&&gm.tasks.length){
      gm.tasks.forEach((task,i)=>{
        html+='<div class="roll-task" id="task-wrap-'+task.id+'"><div class="roll-task-name">'+(i+1)+'. '+task.name+'<span class="roll-badge">'+(task.type==='combat'?'⚔ Combat':'🎲 Roll')+'</span></div><div class="roll-instruction">'+task.instruction+'</div>';
        if(task.thresholds&&task.thresholds.length) html+='<div class="threshold-list">'+task.thresholds.map(t=>'<div class="threshold-item"><strong>'+t.range+':</strong> '+t.outcome+'</div>').join('')+'</div>';
        html+='<div class="roll-input-row"><input type="number" class="roll-input" id="roll-'+task.id+'" placeholder="Total" min="1" max="40" onkeydown="if(event.key===\'Enter\')UI.resolveRoll(\''+task.id+'\')"><button class="btn-resolve" id="btn-'+task.id+'" onclick="UI.resolveRoll(\''+task.id+'\')">Resolve</button><span class="roll-hint">Enter total (die + modifier)</span></div><div id="result-'+task.id+'"></div></div>';
      });
    }
    html+='<div class="action-buttons">';
    if(gm.tasks&&gm.tasks.length) html+='<button class="action-btn" onclick="UI._focusNextRoll()">Roll d20</button><button class="action-btn" disabled>Use Ability</button><button class="action-btn" disabled>Use Item</button>';
    html+='<button class="action-btn primary" id="btn-advance" onclick="App.advanceDay()" '+(canAdv?'':'disabled')+' style="margin-left:auto">'+(canAdv?'Next Day →':'Complete rolls first')+'</button></div></div>';
    document.getElementById('day-card').innerHTML=html;
    window._currentGM=gm; window._tasksResolved=new Set();
  }

  function resolveRoll(taskId){
    const gm=window._currentGM; if(!gm) return;
    const task=(gm.tasks||[]).find(t=>t.id===taskId); if(!task) return;
    const input=document.getElementById('roll-'+taskId);
    const val=parseInt(input.value);
    if(isNaN(val)||val<1){input.style.borderColor='var(--blood-bright)';input.focus();return;}
    input.style.borderColor='';
    const matched=_matchThr(val,task.thresholds);
    const tier=matched?matched.tier:_detTier(val,task.thresholds);
    const outcome=matched?matched.outcome:'Result noted.';
    const effects=matched?(matched.effects||[]):[];
    const notes=GM.applyEffects(effects);
    document.getElementById('result-'+taskId).innerHTML='<div class="result-box '+tier+'"><span class="result-label">'+tierLabel(tier)+' · Total: '+val+'</span><span class="result-text">'+outcome+'</span>'+(notes.length?'<div class="result-tags">'+effects.map(e=>'<span class="rtag '+etClass(e)+'">'+etLabel(e)+'</span>').join('')+'</div>':'')+'</div>';
    input.disabled=true;
    const btn=document.getElementById('btn-'+taskId); btn.disabled=true; btn.textContent='✓';
    document.getElementById('task-wrap-'+taskId).classList.add('resolved');
    window._tasksResolved.add(taskId);
    if(!window._dayEffects)window._dayEffects=[];
    notes.forEach(n=>window._dayEffects.push(n));
    renderSidebar();
    const allDone=(gm.tasks||[]).every(t=>window._tasksResolved.has(t.id));
    if(allDone){const b=document.getElementById('btn-advance');if(b){b.disabled=false;b.textContent='Next Day →';}const r=document.getElementById('tasks-remaining');if(r)r.textContent='All actions resolved';}
  }

  function _matchThr(val,ths){
    if(!ths||!ths.length) return null;
    for(const t of ths){if(_chkR(val,t.range))return t;}
    return ths[ths.length-1];
  }
  function _chkR(val,range){
    if(!range)return false;
    const r=range.toLowerCase(), nums=(r.match(/\d+/g)||[]).map(Number);
    if(r.includes('or less')||r.includes('or fewer'))return nums.length&&val<=nums[0];
    if(r.includes('or more')||r.includes('or higher')||r.includes('+'))return nums.length&&val>=nums[0];
    if(r.includes('to')||r.includes('between')||r.includes('-'))return nums.length>=2&&val>=nums[0]&&val<=nums[1];
    if(nums.length===1)return val===nums[0];
    return false;
  }
  function _detTier(val,ths){
    if(!ths||ths.length<2)return 'partial';
    const nums=ths.flatMap(t=>(t.range.match(/\d+/g)||[]).map(Number)).sort((a,b)=>a-b);
    if(!nums.length)return 'partial';
    if(val>=nums[nums.length-1])return 'success';
    if(val<nums[0]+1)return 'failure';
    return 'partial';
  }
  function _focusNextRoll(){
    const gm=window._currentGM; if(!gm)return;
    for(const t of(gm.tasks||[])){if(!window._tasksResolved.has(t.id)){const i=document.getElementById('roll-'+t.id);if(i){i.focus();return;}}}
  }

  function chooseItem(index,itemJson){
    let item; try{item=typeof itemJson==='string'?JSON.parse(itemJson):itemJson;}catch(e){item=window._currentGM.itemChoices[index];}
    if(!item)return;
    State.equipItem(item.slot,item.name,item.bonuses||{});
    State.get().pendingItemChoice=false;
    State.addNote('Equipped: '+item.name+' ['+item.slot+'] — '+item.bonusText);
    State.addJournalEntry({date:formatDateShort(State.get().currentDate),text:'Chose and equipped '+item.name+' from High Mage\'s gift.',effects:[item.bonusText]});
    State.save();
    document.querySelectorAll('.item-choice-btn').forEach((b,i)=>{b.disabled=true;if(i===index)b.style.borderColor='var(--gold)';});
    const sec=document.querySelector('.item-choice-section');
    if(sec){const rd=document.createElement('div');rd.className='result-box success';rd.innerHTML='<span class="result-label">✓ Equipped</span><span class="result-text">You don the <em>'+item.name+'</em>. '+item.bonusText+'</span>';sec.appendChild(rd);}
    renderSidebar();
    const gm=window._currentGM;
    if(!gm.tasks||!gm.tasks.length){const b=document.getElementById('btn-advance');if(b){b.disabled=false;b.textContent='Next Day →';}}
  }

  function selectChoice(choiceId,optId,btn){
    const sec=btn.closest('.choice-section');
    sec.querySelectorAll('.choice-btn').forEach(b=>{b.classList.remove('chosen');b.disabled=false;});
    btn.classList.add('chosen');
    sec.querySelectorAll('.choice-btn:not(.chosen)').forEach(b=>b.disabled=true);
  }

  function resolveLottery(){
    const input=document.getElementById('lottery-input');
    const val=parseInt(input.value);
    if(isNaN(val)||val<1||val>6)return;
    const delta={1:-2,2:-1,3:1,4:2,5:3,6:4}[val];
    State.applyGoldDelta(delta); renderSidebar();
    input.disabled=true; document.getElementById('btn-lottery').disabled=true;
    document.getElementById('lottery-result').innerHTML='<div class="result-box '+(delta>0?'success':'failure')+'"><span class="result-label">Lottery · Rolled: '+val+'</span><span class="result-text">'+(delta>0?'+':'')+delta+' Gold</span></div>';
  }

  function showModal(title,bodyHtml,actions){
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-body').innerHTML=bodyHtml;
    document.getElementById('modal-actions').innerHTML=(actions||[]).map(a=>'<button class="btn-modal '+(a.cls||'secondary')+'" onclick="'+a.onclick+'">'+a.label+'</button>').join('');
    document.getElementById('modal').classList.remove('hidden');
  }

  function closeModal(){document.getElementById('modal').classList.add('hidden');}

  function setSaveStatus(cls,text){
    const btn=document.querySelector('.tb-btn-primary');
    if(!btn)return;
    const orig=btn.textContent; btn.textContent=text||'SAVE';
    setTimeout(()=>{btn.textContent=orig;},2000);
  }

  function formatDateShort(d){return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month-1]+' '+d.day;}
  function formatDateFull(d){return['January','February','March','April','May','June','July','August','September','October','November','December'][d.month-1]+' '+d.day+', '+d.year;}
  function toggleJournal(){}

  return{renderSidebar,renderJournal,showLoading,showError,renderDayCard,resolveRoll,chooseItem,selectChoice,resolveLottery,showModal,closeModal,setSaveStatus,toggleJournal,formatDateShort,formatDateFull,_focusNextRoll};
})();