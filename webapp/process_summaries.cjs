const fs = require('fs');
const path = require('path');
const epub = require('epub-gen');
const { marked } = require('marked');

const summaryFiles = [
    {
        id: 'dialogo-sena',
        path: '../CathBlinkDialogo.md',
        title: 'Diálogos',
        author: 'Santa Catarina de Sena',
        year: 1378,
        cover: 'assets/covers/dialogo.png'
    },
    {
        id: 'cartas-sena',
        path: '../LetterSenaSummary.md',
        title: 'Cartas',
        author: 'Santa Catarina de Sena',
        year: 1380,
        cover: 'assets/covers/cartas.png'
    },
    {
        id: 'noite-escura',
        path: '../summaries/DarkNightofSoul_RESUMO_FINAL.md',
        title: 'A Noite Escura da Alma',
        author: 'São João da Cruz',
        year: 1579,
        cover: 'assets/covers/noite-escura.png'
    },
    {
        id: 'crescimento-santidade-analitico',
        path: '../summaries/resumo_crescimento_na_santidade_faber.md',
        title: 'Crescimento na Santidade',
        author: 'William Faber',
        year: 1854,
        cover: 'assets/covers/crescimento.png'
    },
    {
        id: 'life-glories-joseph',
        path: '../summaries/LifeGloriesJoseph_Fluid.md',
        title: 'Vida e Glórias de São José',
        author: 'Edward Healy Thompson',
        year: 1888,
        cover: 'assets/covers/life-glories-joseph.png'
    }
];

const epubDir = path.join(__dirname, 'public/data/epubs');
const booksDir = path.join(__dirname, 'public/data/books');

if (!fs.existsSync(epubDir)) fs.mkdirSync(epubDir, { recursive: true });
if (!fs.existsSync(booksDir)) fs.mkdirSync(booksDir, { recursive: true });

const processFiles = async () => {
    const summaryIndex = [];

    for (const file of summaryFiles) {
        try {
            const absolutePath = path.resolve(__dirname, file.path);
            const content = fs.readFileSync(absolutePath, 'utf8');

            // Calculate reading time
            const words = content.split(/\s+/).length;
            const readingTime = Math.ceil(words / 200);

            // Refined extraction: find the first real paragraph
            const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
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
            const htmlContent = marked(content);

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

            const fullBookData = {
                ...file,
                content,
                description,
                readingTime,
                epubPath: `data/epubs/${file.id}.epub`
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

    const indexOutputPath = path.join(__dirname, 'public/data/summaries.json');
    fs.writeFileSync(indexOutputPath, JSON.stringify(summaryIndex, null, 2));
    console.log(`Processed ${summaryIndex.length} summaries to index and individual files.`);
};

processFiles();
