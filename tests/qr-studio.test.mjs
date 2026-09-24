import assert from "node:assert/strict";
import test from "node:test";
import { buildPayload, escapeWifi } from "../src/lib/qr-studio/payload.ts";
import { canExportRaster, contrastRatio, createQrModel, createQrVisual, createSvg, scanningWarning } from "../src/lib/qr-studio/qr-render.ts";
import { defaultContent, defaultSettings } from "../src/lib/qr-studio/types.ts";

const content = (changes) => ({ ...defaultContent, ...changes });

test("URL requires a valid HTTP or HTTPS address", () => {
  assert.equal(buildPayload("URL", content({ url: "http://example.com" })).value, "http://example.com/");
  assert.equal(buildPayload("URL", content({ url: "https://example.com/a?q=1" })).value, "https://example.com/a?q=1");
  assert.equal(buildPayload("URL", content({ url: "ftp://example.com" })).kind, "invalid");
  assert.equal(buildPayload("URL", content({ url: "example.com" })).kind, "invalid");
  assert.equal(buildPayload("URL", content({ url: "  " })).kind, "empty");
});

test("text preserves spaces, lines, and Unicode", () => {
  const value = "  Hello 🌏\nSecond line, café  ";
  assert.equal(buildPayload("Text", content({ text: value })).value, value);
  assert.equal(buildPayload("Text", content({ text: " \n " })).kind, "empty");
});

test("WiFi payload escapes delimiters and handles open or hidden networks", () => {
  assert.equal(escapeWifi('a;b:c,d"e\\f'), 'a\\;b\\:c\\,d\\"e\\\\f');
  assert.equal(escapeWifi("a\r\nb\rc\nd"), "a\\nb\\nc\\nd");
  const secured = buildPayload("WiFi", content({ wifiSsid: "Cafe;Net", wifiPassword: "p:a,s", wifiHidden: true }));
  assert.equal(secured.value, "WIFI:T:WPA;S:Cafe\\;Net;P:p\\:a\\,s;H:true;;");
  const open = buildPayload("WiFi", content({ wifiSsid: "Guest", wifiSecurity: "nopass", wifiPassword: "ignored" }));
  assert.equal(open.value, "WIFI:T:nopass;S:Guest;;");
  assert.equal(buildPayload("WiFi", content({ wifiSsid: "Guest" })).kind, "invalid");
});

test("contact uses vCard 3.0 and escapes fields", () => {
  const card = buildPayload("Contact", content({ contactFirstName: "Ana", contactLastName: "O;Neil", contactPhone: "+63 123", contactEmail: "ana@example.com", contactCompany: "A,B" }));
  assert.equal(card.kind, "ready");
  assert.match(card.value, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.match(card.value, /N:O\\;Neil;Ana;;;/);
  assert.match(card.value, /FN:Ana O\\;Neil/);
  assert.match(card.value, /TEL;TYPE=CELL:\+63 123/);
  assert.match(card.value, /ORG:A\\,B\r\nEND:VCARD$/);
  assert.equal(buildPayload("Contact", content({ contactFirstName: "Ana", contactEmail: "bad" })).kind, "invalid");
});

test("email payload encodes subject and multiline body", () => {
  const result = buildPayload("Email", content({ emailTo: "person+test@example.com", emailSubject: "Hi & hello", emailMessage: "Line 1\nLine 2 🌏" }));
  assert.equal(result.kind, "ready");
  assert.ok(result.value.startsWith("mailto:person%2Btest@example.com?"));
  const query = new URLSearchParams(result.value.split("?")[1]);
  assert.equal(query.get("subject"), "Hi & hello");
  assert.equal(query.get("body"), "Line 1\nLine 2 🌏");
  assert.equal(buildPayload("Email", content({ emailTo: "bad" })).kind, "invalid");
});

test("QR encoder accepts all four correction levels and rejects excessive data", () => {
  for (const level of ["L", "M", "Q", "H"]) {
    const qr = createQrModel("https://example.com/", level);
    assert.ok(qr.count >= 21);
    assert.equal(qr.data.length, qr.count ** 2);
  }
  assert.throws(() => createQrModel("🌏".repeat(4000), "H"));
});

test("SVG reflects visual settings and embeds only processed PNG logos", () => {
  const qr = createQrModel("hello", "H");
  const settings = { ...defaultSettings, size: 500, foreground: "#123456", background: "#F9F9F9", dotStyle: "rounded", quietZone: "compact" };
  const logo = { name: "logo.png", dataUrl: "data:image/png;base64,aGVsbG8=", width: 20, height: 10 };
  const visual = createQrVisual(qr, settings, logo);
  const svg = createSvg(visual);
  assert.equal(visual.total, qr.count + 8);
  assert.match(svg, /width="500" height="500"/);
  assert.match(svg, /fill="#123456"/);
  assert.match(svg, /fill="#F9F9F9"/);
  assert.match(svg, /<image href="data:image\/png;base64,aGVsbG8="/);
  assert.ok(canExportRaster(visual));
  assert.throws(() => createSvg(createQrVisual(qr, settings, { ...logo, dataUrl: "javascript:bad" })));
});

test("scanability guidance warns without changing the chosen colors", () => {
  const qr = createQrModel("hello", "M");
  const settings = { ...defaultSettings, foreground: "#777777", background: "#888888" };
  const visual = createQrVisual(qr, settings, null);
  assert.ok(contrastRatio(settings.foreground, settings.background) < 4.5);
  assert.match(scanningWarning(visual), /low contrast/);
  assert.equal(visual.foreground, "#777777");
  assert.match(scanningWarning(createQrVisual(qr, { ...defaultSettings, foreground: "#FFFFFF", background: "#000000" }, null)), /darker foreground/);
  const tooDense = createQrVisual(qr, { ...defaultSettings, size: 20 }, null);
  assert.match(scanningWarning(tooDense), /Increase size/);
  assert.equal(canExportRaster(tooDense), false);
});
