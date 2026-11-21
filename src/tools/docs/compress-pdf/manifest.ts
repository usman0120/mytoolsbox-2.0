import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.compress-pdf",
  "space": "docs",
  "category": "organize",
  "slug": "compress-pdf",
  "name": "Compress PDF",
  "tagline": "Make a PDF smaller for email, portals and uploads.",
  "keywords": [
    "compress pdf",
    "reduce pdf size",
    "shrink pdf",
    "pdf compressor"
  ],
  "synonyms": [
    "reduce size",
    "make pdf smaller",
    "optimize pdf"
  ],
  "jobs": [
    "reduce pdf size for email",
    "make a pdf under 1 mb",
    "shrink a scanned pdf"
  ],
  "template": "file",
  "input": [
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "output": [
    {
      "type": "pdf",
      "accept": [
        "application/pdf"
      ]
    }
  ],
  "engine": "client",
  "seo": {
    "title": "Compress PDF Online – Reduce PDF File Size",
    "description": "Reduce PDF file size for email and upload portals. Pick a compression level and see the size saved. Free, private, no sign-up; files stay on your device.",
    "h1": "Compress a PDF"
  },
  "howTo": [
    "Open the PDF you want to make smaller.",
    "Choose a compression level.",
    "Download the smaller PDF and check the size saved."
  ],
  "faq": [
    {
      "q": "How much smaller will my PDF get?",
      "a": "It depends on the content. Scanned and image-heavy PDFs shrink the most; text-only PDFs are often already small."
    },
    {
      "q": "Will compression make text blurry?",
      "a": "Stronger levels re-render pages as images to save space, which can soften small text. Use the recommended level for documents you need to read closely."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Compression runs in your browser, so the PDF never leaves your device."
    },
    {
      "q": "Is the original file changed?",
      "a": "No. You download a new, smaller copy and the original stays as it was."
    }
  ],
  "related": [
    "docs.merge-pdf",
    "docs.split-pdf",
    "docs.pdf-to-jpg",
    "docs.jpg-to-pdf"
  ],
  "legacySlugs": [
    "pdf-compressor"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
