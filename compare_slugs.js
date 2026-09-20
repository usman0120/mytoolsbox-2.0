const fs = require('fs');

const registry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/content/tools/registry.ts', 'utf8');
const toolEngine = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/features/tool-engine.tsx', 'utf8');
const engineRegistry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/features/engine-registry.ts', 'utf8');

// Extract all slugs from registry - try double quotes first
let registrySlugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
if (registrySlugs.length === 0) {
  registrySlugs = [...registry.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
}
console.log('Registry slugs count:', registrySlugs.length);

// Extract all slugs from tool-engine.tsx
const toolEngineSlugs = [...toolEngine.matchAll(/"([^"]+)":\s*dynamic/g)].map(m => m[1]);
console.log('tool-engine.tsx slugs count:', toolEngineSlugs.length);

// Extract all slugs from engine-registry.ts
const engineRegSlugs = [...engineRegistry.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(m => m[1]);
console.log('engine-registry.ts slugs count:', engineRegSlugs.length);

// Find missing from tool-engine.tsx
const missingFromToolEngine = registrySlugs.filter(s => !toolEngineSlugs.includes(s));
console.log('\nMissing from tool-engine.tsx (' + missingFromToolEngine.length + '):');
missingFromToolEngine.forEach(s => console.log('  ' + s));

// Find missing from engine-registry.ts
const missingFromEngineReg = registrySlugs.filter(s => !engineRegSlugs.includes(s));
console.log('\nMissing from engine-registry.ts (' + missingFromEngineReg.length + '):');
missingFromEngineReg.forEach(s => console.log('  ' + s));

// Find extra in tool-engine.tsx not in registry
const extraInToolEngine = toolEngineSlugs.filter(s => !registrySlugs.includes(s));
console.log('\nExtra in tool-engine.tsx not in registry (' + extraInToolEngine.length + '):');
extraInToolEngine.forEach(s => console.log('  ' + s));

// Find extra in engine-registry.ts not in registry
const extraInEngineReg = engineRegSlugs.filter(s => !registrySlugs.includes(s));
console.log('\nExtra in engine-registry.ts not in registry (' + extraInEngineReg.length + '):');
extraInEngineReg.forEach(s => console.log('  ' + s));