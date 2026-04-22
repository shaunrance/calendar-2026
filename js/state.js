/* ════════════════════════════════════════════
   js/state.js  —  Game State & Defaults
   ════════════════════════════════════════════ */

const MONTH_PDF_IDS = {
  1:  '1MGjZb2HrBq9pPxRoPhiQDXTDlxD9NltT',
  2:  '1wLPf_b1UkpjEeyc1KoEXulWJSji8sxjv',
  3:  '1LebNuETHNkuUG6vuHPAbHU4NEGgAsJFh',
  4:  '1RLy2qN-1WvOGc3fGAruydCR8I2qhq5nl',
  5:  '1Z-vu8GpCkkeJDMcG8jr5J4pvCdvwWmlT',
  6:  '1SpHD9p6w10DDNBZQudtNuxBCH_fqpayQ',
  7:  '1Pj5hqiUbQIvUVsZK9Lm2amJPP8V2FD',
  8:  '11z-ks_FURi5VJhFUTtQUNVw1MPPxel-X',
  9:  '1EbMzYbQ9mXwXduxoOYCss4PFqgJkrFeo',
  10: '1zW4e_4FMt86Jh1wua4s4z1OGo9OMmWID',
  11: '1q46M4PToVl4-4gMIOWs1WwYAJQc--khc',
  12: '1iMJgwq2JXPbXGamtIDk_pt8MfGAjIiZ7'
};

const DEFAULT_STATE = {
  version: 1,
  currentDate: { year: 2026, month: 1, day: 27 },
  pendingItemChoice: true,
  character: {
    name: 'Zeraphine Morgrave', class: 'Blooddrinker', level: 1,
    hp: 15, maxHp: 15, atk: 2, def: 1, dmg: 'd8',
    str: -2, dex: -1, con: 0, int: 0, wis: 1, cha: 2,
    gold: 8, notoriety: 2, minions: 2, soulCrystal: 4,
    surges: 1, surgesUsed: 0, spellPoints: 0,
    abilities: [
      { id: 'persuasive', name: 'Persuasive', desc: 'Add +2 to all rolls to persuade and convince.', perPage: false },
      { id: 'velvet_allure', name: 'Velvet Allure', desc: 'Once per page: Reroll any D20+CHA and take the new result.', perPage: true, used: false },
      { id: 'surges', name: 'Surges', desc: '1 Surge per page to activate surge abilities. Resets each page.', perPage: false },
      { id: 'monstrous_form', name: 'Monstrous Form', desc: 'Use 1 Surge: Add D4 to a single STR, DEX, or CON roll.', perPage: false }
    ],
    inventory: { "Dragon's Fire": 1, 'Nightshade': 1, 'Combat Tonic': 1, 'Health Potion': 1 },
    equipment: {}, conditions: [], wounds: [], securedGate: true,
    carriedNotes: ['Betray or Assist Overlord decision pending (Jan 31)']
  },
  notes: [
    'Chose Zeraphine Morgrave on Jan 22 as permanent character.',
    'Soul Crystal power: +4 (Jan 6-7 ritual).',
    'High Mage died Jan 26 — life force drained (+5 HP, full restore).',
    '"Secured Gate" — locked castle gates Jan 14.',
    'Jan 27: Must choose 1 item from High Mage gift before proceeding.'
  ],
  journal: [
    { date: 'Jan 1', text: 'As Severin Mortis — Deciphered crow message: army of light approaching.', effects: [] },
    { date: 'Jan 2-3', text: 'Cast divination spell. Spell Effectiveness +3 total.', effects: ['+3 Spell Effectiveness'] },
    { date: 'Jan 5', text: 'Reported to Overlord. Dark presence struck down.', effects: ['-3 HP'] },
    { date: 'Jan 6-7', text: 'Prepared Soul Crystal ritual. Power: +4.', effects: ['Soul Crystal +4'] },
    { date: 'Jan 8', text: 'As Nargle Nightbane — Survived arrow barrage, looted body.', effects: ['+3 Gold'] },
    { date: 'Jan 9', text: 'Fought Tobin Goldleaf. Survived 2 rounds.', effects: ['-1 HP'] },
    { date: 'Jan 10-11', text: "Gorlash fell. Gave warrior's death.", effects: ['+2 Notoriety', '+supplies'] },
    { date: 'Jan 12', text: 'Fought through battlefield to castle gates.', effects: ['-2 HP'] },
    { date: 'Jan 13', text: 'Killed Lythariel Moonstride in one combat round.', effects: ['-1 HP', '+1 Gold'] },
    { date: 'Jan 14', text: 'Shut castle gates. "Secured Gate" acquired.', effects: [] },
    { date: 'Jan 15', text: 'As Zeraphine — Left dungeon. Freed prisoner as distraction.', effects: ['+2 Gold', '+items'] },
    { date: 'Jan 16', text: 'Navigated castle halls. Rallied goblins, sprung poison trap.', effects: ['+2 Not', '+3 Gold', '-2 HP'] },
    { date: 'Jan 17-18', text: 'Evaded Durnir Mossbeard across 7 rolls. Escaped.', effects: ['-1 HP'] },
    { date: 'Jan 19', text: 'Pushed toward throne room. Recruited 2 minions.', effects: ['+1 Not', '+2 Minions'] },
    { date: 'Jan 20', text: 'Fought Throga Bloodfury with minions. Broke away.', effects: ['+3 Gold', '-1 HP'] },
    { date: 'Jan 21', text: 'Searched corridor near ritual chamber.', effects: ['-1 Not'] },
    { date: 'Jan 22', text: 'Reached ritual chamber. Chose Zeraphine. Took Rest.', effects: ['Full HP restore'] },
    { date: 'Jan 23', text: 'Vaelor Spellwright attacked. Held off 4 rounds.', effects: ['-2 HP', '+4 Gold'] },
    { date: 'Jan 24-25', text: "Vaelor's maelstrom — chaos room endured.", effects: ['-3 HP total'] },
    { date: 'Jan 26', text: 'High Mage fell to Vaelor. Drained life force — fully restored.', effects: ['+5 HP (full)'] }
  ]
};

