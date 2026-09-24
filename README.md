# QR Studio

QR Studio is a free, client-side QR code generator built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and the `qrcode` library. It creates URL, plain-text, WiFi, contact (vCard), and email QR codes. You can change colors, size, error correction, dot style, and quiet zone, or add a small logo. Download PNG/SVG files or copy a PNG image to the clipboard.

QR content, WiFi credentials, and logos are processed in the browser and are not sent to a QR API. There are no accounts, analytics, database, or backend QR endpoints. Only the light/dark theme preference is saved locally.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the production build locally:

```bash
npm run build
npm run start
```

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Project structure

- `src/app/` — page, metadata, styles, and icon
- `src/components/qr-studio/` — interface and client-side workspace
- `src/lib/qr-studio/` — payload encoding, QR rendering, and local logo processing
- `tests/` — payload and rendering unit tests

PNG and clipboard export require enough pixels per QR module; increase the size or use SVG for dense codes. Image clipboard copying requires browser support, a secure context, and permission. Very low-contrast or inverted colors may not scan reliably; the interface warns without changing your selection.
