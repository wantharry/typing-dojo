# Typing Dojo

A browser game for learning touch typing on your own keyboard. Sister project of
[Emacs Key Dojo](https://github.com/wantharry/emacs-key-game).

**Play it:** https://wantharry.github.io/typing-dojo/ — or just open `index.html`. No server, no build step.

## How it works

- 10 levels in the classic touch-typing order: home row → G/H → top row → bottom row →
  capitals & punctuation → numbers → every symbol → real sentences → real code →
  **weak keys** (a drill generated from the keys you personally miss most).
- Five lines per session. Type each line; a wrong key does not advance, it is shown in
  red and counted. Backspace fixes mistakes. Enter is not needed between lines.
- Live WPM (standard 5-characters-per-word), accuracy and error count.
- The on-screen keyboard is colour-coded by finger (pinky / ring / middle / index / thumb),
  marks the F and J home bumps, shows shifted symbols, and highlights the next key plus the
  **opposite-hand Shift** when a capital or symbol is needed. A line under the drill says which
  finger to use.
- Best WPM/accuracy per level and per-key error counts are saved in `localStorage`.

## Files

| File | What it is |
|---|---|
| `index.html` | page structure |
| `style.css` | styling, finger-zone colours |
| `lessons.js` | levels, sentence/code lines, drill generator |
| `keyboard.js` | finger chart, virtual keyboard, highlighting, guidance text |
| `typing.js` | session engine, scoring, stats save/load |
