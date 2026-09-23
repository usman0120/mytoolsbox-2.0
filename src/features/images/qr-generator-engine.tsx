"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  Wifi,
  User,
  Mail,
  FileText,
  Upload,
  Sparkles,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { generateQR, QROptions } from "@/features/images/qr-generator";

type QRType = "url" | "text" | "wifi" | "vcard" | "email";

export function QRGeneratorEngine() {
  const [qrType, setQrType] = useState<QRType>("url");

  // Form Fields
  const [url, setUrl] = useState("https://mytoolbox.me");
  const [plainText, setPlainText] = useState("");
  // Wi-Fi fields
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA");
  // vCard fields
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");
  // Email fields
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Styling & Options
  const [color, setColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [size, setSize] = useState(380);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(22); // 15 to 28%
  const [format, setFormat] = useState<"png" | "svg" | "webp">("png");

  // Output
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawSvg, setRawSvg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute payload string
  const computePayload = useCallback((): string => {
    switch (qrType) {
      case "url":
        return url.trim() || "https://mytoolbox.me";
      case "text":
        return plainText.trim() || "MyToolbox QR";
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      default:
        return "https://mytoolbox.me";
    }
  }, [
    qrType,
    url,
    plainText,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    emailTo,
    emailSubject,
    emailBody,
  ]);

  // Handle Logo file loading
  const handleLoadLogo = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  // Re-generate QR code whenever parameters change
  const refreshQR = useCallback(async () => {
    const payload = computePayload();
    const opts: QROptions = {
      text: payload,
      size,
      color,
      bgColor: isTransparent ? "transparent" : bgColor,
      errorCorrectionLevel: logoDataUrl ? "H" : ecLevel,
      logoDataUrl: logoDataUrl || undefined,
      logoScale: logoScale / 100,
      format,
    };

    const res = await generateQR(opts);
    if (res.status === "success" && res.outputUrl) {
      setPreviewUrl(res.outputUrl);
      if (res.data && typeof res.data === "object" && "rawSvg" in res.data) {
        setRawSvg((res.data as { rawSvg: string }).rawSvg);
      } else {
        setRawSvg(null);
      }
    }
  }, [
    computePayload,
    size,
    color,
    bgColor,
    isTransparent,
    ecLevel,
    logoDataUrl,
    logoScale,
    format,
  ]);

  useEffect(() => {
    refreshQR();
  }, [refreshQR]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `qrcode_${qrType}.${format}`;
    a.click();
  };

  const handleCopy = async () => {
    if (!previewUrl) return;
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      if (blob.type === "image/png") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        await navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn("Copy to clipboard failed:", err);
    }
  };

  const typeTabs: { id: QRType; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "Website", icon: <Globe className="h-3.5 w-3.5" /> },
    { id: "text", label: "Text", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "wifi", label: "Wi-Fi", icon: <Wifi className="h-3.5 w-3.5" /> },
    { id: "vcard", label: "Contact", icon: <User className="h-3.5 w-3.5" /> },
    { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Controls */}
      <div className="lg:col-span-6 space-y-4">
        {/* Type Tabs */}
        <div className="p-1 bg-muted rounded-2xl flex flex-wrap gap-1">
          {typeTabs.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={qrType === t.id ? "default" : "ghost"}
              className="flex-1 rounded-xl text-xs gap-1.5 h-8 min-w-[70px]"
              onClick={() => setQrType(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </Button>
          ))}
        </div>

        {/* Dynamic Input Forms */}
        <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-4">
          {qrType === "url" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Destination URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="rounded-xl text-xs"
              />
              <p className="text-[11px] text-muted-foreground">Scans directly to open in browser</p>
            </div>
          )}

          {qrType === "text" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Plain Text Content</Label>
              <Textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder="Enter any text, code snippet, or notes..."
                className="rounded-xl text-xs resize-none min-h-[90px]"
              />
            </div>
          )}

          {qrType === "wifi" && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Network SSID (Name)</Label>
                <Input
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyOffice_WiFi"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Wi-Fi Password</Label>
                <Input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="SecretPass123"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Encryption:</Label>
                {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                  <Button
                    key={enc}
                    size="sm"
                    variant={wifiAuth === enc ? "default" : "outline"}
                    className="h-6 text-[11px] rounded-lg px-2"
                    onClick={() => setWifiAuth(enc)}
                  >
                    {enc === "nopass" ? "Open" : enc}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {qrType === "vcard" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-medium">Full Name</Label>
                <Input
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="Jane Doe"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="+1 555-0192"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Company / Organization</Label>
                <Input
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  placeholder="Tech Innovations Inc."
                  className="rounded-xl text-xs mt-1"
                />
              </div>
            </div>
          )}

          {qrType === "email" && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Recipient Email</Label>
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@support.com"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Subject Line</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Inquiry about services"
                  className="rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Default Body</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Hi there, I'd like to get in touch..."
                  className="rounded-xl text-xs resize-none min-h-[60px] mt-1"
                />
              </div>
            </div>
          )}

          {/* Design & Colors */}
          <div className="space-y-3 pt-3 border-t">
            <h5 className="font-semibold text-xs flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Appearance & Styling
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Pattern Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background"
                  />
                  <span className="text-xs text-muted-foreground uppercase">{color}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={bgColor}
                    disabled={isTransparent}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-10 rounded-lg cursor-pointer border p-0.5 bg-background disabled:opacity-40"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      id="trans-toggle"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="trans-toggle" className="cursor-pointer">
                      Transparent
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo in Center */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Center Logo / Icon
                </Label>
                {logoDataUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] text-muted-foreground"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoDataUrl(null);
                    }}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>

              <div
                className="border-2 border-dashed rounded-xl p-2.5 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoDataUrl ? (
                  <div className="flex items-center justify-center gap-2">
                    <img src={logoDataUrl} alt="Logo" className="h-7 w-7 object-contain rounded" />
                    <span className="text-xs text-muted-foreground">Change center logo</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Upload PNG/SVG brand icon to place in center</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleLoadLogo(e.target.files[0])}
                />
              </div>

              {logoDataUrl && (
                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-[11px] text-muted-foreground">Logo Size</Label>
                    <span className="text-[11px] text-muted-foreground">{logoScale}%</span>
                  </div>
                  <Slider
                    value={[logoScale]}
                    min={15}
                    max={28}
                    step={1}
                    onValueChange={(val) => setLogoScale(Array.isArray(val) ? val[0] : (val as number))}
                  />
                </div>
              )}
            </div>

            {/* Error correction & Size */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Resolution Size</Label>
                <span className="text-xs text-muted-foreground">{size} × {size} px</span>
              </div>
              <Slider
                value={[size]}
                min={200}
                max={800}
                step={20}
                onValueChange={(val) => setSize(Array.isArray(val) ? val[0] : (val as number))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Real-Time Output & Actions */}
      <div className="lg:col-span-6 flex flex-col space-y-4">
        <div className="p-6 rounded-2xl border bg-card flex flex-col items-center justify-center min-h-[440px] shadow-xs space-y-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-center shadow-md transition-all ${
              isTransparent
                ? "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwMDg4GBAdNgYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgAABqYgYCiQx1FQAAAABJRU5ErkJggg==')]"
                : ""
            }`}
            style={{ backgroundColor: isTransparent ? "transparent" : bgColor }}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Generated QR Code"
                className="max-h-[300px] w-auto object-contain rounded-lg"
              />
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-sm">Ready to Scan</p>
            <p className="text-xs text-muted-foreground max-w-xs truncate">
              {computePayload()}
            </p>
          </div>

          {/* Export bar */}
          <div className="w-full max-w-sm space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Export Format</Label>
              <div className="flex gap-1">
                {(["png", "svg", "webp"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant={format === fmt ? "default" : "outline"}
                    className="h-7 text-xs px-2.5 rounded-lg uppercase"
                    onClick={() => setFormat(fmt)}
                  >
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1 rounded-xl gap-2 font-medium">
                <Download className="h-4 w-4" /> Download QR Code
              </Button>
              <Button variant="outline" onClick={handleCopy} className="rounded-xl gap-1.5">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}