import type { PromptCategory, PromptTemplate, AIPersona } from "./types";

// ---------------------------------------------------------------------------
// AI Personas / System Personas
// ---------------------------------------------------------------------------

export const AI_PERSONAS: AIPersona[] = [
  {
    id: "general",
    name: "General Assistant",
    role: "Helpful & Balanced",
    description: "Versatile, insightful, and clear responses across any subject.",
    systemPrompt:
      "You are a brilliant, helpful, and versatile AI assistant. Provide concise, accurate, well-structured responses formatted with markdown.",
    iconName: "Sparkles",
    gradient: "from-violet-500/15 to-purple-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "software-engineer",
    name: "Staff Software Engineer",
    role: "Code & Architecture Expert",
    description: "Production-grade code, architectural best practices, clean patterns & performance tuning.",
    systemPrompt:
      "You are a Staff Software Engineer with deep expertise across modern full-stack development, distributed systems, TypeScript, Python, React, Next.js, and database design. Always output clean, idiomatic, typed, well-commented code. Point out edge cases, time/space complexity, and security considerations.",
    iconName: "Code",
    gradient: "from-blue-500/15 to-cyan-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "creative-writer",
    name: "Master Copywriter & Storyteller",
    role: "Persuasive & Engaging Content",
    description: "Compelling storytelling, viral hooks, persuasive copy, and clear editorial flow.",
    systemPrompt:
      "You are an elite copywriter and master storyteller. Write engaging, vivid, persuasive content tailored to the audience. Avoid clichés and corporate jargon. Focus on emotional resonance, punchy rhythm, and memorable phrasing.",
    iconName: "Pencil",
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "data-math",
    name: "Data Scientist & Math Tutor",
    role: "Mathematical & Statistical Depth",
    description: "Step-by-step calculus, linear algebra, probability, data modeling & statistical proofs.",
    systemPrompt:
      "You are an expert Data Scientist and Mathematics Professor. Provide rigorous, step-by-step solutions to mathematical, algorithmic, and statistical questions. Explain the intuition behind formulas, show working clearly, and format formulas using LaTeX/markdown notations.",
    iconName: "Calculator",
    gradient: "from-rose-500/15 to-pink-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "academic-researcher",
    name: "Academic Researcher",
    role: "Scholarly & Evidence-Based",
    description: "Literature syntheses, objective critique, citations, and formal scientific exposition.",
    systemPrompt:
      "You are a distinguished academic researcher and peer reviewer. Analyze topics critically, summarize scientific literature objectively, identify research gaps, and organize ideas into rigorous, formal academic prose with methodology and limitations.",
    iconName: "GraduationCap",
    gradient: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "product-manager",
    name: "Executive Product Strategist",
    role: "Strategy, PRDs & Growth",
    description: "Product roadmaps, user requirements, competitive moats & prioritization frameworks.",
    systemPrompt:
      "You are a VP of Product and Startup Advisor. Frame solutions using frameworks like RICE, Jobs-to-be-Done (JTBD), MoSCoW, and First Principles. Write clear Product Requirement Documents (PRDs), user stories with acceptance criteria, and strategic go-to-market trade-offs.",
    iconName: "Briefcase",
    gradient: "from-indigo-500/15 to-blue-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "coding",
    name: "Coding & Engineering",
    icon: "Code",
    description: "Debugging, refactoring, system architecture, unit tests, SQL & API contracts.",
  },
  {
    id: "writing",
    name: "Writing & Content",
    icon: "Pencil",
    description: "Articles, storytelling, high-converting copy, newsletters & technical docs.",
  },
  {
    id: "business",
    name: "Business & Strategy",
    icon: "TrendingUp",
    description: "Business model canvases, competitive teardowns, pricing models & pitch decks.",
  },
  {
    id: "product",
    name: "Product & UI/UX",
    icon: "Layers",
    description: "PRDs, user story mapping, usability audits, wireframe specs & user interviews.",
  },
  {
    id: "data-math",
    name: "Data & Mathematics",
    icon: "Calculator",
    description: "Data wrangling, statistical inference, machine learning & mathematical proofs.",
  },
  {
    id: "education",
    name: "Learning & Research",
    icon: "BookOpen",
    description: "Feynman explanations, Socratic dialogues, flashcards & literature reviews.",
  },
  {
    id: "productivity",
    name: "Productivity & Career",
    icon: "CheckSquare",
    description: "Weekly reviews, resume quantification, interview prep & salary negotiations.",
  },
  {
    id: "marketing",
    name: "Marketing & Growth",
    icon: "Megaphone",
    description: "Viral hooks, GTM campaigns, SEO strategy, customer avatars & ad copy.",
  },
];

// ---------------------------------------------------------------------------
// Curated 160+ Best Prompts Dataset
// ---------------------------------------------------------------------------

