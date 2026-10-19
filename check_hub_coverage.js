const { buildInventory } = require('./compare_slugs.js');

function hubCoverage() {
  const inventory = buildInventory();
  return {
    hubs: inventory.hubs.map((hub) => ({ id: hub.id, tools: hub.toolIds.length, apps: (hub.appIds || []).length })),
    coveredTools: new Set(inventory.hubReferences.filter((entry) => entry.namespace === 'tools').map((entry) => entry.id)).size,
    coveredApps: new Set(inventory.hubReferences.filter((entry) => entry.namespace === 'apps').map((entry) => entry.id)).size,
    uncovered: inventory.features.filter((entry) => !inventory.hubReferences.some((reference) => reference.namespace === entry.namespace && reference.id === entry.id)).map((entry) => entry.route),
    invalidReferences: inventory.integrity.invalidHubReferences,
  };
}

module.exports = { hubCoverage };
if (require.main === module) console.log(JSON.stringify(hubCoverage(), null, 2));