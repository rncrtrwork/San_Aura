'use client';

import { LoaderCircle, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  MEMBER_UPDATE_REQUEST_TOPIC_LABELS,
  MEMBER_UPDATE_REQUEST_TOPICS,
  type MemberUpdateRequestCreateResponse,
  type MemberUpdateRequestTopic,
} from '@/lib/memberUpdateRequests';

export function MemberUpdateRequestForm() {
  const [topic, setTopic] = useState<MemberUpdateRequestTopic>('contact');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch('/api/member/update-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, message }),
      });
      const result = (await response.json()) as MemberUpdateRequestCreateResponse;
      if (!response.ok) {
        setError(result.message ?? 'Unable to send your request.');
        return;
      }
      setSuccess(result.message ?? 'Your request was sent to staff.');
      setMessage('');
    } catch {
      setError('Unable to reach staff requests. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
          Request update
        </p>
        <h2 className="mt-2 font-serif text-3xl text-forest-900">Send a note to staff</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700">
          Use this to ask staff to update official contact, membership, document, or billing
          records. Your official record stays unchanged until staff reviews the request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-forest-900">Request topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.currentTarget.value as MemberUpdateRequestTopic)}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-forest-900 focus:border-gold-600 focus:ring-1 focus:ring-gold-600"
          >
            {MEMBER_UPDATE_REQUEST_TOPICS.map((option) => (
              <option key={option} value={option}>
                {MEMBER_UPDATE_REQUEST_TOPIC_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-forest-900">Message for staff</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={7}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm leading-6 text-forest-900 focus:border-gold-600 focus:ring-1 focus:ring-gold-600"
            placeholder="Tell staff what needs to be corrected or reviewed."
          />
        </label>

        {success ? (
          <p
            role="status"
            className="rounded-xl bg-cream-alt p-4 text-sm font-bold text-forest-900"
          >
            {success}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-admin-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-forest-900 px-6 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-70"
        >
          {submitting ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
          Send request
          {!submitting ? <Send aria-hidden="true" className="size-4" /> : null}
        </button>
      </form>
    </section>
  );
}
