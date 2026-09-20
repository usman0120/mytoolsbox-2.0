const fs = require('fs');
const path = require('path');

const registry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/content/tools/registry.ts', 'utf8');
const engineRegistry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/features/engine-registry.ts', 'utf8');

// Extract all slugs from registry
const registrySlugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Registry slugs count:', registrySlugs.length);

// Extract slug -> path mappings from engine-registry
const engineMappings = {};
for (const m of engineRegistry.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  engineMappings[m[1]] = m[2];
}

// Check each registry slug has an engine file
const featuresDir = 'e:/working_projects/mytoolsbox-me_new/src/features';
const missingFiles = [];

for (const slug of registrySlugs) {
  const enginePath = engineMappings[slug];
  if (!enginePath) {
    missingFiles.push({ slug, reason: 'No mapping in engine-registry.ts' });
    continue;
  }
  
  const fullPath = path.join(featuresDir, enginePath + '.tsx');
  if (!fs.existsSync(fullPath)) {
    // Try .ts extension
    const fullPathTs = path.join(featuresDir, enginePath + '.ts');
    if (!fs.existsSync(fullPathTs)) {
      missingFiles.push({ slug, reason: `File not found: ${enginePath}.tsx or .ts` });
    }
  }
}

console.log('\nMissing engine files (' + missingFiles.length + '):');
missingFiles.forEach(f => console.log('  ' + f.slug + ' - ' + f.reason));

// Also check for engine files that exist but aren't in registry
console.log('\n\nChecking for orphan engine files...');
const engineFiles = [];
function walkDir(dir, base) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, relPath);
    } else if (entry.name.endsWith('-engine.tsx') || entry.name.endsWith('-engine.ts')) {
      engineFiles.push(relPath.replace(/\\/g, '/').replace(/\.(tsx|ts)$/, ''));
    }
  }
}
walkDir(featuresDir, '');

const mappedPaths = new Set(Object.values(engineMappings));
const orphanFiles = engineFiles.filter(f => !mappedPaths.has(f));
console.log('Orphan engine files not in registry (' + orphanFiles.length + '):');
orphanFiles.forEach(f => console.log('  ' + f));