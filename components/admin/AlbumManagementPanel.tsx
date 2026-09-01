'use client';

import { FolderPlus, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { MediaAlbumCreateRequest, MediaAlbumCreateResponse } from '@/lib/mediaForms';
import type { MediaAlbumOption } from '@/lib/mediaLibrary';

type AlbumManagementPanelProps = {
  albums: MediaAlbumOption[];
};

export function AlbumManagementPanel({ albums }: AlbumManagementPanelProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function createAlbum() {
    setSaving(true);
    setError('');
    setNotice('');
    const payload: MediaAlbumCreateRequest = { name, parentId };

    try {
      const response = await fetch('/api/admin/media/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as MediaAlbumCreateResponse;
      if (!response.ok || !result.album) {
        throw new Error(result.message ?? 'Unable to create album.');
      }
      setName('');
      setParentId('');
      setNotice(`Created ${result.album.name}.`);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create album.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card p-5" aria-labelledby="album-management-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Albums
          </p>
          <h2 id="album-management-heading" className="mt-1 font-serif text-2xl text-forest-900">
            Organize website media
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-admin-muted">
            Create nested albums, then assign media through the detail panel or bulk toolbar.
          </p>
        </div>
        <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
          {albums.length} album{albums.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)_auto]">
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Album name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cabins"
            maxLength={120}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
            Parent album
          </span>
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-admin-border bg-white px-3 text-sm text-forest-900"
          >
            <option value="">Top-level album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {'— '.repeat(album.depth)}
                {album.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={createAlbum}
          disabled={saving || !name.trim()}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-admin-sidebar px-4 text-sm font-bold text-white hover:bg-admin-sidebar-active disabled:cursor-not-allowed disabled:opacity-60 lg:mt-auto"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <FolderPlus aria-hidden="true" className="size-4" />
          )}
          Create Album
        </button>
      </div>

      {albums.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {albums.slice(0, 12).map((album) => (
            <span
              key={album.id}
              className="rounded-full bg-cream-alt px-3 py-1.5 text-xs font-bold text-forest-900"
            >
              {album.path}
            </span>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm font-semibold text-admin-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-admin-success">{notice}</p> : null}
    </section>
  );
}
