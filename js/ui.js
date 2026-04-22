/* ════════════════════════════════════════════
   js/ui.js  —  UI Rendering & Interactions
   ════════════════════════════════════════════ */

const UI = (() => {
  let _journalVisible = true;

  const fmt = n => n >= 0 ? '+'+n : ''+n;
  const fmtHpPct = (hp,mx) => Math.max(0,Math.round((hp/mx)*100));
  const hpColor = p => p>60?'linear-gradient(90deg,#c0392b,#e74c3c)':p>30?'linear-gradient(90deg,#e67e22,#f39c12)':'linear-gradient(90deg,#7a1c1c,#c0392b)';
  const etClass = (t,d) => t==='hp'?(d>=0?'hp-gain':'hp-loss'):t==='gold'?(d>=0?'gold-gain':'gold-loss'):t==='notoriety'?(d>=0?'not-gain':'not-loss'):t==='minions'?'minion':'item';
  const etLabel = e => e.type==='hp'?(e.delta>=0?'+':'')+e.delta+' HP':e.type==='gold'?(e.delta>=0?'+':'')+e.delta+' Gold':e.type==='notoriety'?(e.delta>=0?'+':'')+e.delta+' Notoriety':e.type==='minions'?(e.delta>=0?'+':'')+e.delta+' Minion':e.type==='maxhp'?'+'+e.delta+' Max HP':e.type==='item'?'+'+e.name:e.type==='rest'?'Rest':e.type;
  const tierLabel = t => t==='success'?'✓ Success':t==='partial'?'~ Partial':'✗ Failure';

  function renderSidebar() {
    const s=State.get(), c=s.character;
    const pct=fmtHpPct(c.hp,c.maxHp);
    document.getElementById('hdr-char').textContent=c.name+' · '+c.class+' · Lv '+c.level;
    document.getElementById('hp-fill').style.width=pct+'%';
    document.getElementById('hp-fill').style.background=hpColor(pct);
    document.getElementById('hp-text').textContent=c.hp+'/'+c.maxHp;
    document.getElementById('hdr-atk').textContent=fmt(c.atk);
    document.getElementById('hdr-def').textContent=fmt(c.def);
    document.getElementById('hdr-gold').textContent=c.gold;
    document.getElementById('hdr-not').textContent=c.notoriety;
    document.getElementById('hdr-soul').textContent=c.soulCrystal>=0?'+'+c.soulCrystal:c.soulCrystal;
    document.getElementById('hdr-minions').textContent=c.minions;
    document.getElementById('sb-hp').textContent=c.hp;
    document.getElementById('sb-maxhp').textContent=c.maxHp;
    document.getElementById('sb-atk').textContent=fmt(c.atk);
    document.getElementById('sb-atk').className='s-val '+(c.atk>=0?'pos':'neg');
    document.getElementById('sb-def').textContent=fmt(c.def);
    document.getElementById('sb-def').className='s-val '+(c.def>=0?'pos':'neg');
    document.getElementById('sb-dmg').textContent=c.dmg;
    const traits=[['STR',c.str],['DEX',c.dex],['CON',c.con],['INT',c.int],['WIS',c.wis],['CHA',c.cha]];
    document.getElementById('traits-panel').innerHTML=traits.map(([k,v])=>
      '<div class="trait-row"><span class="trait-name">'+k+'</span><span class="trait-val '+(v>0?'pos':v<0?'neg':'zero')+'">'+fmt(v)+'</span></div>'
    ).join('');
    document.getElementById('abilities-panel').innerHTML=c.abilities.map(a=>
      '<div class="ability-entry'+(a.perPage&&a.used?' ability-used':'')+'"><span class="ability-name">'+a.name+'</span><span class="ability-desc">'+a.desc+'</span></div>'
    ).join('');
    const inv=Object.entries(c.inventory).filter(([,v])=>v>0);
    document.getElementById('inv-count').textContent=inv.length;
    document.getElementById('inventory-panel').innerHTML=inv.length
      ?inv.map(([k,v])=>'<div class="inv-item"><span class="inv-name">'+k+'</span><span class="inv-qty">×'+v+'</span></div>').join('')
      :'<span class="muted-text">No items</span>';
    const equip=Object.entries(c.equipment||{});
    document.getElementById('equipment-panel').innerHTML=equip.length
      ?equip.map(([slot,name])=>'<div class="inv-item"><span class="inv-name">'+name+'</span><span class="inv-qty">'+slot+'</span></div>').join('')
      :'<span class="muted-text">None equipped</span>';
    document.getElementById('notes-panel').innerHTML=s.notes.map(n=>'<div class="note-item">'+n+'</div>').join('')||'<span class="muted-text">No notes</span>';
  }

  function renderJournal() {
    const entries=[...State.get().journal].reverse();
    document.getElementById('journal-panel').innerHTML=entries.map(e=>
      '<div class="journal-entry"><span class="journal-date">'+e.date+'</span><span class="journal-text">'+e.text+'</span>'+(e.effects&&e.effects.length?'<br><span class="journal-fx">'+e.effects.join(' · ')+'</span>':'')+'</div>'
    ).join('')||'<span class="muted-text">No entries yet.</span>';
  }

  function toggleJournal() {
    _journalVisible=!_journalVisible;
    document.getElementById('journal-panel').style.display=_journalVisible?'':'none';
    document.getElementById('journal-toggle').textContent=_journalVisible?'Hide':'Show';
  }

  function showLoading(dateStr) {
    const msgs=['The shadows stir…','Consulting the chronicle…','The dark powers align…','Shadows gather…'];
    document.getElementById('day-card').innerHTML=
      '<div class="day-header"><span class="day-date">'+dateStr+'</span></div>'+
      '<div class="day-body"><div class="loading-wrap"><div class="loading-skull">💀</div><div class="loading-text">'+msgs[Math.floor(Math.random()*msgs.length)]+'</div></div></div>';
  }

  function showError(dateStr, message) {
    document.getElementById('day-card').innerHTML=
      '<div class="day-header"><span class="day-date">'+dateStr+'</span></div>'+
      '<div class="day-body"><div class="narrative-block" style="border-color:var(--blood)"><div class="narrative-label" style="color:var(--blood-bright)">⚠ Error</div><div class="narrative-text"><p>'+message+'</p><p>Check your API key and try again.</p></div></div>'+
      '<div class="advance-row"><button class="btn-advance" onclick="App.reloadDay()">↺ Retry</button></div></div>';
  }

  function renderDayCard(gm, state) {
    const s=state||State.get(), c=s.character;
    const {year,month,day}=s.currentDate;
    const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateStr=months[month-1]+' '+day+', '+year;
    let html='<div class="day-header"><span class="day-date">'+dateStr+'</span>'+(gm.fantasyDate?'<span class="day-sub">'+gm.fantasyDate+'</span>':'')+'</div><div class="day-body">';
    if(gm.prevDayNote) html+='<div class="prev-note">📖 <strong>Prev. page:</strong> '+gm.prevDayNote+'</div>';
    html+='<div class="narrative-block"><div class="narrative-label">🎭 The Story</div><div class="narrative-text">'+(gm.narrativeHtml||'')+'</div></div>';
    if(gm.specialNotes) html+='<div class="hint-box">📋 '+gm.specialNotes+'</div>';
    if(gm.isSundayLottery) html+='<div class="lottery-block"><div class="lottery-title">🎲 Sunday Lottery (Optional)</div><div class="lottery-table">1=−2g · 2=−1g · 3=+1g · 4=+2g · 5=+3g · 6=+4g</div><div class="roll-row"><input type="number" class="roll-input" id="lottery-input" min="1" max="6" placeholder="d6"><button class="btn-resolve" id="btn-lottery" onclick="UI.resolveLottery()">Apply</button></div><div id="lottery-result"></div></div>';
    if(gm.itemChoices&&gm.itemChoices.length&&s.pendingItemChoice){
      html+='<div class="item-choice-section"><div class="item-choice-label">⚗ Choose 1 Item — High Mage\'s Final Gift</div>';
      gm.itemChoices.forEach((item,i)=>{
        html+='<button class="item-choice-btn" id="item-choice-'+i+'" onclick=\'UI.chooseItem('+i+','+JSON.stringify(JSON.stringify(item)).replace(/"/g,"\'")+')\'>'+
          '<strong>'+item.name+'</strong><span class="item-slot">['+item.slot+'] '+(item.desc||'')+'</span><span class="item-bonus">'+(item.bonusText||'')+'</span></button>';
      });
      html+='</div>';
    }
    if(gm.choices&&gm.choices.length){
      gm.choices.forEach(ch=>{
        html+='<div class="choice-section"><div class="choice-label">⟁ '+(ch.label||'Choose:')+'</div>';
        ch.options.forEach(opt=>{ html+='<button class="choice-btn" id="choice-'+opt.id+'" onclick="UI.selectChoice(\''+ch.id+'\',\''+opt.id+'\',this)">'+opt.label+'</button>'; });
        html+='</div>';
      });
    }
    if(gm.combatBlocks&&gm.combatBlocks.length){
      gm.combatBlocks.forEach(cb=>{
        html+='<div class="combat-block"><div class="combat-title">⚔ Enemy: '+cb.enemyName+'</div><div class="enemy-stats">'+
          ['DEF '+cb.enemyDef,'HP '+cb.enemyHp,'ATK '+cb.enemyAtk,'Full '+cb.enemyFullDmg,'Partial '+cb.enemyPartialDmg,'Gold '+cb.enemyGold].map(x=>'<div class="enemy-stat">'+x.split(' ')[0]+' <span>'+x.split(' ')[1]+'</span></div>').join('')+
          (cb.totalRounds?'<div class="enemy-stat">Rounds <span>'+cb.totalRounds+'</span></div>':'')+'</div>'+
          '<div class="combat-formula">Your ATK: Roll d20 '+fmt(c.atk)+' vs DEF '+cb.enemyDef+'. On hit, roll '+c.dmg+' vs HP '+cb.enemyHp+'.'+(cb.notes?'<br>'+cb.notes:'')+'</div></div>';
      });
    }
    if(gm.tasks&&gm.tasks.length){
      html+='<div class="roll-section">';
      gm.tasks.forEach((task,i)=>{
        html+='<div class="roll-task" id="task-wrap-'+task.id+'"><div class="roll-task-name">'+(i+1)+'. '+task.name+'<span class="roll-badge '+(task.type==='combat'?'combat':'')+'">'+
          (task.type==='combat'?'⚔ Combat':'🎲 Roll')+'</span></div><div class="roll-instruction">'+task.instruction+'</div>';
        if(task.thresholds&&task.thresholds.length){
          html+='<div class="threshold-list">'+task.thresholds.map(t=>'<div class="threshold-item"><strong>'+t.range+':</strong> '+t.outcome+'</div>').join('')+'</div>';
        }
        html+='<div class="roll-row"><input type="number" class="roll-input" id="roll-'+task.id+'" placeholder="Total" min="1" max="40" onkeydown="if(event.key===\'Enter\')UI.resolveRoll(\''+task.id+'\')"><button class="btn-resolve" id="btn-'+task.id+'" onclick="UI.resolveRoll(\''+task.id+'\')">Resolve</button><span class="roll-hint">Enter total (die + modifier)</span></div><div id="result-'+task.id+'"></div></div>';
      });
      html+='</div>';
    }
    const noTasks=!gm.tasks||!gm.tasks.length;
    const noItem=!gm.itemChoices||!gm.itemChoices.length||!s.pendingItemChoice;
    html+='<div class="advance-row"><span class="advance-hint" id="advance-hint">'+(noTasks&&noItem?'Ready to advance.':'Complete rolls above, then advance.')+'</span><button class="btn-advance" id="btn-advance" onclick="App.advanceDay()" '+(noTasks&&noItem?'':'disabled')+'>Next Day ▶</button></div>';
    html+='</div>';
    document.getElementById('day-card').innerHTML=html;
    window._currentGM=gm;
    window._tasksResolved=new Set();
  }

  function resolveRoll(taskId) {
    const gm=window._currentGM; if(!gm) return;
    const task=(gm.tasks||[]).find(t=>t.id===taskId); if(!task) return;
    const input=document.getElementById('roll-'+taskId);
    const val=parseInt(input.value);
    if(isNaN(val)||val<1){input.style.borderColor='var(--blood-bright)';input.focus();return;}
    input.style.borderColor='';
    const matched=matchThreshold(val,task.thresholds);
    const tier=matched?matched.tier:determineTier(val,task.thresholds);
    const outcome=matched?matched.outcome:'Result noted.';
    const effects=matched?(matched.effects||[]):[];
    const effectNotes=GM.applyEffects(effects);
    const resultDiv=document.getElementById('result-'+taskId);
    resultDiv.innerHTML='<div class="result-box '+tier+'"><span class="result-label">'+tierLabel(tier)+' · Total: '+val+'</span><span class="result-text">'+outcome+'</span>'+(effectNotes.length?'<div class="result-effects">'+effects.map(e=>'<span class="effect-tag '+etClass(e.type,e.delta)+'">'+etLabel(e)+'</span>').join('')+'</div>':'')+'</div>';
    input.disabled=true;
    const btn=document.getElementById('btn-'+taskId);
    btn.disabled=true; btn.textContent='✓ Done';
    document.getElementById('task-wrap-'+taskId).classList.add('resolved');
    window._tasksResolved.add(taskId);
    if(!window._dayEffects)window._dayEffects=[];
    effectNotes.forEach(n=>window._dayEffects.push(n));
    renderSidebar();
    const allDone=(gm.tasks||[]).every(t=>window._tasksResolved.has(t.id));
    if(allDone){document.getElementById('btn-advance').disabled=false;document.getElementById('advance-hint').textContent='All rolls complete — advance when ready.';}
  }

  function matchThreshold(val, thresholds) {
    if(!thresholds||!thresholds.length) return null;
    for(const t of thresholds){if(checkRange(val,t.range))return t;}
    return thresholds[thresholds.length-1];
  }

  function checkRange(val, range) {
    if(!range) return false;
    const r=range.toLowerCase(), nums=(r.match(/\d+/g)||[]).map(Number);
    if(r.includes('or less')||r.includes('or fewer')) return nums.length&&val<=nums[0];
    if(r.includes('or more')||r.includes('or higher')||r.includes('+')) return nums.length&&val>=nums[0];
    if(r.includes('to')||r.includes('between')||r.includes('-')) return nums.length>=2&&val>=nums[0]&&val<=nums[1];
    if(nums.length===1) return val===nums[0];
    return false;
  }

  function determineTier(val, thresholds) {
    if(!thresholds||thresholds.length<2) return 'partial';
    const allNums=thresholds.flatMap(t=>(t.range.match(/\d+/g)||[]).map(Number)).sort((a,b)=>a-b);
    if(!allNums.length) return 'partial';
    if(val>=allNums[allNums.length-1]) return 'success';
    if(val<allNums[0]+1) return 'failure';
    return 'partial';
  }

  function chooseItem(index, itemJson) {
    let item;
    try { item=typeof itemJson==='string'?JSON.parse(itemJson):itemJson; }
    catch(e){ item=window._currentGM.itemChoices[index]; }
    if(!item) return;
    State.equipItem(item.slot,item.name,item.bonuses||{});
    State.get().pendingItemChoice=false;
    State.addNote('Equipped: '+item.name+' ['+item.slot+'] — '+item.bonusText);
    State.addJournalEntry({date:formatDateShort(State.get().currentDate),text:'Chose and equipped '+item.name+' from High Mage gift.',effects:[item.bonusText]});
    State.save();
    document.querySelectorAll('.item-choice-btn').forEach((b,i)=>{b.disabled=true;if(i===index)b.classList.add('chosen');});
    const sec=document.querySelector('.item-choice-section');
    const rd=document.createElement('div'); rd.className='result-box success';
    rd.innerHTML='<span class="result-label">✓ Item Equipped</span><span class="result-text">You equip the <strong>'+item.name+'</strong>. '+item.bonusText+'</span>';
    sec.appendChild(rd);
    renderSidebar();
    const gm=window._currentGM;
    if(!gm.tasks||!gm.tasks.length){document.getElementById('btn-advance').disabled=false;document.getElementById('advance-hint').textContent='Item chosen — ready to advance.';}
  }

  function selectChoice(choiceId, optId, btn) {
    const sec=btn.closest('.choice-section');
    sec.querySelectorAll('.choice-btn').forEach(b=>{b.classList.remove('chosen');b.disabled=false;});
    btn.classList.add('chosen');
    sec.querySelectorAll('.choice-btn:not(.chosen)').forEach(b=>b.disabled=true);
  }

  function resolveLottery() {
    const input=document.getElementById('lottery-input');
    const val=parseInt(input.value);
    if(isNaN(val)||val<1||val>6) return;
    const delta={1:-2,2:-1,3:1,4:2,5:3,6:4}[val];
    State.applyGoldDelta(delta); renderSidebar();
    input.disabled=true; document.getElementById('btn-lottery').disabled=true;
    document.getElementById('lottery-result').innerHTML='<div class="result-box '+(delta>0?'success':'failure')+'"><span class="result-label">Sunday Lottery · Rolled: '+val+'</span><span class="result-text">'+(delta>0?'+':'')+delta+' Gold</span></div>';
  }

  function showModal(title, bodyHtml, actions) {
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-body').innerHTML=bodyHtml;
    document.getElementById('modal-actions').innerHTML=(actions||[]).map(a=>'<button class="btn-modal '+(a.cls||'secondary')+'" onclick="'+a.onclick+'">'+a.label+'</button>').join('');
    document.getElementById('modal').classList.remove('hidden');
  }

  function closeModal() { document.getElementById('modal').classList.add('hidden'); }

  function setSaveStatus(cls, text) {
    const el=document.getElementById('save-status');
    el.className='save-status'+(cls?' '+cls:''); el.textContent=text;
  }

  function formatDateShort(d) {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month-1]+' '+d.day;
  }

  function formatDateFull(d) {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.month-1]+' '+d.day+', '+d.year;
  }

  return { renderSidebar,renderJournal,showLoading,showError,renderDayCard,resolveRoll,chooseItem,selectChoice,resolveLottery,showModal,closeModal,setSaveStatus,toggleJournal,formatDateShort,formatDateFull };
})();