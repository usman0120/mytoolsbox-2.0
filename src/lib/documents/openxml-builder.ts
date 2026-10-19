// ---------------------------------------------------------------------------
// OpenXML Document Builder & Parser
// ---------------------------------------------------------------------------
// Client-side OpenXML generator and parser using JSZip.
// Generates fully valid .docx, .pptx, and .xlsx files that open natively
// in Microsoft Word, PowerPoint, Excel, LibreOffice, and Google Docs.
// ---------------------------------------------------------------------------

import JSZip from "jszip";

// ---------------------------------------------------------------------------
// 1. DOCX Generator (Word Document)
// ---------------------------------------------------------------------------

export interface DocxParagraph {
  text: string;
  isHeading?: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  align?: "left" | "center" | "right";
  fontSize?: number; // half-points, e.g. 24 = 12pt
}

export async function createDocxBlob(
  paragraphs: (string | DocxParagraph)[],
  title: string = "Document"
): Promise<Blob> {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // XML body generation
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  let bodyXml = "";

  for (const item of paragraphs) {
    if (typeof item === "string") {
      const text = escapeXml(item);
      bodyXml += `
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr>
        <w:t xml:space="preserve">${text}</w:t>
      </w:r>
    </w:p>`;
    } else {
      const text = escapeXml(item.text);
      const isH = item.isHeading;
      const sz = item.fontSize ?? (isH ? 32 : 24);
      const bold = isH || item.isBold ? "<w:b/>" : "";
      const italic = item.isItalic ? "<w:i/>" : "";
      const jc = item.align ? `<w:jc w:val="${item.align}"/>` : "";

      bodyXml += `
    <w:p>
      <w:pPr>${jc}</w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          ${bold}
          ${italic}
          <w:sz w:val="${sz}"/>
        </w:rPr>
        <w:t xml:space="preserve">${text}</w:t>
      </w:r>
    </w:p>`;
    }
  }

  // word/document.xml
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

// ---------------------------------------------------------------------------
// 2. DOCX Parser (Extract Text & Headings from Word Document)
// ---------------------------------------------------------------------------

export async function parseDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlFile = zip.file("word/document.xml");

  if (!docXmlFile) {
    throw new Error("Invalid DOCX file: word/document.xml missing.");
  }

  const xmlText = await docXmlFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  const textLines: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const texts = p.getElementsByTagName("w:t");
    let line = "";
    for (let j = 0; j < texts.length; j++) {
      line += texts[j].textContent || "";
    }
    if (line.trim().length > 0) {
      textLines.push(line);
    }
  }

  return textLines.join("\n\n");
}

// ---------------------------------------------------------------------------
// 3. PPTX Generator (PowerPoint Slides)
// ---------------------------------------------------------------------------

export interface PptxSlide {
  title: string;
  bullets: string[];
  slideNumber?: number;
  body?: string[];
}

export type ParsedPptxSlide = PptxSlide;

export function createTextSlides(pages: readonly { pageNumber: number; lines: readonly string[] }[]): PptxSlide[] {
  const slides: PptxSlide[] = [];
  for (const page of pages) {
    const chunks = page.lines.filter((line) => line.trim()).flatMap((line) => {
      const characters = Array.from(line);
      const parts: string[] = [];
      for (let offset = 0; offset < characters.length; offset += 60) {
        parts.push(characters.slice(offset, offset + 60).join(""));
      }
      return parts;
    });
    for (let offset = 0; offset < chunks.length; offset += 6) {
      slides.push({
        title: `Page ${page.pageNumber}${offset ? ` (continued ${offset / 6 + 1})` : ""}`,
        bullets: chunks.slice(offset, offset + 6),
      });
    }
  }
  if (!slides.length) throw new Error("No extractable text found. Scanned PDFs require OCR before conversion.");
  return slides;
}

