// Pure logic engine for JWT Decoder and Token Verification

export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  tokenParts: [string, string, string];
}

export interface TokenStatus {
  status: "valid" | "expired" | "not-yet-valid" | "no-expiry";
  label: string;
  description: string;
  remainingSeconds: number | null;
}

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeJWT(token: string): { success: true; data: DecodedJWT } | { success: false; error: string } {
  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "Please enter a JWT token." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      success: false,
      error: `Invalid JWT format. A valid JWT must have 3 dot-separated segments (found ${parts.length}).`,
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    return {
      success: true,
      data: {
        header,
        payload,
        signature: parts[2],
        rawHeader: headerJson,
        rawPayload: payloadJson,
        tokenParts: [parts[0], parts[1], parts[2]],
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: `Failed to decode JWT segments: ${err instanceof Error ? err.message : "Malformed Base64Url or JSON"}.`,
    };
  }
}

export function formatTimestamp(tsInSeconds: number): string {
  const date = new Date(tsInSeconds * 1000);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function getTokenStatus(exp?: number, nbf?: number, nowSeconds = Math.floor(Date.now() / 1000)): TokenStatus {
  if (nbf && nowSeconds < nbf) {
    const diff = nbf - nowSeconds;
    return {
      status: "not-yet-valid",
      label: "Not Yet Valid",
      description: `Token cannot be used until ${formatTimestamp(nbf)} (in ${formatDuration(diff)})`,
      remainingSeconds: diff,
    };
  }

  if (exp) {
    const diff = exp - nowSeconds;
    if (diff <= 0) {
      return {
        status: "expired",
        label: "Expired",
        description: `Expired on ${formatTimestamp(exp)} (${formatDuration(Math.abs(diff))} ago)`,
        remainingSeconds: diff,
      };
    }
    return {
      status: "valid",
      label: "Active & Valid",
      description: `Expires on ${formatTimestamp(exp)} (${formatDuration(diff)} remaining)`,
      remainingSeconds: diff,
    };
  }

  return {
    status: "no-expiry",
    label: "No Expiration",
    description: "Token does not have an 'exp' claim and will remain valid indefinitely unless revoked.",
    remainingSeconds: null,
  };
}

export function formatDuration(seconds: number): string {
  const s = Math.abs(seconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remSec}s`;
  return `${remSec}s`;
}

export async function verifyJwtHmacSignature(
  token: string,
  secret: string
): Promise<{ verified: boolean; message: string }> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { verified: false, message: "Invalid JWT token structure." };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const alg = header.alg;

    const hashName =
      alg === "HS256" ? "SHA-256" :
      alg === "HS384" ? "SHA-384" :
      alg === "HS512" ? "SHA-512" : null;

    if (!hashName) {
      return {
        verified: false,
        message: `Unsupported verification algorithm: ${alg}. Only HS256, HS384, and HS512 HMAC signatures can be verified client-side with a shared secret.`,
      };
    }

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: hashName } },
      false,
      ["sign"]
    );

    const messageData = enc.encode(`${parts[0]}.${parts[1]}`);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = base64UrlEncode(signatureBuffer);

    if (expectedSignature === parts[2]) {
      return { verified: true, message: `Signature verified! Calculated ${alg} HMAC matches token.` };
    } else {
      return { verified: false, message: "Signature verification failed. The provided secret key does not match." };
    }
  } catch (err: unknown) {
    return { verified: false, message: `Error verifying signature: ${err instanceof Error ? err.message : String(err)}` };
  }
}