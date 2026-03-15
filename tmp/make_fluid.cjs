const fs = require('fs');

const inputFile = 'c:\\Users\\danny\\code\\agent-book-summarizer\\summaries\\LifeGloriesJoseph.md';
const outputFile = 'c:\\Users\\danny\\code\\agent-book-summarizer\\summaries\\LifeGloriesJoseph_Fluid.md';

let content = fs.readFileSync(inputFile, 'utf8');

// Remove horizontal rules
content = content.replace(/\n---\n/g, '\n');

// Remove "Resumo Detalhado do Lote X: Title" headers but keep the title as a subsection header if it's useful
// Or just remove those lines entirely to make it fluid. 
// Let's remove them and the intro/outro sentences.
const lines = content.split('\n');
const resultLines = [];

const batchHeaderRegex = /^# Resumo (Detalhado )?do Lote \d+: (.*)/i;
const introRegex = /^(Este|O) (lote|trecho|capítulo|resumo).*/i;
const outroRegex = /^(O lote|Este lote|O resumo|A obra|Este resumo).*(termina|encerra|conclui|finaliza|traz|detalha|destaca|contém).*/i;
const transitionRegex = /.*(neste lote|neste trecho|neste capítulo|do lote|do trecho).*/i;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (batchHeaderRegex.test(line)) {
    // Optionally keep the title part of the header as a ## header
    const match = line.match(batchHeaderRegex);
    if (match && match[2]) {
      // resultLines.push(`## ${match[2]}`); // Not keeping to be "fluid"
    }
    continue;
  }
  
  if (introRegex.test(line)) continue;
  if (outroRegex.test(line)) continue;
  if (transitionRegex.test(line)) continue;
  if (line === '---') continue;

  resultLines.push(lines[i]);
}

let fluidContent = resultLines.join('\n');

// Post-processing replacements
fluidContent = fluidContent.replace(/Neste lote/gi, 'nesta parte');
fluidContent = fluidContent.replace(/do lote/gi, '');
fluidContent = fluidContent.replace(/cada lote/gi, 'cada parte');
fluidContent = fluidContent.replace(/resumo detalhado/gi, 'resumo');
fluidContent = fluidContent.replace(/lote final/gi, 'trecho final');
fluidContent = fluidContent.replace(/O lote /g, 'A obra ');
fluidContent = fluidContent.replace(/Este lote /g, 'Este trecho ');
fluidContent = fluidContent.replace(/Este segundo lote /g, 'Este segundo trecho ');
fluidContent = fluidContent.replace(/A obra encerra/g, 'O resumo encerra');
fluidContent = fluidContent.replace(/O resumo encerra/g, 'O texto encerra');

// Remove multiple consecutive newlines
fluidContent = fluidContent.replace(/\n{3,}/g, '\n\n');

// Add a main title
fluidContent = '# A Vida e Glórias de São José: Resumo Integral e Fluido\n\n' + fluidContent.trim();

fs.writeFileSync(outputFile, fluidContent);
console.log(`Saved fluid version to ${outputFile}`);
