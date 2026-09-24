export type ContentType = "URL" | "Text" | "WiFi" | "Contact" | "Email";
export type WifiSecurity = "WPA" | "WEP" | "nopass";
export type ErrorCorrection = "L" | "M" | "Q" | "H";
export type DotStyle = "square" | "rounded";
export type QuietZone = "compact" | "standard" | "wide";

export interface ContentFields {
  url: string;
  text: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  wifiHidden: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  contactEmail: string;
  contactCompany: string;
  emailTo: string;
  emailSubject: string;
  emailMessage: string;
}

export interface QrSettings {
  foreground: string;
  background: string;
  size: number;
  errorCorrection: ErrorCorrection;
  dotStyle: DotStyle;
  quietZone: QuietZone;
}

export interface LogoData {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export const defaultContent: ContentFields = {
  url: "",
  text: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  wifiHidden: false,
  contactFirstName: "",
  contactLastName: "",
  contactPhone: "",
  contactEmail: "",
  contactCompany: "",
  emailTo: "",
  emailSubject: "",
  emailMessage: "",
};

export const defaultSettings: QrSettings = {
  foreground: "#000000",
  background: "#FFFFFF",
  size: 400,
  errorCorrection: "M",
  dotStyle: "square",
  quietZone: "standard",
};

export type UpdateContent = <K extends keyof ContentFields>(key: K, value: ContentFields[K]) => void;
export type UpdateSetting = <K extends keyof QrSettings>(key: K, value: QrSettings[K]) => void;
