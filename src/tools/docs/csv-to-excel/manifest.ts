import type { ToolManifest } from "@/tools/types";

const manifest: ToolManifest = {
  "id": "docs.csv-to-excel",
  "space": "docs",
  "category": "convert",
  "slug": "csv-to-excel",
  "name": "CSV to Excel",
  "tagline": "Convert CSV data into a proper Excel sheet.",
  "keywords": [
    "csv to excel",
    "csv to xlsx",
    "convert csv to excel",
    "open csv in excel"
  ],
  "synonyms": [
    "csv to xlsx",
    "csv to spreadsheet"
  ],
  "jobs": [
    "convert csv to excel",
    "fix csv opening in one column"
  ],
  "template": "file",
  "input": [
    {
      "type": "csv",
      "accept": [
        ".csv",
        "text/csv"
      ]
    }
  ],
  "output": [
    {
      "type": "xlsx"
    }
  ],
  "engine": "client",
  "seo": {
    "title": "CSV to Excel Online – Convert CSV to XLSX",
    "description": "Convert CSV files to Excel (XLSX) with detected delimiters, columns and number types, ready to sort and filter. Free, private, no sign-up; data stays local.",
    "h1": "Convert CSV to Excel"
  },
  "howTo": [
    "Open a CSV file or paste CSV text.",
    "Check the detected delimiter and columns.",
    "Download the XLSX file."
  ],
  "faq": [
    {
      "q": "Which delimiters are supported?",
      "a": "Commas, semicolons, tabs and pipes are detected automatically, and you can override the choice."
    },
    {
      "q": "Are numbers kept as numbers?",
      "a": "Yes. Numeric columns are written as numbers, so Excel can sum and sort them."
    },
    {
      "q": "Is my data uploaded?",
      "a": "No. The file is converted in your browser."
    },
    {
      "q": "Will leading zeros be kept?",
      "a": "Values such as ZIP codes that start with zero are kept as text so the zeros are not lost."
    }
  ],
  "related": [
    "docs.text-to-word",
    "docs.pdf-to-word",
    "docs.text-to-pdf",
    "docs.merge-pdf"
  ],
  "legacySlugs": [
    "csv-to-excel"
  ],
  "status": "live",
  "offline": true
};

export default manifest;
