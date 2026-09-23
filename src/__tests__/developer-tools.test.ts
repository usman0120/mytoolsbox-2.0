import { describe, it, expect } from "vitest";
import { formatJSON, repairJSON, queryJSON } from "@/features/tools/json-formatter";
import { encodeBase64, decodeBase64 } from "@/features/tools/base64-encoder";
import { encodeURL, decodeURL, parseURL, rebuildURL } from "@/features/tools/url-encoder";
import { testRegexAdvanced, generateRegexCode } from "@/features/tools/regex-tester";
import { formatSQLOffline } from "@/features/tools/sql-formatter";
import { generateSingleID, formatSingleID, inspectUUID, generateUUIDv7 } from "@/features/tools/uuid-generator";
import { parseTimestampOrDate, convertTimestamp } from "@/features/tools/timestamp-converter";
import { validateCron } from "@/features/tools/cron-helper";
import { formatHTML, minifyHTML } from "@/features/tools/html-formatter";
import { formatCSS, minifyCSS } from "@/features/tools/css-formatter";
import { convertColor } from "@/features/tools/color-converter";
import { lookupStatus, searchStatuses, HttpStatusDetail } from "@/features/tools/http-status";
import { lookupMimeType, searchMimeTypes } from "@/features/tools/mime-types";
import { parseUserAgent } from "@/features/tools/user-agent-parser";
import { generateCurl, parseCurl } from "@/features/tools/api-request";
import { computeHmacSha256 } from "@/features/tools/webhook-tester";

