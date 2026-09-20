"use client";

import { useState, useCallback } from "react";
import { Key, Copy, Check, Trash2, Clock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

interface JWTPayload {
  [key: string]: unknown;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(str);
  }
}

function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

function getTimeStatus(exp?: number, nbf?: number): { status: "valid" | "expired" | "not-yet-valid" | "no-expiry"; label: string; color: string } {
  const now = Math.floor(Date.now() / 1000);
  if (exp && now > exp) return { status: "expired", label: "Expired", color: "text-red-500" };
  if (nbf && now < nbf) return { status: "not-yet-valid", label: "Not yet valid", color: "text-amber-500" };
  if (exp) return { status: "valid", label: "Valid", color: "text-green-500" };
  return { status: "no-expiry", label: "No expiration", color: "text-muted-foreground" };
}

export function JWTDecoderEngine() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState("");
  const [showSignature, setShowSignature] = useState(false);

  const handleDecode = useCallback(() => {
    setError("");
    setDecoded(null);

    if (!token.trim()) {
      setError("Please enter a JWT token.");
      return;
    }

    const result = decodeJWT(token.trim());
    if (!result) {
      setError("Invalid JWT format. A valid JWT has three parts separated by dots: header.payload.signature");
      return;
    }

    setDecoded(result);
  }, [token]);

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const timeStatus = decoded ? getTimeStatus(decoded.payload.exp, decoded.payload.nbf) : null;

  const registeredClaims = decoded
    ? [
        { key: "iss", label: "Issuer", value: decoded.payload.iss },
        { key: "sub", label: "Subject", value: decoded.payload.sub },
        { key: "aud", label: "Audience", value: Array.isArray(decoded.payload.aud) ? decoded.payload.aud.join(", ") : decoded.payload.aud },
        { key: "exp", label: "Expiration", value: decoded.payload.exp ? formatTimestamp(decoded.payload.exp) : undefined },
        { key: "nbf", label: "Not Before", value: decoded.payload.nbf ? formatTimestamp(decoded.payload.nbf) : undefined },
        { key: "iat", label: "Issued At", value: decoded.payload.iat ? formatTimestamp(decoded.payload.iat) : undefined },
        { key: "jti", label: "JWT ID", value: decoded.payload.jti as string },
      ].filter((c) => c.value !== undefined)
    : [];

  const customClaims = decoded
    ? Object.entries(decoded.payload).filter(
        ([key]) => !["iss", "sub", "aud", "exp", "nbf", "iat", "jti"].includes(key)
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">JWT Token</Label>
        <Textarea
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          className="font-mono text-xs min-h-[100px]"
          value={token}
          onChange={(e) => { setToken(e.target.value); setDecoded(null); setError(""); }}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDecode} className="gap-2 flex-1" disabled={!token.trim()}>
          <Key className="h-4 w-4" /> Decode JWT
        </Button>
        <Button variant="outline" size="icon" onClick={() => { setToken(""); setDecoded(null); setError(""); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </p>
          </CardContent>
        </Card>
      )}

      {decoded && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Status badge */}
          {timeStatus && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                <span className={timeStatus.color}>{timeStatus.label}</span>
              </Badge>
              {decoded.payload.exp && (
                <Badge variant="outline" className="text-[10px]">
                  Expires: {formatTimestamp(decoded.payload.exp)}
                </Badge>
              )}
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm font-medium">Header</Label>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")}>
                {copiedSection === "header" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                Copy
              </Button>
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="space-y-1">
                  {Object.entries(decoded.header).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground font-mono">{key}:</span>
                      <span className="font-mono font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payload - Registered Claims */}
          {registeredClaims.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium">Registered Claims</Label>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), "payload")}>
                  {copiedSection === "payload" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy All
                </Button>
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    {registeredClaims.map((claim) => (
                      <div key={claim.key} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground font-mono shrink-0">{claim.key}:</span>
                        <span className="font-mono truncate">{String(claim.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payload - Custom Claims */}
          {customClaims.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Custom Claims</Label>
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    {customClaims.map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground font-mono shrink-0">{key}:</span>
                        <span className="font-mono truncate">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm font-medium">Signature</Label>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowSignature(!showSignature)}>
                {showSignature ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showSignature ? "Hide" : "Show"}
              </Button>
            </div>
            <Card>
              <CardContent className="p-3">
                <p className="font-mono text-xs break-all text-muted-foreground">
                  {showSignature ? decoded.signature : decoded.signature.slice(0, 20) + "..."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}