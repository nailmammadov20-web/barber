import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M14.5 8.5h-1.6c-.3 0-.6.3-.6.7v1.6h2.2l-.3 2.2h-1.9V19h-2.4v-6h-1.6v-2.2h1.6V8.9c0-1.6 1-2.9 2.6-2.9h1.9v2.5z"
        fill="var(--facebook-icon-bg, white)"
      />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1.5" y="5" width="21" height="14" rx="4" fill="currentColor" />
      <path d="M10 8.6l6 3.4-6 3.4V8.6z" fill="var(--youtube-icon-bg, white)" />
    </svg>
  );
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.6 2h-3.2v13.4a2.9 2.9 0 1 1-2.1-2.8V9.3a6.1 6.1 0 1 0 5.3 6V8.9a7.7 7.7 0 0 0 4.4 1.4V7.1a4.4 4.4 0 0 1-4.4-4.4V2z"
        fill="currentColor"
      />
    </svg>
  );
}
