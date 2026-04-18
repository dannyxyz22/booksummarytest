const fs = require('fs');
const path = require('path');
const epub = require('epub-gen');
const { marked, Lexer } = require('marked');
const PDFDocument = require('pdfkit');

const summaryConfigPath = path.join(__dirname, 'public/data/summaries.json');

const epubDir = path.join(__dirname, 'public/data/epubs');
const pdfDir  = path.join(__dirname, 'public/data/pdfs');
const booksDir = path.join(__dirname, 'public/data/books');

if (!fs.existsSync(epubDir))  fs.mkdirSync(epubDir,  { recursive: true });
if (!fs.existsSync(pdfDir))   fs.mkdirSync(pdfDir,   { recursive: true });
if (!fs.existsSync(booksDir)) fs.mkdirSync(booksDir, { recursive: true });

// ─── Color palette (mirrors the webapp CSS variables) ────────────────────────
const C = {
    green:   '#1a3d2b',  // cover background
    gold:    '#b08d57',  // accent gold (--accent-gold)
    crimson: '#8b1d1d',  // deep crimson (--accent-color)
    body:    '#1a1a1a',  // --text-primary
    muted:   '#5e5e5e',  // --text-secondary
    rule:    '#d4c5a9',  // light warm rule line
};

function stripInline(text) {
    return (text || '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g,     '$1')
        .replace(/__([^_]+)__/g,     '$1')
        .replace(/_([^_]+)_/g,       '$1');
}

function drawHRule(doc, x, y, w, color, thickness) {
    color     = color     || '#d4c5a9';
    thickness = thickness || 0.5;
    doc.save()
       .moveTo(x, y).lineTo(x + w, y)
       .lineWidth(thickness).strokeColor(color).stroke()
       .restore();
}

// ─── TOC Utilities ───────────────────────────────────────────────────────────

function generateSlug(text) {
    return stripInline(text)
        .toLowerCase()
        .replace(/\./g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .replace(/-+/g, '-');
}

function stripToc(content) {
    return content.replace(
        /^#{1,2}\s*Índice\s*\n(?:[\t ]*[-*]\s*\[.*?\]\(#[^)]*\)\s*\n|\s*\n)*(?:---\s*\n)?(?:\s*\n)*/m,
        ''
    );
}

function extractHeadings(content) {
    const headings = [];
    for (const line of content.split('\n')) {
        const m = line.match(/^(#{1,3})\s+(.+)$/);
        if (m) {
            headings.push({
                depth: m[1].length,
                text:  stripInline(m[2].trim()),
                slug:  generateSlug(m[2])
            });
        }
    }
    return headings;
}

function buildTocMarkdown(headings) {
    // Skip the very first H1 (the book title)
    const items = headings.slice(headings.length > 0 && headings[0].depth === 1 ? 1 : 0);
    if (items.length === 0) return '';
    const minDepth = Math.min(...items.map(h => h.depth));
    let md = '## Índice\n\n';
    for (const h of items) {
        md += `${'  '.repeat(h.depth - minDepth)}- [${h.text}](#${h.slug})\n`;
    }
    return md;
}

function injectToc(content, tocMd) {
    if (!tocMd) return content;
    // Insert after the first H1 and any following blank lines / horizontal rule
    const m = content.match(/^(#\s+.+\n(?:\s*\n)*(?:---\s*\n(?:\s*\n)*)?)/m);
    if (m) {
        const pos = m.index + m[0].length;
        return content.slice(0, pos) + tocMd + '\n---\n\n' + content.slice(pos);
    }
    return tocMd + '\n---\n\n' + content;
}

function addHeadingIds(html) {
    return html.replace(/<h([1-6])(?:\s+id="[^"]*")?>(.*?)<\/h\1>/gi, (_, level, inner) => {
        const plain = inner.replace(/<[^>]+>/g, '');
        return `<h${level} id="${generateSlug(plain)}">${inner}</h${level}>`;
    });
}

function loadSummaryFiles() {
    const raw = fs.readFileSync(summaryConfigPath, 'utf8');
    const entries = JSON.parse(raw);

    if (!Array.isArray(entries)) {
        throw new Error('public/data/summaries.json must contain an array of book definitions.');
    }

    return entries.map((entry) => {
        const { id, path: filePath, title, author, year, cover, enabled, description } = entry;

        if (!id || !filePath || !title || !author || !cover) {
            throw new Error(`Book entry is missing required fields: ${JSON.stringify({ id, path: filePath, title, author, cover })}`);
        }

        return { id, path: filePath, title, author, year, cover, enabled, description };
    });
}

function cleanupOrphanedFiles(dirPath, expectedFileNames) {
    const expected = new Set(expectedFileNames);

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        if (expected.has(entry.name)) continue;

        const filePath = path.join(dirPath, entry.name);
        fs.unlinkSync(filePath);
        console.log(`Removed orphaned file ${path.relative(__dirname, filePath)}`);
    }
}

function generatePdf(file, content, headings, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                bufferPages: true,
                margins: { top: 72, bottom: 72, left: 72, right: 72 },
                info: {
                    Title:   file.title,
                    Author:  file.author,
                    Subject: 'Summa Brevis \u2014 Resumo',
                    Creator: 'Summa Brevis'
                }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            const ML    = doc.page.margins.left;
            const MR    = doc.page.margins.right;
            const MT    = doc.page.margins.top;
            const MB    = doc.page.margins.bottom;
            const pageW = doc.page.width  - ML - MR;
            const pageH = doc.page.height - MT - MB;

            // ══════════════════════════════════════════════════════════════
            //  COVER PAGE – dark green with gold borders and lettering
            // ══════════════════════════════════════════════════════════════
            // Fill entire page with deep green
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.green);

            // Outer gold border
            doc.save()
               .rect(18, 18, doc.page.width - 36, doc.page.height - 36)
               .lineWidth(5).strokeColor(C.gold).stroke()
               .restore();

            // Inner thin gold border
            doc.save()
               .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
               .lineWidth(0.8).strokeColor(C.gold).stroke()
               .restore();

            // "SUMMA BREVIS" small label at top center
            doc.fontSize(9).font('Times-Italic').fillColor(C.gold)
               .text('SUMMA BREVIS', ML, MT + 10, {
                   width: pageW, align: 'center', characterSpacing: 4
               });

            // Gold ornament line above title
            const ruleY1 = doc.page.height / 2 - 90;
            drawHRule(doc, ML + 20, ruleY1, pageW - 40, C.gold, 1.2);

            // Title
            doc.fontSize(30).font('Times-Bold').fillColor(C.gold)
               .text(file.title, ML, ruleY1 + 16, { width: pageW, align: 'center', lineGap: 5 });

            // Gold ornament line below title
            const ruleY2 = doc.y + 12;
            drawHRule(doc, ML + 20, ruleY2, pageW - 40, C.gold, 1.2);

            // Author
            doc.fontSize(14).font('Times-Italic').fillColor('#c9a855')
               .text(file.author, ML, ruleY2 + 18, { width: pageW, align: 'center' });

            // Year
            if (file.year) {
                doc.moveDown(0.4);
                doc.fontSize(11).font('Times-Roman').fillColor('#aaaaaa')
                   .text(String(file.year), { width: pageW, align: 'center' });
            }

            // Bottom ornament
            doc.fontSize(14).font('Times-Roman').fillColor(C.gold)
               .text('- * -', ML, doc.page.height - MB - 40, {
                   width: pageW, align: 'center'
               });

            // ══════════════════════════════════════════════════════════════
            //  TABLE OF CONTENTS PAGE
            // ══════════════════════════════════════════════════════════════
            const tocItems = headings.slice(
                headings.length > 0 && headings[0].depth === 1 ? 1 : 0
            );
            if (tocItems.length > 0) {
                doc.addPage();
                const tocMinDepth = Math.min(...tocItems.map(h => h.depth));

                doc.fontSize(20).font('Times-Bold').fillColor(C.gold)
                   .text('Índice', ML, MT, { width: pageW, align: 'center' });
                doc.moveDown(0.5);
                drawHRule(doc, ML + 40, doc.y, pageW - 80, C.gold, 1);
                doc.moveDown(1.5);

                for (const h of tocItems) {
                    const indent = (h.depth - tocMinDepth) * 20;
                    const fSize  = h.depth <= tocMinDepth ? 11.5
                                 : h.depth <= tocMinDepth + 1 ? 10.5 : 9.5;
                    const fFont  = h.depth <= tocMinDepth ? 'Times-Bold' : 'Times-Roman';
                    const fColor = h.depth <= tocMinDepth ? C.crimson : C.body;

                    doc.fontSize(fSize).font(fFont).fillColor(fColor)
                       .text(h.text, ML + indent, doc.y, {
                           width: pageW - indent,
                           goTo: h.slug
                       });
                    doc.moveDown(h.depth <= tocMinDepth ? 0.4 : 0.2);
                }
            }

            // ══════════════════════════════════════════════════════════════
            //  CONTENT PAGES
            // ══════════════════════════════════════════════════════════════
            doc.addPage();
            doc.fillColor(C.body);

            const tokens = Lexer.lex(content);
            let firstH1Done = false;

            for (const token of tokens) {
                switch (token.type) {

                    case 'heading': {
                        const depth = token.depth;
                        const hText = stripInline(token.text);
                        const hSlug = generateSlug(token.text);
                        doc.addNamedDestination(hSlug);

                        if (depth === 1) {
                            if (firstH1Done) doc.addPage();
                            firstH1Done = true;
                            // Large gold chapter title
                            doc.fontSize(24).font('Times-Bold').fillColor(C.gold)
                               .text(hText, ML, doc.y, { width: pageW, align: 'left' });
                            doc.moveDown(0.25);
                            drawHRule(doc, ML, doc.y, pageW, C.gold, 1.5);
                            doc.moveDown(1.2);
                            doc.fillColor(C.body);

                        } else if (depth === 2) {
                            doc.moveDown(1.2);
                            // Crimson section header
                            doc.fontSize(13.5).font('Times-Bold').fillColor(C.crimson)
                               .text(hText, { width: pageW });
                            doc.moveDown(0.15);
                            drawHRule(doc, ML, doc.y, pageW * 0.55, C.rule, 0.7);
                            doc.moveDown(0.65);
                            doc.fillColor(C.body);

                        } else {
                            // Gold italic sub-heading
                            doc.moveDown(0.8);
                            doc.fontSize(11).font('Times-BoldItalic').fillColor(C.gold)
                               .text(hText, { width: pageW });
                            doc.moveDown(0.35);
                            doc.fillColor(C.body);
                        }
                        break;
                    }

                    case 'paragraph': {
                        doc.fontSize(11).font('Times-Roman').fillColor(C.body)
                           .text(stripInline(token.text), {
                               width: pageW, align: 'justify', lineGap: 3
                           });
                        doc.moveDown(0.65);
                        break;
                    }

                    case 'list': {
                        const INDENT = 20; // px indent for bullet items
                        for (const item of token.items) {
                            const raw = stripInline(item.text);
                            // Detect bold label pattern: "Label: rest…"
                            const colonIdx = raw.indexOf(':');
                            const hasLabel = colonIdx > 0 && colonIdx < 55;

                            if (hasLabel) {
                                const label = raw.substring(0, colonIdx).trim();
                                const rest  = raw.substring(colonIdx + 1).trim();
                                // Render label line in crimson bold
                                doc.fontSize(11).font('Times-Bold').fillColor(C.crimson)
                                   .text('-  ' + label + ':', ML + INDENT, doc.y, {
                                       width: pageW - INDENT
                                   });
                                // Render body text in normal below, slightly more indented
                                doc.fontSize(11).font('Times-Roman').fillColor(C.body)
                                   .text(rest, ML + INDENT + 10, doc.y, {
                                       width: pageW - INDENT - 10,
                                       align: 'justify',
                                       lineGap: 2
                                   });
                            } else {
                                doc.fontSize(11).font('Times-Roman').fillColor(C.body)
                                   .text('-  ' + raw, ML + INDENT, doc.y, {
                                       width: pageW - INDENT,
                                       lineGap: 2,
                                       align: 'left'
                                   });
                            }
                            doc.moveDown(0.45);
                        }
                        doc.moveDown(0.2);
                        break;
                    }

                    case 'space':
                        doc.moveDown(0.5);
                        break;

                    default:
                        break;
                }
            }

            // ══════════════════════════════════════════════════════════════
            //  FOOTER – on every page except the cover (page index 0)
            // ══════════════════════════════════════════════════════════════
            const range = doc.bufferedPageRange();
            for (let i = 0; i < range.count; i++) {
                if (i === 0) continue;   // skip cover
                doc.switchToPage(range.start + i);
                
                // Force-disable margins for this operation to prevent auto-page breaks
                const oldBottom = doc.page.margins.bottom;
                doc.page.margins.bottom = 0;
                doc.options.margins.bottom = 0;
                
                const footerY = doc.page.height - 30; // 30 points from bottom edge
                
                // Draw rule and text at absolute Y
                drawHRule(doc, ML, footerY - 8, pageW, C.rule, 0.4);
                
                doc.fontSize(7.5).font('Times-Italic').fillColor(C.muted)
                   .text(
                       `Summa Brevis  \u00b7  ${file.title}  \u00b7  P\u00e1gina ${i} de ${range.count - 1}`,
                       ML, footerY,
                       { width: pageW, align: 'center', lineBreak: false }
                   );
                
                // Restore margins for next potential operations
                doc.page.margins.bottom = oldBottom;
                doc.options.margins.bottom = oldBottom;
            }

            doc.end();
            stream.on('finish', () => {
                console.log(`PDF generated for ${file.id}`);
                resolve();
            });
            stream.on('error', reject);

        } catch (err) {
            reject(err);
        }
    });
}

