const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = __dirname;

function source(relativePath) {
  const filename = path.join(root, relativePath);
  return ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
}

function loadCatalog(relativePath, exportName) {
  const filename = path.join(root, relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const exports = {};
  const module = { exports };
  const catalogRequire = (specifier) => {
    if (!specifier.startsWith('@/content/') && specifier !== '@/lib/catalog/consolidation') throw new Error(`Unexpected catalog dependency: ${specifier}`);
    return loadCatalog(`src/${specifier.slice(2)}.ts`);
  };
  vm.runInNewContext(compiled, { exports, module, require: catalogRequire }, { filename, timeout: 5000 });
  const value = exportName ? module.exports[exportName] : module.exports;
  if (exportName && !Array.isArray(value)) throw new Error(`Missing catalog array: ${exportName}`);
  return value;
}

function loaderEntries(relativePath, mapName) {
  const entries = [];
  let found = false;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText() === mapName && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      if (found) throw new Error(`Multiple ${mapName} declarations in ${relativePath}`);
      found = true;
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name)) throw new Error(`Unsupported loader key in ${relativePath}`);
        const imports = [];
        function inspect(child) {
          if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (child.arguments.length !== 1 || !ts.isStringLiteral(child.arguments[0])) throw new Error('Nonliteral engine import');
            imports.push(child.arguments[0].text);
          }
          ts.forEachChild(child, inspect);
        }
        inspect(property.initializer);
        const target = ts.isStringLiteral(property.initializer) ? `@/features/${property.initializer.text}` : imports[0];
        if (!target || imports.length > 1) throw new Error(`Ambiguous loader: ${property.name.text}`);
        entries.push({ slug: property.name.text, target });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source(relativePath));
  if (!found) throw new Error(`Missing ${mapName} in ${relativePath}`);
  return entries;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  });
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function importReferences(relativePath) {
  const references = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      references.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
      references.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source(relativePath));
  return references;
}

function literalArray(relativePath, name) {
  let result;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) {
      if (!ts.isArrayLiteralExpression(node.initializer) || node.initializer.elements.some((entry) => !ts.isStringLiteral(entry))) throw new Error(`Unsupported ${name} array in ${relativePath}`);
      if (result) throw new Error(`Multiple ${name} arrays in ${relativePath}`);
      result = node.initializer.elements.map((entry) => entry.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source(relativePath));
  if (!result) throw new Error(`Missing ${name} array in ${relativePath}`);
  return result;
}

function directStorageKeys(relativePath) {
  const tree = source(relativePath);
  const constants = new Map();
  const references = [];
  function constantsVisit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isStringLiteral(node.initializer)) constants.set(node.name.text, node.initializer.text);
    ts.forEachChild(node, constantsVisit);
  }
  function referencesVisit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.arguments.length > 0) {
      const receiver = node.expression.expression;
      const storage = ts.isIdentifier(receiver) ? receiver.text : ts.isPropertyAccessExpression(receiver) ? receiver.name.text : '';
      if (['localStorage', 'sessionStorage'].includes(storage) && ['getItem', 'setItem', 'removeItem'].includes(node.expression.name.text)) {
        const argument = node.arguments[0];
        const key = ts.isStringLiteral(argument) ? argument.text : ts.isIdentifier(argument) ? constants.get(argument.text) : undefined;
        references.push({ storage, key: key || null, expression: argument.getText(tree), operation: node.expression.name.text });
      }
    }
    ts.forEachChild(node, referencesVisit);
  }
  constantsVisit(tree);
  referencesVisit(tree);
  return references;
}

