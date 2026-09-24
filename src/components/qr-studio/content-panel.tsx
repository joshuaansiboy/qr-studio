import { Icon, type IconName } from "./icons";
import { StepHeading } from "./step-heading";
import type { PayloadResult } from "@/lib/qr-studio/payload";
import type { ContentFields, ContentType, UpdateContent } from "@/lib/qr-studio/types";

const types: { label: ContentType; icon: IconName }[] = [
  { label: "URL", icon: "link" },
  { label: "Text", icon: "text" },
  { label: "WiFi", icon: "wifi" },
  { label: "Contact", icon: "contact" },
  { label: "Email", icon: "mail" },
];

interface ContentPanelProps {
  type: ContentType;
  fields: ContentFields;
  validation: PayloadResult;
  showValidation: boolean;
  onTypeChange: (type: ContentType) => void;
  onFieldChange: UpdateContent;
}

function Field({ label, id, type = "text", value, onChange, placeholder, autoComplete, invalid = false, disabled = false }: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={invalid ? "content-error" : undefined} className="field disabled:opacity-60" />
    </div>
  );
}

export function ContentPanel({ type, fields, validation, showValidation, onTypeChange, onFieldChange }: ContentPanelProps) {
  const invalidField = showValidation && validation.kind === "invalid" ? validation.field : null;

  return (
    <section className="panel min-w-0 rounded-2xl p-4 sm:p-5" aria-label="Step 1: Content">
      <StepHeading number={1} title="Content" description="Choose what you want to encode in your QR code." />
      <div role="group" aria-label="Content type" className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-5 sm:gap-2">
        {types.map(({ label, icon }) => (
          <button key={label} type="button" className="tab-button flex items-center justify-center gap-1.5 px-1 text-[0.82rem] sm:text-sm" aria-pressed={type === label} onClick={() => onTypeChange(label)}>
            <Icon name={icon} width="17" height="17" />{label}
          </button>
        ))}
      </div>
      <div className="mt-3.5" hidden={type !== "URL"}>
        <Field id="url" label="Enter URL" type="url" value={fields.url} onChange={(value) => onFieldChange("url", value)} placeholder="https://example.com" autoComplete="url" invalid={invalidField === "url"} />
      </div>
      <div className="mt-3.5" hidden={type !== "Text"}>
        <label htmlFor="plain-text" className="mb-1.5 block text-sm font-medium">Enter text</label>
        <textarea id="plain-text" name="plain-text" rows={3} value={fields.text} onChange={(event) => onFieldChange("text", event.target.value)} placeholder="Type the text you want to share" aria-invalid={invalidField === "text" || undefined} aria-describedby={invalidField === "text" ? "content-error" : undefined} className="field field-textarea" />
      </div>
      <div className="mt-3.5 grid gap-3 sm:grid-cols-2" hidden={type !== "WiFi"}>
        <Field id="network-name" label="Network name" value={fields.wifiSsid} onChange={(value) => onFieldChange("wifiSsid", value)} placeholder="WiFi name" autoComplete="off" invalid={invalidField === "wifiSsid"} />
        <Field id="network-password" label="Password" type="password" value={fields.wifiPassword} onChange={(value) => onFieldChange("wifiPassword", value)} placeholder={fields.wifiSecurity === "nopass" ? "Not needed for open WiFi" : "Network password"} autoComplete="off" disabled={fields.wifiSecurity === "nopass"} invalid={invalidField === "wifiPassword"} />
        <div className="min-w-0"><label htmlFor="wifi-security" className="mb-1.5 block text-sm font-medium">Security</label><select id="wifi-security" name="wifi-security" value={fields.wifiSecurity} onChange={(event) => {
          const value = event.target.value;
          if (value === "WPA" || value === "WEP" || value === "nopass") onFieldChange("wifiSecurity", value);
        }} className="field"><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
        <label className="flex items-end gap-2 pb-3 text-sm"><input type="checkbox" name="hidden-network" checked={fields.wifiHidden} onChange={(event) => onFieldChange("wifiHidden", event.target.checked)} className="h-4 w-4 accent-[#2464eb]" /> Hidden network</label>
      </div>
      <div className="mt-3.5 grid gap-3 sm:grid-cols-2" hidden={type !== "Contact"}>
        <Field id="contact-first-name" label="First name" value={fields.contactFirstName} onChange={(value) => onFieldChange("contactFirstName", value)} autoComplete="given-name" invalid={invalidField === "contactFirstName"} />
        <Field id="contact-last-name" label="Last name" value={fields.contactLastName} onChange={(value) => onFieldChange("contactLastName", value)} autoComplete="family-name" />
        <Field id="contact-phone" label="Phone number" type="tel" value={fields.contactPhone} onChange={(value) => onFieldChange("contactPhone", value)} autoComplete="tel" />
        <Field id="contact-email" label="Email address" type="email" value={fields.contactEmail} onChange={(value) => onFieldChange("contactEmail", value)} autoComplete="email" invalid={invalidField === "contactEmail"} />
        <div className="sm:col-span-2"><Field id="contact-company" label="Company (optional)" value={fields.contactCompany} onChange={(value) => onFieldChange("contactCompany", value)} autoComplete="organization" /></div>
      </div>
      <div className="mt-3.5 grid gap-3" hidden={type !== "Email"}>
        <Field id="email-to" label="Recipient email" type="email" value={fields.emailTo} onChange={(value) => onFieldChange("emailTo", value)} placeholder="hello@example.com" autoComplete="email" invalid={invalidField === "emailTo"} />
        <Field id="email-subject" label="Subject" value={fields.emailSubject} onChange={(value) => onFieldChange("emailSubject", value)} placeholder="Email subject" />
        <div><label htmlFor="email-message" className="mb-1.5 block text-sm font-medium">Message</label><textarea id="email-message" name="email-message" rows={3} value={fields.emailMessage} onChange={(event) => onFieldChange("emailMessage", event.target.value)} className="field field-textarea" placeholder="Write a message" /></div>
      </div>
      {showValidation && validation.kind === "invalid" && <p id="content-error" aria-live="polite" className="error-text mt-2 text-sm">{validation.message}</p>}
    </section>
  );
}