export const PROMPTS_DATASET: PromptTemplate[] = [
  // ==========================================
  // 1. CODING & SOFTWARE ENGINEERING (25)
  // ==========================================
  {
    id: "code-1",
    categoryId: "coding",
    title: "Root Cause Bug Hunter",
    description: "Analyze an error stack trace, pinpoint the root cause, and write the minimal fix.",
    prompt: `I am experiencing a bug in my [Language/Framework] application.

Error / Stack Trace:
\`\`\`
[Paste error or stack trace here]
\`\`\`

Relevant Code:
\`\`\`
[Paste relevant code snippet here]
\`\`\`

Please:
1. Explain the exact root cause of the error in simple terms.
2. Provide the corrected code with the minimal necessary changes.
3. List 2-3 defensive coding patterns or unit tests to prevent this regression.`,
    tags: ["debug", "error", "fix", "troubleshooting"],
    placeholders: ["[Language/Framework]", "[Paste error or stack trace here]", "[Paste relevant code snippet here]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "code-2",
    categoryId: "coding",
    title: "Clean Code & Refactoring Specialist",
    description: "Refactor legacy code for readability, performance, and SOLID principles.",
    prompt: `Please review and refactor the following [Language] code:

\`\`\`[Language]
[Paste code here]
\`\`\`

Refactoring Goals:
- Follow SOLID and clean code principles.
- Eliminate code smells (nested conditionals, duplicate logic, magic strings).
- Maintain 100% functional equivalence.
- Provide a summary of each refactoring step and why it was made.`,
    tags: ["refactor", "clean code", "solid", "readability"],
    placeholders: ["[Language]", "[Paste code here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-3",
    categoryId: "coding",
    title: "High-Performance SQL Query Optimizer",
    description: "Tune slow database queries with index recommendations and execution plan analysis.",
    prompt: `Analyze and optimize this slow SQL query for [PostgreSQL/MySQL/SQLite]:

\`\`\`sql
[Paste slow SQL query here]
\`\`\`

Table Schema & Approximate Row Count:
[Provide table columns, existing indexes, and row count if known]

Provide:
1. The optimized SQL query.
2. Recommended indexes with exact \`CREATE INDEX\` statements.
3. Explanation of bottlenecks (e.g. seq scans, N+1, unindexed joins) and performance improvements.`,
    tags: ["sql", "database", "performance", "indexing"],
    placeholders: ["[PostgreSQL/MySQL/SQLite]", "[Paste slow SQL query here]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-4",
    categoryId: "coding",
    title: "Comprehensive Unit Test Suite Generator",
    description: "Generate thorough unit and edge-case tests using Vitest, Jest, or Pytest.",
    prompt: `Generate a comprehensive test suite for this function using [Vitest / Jest / Pytest / Go test]:

\`\`\`
[Paste function or class here]
\`\`\`

Requirements:
- Cover the happy path.
- Cover all edge cases (null, undefined, empty strings/arrays, boundary values, network/error throws).
- Mock external dependencies cleanly.
- Use readable \`describe\` / \`it\` or test function names.`,
    tags: ["testing", "vitest", "jest", "unit test", "qa"],
    placeholders: ["[Vitest / Jest / Pytest / Go test]", "[Paste function or class here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-5",
    categoryId: "coding",
    title: "Modern RESTful / RPC API Spec Designer",
    description: "Design clean, idiomatic REST API endpoints with request/response schemas.",
    prompt: `Design a production-ready REST API for [Feature / Domain, e.g., Team Collaboration Workspace].

Include:
1. Resource endpoints with HTTP methods, paths, and status codes.
2. JSON Request body schema with types and validation rules.
3. Success response JSON examples.
4. Standard error responses (400, 401, 404, 409, 429).
5. Pagination, sorting, and filtering convention.`,
    tags: ["api", "rest", "backend", "architecture"],
    placeholders: ["[Feature / Domain, e.g., Team Collaboration Workspace]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-6",
    categoryId: "coding",
    title: "Advanced TypeScript Types & Generics",
    description: "Write type-safe TypeScript utilities, conditional types, and schema helpers.",
    prompt: `Create a TypeScript utility type for the following requirement:

Goal: [Describe desired behavior, e.g., DeepPartial, RecursiveReadonly, Strongly-typed Event Emitter, or Discriminated Union]

Current Types / Sample Usage:
\`\`\`typescript
[Paste existing types or desired usage example here]
\`\`\`

Provide:
1. The exact type definition utilizing advanced generics, conditional types, or mapped types.
2. 3 test cases demonstrating compiler acceptance on valid data and compiler errors on invalid data.`,
    tags: ["typescript", "types", "generics", "type-safety"],
    placeholders: ["[Describe desired behavior]", "[Paste existing types or desired usage example here]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "code-7",
    categoryId: "coding",
    title: "Next.js App Router Architecture Advisor",
    description: "Architect Server Components, Client Components, caching & Server Actions.",
    prompt: `I am building [Feature Name] in Next.js 15+ using the App Router.

Requirements:
[Describe requirements, data fetching needs, and interactive elements]

Provide:
1. Recommended folder structure under \`app/\`.
2. Clear separation of Server Components vs Client Components (\`"use client"\`).
3. Data fetching & caching strategy (Suspense, streaming, Server Actions).
4. Error boundaries and loading UI architecture.`,
    tags: ["nextjs", "react", "app router", "server components"],
    placeholders: ["[Feature Name]", "[Describe requirements]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-8",
    categoryId: "coding",
    title: "Complex Regex Builder & Explainer",
    description: "Build robust Regular Expressions with detailed group explanations and test cases.",
    prompt: `Create a Regular Expression for [Target Language, e.g., JavaScript/Python] that matches:
[Describe pattern requirements, e.g., international phone numbers, slug format, semantic version strings]

Requirements:
- Edge cases to match: [Examples that must match]
- Edge cases to reject: [Examples that must NOT match]

Please provide:
1. The regex pattern with appropriate flags.
2. Step-by-step breakdown of each token and capture group.
3. Code example demonstrating validation and extracting captured groups.`,
    tags: ["regex", "pattern", "validation", "string"],
    placeholders: ["[Target Language, e.g., JavaScript/Python]", "[Describe pattern requirements]"],
    suggestedModel: "Claude 3.5 Sonnet / Groq",
  },
  {
    id: "code-9",
    categoryId: "coding",
    title: "Production Multi-Stage Dockerfile",
    description: "Write an optimized, secure multi-stage Dockerfile with minimal image size.",
    prompt: `Write a production-ready, multi-stage Dockerfile for a [Node.js / Next.js / Python FastAPI / Go] application.

Requirements:
- Minimal final image footprint using Alpine/Distroless.
- Efficient layer caching for package managers (pnpm / npm / pip).
- Non-root user execution for security.
- Proper handling of environment variables and health check.
- Accompanying \`.dockerignore\` file.`,
    tags: ["docker", "devops", "containers", "deployment"],
    placeholders: ["[Node.js / Next.js / Python FastAPI / Go]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-10",
    categoryId: "coding",
    title: "GitHub Actions CI/CD Pipeline",
    description: "Create an automated CI/CD workflow for linting, testing, and deployment.",
    prompt: `Create a GitHub Actions workflow (\`.github/workflows/ci-cd.yml\`) for a [Tech Stack, e.g. Next.js + TypeScript repo].

Pipeline stages:
1. Automated linting (ESLint, Prettier).
2. Type checking (\`tsc --noEmit\`).
3. Automated unit & integration tests.
4. Build artifact verification.
5. Deploy preview on pull requests and production on push to \`main\`.
6. Dependency caching for fast run times.`,
    tags: ["ci-cd", "github actions", "devops", "automation"],
    placeholders: ["[Tech Stack, e.g. Next.js + TypeScript repo]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-11",
    categoryId: "coding",
    title: "Security & Vulnerability Audit",
    description: "Inspect code for OWASP vulnerabilities (XSS, SQLi, CSRF, ReDoS, IDOR).",
    prompt: `Conduct a thorough security review of the following code snippet:

\`\`\`
[Paste code snippet here]
\`\`\`

Please identify:
1. Any security vulnerabilities (OWASP Top 10, XSS, injection, authentication flaws, unsafe deserialization).
2. Severity rating (Critical / High / Medium / Low) with risk rationale.
3. Concrete remediation code to patch each vulnerability.`,
    tags: ["security", "audit", "owasp", "vulnerability"],
    placeholders: ["[Paste code snippet here]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "code-12",
    categoryId: "coding",
    title: "Database Migration & Schema Evolution",
    description: "Plan zero-downtime database schema migrations for relational databases.",
    prompt: `I need to alter a production database table with over [Number] million rows.

Current Schema:
\`\`\`sql
[Paste current table schema]
\`\`\`

Required Change:
[Describe modification, e.g. renaming column, changing column type, splitting table, adding foreign key]

Provide:
1. A zero-downtime migration strategy using expand and contract pattern.
2. Step-by-step SQL migration scripts.
3. Rollback plan in case of issues.`,
    tags: ["database", "migration", "sql", "schema"],
    placeholders: ["[Number]", "[Paste current table schema]", "[Describe modification]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-13",
    categoryId: "coding",
    title: "State Management Architect (Zustand/Redux)",
    description: "Design scalable client state with selectors, actions, and persistence.",
    prompt: `Design a [Zustand / Redux Toolkit] store for managing [Feature, e.g. Shopping Cart & Checkout / Audio Player / Canvas Workspace].

Requirements:
- State interface with strong TypeScript types.
- Actions with optimistic updates and error handling.
- LocalStorage persistence middleware.
- Memoized selectors to avoid unnecessary component re-renders.
- Clean example of consuming the store in a React component.`,
    tags: ["react", "state management", "zustand", "redux"],
    placeholders: ["[Zustand / Redux Toolkit]", "[Feature, e.g. Shopping Cart & Checkout / Audio Player / Canvas Workspace]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-14",
    categoryId: "coding",
    title: "Algorithm Time & Space Complexity Analyzer",
    description: "Analyze Big-O complexity and optimize algorithms for latency and memory.",
    prompt: `Analyze the time and space complexity of this algorithm:

\`\`\`
[Paste algorithm code here]
\`\`\`

Provide:
1. Big-O Time Complexity (best, average, worst case) with detailed breakdown.
2. Big-O Space Complexity (call stack, auxiliary memory).
3. If suboptimal, provide an improved version that achieves better asymptotic complexity.`,
    tags: ["algorithms", "big-o", "complexity", "optimization"],
    placeholders: ["[Paste algorithm code here]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "code-15",
    categoryId: "coding",
    title: "Web Scraping & DOM Extraction Script",
    description: "Write resilient data scrapers with Puppeteer, Playwright, or Cheerio.",
    prompt: `Write a robust scraping script in [TypeScript / Python] using [Playwright / Puppeteer / BeautifulSoup / Cheerio] to extract data from [Target Website Type].

Target Data:
[List fields to extract: e.g., Title, Price, Rating, Image URL, Stock Status]

Requirements:
- Handle pagination or infinite scroll.
- Rate limiting and random delays to avoid IP blocks.
- Proper error handling and fallback when selectors are missing.
- Export results to structured JSON.`,
    tags: ["scraping", "playwright", "puppeteer", "automation"],
    placeholders: ["[TypeScript / Python]", "[Playwright / Puppeteer / BeautifulSoup / Cheerio]", "[Target Website Type]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-16",
    categoryId: "coding",
    title: "Tailwind CSS Component Styling & Polish",
    description: "Convert a UI concept into a responsive, accessible Tailwind CSS component.",
    prompt: `Build a modern, accessible [Component Name, e.g. Pricing Card / Notification Drawer / Multi-step Stepper] using Tailwind CSS and React.

Visual Style:
- Clean, modern aesthetic (subtle borders, refined gradients, soft shadows).
- Dark mode compatibility using \`dark:\` classes.
- Responsive layout (mobile-first).
- Focus states and keyboard accessibility (\`focus-visible:ring\`).
- Smooth transitions and hover states.`,
    tags: ["tailwind", "css", "ui", "react", "styling"],
    placeholders: ["[Component Name, e.g. Pricing Card / Notification Drawer / Multi-step Stepper]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "code-17",
    categoryId: "coding",
    title: "GraphQL Schema & Resolver Architect",
    description: "Design a GraphQL schema with queries, mutations, subscriptions, and dataloaders.",
    prompt: `Design a GraphQL schema and resolver structure for [Application / Domain].

Include:
1. SDL Type definitions with relationships and pagination.
2. Query and Mutation definitions with input types.
3. Node.js resolver implementation with DataLoader pattern to prevent N+1 query problems.
4. Authentication & authorization check strategy inside context.`,
    tags: ["graphql", "api", "backend", "dataloader"],
    placeholders: ["[Application / Domain]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-18",
    categoryId: "coding",
    title: "Microservices vs Monolith Tradeoff Analysis",
    description: "Evaluate architectural decisions based on team size, scale, and operational costs.",
    prompt: `Our team is evaluating whether to build [System / Project Name] as a Modular Monolith or Microservices.

Current Context:
- Team size: [e.g. 5 engineers]
- Expected scale: [e.g. 100k DAU]
- Deployment infrastructure: [e.g. AWS / Vercel / Kubernetes]

Provide:
1. Objective comparison across development speed, deployment complexity, debugging, and cost.
2. Clear recommendation with justification.
3. Migration path if starting with a Modular Monolith first.`,
    tags: ["architecture", "microservices", "system design", "scale"],
    placeholders: ["[System / Project Name]", "[e.g. 5 engineers]", "[e.g. 100k DAU]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-19",
    categoryId: "coding",
    title: "Redis Caching Strategy & Invalidation",
    description: "Architect high-speed caching layers with TTLs, cache stamps, and eviction policies.",
    prompt: `Design a Redis caching architecture for [Expensive Operation / API Endpoint].

Include:
1. Cache key naming convention.
2. Cache-Aside (Lazy loading) implementation in [Language].
3. Invalidation strategy on updates (Cache bust vs Write-through).
4. Prevention of Cache Stampede (Dog-piling) and Cache Penetration using locks or probabilistic early expiration.`,
    tags: ["redis", "caching", "performance", "backend"],
    placeholders: ["[Expensive Operation / API Endpoint]", "[Language]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-20",
    categoryId: "coding",
    title: "WebSockets & Real-Time Sync Engine",
    description: "Implement reliable real-time bidirectional communication with reconnection logic.",
    prompt: `Design a real-time event system in [TypeScript / Node.js] for [Feature: e.g. Collaborative Document Editing / Live Chat / Real-time Dashboard].

Requirements:
1. Server WebSocket setup with authentication handshake.
2. Client connection manager with exponential backoff reconnection.
3. Message framing schema and heartbeat (ping/pong) to detect dead sockets.
4. Room / Channel subscription pattern.`,
    tags: ["websockets", "realtime", "networking", "concurrency"],
    placeholders: ["[TypeScript / Node.js]", "[Feature: e.g. Collaborative Document Editing / Live Chat / Real-time Dashboard]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-21",
    categoryId: "coding",
    title: "Git Conflict & Rebasing Wizard",
    description: "Step-by-step guidance to resolve complex Git merge conflicts and interactive rebases.",
    prompt: `I have encountered a complex Git merge conflict during [git rebase / git merge].

Git status & conflict markers:
\`\`\`
[Paste git status and conflicted code section]
\`\`\`

Explain:
1. What changes each branch was attempting to make.
2. Step-by-step commands to resolve the conflict correctly.
3. How to verify the commit history and complete the rebase safely.`,
    tags: ["git", "version control", "conflict", "rebase"],
    placeholders: ["[git rebase / git merge]", "[Paste git status and conflicted code section]"],
    suggestedModel: "Claude 3.5 Sonnet / Groq",
  },
  {
    id: "code-22",
    categoryId: "coding",
    title: "Web Accessibility (a11y) Remediation",
    description: "Audit UI components for WCAG 2.1 AA compliance, ARIA attributes, and keyboard navigation.",
    prompt: `Audit this UI component for WCAG 2.1 AA accessibility compliance:

\`\`\`html
[Paste HTML / JSX here]
\`\`\`

Identify:
1. Missing ARIA roles, labels, and states.
2. Keyboard navigation issues (focus trap, tab order, Enter/Space/Escape support).
3. Screen reader announcements.
4. Provide the fully compliant, accessible code replacement.`,
    tags: ["a11y", "accessibility", "wcag", "aria", "html"],
    placeholders: ["[Paste HTML / JSX here]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-23",
    categoryId: "coding",
    title: "Python AsyncIO & Concurrency Worker",
    description: "Write high-throughput asynchronous Python code with task queues and semaphore limits.",
    prompt: `Write a high-performance asynchronous Python script to process [Task, e.g. Fetching 10,000 URLs / Processing Image Batches].

Requirements:
- Use \`asyncio\` and \`aiohttp\` or \`httpx\`.
- Implement an \`asyncio.Semaphore\` to limit concurrency to [N] simultaneous tasks.
- Include retry logic with exponential backoff on network failures.
- Show a progress bar using \`tqdm.asyncio\`.
- Write clean error logging.`,
    tags: ["python", "asyncio", "concurrency", "performance"],
    placeholders: ["[Task, e.g. Fetching 10,000 URLs / Processing Image Batches]", "[N]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "code-24",
    categoryId: "coding",
    title: "Database Indexing & Explain Analyze",
    description: "Decode Postgres or MySQL EXPLAIN ANALYZE output to eliminate sequential scans.",
    prompt: `Help me understand this database execution plan:

\`\`\`
[Paste EXPLAIN (ANALYZE, BUFFERS) output here]
\`\`\`

Explain:
1. Which operations are consuming the most execution time and memory?
2. Are there sequential scans on large tables or memory spills to disk?
3. Exact indexing strategy to make this query run in sub-10 milliseconds.`,
    tags: ["sql", "postgres", "performance", "explain analyze"],
    placeholders: ["[Paste EXPLAIN (ANALYZE, BUFFERS) output here]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "code-25",
    categoryId: "coding",
    title: "Secure Authentication & JWT Refresh Tokens",
    description: "Implement secure auth flows with HttpOnly cookies, CSRF protection, and token rotation.",
    prompt: `Architect a secure authentication system in [Node.js/Next.js/FastAPI] using JWTs.

Architecture details:
1. Short-lived Access Token (15 mins) + Long-lived Refresh Token (7 days).
2. Storing tokens in \`HttpOnly\`, \`SameSite=Lax\`, \`Secure\` cookies.
3. Refresh token rotation with reuse detection (invalidating all sessions if a used refresh token is presented).
4. Logout endpoint that invalidates both client cookies and server blacklist.`,
    tags: ["auth", "jwt", "security", "tokens", "cookies"],
    placeholders: ["[Node.js/Next.js/FastAPI]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },

  // ==========================================
  // 2. WRITING & CONTENT CREATION (25)
  // ==========================================
  {
    id: "write-1",
    categoryId: "writing",
    title: "High-Converting Landing Page Copy",
    description: "Write persuasive hero, value propositions, feature grids, and CTAs for a SaaS product.",
    prompt: `Write comprehensive landing page copy for [Product Name]: [Brief Description].

Target Audience: [Describe target customer and pain point]

Include:
1. Hero Section: Catchy H1, sub-headline, primary CTA button, and social proof trust badge.
2. The Problem: Agitate the core frustration the customer faces today.
3. The Solution: 3 core value propositions with benefit-driven headings and 2-sentence descriptions.
4. Feature Breakdown: 4 distinct features with bullet points emphasizing outcomes, not just specs.
5. Overcoming Objections: 3 common hesitations addressed concisely.
6. Final CTA Section with urgent, compelling call to action.`,
    tags: ["copywriting", "landing page", "saas", "marketing"],
    placeholders: ["[Product Name]", "[Brief Description]", "[Describe target customer and pain point]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-2",
    categoryId: "writing",
    title: "Viral LinkedIn Thought Leadership Post",
    description: "Craft an engaging, high-reach LinkedIn post with hook, narrative, and actionable takeaway.",
    prompt: `Write a compelling LinkedIn post about [Topic / Experience, e.g., Leaving big tech to build a bootstrapped startup].

Tone: Authentic, insightful, conversational, avoiding cringey influencer clichés.

Structure:
- Line 1-2: A curiosity-inducing hook that makes readers click "see more".
- The Story: A real dilemma, turning point, or counter-intuitive lesson.
- The Insight: 3-4 bullet points containing concrete, actionable advice.
- The Takeaway: A memorable concluding thought and an open question to stimulate comments.`,
    tags: ["linkedin", "social media", "writing", "personal brand"],
    placeholders: ["[Topic / Experience, e.g., Leaving big tech to build a bootstrapped startup]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-3",
    categoryId: "writing",
    title: "SEO Pillar Blog Post Outline & Draft",
    description: "Create an in-depth, rankable 2,000-word SEO article outline with keyword placement.",
    prompt: `Create an exhaustive, high-ranking SEO blog post outline for:
Target Keyword: [Primary Keyword]
Secondary Keywords: [List 3-5 related keywords]
Search Intent: [Informational / Commercial / Transactional]

Provide:
1. SEO Meta Title (under 60 chars) and Meta Description (under 155 chars).
2. H1, H2, and H3 header hierarchy that matches search intent better than top-ranking competitors.
3. Key points, data references, and internal linking suggestions under each section.
4. FAQ section answering People Also Ask queries.`,
    tags: ["seo", "blogging", "content marketing", "articles"],
    placeholders: ["[Primary Keyword]", "[List 3-5 related keywords]", "[Informational / Commercial / Transactional]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "write-4",
    categoryId: "writing",
    title: "Executive Summary for Decision Makers",
    description: "Condense complex reports, proposals, or research into a crisp 1-page executive brief.",
    prompt: `Condense the following complex document into a 1-page Executive Summary for senior leadership:

Document:
"""
[Paste text or report here]
"""

Structure:
1. Context & Business Problem (2 sentences).
2. Key Findings & Data Highlights (3-4 bullet points).
3. Strategic Recommendations with Expected ROI.
4. Immediate Next Steps and Required Decisions.`,
    tags: ["executive", "summary", "business", "briefing"],
    placeholders: ["[Paste text or report here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-5",
    categoryId: "writing",
    title: "Engaging Weekly Email Newsletter",
    description: "Draft a subscriber newsletter with a catchy subject line, main story, and curated links.",
    prompt: `Write an engaging newsletter issue for [Newsletter Name/Niche].

Theme of the Week: [Theme / Big News / Personal Learning]

Include:
- 3 Subject Line options (Curiosity-driven, Direct, Number-based).
- Personal intro paragraph with an authentic hook.
- Deep dive essay (300-400 words) breaking down the theme with clear lessons.
- "3 Things Worth Reading This Week" section with quick summaries.
- One thought-provoking closing question.`,
    tags: ["newsletter", "email", "writing", "audience"],
    placeholders: ["[Newsletter Name/Niche]", "[Theme / Big News / Personal Learning]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-6",
    categoryId: "writing",
    title: "Technical Documentation & API Guide",
    description: "Write developer-friendly documentation for a library, API, or system component.",
    prompt: `Write developer documentation for [Library / API / Module Name].

Details:
[Describe what the module does, its parameters, and return types]

Format:
1. Quick Overview (1 paragraph on what it solves).
2. Installation & Prerequisites.
3. Quickstart Code Example (copy-pasteable in 30 seconds).
4. Detailed Parameter Reference table (Parameter, Type, Required?, Description).
5. Common Errors & Troubleshooting tips.`,
    tags: ["documentation", "api", "technical writing", "developers"],
    placeholders: ["[Library / API / Module Name]", "[Describe what the module does, its parameters, and return types]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-7",
    categoryId: "writing",
    title: "High-Response Cold Outreach Email",
    description: "Write personalized B2B cold emails that get replies without sounding spammy.",
    prompt: `Write a cold email to [Prospect Title, e.g. VP of Engineering] at [Company Type].

My Product/Service: [Briefly describe what you offer]
Specific Pain Point: [The exact problem they face]
Proof / Metric: [e.g. helped similar company cut AWS bills by 34%]

Rules:
- Under 125 words.
- No buzzwords like "hope this email finds you well" or "synergy".
- Low-friction Call to Action (e.g. asking for feedback or open to a 2-sentence reply, not a 30-minute demo).
- 2 Follow-up email sequences (3 days later, 7 days later).`,
    tags: ["sales", "cold email", "outreach", "b2b"],
    placeholders: ["[Prospect Title, e.g. VP of Engineering]", "[Company Type]", "[Briefly describe what you offer]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-8",
    categoryId: "writing",
    title: "Product Launch Press Release",
    description: "Draft a formal newsworthy press release following standard AP style.",
    prompt: `Write a press release announcing [Company/Product Name]'s launch of [New Feature / Product].

Key Information:
- Location & Date: [City, Date]
- The News: [What is being launched]
- Why it matters: [Industry impact or customer problem solved]
- Quote from Founder/CEO: [Key perspective]
- Availability & Pricing: [When and how to get it]

Follow standard AP Press Release structure with compelling headline, dateline, and boilerplate.`,
    tags: ["press release", "pr", "marketing", "launch"],
    placeholders: ["[Company/Product Name]", "[New Feature / Product]", "[City, Date]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-9",
    categoryId: "writing",
    title: "Compelling Narrative Story Hook",
    description: "Write gripping opening paragraphs for a novel, article, or video script.",
    prompt: `Write 3 different opening hooks for a story about:
Premise: [Describe setting, protagonist, and primary conflict]

Style 1: In Media Res (dropped right into the climax of action).
Style 2: Atmospheric & Sensory (building tension through vivid environmental detail).
Style 3: Philosophical & Intriguing (a provocative line that re-frames how the reader sees the world).`,
    tags: ["storytelling", "fiction", "creative writing", "hooks"],
    placeholders: ["[Describe setting, protagonist, and primary conflict]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-10",
    categoryId: "writing",
    title: "Tone & Voice Rewriter",
    description: "Transform existing writing into different tones (Academic, Casual, Witty, Executive).",
    prompt: `Rewrite the following text into 3 distinct tones:

Original Text:
"""
[Paste text here]
"""

Versions to produce:
1. Executive & Authoritative (Crisp, confident, data-driven, decisive).
2. Casual & Relatable (Conversational, warm, friendly, like talking to a smart friend over coffee).
3. Punchy & Provocative (Short sentences, bold claims, engaging rhythm, memorable).`,
    tags: ["rewrite", "tone", "copywriting", "editing"],
    placeholders: ["[Paste text here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-11",
    categoryId: "writing",
    title: "YouTube Video Script with Retention Hooks",
    description: "Write a high-retention YouTube video script with visual cues and cliffhangers.",
    prompt: `Write an 8-minute YouTube video script on [Topic].

Target Audience: [Who is watching and what do they want to learn?]

Structure:
- 0:00 - 0:30 Hook: Tease the biggest payoff, eliminate fluff, state the promise.
- Visual Cue & Audio Cue directions throughout [in brackets].
- 3 Core chapters with progressive escalation of value.
- Re-hook every 90 seconds to prevent viewer drop-off.
- Smooth CTA transition into subscribing or watching the next video.`,
    tags: ["youtube", "video script", "retention", "content"],
    placeholders: ["[Topic]", "[Who is watching and what do they want to learn?]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-12",
    categoryId: "writing",
    title: "Product Hunt Launch Day Manifesto",
    description: "Write the Maker comment, tagline, and promotional copy for a Product Hunt launch.",
    prompt: `Prepare launch copy for Product Hunt for [Product Name].

Product Description: [What it does and who it's for]
Origin Story: [Why did you build it?]

Provide:
1. Catchy Tagline (under 60 characters).
2. First Maker Comment (genuine, humble, explaining the backstory, tech stack, and special discount/offer for hunters).
3. 3 Key GIF/Screenshot caption ideas.
4. Promotional tweet/X post announcing the launch.`,
    tags: ["product hunt", "launch", "startup", "marketing"],
    placeholders: ["[Product Name]", "[What it does and who it's for]", "[Why did you build it?]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-13",
    categoryId: "writing",
    title: "Detailed Case Study with Metrics",
    description: "Transform a customer success story into a compelling Challenge-Solution-Results case study.",
    prompt: `Write a B2B Case Study based on this customer win:

Client: [Client Name & Industry]
The Challenge: [What bottleneck or issue did they have?]
The Solution: [How did they implement our product/service?]
The Results: [Specific metrics, e.g. 45% time saved, $120k revenue increased]

Format:
- Compelling metric-led headline.
- Company Overview.
- The Obstacle: Why their previous methods failed.
- The Implementation: How easy/fast adoption was.
- The Measurable Impact: Bullet points with bold numbers.
- Pull Quote from client champion.`,
    tags: ["case study", "b2b", "social proof", "sales"],
    placeholders: ["[Client Name & Industry]", "[What bottleneck or issue did they have?]", "[Specific metrics]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-14",
    categoryId: "writing",
    title: "Professional Proofreading & Clarity Polish",
    description: "Polish rough writing, eliminating passive voice, wordiness, and awkward phrasing.",
    prompt: `Proofread and polish the following draft:

"""
[Paste text here]
"""

Tasks:
1. Fix all grammatical, punctuation, and spelling errors.
2. Eliminate passive voice, tautologies, and redundant words.
3. Improve sentence flow and rhythm.
4. Show a "Changes Made & Why" breakdown followed by the clean, final version.`,
    tags: ["proofreading", "grammar", "editing", "clarity"],
    placeholders: ["[Paste text here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-15",
    categoryId: "writing",
    title: "Podcast Interview Question Generator",
    description: "Generate deep, non-obvious interview questions that unlock fascinating stories.",
    prompt: `Generate 12 insightful interview questions for a podcast guest:

Guest Name & Background: [Name, title, notable achievements]
Topic of Discussion: [Core subject]

Requirements:
- Avoid generic questions they have answered 100 times before.
- Group questions into:
  1. Origin & Counter-Intuitive Lessons.
  2. The Tough Decisions & Failures.
  3. Tactical Playbooks & Predictions.
- Include follow-up probes for each question.`,
    tags: ["podcast", "interview", "questions", "media"],
    placeholders: ["[Name, title, notable achievements]", "[Core subject]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-16",
    categoryId: "writing",
    title: "Terms of Service & Privacy Policy Explainer",
    description: "Translate dense legal contracts into plain English with highlighted risks.",
    prompt: `Translate this legal agreement or privacy policy section into simple, plain English:

"""
[Paste legal clause here]
"""

Provide:
1. Plain English translation in bullet points.
2. What rights the user is giving up.
3. What data is collected and how it is shared.
4. Any unusual or potentially concerning stipulations to be aware of.`,
    tags: ["legal", "privacy", "plain english", "analysis"],
    placeholders: ["[Paste legal clause here]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "write-17",
    categoryId: "writing",
    title: "Engaging FAQ Section Builder",
    description: "Write clear, reassuring answers to difficult customer questions and objections.",
    prompt: `Write 8 comprehensive FAQs for [Product/Service Name].

Audience: [Target Audience]
Key Objections/Doubts: [e.g. pricing, data security, cancellation, learning curve]

Guidelines:
- Questions must be phrased exactly as a customer thinks ("Can I cancel anytime?" rather than "Cancellation policies").
- Answers should be concise, reassuring, and eliminate friction without evasive language.`,
    tags: ["faq", "customer service", "copywriting", "conversion"],
    placeholders: ["[Product/Service Name]", "[Target Audience]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-18",
    categoryId: "writing",
    title: "Microcopy & UX Writing Polish",
    description: "Write intuitive button labels, empty states, error messages, and tooltips.",
    prompt: `Write delightful, user-friendly UX microcopy for [Screen or Flow, e.g. Payment Failed Screen / Onboarding Checklist / Delete Account Confirmation]:

For each element provide 2 options (Option A: Clear & Direct, Option B: Friendly & Brand-aligned):
1. Modal Title.
2. Explanatory Body Copy.
3. Primary Action Button.
4. Secondary / Cancel Action Button.
5. In-line Error Validation Message.`,
    tags: ["ux writing", "microcopy", "design", "product"],
    placeholders: ["[Screen or Flow, e.g. Payment Failed Screen / Onboarding Checklist / Delete Account Confirmation]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-19",
    categoryId: "writing",
    title: "High-Engagement Twitter/X Thread",
    description: "Structure a 7-tweet educational thread optimized for retweets and bookmarks.",
    prompt: `Write a high-engagement 7-tweet thread on [Topic / Skill].

Thread Architecture:
- Tweet 1: Hook tweet with bold claim, high curiosity, and proof of why the reader should care.
- Tweet 2-6: Step-by-step breakdown (one core insight per tweet with formatting and spacing for fast scanning).
- Tweet 7: Summary + Call to Action (Follow, Retweet, link to newsletter or product).`,
    tags: ["twitter", "x", "thread", "social media"],
    placeholders: ["[Topic / Skill]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-20",
    categoryId: "writing",
    title: "Keynote / Presentation Script",
    description: "Write an inspiring 10-minute conference presentation talk with slide cues.",
    prompt: `Write a 10-minute keynote presentation script on [Topic].

Target Audience: [Describe attendees]
Core Takeaway: [The one idea you want them to remember]

Format:
- Slide 1-8 outlines with visual description for the slide.
- Spoken words for the speaker with natural pauses and emphasis markers.
- Opening hook and memorable closing story.`,
    tags: ["presentation", "public speaking", "keynote", "speech"],
    placeholders: ["[Topic]", "[Describe attendees]", "[The one idea you want them to remember]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-21",
    categoryId: "writing",
    title: "Internal Company Announcement Memo",
    description: "Communicate company updates, policy changes, or milestones clearly to staff.",
    prompt: `Draft an internal company announcement from leadership regarding [Subject: e.g. New Remote Work Policy / Company Reorganization / Milestone Celebration].

Tone: Transparent, inspiring, respectful, and clear.

Include:
1. Direct statement of the news upfront (no burying the lede).
2. The strategic reasoning behind this decision.
3. What changes immediately vs what stays the same.
4. FAQ section addressing employee top-of-mind concerns.
5. Office hours or channel to ask questions.`,
    tags: ["internal communications", "management", "leadership", "memo"],
    placeholders: ["[Subject: e.g. New Remote Work Policy / Company Reorganization / Milestone Celebration]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "write-22",
    categoryId: "writing",
    title: "Crisis Communications Response",
    description: "Draft a calm, responsible public statement addressing an outage, error, or incident.",
    prompt: `Draft a public incident communication statement regarding [Incident: e.g. 4-hour system outage / billing error / security vulnerability patched].

Company: [Company Name]
Root cause: [Brief explanation]
Current status: [Resolved / Ongoing]

Include:
1. Sincere, accountable apology without excuses.
2. Transparent chronological summary of what happened.
3. Immediate remediation taken.
4. Concrete technical steps implemented to guarantee it will never happen again.`,
    tags: ["crisis", "pr", "incident response", "trust"],
    placeholders: ["[Incident: e.g. 4-hour system outage / billing error / security vulnerability patched]", "[Company Name]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-23",
    categoryId: "writing",
    title: "Customer Support Resolution Playbook",
    description: "Write empathetic, de-escalating customer support replies for upset clients.",
    prompt: `Write 3 tiered support response templates for an angry customer experiencing [Customer Issue: e.g. missing order / charged twice / feature broke during client presentation].

Template 1: Immediate acknowledgement & urgent escalation.
Template 2: Complete resolution with refund / compensation and reassurance.
Template 3: Firm but polite boundary setting when an unreasonable demand cannot be met.`,
    tags: ["customer support", "de-escalation", "email", "service"],
    placeholders: ["[Customer Issue: e.g. missing order / charged twice / feature broke during client presentation]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-24",
    categoryId: "writing",
    title: "Job Description with Diversity & Clarity",
    description: "Write an inspiring, unbiased job posting that attracts high-performing candidates.",
    prompt: `Write an enticing, modern job description for a [Job Title, e.g. Senior Full-Stack Engineer / Growth Marketing Lead] at [Company Name].

Include:
1. The Mission: Why this role matters to our vision.
2. What you'll achieve in your first 90 days.
3. Core responsibilities (outcome-focused, not a laundry list of chores).
4. Requirements (focused on capabilities rather than arbitrary years of experience).
5. Transparent compensation range and benefits.`,
    tags: ["hiring", "recruiting", "job description", "talent"],
    placeholders: ["[Job Title, e.g. Senior Full-Stack Engineer / Growth Marketing Lead]", "[Company Name]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "write-25",
    categoryId: "writing",
    title: "Personal Bio & Speaker One-Sheet",
    description: "Craft professional bios across 3 lengths (Micro, Short, Long) for talks and sites.",
    prompt: `Write 3 professional bio variations for [Your Name]:

Background:
- Current Title / Company: [Title & Company]
- Key Career Accomplishments: [List 2-3 highlights, metrics, or notable companies]
- Passion / Niche: [What are you known for?]

Generate:
1. Micro Bio (under 160 characters for Twitter/LinkedIn taglines).
2. Short Bio (50-75 words for conference speaker introductions).
3. Full Bio (150-200 words for company about page or press kit).`,
    tags: ["bio", "personal brand", "speaking", "profile"],
    placeholders: ["[Your Name]", "[Title & Company]", "[List 2-3 highlights]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },

  // ==========================================
  // 3. BUSINESS & STRATEGY (20)
  // ==========================================
  {
    id: "biz-1",
    categoryId: "business",
    title: "Complete Business Model Canvas",
    description: "Map all 9 building blocks of a business idea from customer segments to cost structures.",
    prompt: `Construct a comprehensive Business Model Canvas for [Business Idea / Startup Concept].

Detail each of the 9 building blocks:
1. Customer Segments (Target archetypes, early adopters).
2. Value Propositions (Unfair advantages, pain relievers, gain creators).
3. Channels (Acquisition, distribution, sales).
4. Customer Relationships (Self-service, community, dedicated support).
5. Revenue Streams (Pricing model, recurring vs one-time, expansion revenue).
6. Key Resources (IP, tech, human capital).
7. Key Activities (Product development, marketing, operations).
8. Key Partnerships (Suppliers, API providers, strategic alliances).
9. Cost Structure (Fixed vs variable, biggest cost drivers).`,
    tags: ["business model", "startup", "strategy", "canvas"],
    placeholders: ["[Business Idea / Startup Concept]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "biz-2",
    categoryId: "business",
    title: "In-Depth Competitor Teardown & Moat Analysis",
    description: "Analyze direct competitors, feature gaps, pricing strategies, and defensive moats.",
    prompt: `Perform a competitive teardown for my product in the [Industry / Niche] space.

Our Product: [Brief description]
Top 3 Competitors: [Competitor A, Competitor B, Competitor C]

Provide:
1. Feature Matrix (Strengths & weaknesses comparison).
2. Pricing Model breakdown.
3. Competitor Vulnerabilities: Where are their customers frustrated?
4. Defensive Moats: How we can build sustainable differentiation (network effects, switching costs, brand).`,
    tags: ["competitors", "strategy", "market research", "moats"],
    placeholders: ["[Industry / Niche]", "[Brief description]", "[Competitor A, Competitor B, Competitor C]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "biz-3",
    categoryId: "business",
    title: "SaaS Pricing Tier Strategy & Packaging",
    description: "Design multi-tier pricing plans that maximize Average Revenue Per User (ARPU).",
    prompt: `Design a 3-tier SaaS pricing model for [Product Description].

Target Segments: [Solo / Small Teams / Enterprise]

Deliverables:
1. Plan Names (e.g. Starter, Pro, Enterprise) with monthly/annual pricing suggestions.
2. Value Metric to charge on (seats, usage, credits, storage).
3. Feature allocation matrix (which features belong in which tier to incentivize upgrades).
4. Add-on opportunities for expansion revenue.`,
    tags: ["pricing", "saas", "monetization", "revenue"],
    placeholders: ["[Product Description]", "[Solo / Small Teams / Enterprise]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "biz-4",
    categoryId: "business",
    title: "10-Slide Investor Pitch Deck Outline",
    description: "Structure a venture-backed seed/Series A pitch deck that hooks investors.",
    prompt: `Create a 10-slide investor pitch deck outline for [Startup Name].

Startup Overview: [Problem, Solution, Traction, Market]

Detail for each slide:
- Slide 1: Problem & Hook.
- Slide 2: The Solution & Demo moments.
- Slide 3: Market Size (TAM, SAM, SOM).
- Slide 4: Business Model & Unit Economics.
- Slide 5: Proprietary Technology & Unfair Advantage.
- Slide 6: Traction & Milestones reached.
- Slide 7: Competitive Landscape.
- Slide 8: Go-To-Market strategy.
- Slide 9: Team credentials.
- Slide 10: The Ask (Funding amount and planned allocation).`,
    tags: ["pitch deck", "fundraising", "venture capital", "investors"],
    placeholders: ["[Startup Name]", "[Problem, Solution, Traction, Market]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "biz-5",
    categoryId: "business",
    title: "Rigorous SWOT & Risk Analysis",
    description: "Identify internal Strengths/Weaknesses and external Opportunities/Threats with mitigations.",
    prompt: `Conduct a rigorous SWOT analysis for [Company / Project Name].

Context: [Describe current status, team, market environment]

For each quadrant:
- Strengths: What distinct internal capabilities do we possess?
- Weaknesses: Where are we resource-constrained or vulnerable?
- Opportunities: Emerging trends, regulatory shifts, or untapped segments.
- Threats: Macro risks, aggressive competitors, tech disruptions.

Provide an Action Matrix:
- SO Strategies (Use strengths to capture opportunities).
- WT Strategies (Defensive actions to prevent weaknesses from succumbing to threats).`,
    tags: ["swot", "strategy", "risk", "management"],
    placeholders: ["[Company / Project Name]", "[Describe current status, team, market environment]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-6",
    categoryId: "business",
    title: "Unit Economics & LTV/CAC Calculator Blueprint",
    description: "Model Customer Lifetime Value, Customer Acquisition Cost, and payback periods.",
    prompt: `Help me model the unit economics for a [Business Type, e.g. B2B SaaS / D2C E-commerce].

Assumptions:
- Average Order / Subscription Value: $[X] / month
- Gross Margin: [X]%
- Monthly Churn Rate: [X]%
- Blended CAC: $[X]

Calculate:
1. Customer Lifetime Value (LTV).
2. LTV : CAC Ratio.
3. Months to recover CAC (Payback Period).
4. Sensitivity Analysis: Which single metric improvement yields the highest profitability gain?`,
    tags: ["finance", "unit economics", "ltv", "cac", "metrics"],
    placeholders: ["[Business Type, e.g. B2B SaaS / D2C E-commerce]", "$[X]", "[X]%", "[X]%"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "biz-7",
    categoryId: "business",
    title: "Go-To-Market (GTM) 90-Day Execution Plan",
    description: "Create a week-by-week timeline for launching a product and acquiring the first 100 customers.",
    prompt: `Create a tactical 90-day Go-To-Market plan to get our first [100 / 1,000] customers for [Product Name].

Target Customer: [Describe ICP]
Budget: [e.g. Bootstrapped / $5,000 / $50,000]

Break down into:
- Days 1-30 (Foundation): Landing page, beta outreach, positioning, analytics tracking.
- Days 31-60 (Soft Launch): Community seeding, direct founder outreach, feedback loop.
- Days 61-90 (Public Launch & Scaling): Distribution channels, partnerships, referral mechanics.`,
    tags: ["gtm", "go-to-market", "growth", "launch"],
    placeholders: ["[100 / 1,000]", "[Product Name]", "[Describe ICP]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "biz-8",
    categoryId: "business",
    title: "Quarterly OKR Framework Planner",
    description: "Set ambitious Objectives and quantifiable Key Results for teams and startups.",
    prompt: `Develop a quarterly OKR (Objectives and Key Results) plan for [Company / Team Department] for Q[Quarter].

Strategic Focus: [e.g. Product-Market Fit / Enterprise Expansion / Operational Efficiency]

Create 3 core Objectives:
For each Objective:
- Objective statement (Inspirational, qualitative, directional).
- 3 measurable Key Results (Quantifiable metric from baseline X to target Y).
- 2 key initiative projects required to move the needle.`,
    tags: ["okr", "management", "goals", "planning"],
    placeholders: ["[Company / Team Department]", "Q[Quarter]", "[e.g. Product-Market Fit / Enterprise Expansion]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-9",
    categoryId: "business",
    title: "Customer Churn Reduction Playbook",
    description: "Diagnose churn reasons and implement retention workflows, re-engagement emails & NPS loops.",
    prompt: `Our [B2B / B2C] product is experiencing a monthly churn rate of [X]%.

Primary reasons given in exit surveys:
[List feedback, e.g. too expensive, missing feature X, lack of onboarding]

Develop a 4-pronged Retention Strategy:
1. Onboarding improvements to accelerate "Time to First Value".
2. In-app activation triggers and milestone celebrations.
3. Automated win-back campaigns and discount pause workflows.
4. Customer Success health-scoring model to intervene before churn occurs.`,
    tags: ["churn", "retention", "customer success", "saas"],
    placeholders: ["[B2B / B2C]", "[X]%", "[List feedback]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-10",
    categoryId: "business",
    title: "Enterprise Sales Negotiation Strategy",
    description: "Navigate procurement, deal terms, discount requests, and multi-stakeholder objections.",
    prompt: `I am negotiating an enterprise contract with a prospect:

Deal Size: $[Amount] / year
Their Procurement Request: [e.g. Asking for 40% discount, Net-90 payment terms, and custom SLA]
Our Position: [Our standard pricing and limits]

Help me formulate:
1. Strategic response that holds price integrity by trading value instead of giving arbitrary discounts.
2. Give-Get Matrix (if we concede X, we must ask for Y like 2-year upfront commitment or case study rights).
3. Email draft to send to the executive sponsor.`,
    tags: ["sales", "negotiation", "enterprise", "deals"],
    placeholders: ["$[Amount]", "[e.g. Asking for 40% discount, Net-90 payment terms]", "[Our standard pricing and limits]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-11",
    categoryId: "business",
    title: "Value Proposition Refinement (First Principles)",
    description: "Distill the exact value proposition into a punchy, undeniable positioning statement.",
    prompt: `Refine the core value proposition for [Product Name]:

What it does: [Description]
Who it's for: [Target Audience]
Alternative solutions they use today: [Competitors / Excel / Manual labor]

Generate:
1. The "Only" Statement: We are the only [Category] that [Unique Capability] for [Target Audience].
2. High-Concept Pitch (e.g. "Stripe for Climate" or "Figma for Audio").
3. Before/After Emotional Transformation grid.`,
    tags: ["value proposition", "positioning", "branding", "strategy"],
    placeholders: ["[Product Name]", "[Description]", "[Target Audience]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "biz-12",
    categoryId: "business",
    title: "Market Sizing: TAM, SAM, SOM Calculation",
    description: "Calculate Total Addressable Market using Top-Down and Bottom-Up methodologies.",
    prompt: `Help me calculate the TAM, SAM, and SOM for [Product/Market Description].

Target Market: [Geography, demographic, company size]
Expected Average Selling Price (ASP): $[Price] / year

Provide:
1. Top-Down calculation based on industry reports and global metrics.
2. Bottom-Up calculation based on total potential customer accounts × ASP.
3. Sensible SOM estimate assuming realistic 3-year market penetration.
4. Key assumptions and validation sources to check.`,
    tags: ["tam", "market sizing", "investors", "finance"],
    placeholders: ["[Product/Market Description]", "[Geography, demographic, company size]", "$[Price]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "biz-13",
    categoryId: "business",
    title: "Supplier & Vendor RFP (Request for Proposal)",
    description: "Write an exhaustive RFP to source software development, marketing, or logistics vendors.",
    prompt: `Write a Request for Proposal (RFP) for [Vendor Project: e.g. Mobile App Redesign / Cloud Migration / Legal Audit].

Include:
1. Project Background and Business Objectives.
2. Scope of Work (Detailed deliverables and technical requirements).
3. Vendor Qualification Criteria.
4. Submission Guidelines, Budget Ranges, and Project Deadlines.
5. Evaluation Rubric & Scoring weightings.`,
    tags: ["rfp", "procurement", "vendors", "contracts"],
    placeholders: ["[Vendor Project: e.g. Mobile App Redesign / Cloud Migration / Legal Audit]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-14",
    categoryId: "business",
    title: "Strategic Advisory Board Engagement",
    description: "Structure advisory agreements, advisor equity compensation, and quarterly mandates.",
    prompt: `I want to recruit an industry advisor for my startup:

Advisor Profile: [e.g. Former CMO of public SaaS company]
Our Startup Stage: [e.g. Pre-Seed / Seed]

Help me structure:
1. Standard advisor equity grant (using FAST agreement standards, vesting over 1-2 years).
2. The specific advisory mandate and expected time commitment (e.g. monthly strategy call, 2 warm intro emails).
3. Pitch email to invite them to join the advisory board.`,
    tags: ["advisors", "equity", "startups", "governance"],
    placeholders: ["[e.g. Former CMO of public SaaS company]", "[e.g. Pre-Seed / Seed]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-15",
    categoryId: "business",
    title: "Bootstrapped vs VC Funding Decision Matrix",
    description: "Evaluate the strategic pros and cons of raising venture capital vs staying bootstrapped.",
    prompt: `Analyze whether our business should raise Venture Capital or remain Bootstrapped:

Company Profile:
- Current Monthly Revenue: $[MRR]
- Monthly Growth Rate: [X]%
- Market Dynamics: [Fast-moving winner-take-all vs Steady niche]
- Founder Preferences: [Lifestyle control vs Hyper-growth scale]

Deliver a structured decision matrix evaluating dilution, control, burn rate, valuation, and exit scenarios.`,
    tags: ["fundraising", "venture capital", "bootstrapping", "founders"],
    placeholders: ["$[MRR]", "[X]%", "[Fast-moving winner-take-all vs Steady niche]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-16",
    categoryId: "business",
    title: "Post-Mortem Project Review Framework",
    description: "Conduct a blameless post-mortem analysis for a failed launch or major business setback.",
    prompt: `Facilitate a blameless post-mortem analysis for [Failed Initiative: e.g. Failed Product Launch / Missed Sales Target / Major Vendor Collapse].

Include:
1. Objective Timeline of Events.
2. 5 Whys Analysis identifying the root organizational or procedural failure.
3. What went well despite the setback.
4. Corrective Action Items with assigned owners and review dates.`,
    tags: ["post-mortem", "management", "operations", "lessons learned"],
    placeholders: ["[Failed Initiative: e.g. Failed Product Launch / Missed Sales Target / Major Vendor Collapse]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-17",
    categoryId: "business",
    title: "Franchise / Expansion Feasibility Study",
    description: "Evaluate opening a new physical location, regional branch, or international market.",
    prompt: `Create a feasibility study outline for expanding [Business Concept] into [Target City / Country].

Evaluate:
1. Demographic and economic demand indicators.
2. Local competition and regulatory/licensing hurdles.
3. Initial Capital Expenditure (CapEx) and Ongoing OpEx.
4. Estimated Break-even timeframe and payback period.`,
    tags: ["expansion", "feasibility", "retail", "business"],
    placeholders: ["[Business Concept]", "[Target City / Country]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-18",
    categoryId: "business",
    title: "Merger & Acquisition (M&A) Due Diligence Checklist",
    description: "Comprehensive due diligence audit list covering legal, tech, financial, and customer data.",
    prompt: `Generate a comprehensive Due Diligence checklist for acquiring a [Tech / E-commerce / Service] company valued around $[Amount].

Cover 5 critical pillars:
1. Financial Diligence (P&L accuracy, revenue quality, tax compliance).
2. Legal & IP Diligence (Trademark ownership, open-source licenses, pending litigation).
3. Technical Architecture (Technical debt, security audits, infrastructure dependencies).
4. Customer & Contractual Diligence (Customer concentration, churn rates).
5. Team & HR Diligence (Key employee retention, non-competes).`,
    tags: ["m&a", "due diligence", "acquisitions", "finance"],
    placeholders: ["[Tech / E-commerce / Service]", "$[Amount]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-19",
    categoryId: "business",
    title: "Brand Licensing & Royalty Partnership Agreement",
    description: "Structure a win-win brand licensing deal with royalty rates and territorial protections.",
    prompt: `Outline a brand licensing term sheet for [Licensor Brand] to license [IP / Content / Trademark] to [Licensee Partner].

Include:
1. Grant of Rights and Territorial Exclusivity.
2. Royalty Structure (Advance payment, minimum guarantee, percentage of net sales).
3. Quality Control and Brand Guideline approvals.
4. Audit rights and termination triggers.`,
    tags: ["licensing", "royalties", "partnerships", "contracts"],
    placeholders: ["[Licensor Brand]", "[IP / Content / Trademark]", "[Licensee Partner]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "biz-20",
    categoryId: "business",
    title: "SaaS Expansion Revenue Strategy",
    description: "Design cross-sells, up-sells, seat expansion, and usage add-ons to achieve >110% NDR.",
    prompt: `Help me increase our Net Dollar Retention (NDR) from [Current %] to [Target %] for [SaaS Product].

Current Packaging: [Brief description of current plans]

Develop an Expansion Revenue Roadmap:
1. Usage-based overage triggers that align with customer success.
2. Premium add-on modules (e.g. advanced analytics, custom branding, enterprise SSO).
3. In-app upgrade prompts triggered by behavioral milestones.
4. Account Executive playbooks for annual contract renewals with expansion.`,
    tags: ["expansion revenue", "net dollar retention", "saas", "growth"],
    placeholders: ["[Current %]", "[Target %]", "[SaaS Product]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },

  // ==========================================
  // 4. PRODUCT MANAGEMENT & UI/UX (20)
  // ==========================================
  {
    id: "prod-1",
    categoryId: "product",
    title: "Product Requirements Document (PRD)",
    description: "Write a complete PRD with goals, user stories, technical specs, and success metrics.",
    prompt: `Write a comprehensive Product Requirements Document (PRD) for [Feature / Product Name].

Context: [Describe the problem and target user]

Sections:
1. Problem Statement & Why Now.
2. Goals and Non-Goals.
3. User Personas & Key User Journeys.
4. Functional Requirements (Categorized with P0, P1, P2 priorities).
5. Technical Considerations (Data storage, API contracts, dependencies).
6. Success Metrics (North Star Metric and secondary KPIs).
7. Rollout Strategy & Phased Release Plan.`,
    tags: ["prd", "product management", "spec", "features"],
    placeholders: ["[Feature / Product Name]", "[Describe the problem and target user]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "prod-2",
    categoryId: "product",
    title: "User Story Mapping with Acceptance Criteria",
    description: "Break complex epics into Gherkin-style Given-When-Then user stories.",
    prompt: `Break down the epic [Epic Name, e.g. Self-Service User Subscription Management] into 5 user stories.

For each user story:
- Title & User Story statement: "As a [User], I want to [Action], so that [Benefit]."
- Acceptance Criteria formatted in Given-When-Then syntax.
- Edge cases to consider (e.g. payment failure, expired session, slow network).
- Story point estimate (Fibonacci: 1, 2, 3, 5, 8) with rationale.`,
    tags: ["user stories", "agile", "scrum", "acceptance criteria"],
    placeholders: ["[Epic Name, e.g. Self-Service User Subscription Management]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-3",
    categoryId: "product",
    title: "UX Heuristic Usability Audit",
    description: "Audit a user interface using Nielsen Norman Group's 10 Usability Heuristics.",
    prompt: `Perform a UX Heuristic Usability Audit on [User Flow / Page, e.g. SaaS Checkout Page / Mobile Dashboard]:

Screen / Flow details:
[Describe the UI elements, buttons, and steps]

Evaluate against Nielsen's 10 Heuristics:
1. Visibility of system status.
2. Match between system and the real world.
3. User control and freedom.
4. Consistency and standards.
5. Error prevention.
6. Recognition rather than recall.
7. Flexibility and efficiency of use.
8. Aesthetic and minimalist design.
9. Help users recognize, diagnose, and recover from errors.
10. Help and documentation.

Provide a prioritized list of UX fixes with wireframe recommendations.`,
    tags: ["ux", "heuristics", "audit", "usability", "design"],
    placeholders: ["[User Flow / Page, e.g. SaaS Checkout Page / Mobile Dashboard]", "[Describe the UI elements, buttons, and steps]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-4",
    categoryId: "product",
    title: "Feature Prioritization via RICE Framework",
    description: "Score and rank a backlog of feature requests based on Reach, Impact, Confidence, and Effort.",
    prompt: `Help me prioritize these 5 feature candidates using the RICE Scoring Model:

Feature Candidates:
1. [Feature 1 description]
2. [Feature 2 description]
3. [Feature 3 description]
4. [Feature 4 description]
5. [Feature 5 description]

For each feature:
- Reach (Number of users impacted per quarter).
- Impact (0.25 = minimal, 0.5 = low, 1 = medium, 2 = high, 3 = massive).
- Confidence (50% = moonshot, 80% = medium, 100% = high).
- Effort (Person-months).
- Calculate RICE Score = (Reach × Impact × Confidence) / Effort.
- Ranked recommendation table with implementation order.`,
    tags: ["rice", "prioritization", "backlog", "product management"],
    placeholders: ["[Feature 1 description]", "[Feature 2 description]", "[Feature 3 description]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "prod-5",
    categoryId: "product",
    title: "Customer User Interview Script",
    description: "Write unbiased, open-ended discovery interview questions using 'The Mom Test' principles.",
    prompt: `Design a 30-minute user research interview script to validate [Problem / Product Idea].

Target Interviewee: [Describe archetype]

Rules (following The Mom Test):
- Do not ask hypothetical questions ("Would you pay for X?").
- Ask about past behavior and concrete workflows.

Structure:
1. Warm-up & Context gathering (5 mins).
2. Current Workflow & Frustration deep dive (15 mins).
3. The Cost of the Problem (5 mins).
4. Wrap-up & Referral ask (5 mins).`,
    tags: ["user research", "interviews", "the mom test", "discovery"],
    placeholders: ["[Problem / Product Idea]", "[Describe archetype]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-6",
    categoryId: "product",
    title: "Onboarding Flow Friction Analysis",
    description: "Streamline new user onboarding to minimize drop-off and accelerate activation.",
    prompt: `Audit and optimize our user onboarding sequence:

Current Steps:
[List current signup and setup steps]

Deliverables:
1. Identification of high-friction steps causing user abandonment.
2. Redesigned 3-step onboarding flow focused on the "Aha!" moment.
3. Progressive profiling strategy (deferring non-essential fields).
4. Welcome email and in-app milestone trigger suggestions.`,
    tags: ["onboarding", "activation", "ux", "conversion"],
    placeholders: ["[List current signup and setup steps]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-7",
    categoryId: "product",
    title: "Design System Tokens & Component Spec",
    description: "Define color palettes, typography scales, spacing tokens, and component states.",
    prompt: `Create a comprehensive Design System token specification for [App Name / Brand Aesthetic].

Include:
1. Color Tokens (Semantic naming: primary, secondary, surface, background, destructive, muted) in Hex and HSL for both Light and Dark modes.
2. Typography Hierarchy (Font families, font sizes, line heights, letter spacing).
3. Spacing & Radius Scale (4px/8px base grid).
4. Shadow & Elevation tokens.
5. Component anatomy spec for a primary button with all states (default, hover, active, focus-visible, disabled, loading).`,
    tags: ["design system", "tokens", "ui", "tailwind", "figma"],
    placeholders: ["[App Name / Brand Aesthetic]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-8",
    categoryId: "product",
    title: "A/B Test Experimentation Hypothesis",
    description: "Structure a statistically valid A/B test with sample size calculations and guardrail metrics.",
    prompt: `Design an A/B test experiment for [Page / Flow]:

Goal: [e.g. Increase free-to-paid conversion rate from 3% to 4%]

Provide:
1. Problem Statement backed by user data.
2. Hypothesis: "If we [Change], then [Impact], because [User Psychology]."
3. Variant A (Control) vs Variant B (Treatment) wireframe descriptions.
4. Primary Metric, Secondary Metrics, and Guardrail Metrics (e.g. refund rate, page load time).
5. Minimum Detectable Effect (MDE) and sample size guidance.`,
    tags: ["a/b testing", "experimentation", "cro", "metrics"],
    placeholders: ["[Page / Flow]", "[e.g. Increase free-to-paid conversion rate from 3% to 4%]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "prod-9",
    categoryId: "product",
    title: "North Star Metric & KPI Tree",
    description: "Identify the singular North Star Metric and build the supporting input metric hierarchy.",
    prompt: `Help us define the North Star Metric for [Product Type, e.g. Collaborative Whiteboarding Tool / B2B Expense Management Platform].

Provide:
1. Proposed North Star Metric with explanation of why it reflects value delivered to the user.
2. Breakdown into 4 Input Metric Pillars:
   - Breadth (How many active users?).
   - Depth (How deeply do they use the product?).
   - Frequency (How often do they return?).
   - Efficiency (How quickly do they succeed?).
3. Counter-metrics to monitor to prevent gaming the system.`,
    tags: ["north star", "kpis", "analytics", "growth"],
    placeholders: ["[Product Type, e.g. Collaborative Whiteboarding Tool / B2B Expense Management Platform]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-10",
    categoryId: "product",
    title: "Jobs-To-Be-Done (JTBD) Canvas",
    description: "Uncover functional, emotional, and social jobs users hire your product to do.",
    prompt: `Apply the Jobs-To-Be-Done (JTBD) framework to [Product / Service]:

Target Customer: [Describe user]

Analyze:
1. Core Functional Job (What practical task are they trying to accomplish?).
2. Emotional Job (How do they want to feel while doing it?).
3. Social Job (How do they want to be perceived by peers or colleagues?).
4. Forces of Progress:
   - Push of the current situation (frustrations).
   - Pull of the new solution (hopes).
   - Anxiety of the new solution (fears of switching).
   - Habit of the present (inertia).`,
    tags: ["jtbd", "jobs to be done", "product design", "strategy"],
    placeholders: ["[Product / Service]", "[Describe user]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-11",
    categoryId: "product",
    title: "Mobile App Navigation Architecture",
    description: "Design bottom tab bars, drawer hierarchies, and modal drill-down patterns for iOS/Android.",
    prompt: `Design the mobile navigation hierarchy for a [App Concept, e.g. Personal Finance & Investment Tracker] mobile app.

Requirements:
1. 4 or 5 primary Bottom Tab destinations with rationale.
2. Secondary actions placed in contextual overflow menus.
3. Modal presentation vs Push navigation rules.
4. Deep-linking taxonomy for push notifications.`,
    tags: ["mobile", "navigation", "ui/ux", "ios", "android"],
    placeholders: ["[App Concept, e.g. Personal Finance & Investment Tracker]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-12",
    categoryId: "product",
    title: "Feature Sunsetting / Deprecation Plan",
    description: "Safely retire an underutilized feature without alienating legacy power users.",
    prompt: `Create a communication and technical deprecation plan for retiring [Feature Name].

Context:
- Current usage: [e.g. Used by 4% of active users]
- Reason for sunset: [e.g. High maintenance burden, replaced by new API]

Include:
1. Deprecation timeline (e.g. 90-day phase-out).
2. Email notification sequence for affected users.
3. Migration guide or automated export for their data.
4. In-app warning banners and graceful fallback UI.`,
    tags: ["deprecation", "product management", "sunsetting", "lifecycle"],
    placeholders: ["[Feature Name]", "[e.g. Used by 4% of active users]", "[e.g. High maintenance burden]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-13",
    categoryId: "product",
    title: "Empty State & Zero Data UX Blueprint",
    description: "Turn unpopulated screens into welcoming, educational onboarding stepping stones.",
    prompt: `Design delightful empty states for these 3 screens in [App Name]:
1. First-time login before creating any project.
2. Search results when 0 items match the query.
3. Notification center when there are no new notifications.

For each screen provide:
- Visual illustration suggestion.
- Friendly, reassuring headline and subtext.
- Primary Call to Action button that helps the user take the immediate next step.`,
    tags: ["empty states", "ux", "microcopy", "design"],
    placeholders: ["[App Name]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-14",
    categoryId: "product",
    title: "Gamification & Habit Loop Designer",
    description: "Design ethical streaks, badges, and progress feedback loops that encourage healthy user habits.",
    prompt: `Design a habit-forming gamification loop for [App, e.g. Language Learning / Fitness / Coding Practice].

Following Nir Eyal's Hook Model:
1. Trigger (External notification + Internal emotional cue).
2. Action (The simplest behavior in anticipation of reward).
3. Variable Reward (Rewards of the Tribe, Hunt, or Self).
4. Investment (Data or effort user puts in that makes the product more valuable next time).
5. Safeguards against toxic burnout or guilt.`,
    tags: ["gamification", "habit loop", "behavioral design", "engagement"],
    placeholders: ["[App, e.g. Language Learning / Fitness / Coding Practice]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-15",
    categoryId: "product",
    title: "Release Notes & Changelog Generator",
    description: "Transform git commits or tickets into exciting, user-centric product update notes.",
    prompt: `Write product release notes for version [X.Y.Z] of [Product Name].

List of shipped items:
[Paste raw developer tickets or bullet points]

Format:
1. Enthusiastic headline highlighting the marquee feature.
2. 🚀 What's New (User benefits emphasized, not technical jargon).
3. 🛠️ Improvements & Performance boosts.
4. 🐛 Bug Fixes.
5. In-app changelog modal version (under 80 words).`,
    tags: ["changelog", "release notes", "product updates", "communication"],
    placeholders: ["[X.Y.Z]", "[Product Name]", "[Paste raw developer tickets]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "prod-16",
    categoryId: "product",
    title: "Dark Mode UI Color Transformation Guide",
    description: "Translate light mode surfaces, borders, and text contrasts into sleek, glare-free dark UI.",
    prompt: `Provide guidelines for translating this light-theme UI palette into an elegant dark theme:

Light Theme Colors:
- Background: #FFFFFF
- Card Surface: #F8FAFC
- Text Primary: #0F172A
- Text Secondary: #64748B
- Border: #E2E8F0
- Accent: [Your Accent Color]

Provide:
1. Dark Theme equivalent Hex values using surface elevation depths (not pure #000000).
2. Contrast ratio checks for WCAG AAA readability.
3. Desaturating vibrant accents to avoid chromatic aberration and visual eye fatigue.`,
    tags: ["dark mode", "ui", "colors", "accessibility"],
    placeholders: ["[Your Accent Color]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-17",
    categoryId: "product",
    title: "User Persona Archetype Profile",
    description: "Construct an actionable, empathy-building user persona with goals, frustrations, and quotes.",
    prompt: `Create a detailed User Persona Archetype for [Product / Service]:

Target Profile: [e.g. Mid-level DevOps Engineer at a Series B startup]

Include:
- Demographics & Tech Stack used daily.
- "A Day in the Life" narrative.
- Core Goals & KPIs they are evaluated on.
- Pain Points & Daily Frustrations.
- Quotes they frequently say when frustrated.
- What would make them an internal champion of our software.`,
    tags: ["user persona", "ux", "empathy", "target audience"],
    placeholders: ["[Product / Service]", "[e.g. Mid-level DevOps Engineer at a Series B startup]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-18",
    categoryId: "product",
    title: "Dashboard Information Architecture & Widget Layout",
    description: "Organize complex operational metrics into an intuitive top-level executive dashboard.",
    prompt: `Design the layout and information architecture for a [Dashboard Name, e.g. Cloud Security & Compliance Dashboard].

Requirements:
1. Top KPI Summary cards (4 high-level health indicators).
2. Primary Trend visualization (Time series chart).
3. Actionable Alert / Incident feed with status badges.
4. Drill-down filtering controls (Date range, environment, severity).
5. Mobile responsive stacking order.`,
    tags: ["dashboard", "information architecture", "analytics", "ui"],
    placeholders: ["[Dashboard Name, e.g. Cloud Security & Compliance Dashboard]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-19",
    categoryId: "product",
    title: "Customer Journey Mapping",
    description: "Map user touchpoints from initial awareness, consideration, and trial to advocacy.",
    prompt: `Map the end-to-end customer journey for [Product Name]:

Stages to map:
1. Unaware (Feeling pain).
2. Problem Aware (Searching for solutions).
3. Solution Aware (Comparing options).
4. First Experience (Signup & Onboarding).
5. Habitual Use (Core workflow).
6. Advocacy (Referring peers).

For each stage:
- Customer Thoughts & Feelings.
- Touchpoints & Channels.
- Drop-off Risks.
- Opportunity to Delight.`,
    tags: ["journey map", "customer journey", "ux", "retention"],
    placeholders: ["[Product Name]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prod-20",
    categoryId: "product",
    title: "Beta Testing Program Protocol",
    description: "Structure a private beta testing cohort, feedback loops, and bug reporting incentives.",
    prompt: `Design a 4-week Private Beta Testing Program for our upcoming release of [Product / Feature].

Plan includes:
1. Tester Selection criteria and onboarding email.
2. Weekly structured feedback themes and tasks.
3. Bug reporting workflow (Loom/Linear/Discord).
4. Incentive structure (e.g. free lifetime plan / exclusive swag / founding badge).
5. Graduation criteria to move from Private Beta to Public General Availability.`,
    tags: ["beta testing", "qa", "community", "product launch"],
    placeholders: ["[Product / Feature]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },

  // ==========================================
  // 5. DATA SCIENCE & MATHEMATICS (20)
  // ==========================================
  {
    id: "data-1",
    categoryId: "data-math",
    title: "Python Pandas Data Cleaning Pipeline",
    description: "Write clean, robust Pandas scripts for handling missing data, dates, and outliers.",
    prompt: `Write a robust Python Pandas data-cleaning pipeline for a raw dataset with the following issues:

Dataset Description:
[Describe columns, missing values, messy date strings, duplicate entries, categorical anomalies]

Provide:
1. Production Python code using method chaining (\`.pipe()\`).
2. Handling missing values (imputation vs drop strategy).
3. Type conversions and regex string cleanups.
4. Outlier detection using IQR (Interquartile Range) or Z-score.
5. Summary report output comparing dataset shape before and after cleaning.`,
    tags: ["python", "pandas", "data cleaning", "data science"],
    placeholders: ["[Describe columns, missing values, messy date strings]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "data-2",
    categoryId: "data-math",
    title: "Statistical Hypothesis Testing Decision Tree",
    description: "Choose the correct statistical test (t-test, ANOVA, Mann-Whitney, Chi-Square).",
    prompt: `I need to choose the correct statistical test for my research experiment:

Experiment Description:
- Independent Variable: [e.g. 3 different website layouts - Categorical]
- Dependent Variable: [e.g. Time spent on site in seconds - Continuous]
- Sample Size: [e.g. 250 per group]
- Data distribution: [Normal / Skewed / Unknown]

Please:
1. Identify the exact statistical test to use (Parametric vs Non-parametric).
2. State the Null and Alternative Hypotheses ($H_0$ and $H_1$).
3. Python code using \`scipy.stats\` to run the test and interpret the p-value.`,
    tags: ["statistics", "hypothesis testing", "scipy", "data analysis"],
    placeholders: ["[e.g. 3 different website layouts - Categorical]", "[e.g. Time spent on site in seconds]", "[e.g. 250 per group]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-3",
    categoryId: "data-math",
    title: "Step-by-Step Mathematical Proof Explainer",
    description: "Explain complex mathematical theorems, linear algebra proofs, or calculus derivations.",
    prompt: `Explain and prove the following mathematical theorem or identity step by step:

Theorem / Formula:
[e.g. Bayes' Theorem derivation / Singular Value Decomposition / Proof that $\\sqrt{2}$ is irrational]

Format:
1. Intuitive high-level explanation (Explain like I'm an undergraduate).
2. Clear statement of axioms and assumptions.
3. Step-by-step rigorous algebraic proof using LaTeX math notation.
4. Geometric or practical real-world application.`,
    tags: ["math", "proofs", "calculus", "linear algebra"],
    placeholders: ["[e.g. Bayes' Theorem derivation / Singular Value Decomposition]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-4",
    categoryId: "data-math",
    title: "SQL Window Functions Masterclass",
    description: "Write complex analytical SQL queries using ROW_NUMBER, RANK, DENSE_RANK, and LAG/LEAD.",
    prompt: `Write an advanced SQL analytical query using Window Functions for the following problem:

Database Schema:
[Describe table columns and primary keys]

Goal:
[e.g. Find the top 3 highest-spending customers per region for each month, and calculate the month-over-month growth percentage using LAG]

Provide:
1. The optimized SQL query utilizing CTEs (\`WITH\`) and window functions.
2. Clear explanation of the \`PARTITION BY\` and \`ORDER BY\` clauses.
3. Handling edge cases like ties and NULL values.`,
    tags: ["sql", "window functions", "analytics", "database"],
    placeholders: ["[Describe table columns and primary keys]", "[e.g. Find the top 3 highest-spending customers]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "data-5",
    categoryId: "data-math",
    title: "Machine Learning Model Selection Advisor",
    description: "Compare ML algorithms (Random Forest, XGBoost, LightGBM, Neural Nets) for tabular or text data.",
    prompt: `Recommend the best Machine Learning model architecture for my problem:

Problem Context:
- Task: [Classification / Regression / Clustering / Anomaly Detection]
- Dataset size: [e.g. 50,000 rows, 45 tabular features]
- Constraints: [e.g. Low latency inference < 20ms required, high interpretability needed for regulatory compliance]

Provide:
1. Top 2 recommended algorithms with comparative trade-offs.
2. Feature engineering recommendations (encoding, scaling, interactions).
3. Baseline Python implementation using Scikit-Learn or XGBoost.
4. Evaluation metrics to monitor (e.g. ROC-AUC, F1, PR-AUC, RMSE).`,
    tags: ["machine learning", "ai", "xgboost", "scikit-learn"],
    placeholders: ["[Classification / Regression / Clustering]", "[e.g. 50,000 rows, 45 tabular features]", "[e.g. Low latency inference]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-6",
    categoryId: "data-math",
    title: "Discounted Cash Flow (DCF) Valuation Model",
    description: "Calculate intrinsic enterprise value using Free Cash Flow projections and WACC.",
    prompt: `Help me build a 5-year Discounted Cash Flow (DCF) financial model:

Inputs:
- Current Year Free Cash Flow (FCF): $[Amount]
- Projected 5-Year Growth Rates: [Year 1-5 percentages]
- Terminal Growth Rate: [e.g. 2.5%]
- Weighted Average Cost of Capital (WACC): [e.g. 9.5%]
- Shares Outstanding: [Number]

Calculate:
1. Present Value of Projected Free Cash Flows.
2. Terminal Value using Gordon Growth Model.
3. Enterprise Value and Equity Value per Share.
4. Sensitivity table showing share price across varying WACC and Terminal Growth rates.`,
    tags: ["finance", "dcf", "valuation", "math", "investing"],
    placeholders: ["$[Amount]", "[Year 1-5 percentages]", "[e.g. 2.5%]", "[e.g. 9.5%]", "[Number]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-7",
    categoryId: "data-math",
    title: "Exploratory Data Analysis (EDA) Blueprint",
    description: "Generate structured Python code for statistical distributions, correlations, and plots.",
    prompt: `Generate an Exploratory Data Analysis (EDA) script in Python for a dataset with columns:
[List key columns: numerical, categorical, target variable]

The script should:
1. Print summary statistics, null counts, and data types.
2. Plot distribution histograms and boxplots for numerical columns using Seaborn/Matplotlib.
3. Compute and display a correlation heatmap.
4. Identify high-cardinality categorical features.
5. Print insights on class imbalance in the target variable.`,
    tags: ["eda", "python", "data science", "visualization", "seaborn"],
    placeholders: ["[List key columns: numerical, categorical, target variable]"],
    suggestedModel: "Claude 3.5 Sonnet / Groq",
  },
  {
    id: "data-8",
    categoryId: "data-math",
    title: "Linear Algebra Matrix Operations Explainer",
    description: "Understand eigenvectors, eigenvalues, matrix decompositions, and vector spaces intuitively.",
    prompt: `Explain the concept of [Eigenvectors & Eigenvalues / Principal Component Analysis / Matrix Inversion]:

Provide:
1. The intuitive geometric interpretation (visualizing transformations in 2D/3D space).
2. The exact mathematical formulation with step-by-step matrix notation.
3. A solved numerical example with a $2 \\times 2$ or $3 \\times 3$ matrix.
4. Why this matters in computer graphics or modern machine learning.`,
    tags: ["linear algebra", "matrices", "math", "eigenvalues"],
    placeholders: ["[Eigenvectors & Eigenvalues / Principal Component Analysis / Matrix Inversion]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-9",
    categoryId: "data-math",
    title: "Data Visualization & Chart Selection Guide",
    description: "Select the most effective chart type (Scatter, Sankey, Treemap, Boxplot) for insights.",
    prompt: `Recommend the best data visualization approach for the following communication goal:

Data: [Describe data structure, variables, and dimensions]
Story to tell: [e.g. Showing user conversion leakage across multi-stage funnels / Comparing distributions of salary across departments]

Provide:
1. The ideal chart type and why it avoids cognitive distortion.
2. Best practices for color encoding, labeling, and axis scaling.
3. Sample implementation using [Recharts / Chart.js / Python Plotly / D3.js].`,
    tags: ["data visualization", "charts", "plotly", "recharts", "analytics"],
    placeholders: ["[Describe data structure, variables, and dimensions]", "[e.g. Showing user conversion leakage]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "data-10",
    categoryId: "data-math",
    title: "Time Series Forecasting Pipeline",
    description: "Model seasonality, trend, and stationary transformations with ARIMA or Prophet.",
    prompt: `Design a Time Series forecasting model in Python for [Target Metric: e.g. Daily Electricity Demand / Monthly Retail Sales].

Steps:
1. Stationarity check using Augmented Dickey-Fuller (ADF) test.
2. Seasonality and Trend decomposition (Additive vs Multiplicative).
3. Implementation of [ARIMA / SARIMAX / Prophet / XGBoost with lag features].
4. Backtesting validation using rolling-window cross-validation.
5. Calculation of MAPE and RMSE forecast accuracy metrics.`,
    tags: ["time series", "forecasting", "arima", "prophet", "python"],
    placeholders: ["[Target Metric: e.g. Daily Electricity Demand / Monthly Retail Sales]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "data-11",
    categoryId: "data-math",
    title: "Monte Carlo Simulation Engine",
    description: "Run probabilistic risk analysis using thousands of randomized simulation trials.",
    prompt: `Write a Python Monte Carlo simulation script to model [Financial Risk / Project Completion Timeline / Portfolio Returns].

Parameters:
[Describe probability distributions of uncertain variables, e.g. Normal, Log-normal, Uniform]

The script should:
1. Run 10,000 iterations using NumPy vectorization for speed.
2. Calculate the 5th, 50th (median), and 95th percentiles (Value at Risk / VaR).
3. Plot the outcome distribution histogram with confidence intervals.
4. Summarize probability of achieving the desired target threshold.`,
    tags: ["monte carlo", "simulation", "probability", "python", "risk"],
    placeholders: ["[Financial Risk / Project Completion Timeline / Portfolio Returns]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-12",
    categoryId: "data-math",
    title: "Calculus Optimization & Gradient Descent",
    description: "Derive partial derivatives, Jacobian matrices, and loss function gradients.",
    prompt: `Derive the gradient and explain the optimization process for:

Loss Function:
[e.g. Binary Cross-Entropy Loss / Mean Squared Error with L2 Regularization]

Provide:
1. Mathematical derivation of partial derivatives with respect to weights and bias.
2. Explanation of learning rate and convergence in Gradient Descent.
3. Python NumPy code implementing the forward pass, loss calculation, and backward pass (gradient update).`,
    tags: ["calculus", "gradient descent", "optimization", "math"],
    placeholders: ["[e.g. Binary Cross-Entropy Loss / Mean Squared Error]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-13",
    categoryId: "data-math",
    title: "Feature Engineering & Selection Pipeline",
    description: "Create high-signal tabular features (target encoding, polynomial terms, clustering).",
    prompt: `Suggest creative feature engineering techniques for a dataset predicting [Target: e.g. Customer Churn / Credit Default / Real Estate Price].

Existing Features:
[List current raw features]

Provide:
1. 5 new engineered feature ideas (ratios, aggregations, time-since features, interaction terms).
2. Feature selection methods to eliminate collinear features (Variance Inflation Factor / VIF, Mutual Information).
3. Python code implementing the transformations cleanly.`,
    tags: ["feature engineering", "machine learning", "data science"],
    placeholders: ["[Target: e.g. Customer Churn / Credit Default]", "[List current raw features]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "data-14",
    categoryId: "data-math",
    title: "Natural Language Processing (NLP) Embeddings",
    description: "Build semantic search, cosine similarity ranking, and clustering with vector embeddings.",
    prompt: `Write a Python pipeline using [Sentence-Transformers / OpenAI Embeddings] for Semantic Search:

Requirements:
1. Generate embeddings for a collection of documents.
2. Store and index vectors using cosine similarity or FAISS.
3. Implement a query function that retrieves top-k semantically relevant documents given a user search phrase.
4. Score thresholding to eliminate low-confidence matches.`,
    tags: ["nlp", "embeddings", "semantic search", "faiss", "python"],
    placeholders: ["[Sentence-Transformers / OpenAI Embeddings]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "data-15",
    categoryId: "data-math",
    title: "Probability Puzzle & Paradox Solver",
    description: "Solve counter-intuitive probability brainteasers (Monty Hall, Birthday Paradox, Simpson's Paradox).",
    prompt: `Explain and solve this probability problem step by step:

Problem:
[e.g. Monty Hall Problem / Two Children Paradox / Gambler's Fallacy scenario]

Include:
1. Why human intuition typically gets this problem wrong.
2. Rigorous analytical probability solution with conditional probabilities ($P(A|B)$).
3. A 20-line Python simulation verifying the analytical result across 100,000 trials.`,
    tags: ["probability", "math", "puzzle", "bayes"],
    placeholders: ["[e.g. Monty Hall Problem / Two Children Paradox]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-16",
    categoryId: "data-math",
    title: "Database Indexing & Query Tuning via Execution Plans",
    description: "Deconstruct slow query execution plans and optimize composite indexes.",
    prompt: `Diagnose this database query performance problem:

Query:
\`\`\`sql
[Paste query]
\`\`\`

Explain plan summary:
[Describe node types: Index Scan, Seq Scan, Hash Join, Nested Loop]

Recommend:
1. Ideal composite index column ordering based on equality vs range predicates (ESR rule).
2. Rewritten query to enable index usage.`,
    tags: ["database", "sql", "performance", "indexing"],
    placeholders: ["[Paste query]", "[Describe node types]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "data-17",
    categoryId: "data-math",
    title: "Combinatorics & Permutations Calculator",
    description: "Solve complex counting, permutation, and combination problems with clear reasoning.",
    prompt: `Solve this combinatorics question:

Question:
[e.g. In how many ways can 5 software engineers and 4 designers sit around a circular table such that no two designers sit next to each other?]

Provide:
1. Clear statement of the combinatorial principle (stars and bars, pigeonhole, inclusion-exclusion, circular permutations).
2. Step-by-step calculation with formula notation.
3. Final numeric answer verified.`,
    tags: ["combinatorics", "math", "permutations", "counting"],
    placeholders: ["[e.g. In how many ways can 5 software engineers and 4 designers sit around a circular table]"],
    suggestedModel: "DeepSeek R1",
  },
  {
    id: "data-18",
    categoryId: "data-math",
    title: "Clustering & Customer Segmentation (K-Means/DBSCAN)",
    description: "Segment customers based on behavioral attributes with optimal cluster counts.",
    prompt: `Design a customer segmentation pipeline in Python using [K-Means / DBSCAN / Hierarchical Clustering]:

Features available:
[e.g. Recency, Frequency, Monetary Value (RFM), Session Duration, Product Categories viewed]

Pipeline steps:
1. Feature scaling using \`StandardScaler\`.
2. Determining optimal clusters using the Elbow Method and Silhouette Score.
3. Profiling each cluster (e.g. "High-value loyalists", "At-risk churners") with descriptive summary statistics.`,
    tags: ["clustering", "kmeans", "rfm", "segmentation", "python"],
    placeholders: ["[K-Means / DBSCAN / Hierarchical Clustering]", "[e.g. Recency, Frequency, Monetary Value]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "data-19",
    categoryId: "data-math",
    title: "Differential Equations Analytical & Numerical Solutions",
    description: "Solve first and second order ODEs analytically and numerically using Euler or RK4.",
    prompt: `Solve the following Ordinary Differential Equation (ODE):

Equation:
[e.g. $\\frac{dy}{dx} + 2y = e^{-x}$ with initial condition $y(0) = 1$]

Provide:
1. Analytical solution showing integrating factor or characteristic equation steps.
2. Numerical solution script in Python using \`scipy.integrate.solve_ivp\`.
3. Plot comparing the exact analytical curve vs the numerical approximation.`,
    tags: ["differential equations", "ode", "calculus", "scipy"],
    placeholders: ["[e.g. $\\frac{dy}{dx} + 2y = e^{-x}$ with initial condition $y(0) = 1$]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },
  {
    id: "data-20",
    categoryId: "data-math",
    title: "Bayesian A/B Testing vs Frequentist Comparison",
    description: "Model conversion rate tests using Beta-Binomial Bayesian conjugate priors.",
    prompt: `Help me understand and implement a Bayesian A/B test:

Control: [X] conversions out of [N] visitors.
Treatment: [Y] conversions out of [M] visitors.

Deliverables:
1. Model prior and posterior distributions using Beta distribution $Beta(\\alpha, \\beta)$.
2. Calculate the probability that Treatment is superior to Control ($P(B > A)$).
3. Expected loss calculation (risk of choosing B if A was actually better).
4. Python script to plot posterior density distributions.`,
    tags: ["bayesian", "a/b testing", "statistics", "python"],
    placeholders: ["[X]", "[N]", "[Y]", "[M]"],
    suggestedModel: "DeepSeek R1 / Claude 3.5 Sonnet",
  },

  // ==========================================
  // 6. EDUCATION & RESEARCH (20)
  // ==========================================
  {
    id: "edu-1",
    categoryId: "education",
    title: "The Feynman Technique Concept Explainer",
    description: "Break down complex scientific or technical topics into plain language using everyday analogies.",
    prompt: `Explain [Complex Concept, e.g. Quantum Computing / Transformers in Machine Learning / Zero-Knowledge Proofs] using the Feynman Technique:

Requirements:
1. Explain it as if teaching a bright 12-year-old (no technical jargon without immediate intuitive analogy).
2. Identify the 2 most common points of confusion and clarify them with everyday metaphors.
3. Provide a practical "Why does this matter in real life?" section.
4. End with a 2-sentence summary that captures the essence of the idea.`,
    tags: ["feynman technique", "learning", "analogies", "education"],
    placeholders: ["[Complex Concept, e.g. Quantum Computing / Transformers in Machine Learning / Zero-Knowledge Proofs]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "edu-2",
    categoryId: "education",
    title: "Socratic Dialogue Tutor",
    description: "Learn through targeted, thought-provoking questions rather than direct lecture.",
    prompt: `Act as a Socratic tutor on the topic of [Topic, e.g. Epistemology / The Nature of Free Will / Supply and Demand Dynamics].

Rules:
- Do NOT simply give me the answer or write long paragraphs.
- Ask me ONE thoughtful, probing question at a time to guide my thinking.
- When I answer, point out subtle assumptions or contradictions in my reasoning and ask the next question.
- Keep your tone curious, supportive, and intellectually rigorous.

Start by asking me your first opening question!`,
    tags: ["socratic", "tutor", "dialogue", "critical thinking"],
    placeholders: ["[Topic, e.g. Epistemology / The Nature of Free Will / Supply and Demand Dynamics]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-3",
    categoryId: "education",
    title: "Spaced Repetition Flashcard Generator (Anki)",
    description: "Convert chapters or lecture notes into high-quality front/back active recall flashcards.",
    prompt: `Generate 15 high-yield active recall flashcards based on this study text:

"""
[Paste lecture notes or chapter summary here]
"""

Guidelines:
- Follow the minimum information principle (one clear question, one concise answer per card).
- Format as CSV or tab-delimited text ready for direct import into Anki (Front [tab] Back).
- Avoid vague questions ("Describe X"); use precise prompts ("What is the primary enzyme that catalyzes X?").`,
    tags: ["anki", "flashcards", "spaced repetition", "study"],
    placeholders: ["[Paste lecture notes or chapter summary here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "edu-4",
    categoryId: "education",
    title: "Scientific Research Paper Deep Teardown",
    description: "Synthesize academic papers with methodology critique, statistical validity, and core findings.",
    prompt: `Deconstruct and analyze this scientific research paper:

Paper Title or Abstract:
"""
[Paste paper title, abstract, or link summary]
"""

Provide:
1. Core Research Question & Hypothesis.
2. Methodology Overview (Sample size, controls, randomization).
3. Key Findings with effect sizes and p-values.
4. Critical Limitations & Potential Biases (e.g. confounding variables, sample homogeneity).
5. Practical Takeaways for practitioners.`,
    tags: ["academic", "research", "paper review", "science"],
    placeholders: ["[Paste paper title, abstract, or link summary]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "edu-5",
    categoryId: "education",
    title: "Comprehensive Literature Review Matrix",
    description: "Organize multiple conflicting research studies into a comparative academic matrix.",
    prompt: `Help me synthesize the academic literature on [Topic, e.g. Efficacy of Intermittent Fasting on Cognitive Health / Impact of AI on Software Engineering Productivity].

Create a structured Literature Review:
1. Historical context and theoretical background.
2. Comparison Table of major studies (Author & Year, Sample Size, Methodology, Key Outcome).
3. Areas of Scientific Consensus vs Active Controversy.
4. Identified Research Gaps for future investigation.`,
    tags: ["literature review", "academic", "research", "meta-analysis"],
    placeholders: ["[Topic, e.g. Efficacy of Intermittent Fasting / Impact of AI on Software Engineering]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-6",
    categoryId: "education",
    title: "Custom 30-Day Masterclass Curriculum",
    description: "Build a structured day-by-day learning roadmap to master any skill or subject.",
    prompt: `Design a structured 30-Day Mastery Curriculum for learning [Skill / Subject, e.g. Deep Learning from Scratch / Modern Rust Programming / Behavioral Economics].

User Background: [Beginner / Intermediate with coding knowledge]
Time commitment: [e.g. 1 hour per day]

Structure:
- Week 1: Core Foundations & Mental Models.
- Week 2: Intermediate Techniques & Tooling.
- Week 3: Advanced Applications & Real-World Projects.
- Week 4: Capstone Project & Portfolio Piece.
Include for each week: Daily topics, recommended reading/practice exercises, and a weekend milestone check.`,
    tags: ["curriculum", "learning plan", "masterclass", "self-taught"],
    placeholders: ["[Skill / Subject, e.g. Deep Learning / Modern Rust]", "[Beginner / Intermediate]", "[e.g. 1 hour per day]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "edu-7",
    categoryId: "education",
    title: "Interactive Multiple-Choice Exam Simulator",
    description: "Test your knowledge with challenging exam questions complete with answer rationales.",
    prompt: `Create a 5-question mock exam on [Topic / Certification, e.g. AWS Certified Solutions Architect / AP Biology / US History].

Format:
- Provide Question 1 with 4 plausible options (A, B, C, D).
- Do NOT reveal the answer immediately. Wait for me to answer Question 1 before giving the explanation and presenting Question 2.
- When explaining, clarify why the correct choice is right AND why each distractor is wrong.`,
    tags: ["quiz", "exam prep", "certification", "testing"],
    placeholders: ["[Topic / Certification, e.g. AWS Certified Solutions Architect / AP Biology]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-8",
    categoryId: "education",
    title: "Language Fluency Conversation Coach",
    description: "Practice conversational foreign language with in-line grammar corrections and idioms.",
    prompt: `Act as my language conversational tutor in [Target Language, e.g. Spanish / French / German / Japanese].

My current level: [A2 / B1 / B2]

Instructions:
1. Converse with me naturally on everyday topics (food, travel, work, hobbies).
2. After each of my responses, provide:
   - 🛠️ In-line corrections for any grammar, conjugation, or vocabulary errors.
   - 💡 Natural Native Alternative (how a local would say it idiomatically).
   - Your reply in the target language followed by a question to keep the conversation going.`,
    tags: ["language learning", "conversation", "spanish", "french", "tutor"],
    placeholders: ["[Target Language, e.g. Spanish / French / German / Japanese]", "[A2 / B1 / B2]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "edu-9",
    categoryId: "education",
    title: "Historical Context & Counter-Factual Analysis",
    description: "Explore historical events through primary sources and 'What If' alternate scenarios.",
    prompt: `Analyze the historical event: [Event, e.g. The Fall of the Roman Empire / The Signing of the Magna Carta / The 1962 Cuban Missile Crisis].

Provide:
1. The Primary Catalysts (economic, military, cultural, and political drivers).
2. Perspectives of 3 different historical factions involved.
3. Counter-factual "What If" Analysis: If one key decision had gone the other way, how would world history likely have deviated?
4. Lessons applicable to contemporary geopolitics.`,
    tags: ["history", "geopolitics", "humanities", "analysis"],
    placeholders: ["[Event, e.g. The Fall of the Roman Empire / The 1962 Cuban Missile Crisis]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-10",
    categoryId: "education",
    title: "Academic Essay Peer Review & Rubric Evaluation",
    description: "Critique an academic essay draft for thesis strength, argumentation, and evidence flow.",
    prompt: `Act as a rigorous university peer reviewer and evaluate this essay draft:

Essay Draft:
"""
[Paste essay draft here]
"""

Rubric Criteria:
1. Thesis Strength (Is it argumentative, non-obvious, and defensible?).
2. Structure & Topic Sentences (Does each paragraph advance the thesis logically?).
3. Evidence & Integration (Are quotes and citations analyzed rather than merely dropped?).
4. Counter-arguments (Does the author address serious objections?).
5. Stylistic Polish (Academic tone, sentence variety).
Provide specific line-level suggestions for revision.`,
    tags: ["essay review", "peer review", "writing", "academia"],
    placeholders: ["[Paste essay draft here]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-11",
    categoryId: "education",
    title: "First Principles Thinking Breakdown",
    description: "Deconstruct a problem into its fundamental physical and logical truths.",
    prompt: `Apply First Principles Thinking (Elon Musk / Aristotle method) to [Challenge, e.g. Reducing the cost of battery manufacturing / Learning to code in 6 months / Building low-cost housing]:

Steps:
1. State the common assumptions and conventional wisdom surrounding this challenge.
2. Break down the challenge into its fundamental, undeniable physical, economic, or logical truths.
3. Reason upwards from those basic truths to create a radical, non-obvious solution.`,
    tags: ["first principles", "problem solving", "critical thinking", "innovation"],
    placeholders: ["[Challenge, e.g. Reducing the cost of battery manufacturing / Learning to code]"],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "edu-12",
    categoryId: "education",
    title: "Complex Book Synthesis & Action Blueprint",
    description: "Extract the core mental models and actionable systems from non-fiction books.",
    prompt: `Summarize the non-fiction book [Book Title by Author]:

Structure:
1. The Core Thesis in 3 sentences.
2. 5 Key Mental Models & Principles explained with examples.
3. Common Misconceptions readers have about the book's message.
4. A 7-Day Actionable System to implement the book's ideas into daily life.
5. Best pull quotes from the author.`,
    tags: ["book summary", "mental models", "reading", "habits"],
    placeholders: ["[Book Title by Author]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "edu-13",
    categoryId: "education",
    title: "Dissertation & Thesis Proposal Architect",
    description: "Formulate a graduate-level research proposal with methodology and theoretical framework.",
    prompt: `Help me structure a Master's or PhD thesis proposal in [Field of Study]:

Tentative Topic / Interest: [Describe your area of interest]

Develop:
1. Refined Working Title.
2. Background & Problem Statement.
3. Research Questions and Primary Hypotheses.
4. Theoretical Framework.
5. Proposed Methodology (Qualitative, quantitative, or mixed-methods).
6. Expected Contributions to the Academic Field.`,
    tags: ["dissertation", "thesis", "phd", "academic research"],
    placeholders: ["[Field of Study]", "[Describe your area of interest]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-14",
    categoryId: "education",
    title: "Ethics & Moral Dilemma Case Study Discussion",
    description: "Analyze controversial moral dilemmas across Utilitarian, Deontological, and Virtue Ethics.",
    prompt: `Analyze this ethical dilemma:

Dilemma Description:
[e.g. Autonomous vehicle crash decision / AI surveillance in healthcare / Gene editing on human embryos]

Examine through 3 ethical frameworks:
1. Utilitarianism (Consequentialist calculation of maximum wellbeing).
2. Deontology (Kantian categorical imperative and universal duties).
3. Virtue Ethics (Aristotelian character and human flourishing).
Synthesize a balanced resolution.`,
    tags: ["ethics", "philosophy", "moral dilemma", "critical thinking"],
    placeholders: ["[e.g. Autonomous vehicle crash decision / AI surveillance in healthcare]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-15",
    categoryId: "education",
    title: "Statistical Fallacy & Misinformation Debunker",
    description: "Detect p-hacking, survivor bias, correlation vs causation, and visual distortion in claims.",
    prompt: `Analyze this public claim or article excerpt for statistical fallacies:

Claim / Text:
"""
[Paste claim, headline, or statistics]
"""

Identify:
1. Any formal statistical fallacies present (e.g. Survivorship Bias, Simpson's Paradox, Base Rate Neglect, Texas Sharpshooter).
2. Misleading visual charts or truncated axes.
3. How to restate the data honestly without sensationalism.`,
    tags: ["statistics", "fallacy", "critical thinking", "fact check"],
    placeholders: ["[Paste claim, headline, or statistics]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-16",
    categoryId: "education",
    title: "Child's Bedtime Story with Custom Moral",
    description: "Write an enchanting, imaginative children's story teaching empathy and curiosity.",
    prompt: `Write a delightful 500-word bedtime story for a [Child's Age]-year-old.

Characters: [e.g. A shy hedgehog who loves astronomy and an energetic squirrel]
Moral / Lesson: [e.g. Being yourself and helping a friend in need]

Include:
- Whimsical, sensory descriptions (gentle sound effects and cozy atmosphere).
- A sweet rhyming refrain repeated twice.
- A soothing, calming conclusion that helps the child drift off to sleep.`,
    tags: ["storytelling", "children", "bedtime story", "creative"],
    placeholders: ["[Child's Age]", "[e.g. A shy hedgehog who loves astronomy]", "[e.g. Being yourself]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "edu-17",
    categoryId: "education",
    title: "Philosophy of Mind & Consciousness Explainer",
    description: "Explore the Hard Problem of Consciousness, Qualia, and Functionalism.",
    prompt: `Explain the "Hard Problem of Consciousness" (David Chalmers) versus the "Easy Problems":

Include:
1. What distinguishes functional cognitive processing from subjective phenomenological experience (qualia).
2. The philosophical thought experiments (Frank Jackson's Mary the Color Scientist, Philosophical Zombies).
3. The leading contemporary theories (Physicalism, Panpsychism, Integrated Information Theory).`,
    tags: ["philosophy", "consciousness", "neuroscience", "mind"],
    placeholders: [],
    suggestedModel: "Claude 3.5 Sonnet / DeepSeek R1",
  },
  {
    id: "edu-18",
    categoryId: "education",
    title: "Science Fair / Lab Experiment Protocol",
    description: "Design a rigorous, safe science experiment following the scientific method.",
    prompt: `Design a hands-on science experiment for [Grade Level / Audience]:

Topic: [e.g. Solar thermal energy / Water filtration / Plant phototropism]

Provide:
1. Testable Hypothesis.
2. Complete Materials List (accessible, safe household items).
3. Step-by-Step Experimental Procedure with Control and Experimental groups.
4. Data Collection Table template.
5. Discussion Questions to analyze the results.`,
    tags: ["science", "stem", "experiment", "education"],
    placeholders: ["[Grade Level / Audience]", "[e.g. Solar thermal energy / Water filtration]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-19",
    categoryId: "education",
    title: "Creative Writing Worldbuilding Guide",
    description: "Build a rich, internally consistent fantasy or sci-fi universe from geography to magic systems.",
    prompt: `Help me build the world for a [Sci-Fi / Fantasy] novel:

Core Concept: [e.g. A world where sunlight is toxic and civilization lives in subterranean glowing caverns]

Flesh out 4 key systems:
1. Geography & Ecology (Natural resources, climate, flora/fauna).
2. Magic / Technology System (Rules, limitations, and catastrophic costs of use).
3. Societal Hierarchy & Politics (Who holds power? How is religion or law enforced?).
4. The Central Cultural Taboo that characters must not violate.`,
    tags: ["worldbuilding", "fiction", "writing", "fantasy", "sci-fi"],
    placeholders: ["[Sci-Fi / Fantasy]", "[e.g. A world where sunlight is toxic]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "edu-20",
    categoryId: "education",
    title: "College Admissions Essay Brainstormer",
    description: "Unearth deeply personal stories that showcase resilience and intellectual curiosity.",
    prompt: `Help me brainstorm authentic, compelling personal topics for a college admissions essay (Common App):

About Me:
- Background & Hobbies: [List what you do and your interests]
- A challenging moment or unexpected pivot: [Describe briefly]
- Values that matter most to me: [e.g. craftsmanship, family, curiosity]

Generate:
1. 3 distinct essay angles that avoid cliché tropes (e.g. "the big sports game victory").
2. For each angle: The opening hook, the core dilemma, and the internal growth shown.`,
    tags: ["college essay", "common app", "admissions", "storytelling"],
    placeholders: ["[List what you do and your interests]", "[Describe briefly]", "[e.g. craftsmanship, family]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },

  // ==========================================
  // 7. PRODUCTIVITY & CAREER (15)
  // ==========================================
  {
    id: "prodv-1",
    categoryId: "productivity",
    title: "STAR Method Behavioral Interview Simulator",
    description: "Practice answering behavioral interview questions using Situation, Task, Action, Result.",
    prompt: `Act as a Senior Hiring Manager conducting a behavioral interview for a [Target Role, e.g. Senior Product Designer / Lead Backend Engineer] at [Company Type].

Ask me ONE behavioral interview question at a time (e.g. "Tell me about a time you had a major disagreement with a stakeholder").

When I reply, critique my response based on the STAR method:
- Situation (Did I set the context crisply?).
- Task (Was my personal responsibility clear?).
- Action (Did I explain *my* concrete actions rather than saying "we"?).
- Result (Did I quantify the business impact with numbers?).
Provide a rewritten, upgraded version of my answer.`,
    tags: ["interview", "star method", "career", "job search"],
    placeholders: ["[Target Role, e.g. Senior Product Designer]", "[Company Type]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "prodv-2",
    categoryId: "productivity",
    title: "Resume Bullet Point Quantifier & Polisher",
    description: "Rewrite boring job duties into high-impact, metric-driven resume achievements.",
    prompt: `Rewrite the following resume bullet points using Google's formula: "Accomplished [X] as measured by [Y] by doing [Z]".

Current Resume Draft:
"""
[Paste resume bullets here]
"""

Requirements:
- Start with powerful action verbs (Spearheaded, Orchestrated, Engineered, Championed).
- Emphasize business impact, revenue, latency reductions, or efficiency gains.
- Provide 2 variations for each bullet point (one conservative, one high-impact).`,
    tags: ["resume", "career", "jobs", "cv"],
    placeholders: ["[Paste resume bullets here]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "prodv-3",
    categoryId: "productivity",
    title: "Salary Negotiation Counter-Offer Script",
    description: "Confidently negotiate higher base pay, equity grants, and signing bonuses without risking the offer.",
    prompt: `Help me craft a salary negotiation email / script:

Current Offer:
- Base Salary: $[Offer Base]
- Equity: [Offer Equity]
- Sign-on / Bonus: $[Bonus]
- Target Company: [Company Name]

My Target:
- Desired Base: $[Target Base] or equivalent in total compensation.
- My Leverage: [e.g. Competing offer, specialized skills, strong interview feedback]

Provide:
1. Professional counter-offer email emphasizing enthusiasm for the team while holding firm on market value.
2. Spoken script for a phone negotiation with the recruiter.
3. Fallback concessions to negotiate if they cannot budge on base salary (sign-on, accelerated review, remote stipend).`,
    tags: ["salary negotiation", "compensation", "career", "offer"],
    placeholders: ["$[Offer Base]", "[Offer Equity]", "$[Target Base]", "[Company Name]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-4",
    categoryId: "productivity",
    title: "Weekly Review & Mental Reset Protocol",
    description: "A structured Sunday evening review to process inbox, celebrate wins, and prioritize the week.",
    prompt: `Guide me through a focused Weekly Review and Planning session:

Reflect on my past week:
- 3 biggest wins or milestones achieved.
- 1 thing that drained my energy or wasted time.
- Unfinished open loops and tasks.

Plan the upcoming week:
1. Identify the ONE "Must-Win" priority for the week (The needle mover).
2. 3 Secondary High-Impact tasks.
3. Habit commitments (exercise, sleep, deep work blocks).
4. A calendar audit to decline or shorten non-essential meetings.`,
    tags: ["weekly review", "productivity", "time management", "planning"],
    placeholders: [],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-5",
    categoryId: "productivity",
    title: "Eisenhower Matrix Task Organizer",
    description: "Categorize a chaotic to-do list into Urgent vs Important quadrants with delegation plans.",
    prompt: `Organize this chaotic list of tasks into the Eisenhower Matrix:

My To-Do List:
"""
[Paste your tasks, obligations, and thoughts here]
"""

Categorize into:
- Quadrant 1: Urgent & Important (Do immediately).
- Quadrant 2: Not Urgent but Highly Important (Schedule deep work time for this—long-term compounding).
- Quadrant 3: Urgent but Not Important (Delegate, automate, or batch).
- Quadrant 4: Not Urgent & Not Important (Eliminate ruthlessly).
Provide immediate action items for today.`,
    tags: ["eisenhower matrix", "to-do", "productivity", "prioritization"],
    placeholders: ["[Paste your tasks, obligations, and thoughts here]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-6",
    categoryId: "productivity",
    title: "LinkedIn Headline & Profile Optimization",
    description: "Transform an invisible LinkedIn profile into a magnetic inbound recruiter pipeline.",
    prompt: `Optimize my LinkedIn profile to attract recruiters and clients for [Target Role / Industry]:

Current Details:
- Current Title: [Title]
- Background & Skills: [Summary of skills]
- Target Outcome: [e.g. Inbound engineering job offers / Consulting clients]

Provide:
1. 3 magnetic Headline options (combining Title + Proof + Outcome + Keywords).
2. About section written in first-person narrative with clear value proposition and call to action.
3. Top 5 Skills to pin for search algorithm visibility.`,
    tags: ["linkedin", "personal brand", "recruiting", "career"],
    placeholders: ["[Target Role / Industry]", "[Title]", "[Summary of skills]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "prodv-7",
    categoryId: "productivity",
    title: "Difficult Conversation & Boundary Script",
    description: "Say 'No' gracefully and establish professional boundaries without burning bridges.",
    prompt: `Help me script a difficult professional conversation:

Situation:
[e.g. My manager is asking me to take on another project when I am already at capacity / A client is demanding scope creep without extra pay / Giving constructive criticism to an underperforming peer]

Provide:
1. Spoken script using non-violent communication (Observation, Feeling, Need, Request).
2. Email or Slack message draft.
3. Anticipated defensive reactions and how to respond calmly while maintaining the boundary.`,
    tags: ["communication", "boundaries", "management", "conflict"],
    placeholders: ["[e.g. My manager is asking me to take on another project]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-8",
    categoryId: "productivity",
    title: "Time Blocking & Calendar Architecture",
    description: "Design an ideal week calendar with dedicated Deep Work and Shallow Work blocks.",
    prompt: `Design an optimal Time Blocking calendar schedule for my work week:

My Role: [e.g. Startup Founder / Software Engineer / Freelance Consultant]
Working Hours: [e.g. 9am - 5pm]
Key Responsibilities: [Coding, Client calls, Strategy, Email]

Rules:
- Minimum of 2 uninterrupted 90-minute Deep Work blocks per day.
- Batch meetings into specific afternoons to prevent context switching.
- Include buffers for daily exercise, lunch, and shutdown routine.`,
    tags: ["time blocking", "deep work", "calendar", "productivity"],
    placeholders: ["[e.g. Startup Founder / Software Engineer]", "[e.g. 9am - 5pm]", "[Coding, Client calls, Strategy]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-9",
    categoryId: "productivity",
    title: "SMART Goal Deconstruction Engine",
    description: "Turn vague New Year's resolutions into Specific, Measurable, Achievable, Relevant, and Time-bound plans.",
    prompt: `Transform this vague goal into a detailed SMART Goal execution plan:

My Goal: [e.g. "I want to get fit" / "I want to launch a SaaS side project" / "I want to read more books"]

Deconstruct into:
- Specific (Exactly what will be accomplished?).
- Measurable (The exact metric tracking progress).
- Achievable (Realistic daily/weekly actions).
- Relevant (Why this aligns with my long-term identity).
- Time-Bound (Specific milestone deadlines at Day 30, 60, and 90).
Include an Accountability system.`,
    tags: ["smart goals", "habits", "productivity", "action plan"],
    placeholders: ["[e.g. I want to launch a SaaS side project]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-10",
    categoryId: "productivity",
    title: "Executive Meeting Notes & Action Item Summarizer",
    description: "Transform chaotic meeting transcripts into clear decisions and accountable owners.",
    prompt: `Summarize this meeting transcript into an Executive Action Memo:

Meeting Notes / Transcript:
"""
[Paste meeting transcript or messy notes here]
"""

Structure:
1. Meeting Purpose & Attendees.
2. Key Decisions Agreed Upon.
3. Action Item Matrix (Task, Owner, Deadline).
4. Open Unresolved Issues to revisit in the next meeting.`,
    tags: ["meeting notes", "action items", "management", "summary"],
    placeholders: ["[Paste meeting transcript or messy notes here]"],
    suggestedModel: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
  },
  {
    id: "prodv-11",
    categoryId: "productivity",
    title: "Personal Decision Matrix (Weighted Scoring)",
    description: "Make life-changing career or business decisions using weighted multi-factor scoring.",
    prompt: `Help me make an objective decision between these choices:

Options:
- Option A: [e.g. Accept job offer at Big Tech company]
- Option B: [e.g. Join early-stage Seed startup]
- Option C: [e.g. Stay at current job and negotiate raise]

Important Criteria to me:
[e.g. Learning speed, Total compensation, Work-life balance, Culture, Career upside]

Build a Weighted Decision Matrix:
1. Assign weights (1-10) to each criteria.
2. Score each option (1-10) with detailed rationale.
3. Compute total weighted scores.
4. "Regret Minimization Framework" analysis (Jeff Bezos model) to gut-check the math.`,
    tags: ["decision making", "matrix", "career", "strategy"],
    placeholders: ["[e.g. Accept job offer at Big Tech company]", "[e.g. Join early-stage Seed startup]", "[e.g. Learning speed, Total compensation]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-12",
    categoryId: "productivity",
    title: "Overcoming Procrastination (5-Minute Rule)",
    description: "Break executive dysfunction and task paralysis with low-friction entry points.",
    prompt: `I am experiencing intense procrastination on this task:
Task: [Describe the task you are avoiding, e.g. Filing taxes / Writing the first chapter / Cleaning database]

Reason for avoidance: [e.g. Perfectionism / Fear of failure / Overwhelm]

Help me:
1. Identify the microscopic 2-minute version of the first action.
2. Implement the "5-Minute Rule" psychological contract.
3. Remove environmental friction and digital distractions.
4. Give me an immediate countdown challenge to start right now.`,
    tags: ["procrastination", "mindset", "focus", "habits"],
    placeholders: ["[Describe the task you are avoiding]", "[e.g. Perfectionism / Overwhelm]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-13",
    categoryId: "productivity",
    title: "Delegation Framework for Managers",
    description: "Delegate tasks effectively with clarity on autonomy levels and definition of done.",
    prompt: `Help me delegate a major project to a team member:

Project: [Project description]
Assignee: [Team member name and experience level]

Draft a delegation briefing:
1. Context: Why this project matters.
2. Clear "Definition of Done".
3. Level of Autonomy (Level 1: Research and report back, Level 2: Recommend and wait for approval, Level 3: Decide and inform, Level 4: Full autonomy).
4. Check-in milestones and guardrail boundaries.`,
    tags: ["delegation", "management", "leadership", "operations"],
    placeholders: ["[Project description]", "[Team member name and experience level]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-14",
    categoryId: "productivity",
    title: "Burnout Recovery & Energy Audit",
    description: "Diagnose physical, emotional, and mental exhaustion and build a recovery protocol.",
    prompt: `I feel burned out and exhausted:

Current symptoms: [e.g. Brain fog, cynicism, poor sleep, lack of motivation]
Work environment: [e.g. Working 60-hour weeks, constant Slack notifications]

Help me conduct an Energy Audit:
1. Classify my activities into Energy Drainers vs Energy Givers.
2. Create an immediate 72-hour acute recovery protocol.
3. Establish non-negotiable systemic changes to workload and notifications to make my routine sustainable.`,
    tags: ["burnout", "mental health", "wellness", "energy"],
    placeholders: ["[e.g. Brain fog, cynicism, poor sleep]", "[e.g. Working 60-hour weeks]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "prodv-15",
    categoryId: "productivity",
    title: "Quarterly Performance Self-Appraisal",
    description: "Write a confident, evidence-backed self-review that justifies promotion and bonus.",
    prompt: `Write a compelling self-evaluation for my annual/quarterly performance review:

Role: [Your Job Title]
Key Projects Completed: [List 3-4 major wins and deliverables]
Challenges Overcome: [Describe a roadblock you resolved]

Format:
1. Summary of Achievements with business metrics.
2. Leadership & Cross-Functional Collaboration examples.
3. Areas for Continued Growth and professional development goals.
4. Clear case for why my work warrants a promotion/merit increase.`,
    tags: ["performance review", "career", "promotion", "self-evaluation"],
    placeholders: ["[Your Job Title]", "[List 3-4 major wins and deliverables]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },

  // ==========================================
  // 8. MARKETING & GROWTH (15)
  // ==========================================
  {
    id: "mkt-1",
    categoryId: "marketing",
    title: "Viral TikTok & Reels Hook Generator",
    description: "Generate 10 scroll-stopping opening hooks that keep viewers watching short-form video.",
    prompt: `Write 10 viral video hooks (first 3 seconds) for a TikTok / Instagram Reel about:
Topic: [Topic, e.g. Hidden iPhone productivity tricks / How to get clients without cold calling]

Hook Categories:
- 2 Negative Bias / Warning Hooks ("Stop doing X...").
- 2 Curiosity Gap Hooks ("The secret nobody talks about...").
- 2 Visual Demonstration Hooks ("Watch what happens when...").
- 2 Contrarian / Hot Take Hooks ("Unpopular opinion: X is dead...").
- 2 Relatable Story Hooks ("If you've ever felt like...").`,
    tags: ["tiktok", "reels", "shorts", "viral hooks", "video"],
    placeholders: ["[Topic, e.g. Hidden iPhone productivity tricks]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-2",
    categoryId: "marketing",
    title: "High-Converting Meta (Facebook/Instagram) Ad Copy",
    description: "Write direct-response ad creative variations using Hook-Story-Offer frameworks.",
    prompt: `Write 3 high-converting Meta Ad copy variations for [Product Name]:

Product Description: [What it does and unique selling proposition]
Target Demographic: [Age, interests, pain point]

Variations to produce:
1. Short & Punchy (Under 50 words, fast scrollers).
2. Story-Based (Founder struggle or customer transformation journey).
3. Us vs Them (Comparison contrasting your product against outdated competitors).
Include headline options (under 40 chars) and CTA button recommendation.`,
    tags: ["meta ads", "facebook ads", "instagram ads", "paid social"],
    placeholders: ["[Product Name]", "[What it does and unique selling proposition]", "[Age, interests, pain point]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-3",
    categoryId: "marketing",
    title: "Programmatic SEO Strategy & Database Architecture",
    description: "Scale organic search traffic to 100k+ visits by generating thousands of template landing pages.",
    prompt: `Design a Programmatic SEO strategy for [Website / Industry, e.g. Job Board for Remote React Developers / Cost of Living Comparisons / Dog Breed Information]:

Deliverables:
1. Target Keyword Formula (e.g. "[Role] Salary in [City]" or "[Tool] Alternatives").
2. Head terms vs Long-tail opportunity analysis.
3. Database schema required to power the page variations dynamically.
4. Landing page layout template that avoids Google "thin content" penalties by providing real unique value.`,
    tags: ["programmatic seo", "seo", "growth", "traffic"],
    placeholders: ["[Website / Industry, e.g. Job Board for Remote React Developers]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-4",
    categoryId: "marketing",
    title: "Multi-Tier Referral & Affiliate Program Mechanics",
    description: "Design viral referral incentives that turn existing happy users into active promoters.",
    prompt: `Design a high-converting Referral & Affiliate Program for [Product Type, e.g. Subscription App / E-commerce Brand / SaaS]:

Include:
1. Two-sided Incentive structure (What does the referrer get? What discount does the invited friend get?).
2. Milestone rewards for power referrers (Refer 5 friends -> Get X, Refer 25 friends -> Get Y).
3. In-app share prompts triggered at the emotional peak (e.g. right after a successful transaction).
4. Pre-written share copy for Twitter, WhatsApp, and Email.`,
    tags: ["referral", "affiliate", "viral loops", "growth"],
    placeholders: ["[Product Type, e.g. Subscription App / E-commerce Brand / SaaS]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-5",
    categoryId: "marketing",
    title: "Influencer & Creator Collaboration Pitch",
    description: "Write personalized influencer outreach DMs and emails for product gifting or sponsorships.",
    prompt: `Write outreach messages to partner with content creators and micro-influencers:

Brand: [Brand Name & Niche]
Influencer Profile: [e.g. Tech reviewers with 10k-100k followers on YouTube/Instagram]
Compensation Model: [Free product gifting / $500 flat sponsorship fee / 20% affiliate commission]

Generate:
1. Instagram DM outreach (Short, casual, complimenting a specific recent post).
2. Formal Business Email proposal outlining the deliverables and creative freedom.
3. Follow-up message 5 days later.`,
    tags: ["influencer", "creator economy", "partnerships", "sponsorship"],
    placeholders: ["[Brand Name & Niche]", "[e.g. Tech reviewers with 10k-100k followers]", "[Free product gifting / Sponsorship fee]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-6",
    categoryId: "marketing",
    title: "Google Search Ads (PPC) Copy & Negative Keywords",
    description: "Write responsive search ads with high Quality Scores and generate negative keyword lists.",
    prompt: `Write a high-converting Google Ads campaign for:
Target Service / Product: [Description]
Target Keyword: [Primary search term]

Provide:
1. 10 compelling Headlines (under 30 characters each) combining keywords, numbers, and clear CTAs.
2. 4 engaging Descriptions (under 90 characters each).
3. 20 recommended Negative Keywords to prevent wasted ad spend on unqualified clicks (e.g. free, cracks, torrent, jobs).`,
    tags: ["google ads", "ppc", "sem", "paid search"],
    placeholders: ["[Description]", "[Primary search term]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-7",
    categoryId: "marketing",
    title: "Community Building & Discord/Slack Launch Strategy",
    description: "Launch a vibrant online community that stays engaged without relying solely on founder posts.",
    prompt: `Create a launch and engagement plan for a [Product / Brand] community on [Discord / Slack]:

Plan includes:
1. Channel Architecture (Categorized for onboarding, general discussion, showcase, and feedback).
2. The First 100 Members recruitment playbook.
3. Automated welcoming bot workflow and intro prompt.
4. Weekly recurring programming (e.g. "Feedback Friday", "Ask Me Anything" hours).
5. Community moderation guidelines.`,
    tags: ["community", "discord", "slack", "engagement"],
    placeholders: ["[Product / Brand]", "[Discord / Slack]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-8",
    categoryId: "marketing",
    title: "App Store Optimization (ASO) Title & Keywords",
    description: "Optimize iOS App Store & Google Play metadata for top keyword rankings and conversion.",
    prompt: `Create an App Store Optimization (ASO) strategy for our mobile app:

App Name & Purpose: [Describe what the app does]
Target Category: [e.g. Productivity / Health & Fitness / Finance]

Deliverables:
1. App Name (under 30 chars with primary keyword included).
2. Subtitle (under 30 chars with high-intent keywords).
3. Keyword Field (100 characters, comma-separated, zero wasted words).
4. App Store Description with bullet points and social proof.
5. Screenshot text overlay copy for the first 3 gallery screenshots.`,
    tags: ["aso", "app store", "mobile marketing", "ios", "android"],
    placeholders: ["[Describe what the app does]", "[e.g. Productivity / Health & Fitness]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-9",
    categoryId: "marketing",
    title: "Customer Win-Back Re-Engagement Campaign",
    description: "Re-engage dormant email subscribers and churned users with compelling incentives.",
    prompt: `Write a 3-part automated email sequence to win back inactive users who haven't logged in for 60 days:

Product: [Product Name]
The Incentive: [e.g. Free month upgrade / New major feature release / 30% discount]

Emails:
- Email 1 (Day 1): Friendly check-in acknowledging time away, showcasing the biggest improvement shipped since they left.
- Email 2 (Day 4): Special incentive offer with clear expiration date.
- Email 3 (Day 7): "Goodbye for now" clean break email (ironically triggers the highest response rate).`,
    tags: ["winback", "email sequence", "retention", "marketing"],
    placeholders: ["[Product Name]", "[e.g. Free month upgrade / New major feature]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-10",
    categoryId: "marketing",
    title: "Interactive Quiz Funnel Architect",
    description: "Build a lead-generation quiz funnel that segments prospects and recommends tailored products.",
    prompt: `Design a lead generation Quiz Funnel for [Business / Product, e.g. Skincare Routine / Financial Personality / SaaS Tech Stack Audit]:

Structure:
1. Hooky Quiz Title.
2. 5 engaging, diagnostic multiple-choice questions.
3. Email Opt-in gate right before revealing results.
4. 3 distinct Outcome Archetypes with customized product recommendations and next steps.`,
    tags: ["quiz funnel", "lead generation", "conversion", "marketing"],
    placeholders: ["[Business / Product, e.g. Skincare Routine / Financial Personality]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-11",
    categoryId: "marketing",
    title: "Public Relations (PR) Journalist Newsjack Pitch",
    description: "Pitch reporters by connecting your company's expertise to breaking news trends.",
    prompt: `Draft a journalist newsjacking pitch connecting our company to a trending news story:

Company: [Company Name & Specialty]
Trending News Story: [Current event or industry report in the headlines]
Our Expert Perspective: [What unique data or contrarian view can our founder offer?]

Requirements:
- Under 150 words.
- Subject line formatted as an enticing news story headline.
- Offers specific data points or immediate phone interview availability.`,
    tags: ["pr", "press", "media", "journalism", "newsjacking"],
    placeholders: ["[Company Name & Specialty]", "[Current event or industry report]", "[What unique data or contrarian view]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-12",
    categoryId: "marketing",
    title: "High-Converting Webinar / Masterclass Outline",
    description: "Structure a 45-minute live masterclass that educates genuinely and transitions to an offer.",
    prompt: `Outline a 45-minute educational sales webinar on [Topic]:

Audience: [Target Audience]
End Offer: [Product or Course being sold at the end]

Framework:
- 0:00 - 0:05 Introduction & Establishing Authority.
- 0:05 - 0:15 The Paradigm Shift (Why conventional methods fail).
- 0:15 - 0:35 The 3 Secret Frameworks (Delivering massive standalone educational value).
- 0:35 - 0:45 The Irresistible Offer Stack (Introducing the solution, bonuses, guarantee, and Q&A).`,
    tags: ["webinar", "sales funnel", "education", "masterclass"],
    placeholders: ["[Topic]", "[Target Audience]", "[Product or Course being sold]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-13",
    categoryId: "marketing",
    title: "Customer Testimonial & Review Harvester",
    description: "Automate collecting glowing, detailed 5-star reviews with video testimonial prompts.",
    prompt: `Design an automated testimonial collection workflow for [Product / Service]:

Include:
1. Automated email / SMS trigger timing (at the moment of customer delight).
2. 4 guided prompt questions that help customers write detailed, story-based reviews instead of generic "Great product!".
3. Follow-up request to record a 30-second video testimonial via Loom or Senja with reward incentive.`,
    tags: ["testimonials", "reviews", "social proof", "marketing"],
    placeholders: ["[Product / Service]"],
    suggestedModel: "Claude 3.5 Sonnet",
  },
  {
    id: "mkt-14",
    categoryId: "marketing",
    title: "SMS / WhatsApp Marketing Broadcast Campaign",
    description: "Write high-open-rate, compliant SMS broadcasts with urgent, time-sensitive promotions.",
    prompt: `Write 3 compliant, high-converting SMS / WhatsApp marketing messages for [Store / Event]:

Goal: [e.g. Flash Sale / VIP Early Access / Cart Abandonment Reminder]

Rules:
- Under 160 characters per message.
- Clear brand identification.
- Single distinct short URL link.
- Mandatory opt-out instructions (e.g. "Reply STOP to cancel").`,
    tags: ["sms marketing", "whatsapp", "mobile", "direct marketing"],
    placeholders: ["[Store / Event]", "[e.g. Flash Sale / VIP Early Access]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
  {
    id: "mkt-15",
    categoryId: "marketing",
    title: "Viral Meme Marketing & Social Trend Hijack",
    description: "Adapt trending internet memes to promote tech or consumer products tastefully.",
    prompt: `Brainstorm 5 clever meme concepts for [Brand / Tech Product, e.g. Developer Database / Productivity App / Specialty Coffee]:

For each concept:
1. Reference a well-known meme format (e.g. Distracted Boyfriend, Drake Hotline Bling, Expanding Brain, Tuxedo Winnie the Pooh, "They don't know that...").
2. Top text / Left image description.
3. Bottom text / Right image punchline highlighting the customer's relief when using our product.`,
    tags: ["meme marketing", "social media", "humor", "viral"],
    placeholders: ["[Brand / Tech Product, e.g. Developer Database / Productivity App]"],
    suggestedModel: "Claude 3.5 Sonnet / GPT-4o",
  },
];
