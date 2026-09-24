import QRCode from "qrcode";
import type { ErrorCorrection, LogoData, QrSettings, QuietZone } from "./types";

export interface QrModel {
  count: number;
  data: Uint8Array;
  version: number;
}

export interface LogoPlacement {
  boxX: number;
  boxY: number;
  boxSize: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
}

export interface QrVisual {
  model: QrModel;
  total: number;
  margin: number;
  path: string;
  foreground: string;
  background: string;
  size: number;
  rounded: boolean;
  logo: LogoData | null;
  logoPlacement: LogoPlacement | null;
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function quietZoneModules(value: QuietZone) {
  return value === "wide" ? 8 : value === "compact" ? 4 : 6;
}

export function createQrModel(payload: string, errorCorrection: ErrorCorrection): QrModel {
  const result = QRCode.create(payload, { errorCorrectionLevel: errorCorrection });
  return { count: result.modules.size, data: result.modules.data, version: result.version };
}

function inFinder(x: number, y: number, count: number) {
  return (x < 7 && y < 7) || (x >= count - 7 && y < 7) || (x < 7 && y >= count - 7);
}

function roundedModule(x: number, y: number) {
  const radius = 0.16;
  const left = x + radius;
  const right = x + 1 - radius;
  const top = y + radius;
  const bottom = y + 1 - radius;
  return `M${left} ${y}H${right}Q${x + 1} ${y} ${x + 1} ${top}V${bottom}Q${x + 1} ${y + 1} ${right} ${y + 1}H${left}Q${x} ${y + 1} ${x} ${bottom}V${top}Q${x} ${y} ${left} ${y}Z`;
}

function makePath(model: QrModel, margin: number, rounded: boolean) {
  const parts: string[] = [];
  for (let y = 0; y < model.count; y++) {
    for (let x = 0; x < model.count; x++) {
      if (!model.data[y * model.count + x]) continue;
      const px = x + margin;
      const py = y + margin;
      parts.push(rounded && !inFinder(x, y, model.count) ? roundedModule(px, py) : `M${px} ${py}h1v1h-1z`);
    }
  }
  return parts.join("");
}

function placeLogo(model: QrModel, margin: number, logo: LogoData | null): LogoPlacement | null {
  if (!logo) return null;
  const boxSize = model.count * 0.21;
  const boxX = margin + (model.count - boxSize) / 2;
  const boxY = boxX;
  const available = boxSize * 0.78;
  const scale = Math.min(available / logo.width, available / logo.height);
  const imageWidth = logo.width * scale;
  const imageHeight = logo.height * scale;
  return {
    boxX, boxY, boxSize,
    imageX: boxX + (boxSize - imageWidth) / 2,
    imageY: boxY + (boxSize - imageHeight) / 2,
    imageWidth, imageHeight,
  };
}

export function createQrVisual(model: QrModel, settings: QrSettings, logo: LogoData | null): QrVisual {
  if (!isHexColor(settings.foreground) || !isHexColor(settings.background)) throw new Error("Enter valid six-digit hex colors.");
  const margin = quietZoneModules(settings.quietZone);
  const rounded = settings.dotStyle === "rounded";
  return {
    model,
    total: model.count + margin * 2,
    margin,
    path: makePath(model, margin, rounded),
    foreground: settings.foreground,
    background: settings.background,
    size: settings.size,
    rounded,
    logo,
    logoPlacement: placeLogo(model, margin, logo),
  };
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function scanningWarning(visual: QrVisual) {
  if (luminance(visual.foreground) >= luminance(visual.background)) {
    return "Use a darker foreground than background for more reliable scanning.";
  }
  const contrast = contrastRatio(visual.foreground, visual.background);
  if (contrast < 4.5) return "These colors have low contrast and may be difficult to scan.";
  if (visual.size / visual.total < 3) return `Increase size to at least ${Math.ceil(visual.total * 3 / 10) * 10} px for a clearer PNG.`;
  return "";
}

export function canExportRaster(visual: QrVisual) {
  return visual.size / visual.total >= 3;
}

export function createSvg(visual: QrVisual) {
  const { total, size, path, foreground, background, logo, logoPlacement } = visual;
  let overlay = "";
  if (logo && logoPlacement) {
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(logo.dataUrl)) throw new Error("The logo could not be embedded safely.");
    const p = logoPlacement;
    overlay = `<rect x="${p.boxX}" y="${p.boxY}" width="${p.boxSize}" height="${p.boxSize}" rx="${p.boxSize * 0.08}" fill="${background}"/><image href="${logo.dataUrl}" x="${p.imageX}" y="${p.imageY}" width="${p.imageWidth}" height="${p.imageHeight}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}"><rect width="${total}" height="${total}" fill="${background}"/><path d="${path}" fill="${foreground}"/>${overlay}</svg>`;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be rendered."));
    image.src = source;
  });
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
}

export async function createPngBlob(visual: QrVisual): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = visual.size;
  canvas.height = visual.size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.fillStyle = visual.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = visual.foreground;
  const unit = visual.size / visual.total;
  for (let y = 0; y < visual.model.count; y++) {
    for (let x = 0; x < visual.model.count; x++) {
      if (!visual.model.data[y * visual.model.count + x]) continue;
      const px = (x + visual.margin) * unit;
      const py = (y + visual.margin) * unit;
      if (visual.rounded && !inFinder(x, y, visual.model.count)) {
        drawRoundedRect(context, px, py, unit, unit, unit * 0.16);
      } else {
        const left = Math.round(px);
        const top = Math.round(py);
        const right = Math.round(px + unit);
        const bottom = Math.round(py + unit);
        context.fillRect(left, top, right - left, bottom - top);
      }
    }
  }
  if (visual.logo && visual.logoPlacement) {
    const p = visual.logoPlacement;
    const image = await loadImage(visual.logo.dataUrl);
    context.fillStyle = visual.background;
    drawRoundedRect(context, p.boxX * unit, p.boxY * unit, p.boxSize * unit, p.boxSize * unit, p.boxSize * unit * 0.08);
    context.drawImage(image, p.imageX * unit, p.imageY * unit, p.imageWidth * unit, p.imageHeight * unit);
  }
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export is unavailable.")), "image/png"));
}