const State = (() => {
  let _state = null;
  const defaults = () => JSON.parse(JSON.stringify(DEFAULT_STATE));
  const get = () => _state;
  const init = (o) => { _state = o || defaults(); };
  const save = () => { try { localStorage.setItem('sos_state_v1', JSON.stringify(_state)); } catch(e) {} };
  const loadLocal = () => { try { const r = localStorage.getItem('sos_state_v1'); if(r){_state=JSON.parse(r);return true;} } catch(e){} return false; };
  const exportCode = () => btoa(JSON.stringify(_state));
  const importCode = (code) => { try { const p=JSON.parse(atob(code)); if(!p.character||!p.currentDate) throw 0; _state=p; save(); return true; } catch(e){return false;} };
  const char = () => _state.character;
  const applyHpDelta = (d) => { const c=char(); c.hp=Math.max(0,Math.min(c.maxHp,c.hp+d)); save(); };
  const applyGoldDelta = (d) => { const c=char(); c.gold+=d; if(c.gold<-99)c.gold=-99; save(); };
  const applyNotorietyDelta = (d) => { const c=char(); c.notoriety=Math.max(0,Math.min(20,c.notoriety+d)); save(); };
  const applyMinionDelta = (d) => { const c=char(); c.minions=Math.max(0,c.minions+d); save(); };
  const addInventoryItem = (n,q=1) => { const inv=char().inventory; inv[n]=(inv[n]||0)+q; save(); };
  const removeInventoryItem = (n,q=1) => { const inv=char().inventory; if(inv[n]){inv[n]=Math.max(0,inv[n]-q); if(!inv[n])delete inv[n];} save(); };
  const equipItem = (slot,name,bonuses) => {
    const c=char(); if(!c.equipment)c.equipment={};
    c.equipment[slot.toUpperCase()]=name;
    if(bonuses.con)c.con+=bonuses.con; if(bonuses.def)c.def+=bonuses.def;
    if(bonuses.atk)c.atk+=bonuses.atk; if(bonuses.str)c.str+=bonuses.str;
    if(bonuses.maxHp){c.maxHp+=bonuses.maxHp; c.hp=Math.min(c.maxHp,c.hp+bonuses.maxHp);}
    save();
  };
  const addJournalEntry = (e) => { _state.journal.push(e); save(); };
  const addNote = (n) => { _state.notes.push(n); save(); };
  const advanceDay = () => {
    const {year,month,day}=_state.currentDate; const c=char();
    c.surgesUsed=0; c.abilities.forEach(a=>{if(a.perPage)a.used=false;});
    const dim=new Date(year,month,0).getDate();
    _state.currentDate = day>=dim
      ? {year:month===12?year+1:year, month:month===12?1:month+1, day:1}
      : {year,month,day:day+1};
    save();
  };
  return { get,init,save,loadLocal,exportCode,importCode,char,applyHpDelta,applyGoldDelta,
    applyNotorietyDelta,applyMinionDelta,addInventoryItem,removeInventoryItem,equipItem,
    addJournalEntry,addNote,advanceDay,defaults,MONTH_PDF_IDS };
})();