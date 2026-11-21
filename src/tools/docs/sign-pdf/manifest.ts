import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.sign-pdf",
  "space": "docs",
  "category": "edit-sign",
  "slug": "sign-pdf",
  "name": "Sign PDF",
  "tagline": "Add a typed or drawn signature to a PDF.",
  "keywords": [
    "sign pdf",
    "add signature to pdf",
    "e-sign pdf",
    "draw signature on pdf"
  ],
  "synonyms": [
    "esign",
    "signature pdf"
  ],
  "jobs": [
    "sign a pdf form",
    "add my signature to a document"
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
    "title": "Sign PDF Online – Add Your Signature to a PDF",
    "description": "Type or draw your signature and add it to a PDF, then download the signed copy. Free, private, no sign-up. The PDF and your signature never leave this device.",
    "h1": "Sign a PDF"
  },
  "howTo": [
    "Open the PDF to sign.",
    "Type your name or draw your signature.",
    "Download the signed PDF."
  ],
  "faq": [
    {
      "q": "Is this a legally binding e-signature?",
      "a": "It adds a visual signature, which many everyday forms accept. It is not a certificate-based digital signature; check what the receiver requires."
    },
    {
      "q": "Can I draw my signature on a phone?",
      "a": "Yes. Draw with your finger on the signature pad."
    },
    {
      "q": "Are my files uploaded?",
      "a": "No. Your PDF and signature stay in your browser."
    },
    {
      "q": "Is my signature saved?",
      "a": "No. Nothing is stored after you close the page."
    }
  ],
  "related": [
    "docs.watermark-pdf",
    "docs.merge-pdf",
    "docs.rotate-pdf",
    "docs.jpg-to-pdf"
  ],
  "legacySlugs": [],
  "status": "live",
  "offline": true
};

export default manifest;
