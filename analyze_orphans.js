const path = require('node:path');
const fs = require('node:fs');
const { root, walk, importReferences, buildInventory } = require('./compare_slugs.js');

function analyzeOrphans() {
  const inventory = buildInventory();
  const references = new Map();
  const relative = (filename) => path.relative(root, filename).split(path.sep).join('/');
  for (const filename of walk(path.join(root, 'src')).filter((entry) => ['.ts', '.tsx'].includes(path.extname(entry)))) {
    for (const specifier of importReferences(relative(filename))) {
      if (!specifier.startsWith('@/') && !specifier.startsWith('.')) continue;
      const base = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const target = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile());
      if (!target) continue;
      const key = relative(target);
      references.set(key, [...(references.get(key) || []), relative(filename)]);
    }
  }
  const liveTargets = new Set([...inventory.toolLoaders, ...inventory.appLoaders].map((entry) => `src/${entry.target.slice(2)}`));
  const engines = walk(path.join(root, 'src/features')).filter((filename) => filename.endsWith('-engine.tsx') || filename.endsWith('-engine.ts')).map((filename) => {
    const owner = relative(filename);
    return { owner, liveLoader: liveTargets.has(owner.slice(0, -path.extname(owner).length)), importers: references.get(owner) || [] };
  });
  return {
    scannedEngines: engines.length,
    notDirectlyLoaded: engines.filter((entry) => !entry.liveLoader),
    unreferencedCandidates: engines.filter((entry) => !entry.liveLoader && entry.importers.length === 0),
    limitation: 'Static literal imports/exports in src only; not reachability proof. No file is approved for deletion.',
  };
}

module.exports = { analyzeOrphans };
if (require.main === module) console.log(JSON.stringify(analyzeOrphans(), null, 2));