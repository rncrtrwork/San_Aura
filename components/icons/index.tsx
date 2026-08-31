import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}
export function ChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
export function ChevronRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}
export function Calendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
export function Leaf(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M19.5 4.5C12 5 7.5 9.2 8 16.5c5.7.8 10.4-3.4 11.5-12Z" />
      <path d="M4 20c3.2-4.7 7-7.8 11.2-9.8M7.5 14.7C4 13.9 3 11.2 3.2 8c3.2.2 5.1 1.5 5.8 3.7" />
    </svg>
  );
}
export function Sun(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}
export function Pin(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}
export function Lock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
export function Facebook(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M13.3 20v-7h2.5l.4-2.8h-2.9V8.4c0-.8.3-1.4 1.5-1.4h1.6V4.5c-.5-.1-1.2-.2-2.2-.2-2.4 0-4 1.5-4 4.1v1.8H7.6V13h2.6v7" />
    </svg>
  );
}
export function Mail(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth="1.8" {...props}>
      <rect x="2.75" y="5" width="18.5" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
export function CameraOff(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...base} strokeWidth="1.8" {...props}>
      <path d="M4 11h5l2-3h8l2 3h7v15H4V11Z" />
      <circle cx="16" cy="18" r="5" />
      <path d="M3 3l26 26" />
    </svg>
  );
}
export function VideoOff(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...base} strokeWidth="1.8" {...props}>
      <rect x="3" y="9" width="18" height="15" rx="2" />
      <path d="m21 14 7-4v13l-7-4M3 3l26 26" />
    </svg>
  );
}
