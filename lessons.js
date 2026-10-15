// Lesson content for Typing Dojo. Each level has a character set (for generated
// drills) or a list of real lines, plus which fingers it introduces.
//
// Levels follow the classic touch-typing progression: home row first, then the rows
// above and below, then Shift, numbers and symbols, and finally real prose and code.

const LEVELS = [
  { id: 1, name: "Home row", chars: "asdfjkl;", intro: "a s d f  j k l ;",
    blurb: "Index fingers rest on F and J (feel the bumps). Each finger owns one home key." },
  { id: 2, name: "Home row + G H", chars: "asdfghjkl;", intro: "g h",
    blurb: "Index fingers reach inward to G and H, then come straight back to F and J." },
  { id: 3, name: "Top row", chars: "asdfghjkl;qwertyuiop", intro: "q w e r t  y u i o p",
    blurb: "Reach up without moving the other fingers off the home row." },
  { id: 4, name: "Bottom row", chars: "asdfghjkl;qwertyuiopzxcvbnm,./", intro: "z x c v b  n m , . /",
    blurb: "Reach down. Z, X and C with pinky, ring and middle; the index fingers take V B and N M." },
  { id: 5, name: "Capitals & punctuation", chars: "abcdefghijklmnopqrstuvwxyz,.;'", shift: true, intro: "Shift  ' \"  ? !",
    blurb: "Hold Shift with the hand OPPOSITE the letter: right pinky Shift for a capital A, left pinky Shift for a capital P." },
  { id: 6, name: "Numbers", chars: "abcdefghijklmnopqrstuvwxyz 1234567890", numbers: true, intro: "1 2 3 4 5  6 7 8 9 0",
    blurb: "Number row: 1 2 3 with pinky, ring, middle; 4 5 left index; 6 7 right index; 8 9 0 middle, ring, pinky." },
  { id: 7, name: "Symbols", chars: "abcdefghijklmnopqrstuvwxyz", symbols: true, intro: "! @ # $ % ^ & * ( ) - _ = + [ ] { } \\ | ` ~ < > ?",
    blurb: "Every symbol on the keyboard, including the shifted ones. Same finger as the key it lives on, plus the opposite-hand Shift." },
  { id: 8, name: "Sentences", lines: "SENTENCES", intro: "Real prose",
    blurb: "Whole sentences with capitals and punctuation. Accuracy first, speed follows." },
  { id: 9, name: "Code", lines: "CODE", intro: "Real code",
    blurb: "Lines of real code: brackets, operators, underscores and quotes. The hardest keys, in context." },
  { id: 10, name: "Weak keys", weak: true, intro: "Your mistakes",
    blurb: "A drill built from the keys YOU miss most often, from your saved stats. Comes alive after you have made a few mistakes." },
];

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "Sphinx of black quartz, judge my vow.",
  "Practice does not make perfect; practice makes permanent, so slow down and get it right.",
  "Keep your wrists floating and your eyes on the screen, not on your hands.",
  "A watched pot never boils, but a typed sentence is finished one key at a time.",
  "She sells seashells by the seashore, and the shells she sells are surely seashells.",
  "Every expert was once a beginner who refused to stop practising.",
  "Type the whole line, then read it back: did your fingers say what you meant?",
  "Rhythm matters more than raw speed. Find a steady pace and hold it.",
  "The right pinky does a lot of work: Enter, Backspace, quotes, brackets and Shift.",
  "Good typists make mistakes too; they just fix them without looking down.",
  "When in doubt, slow down. Accuracy is the foundation that speed is built on.",
  "Twelve jet planes zoomed quickly by the fox, and the dog never noticed.",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz.",
  "Crazy Frederick bought many very exquisite opal jewels.",
];

const CODE = [
  "(defun greet (name) (message \"Hello, %s!\" name))",
  "for (let i = 0; i < items.length; i++) total += items[i].price;",
  "const user = { id: 42, name: \"Ada\", roles: [\"admin\", \"dev\"] };",
  "if (!response.ok) throw new Error(`HTTP ${response.status}`);",
  "def fib(n): return n if n < 2 else fib(n - 1) + fib(n - 2)",
  "SELECT id, name FROM users WHERE active = 1 ORDER BY name;",
  "git commit -m \"Fix off-by-one error in pagination\" && git push",
  "let result = numbers.filter(n => n % 2 === 0).map(n => n * n);",
  "(setq inhibit-startup-message t) ; no splash screen",
  "x = [i ** 2 for i in range(10) if i % 3 != 0]",
  "#include <stdio.h>\\nint main(void) { printf(\"hi\\n\"); return 0; }",
  "export default function App({ title }) { return <h1>{title}</h1>; }",
  "while [ \"$1\" != \"\" ]; do echo \"$1\"; shift; done",
  "match value { Some(v) => v * 2, None => 0 }",
  "(let ((x 10) (y 20)) (+ x y))",
  "arr.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));",
];

const SYMBOLS = "!@#$%^&*()-_=+[]{}\\|;:'\",.<>/?`~";
const COMMON_WORDS = ("the of and to in is you that it he was for on are as with his they at be this have from or one had by " +
  "word but not what all were we when your can said there use an each which she do how their if will up other about out many " +
  "then them these so some her would make like him into time has look two more write go see number no way could people my than " +
  "first water been call who oil its now find long down day did get come made may part").split(" ");

/** Make a drill line (about 40 chars) from a character set, as pseudo-words. */
function generateFromChars(chars, opts = {}) {
  const letters = chars.replace(/[^a-z]/g, "");
  const extras = chars.replace(/[a-z ]/g, "");
  const words = [];
  let length = 0;
  while (length < 38) {
    let w = "";
    if (letters.length >= 10 && Math.random() < 0.6) {
      // prefer a real word if every letter of it is in the set
      const candidates = COMMON_WORDS.filter((c) => [...c].every((ch) => letters.includes(ch)));
      if (candidates.length) w = candidates[Math.floor(Math.random() * candidates.length)];
    }
    if (!w) {
      const n = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) w += letters[Math.floor(Math.random() * letters.length)];
    }
    if (opts.shift && Math.random() < 0.45) w = w[0].toUpperCase() + w.slice(1);
    if (opts.shift && Math.random() < 0.25) w += [",", ".", "?", "!", "'", "\""][Math.floor(Math.random() * 6)];
    if (extras && Math.random() < 0.4) w += extras[Math.floor(Math.random() * extras.length)];
    if (opts.numbers && Math.random() < 0.5) w = String(Math.floor(Math.random() * 10000));
    if (opts.symbols && Math.random() < 0.6) {
      const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      w = Math.random() < 0.5 ? s + w : w + s;
    }
    words.push(w);
    length += w.length + 1;
  }
  return words.join(" ");
}

/** Build a drill line for a level, using saved per-key error stats for "weak keys". */
function makeDrill(level, stats) {
  if (level.lines === "SENTENCES") return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  if (level.lines === "CODE") return CODE[Math.floor(Math.random() * CODE.length)];
  if (level.weak) {
    const worst = Object.entries(stats.errorsByKey || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
    if (worst.length < 2) return "make a few mistakes first; then this drill targets them";
    const words = [];
    let len = 0;
    while (len < 38) {
      let w = "";
      const n = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const k = Math.random() < 0.6 ? worst[Math.floor(Math.random() * worst.length)] : "aeiounrst"[Math.floor(Math.random() * 9)];
        w += k === " " ? "" : k;
      }
      words.push(w); len += w.length + 1;
    }
    return words.join(" ");
  }
  return generateFromChars(level.chars, level);
}
