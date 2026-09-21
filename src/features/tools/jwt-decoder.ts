// ---------------------------------------------------------------------------
// JWT Decoder — Pure logic functions for JWT decoding
// ---------------------------------------------------------------------------

export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export interface JWTPayload {
  [key: string]: unknown;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
}

export interface DecodedJWT {
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

export function decodeJWT(token: string): DecodedJWT | null {
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