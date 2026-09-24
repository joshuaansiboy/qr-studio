"use client";

import { useMemo, useRef, useState } from "react";
import { ContentPanel } from "./content-panel";
import { CustomizePanel } from "./customize-panel";
import { PreviewPanel } from "./preview-panel";
import { processLogo } from "@/lib/qr-studio/logo";
import { buildPayload } from "@/lib/qr-studio/payload";
import { canExportRaster, createPngBlob, createQrModel, createQrVisual, createSvg, isHexColor, scanningWarning, type QrModel } from "@/lib/qr-studio/qr-render";
import { defaultContent, defaultSettings, type ContentFields, type ContentType, type LogoData, type QrSettings } from "@/lib/qr-studio/types";

type Action = "png" | "svg" | "copy";
type Feedback = { text: string; kind: "success" | "error" };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function Workspace() {
  const [type, setType] = useState<ContentType>("URL");
  const [fields, setFields] = useState<ContentFields>(defaultContent);
  const [settings, setSettings] = useState<QrSettings>(defaultSettings);
  const [logo, setLogo] = useState<LogoData | null>(null);
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<ContentType, boolean>>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busyAction, setBusyAction] = useState<Action | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const logoRequest = useRef(0);

  const payload = useMemo(() => buildPayload(type, fields), [type, fields]);
  const colorError = isHexColor(settings.foreground) && isHexColor(settings.background)
    ? ""
    : "Enter valid six-digit foreground and background colors.";
  const qrState = useMemo<{ model: QrModel | null; error: string }>(() => {
    if (payload.kind !== "ready") return { model: null, error: "" };
    if (new TextEncoder().encode(payload.value).length > 10_000) {
      return { model: null, error: "This content is too long for one QR code. Shorten it and try again." };
    }
    try {
      return { model: createQrModel(payload.value, settings.errorCorrection), error: "" };
    } catch {
      return { model: null, error: "This content is too long for the selected correction level. Shorten it or choose a lower level." };
    }
  }, [payload, settings.errorCorrection]);
  const visual = useMemo(() => qrState.model && !colorError ? createQrVisual(qrState.model, settings, logo) : null, [qrState.model, settings, logo, colorError]);
  const previewMessage = payload.kind === "ready" ? colorError || qrState.error : payload.message;
  const warning = visual ? scanningWarning(visual) : "";
  const canRaster = Boolean(visual && canExportRaster(visual));

  function updateContent<K extends keyof ContentFields>(key: K, value: ContentFields[K]) {
    setFields((previous) => ({ ...previous, [key]: value }));
    setTouched((previous) => ({ ...previous, [type]: true }));
    setFeedback(null);
  }

  function updateSetting<K extends keyof QrSettings>(key: K, value: QrSettings[K]) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setFeedback(null);
  }

  async function addLogo(file: File) {
    const request = ++logoRequest.current;
    setLogoBusy(true);
    setLogoError("");
    setFeedback(null);
    try {
      const processed = await processLogo(file);
      if (request !== logoRequest.current) return;
      setLogo(processed);
      setSettings((previous) => ({ ...previous, errorCorrection: "H" }));
    } catch (error) {
      if (request === logoRequest.current) setLogoError(errorText(error, "This logo could not be used."));
    } finally {
      if (request === logoRequest.current) setLogoBusy(false);
    }
  }

  function removeLogo() {
    logoRequest.current++;
    setLogo(null);
    setLogoBusy(false);
    setLogoError("");
    setFeedback(null);
  }

  async function downloadPng() {
    if (!visual || !canRaster) return;
    setBusyAction("png");
    try {
      downloadBlob(await createPngBlob(visual), "qr-code.png");
      setFeedback({ text: "PNG downloaded.", kind: "success" });
    } catch (error) {
      setFeedback({ text: errorText(error, "PNG download failed. Please try again."), kind: "error" });
    } finally {
      setBusyAction(null);
    }
  }

  function downloadSvg() {
    if (!visual) return;
    try {
      downloadBlob(new Blob([createSvg(visual)], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
      setFeedback({ text: "SVG downloaded.", kind: "success" });
    } catch (error) {
      setFeedback({ text: errorText(error, "SVG download failed. Please try again."), kind: "error" });
    }
  }

  async function copyQrCode() {
    if (!visual || !canRaster) return;
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setFeedback({ text: "Image copying is not supported here. Download PNG instead.", kind: "error" });
      return;
    }
    setBusyAction("copy");
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": createPngBlob(visual) })]);
      setFeedback({ text: "QR image copied to clipboard.", kind: "success" });
    } catch {
      setFeedback({ text: "Could not copy the image. Check clipboard permission or download PNG instead.", kind: "error" });
    } finally {
      setBusyAction(null);
    }
  }

  function reset() {
    logoRequest.current++;
    setType("URL");
    setFields({ ...defaultContent });
    setSettings({ ...defaultSettings });
    setLogo(null);
    setLogoError("");
    setLogoBusy(false);
    setTouched({});
    setFeedback(null);
    setResetVersion((previous) => previous + 1);
  }

  return (
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.92fr)] lg:gap-5">
      <div className="grid min-w-0 gap-4">
        <ContentPanel type={type} fields={fields} validation={payload} showValidation={Boolean(touched[type])} onTypeChange={(next) => { setType(next); setFeedback(null); }} onFieldChange={updateContent} />
        <CustomizePanel key={resetVersion} settings={settings} logo={logo} logoError={logoError} logoBusy={logoBusy} onSettingChange={updateSetting} onLogoFile={addLogo} onRemoveLogo={removeLogo} />
      </div>
      <PreviewPanel visual={visual} message={previewMessage} warning={warning} feedback={feedback} busyAction={busyAction} canRaster={canRaster} onDownloadPng={downloadPng} onDownloadSvg={downloadSvg} onCopy={copyQrCode} onReset={reset} />
    </div>
  );
}