export async function createPptxBlob(slides: PptxSlide[]): Promise<Blob> {
  const zip = new JSZip();

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // [Content_Types].xml
  let overrideTypes = "";
  for (let i = 1; i <= slides.length; i++) {
    overrideTypes += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
  }

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${overrideTypes}
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // ppt/_rels/presentation.xml.rels
  let presRels = "";
  for (let i = 1; i <= slides.length; i++) {
    presRels += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>\n`;
  }

  zip.file(
    "ppt/_rels/presentation.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`
  );

  // ppt/presentation.xml
  let slideIdList = "";
  for (let i = 1; i <= slides.length; i++) {
    slideIdList += `<p:sldId id="${255 + i}" r:id="rId${i}"/>\n`;
  }

  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    ${slideIdList}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  // Generate slides
  slides.forEach((slide, idx) => {
    const slideNum = idx + 1;
    const titleText = escapeXml(slide.title);

    let bulletsXml = "";
    slide.bullets.forEach((b) => {
      bulletsXml += `
        <a:p>
          <a:pPr lvl="0"/>
          <a:r>
            <a:rPr lang="en-US" sz="1800"/>
            <a:t>${escapeXml(b)}</a:t>
          </a:r>
        </a:p>`;
    });

    zip.file(
      `ppt/slides/slide${slideNum}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>

      <!-- Title Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="title"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="685800" y="457200"/><a:ext cx="7772400" cy="1143000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="3600" b="1"><a:solidFill><a:srgbClr val="003366"/></a:solidFill></a:rPr>
              <a:t>${titleText}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Content / Bullets Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="body" idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="685800" y="1600200"/><a:ext cx="7772400" cy="3000000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${bulletsXml || `<a:p><a:r><a:t></a:t></a:r></a:p>`}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
    );
  });

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}

// ---------------------------------------------------------------------------
// 4. PPTX Parser (Extract Slides from PowerPoint)
// ---------------------------------------------------------------------------

export async function parsePptxSlides(file: File): Promise<PptxSlide[]> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slides: PptxSlide[] = [];

  const parser = new DOMParser();
  const parseXml = (text: string) => {
    const document = parser.parseFromString(text, "application/xml");
    if (document.getElementsByTagName("parsererror").length) {
      throw new Error("Invalid PPTX file: malformed XML.");
    }
    return document;
  };
  const presentationFile = zip.file("ppt/presentation.xml");
  const relationshipsFile = zip.file("ppt/_rels/presentation.xml.rels");
  if (!presentationFile || !relationshipsFile) {
    throw new Error("Invalid PPTX file: presentation or relationships missing.");
  }
  const presentation = parseXml(await presentationFile.async("text"));
  const relationships = parseXml(await relationshipsFile.async("text"));
  const slideList = presentation.getElementsByTagNameNS("*", "sldIdLst")[0];
  const slideIds = slideList ? Array.from(slideList.getElementsByTagNameNS("*", "sldId")) : [];
  const relationshipsById = new Map(
    Array.from(relationships.getElementsByTagNameNS("*", "Relationship"))
      .map((relationship) => [relationship.getAttribute("Id"), relationship] as const)
  );
  const slideFiles = slideIds.map((slideId) => {
    const relationshipId = slideId.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")
      ?? slideId.getAttributeNS("http://purl.oclc.org/ooxml/officeDocument/relationships", "id");
    const relationship = relationshipsById.get(relationshipId);
    const target = relationship?.getAttribute("Target");
    if (!target || relationship?.getAttribute("TargetMode") === "External"
      || !relationship?.getAttribute("Type")?.endsWith("/slide")) {
      throw new Error("Invalid PPTX file: slide relationship missing or invalid.");
    }
    const base = new URL("https://openxml.invalid/ppt/presentation.xml");
    const resolved = new URL(target, base);
    if (resolved.origin !== base.origin || resolved.search || resolved.hash) {
      throw new Error("Invalid PPTX file: slide target must be an internal part.");
    }
    const partName = decodeURIComponent(resolved.pathname.slice(1));
    const part = zip.file(partName);
    if (!part) throw new Error(`Invalid PPTX file: slide part ${partName} missing.`);
    return part;
  });

  for (let i = 0; i < slideFiles.length; i++) {
    const xmlContent = await slideFiles[i].async("text");
    const xmlDoc = parseXml(xmlContent);
    const paragraphs = xmlDoc.getElementsByTagNameNS("*", "p");

    const lines: string[] = [];
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const texts = paragraphs[pIdx].getElementsByTagNameNS("*", "t");
      let line = "";
      for (let tIdx = 0; tIdx < texts.length; tIdx++) {
        line += texts[tIdx].textContent || "";
      }
      if (line.trim().length > 0) {
        lines.push(line);
      }
    }

    const title = lines[0] || `Slide ${i + 1}`;
    const bullets = lines.slice(1);
    slides.push({ title, bullets, slideNumber: i + 1, body: bullets });
  }

  return slides;
}

// ---------------------------------------------------------------------------
// 5. XLSX Generator (Excel Workbook)
// ---------------------------------------------------------------------------

export async function createXlsxBlob(
  rows: (string | number)[][],
  sheetName: string = "Sheet1"
): Promise<Blob> {
  const zip = new JSZip();

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  // xl/_rels/workbook.xml.rels
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`
  );

  // xl/workbook.xml
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  // Shared strings collection
  const sharedStrings: string[] = [];
  const stringIndexMap = new Map<string, number>();

  const getSharedStringIndex = (val: string): number => {
    if (stringIndexMap.has(val)) return stringIndexMap.get(val)!;
    const idx = sharedStrings.length;
    sharedStrings.push(val);
    stringIndexMap.set(val, idx);
    return idx;
  };

  // Convert column index (0-based) to Excel column name (A, B, ..., Z, AA, AB)
  const getColName = (c: number): string => {
    let name = "";
    c += 1;
    while (c > 0) {
      const rem = (c - 1) % 26;
      name = String.fromCharCode(65 + rem) + name;
      c = Math.floor((c - 1) / 26);
    }
    return name;
  };

  // Build sheet data
  let sheetDataXml = "";
  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const rowNum = rIdx + 1;
    const row = rows[rIdx];
    let rowCellsXml = "";

    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const cellRef = `${getColName(cIdx)}${rowNum}`;
      const val = row[cIdx];

      if (typeof val === "number" && !isNaN(val)) {
        rowCellsXml += `<c r="${cellRef}"><v>${val}</v></c>`;
      } else {
        const strVal = String(val ?? "");
        const sIndex = getSharedStringIndex(strVal);
        rowCellsXml += `<c r="${cellRef}" t="s"><v>${sIndex}</v></c>`;
      }
    }

    sheetDataXml += `<row r="${rowNum}">${rowCellsXml}</row>`;
  }

  // xl/worksheets/sheet1.xml
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`
  );

  // xl/sharedStrings.xml
  let sharedStringsXml = "";
  for (const s of sharedStrings) {
    sharedStringsXml += `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`;
  }

  zip.file(
    "xl/sharedStrings.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
  ${sharedStringsXml}
</sst>`
  );

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
