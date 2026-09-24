"use client";

import { useState } from "react";
import Image from "next/image";
import { Accordion } from "./accordion";
import { Icon } from "./icons";
import { StepHeading } from "./step-heading";
import { isHexColor } from "@/lib/qr-studio/qr-render";
import type { LogoData, QrSettings, UpdateSetting } from "@/lib/qr-studio/types";

function ColorControl({ label, id, value, fallback, onChange }: { label: string; id: string; value: string; fallback: string; onChange: (value: string) => void }) {
  const valid = isHexColor(value);
  return (
    <div className="min-w-0">
      <label htmlFor={`${id}-hex`} className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={valid ? value : fallback} onChange={(event) => onChange(event.target.value.toUpperCase())} className="color-input" aria-label={`${label} color picker`} />
        <input id={`${id}-hex`} type="text" value={value} maxLength={7} onChange={(event) => onChange(event.target.value.toUpperCase())} className="field font-mono text-sm" aria-invalid={!valid} aria-describedby={!valid ? `${id}-error` : undefined} />
      </div>
      {!valid && <p id={`${id}-error`} className="error-text mt-1 text-xs">Use a 6-digit hex color, like #000000.</p>}
    </div>
  );
}

interface CustomizePanelProps {
  settings: QrSettings;
  logo: LogoData | null;
  logoError: string;
  logoBusy: boolean;
  onSettingChange: UpdateSetting;
  onLogoFile: (file: File) => void;
  onRemoveLogo: () => void;
}

export function CustomizePanel({ settings, logo, logoError, logoBusy, onSettingChange, onLogoFile, onRemoveLogo }: CustomizePanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sizeInput, setSizeInput] = useState(String(settings.size));

  function updateSizeInput(value: string) {
    if (!/^\d*$/.test(value)) return;
    setSizeInput(value);
    const parsed = Number(value);
    if (value && parsed >= 160 && parsed <= 1000) onSettingChange("size", parsed);
  }

  function commitSizeInput() {
    const parsed = Math.max(160, Math.min(1000, Number(sizeInput) || 400));
    onSettingChange("size", parsed);
    setSizeInput(String(parsed));
  }

  return (
    <section className="panel min-w-0 rounded-2xl p-4 sm:p-5" aria-label="Step 2: Customize">
      <StepHeading number={2} title="Customize" description="Personalize your QR code with colors, size, and logo." action={
        <button type="button" className="-mr-1 flex h-8 w-8 items-center justify-center rounded-md md:hidden" aria-label={mobileOpen ? "Collapse customize settings" : "Expand customize settings"} aria-expanded={mobileOpen} aria-controls="customize-controls" onClick={() => setMobileOpen((open) => !open)}>
          <Icon name="chevron" className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} width="19" height="19" />
        </button>
      } />
      <div id="customize-controls" className={`mt-5 space-y-4 ${mobileOpen ? "block" : "hidden"} md:block`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorControl id="foreground" label="Foreground Color" value={settings.foreground} fallback="#000000" onChange={(value) => onSettingChange("foreground", value)} />
          <ColorControl id="background" label="Background Color" value={settings.background} fallback="#FFFFFF" onChange={(value) => onSettingChange("background", value)} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="qr-size" className="shrink-0 whitespace-nowrap text-sm font-medium">Size: <span className="ml-1 font-normal">{settings.size} px</span></label>
            <div className="flex shrink-0 items-center gap-1 text-sm text-[var(--muted)]"><input aria-label="QR size in pixels" type="number" min={160} max={1000} step={10} value={sizeInput} onChange={(event) => updateSizeInput(event.target.value)} onBlur={commitSizeInput} className="field w-16 text-center text-sm sm:w-[76px]" /><span className="hidden sm:inline">px</span></div>
          </div>
          <input id="qr-size" type="range" min={160} max={1000} step={10} value={settings.size} onChange={(event) => { onSettingChange("size", Number(event.target.value)); setSizeInput(event.target.value); }} className="range" />
        </div>
        <div>
          <label htmlFor="error-correction" className="mb-1.5 block text-sm font-medium">Error Correction <span title="Higher levels can help a QR code remain readable if partially obscured." aria-hidden="true" className="ml-1 inline-block text-[var(--muted)]">ⓘ</span></label>
          <select id="error-correction" name="error-correction" value={settings.errorCorrection} onChange={(event) => {
            const value = event.target.value;
            if (value === "L" || value === "M" || value === "Q" || value === "H") onSettingChange("errorCorrection", value);
          }} disabled={Boolean(logo)} className="field text-sm disabled:opacity-65">
            <option value="L">L (7%) - Low</option><option value="M">M (15%) - Balanced</option><option value="Q">Q (25%) - High</option><option value="H">H (30%) - Highest</option>
          </select>
          {logo && <p className="mt-1.5 text-xs text-[var(--muted)]">H correction is used while a logo is added.</p>}
        </div>
        <Accordion title="Add Logo (Optional)" icon="image">
          <label htmlFor="logo-file" className="mb-2 block text-sm font-medium">Choose a logo image</label>
          <input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onLogoFile(file);
            event.currentTarget.value = "";
          }} className="block w-full max-w-full text-sm file:mr-3 file:rounded-md file:border file:border-[var(--border-strong)] file:bg-[var(--surface)] file:px-3 file:py-2 file:text-[var(--text)]" />
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">PNG, JPEG, or WebP · up to 2 MB · processed only in your browser.</p>
          {logoBusy && <p aria-live="polite" className="mt-2 text-sm text-[var(--muted)]">Preparing logo…</p>}
          {logoError && <p role="alert" className="error-text mt-2 text-sm">{logoError}</p>}
          {logo && <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] p-2">
            <Image src={logo.dataUrl} alt="Selected logo preview" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded object-contain" />
            <span className="min-w-0 flex-1 truncate text-xs" title={logo.name}>{logo.name}</span>
            <button type="button" onClick={onRemoveLogo} className="button min-h-9 shrink-0 px-2 text-xs">Remove</button>
          </div>}
        </Accordion>
        <Accordion title="Advanced Settings" icon="settings">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="dot-style" className="mb-1.5 block text-sm font-medium">Dot style</label><select id="dot-style" value={settings.dotStyle} onChange={(event) => onSettingChange("dotStyle", event.target.value === "rounded" ? "rounded" : "square")} className="field"><option value="square">Square</option><option value="rounded">Rounded</option></select></div>
            <div><label htmlFor="quiet-zone" className="mb-1.5 block text-sm font-medium">Quiet zone</label><select id="quiet-zone" value={settings.quietZone} onChange={(event) => {
              const value = event.target.value;
              onSettingChange("quietZone", value === "wide" ? "wide" : value === "compact" ? "compact" : "standard");
            }} className="field"><option value="standard">Standard</option><option value="wide">Wide</option><option value="compact">Compact</option></select></div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Every quiet zone option keeps at least four clear modules around the code.</p>
        </Accordion>
      </div>
    </section>
  );
}