function buildInventory() {
  const tools = loadCatalog('src/content/tools/registry.ts', 'toolRegistry');
  const apps = loadCatalog('src/content/apps/registry.ts', 'appRegistry');
  const toolLoaders = loaderEntries('src/features/tool-engine.tsx', 'engineMap');
  const appLoaders = loaderEntries('src/features/app-engine.tsx', 'engineMap');
  const legacyLoaders = loaderEntries('src/features/engine-registry.ts', 'engineMap');
  const hubs = loadCatalog('src/content/hubs/registry.ts', 'hubRegistry');
  const blogs = loadCatalog('src/content/blog/blogs-data.ts', 'BLOG_POSTS');
  const guides = loadCatalog('src/features/resources/resources-data.ts', 'RESOURCE_GUIDES');
  const records = (catalog, loaders, namespace) => catalog.map((entry) => ({
    namespace, id: entry.id, slug: entry.slug, route: `/${namespace}/${entry.slug}`,
    status: entry.status, category: entry.category, processingMode: entry.processingMode,
    requiresAuth: entry.requiresAuth, requiresPro: entry.requiresPro,
    advertisedBehavior: entry.shortDescription, inputTypes: entry.inputTypes, outputTypes: entry.outputTypes,
    relatedTools: entry.relatedTools || [], relatedApps: entry.relatedApps || [],
    catalogOwner: `src/content/${namespace}/registry.ts`,
    loaderOwner: `src/features/${namespace === 'tools' ? 'tool' : 'app'}-engine.tsx`,
    engine: loaders.find((loader) => loader.slug === entry.slug)?.target || null,
    preRendered: namespace === 'tools' ? entry.status === 'active' : ['active', 'beta'].includes(entry.status),
    behaviorVerdict: 'unverified',
  }));
  const features = [...records(tools, toolLoaders, 'tools'), ...records(apps, appLoaders, 'apps')];
  for (const feature of features) {
    const engineOwner = feature.engine && ['.tsx', '.ts'].map((extension) => `src/${feature.engine.slice(2)}${extension}`).find((filename) => fs.existsSync(path.join(root, filename)));
    feature.engineOwner = engineOwner || null;
    feature.directDependencies = engineOwner ? importReferences(engineOwner) : [];
    feature.persistence = {
      stableId: feature.id, slug: feature.slug, namespace: feature.namespace,
      directStorageReferences: engineOwner ? directStorageKeys(engineOwner) : [],
      limitation: 'Direct storage calls only; aliases, hook-managed storage, shared dependencies and live Firestore records need separate verification.',
    };
    feature.acceptance = {
      evidence: null,
      required: ['vary valid inputs and parameters; validate actual transformation and advertised output', 'boundary/invalid input and error/cancel paths', 'reload existing saved data where applicable', 'provider/offline/auth/credits where applicable'],
      limitations: 'Catalog metadata and static imports are not behavior or provider verification. Feature-specific fixtures remain pending.',
    };
  }
  const routes = walk(path.join(root, 'src/app')).filter((filename) => ['page.tsx', 'route.ts', 'not-found.tsx'].includes(path.basename(filename))).map((filename) => ({
    owner: path.relative(root, filename).split(path.sep).join('/'),
    pattern: '/' + path.relative(path.join(root, 'src/app'), path.dirname(filename)).split(path.sep).filter(Boolean).join('/'),
    kind: path.basename(filename) === 'route.ts' ? 'api' : path.basename(filename) === 'not-found.tsx' ? 'not-found' : 'page',
  }));
  const differences = (catalog, loaders) => ({
    missing: catalog.filter((entry) => !loaders.some((loader) => loader.slug === entry.slug)).map((entry) => entry.slug),
    extra: loaders.filter((loader) => !catalog.some((entry) => entry.slug === loader.slug)).map((entry) => entry.slug),
    duplicateIds: duplicates(catalog.map((entry) => entry.id)),
    duplicateSlugs: duplicates(catalog.map((entry) => entry.slug)),
    duplicateLoaderSlugs: duplicates(loaders.map((entry) => entry.slug)),
  });
  const missingTargets = [...toolLoaders, ...appLoaders].filter((entry) => !['.tsx', '.ts'].some((extension) => fs.existsSync(path.join(root, 'src', entry.target.slice(2) + extension))));
  const hubReferences = hubs.flatMap((hub) => ['tools', 'apps'].flatMap((namespace) => (hub[namespace === 'tools' ? 'toolIds' : 'appIds'] || []).map((id) => ({
    hub: hub.id, namespace, id, resolved: features.some((entry) => entry.namespace === namespace && entry.id === id),
    slugLookupResolvesId: features.some((entry) => entry.namespace === namespace && entry.id === id && entry.slug === id),
  }))));
  const relatedReferences = features.flatMap((entry) => entry.relatedTools.map((slug) => ({
    owner: entry.route, slug,
    targets: features.filter((candidate) => candidate.slug === slug).map((candidate) => candidate.route),
  })));
  const legacyTargetDrift = legacyLoaders.filter((entry) => toolLoaders.find((loader) => loader.slug === entry.slug)?.target !== entry.target);
  const editorialRoutes = [
    ...hubs.map((entry) => ({ namespace: 'hubs', slug: entry.slug, status: entry.status, preRendered: entry.status === 'active', catalogOwner: 'src/content/hubs/registry.ts' })),
    ...blogs.map((entry) => ({ namespace: 'blog', slug: entry.slug, preRendered: true, catalogOwner: 'src/content/blog/blogs-data.ts' })),
    ...guides.map((entry) => ({ namespace: 'resources', slug: entry.slug, preRendered: true, catalogOwner: 'src/features/resources/resources-data.ts' })),
  ].map((entry) => ({ ...entry, route: `/${entry.namespace}/${entry.slug}`, routeOwner: `src/app/${entry.namespace}/[slug]/page.tsx` }));
  const canonicalPages = [
    ...routes.filter((entry) => entry.kind === 'page' && !entry.pattern.includes('[')).map((entry) => ({ route: entry.pattern, routeOwner: entry.owner })),
    ...features.map((entry) => ({ route: entry.route, routeOwner: `src/app/${entry.namespace}/[slug]/page.tsx`, preRendered: entry.preRendered })),
    ...editorialRoutes,
  ];
  const editorialReferences = [
    ...blogs.flatMap((post) => [
      ...post.relatedTools.map((entry) => ({ owner: `/blog/${post.slug}`, route: `/tools/${entry.slug}` })),
      ...post.sections.filter((section) => section.toolCallout).map((section) => ({ owner: `/blog/${post.slug}`, route: `/tools/${section.toolCallout.slug}` })),
      ...post.relatedSlugs.map((slug) => ({ owner: `/blog/${post.slug}`, route: `/blog/${slug}` })),
    ]),
    ...guides.flatMap((guide) => guide.recommendedTools.map((entry) => ({ owner: `/resources/${guide.slug}`, route: `/tools/${entry.slug}` }))),
  ];
  const relatedAppReferences = features.flatMap((entry) => entry.relatedApps.map((slug) => ({ owner: entry.route, route: `/apps/${slug}` })));
  const metadataRoutes = ['sitemap.ts', 'robots.ts', 'manifest.ts'].filter((filename) => fs.existsSync(path.join(root, 'src/app', filename))).map((filename) => ({ owner: `src/app/${filename}`, kind: 'metadata' }));
  const routingPolicies = {
    owner: 'src/proxy.ts',
    localePrefixes: literalArray('src/proxy.ts', 'LOCALES'),
    protectedPaths: literalArray('src/proxy.ts', 'PROTECTED_PATHS'),
    authenticatedRedirectPaths: literalArray('src/proxy.ts', 'AUTH_PATHS'),
    limitation: 'Declared proxy policies, not verification of token/role authorization or localized rendering.',
  };
  return { features, routes, metadataRoutes, routingPolicies, canonicalPages, editorialRoutes, editorialReferences, hubs, hubReferences, relatedReferences, relatedAppReferences, toolLoaders, appLoaders, legacyLoaders, integrity: {
    tools: differences(tools, toolLoaders), apps: differences(apps, appLoaders), legacy: differences(tools, legacyLoaders), missingTargets,
    legacyTargetDrift, invalidHubReferences: hubReferences.filter((entry) => !entry.resolved),
    hubSlugLookupMismatches: hubReferences.filter((entry) => !entry.slugLookupResolvesId),
    duplicateHubIds: duplicates(hubs.map((entry) => entry.id)),
    invalidRelatedReferences: relatedReferences.filter((entry) => entry.targets.length === 0),
    invalidRelatedAppReferences: relatedAppReferences.filter((entry) => !canonicalPages.some((page) => page.route === entry.route)),
    invalidEditorialReferences: editorialReferences.filter((entry) => !canonicalPages.some((page) => page.route === entry.route)),
    duplicateCanonicalRoutes: duplicates(canonicalPages.map((entry) => entry.route)),
  } };
}

module.exports = { root, source, loadCatalog, loaderEntries, walk, duplicates, importReferences, literalArray, directStorageKeys, buildInventory };

if (require.main === module) console.log(JSON.stringify(buildInventory(), null, 2));
