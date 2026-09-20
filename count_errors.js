const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx eslint src/ --ext .ts,.tsx --format json', {
    cwd: 'e:/working_projects/mytoolsbox-me_new',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'ignore']
  }).toString();

  const data = JSON.parse(output);
  const counts = {};
  const filesWithErrors = {};

  data.forEach(f => {
    f.messages.filter(m => m.severity === 2).forEach(m => {
      const rule = m.ruleId || 'syntax';
      counts[rule] = (counts[rule] || 0) + 1;
      if (!filesWithErrors[rule]) filesWithErrors[rule] = new Set();
      filesWithErrors[rule].add(f.filePath);
    });
  });

  console.log('=== Errors by rule ===');
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(v + '\t' + k + ' (' + filesWithErrors[k].size + ' files)');
  });

  console.log('\n=== Files with most errors ===');
  const fileCounts = {};
  data.forEach(f => {
    const errCount = f.messages.filter(m => m.severity === 2).length;
    if (errCount > 0) fileCounts[f.filePath] = errCount;
  });
  Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => {
    console.log(v + '\t' + k.replace('E:/working_projects/mytoolsbox-me_new/', ''));
  });
} catch (e) {
  console.error('Error:', e.message);
}