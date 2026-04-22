/* ════════════════════════════════════════════
   js/gm.js  —  Game Master (Claude API)
   ════════════════════════════════════════════ */

const GM = (() => {

  const HISTORICAL_CONTEXT = `You are the Game Master for "Souls of Saraku" — the 2026 Quest Calendar RPG by Sundial Games LLC.

CORE GAME RULES:
- Player rolls PHYSICAL DICE and reports TOTAL (die + modifier already added).
- STANDARD ROLL: d20 + trait/stat modifier. Higher is better.
- COMBAT: 1) Roll d20+ATK vs enemy DEF to hit. 2) On hit, roll DMG die vs enemy HP. If DMG≥HP enemy dies, gain gold. 3) On miss/survive: enemy attacks. Roll d20+DEF vs enemy ATK. If pass: partial dmg (p). If fail: full dmg (F).
- Abilities applied AFTER seeing roll result.
- SURGES reset each page. Velvet Allure = once per page reroll d20+CHA.
- SUNDAY LOTTERY (optional): Roll d6: 1=-2g,2=-1g,3=+1g,4=+2g,5=+3g,6=+4g.
- REST: Full HP restore, regain surges/spells, remove Poisoned/Cursed, swap equipment. Notoriety=20: reset+1 trait.
- DEBT: Required payment > gold = debt + -2g penalty. No debt for optional purchases.
- NOTORIETY: 0-20 range.

ZERAPHINE MORGRAVE — Blooddrinker Level 1:
  HP/MaxHP/ATK/DEF/DMG: [DYNAMIC from live state]
  STR:-2 DEX:-1 CON:0 INT:0 WIS:+1 CHA:+2 Surges:1/page
  Persuasive(+2 persuade), Velvet Allure(once/page reroll d20+CHA), Monstrous Form(1 Surge:+d4 to STR/DEX/CON)

CAMPAIGN Jan1-26:
Jan1-7 Severin Mortis: Deciphered crow message. Divination spell Effectiveness+3 (revealed 5 Heroes, siege weapons, sewer faction). Reported to Overlord (-3HP). Soul Crystal ritual Power+4.
Jan8-14 Nargle Nightbane: Survived battlefield, looted (+3g). Fought Tobin Goldleaf (Cleric). Gorlash fell, gave warrior death (+2Not, +supplies). Killed Lythariel Moonstride (Ranger). Shut castle gates (Secured Gate).
Jan15-26 Zeraphine (chosen permanently Jan22): Left dungeon with supplies, freed prisoner as distraction. Castle navigation (rallied goblins, poison trap -2HP). Evaded Durnir Mossbeard Druid. Recruited 2 minions. Fought Throga Bloodfury briefly. Reached ritual chamber Jan22, chose Zeraphine, took Rest (full HP). Jan23: Vaelor Spellwright entered, held off 4 rounds (-2HP,+4g). Jan24-25: Vaelor maelstrom, 3 tasks, -3HP total. Jan26: High Mage fell, drained life force, fully restored to 15/15HP.

CURRENT STATE Jan27: HP15/15 Gold8 Not2 Minions2 SoulCrystal+4 Surges1/1 Inventory:{Dragon Fire x1,Nightshade x1,Combat Tonic x1,Health Potion x1} Equipment:none

UPCOMING:
Jan27: Choose 1 of 3 items from High Mage: Warden Death Shield(SHIELD:+1CON+1DEF), Cinch Forgotten Oath(BELT:+1CON+2MaxHP), Tome Forbidden Rites(ITEM:+1CON+1ATK).
Jan28: Navigation map (areas A-E), resource gathering before big fight.
Jan29: Throne room, all 5 Heroes vs Overlord. Player on balcony, choose strategy (sneak/sabotage/diversion -> ATK or DEF bonus).
Jan30: Survive 3 rounds. Each round roll d10: 1-2=Cleric(DEF13,HP5,ATK13,F=1/P=2,g=2), 3-4=Ranger(DEF13,HP5,ATK11,F=2/P=1,g=2), 5-6=Druid(DEF14,HP4,ATK12,F=1/P=0,g=1), 7-8=Barbarian(DEF13,HP4,ATK13,F=1/P=0,g=1), 9-10=Wizard(DEF15,HP6,ATK12,F=2/P=1,g=3).
Jan31/Feb1: Overlord losing. CHOOSE: Betray (note 'Betray Overlord') or Assist (note 'Loyal to Overlord'). Then combat action options for ATK/DEF/DMG/Notoriety bonuses.`;

  function fmt(n) { return n >= 0 ? '+'+n : ''+n; }

  function buildPrompt(year, month, day) {
    const s = State.get(), c = s.character;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateStr = months[month-1]+' '+day+', '+year;
    const dow = new Date(year,month-1,day).toLocaleDateString('en-US',{weekday:'long'});
    const isSunday = dow === 'Sunday';
    const recentJ = s.journal.slice(-5).map(e=>e.date+': '+e.text+(e.effects.length?' ['+e.effects.join(', ')+']':'')).join('\n');
    return HISTORICAL_CONTEXT+`\n\n---\nLIVE STATE for ${dateStr} (${dow}):\n  HP:${c.hp}/${c.maxHp} ATK:${fmt(c.atk)} DEF:${fmt(c.def)} DMG:${c.dmg}\n  STR:${fmt(c.str)} DEX:${fmt(c.dex)} CON:${fmt(c.con)} INT:${fmt(c.int)} WIS:${fmt(c.wis)} CHA:${fmt(c.cha)}\n  Gold:${c.gold} Notoriety:${c.notoriety} Minions:${c.minions} SoulCrystal:${c.soulCrystal}\n  Surges:${c.surges-c.surgesUsed}/${c.surges} Inventory:${JSON.stringify(c.inventory)} Equipment:${JSON.stringify(c.equipment||{})}\n  Conditions:${(c.conditions||[]).join(',')||'none'} Notes:${s.notes.join(' | ')} IsSunday:${isSunday}\n\nRECENT JOURNAL:\n${recentJ}\n\n---\nYOUR TASK AS GAME MASTER FOR ${dateStr.toUpperCase()}:\nBased on the Quest Calendar story for this EXACT date, narrate and mechanize today's events. Be faithful to the calendar. Write narrative in 2nd person. Give EXACT thresholds. For Jan27: 3 item choices as itemChoices (no tasks needed). For Jan28: navigation areas as tasks. For Jan29: choices then tasks. For Jan30: combatBlock with d10 hero randomizer, 3 rounds.\n\nRespond in STRICT JSON only:\n{"fantasyDate":"string","narrativeHtml":"<p>...</p>","prevDayNote":"1 sentence","specialNotes":"string","isSundayLottery":false,"itemChoices":[{"name":"string","slot":"SHIELD","desc":"string","bonuses":{"def":1},"bonusText":"+1 DEF"}],"tasks":[{"id":"t1","name":"string","instruction":"Roll d20 + TRAIT (+n)","type":"roll","thresholds":[{"range":"7 or less","tier":"failure","outcome":"string","effects":[{"type":"hp","delta":-1}]},{"range":"8 to 14","tier":"partial","outcome":"string","effects":[]},{"range":"15 or more","tier":"success","outcome":"string","effects":[{"type":"gold","delta":2}]}]}],"choices":[{"id":"ch1","label":"Choose:","options":[{"id":"A","label":"A) option"},{"id":"B","label":"B) option"}]}],"combatBlocks":[{"enemyName":"string","enemyDef":13,"enemyHp":6,"enemyAtk":13,"enemyFullDmg":2,"enemyPartialDmg":1,"enemyGold":1,"totalRounds":2,"notes":"string"}]}\nEffect types: hp/gold/notoriety/minions/maxhp/item/condition/note/rest`;
  }

  async function callAPI(apiKey, prompt) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2500,messages:[{role:'user',content:prompt}]})
    });
    if (!resp.ok) { const e=await resp.json().catch(()=>({})); throw new Error(e.error?.message||'API error '+resp.status); }
    const data = await resp.json();
    const raw = data.content[0]?.text||'';
    const cleaned = raw.replace(/^```json\s*/m,'').replace(/^```\s*/m,'').replace(/```\s*$/m,'').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('GM returned no valid JSON. Raw: '+raw.slice(0,200));
    return JSON.parse(match[0]);
  }

  async function getDayData(apiKey) {
    const s=State.get(), {year,month,day}=s.currentDate;
    return await callAPI(apiKey, buildPrompt(year,month,day));
  }

  function applyEffects(effects) {
    const notes=[];
    (effects||[]).forEach(e=>{
      switch(e.type){
        case 'hp': State.applyHpDelta(e.delta); notes.push((e.delta>=0?'+':'')+e.delta+' HP'); break;
        case 'gold': State.applyGoldDelta(e.delta); notes.push((e.delta>=0?'+':'')+e.delta+' Gold'); break;
        case 'notoriety': State.applyNotorietyDelta(e.delta); notes.push((e.delta>=0?'+':'')+e.delta+' Not'); break;
        case 'minions': State.applyMinionDelta(e.delta); notes.push((e.delta>=0?'+':'')+e.delta+' Minion'); break;
        case 'maxhp': State.get().character.maxHp+=e.delta; if(e.delta>0)State.applyHpDelta(e.delta); State.save(); notes.push('+'+e.delta+' MaxHP'); break;
        case 'item': State.addInventoryItem(e.name,e.qty||1); notes.push('+'+e.name); break;
        case 'condition': if(!State.get().character.conditions)State.get().character.conditions=[]; State.get().character.conditions.push(e.name); State.save(); break;
        case 'note': State.addNote(e.text); break;
        case 'rest': doRest(); notes.push('Rest taken'); break;
      }
    });
    return notes;
  }

  function doRest() {
    const c=State.char();
    c.hp=c.maxHp; c.surgesUsed=0; c.spellPoints=c.spellPoints||0;
    c.abilities.forEach(a=>{if(a.perPage)a.used=false;});
    c.conditions=(c.conditions||[]).filter(x=>!['Poisoned','Cursed'].includes(x));
    if(c.wounds&&c.wounds.length)c.wounds.shift();
    State.save();
  }

  return { getDayData, applyEffects, doRest, buildPrompt };
})();
