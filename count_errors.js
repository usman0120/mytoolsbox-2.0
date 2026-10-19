const path = require('node:path');
const { ESLint } = require('eslint');

function summarize(results) {
  const rules = new Map();
  const files = [];
  let warnings = 0;
  for (const result of results) {
    warnings += result.warningCount;
    if (result.errorCount > 0) files.push({ file: path.relative(__dirname, result.filePath).split(path.sep).join('/'), errors: result.errorCount });
    for (const message of result.messages.filter((entry) => entry.severity === 2)) {
      const rule = message.ruleId || 'syntax';
      const record = rules.get(rule) || { rule, errors: 0, files: new Set() };
      record.errors += 1;
      record.files.add(result.filePath);
      rules.set(rule, record);
    }
  }
  return {
    errors: results.reduce((total, result) => total + result.errorCount, 0), warnings,
    rules: [...rules.values()].map((record) => ({ rule: record.rule, errors: record.errors, files: record.files.size })).sort((first, second) => second.errors - first.errors),
    files: files.sort((first, second) => second.errors - first.errors),
  };
}

async function main(patterns = process.argv.slice(2)) {
  const eslint = new ESLint({ cwd: __dirname });
  const report = summarize(await eslint.lintFiles(patterns.length ? patterns : ['src/**/*.{ts,tsx}']));
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.errors > 0 ? 1 : 0;
}

module.exports = { summarize };
if (require.main === module) main().catch((error) => {
  console.error(error.message);
  process.exitCode = 2;
});