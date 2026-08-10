import type { SVGProps } from "react";

export function DashMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <path
        d="M6.5 17.5 16 8l9.5 9.5V26a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M12.5 28v-7.5h7V28" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
