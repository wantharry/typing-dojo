// Typing Dojo --- game engine and UI. Depends on lessons.js (LEVELS, makeDrill) and
// keyboard.js (renderKeyboard, highlightKey, fingerGuidance).

const SAVE_KEY = "typing-dojo-save-v1";
const LINES_PER_SESSION = 5;

function loadSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return JSON.parse(raw); } catch (e) { /* fresh start */ }
  return { bestWpm: {}, bestAcc: {}, errorsByKey: {}, totalChars: 0, totalErrors: 0 };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(stats)); } catch (e) { /* storage unavailable; fine */ } }
const stats = loadSave();

let state = null;
function $(sel) { return document.querySelector(sel); }

function renderHome() {
  $("#screen-home").classList.remove("hidden");
  $("#screen-game").classList.add("hidden");
  $("#screen-over").classList.add("hidden");
  const list = $("#level-list");
  list.innerHTML = "";
  for (const lv of LEVELS) {
    const best = stats.bestWpm[lv.id];
    const acc = stats.bestAcc[lv.id];
    const btn = document.createElement("button");
    btn.className = "tier-card";
    btn.innerHTML = `
      <div class="tier-num">Level ${lv.id}</div>
      <div class="tier-name">${lv.name}</div>
      <div class="tier-keys">${escapeHtml(lv.intro)}</div>
      <div class="tier-meta">${best ? `best ${best} WPM &middot; ${acc}% accuracy` : "not played yet"}</div>`;
    btn.addEventListener("click", () => startSession(lv));
    list.appendChild(btn);
  }
  const worst = Object.entries(stats.errorsByKey).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $("#home-stats").textContent = stats.totalChars
    ? `Lifetime: ${stats.totalChars} characters typed, ${(100 - 100 * stats.totalErrors / stats.totalChars).toFixed(1)}% accuracy. ` +
      (worst.length ? `Most-missed keys: ${worst.map(([k, n]) => `${k === " " ? "Space" : k} (${n})`).join(", ")}.` : "")
    : "";
}

function startSession(level) {
  state = { level, lineIndex: 0, lines: [], typed: "", errors: 0, chars: 0, startTime: null, lineStart: null,
    results: [], wrongHere: false };
  for (let i = 0; i < LINES_PER_SESSION; i++) state.lines.push(makeDrill(level, stats));
  $("#screen-home").classList.add("hidden");
  $("#screen-over").classList.add("hidden");
  $("#screen-game").classList.remove("hidden");
  $("#game-level").textContent = `Level ${level.id}: ${level.name}`;
  $("#level-blurb").textContent = level.blurb;
  startLine();
}

function startLine() {
  state.typed = ""; state.lineStart = null; state.wrongHere = false;
  $("#line-counter").textContent = `Line ${state.lineIndex + 1} of ${LINES_PER_SESSION}`;
  renderLine();
}

function currentLine() { return state.lines[state.lineIndex]; }

function renderLine() {
  const line = currentLine();
  const typed = state.typed;
  let html = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const shown = ch === " " ? "&nbsp;" : escapeHtml(ch);
    if (i < typed.length) html += `<span class="${typed[i] === ch ? "ok" : "err"}">${shown}</span>`;
    else if (i === typed.length) html += `<span class="cur${state.wrongHere ? " wrong" : ""}">${shown}</span>`;
    else html += `<span>${shown}</span>`;
  }
  $("#drill").innerHTML = html;
  const next = line[typed.length];
  highlightKey(next);
  $("#finger").textContent = next == null ? "Press Enter for the next line" : fingerGuidance(next);
  renderHud();
}

function renderHud() {
  const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((state.chars / 5) / (elapsed / 60)) : 0;
  const acc = state.chars ? Math.max(0, 100 - 100 * state.errors / state.chars) : 100;
  $("#hud-wpm").textContent = wpm;
  $("#hud-acc").textContent = acc.toFixed(0) + "%";
  $("#hud-err").textContent = state.errors;
}

function onKeydown(e) {
  if (!state) return;
  if (e.key === "Tab" || e.key === "F5" || e.key === "F12") return;
  if (e.ctrlKey || e.altKey || e.metaKey) return; // leave browser shortcuts alone
  const line = currentLine();
  if (e.key === "Escape") { renderHome(); return; }
  if (e.key === "Enter") {
    if (state.typed.length >= line.length) finishLine();
    e.preventDefault(); return;
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    if (state.typed.length) { state.typed = state.typed.slice(0, -1); state.wrongHere = false; renderLine(); }
    return;
  }
  if (e.key.length !== 1) return;
  e.preventDefault();
  if (state.typed.length >= line.length) return;
  if (!state.startTime) state.startTime = Date.now();
  const expected = line[state.typed.length];
  state.chars++;
  if (e.key === expected) {
    state.typed += e.key;
    state.wrongHere = false;
    if (state.typed.length >= line.length) finishLine();
    else renderLine();
  } else {
    // Wrong key: do not advance. Count it, remember which key was MEANT, and
    // show the wrong letter in red so the eye learns to catch it.
    state.errors++;
    state.wrongHere = true;
    stats.errorsByKey[expected] = (stats.errorsByKey[expected] || 0) + 1;
    stats.totalErrors++;
    flashWrong();
    renderLine();
  }
  stats.totalChars++;
}

function flashWrong() {
  const card = $("#drill-card");
  card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
}

function finishLine() {
  state.lineIndex++;
  if (state.lineIndex >= LINES_PER_SESSION) endSession();
  else startLine();
}

function endSession() {
  const elapsed = Math.max(1, (Date.now() - state.startTime) / 1000);
  const wpm = Math.round((state.chars / 5) / (elapsed / 60));
  const acc = Math.max(0, 100 - 100 * state.errors / Math.max(1, state.chars));
  const id = state.level.id;
  const isBest = !stats.bestWpm[id] || wpm > stats.bestWpm[id];
  if (isBest) { stats.bestWpm[id] = wpm; stats.bestAcc[id] = acc.toFixed(0); }
  save();
  $("#screen-game").classList.add("hidden");
  $("#screen-over").classList.remove("hidden");
  $("#over-wpm").textContent = wpm;
  $("#over-acc").textContent = acc.toFixed(1) + "%";
  $("#over-time").textContent = elapsed.toFixed(0) + "s";
  $("#over-best").textContent = isBest ? "New best for this level!" : `Best on this level: ${stats.bestWpm[id]} WPM`;
  const worst = Object.entries(stats.errorsByKey).sort((a, b) => b[1] - a[1]).slice(0, 5);
  $("#over-weak").textContent = worst.length ? `Keys to work on: ${worst.map(([k]) => (k === " " ? "Space" : k)).join("  ")}` : "";
  $("#btn-retry").onclick = () => startSession(state.level);
  $("#btn-next").onclick = () => { const nx = LEVELS.find((l) => l.id === id + 1); nx ? startSession(nx) : renderHome(); };
}

function init() {
  renderKeyboard();
  document.addEventListener("keydown", onKeydown);
  $("#btn-quit").addEventListener("click", renderHome);
  $("#btn-home").addEventListener("click", renderHome);
  $("#btn-reset").addEventListener("click", () => {
    if (confirm("Clear all saved stats and best scores?")) { Object.assign(stats, { bestWpm: {}, bestAcc: {}, errorsByKey: {}, totalChars: 0, totalErrors: 0 }); save(); renderHome(); }
  });
  setInterval(() => { if (state && state.startTime && !$("#screen-game").classList.contains("hidden")) renderHud(); }, 1000);
  renderHome();
}
document.addEventListener("DOMContentLoaded", init);
