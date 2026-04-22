/* __APPJS__ */
/* ════════════════════════════════════════════
   js/app.js  —  Application Controller
   ════════════════════════════════════════════ */

const App = (() => {

  let _apiKey = '';
  let _loading = false;

  function boot() {
    const savedKey = localStorage.getItem('sos_api_key');
    if (savedKey) document.getElementById('api-key-input').value = savedKey;
  }

  function enter() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key || !key.startsWith('sk-')) {
      alert('Please enter a valid Anthropic API key (starts with sk-).');
      return;
    }
    _apiKey = key;
    localStorage.setItem('sos_api_key', key);

    const saveCode = document.getElementById('save-key-input').value.trim();
    if (saveCode) {
      const ok = State.importCode(saveCode);
      if (!ok) { alert('Could not parse that save code. Starting from defaults.'); State.init(); }
    } else {
      if (!State.loadLocal()) State.init();
    }

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    UI.renderSidebar();
    UI.renderJournal();
    loadDay();
  }

  async function loadDay() {
    if (_loading) return;
    _loading = true;
    const s = State.get();
    const dateStr = UI.formatDateFull(s.currentDate);
    UI.showLoading(dateStr);
    try {
      const gmData = await GM.getDayData(_apiKey);
      window._dayEffects = [];
      UI.renderDayCard(gmData, s);
      UI.renderSidebar();
    } catch(err) {
      console.error('GM error:', err);
      UI.showError(dateStr, err.message);
    } finally { _loading = false; }
  }

  function reloadDay() { loadDay(); }

  async function advanceDay() {
    const s = State.get();
    const gm = window._currentGM;
    const dayEffects = window._dayEffects || [];
    if (gm) {
      State.addJournalEntry({
        date: UI.formatDateShort(s.currentDate),
        text: extractSummary(gm.narrativeHtml),
        effects: dayEffects
      });
    }
    State.advanceDay();
    save();
    UI.renderSidebar();
    UI.renderJournal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await loadDay();
  }

  function save() {
    State.save();
    UI.setSaveStatus('saved', '✓ Saved');
    setTimeout(() => UI.setSaveStatus('', ''), 2500);
  }

  function exportSave() {
    State.save();
    const code = State.exportCode();
    UI.showModal(
      'Export Save Code',
      `<p>Copy this code to resume from any device:</p><textarea class="modal-textarea" id="export-ta" readonly onclick="this.select()">${code}</textarea>`,
      [{ label: 'Copy', cls: 'primary', onclick: "document.getElementById('export-ta').select();document.execCommand('copy');this.textContent='Copied!'" },
      { label: 'Close', cls: 'secondary', onclick: 'UI.closeModal()' }]
    );
  }

  function showImport() {
    UI.showModal(
      'Import Save Code',
      '<p>Paste a save code:</p><textarea class="modal-textarea" id="import-ta"></textarea>',
      [{ label: 'Import & Reload', cls: 'primary', onclick: `const c=document.getElementById('import-ta').value.trim();if(c&&State.importCode(c)){UI.closeModal();UI.renderSidebar();UI.renderJournal();App.reloadDay();}else{alert('Invalid save code.');}` },
      { label: 'Cancel', cls: 'secondary', onclick: 'UI.closeModal()' }]
    );
  }

  function extractSummary(html) {
    if (!html) return 'Day completed.';
    const t = document.createElement('div');
    t.innerHTML = html;
    const txt = (t.textContent || '').split(/[.!?]/)[0].trim();
    return txt.length > 120 ? txt.slice(0, 117) + '…' : txt + '.';
  }

  return { boot, enter, loadDay, reloadDay, advanceDay, save, exportSave, showImport };
})();

document.addEventListener('DOMContentLoaded', () => App.boot());
