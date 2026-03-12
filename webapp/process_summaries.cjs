const fs = require('fs');
const path = require('path');
const epub = require('epub-gen');
const { marked } = require('marked');

const summaryFiles = [
    {
        id: 'dialogo-sena',
        path: '../DialogoSenaSummary.md',
        title: 'Diálogos de Santa Catarina de Sena',
        author: 'Santa Catarina de Sena',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'cartas-sena',
        path: '../LetterSenaSummary.md',
        title: 'Cartas de Santa Catarina de Sena',
        author: 'Santa Catarina de Sena',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'noite-escura',
        path: '../summaries/DarkNightofSoul_RESUMO_FINAL.md',
        title: 'A Noite Escura da Alma',
        author: 'São João da Cruz',
        cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'dialogo-blink',
        path: '../cath-blink-DIalogo.md',
        title: 'Diálogo (Versão Blink)',
        author: 'Santa Catarina de Sena',
        cover: 'https://images.unsplash.com/photo-1474932430478-3a7fb9065ba0?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'crescimento-santidade',
        path: '../summaries/Faber_Progress_Summary.md',
        title: 'O Crescimento em Santidade',
        author: 'Frederick William Faber',
        cover: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'
    }
];

const epubDir = path.join(__dirname, 'public/data/epubs');
if (!fs.existsSync(epubDir)) {
    fs.mkdirSync(epubDir, { recursive: true });
}

const processFiles = async () => {
    const summaries = [];

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
                if (line.length < 30) continue;

                // Take up to 400 chars for a better card preview
                description = line.replace(/[\*_]{1,2}/g, '').substring(0, 400).trim();

                // Ensure it ends nicely
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

            summaries.push({
                ...file,
                content,
                description,
                readingTime,
                epubPath: `data/epubs/${file.id}.epub`
            });
        } catch (error) {
            console.error(`Error processing ${file.path}:`, error.message);
        }
    }

    const outputPath = path.join(__dirname, 'public/data/summaries.json');
    fs.writeFileSync(outputPath, JSON.stringify(summaries, null, 2));
    console.log(`Processed ${summaries.length} summaries to ${outputPath}`);
};

processFiles();
