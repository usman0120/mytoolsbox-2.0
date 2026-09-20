const fs = require('fs');

const registry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/content/tools/registry.ts', 'utf8');
const hubsRegistry = fs.readFileSync('e:/working_projects/mytoolsbox-me_new/src/content/hubs/registry.ts', 'utf8');

// Extract all slugs from registry
const registrySlugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);

// Extract hub definitions
const hubMatches = [...hubsRegistry.matchAll(/id:\s*"([^"]+)"[\s\S]*?toolIds:\s*\[([\s\S]*?)\]/g)];

const hubCoverage = {};
const allHubTools = new Set();

for (const [, hubId, toolIdsStr] of hubMatches) {
  const toolIds = [...toolIdsStr.matchAll(/"([^"]+)"/g)].map(m => m[1]);
  hubCoverage[hubId] = toolIds;
  toolIds.forEach(id => allHubTools.add(id));
}

console.log('Hubs found:', Object.keys(hubCoverage).join(', '));
console.log('Total unique tools across all hubs:', allHubTools.size);
console.log('Registry tools:', registrySlugs.length);

// Tools not in any hub
const notInAnyHub = registrySlugs.filter(s => !allHubTools.has(s));
console.log('\nTools NOT in any hub (' + notInAnyHub.length + '):');
notInAnyHub.forEach(s => console.log('  ' + s));

// Tools in hubs but not in registry
const notInRegistry = [...allHubTools].filter(s => !registrySlugs.includes(s));
console.log('\nTools in hubs but NOT in registry (' + notInRegistry.length + '):');
notInRegistry.forEach(s => console.log('  ' + s));

// Per-hub stats
console.log('\n=== Per-hub coverage ===');
for (const [hubId, toolIds] of Object.entries(hubCoverage)) {
  console.log(`${hubId}: ${toolIds.length} tools`);
}