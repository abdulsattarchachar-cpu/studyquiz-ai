"use client";

const SYMBOLS = [
  { label: "Fraction", snippet: "\\frac{}{}", cursorOffset: -3 },
  { label: "√", snippet: "\\sqrt{}", cursorOffset: -1 },
  { label: "∛", snippet: "\\sqrt[3]{}", cursorOffset: -1 },
  { label: "Σ", snippet: "\\sum_{i=1}^{n}", cursorOffset: 0 },
  { label: "π", snippet: "\\pi", cursorOffset: 0 },
  { label: "θ", snippet: "\\theta", cursorOffset: 0 },
  { label: "Matrix", snippet: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}", cursorOffset: 0 },
  { label: "∫", snippet: "\\int_{a}^{b}", cursorOffset: 0 },
  { label: "d/dx", snippet: "\\frac{d}{dx}", cursorOffset: 0 },
  { label: "lim", snippet: "\\lim_{x \\to }", cursorOffset: -1 },
  { label: "Vector", snippet: "\\vec{v}", cursorOffset: -1 },
  { label: "log", snippet: "\\log_{}()", cursorOffset: -3 },
  { label: "sin", snippet: "\\sin()", cursorOffset: -1 },
  { label: "cos", snippet: "\\cos()", cursorOffset: -1 },
  { label: "tan", snippet: "\\tan()", cursorOffset: -1 },
  { label: "xⁿ", snippet: "^{}", cursorOffset: -1 },
  { label: "xₙ", snippet: "_{}", cursorOffset: -1 },
];

export default function MathToolbar({ textareaRef, value, onChange }) {
  function insert(snippet, cursorOffset) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + snippet);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + snippet + value.slice(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      const pos = start + snippet.length + cursorOffset;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {SYMBOLS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => insert(s.snippet, s.cursorOffset)}
          className="px-2.5 py-1.5 rounded-control bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-xs font-medium text-ink-600 transition-colors min-w-[36px]"
          title={s.label}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
