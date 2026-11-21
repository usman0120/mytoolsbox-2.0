// dev Space manifests (metadata only).
import JsonFormatter from "./json-formatter/manifest";
import JsonValidator from "./json-validator/manifest";
import RegexTester from "./regex-tester/manifest";
import SqlFormatter from "./sql-formatter/manifest";
import HtmlFormatter from "./html-formatter/manifest";
import CssFormatter from "./css-formatter/manifest";
import DiffChecker from "./diff-checker/manifest";
import Base64Encoder from "./base64-encoder/manifest";
import UrlEncoder from "./url-encoder/manifest";
import HashGenerator from "./hash-generator/manifest";
import JwtDecoder from "./jwt-decoder/manifest";
import TimestampConverter from "./timestamp-converter/manifest";
import UuidGenerator from "./uuid-generator/manifest";
import PasswordGenerator from "./password-generator/manifest";
import CronBuilder from "./cron-builder/manifest";
import LoremIpsum from "./lorem-ipsum/manifest";
import RandomGenerator from "./random-generator/manifest";
import AiRegexBuilder from "./ai-regex-builder/manifest";
import AiSqlAssistant from "./ai-sql-assistant/manifest";
import ColorContrastChecker from "./color-contrast-checker/manifest";
import ColorConverter from "./color-converter/manifest";
import HttpStatusCodes from "./http-status-codes/manifest";
import MimeTypes from "./mime-types/manifest";
import UserAgentParser from "./user-agent-parser/manifest";
import ApiRequestTester from "./api-request-tester/manifest";
import MarkdownEditor from "./markdown-editor/manifest";
import CodeDocGenerator from "./code-doc-generator/manifest";
import ErrorExplainer from "./error-explainer/manifest";
import ApiDocGenerator from "./api-doc-generator/manifest";

export const DEV_TOOLS = [
  JsonFormatter,
  JsonValidator,
  RegexTester,
  SqlFormatter,
  HtmlFormatter,
  CssFormatter,
  DiffChecker,
  Base64Encoder,
  UrlEncoder,
  HashGenerator,
  JwtDecoder,
  TimestampConverter,
  UuidGenerator,
  PasswordGenerator,
  CronBuilder,
  LoremIpsum,
  RandomGenerator,
  AiRegexBuilder,
  AiSqlAssistant,
  ColorContrastChecker,
  ColorConverter,
  HttpStatusCodes,
  MimeTypes,
  UserAgentParser,
  ApiRequestTester,
  MarkdownEditor,
  CodeDocGenerator,
  ErrorExplainer,
  ApiDocGenerator,
];
