import type { SVGProps } from "react";

export type IconName =
  | "home" | "info" | "question" | "sun" | "moon" | "menu" | "close"
  | "link" | "text" | "wifi" | "contact" | "mail" | "chevron"
  | "image" | "settings" | "download" | "file" | "copy" | "reset";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const content: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.8.9-2 1.2-2 2.5m0 3h.01" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.4 15.6A8.8 8.8 0 0 1 8.4 3.6 8.8 8.8 0 1 0 20.4 15.6Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" /></>,
    text: <path d="M4 5h16M12 5v14m-4 0h8" />,
    wifi: <><path d="M3 9a14 14 0 0 1 18 0M6 12a9.5 9.5 0 0 1 12 0m-9 3a5 5 0 0 1 6 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></>,
    contact: <><circle cx="12" cy="8" r="3" /><path d="M5 20v-2a7 7 0 0 1 14 0v2z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1" /><path d="m4 17 5-5 3 3 3-4 5 6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M10 2h4l.5 2.3 2 1.1 2.2-.8 2 3.4-1.7 1.6v2.8l1.7 1.6-2 3.4-2.2-.8-2 1.1L14 22h-4l-.5-2.3-2-1.1-2.2.8-2-3.4L5 14.4v-2.8L3.3 10l2-3.4 2.2.8 2-1.1z" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" /></>,
    file: <><path d="M6 2h8l5 5v15H6zM14 2v5h5M9 13h7m-7 4h7" /></>,
    copy: <><rect x="8" y="7" width="12" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" /></>,
    reset: <><path d="M4 11a8 8 0 1 1 2 6M4 5v6h6" /></>,
  };

  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...common} {...props}>{content[name]}</svg>;
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true" fill="none">
      <rect x="1" y="1" width="15" height="15" rx="2" fill="#2464eb" />
      <rect x="20" y="1" width="15" height="15" rx="2" fill="#2464eb" />
      <rect x="1" y="20" width="15" height="15" rx="2" fill="#2464eb" />
      <rect x="20" y="20" width="15" height="15" rx="2" fill="#2464eb" />
      <rect x="5" y="5" width="7" height="7" rx="1" fill="white" />
      <rect x="24" y="5" width="7" height="7" rx="1" fill="white" />
      <rect x="5" y="24" width="7" height="7" rx="1" fill="white" />
      <path d="M24 24h3v3h-3zm6 0h2v5h-2zm-6 6h5v2h-5z" fill="white" />
      <rect x="7" y="7" width="3" height="3" fill="#2464eb" />
      <rect x="26" y="7" width="3" height="3" fill="#2464eb" />
      <rect x="7" y="26" width="3" height="3" fill="#2464eb" />
    </svg>
  );
}
