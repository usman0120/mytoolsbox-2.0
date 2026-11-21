// create Space manifests (metadata only).
import Design from "./design/manifest";
import ColorPaletteGenerator from "./color-palette-generator/manifest";
import PresentationMaker from "./presentation-maker/manifest";
import CertificateMaker from "./certificate-maker/manifest";
import Diagram from "./diagram/manifest";
import QrCodeGenerator from "./qr-code-generator/manifest";
import BarcodeGenerator from "./barcode-generator/manifest";
import BarcodeScanner from "./barcode-scanner/manifest";

export const CREATE_TOOLS = [
  Design,
  ColorPaletteGenerator,
  PresentationMaker,
  CertificateMaker,
  Diagram,
  QrCodeGenerator,
  BarcodeGenerator,
  BarcodeScanner,
];
