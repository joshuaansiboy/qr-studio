import type { ContentFields, ContentType } from "./types";

export type PayloadResult =
  | { kind: "ready"; value: string; message: ""; field?: never }
  | { kind: "empty" | "invalid"; value: null; message: string; field?: keyof ContentFields };

const empty = (message: string, field: keyof ContentFields): PayloadResult => ({ kind: "empty", value: null, message, field });
const invalid = (message: string, field: keyof ContentFields): PayloadResult => ({ kind: "invalid", value: null, message, field });
const ready = (value: string): PayloadResult => ({ kind: "ready", value, message: "" });

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

export function escapeWifi(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/([;,:"])/g, "\\$1").replace(/\r\n|\r|\n/g, "\\n");
}

export function escapeVCard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildPayload(type: ContentType, fields: ContentFields): PayloadResult {
  if (type === "URL") {
    const value = fields.url.trim();
    if (!value) return empty("Enter a website URL to see its QR code.", "url");
    if (/[\r\n]/.test(value)) return invalid("Use one URL without line breaks.", "url");
    try {
      const url = new URL(value);
      if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
        return invalid("Enter a full http:// or https:// URL.", "url");
      }
      return ready(url.toString());
    } catch {
      return invalid("Enter a valid URL starting with http:// or https://.", "url");
    }
  }

  if (type === "Text") {
    if (!fields.text.trim()) return empty("Enter some text to see its QR code.", "text");
    return ready(fields.text);
  }

  if (type === "WiFi") {
    if (!fields.wifiSsid.trim()) return empty("Enter a network name to see its QR code.", "wifiSsid");
    if (fields.wifiSecurity !== "nopass" && !fields.wifiPassword) {
      return invalid("Enter the WiFi password, or choose an open network.", "wifiPassword");
    }
    const password = fields.wifiSecurity === "nopass" ? "" : `P:${escapeWifi(fields.wifiPassword)};`;
    const hidden = fields.wifiHidden ? "H:true;" : "";
    return ready(`WIFI:T:${fields.wifiSecurity};S:${escapeWifi(fields.wifiSsid)};${password}${hidden};`);
  }

  if (type === "Contact") {
    const first = fields.contactFirstName.trim();
    const last = fields.contactLastName.trim();
    if (!first && !last) return empty("Enter a first or last name for the contact.", "contactFirstName");
    const email = fields.contactEmail.trim();
    if (email && !validEmail(email)) return invalid("Enter a valid contact email address.", "contactEmail");
    const fullName = [first, last].filter(Boolean).join(" ");
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
      `FN:${escapeVCard(fullName)}`,
    ];
    if (fields.contactPhone.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCard(fields.contactPhone.trim())}`);
    if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
    if (fields.contactCompany.trim()) lines.push(`ORG:${escapeVCard(fields.contactCompany.trim())}`);
    lines.push("END:VCARD");
    return ready(lines.join("\r\n"));
  }

  const email = fields.emailTo.trim();
  if (!email) return empty("Enter a recipient email address.", "emailTo");
  if (!validEmail(email)) return invalid("Enter a valid recipient email address.", "emailTo");
  const query: string[] = [];
  if (fields.emailSubject) query.push(`subject=${encodeURIComponent(fields.emailSubject)}`);
  if (fields.emailMessage) query.push(`body=${encodeURIComponent(fields.emailMessage)}`);
  const address = encodeURIComponent(email).replace(/%40/g, "@");
  return ready(`mailto:${address}${query.length ? `?${query.join("&")}` : ""}`);
}
