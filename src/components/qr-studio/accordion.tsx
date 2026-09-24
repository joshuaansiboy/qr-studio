import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function Accordion({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  return (
    <details className="accordion-details">
      <summary className="accordion-trigger">
        <span className="flex items-center gap-2.5 text-sm font-medium sm:text-[0.95rem]"><Icon name={icon} width="19" height="19" />{title}</span>
        <Icon name="chevron" className="accordion-chevron" width="18" height="18" />
      </summary>
      <div className="rounded-b-xl border border-t-0 border-[var(--border)] px-4 pb-4 pt-3">{children}</div>
    </details>
  );
}
