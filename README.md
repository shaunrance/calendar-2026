# Souls of Saraku — Quest Calendar 2026 Campaign Tracker

A browser-based RPG campaign tracker for the **2026 Quest Calendar: Souls of Saraku** by Sundial Games LLC.

Built with Claude as live Game Master — powered by the Anthropic API.

---

## Setup: Enable GitHub Pages

1. Go to **Settings → Pages** in this repository
2. Under **Source**, select `Deploy from a branch`
3. Choose branch: `main` and folder: `/ (root)`
4. Click **Save**
5. Your app will be live at: `https://shaunrance.github.io/calendar-2026/`

---

## Usage

1. Open the live URL above
2. Enter your **Anthropic API key** (stored in your browser only)
3. Click **Enter the Dark Citadel**
4. The app opens on **January 27, 2026** — your current campaign position
5. Claude (as live GM) narrates each day, presents your rolls, and tracks all changes

### Daily Play Flow
1. Claude narrates the story for the day
2. Each roll task shows the die + modifier + thresholds
3. Roll physical dice, enter the total, hit **Resolve**
4. Effects apply automatically (HP, gold, notoriety, etc.)
5. When all rolls are done, **Next Day ▶** unlocks
6. Hit **💾 Save** to persist progress

### Cross-Device Sync
Use **📤 Export** to get a save code, and **📥 Import** on another device to resume.

---

## File Structure
```
index.html     ← Main entry point
css/style.css  ← All styles  
js/state.js    ← Game state & persistence
js/gm.js       ← Claude API + historical context
js/ui.js       ← DOM rendering & interactions
js/app.js      ← App controller
.nojekyll      ← Disables Jekyll
```

---

## Current Campaign State
- **Character:** Zeraphine Morgrave · Blooddrinker · Level 1
- **Position:** January 27, 2026 (next to play)
- **HP:** 15/15 | **Gold:** 8 | **Notoriety:** 2 | **Minions:** 2
- **Soul Crystal:** +4
- **Inventory:** Dragon's Fire ×1, Nightshade ×1, Combat Tonic ×1, Health Potion ×1
- **Pending:** Choose 1 item from High Mage's final gift (Jan 27)