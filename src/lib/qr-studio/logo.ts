import type { LogoData } from "./types";

const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxBytes = 2 * 1024 * 1024;
const maxDimension = 512;

export async function processLogo(file: File): Promise<LogoData> {
  if (!supportedTypes.has(file.type)) throw new Error("Choose a PNG, JPEG, or WebP logo.");
  if (file.size > maxBytes) throw new Error("Choose a logo smaller than 2 MB.");
  if (file.size === 0) throw new Error("This logo file is empty.");

  const objectUrl = URL.createObjectURL(file);
  let image: HTMLImageElement;
  try {
    image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () => reject(new Error("This image could not be opened. Try another logo."));
      candidate.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  if (!image.naturalWidth || !image.naturalHeight) throw new Error("This image has invalid dimensions.");
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Logo processing is unavailable in this browser.");
  context.drawImage(image, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl.startsWith("data:image/png;base64,")) throw new Error("The logo could not be processed.");
  return { name: file.name, dataUrl, width, height };
}
