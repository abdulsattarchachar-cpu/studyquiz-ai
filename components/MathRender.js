"use client";

import katex from "katex";

// Renders text that may contain inline math delimited by single $...$ pairs.
// Plain text segments render as-is; math segments render via KaTeX.
export default function MathRender({ text, className = "", displayMode = false }) {
  if (!text) return null;

  if (displayMode) {
    // Whole content treated as one math expression (used for live equation preview)
    let html;
    try {
      html = katex.renderToString(text, { throwOnError: false, displayMode: true });
    } catch (e) {
      html = text;
    }
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const parts = text.split(/\$(.+?)\$/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(part, { throwOnError: false }),
            }}
          />
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
