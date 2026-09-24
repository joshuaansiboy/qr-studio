import type { ReactNode } from "react";

export function StepHeading({ number, title, description, action }: { number: number; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="step-dot" aria-hidden="true">{number}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[1.06rem] font-bold leading-6 text-[var(--text)] sm:text-lg">{title}</h2>
          {action}
        </div>
        <p className="text-[0.8rem] leading-snug text-[var(--muted)] sm:text-sm">{description}</p>
      </div>
    </div>
  );
}
