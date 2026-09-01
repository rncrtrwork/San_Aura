export const RICH_TEXT_ACTIONS = ['bold', 'italic', 'link', 'bullet'] as const;

export type RichTextAction = (typeof RICH_TEXT_ACTIONS)[number];

export function richTextReplacement(action: RichTextAction, selectedText: string): string {
  const text = selectedText.trim();
  if (action === 'bold') return `<strong>${text || 'bold text'}</strong>`;
  if (action === 'italic') return `<em>${text || 'italic text'}</em>`;
  if (action === 'link') return `<a href="https://example.com">${text || 'link text'}</a>`;
  return `<ul><li>${text || 'List item'}</li></ul>`;
}
