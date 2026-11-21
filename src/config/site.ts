// Single source of brand and domain (blueprint section 2: rebrand-ready).
export const SITE_URL = "https://www.mytoolsbox.me";

/** External contact form. Leave empty until it is ready; /contact shows a short placeholder. */
export const CONTACT_URL = "";

export const SITE_CONFIG = {
  name: "MyToolsBox",
  tagline: "Get small jobs done. Free, private, no sign-up.",
  description: "Free, private tools for everyday jobs: PDFs, images, calculators, code, study and AI help. Files are processed on your device.",
  domain: "www.mytoolsbox.me",
  url: SITE_URL,
  email: "hello@mytoolsbox.me",
} as const;
