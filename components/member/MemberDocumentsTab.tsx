import { ExternalLink } from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, documentTracksExpiry } from '@/lib/documentOptions';
import { memberDateLabel, memberDocumentStatusLabel } from '@/lib/memberPortal';
import type { MemberDocumentItem } from '@/server/members/getMemberDocuments';

type MemberDocumentsTabProps = {
  documents: MemberDocumentItem[];
};

export function MemberDocumentsTab({ documents }: MemberDocumentsTabProps) {
  return (
    <section className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
            Documents on file
          </p>
          <h2 className="mt-2 font-serif text-3xl text-forest-900">Read-only member documents</h2>
        </div>
        <p className="rounded-full bg-cream-alt px-4 py-2 text-sm font-bold text-forest-900">
          {documents.length} files
        </p>
      </div>
      {documents.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <article
              key={document.id}
              className="rounded-[1.25rem] border border-line bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-700">
                    {DOCUMENT_TYPE_LABELS[document.type]}
                  </p>
                  <h3 className="mt-2 break-words font-serif text-2xl text-forest-900">
                    {document.filename}
                  </h3>
                </div>
                <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-forest-900">
                  {memberDocumentStatusLabel(document.expiresAt)}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-ink-700">
                <div>
                  <dt className="font-bold text-forest-900">Uploaded</dt>
                  <dd>{memberDateLabel(document.uploadedAt)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-forest-900">Renewal</dt>
                  <dd>
                    {document.expiresAt
                      ? memberDateLabel(document.expiresAt)
                      : documentTracksExpiry(document.type)
                        ? 'Renewal date needed'
                        : 'Not required'}
                  </dd>
                </div>
              </dl>
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-forest-900 hover:border-gold-600"
              >
                View document
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-[1.25rem] bg-cream-alt p-5 text-sm leading-6 text-ink-700">
          No documents are currently on file. Contact resort staff if a required document is missing
          or out of date.
        </p>
      )}
    </section>
  );
}
