'use client';

import { Bold, Italic, LinkIcon, List } from 'lucide-react';
import type { RichTextAction } from '@/lib/richTextToolbar';

type RichTextToolbarProps = {
  onFormat: (action: RichTextAction) => void;
};

const actions: Array<{
  action: RichTextAction;
  label: string;
  Icon: typeof Bold;
}> = [
  { action: 'bold', label: 'Bold', Icon: Bold },
  { action: 'italic', label: 'Italic', Icon: Italic },
  { action: 'link', label: 'Link', Icon: LinkIcon },
  { action: 'bullet', label: 'Bullet list', Icon: List },
];

export function RichTextToolbar({ onFormat }: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-admin-border bg-white px-3 py-2">
      {actions.map(({ action, label, Icon }) => (
        <button
          key={action}
          type="button"
          onClick={() => onFormat(action)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-admin-border px-3 text-xs font-bold text-admin-muted hover:border-admin-accent hover:text-admin-accent"
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