describe("Developer & Utility Tools Test Suite", () => {
  // 1. JSON Formatter & Validator
  describe("JSON Tools", () => {
    it("formats valid JSON with custom indentation", () => {
      const res = formatJSON('{"a":1,"b":[2,3]}', { indent: 2 });
      expect(res.success).toBe(true);
      expect(res.output).toContain('  "a": 1');
      expect(res.stats?.keyCount).toBe(2);
    });

    it("auto-repairs malformed JSON with single quotes and trailing commas", () => {
      const broken = "{ 'title': 'Test', 'items': [1, 2,], }";
      const res = repairJSON(broken);
      expect(res.success).toBe(true);
      const parsed = JSON.parse(res.output);
      expect(parsed.title).toBe("Test");
      expect(parsed.items).toEqual([1, 2]);
    });

    it("evaluates JSONPath query expressions", () => {
      const json = JSON.stringify({ store: { book: [{ title: "A" }, { title: "B" }] } });
      const res = queryJSON(json, "$.store.book[0].title");
      expect(res.success).toBe(true);
      expect(res.output).toBe("A");
    });
  });

  // 2. Base64 Encoder / Decoder
  describe("Base64 Encoder", () => {
    it("encodes and decodes standard UTF-8 string with emojis", () => {
      const text = "Hello World! 🚀 Привет мир";
      const enc = encodeBase64(text);
      expect(enc.status).toBe("success");
      expect(enc.data?.output).toBeDefined();

      const dec = decodeBase64(enc.data!.output);
      expect(dec.status).toBe("success");
      expect(dec.data?.output).toBe(text);
    });

    it("supports URL-safe Base64 without + or /", () => {
      const text = "Hello??++//world==";
      const enc = encodeBase64(text, { urlSafe: true, stripPadding: true });
      expect(enc.status).toBe("success");
      expect(enc.data?.output).not.toContain("+");
      expect(enc.data?.output).not.toContain("/");
      expect(enc.data?.output).not.toContain("=");

      const dec = decodeBase64(enc.data!.output, { urlSafe: true });
      expect(dec.status).toBe("success");
      expect(dec.data?.output).toBe(text);
    });
  });

  // 3. URL Encoder / Decoder
  describe("URL Encoder", () => {
    it("encodes with RFC 3986 encoding", () => {
      const raw = "hello (world)!";
      const enc = encodeURL(raw, "rfc3986");
      expect(enc.status).toBe("success");
      expect(enc.data?.output).toContain("%28");
      expect(enc.data?.output).toContain("%29");
      expect(enc.data?.output).toContain("%21");
    });

    it("parses and rebuilds URL with query parameters", () => {
      const url = "https://example.com/search?q=test&page=2#top";
      const parsed = parseURL(url);
      expect(parsed).not.toBeNull();
      expect(parsed?.host).toBe("example.com");
      expect(parsed?.queryParams.length).toBe(2);

      const rebuilt = rebuildURL(parsed!);
      expect(rebuilt).toContain("q=test");
      expect(rebuilt).toContain("page=2");
    });
  });

  // 4. Regex Tester
  describe("Regex Tester", () => {
    it("matches patterns with capture groups and offsets", () => {
      const pattern = "(\\w+)@([a-z.]+)";
      const text = "Contact dev@example.com or admin@site.org";
      const res = testRegexAdvanced(pattern, text, "g");
      expect(res.status).toBe("success");
      expect(res.data?.matchCount).toBe(2);
      expect(res.data?.matches[0].groups[0].value).toBe("dev");
      expect(res.data?.matches[0].groups[1].value).toBe("example.com");
    });

    it("generates programming language snippets", () => {
      const code = generateRegexCode("\\d+", "g", "python");
      expect(code).toContain("import re");
      expect(code).toContain('re.findall(pattern, text)');
    });
  });

  // 5. SQL Formatter
  describe("SQL Formatter", () => {
    it("formats SQL with clause newlines", () => {
      const raw = "select id, name from users where active = 1 order by id desc limit 10";
      const res = formatSQLOffline(raw, { dialect: "postgresql", uppercase: true });
      expect(res.status).toBe("success");
      expect(res.data?.formatted).toContain("SELECT");
      expect(res.data?.formatted).toContain("FROM");
      expect(res.data?.formatted).toContain("WHERE");
    });

    it("minifies SQL by stripping whitespace and comments", () => {
      const raw = "SELECT /* comment */ id,   name -- line comment\nFROM   users;";
      const res = formatSQLOffline(raw, { minify: true });
      expect(res.status).toBe("success");
      expect(res.data?.formatted).toBe("SELECT id, name FROM users;");
    });
  });

  // 6. UUID Generator
  describe("UUID Generator", () => {
    it("generates valid UUID v4 and v7", () => {
      const v4 = generateSingleID("v4");
      const inspectV4 = inspectUUID(v4);
      expect(inspectV4.valid).toBe(true);
      expect(inspectV4.version).toBe(4);

      const v7 = generateUUIDv7();
      const inspectV7 = inspectUUID(v7);
      expect(inspectV7.valid).toBe(true);
      expect(inspectV7.version).toBe(7);
      expect(inspectV7.timestamp).toBeDefined();
    });

    it("formats UUID with uppercase and no hyphens", () => {
      const raw = "c73bcdcc-6660-4e0f-9b63-293e705b60cb";
      const formatted = formatSingleID(raw, { uppercase: true, noHyphens: true });
      expect(formatted).toBe("C73BCDCC66604E0F9B63293E705B60CB");
    });
  });

  // 7. Timestamp Converter
  describe("Timestamp Converter", () => {
    it("auto-detects seconds vs milliseconds and computes ISO date", () => {
      const sec = parseTimestampOrDate("1700000000");
      expect(sec.success).toBe(true);
      expect(sec.data?.detectedUnit).toBe("seconds");
      expect(sec.data?.iso8601).toBe("2023-11-14T22:13:20.000Z");

      const ms = parseTimestampOrDate("1700000000000");
      expect(ms.success).toBe(true);
      expect(ms.data?.detectedUnit).toBe("milliseconds");
      expect(ms.data?.iso8601).toBe("2023-11-14T22:13:20.000Z");
    });
  });

  // 8. Cron Expression Helper
  describe("Cron Expression Helper", () => {
    it("validates 5-field cron expression and provides human translation", () => {
      const res = validateCron("0 9 * * 1-5");
      expect(res.status).toBe("success");
      expect(res.data?.description).toContain("at 9:00 AM (Monday through Friday)");
      expect(res.data?.nextRuns.length).toBeGreaterThan(0);
    });

    it("rejects invalid cron expressions", () => {
      const res = validateCron("99 * * * *");
      expect(res.status).toBe("error");
      expect(res.error).toContain("Invalid Minute field");
    });
  });

  // 9. HTML & CSS Formatters
  describe("HTML & CSS Formatters", () => {
    it("formats and minifies HTML", () => {
      const raw = "<div><p>Hello   World</p></div>";
      const formatted = formatHTML(raw);
      expect(formatted.status).toBe("success");
      expect(formatted.data?.output).toContain("  <p>");

      const minified = minifyHTML(formatted.data!.output);
      expect(minified.status).toBe("success");
      expect(minified.data?.output).toBe("<div><p>Hello World</p></div>");
    });

    it("formats and minifies CSS", () => {
      const raw = ".btn{color:red;padding:10px;}";
      const formatted = formatCSS(raw);
      expect(formatted.status).toBe("success");
      expect(formatted.data?.output).toContain("  color: red;");

      const minified = minifyCSS(formatted.data!.output);
      expect(minified.status).toBe("success");
      expect(minified.data?.output).toBe(".btn{color:red;padding:10px}");
    });
  });

  // 10. Color Converter
  describe("Color Converter", () => {
    it("converts hex to RGB, HSL, HSV, CMYK, and generates code snippets", () => {
      const res = convertColor("#3b82f6");
      expect(res.status).toBe("success");
      expect(res.data?.rgb).toBe("rgb(59, 130, 246)");
      expect(res.data?.codeSnippets.flutter).toBe("Color(0xFF3B82F6)");
      expect(res.data?.harmonies.complementary).toBeDefined();
    });
  });

  // 11. HTTP Status & MIME Types
  describe("HTTP Status & MIME Types Catalog", () => {
    it("looks up HTTP status code details and code snippets", () => {
      const res = lookupStatus(404);
      expect(res.status).toBe("success");
      const data = res.data as HttpStatusDetail;
      expect(data.name).toBe("Not Found");
      expect(data.snippets?.nextjs).toContain("NextResponse.json");
    });

    it("looks up MIME types by extension", () => {
      const res = lookupMimeType("webp");
      expect(res.status).toBe("success");
      expect(res.data?.mimeType).toBe("image/webp");
      expect(res.data?.category).toBe("Image");
    });
  });

  // 12. User Agent Parser
  describe("User Agent Parser", () => {
    it("parses modern browser and identifies web bots", () => {
      const botUA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
      const botRes = parseUserAgent(botUA);
      expect(botRes.status).toBe("success");
      expect(botRes.data?.device.type).toBe("Bot");
      expect(botRes.data?.bot?.isBot).toBe(true);
      expect(botRes.data?.bot?.name).toBe("Googlebot");

      const chromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
      const chromeRes = parseUserAgent(chromeUA);
      expect(chromeRes.status).toBe("success");
      expect(chromeRes.data?.browser.name).toBe("Google Chrome");
      expect(chromeRes.data?.os.name).toBe("Windows");
    });
  });

  // 13. API Request & Webhook Tester
  describe("API Request & Webhook Tools", () => {
    it("generates and parses cURL command", () => {
      const config = {
        method: "POST",
        url: "https://api.example.com/v1/users",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer token123" },
        body: JSON.stringify({ name: "Alice" }),
      };
      const curl = generateCurl(config);
      expect(curl).toContain("curl -X POST");
      expect(curl).toContain("-H \"Authorization: Bearer token123\"");

      const parsed = parseCurl(curl);
      expect(parsed?.method).toBe("POST");
      expect(parsed?.url).toBe("https://api.example.com/v1/users");
      expect(parsed?.headers["Authorization"]).toBe("Bearer token123");
    });

    it("computes HMAC-SHA256 signature for webhooks", async () => {
      const secret = "test_secret_key";
      const payload = JSON.stringify({ event: "ping" });
      const signature = await computeHmacSha256(secret, payload);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA-256 is 64 hex chars
    });
  });
});
