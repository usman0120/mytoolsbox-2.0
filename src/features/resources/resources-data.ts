// Comprehensive Data & Business Logic for Platform Resources
// Guides, Downloadable Templates, Developer Cheat Sheets, and FAQs

export interface ResourceGuide {
  slug: string;
  title: string;
  category: "getting-started" | "multimedia" | "developer" | "productivity" | "security" | "writing";
  description: string;
  readTime: string;
  iconName: string;
  gradient: string;
  iconColor: string;
  takeaways: string[];
  recommendedTools: { name: string; slug: string; description: string }[];
  sections: { title: string; content: string; codeSnippet?: string }[];
}

export interface ResourceTemplate {
  id: string;
  title: string;
  category: "business" | "productivity" | "developer" | "finance";
  format: "DOCX" | "MD" | "CSV" | "JSON" | "TXT";
  filename: string;
  description: string;
  iconName: string;
  gradient: string;
  iconColor: string;
  content: string;
  toolIntegration?: { toolSlug: string; toolName: string };
}

export interface CheatSheetItem {
  id: string;
  category: "regex" | "http" | "markdown" | "mime" | "git";
  title: string;
  syntax: string;
  explanation: string;
  example?: string;
  badge?: string;
}

export interface ResourceFaq {
  id: string;
  category: "privacy" | "offline" | "usage" | "technical";
  question: string;
  answer: string;
  iconName: string;
  relatedToolSlug?: string;
}

