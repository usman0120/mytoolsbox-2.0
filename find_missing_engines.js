const { buildInventory } = require('./compare_slugs.js');

function missingEngines() {
  const inventory = buildInventory();
  return {
    missingToolLoaders: inventory.integrity.tools.missing,
    missingAppLoaders: inventory.integrity.apps.missing,
    missingTargets: inventory.integrity.missingTargets,
    legacyTargetDrift: inventory.integrity.legacyTargetDrift,
  };
}

module.exports = { missingEngines };
if (require.main === module) console.log(JSON.stringify(missingEngines(), null, 2));