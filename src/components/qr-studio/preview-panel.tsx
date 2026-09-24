import { Icon } from "./icons";
import { StepHeading } from "./step-heading";
import type { QrVisual } from "@/lib/qr-studio/qr-render";

type Action = "png" | "svg" | "copy";

interface PreviewPanelProps {
  visual: QrVisual | null;
  message: string;
  warning: string;
  feedback: { text: string; kind: "success" | "error" } | null;
  busyAction: Action | null;
  canRaster: boolean;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onCopy: () => void;
  onReset: () => void;
}

export function PreviewPanel({ visual, message, warning, feedback, busyAction, canRaster, onDownloadPng, onDownloadSvg, onCopy, onReset }: PreviewPanelProps) {
  const unavailable = !visual || busyAction !== null;
  const actions = [
    { label: "Download PNG", shortLabel: "Download PNG", icon: "download", primary: true, disabled: unavailable || !canRaster, onClick: onDownloadPng },
    { label: "Download SVG", shortLabel: "SVG", icon: "file", primary: false, disabled: unavailable, onClick: onDownloadSvg },
    { label: "Copy QR Code", shortLabel: "Copy", icon: "copy", primary: false, disabled: unavailable || !canRaster, onClick: onCopy },
    { label: "Reset", shortLabel: "Reset", icon: "reset", primary: false, disabled: busyAction !== null, onClick: onReset },
  ] as const;

  return (
    <section className="panel min-w-0 self-start rounded-2xl p-4 sm:p-5" aria-label="Step 3: QR Preview">
      <StepHeading number={3} title="QR Preview" description="Your QR code updates automatically." />
      <div className="preview-tile mx-auto mt-5 flex aspect-square w-full max-w-[315px] items-center justify-center rounded-2xl p-5 sm:p-7">
        {visual ? (
          <svg viewBox={`0 0 ${visual.total} ${visual.total}`} className="h-full w-full" role="img" aria-label="Generated QR code preview" shapeRendering={visual.rounded ? "auto" : "crispEdges"}>
            <rect width={visual.total} height={visual.total} fill={visual.background} />
            <path d={visual.path} fill={visual.foreground} />
            {visual.logo && visual.logoPlacement && <>
              <rect x={visual.logoPlacement.boxX} y={visual.logoPlacement.boxY} width={visual.logoPlacement.boxSize} height={visual.logoPlacement.boxSize} rx={visual.logoPlacement.boxSize * 0.08} fill={visual.background} />
              <image href={visual.logo.dataUrl} x={visual.logoPlacement.imageX} y={visual.logoPlacement.imageY} width={visual.logoPlacement.imageWidth} height={visual.logoPlacement.imageHeight} preserveAspectRatio="xMidYMid meet" />
            </>}
          </svg>
        ) : (
          <div className="max-w-[220px] text-center text-[#566783]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#2464eb]"><Icon name="image" width="24" height="24" /></div>
            <p aria-live="polite" className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-[var(--muted)]">{visual ? "Live preview · ready to download" : "Your content stays in this browser"}</p>
      {warning && <p className="soft-panel mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed text-[var(--text)]" role="status">{warning}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-1 xl:grid-cols-2">
        {actions.map(({ label, shortLabel, icon, primary, disabled, onClick }) => (
          <button key={label} type="button" disabled={disabled} aria-label={label} onClick={onClick} title={disabled && label !== "Reset" ? message || (!canRaster ? "Increase size to enable PNG and copy." : "") : undefined} className={`button flex items-center justify-center gap-2 px-2 text-[0.82rem] sm:text-sm ${primary ? "button-primary col-span-2 lg:col-span-1" : ""} ${label === "Reset" ? "col-span-2 lg:col-span-1" : ""}`}>
            <Icon name={icon} width="19" height="19" /><span className="sm:hidden">{shortLabel}</span><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true" className={`min-h-5 pt-2 text-center text-xs ${feedback?.kind === "error" ? "error-text" : "text-[var(--muted)]"}`}>{feedback?.text ?? ""}</div>
      <aside className="soft-panel mt-2 rounded-xl p-4 text-sm leading-relaxed text-[var(--muted)]">
        <div className="mb-1 flex items-center gap-2 font-semibold text-[var(--text)]"><span aria-hidden="true">💡</span> Tips</div>
        <ul className="list-disc space-y-0.5 pl-6">
          <li>Use high contrast colors for easier scanning.</li>
          <li>Keep logos small for the best results.</li>
          <li>No account required.</li>
        </ul>
      </aside>
    </section>
  );
}
