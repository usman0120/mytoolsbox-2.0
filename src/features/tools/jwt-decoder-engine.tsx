"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Key, Copy, Check, Trash2, Clock, AlertTriangle, ShieldCheck,
  ShieldAlert, Eye, EyeOff, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  decodeJWT,
  getTokenStatus,
  formatTimestamp,
  verifyJwtHmacSignature,
  type DecodedJWT,
} from "@/features/tools/jwt-decoder";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk4NzU0NDAwfQ." +
  "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

export function JWTDecoderEngine() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Signature verification state
  const [secret, setSecret] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<{ verified: boolean; message: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDecode = useCallback((jwtString: string) => {
    setError(null);
    setVerifyStatus(null);

    const res = decodeJWT(jwtString);
    if (res.success) {
      setDecoded(res.data);
    } else {
      setDecoded(null);
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    handleDecode(token);
  }, [token, handleDecode]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleVerifySignature = async () => {
    if (!token.trim() || !secret.trim()) return;
    setIsVerifying(true);
    const res = await verifyJwtHmacSignature(token, secret);
    setVerifyStatus(res);
    setIsVerifying(false);
  };

  const expiryStatus = decoded ? getTokenStatus(decoded.payload.exp, decoded.payload.nbf) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Token Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Encoded JWT Token
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                setToken(SAMPLE_JWT);
                toast.info("Sample JWT loaded.");
              }}
            >
              Load Sample
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-destructive"
              onClick={() => {
                setToken("");
                setDecoded(null);
                setError(null);
                setVerifyStatus(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT token (header.payload.signature)..."
          className="font-mono text-xs min-h-[90px] break-all"
        />
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-3 flex items-center gap-2 text-destructive text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {decoded && (
        <div className="space-y-6">
          {/* Expiry Status Card */}
          {expiryStatus && (
            <Card className="border">
              <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant={expiryStatus.status === "valid" ? "default" : expiryStatus.status === "expired" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {expiryStatus.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{expiryStatus.description}</span>
                </div>
                {decoded.payload.exp && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Exp: {formatTimestamp(decoded.payload.exp)}
                  </span>
                )}
              </CardContent>
            </Card>
          )}

          {/* Color-Coded Token Segments */}
          <div className="p-3 rounded-lg border bg-muted/20 font-mono text-xs break-all leading-relaxed">
            <span className="text-rose-500 font-semibold">{decoded.tokenParts[0]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-indigo-500 font-semibold">{decoded.tokenParts[1]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-emerald-500 font-semibold">{decoded.tokenParts[2]}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Box */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-rose-400 text-rose-500 text-[10px]">
                      HEADER
                    </Badge>
                    <span className="text-xs text-muted-foreground">Algorithm & Token Type</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")}
                  >
                    {copiedKey === "header" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </div>
                <pre className="font-mono text-xs bg-muted/40 p-3 rounded-lg overflow-x-auto text-foreground">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Payload Box */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-indigo-400 text-indigo-500 text-[10px]">
                      PAYLOAD
                    </Badge>
                    <span className="text-xs text-muted-foreground">Data & Claims</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), "payload")}
                  >
                    {copiedKey === "payload" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </div>
                <pre className="font-mono text-xs bg-muted/40 p-3 rounded-lg overflow-x-auto text-foreground">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Signature Verification Section */}
          <Card className="border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-500" />
                <Label className="text-xs font-semibold">Verify Signature ({decoded.header.alg})</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="password"
                  placeholder="Enter secret key to verify signature..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="font-mono text-xs h-8 flex-1"
                />
                <Button
                  onClick={handleVerifySignature}
                  disabled={!secret.trim() || isVerifying}
                  size="sm"
                  className="text-xs h-8 gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verify HMAC
                </Button>
              </div>

              {verifyStatus && (
                <div className="pt-1">
                  <Badge
                    variant={verifyStatus.verified ? "default" : "destructive"}
                    className="text-xs gap-1 py-1 px-2.5"
                  >
                    {verifyStatus.verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                    {verifyStatus.message}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}