const processFiles = async () => {
    const summaryFiles = loadSummaryFiles();
    const summaryIndex = [];

    cleanupOrphanedFiles(booksDir, summaryFiles.map((file) => `${file.id}.json`));
    cleanupOrphanedFiles(epubDir, summaryFiles.map((file) => `${file.id}.epub`));
    cleanupOrphanedFiles(pdfDir, summaryFiles.map((file) => `${file.id}.pdf`));

    for (const file of summaryFiles) {
        if (file.enabled === false) {
            console.log(`Skipping disabled book: ${file.title}`);
            summaryIndex.push(file);
            continue;
        }
        try {
            const absolutePath = path.resolve(__dirname, file.path);
            const rawContent = fs.readFileSync(absolutePath, 'utf8').replace(/\r\n/g, '\n');

            // Strip existing TOC, generate a fresh one
            const cleanContent = stripToc(rawContent);
            const headings = extractHeadings(cleanContent);
            const tocMd = buildTocMarkdown(headings);
            const contentWithToc = injectToc(cleanContent, tocMd);

            // Calculate reading time from clean content
            const words = cleanContent.split(/\s+/).length;
            const readingTime = Math.ceil(words / 200);

            // Refined extraction: find the first real paragraph
            const lines = cleanContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let description = '';
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('#')) continue;
                if (/^[\-\*_]{3,}$/.test(line)) continue;
                if (line.startsWith('*(') || (line.startsWith('(') && line.endsWith(')'))) continue;
                if (line.length < 150) continue;

                description = line.replace(/[\*_]{1,2}/g, '').substring(0, 400).trim();

                if (line.length > 400) {
                    const lastSpace = description.lastIndexOf(' ');
                    if (lastSpace > 350) {
                        description = description.substring(0, lastSpace);
                    }
                    description += '...';
                }
                break;
            }

            // Generate EPUB
            const epubPath = path.join(epubDir, `${file.id}.epub`);
            const htmlContent = addHeadingIds(marked(contentWithToc));

            const option = {
                title: file.title,
                author: file.author,
                content: [
                    {
                        title: 'Resumo',
                        data: htmlContent
                    }
                ]
            };

            await new Promise((resolve, reject) => {
                new epub(option, epubPath).promise.then(() => {
                    console.log(`EPUB generated for ${file.id}`);
                    resolve();
                }, (err) => {
                    console.error(`Error generating EPUB for ${file.id}:`, err);
                    reject(err);
                });
            });

            // Generate PDF
            const pdfPath = path.join(pdfDir, `${file.id}.pdf`);
            await generatePdf(file, cleanContent, headings, pdfPath);

            const fullBookData = {
                ...file,
                content: contentWithToc,
                description,
                readingTime,
                epubPath: `data/epubs/${file.id}.epub`,
                pdfPath:  `data/pdfs/${file.id}.pdf`
            };

            // Save individual book data
            const bookOutputPath = path.join(booksDir, `${file.id}.json`);
            fs.writeFileSync(bookOutputPath, JSON.stringify(fullBookData, null, 2));

            // Add to lightweight index (exclude content)
            const { content: _, ...metadata } = fullBookData;
            summaryIndex.push(metadata);

        } catch (error) {
            console.error(`Error processing ${file.path}:`, error.message);
        }
    }

    // Sort alphabetically by title
    summaryIndex.sort((a, b) => a.title.localeCompare(b.title));

    fs.writeFileSync(summaryConfigPath, JSON.stringify(summaryIndex, null, 2));
    console.log(`Processed ${summaryIndex.length} summaries to index and individual files.`);

    // ─── Generate Sitemap ────────────────────────────────────────────────────
    generateSitemap(summaryIndex);
};

function generateSitemap(summaries) {
    const baseUrl = 'https://dannyxyz22.github.io/booksummarytest'; // Update if using a custom domain
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Note: We are no longer adding fragment URLs (e.g., #book/id) 
    // because Google Search Console does not support fragments in sitemaps.
    // The crawler will discover these sub-pages via the internal links on the home page.

    xml += `</urlset>`;

    const sitemapPath = path.join(__dirname, 'public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Sitemap generated at ${path.relative(__dirname, sitemapPath)} (root only to avoid fragment issues).`);
}

processFiles();
