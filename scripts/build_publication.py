import os
import re

summaries_dir = 'summaries/diary_st_faustina_batches'

# Read all batches
batches = {}
for i in range(1, 26):
    path = os.path.join(summaries_dir, f'batch_{i}.md')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Remove the first H1 title
        content = re.sub(r'^#[^\n]+\n', '', content, count=1).strip()
        batches[i] = content

# Thematic part groupings
parts = [
    ('Parte I — Chamado e Formação', [1, 2]),
    ('Parte II — Os Votos, a Missão e Vilnius', [3, 4, 5, 6]),
    ('Parte III — A Imagem, o Terço e as Profecias', [7, 8, 9, 10]),
    ('Parte IV — O Segundo Caderno: Revelações e Congregação', [11, 12, 13, 14]),
    ('Parte V — Prądnik, os Esponsais e a Festa da Misericórdia', [15, 16, 17]),
    ('Parte VI — O Caderno Final: Martírio, Oblação e Partida', list(range(18, 26))),
]

lines = []
lines.append('# O Diário de Santa Maria Faustina Kowalska')
lines.append('')
lines.append('## *A Misericórdia Divina em Minha Alma*')
lines.append('')
lines.append('*Resumo editorial expandido em português*')
lines.append('')
lines.append('---')
lines.append('')
lines.append('## Nota Editorial')
lines.append('')
lines.append(
    'Este resumo condensa o *Diário de Santa Maria Faustina Kowalska: A Misericórdia Divina em Minha Alma* '
    '(Marianos da Imaculada Conceição, Stockbridge, MA), preservando a densidade teológica, a riqueza mística '
    'e o contexto histórico do original. O texto foi organizado em seis partes temáticas que seguem o arco '
    'biográfico e espiritual de Santa Faustina, desde sua infância camponesa na Polônia até a morte por '
    'tuberculose em 1938, aos 33 anos de idade. Os números entre parênteses referem-se à numeração canônica '
    'do Diário original. Todos os arquivos-fonte e os resumos por lote individuais foram preservados '
    'integralmente.'
)
lines.append('')
lines.append('---')
lines.append('')

# Build each part
for part_title, batch_nums in parts:
    lines.append(f'## {part_title}')
    lines.append('')
    for bn in batch_nums:
        if bn in batches:
            lines.append(batches[bn])
            lines.append('')
    lines.append('---')
    lines.append('')

lines.append('## Nota Final')
lines.append('')
lines.append(
    '*Fonte: Diário de Santa Maria Faustina Kowalska — A Misericórdia Divina em Minha Alma. '
    '© Congregação dos Marianos da Imaculada Conceição, Stockbridge, MA 01263. '
    'Utilizado com autorização. Para adquirir o Diário completo, visite o site dos Marianos da Imaculada Conceição.*'
)
lines.append('')

output = '\n'.join(lines)
out_path = 'summaries/diary_st_faustina_publication.md'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)

word_count = len(output.split())
size_kb = len(output.encode('utf-8')) / 1024
print(f'Publication file written: {out_path}')
print(f'Word count: {word_count}')
print(f'File size: {size_kb:.1f} KB')
