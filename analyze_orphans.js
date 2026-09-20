const fs = require('fs');

const registry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/content/tools/registry.ts', 'utf8');
const engineRegistry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/features/engine-registry.ts', 'utf8');

// Extract all slugs from registry
const registrySlugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);

// Extract slug -> path mappings from engine-registry
const engineMappings = {};
for (const m of engineRegistry.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  engineMappings[m[1]] = m[2];
}

// Orphan files from previous run
const orphanFiles = [
  'app-engine', 'apps/ai-diagram-generator-engine', 'apps/ai-notes-generator-engine',
  'apps/ai-planning-engine', 'apps/ai-project-ideas-engine', 'apps/ai-quiz-generator-engine',
  'apps/budget-planner-engine', 'apps/certificate-maker-engine', 'apps/diagram-maker-engine',
  'apps/farmer-ai-engine', 'apps/habit-tracker-engine', 'apps/image-editor-engine',
  'apps/invoice-maker-engine', 'apps/math-solver-engine', 'apps/presentation-maker-engine',
  'apps/quiz-maker-engine', 'apps/research-assistant-engine', 'apps/resume-builder-engine',
  'apps/study-planner-engine', 'apps/video-editor-engine',
  'documents/pdf-compare-engine', 'documents/pdf-repair-engine', 'documents/pdf-sign-engine',
  'documents/pdf-to-markdown-engine', 'documents/pdf-to-text-engine', 'documents/pdf-watermark-engine',
  'tool-engine', 'tools/basic-calculator-engine', 'tools/bmr-calculator-engine',
  'tools/cgpa-calculator-engine', 'tools/character-counter-engine', 'tools/code-explainer-engine',
  'tools/compound-interest-engine', 'tools/csv-json-converter-engine', 'tools/date-difference-engine',
  'tools/discount-calculator-engine', 'tools/duplicate-remover-engine', 'tools/emi-calculator-engine',
  'tools/file-zipper-engine', 'tools/find-replace-engine', 'tools/grade-calculator-engine',
  'tools/ip-lookup-engine', 'tools/js-formatter-engine', 'tools/json-xml-yaml-converter-engine',
  'tools/mortgage-calculator-engine', 'tools/readability-checker-engine', 'tools/sentence-counter-engine',
  'tools/simple-interest-engine', 'tools/slug-generator-engine', 'tools/text-formatter-engine',
  'tools/tip-calculator-engine', 'tools/url-decoder-engine', 'tools/xml-formatter-engine'
];

// Check which orphans have corresponding registry entries by name
console.log('=== Orphan files analysis ===\n');

// Extract slug from orphan path
for (const orphan of orphanFiles) {
  const slug = orphan.replace(/^.*\//, '').replace(/-engine$/, '');
  
  // Check if this slug exists in registry
  const inRegistry = registrySlugs.includes(slug);
  
  // Check if a similar slug exists
  const similarSlugs = registrySlugs.filter(s => {
    const dist = levenshteinDistance(s, slug);
    return dist <= 3 && dist > 0;
  });
  
  if (inRegistry) {
    console.log(`IN REGISTRY: ${slug} (orphan path: ${orphan})`);
  } else if (similarSlugs.length > 0) {
    console.log(`SIMILAR: ${slug} -> registry has: ${similarSlugs.join(', ')}`);
  } else {
    console.log(`NOT IN REGISTRY: ${slug} (orphan path: ${orphan})`);
  }
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}