// ---------------------------------------------------------------------------
// 1. In-Depth Guides Catalog
// ---------------------------------------------------------------------------
export const RESOURCE_GUIDES: ResourceGuide[] = [
  {
    slug: "getting-started",
    title: "Getting Started with MyToolsBox",
    category: "getting-started",
    description: "Learn how to use the platform effectively for your daily tasks. Covers navigation, favorites, history, and keyboard shortcuts.",
    readTime: "4 min read",
    iconName: "Zap",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    takeaways: [
      "All tools operate 100% in-browser with zero server file uploads",
      "Install as a Progressive Web App (PWA) for complete offline usage",
      "Use Ctrl+K / Cmd+K anytime to quickly jump between 120+ utilities",
      "Star your frequent tools to pin them to your personal dashboard"
    ],
    recommendedTools: [
      { name: "Online Notepad", slug: "online-notepad", description: "Quick text editor with auto-save" },
      { name: "Todo List", slug: "todo-list", description: "Manage daily tasks and checklists" },
      { name: "Unit Converter", slug: "unit-converter", description: "Convert length, mass, and temperature" }
    ],
    sections: [
      {
        title: "1. The Client-Side Advantage",
        content: "Unlike traditional web utilities that upload your sensitive documents to remote servers, MyToolsBox runs computations entirely inside your browser using modern WebAssembly, Web Crypto, and HTML5 APIs. This means instantaneous processing, zero network latency, and complete confidentiality for financial data, private notes, and corporate files."
      },
      {
        title: "2. Fast Keyboard Navigation",
        content: "Power users can navigate without touching the mouse. Press Cmd+K (macOS) or Ctrl+K (Windows/Linux) from any screen to summon the universal search palette. Start typing any tool name, category, or document action to instantly launch it.",
        codeSnippet: "Ctrl+K / Cmd+K  ->  Open Universal Command Palette\nEsc             ->  Dismiss Modal / Drawer\nEnter           ->  Execute primary tool action"
      },
      {
        title: "3. Offline & PWA Installation",
        content: "You can install MyToolsBox on your desktop or mobile home screen. Click the install icon in your browser's address bar to save the application. Once cached by our Service Worker, all client-side tools remain fully functional even when disconnected from the internet or on airplane mode."
      }
    ]
  },
  {
    slug: "pdf-tools-guide",
    title: "PDF Tools: Complete Mastery Guide",
    category: "multimedia",
    description: "Master merging, splitting, compressing, and converting PDFs. Learn when to use each tool and tips for best results.",
    readTime: "7 min read",
    iconName: "FileText",
    gradient: "from-red-500/10 to-rose-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    takeaways: [
      "Merge multiple PDF documents into a unified binder in seconds",
      "Split large eBooks or contracts into targeted page ranges",
      "Compress scanned PDFs using vector downsampling without text blur",
      "Extract annotations and highlights for research synthesis"
    ],
    recommendedTools: [
      { name: "PDF Highlighter & Notes", slug: "pdf-highlighter-notes", description: "Annotate PDFs and extract notes" },
      { name: "File Organizer", slug: "file-organizer", description: "Sort and batch rename documents" },
      { name: "Base64 Encoder", slug: "base64-encoder", description: "Embed PDF files as data URIs" }
    ],
    sections: [
      {
        title: "1. Merging & Organizing PDF Chapters",
        content: "When combining disparate PDF documents—such as invoices, receipts, or research appendices—drag and drop files into the merging queue. You can reorder pages by dragging before generating the unified output file. The original bookmarks and vector text layers are preserved."
      },
      {
        title: "2. Compression Strategies: Balance Size vs. Clarity",
        content: "PDF file bloat typically stems from embedded high-resolution raster images rather than text. For standard screen distribution or email attachments (under 25MB), apply Medium compression (150 DPI). For archival or official document submission where legal stamps and signatures require crisp vectors, select Low compression (300 DPI)."
      },
      {
        title: "3. Secure Handling of Sensitive Documents",
        content: "Because legal contracts and bank statements contain confidential Personally Identifiable Information (PII), processing them via cloud uploaders presents compliance hazards. MyToolsBox's PDF engine executes via client-side PDF.js and WebAssembly, ensuring that sensitive documents never travel across the public wire."
      }
    ]
  },
  {
    slug: "image-processing-101",
    title: "Image Processing 101: Web Optimization",
    category: "multimedia",
    description: "Compress, resize, crop, and convert images without quality loss. Understand format differences and optimization strategies.",
    readTime: "6 min read",
    iconName: "FileImage",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600 dark:text-green-400",
    takeaways: [
      "Modern WebP and AVIF formats reduce file size by 30-50% compared to JPG/PNG",
      "Always resize image dimensions to display resolution before compressing",
      "Use PNG strictly when lossless transparency or sharp UI vectors are required",
      "High-DPI retina assets should be exported at 2x resolution"
    ],
    recommendedTools: [
      { name: "Canva Studio", slug: "canva", description: "Create social graphics & presentations" },
      { name: "Color Palette", slug: "color-palette", description: "Generate accessible brand palettes" },
      { name: "Video to GIF", slug: "video-to-gif", description: "Convert video clips into lightweight GIFs" }
    ],
    sections: [
      {
        title: "1. Choosing the Right Format: WebP vs PNG vs JPEG",
        content: "WebP is now supported by over 97% of global web browsers. It provides superior lossy and lossless compression algorithms with alpha channel transparency. Use WebP for website hero banners, product photography, and blog illustrations. Reserve PNG for crisp logos, icons, and diagrams with fine text."
      },
      {
        title: "2. Lossless vs Lossy Compression",
        content: "Lossless compression strips non-essential metadata (such as EXIF camera GPS coordinates and color profiles) while preserving every single pixel value. Lossy compression judiciously eliminates high-frequency color variations that the human eye cannot perceive, yielding dramatic 60–80% size reductions with zero visual degradation."
      }
    ]
  },
  {
    slug: "developer-tools-overview",
    title: "Developer Tools: Client-Side Debugging",
    category: "developer",
    description: "JSON formatting, Base64 encoding, URL encoding, regex testing, and diff checking — all in your browser.",
    readTime: "8 min read",
    iconName: "FileCode",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    takeaways: [
      "Validate and format JSON payloads with syntax error line pointers",
      "Inspect and decode JWT tokens without exposing API credentials to third parties",
      "Test complex Regular Expressions with real-time capture group visualization",
      "Perform side-by-side text diffing with character-level change highlighting"
    ],
    recommendedTools: [
      { name: "JSON Formatter", slug: "json-formatter", description: "Format, validate, and minify JSON" },
      { name: "JWT Decoder", slug: "jwt-decoder", description: "Decode and inspect tokens safely" },
      { name: "Regex Tester", slug: "regex-tester", description: "Test regular expressions with flags" },
      { name: "Diff Checker", slug: "diff-checker", description: "Compare two blocks of code" }
    ],
    sections: [
      {
        title: "1. Secure API Token Inspection",
        content: "Pasting JSON Web Tokens (JWT) into unverified online web decoders risks leaking sensitive session tokens, user IDs, and claims to third-party server logs. Our JWT Decoder parses header, payload, and signatures completely in-memory, allowing safe debugging of expiration times and issuer claims."
      },
      {
        title: "2. Regular Expression Debugging Workflow",
        content: "Use the Regex Tester with global (`g`), case-insensitive (`i`), and multiline (`m`) flags. The engine executes natively against JavaScript's V8 regex engine, rendering instant highlight matches, capturing groups, and execution benchmarks."
      }
    ]
  },
  {
    slug: "calculator-tools-guide",
    title: "Financial & Mathematical Calculations",
    category: "productivity",
    description: "Percentage, age, BMI, loan, and unit conversion calculators explained with real-world examples.",
    readTime: "5 min read",
    iconName: "Calculator",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    takeaways: [
      "Calculate monthly loan payments and amortization schedules accurately",
      "Understand compound interest formulas for retirement and investment planning",
      "Determine profit margins and break-even units for business decisions",
      "Convert between imperial and metric units across 10+ measurement dimensions"
    ],
    recommendedTools: [
      { name: "Loan Calculator", slug: "loan-calculator", description: "Calculate loan payments & interest" },
      { name: "Percentage Calculator", slug: "percentage-calculator", description: "Quick percentage changes & deltas" },
      { name: "Currency Converter", slug: "currency-converter", description: "Exchange rates for 35+ currencies" }
    ],
    sections: [
      {
        title: "1. Loan Amortization & Total Interest",
        content: "Our Loan Calculator uses the standard financial annuity formula: P = (r * PV) / (1 - (1 + r)^(-n)). It exposes not only your recurring monthly obligation, but also the cumulative interest paid over the loan lifecycle, enabling smarter refinancing decisions."
      },
      {
        title: "2. Margin vs. Markup Distinction",
        content: "Many entrepreneurs conflate margin with markup. Markup is the percentage added to the cost price: (Price - Cost) / Cost. Margin is the percentage of selling price that is profit: (Price - Cost) / Price. A 50% markup corresponds to a 33.3% gross margin."
      }
    ]
  },
  {
    slug: "cryptography-security-guide",
    title: "Cryptography & Security Best Practices",
    category: "security",
    description: "Understand the differences between hashing, symmetric encryption, and encoding, plus password entropy metrics.",
    readTime: "6 min read",
    iconName: "Shield",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    takeaways: [
      "Encoding (Base64) is for data transport, NOT security or obfuscation",
      "Cryptographic hashes (SHA-256) are irreversible one-way mathematical digests",
      "Password strength depends primarily on entropy bits rather than arbitrary character rules",
      "HMAC signatures verify both authenticity and data integrity"
    ],
    recommendedTools: [
      { name: "Password Generator", slug: "password-generator", description: "Generate high-entropy credentials" },
      { name: "Hash Generator", slug: "hash-generator", description: "Compute MD5, SHA-256, and HMAC" },
      { name: "Barcode Generator", slug: "barcode-generator", description: "Create Code 128, EAN-13, and QR" }
    ],
    sections: [
      {
        title: "1. Shannon Entropy & Password Cracking",
        content: "Entropy measures the unpredictability of a password in bits: E = L * log2(N), where L is the password length and N is the character set size. A 16-character password with letters, digits, and symbols boasts over 100 bits of entropy, requiring billions of years to crack with brute-force computing."
      },
      {
        title: "2. The Role of Checksums in File Verification",
        content: "When downloading software or transferring sensitive archives, compute the SHA-256 or CRC-32 hash of the received file. If the calculated checksum matches the vendor's published digest, you have mathematical proof that the file was not tampered with or corrupted during transit."
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// 2. Production Ready Downloadable & Interactive Templates
// ---------------------------------------------------------------------------
export const RESOURCE_TEMPLATES: ResourceTemplate[] = [
  {
    id: "project-proposal",
    title: "Project Proposal & Scope Document",
    category: "business",
    format: "MD",
    filename: "project-proposal-template.md",
    description: "Structured project proposal with executive summary, deliverables, timeline milestones, and budget breakdown.",
    iconName: "FileText",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    toolIntegration: { toolSlug: "proposal-generator", toolName: "Proposal Generator" },
    content: `# Project Proposal: [Project Name]

**Prepared For:** [Client / Organization Name]  
**Prepared By:** [Your Name / Company]  
**Date:** [Date]  
**Version:** 1.0  

---

## 1. Executive Summary
Brief overview of the client's current challenge, the proposed strategic solution, and the anticipated commercial impact.

## 2. Project Objectives & Deliverables
- **Objective 1:** [Specific, Measurable Goal]
  - Deliverable 1.1: [Concrete deliverable description]
  - Deliverable 1.2: [Concrete deliverable description]
- **Objective 2:** [Specific, Measurable Goal]
  - Deliverable 2.1: [Concrete deliverable description]

## 3. Scope of Work
### Included in Scope
- Comprehensive system architecture and implementation
- Quality assurance and cross-device testing
- 30 days post-launch warranty and bug-fix support

### Excluded from Scope
- Third-party API subscription costs
- Unscheduled feature additions outside documented milestone specs

## 4. Timeline & Key Milestones
| Milestone | Description | Duration | Target Delivery |
|-----------|-------------|----------|-----------------|
| Phase 1   | Discovery & Wireframes | 2 Weeks | Week 2 |
| Phase 2   | Core Engine Development | 4 Weeks | Week 6 |
| Phase 3   | Integration & QA Testing | 2 Weeks | Week 8 |
| Phase 4   | Final Deployment & Handover | 1 Week | Week 9 |

## 5. Budget & Payment Schedule
- **Milestone 1 (Deposit):** 30% upon contract signing
- **Milestone 2 (Beta Delivery):** 40% upon functional demo
- **Milestone 3 (Final Acceptance):** 30% upon deployment

---
*Authorized Signature:* __________________________  
*Date:* _______________`
  },
  {
    id: "meeting-notes",
    title: "Executive Meeting Notes & Action Items",
    category: "productivity",
    format: "MD",
    filename: "meeting-notes-template.md",
    description: "Structured meeting documentation with attendee roster, agenda items, key decisions, and tracked action item owners.",
    iconName: "FileText",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    toolIntegration: { toolSlug: "notes-app", toolName: "Notes App" },
    content: `# Meeting Notes: [Topic / Project Name]

**Date & Time:** [YYYY-MM-DD HH:MM]  
**Location / Link:** [Zoom / Room A]  
**Facilitator:** [Name]  
**Note Taker:** [Name]  

---

## 👥 Attendees
- [ ] [Name 1] (Role / Department)
- [ ] [Name 2] (Role / Department)
- [ ] [Name 3] (Role / Department)

## 📋 Meeting Agenda
1. Review previous action items and milestone progress
2. Current blockers and critical path resolution
3. New feature prioritization for upcoming sprint
4. Open Q&A and next steps

## 💡 Key Discussion Points
- **Topic A:** Discussion summary, differing viewpoints, and consensus.
- **Topic B:** Key metrics, data points, or customer feedback reviewed.

## 🎯 Decisions Made
- [DECISION-01]: Approved transition to client-side processing pipeline.
- [DECISION-02]: Budget allocation authorized for Q3 cloud infrastructure.

## ✅ Action Items & Owners
| Status | Action Item | Assignee | Due Date |
|:------:|-------------|----------|:--------:|
| [ ] | Finalize API endpoint specifications | @Alex | 2026-10-01 |
| [ ] | Review design tokens with UX team | @Sarah | 2026-10-03 |
| [ ] | Schedule client demonstration | @Jordan | 2026-10-05 |`
  },
  {
    id: "budget-tracker-csv",
    title: "Monthly Budget & Cashflow Spreadsheet",
    category: "finance",
    format: "CSV",
    filename: "monthly-budget-tracker.csv",
    description: "Tabular budget ledger with categorized income, fixed overhead, variable expenditures, and auto-net calculations.",
    iconName: "Calculator",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    toolIntegration: { toolSlug: "matrix-calculator", toolName: "Calculator Tools" },
    content: `Category,Subcategory,Budgeted Amount,Actual Spend,Variance,Notes
Income,Primary Salary,6500.00,6500.00,0.00,Direct Deposit
Income,Freelance Consulting,1800.00,2100.00,+300.00,Bonus project completed
Housing,Mortgage / Rent,2200.00,2200.00,0.00,Fixed cost
Utilities,Electricity & Gas,180.00,165.40,+14.60,Favorable weather
Utilities,High-Speed Internet,85.00,85.00,0.00,Standard rate
Transportation,Vehicle Payment,420.00,420.00,0.00,Financing
Transportation,Fuel & Transit,250.00,215.80,+34.20,Lower commute days
Food,Groceries & Supplies,750.00,810.25,-60.25,Bulk store trip
Food,Dining Out & Coffee,300.00,340.50,-40.50,Team dinner
Healthcare,Health Insurance,380.00,380.00,0.00,Premium
Investments,Retirement Index Fund,1500.00,1500.00,0.00,Automated transfer
Savings,Emergency Fund Reserve,500.00,500.00,0.00,High yield savings
Discretionary,Subscriptions & Software,95.00,95.00,0.00,Streaming & dev tools
TOTALS,NET CASH SURPLUS,1640.00,1788.05,+148.05,Positive monthly balance`
  },
  {
    id: "code-review-checklist",
    title: "Engineering Code Review Checklist",
    category: "developer",
    format: "MD",
    filename: "code-review-checklist.md",
    description: "Standardized peer review checklist verifying architecture, security, performance, accessibility, and test suites.",
    iconName: "FileCode",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    toolIntegration: { toolSlug: "diff-checker", toolName: "Diff Checker" },
    content: `# Code Review Checklist

**PR Title:** [PR Title]  
**Author:** @[Author]  
**Reviewer:** @[Reviewer]  
**Branch:** [feature-branch] -> [main]  

---

### 1. Functional Correctness & Requirements
- [ ] Does the implementation satisfy all acceptance criteria outlined in the ticket?
- [ ] Are edge cases handled (e.g. empty lists, null values, network timeouts)?
- [ ] Is error handling graceful with user-friendly error feedback?

### 2. Architecture & Code Quality
- [ ] Does the code follow Clean Code and Single Responsibility Principles?
- [ ] Are functions concise and easy to understand without excessive nesting?
- [ ] Is there any duplicate code that should be extracted to a shared utility?
- [ ] Are variables and functions given clear, self-documenting names?

### 3. Security & Privacy
- [ ] Are all user inputs sanitized to prevent XSS and injection attacks?
- [ ] Are there NO secrets, API keys, or private credentials committed?
- [ ] Are sensitive tokens, JWTs, and session cookies handled securely?

### 4. Performance & Resource Efficiency
- [ ] Are expensive computations memoized (\`useMemo\`, \`useCallback\`)?
- [ ] Are database queries, API calls, and re-renders minimized?
- [ ] Are large assets optimized or lazily loaded?

### 5. Testing & Verification
- [ ] Are unit tests included for newly introduced logic?
- [ ] Do all existing regression test suites pass 100% green?
- [ ] Has the feature been manually verified in both dark and light modes?`
  },
  {
    id: "weekly-time-block",
    title: "Weekly Time-Blocking & Focus Planner",
    category: "productivity",
    format: "TXT",
    filename: "weekly-focus-planner.txt",
    description: "Structured high-performance weekly planner separating deep focus blocks, administrative slots, and daily priorities.",
    iconName: "FileText",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    toolIntegration: { toolSlug: "pomodoro-timer", toolName: "Pomodoro Timer" },
    content: `================================================================================
                    WEEKLY FOCUS & TIME-BLOCKING PLANNER
================================================================================
WEEK OF: [YYYY-MM-DD]                 TOP 3 GOALS FOR THE WEEK:
--------------------                 1. ________________________________________
                                     2. ________________________________________
                                     3. ________________________________________

DAILY TIME BLOCK SCHEDULE:
--------------------------------------------------------------------------------
HOUR         MONDAY        TUESDAY       WEDNESDAY     THURSDAY      FRIDAY
--------------------------------------------------------------------------------
08:00-09:00  Morning Kick  Morning Kick  Morning Kick  Morning Kick  Morning Kick
09:00-11:30  DEEP FOCUS 1  DEEP FOCUS 1  DEEP FOCUS 1  DEEP FOCUS 1  DEEP FOCUS 1
             (Project A)   (Project A)   (Architecture)(Refactoring) (Sprint Review)
11:30-12:00  Inbox & Comms Inbox & Comms Inbox & Comms Inbox & Comms Inbox & Comms
12:00-13:00  LUNCH / WALK  LUNCH / WALK  LUNCH / WALK  LUNCH / WALK  LUNCH / WALK
13:00-15:00  DEEP FOCUS 2  Collaborative DEEP FOCUS 2  Client Calls  Open Office /
             (Features)    Design Specs  (Build Engine)(Check-ins)   Learning
15:00-16:00  Sync Meetings 1-on-1 Chats  Team Standup  Sync Meetings Retro & Plan
16:00-17:00  Admin & Wrap  Admin & Wrap  Admin & Wrap  Admin & Wrap  Weekly Close
================================================================================
WEEKEND REFLECTION:
Wins: _________________________________________________________________________
Key Learnings: ________________________________________________________________
Habit Score: [  / 7 Days ]
================================================================================`
  },
  {
    id: "api-doc-spec",
    title: "REST API Documentation Specification",
    category: "developer",
    format: "JSON",
    filename: "api-spec-template.json",
    description: "Standard OpenAPI / Swagger compliant API documentation skeleton with endpoints, schemas, and status codes.",
    iconName: "FileJson",
    gradient: "from-cyan-500/10 to-blue-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    toolIntegration: { toolSlug: "json-formatter", toolName: "JSON Formatter" },
    content: `{
  "openapi": "3.0.3",
  "info": {
    "title": "My Service API",
    "description": "Production REST API specification for client integration",
    "version": "1.0.0",
    "contact": {
      "name": "API Engineering Team",
      "email": "support@example.com"
    }
  },
  "servers": [
    {
      "url": "https://api.example.com/v1",
      "description": "Production Server"
    }
  ],
  "paths": {
    "/tools/process": {
      "post": {
        "summary": "Execute client tool transformation",
        "operationId": "processToolAction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["action", "payload"],
                "properties": {
                  "action": { "type": "string", "example": "format-json" },
                  "payload": { "type": "string", "example": "{\\"id\\":1}" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Operation completed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "result": { "type": "string" },
                    "timestamp": { "type": "integer", "example": 1727100000 }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid input parameters or malformed JSON"
          }
        }
      }
    }
  }
}`
  }
];

// ---------------------------------------------------------------------------
// 3. Interactive Cheat Sheets & Quick References
// ---------------------------------------------------------------------------
export const CHEAT_SHEETS: CheatSheetItem[] = [
  // Regex
  { id: "reg-1", category: "regex", title: "Email Address Pattern", syntax: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", explanation: "Standard RFC 5322 compliant email validator.", example: "user@domain.com", badge: "Validation" },
  { id: "reg-2", category: "regex", title: "URL with HTTP/HTTPS", syntax: "^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$", explanation: "Matches standard web URLs with optional query strings.", example: "https://mytoolsbox.me/tools", badge: "Web" },
  { id: "reg-3", category: "regex", title: "Positive Lookahead", syntax: "(?=pattern)", explanation: "Asserts that the given subpattern immediately follows the current position without including it in the match.", example: "\\d+(?=px)", badge: "Lookaround" },
  { id: "reg-4", category: "regex", title: "Strong Password (Min 8, 1 Num, 1 Upper)", syntax: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$", explanation: "Requires at least one uppercase letter, one lowercase letter, and one number.", example: "SecurePass123", badge: "Security" },
  { id: "reg-5", category: "regex", title: "UUID v4 Pattern", syntax: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$", explanation: "Validates standard 36-character hexadecimal UUID version 4 strings.", example: "c2b5ec4e-6e42-49f2-8924-d2e8b61c1694", badge: "Data" },

  // HTTP
  { id: "http-1", category: "http", title: "200 OK", syntax: "Status: 200", explanation: "Standard response for successful HTTP requests with payload body.", badge: "Success" },
  { id: "http-2", category: "http", title: "201 Created", syntax: "Status: 201", explanation: "The request has succeeded and led to the creation of a new resource.", badge: "Success" },
  { id: "http-3", category: "http", title: "301 Moved Permanently", syntax: "Status: 301", explanation: "Target resource has been assigned a new permanent URI. Search engines pass SEO link juice.", badge: "Redirect" },
  { id: "http-4", category: "http", title: "400 Bad Request", syntax: "Status: 400", explanation: "The server cannot process the request due to malformed syntax or invalid parameters.", badge: "Client Error" },
  { id: "http-5", category: "http", title: "401 Unauthorized", syntax: "Status: 401", explanation: "Request lacks valid authentication credentials (e.g. missing Bearer token).", badge: "Auth" },
  { id: "http-6", category: "http", title: "403 Forbidden", syntax: "Status: 403", explanation: "Authenticated identity does not possess permission rights to access the resource.", badge: "Auth" },
  { id: "http-7", category: "http", title: "404 Not Found", syntax: "Status: 404", explanation: "The server cannot locate the requested endpoint or resource URI.", badge: "Client Error" },
  { id: "http-8", category: "http", title: "429 Too Many Requests", syntax: "Status: 429", explanation: "The client has exceeded rate limits. Look for Retry-After header.", badge: "Rate Limit" },
  { id: "http-9", category: "http", title: "500 Internal Server Error", syntax: "Status: 500", explanation: "Generic unhandled exception occurred in the server application execution.", badge: "Server Error" },

  // Markdown
  { id: "md-1", category: "markdown", title: "Tables with Alignment", syntax: "| Left | Center | Right |\n|:-----|:------:|------:|\n| A    |   B    |     C |", explanation: "Colons specify column alignment in GitHub Flavored Markdown.", badge: "Formatting" },
  { id: "md-2", category: "markdown", title: "Interactive Task Lists", syntax: "- [x] Completed item\n- [ ] Pending task", explanation: "Renders clickable checkboxes in modern markdown viewers.", badge: "Checklists" },
  { id: "md-3", category: "markdown", title: "Alert Callouts", syntax: "> [!NOTE]\n> Highlights critical context or information.\n\n> [!WARNING]\n> Warns users of potential pitfalls.", explanation: "GitHub-style callout alert boxes.", badge: "Alerts" },
  { id: "md-4", category: "markdown", title: "LaTeX Math Formulas", syntax: "$E = mc^2$\n\n$$\\int_{a}^{b} f(x)dx$$", explanation: "Inline math with single $, display block math with double $$.", badge: "Math" },

  // MIME Types
  { id: "mime-1", category: "mime", title: "JSON Payload", syntax: "application/json", explanation: "Standard for REST APIs, configuration, and structured objects.", example: ".json", badge: "Data" },
  { id: "mime-2", category: "mime", title: "WebP Image", syntax: "image/webp", explanation: "Modern compressed raster graphic with lossy, lossless, and alpha channel support.", example: ".webp", badge: "Image" },
  { id: "mime-3", category: "mime", title: "PDF Document", syntax: "application/pdf", explanation: "Adobe Portable Document Format for universal print and digital layouts.", example: ".pdf", badge: "Document" },
  { id: "mime-4", category: "mime", title: "Word OpenXML", syntax: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", explanation: "Modern zipped XML format for Microsoft Word documents.", example: ".docx", badge: "Document" },
  { id: "mime-5", category: "mime", title: "MP4 Video", syntax: "video/mp4", explanation: "Standard H.264 / AAC multimedia container format.", example: ".mp4", badge: "Video" },

  // Git Commands
  { id: "git-1", category: "git", title: "Undo Last Commit (Keep Changes)", syntax: "git reset --soft HEAD~1", explanation: "Rolls back the commit pointer while preserving all modified files staged in index.", badge: "History" },
  { id: "git-2", category: "git", title: "Stash with Descriptive Message", syntax: "git stash push -m \"WIP: refactor auth pipeline\"", explanation: "Saves uncommitted work to the stash stack with an identifiable label.", badge: "Workflow" },
  { id: "git-3", category: "git", title: "Interactive Rebase Last N Commits", syntax: "git rebase -i HEAD~4", explanation: "Opens editor to squash, reword, or drop recent commits before merging.", badge: "Branching" },
  { id: "git-4", category: "git", title: "Prune Deleted Remote Branches", syntax: "git fetch --prune", explanation: "Removes stale local tracking branches that no longer exist on the remote repository.", badge: "Maintenance" }
];

// ---------------------------------------------------------------------------
// 4. Comprehensive Interactive FAQs
// ---------------------------------------------------------------------------
export const RESOURCE_FAQS: ResourceFaq[] = [
  {
    id: "faq-1",
    category: "privacy",
    question: "Are my files uploaded or saved on a remote server?",
    answer: "No, never. All tools on MyToolsBox process your files, text, and images locally inside your web browser using modern Web APIs (WebAssembly, Web Crypto, FileReader, and Canvas). Your documents never leave your computer, and our servers never receive your data.",
    iconName: "Shield",
    relatedToolSlug: "hash-generator"
  },
  {
    id: "faq-2",
    category: "offline",
    question: "Can I use MyToolsBox offline without an internet connection?",
    answer: "Yes! Once you load the site, our Service Worker caches all scripts, assets, and tools. You can install MyToolsBox as a Progressive Web App (PWA) onto your desktop, tablet, or phone and continue running PDF operations, calculators, text formatting, and barcode generation completely offline.",
    iconName: "Smartphone",
    relatedToolSlug: "barcode-generator"
  },
  {
    id: "faq-3",
    category: "usage",
    question: "Is MyToolsBox free to use for commercial and client projects?",
    answer: "Yes, 100% free. All tools, templates, and generated assets (such as barcodes, QR codes, invoices, color palettes, and formatted documents) are royalty-free. You are free to use them for both personal and enterprise commercial work without attribution.",
    iconName: "Zap",
    relatedToolSlug: "invoice-generator"
  },
  {
    id: "faq-4",
    category: "technical",
    question: "What is the maximum file size I can process?",
    answer: "Because all computing runs locally in your browser, file processing limits depend on your device's available RAM. Modern desktop browsers easily handle 100MB+ PDFs and videos smoothly. If you work with extremely large gigabyte-scale videos, we recommend chunking them or converting them sequentially.",
    iconName: "FileJson",
    relatedToolSlug: "video-compressor"
  },
  {
    id: "faq-5",
    category: "privacy",
    question: "How are password entropy and cryptographic hashes calculated?",
    answer: "We use the browser's native window.crypto.getRandomValues and crypto.subtle.digest standards. Shannon entropy is calculated mathematically using character set cardinality E = L * log2(N). No pseudo-random Math.random() is used in security tools.",
    iconName: "Lock",
    relatedToolSlug: "password-generator"
  },
  {
    id: "faq-6",
    category: "technical",
    question: "Which browsers are officially supported?",
    answer: "MyToolsBox is fully optimized for all modern evergreen browsers supporting ES2022 and WebAssembly: Google Chrome 90+, Mozilla Firefox 90+, Apple Safari 15+, and Microsoft Edge 90+. Mobile browsers on iOS and Android are also fully supported.",
    iconName: "Globe"
  }
];

// Helper functions for easy lookup and search
export function getGuideBySlug(slug: string): ResourceGuide | undefined {
  return RESOURCE_GUIDES.find((g) => g.slug === slug);
}

export function searchResources(query: string): {
  guides: ResourceGuide[];
  templates: ResourceTemplate[];
  cheatSheets: CheatSheetItem[];
  faqs: ResourceFaq[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      guides: RESOURCE_GUIDES,
      templates: RESOURCE_TEMPLATES,
      cheatSheets: CHEAT_SHEETS,
      faqs: RESOURCE_FAQS,
    };
  }

  return {
    guides: RESOURCE_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.sections.some((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
    ),
    templates: RESOURCE_TEMPLATES.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.format.toLowerCase().includes(q) ||
        t.filename.toLowerCase().includes(q)
    ),
    cheatSheets: CHEAT_SHEETS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.syntax.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    ),
    faqs: RESOURCE_FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    ),
  };
}
