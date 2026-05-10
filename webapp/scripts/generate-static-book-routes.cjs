const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const summariesPath = path.join(distDir, 'data', 'summaries.json');
const bookRoutesDir = path.join(distDir, 'book');
const booksDataDir = path.join(distDir, 'data', 'books');
const siteBaseUrl = 'https://summa.legatuschristi.org';

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateDescription(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Resumo católico clássico disponível para leitura online, EPUB e PDF no Summa Brevis.';
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
}

function toAbsoluteAsset(pathValue) {
  const normalized = String(pathValue || '').replace(/^\/+/, '');
  return `${siteBaseUrl}/${normalized}`;
}

function buildBookSeoBlock(book) {
  const canonical = `${siteBaseUrl}/book/${encodeURIComponent(book.id)}/`;
  const title = `${book.title} | Summa Brevis`;
  const description = truncateDescription(book.description);
  const image = toAbsoluteAsset(book.cover || 'assets/covers/thumbs/imitao-maria.webp');
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    image,
    url: canonical,
    inLanguage: 'pt-BR',
    datePublished: book.year ? String(book.year) : undefined,
    description
  });

  return [
    '<!-- SEO_DYNAMIC_START -->',
    `    <title>${escapeHtml(title)}</title>`,
    `    <meta name="description" content="${escapeHtml(description)}" />`,
    '    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />',
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '',
    '    <meta property="og:type" content="article" />',
    '    <meta property="og:site_name" content="Summa Brevis" />',
    `    <meta property="og:title" content="${escapeHtml(title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `    <meta property="og:image" content="${escapeHtml(image)}" />`,
    '',
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(image)}" />`,
    '',
    '    <script id="ld-json-site" type="application/ld+json">',
    `      ${jsonLd}`,
    '    </script>',
    '<!-- SEO_DYNAMIC_END -->'
  ].join('\n');
}

function buildContentBlock(book) {
  const bookDataPath = path.join(booksDataDir, `${book.id}.json`);
  if (!fs.existsSync(bookDataPath)) return '<!-- SSG_CONTENT_START --><!-- SSG_CONTENT_END -->';

  const bookData = JSON.parse(fs.readFileSync(bookDataPath, 'utf8'));
  if (!bookData.content) return '<!-- SSG_CONTENT_START --><!-- SSG_CONTENT_END -->';

  const html = marked.parse(bookData.content);
  return `<!-- SSG_CONTENT_START -->
    <div id="ssg-content" hidden>
${html}
    </div>
<!-- SSG_CONTENT_END -->`;
}

function generateStaticBookRoutes() {
  ensureFile(indexPath);
  ensureFile(summariesPath);

  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const summaries = JSON.parse(fs.readFileSync(summariesPath, 'utf8'));
  const enabledBooks = summaries.filter((book) => book.enabled !== false);
  const seoRegex = /<!-- SEO_DYNAMIC_START -->[\s\S]*?<!-- SEO_DYNAMIC_END -->/;
  const contentRegex = /<!-- SSG_CONTENT_START -->[\s\S]*?<!-- SSG_CONTENT_END -->/;

  if (!seoRegex.test(indexHtml)) {
    throw new Error('SEO marker block not found in dist/index.html.');
  }
  if (!contentRegex.test(indexHtml)) {
    throw new Error('SSG content marker block not found in dist/index.html.');
  }

  fs.rmSync(bookRoutesDir, { recursive: true, force: true });

  for (const book of enabledBooks) {
    const routeDir = path.join(bookRoutesDir, encodeURIComponent(book.id));
    fs.mkdirSync(routeDir, { recursive: true });
    let routeHtml = indexHtml.replace(seoRegex, buildBookSeoBlock(book));
    routeHtml = routeHtml.replace(contentRegex, buildContentBlock(book));
    fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);
  }

  console.log(`Generated ${enabledBooks.length} static book routes in dist/book.`);
}

generateStaticBookRoutes();