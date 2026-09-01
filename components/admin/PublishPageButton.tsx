'use client';

import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ContentPagePublishResponse } from '@/lib/contentManager';
import type { PagePublishStatus } from '@/models/Page';

type PublishPageButtonProps = {
  pageSlug: string;
  publishStatus: PagePublishStatus;
  disabled: boolean;
};

export function PublishPageButton({ pageSlug, publishStatus, disabled }: PublishPageButtonProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function publishPage() {
    setPublishing(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/content/pages/${pageSlug}/publish`, {
        method: 'POST',
      });
      const result = (await response.json()) as ContentPagePublishResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to publish this page.');
        return;
      }

      setMessage(result.message ?? 'Page published.');
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setPublishing(false);
    }
  }

  const alreadyPublished = publishStatus === 'published';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={publishPage}
        disabled={disabled || publishing || alreadyPublished}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-admin-sidebar px-4 text-xs font-bold text-white transition-colors hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:bg-admin-muted"
      >
        {publishing ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 aria-hidden="true" className="size-4" />
        )}
        {alreadyPublished ? 'Published' : 'Publish Page'}
      </button>
      {message ? (
        <p role="status" className="text-xs font-semibold text-admin-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-semibold text-admin-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
