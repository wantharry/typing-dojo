// Virtual keyboard with touch-typing finger zones. Visual only --- the real keyboard
// is what the game listens to. Each key is coloured by the finger that should press
// it; the next key to type and the Shift to hold are highlighted.

const SHIFT_PAIRS = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8",
  "(": "9", ")": "0", "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'",
  "<": ",", ">": ".", "?": "/",
};

// finger id -> [hand, finger name]
const FINGERS = {
  lp: ["left", "pinky"], lr: ["left", "ring"], lm: ["left", "middle"], li: ["left", "index"],
  ri: ["right", "index"], rm: ["right", "middle"], rr: ["right", "ring"], rp: ["right", "pinky"],
  th: ["either", "thumb"],
};
const FINGER_OF = {};
for (const [chars, f] of [["`1qaz", "lp"], ["2wsx", "lr"], ["3edc", "lm"], ["45rfvtgb", "li"],
  ["67yhnujm", "ri"], ["8ik,", "rm"], ["9ol.", "rr"], ["0p;/-=[]\\'", "rp"], [" ", "th"]]) {
  for (const ch of chars) FINGER_OF[ch] = f;
}
for (const [sym, base] of Object.entries(SHIFT_PAIRS)) FINGER_OF[sym] = FINGER_OF[base];
for (const ch of "abcdefghijklmnopqrstuvwxyz") FINGER_OF[ch.toUpperCase()] = FINGER_OF[ch];

/** Which physical key + whether Shift is needed, for a character to type. */
function keyFor(ch) {
  if (SHIFT_PAIRS[ch]) return { base: SHIFT_PAIRS[ch], shift: true };
  if (/[A-Z]/.test(ch)) return { base: ch.toLowerCase(), shift: true };
  return { base: ch, shift: false };
}

/** Human guidance: "Shift with the right pinky, then a with the left pinky". */
function fingerGuidance(ch) {
  const { base, shift } = keyFor(ch);
  const f = FINGER_OF[base];
  if (!f) return "";
  const [hand, finger] = FINGERS[f];
  const name = ch === " " ? "Space" : ch;
  if (shift) {
    const shiftHand = hand === "left" ? "right" : "left";
    return `Hold Shift with your ${shiftHand} pinky, press ${name} with your ${hand} ${finger}.`;
  }
  return finger === "thumb" ? "Space with either thumb." : `${name}: ${hand} ${finger}.`;
}

const KEYBOARD_ROWS = [
  [["`"], ["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"], ["0"], ["-"], ["="], ["Backspace", "Backspace", "wide", "rp"]],
  [["Tab", "Tab", "wide", "lp"], ["q"], ["w"], ["e"], ["r"], ["t"], ["y"], ["u"], ["i"], ["o"], ["p"], ["["], ["]"], ["\\"]],
  [["Caps", null, "wide", "lp"], ["a"], ["s"], ["d"], ["f"], ["g"], ["h"], ["j"], ["k"], ["l"], [";"], ["'"], ["Enter", "Enter", "wide", "rp"]],
  [["Shift", null, "wider", "lp", "shift-left"], ["z"], ["x"], ["c"], ["v"], ["b"], ["n"], ["m"], [","], ["."], ["/"], ["Shift", null, "wider", "rp", "shift-right"]],
  [["Space", " ", "space", "th"]],
];

function renderKeyboard() {
  const root = document.getElementById("keyboard");
  root.innerHTML = "";
  for (const row of KEYBOARD_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    for (const [label, key = label, widthClass, finger = FINGER_OF[key], dataKey] of row) {
      const el = document.createElement("div");
      el.className = "kb-key" + (widthClass ? ` kb-${widthClass}` : "") + (finger ? ` f-${finger}` : "");
      const shifted = Object.keys(SHIFT_PAIRS).find((s) => SHIFT_PAIRS[s] === key);
      el.innerHTML = (shifted ? `<span class="kb-shift">${escapeHtml(shifted)}</span>` : "") + escapeHtml(label);
      if (key !== null) el.dataset.key = key;
      if (dataKey) el.dataset.role = dataKey;
      if (key === "f" || key === "j") el.classList.add("kb-home");
      rowEl.appendChild(el);
    }
    root.appendChild(rowEl);
  }
}

function highlightKey(ch) {
  document.querySelectorAll(".kb-key").forEach((el) => el.classList.remove("hl"));
  if (ch == null) return;
  const { base, shift } = keyFor(ch);
  const el = document.querySelector(`.kb-key[data-key="${cssEscape(base)}"]`);
  if (el) el.classList.add("hl");
  if (shift) {
    const hand = (FINGERS[FINGER_OF[base]] || [])[0];
    const side = hand === "left" ? "right" : "left";
    document.querySelectorAll(`.kb-key[data-role="shift-${side}"]`).forEach((e) => e.classList.add("hl"));
  }
}

function cssEscape(s) { return s.replace(/["\\]/g, "\\$&"); }
function escapeHtml(s) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
