const fs = require('fs');
const path = require('path');

const summariesDir = 'c:\\Users\\danny\\code\\agent-book-summarizer\\summaries\\life_glories_summaries';
const outputFile = 'c:\\Users\\danny\\code\\agent-book-summarizer\\summaries\\LifeGloriesJoseph.md';

const files = fs.readdirSync(summariesDir)
  .filter(f => f.startsWith('summary_batch_') && f.endsWith('.md'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`Consolidating ${files.length} batches...`);

let fullContent = '';

files.forEach(file => {
  const content = fs.readFileSync(path.join(summariesDir, file), 'utf8');
  fullContent += content + '\n\n---\n\n';
});

fs.writeFileSync(outputFile, fullContent);
console.log(`Saved to ${outputFile}`);
