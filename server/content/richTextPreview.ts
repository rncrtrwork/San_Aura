const SAFE_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote'] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeLinkHref(value: string): string {
  const trimmed = value.trim();
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }

  return '#';
}

function safeTag(rawTag: string): string {
  const tagMatch = rawTag.match(/^<\/?\s*([a-zA-Z0-9]+)([^>]*)>$/);
  if (!tagMatch) return '';

  const closing = rawTag.startsWith('</');
  const tagName = tagMatch[1].toLowerCase();
  if (SAFE_TAGS.some((tag) => tag === tagName)) {
    return closing ? `</${tagName}>` : `<${tagName}>`;
  }

  if (tagName === 'a') {
    if (closing) return '</a>';
    const hrefMatch = tagMatch[2].match(/\shref=(["'])(.*?)\1/i);
    const href = hrefMatch ? safeLinkHref(hrefMatch[2]) : '#';
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">`;
  }

  return '';
}

export function sanitizeRichTextPreviewHtml(value: string): string {
  const tagPattern = /<[^>]*>/g;
  let output = '';
  let lastIndex = 0;
  let match = tagPattern.exec(value);

  while (match) {
    output += escapeHtml(value.slice(lastIndex, match.index));
    output += safeTag(match[0]);
    lastIndex = match.index + match[0].length;
    match = tagPattern.exec(value);
  }

  output += escapeHtml(value.slice(lastIndex));
  return output;
}
