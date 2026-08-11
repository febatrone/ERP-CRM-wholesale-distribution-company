import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight = '', className = '' }) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedHighlight = highlight.trim().replace(/[-[\]{}()*+?.:=\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded-xs inline-block"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
