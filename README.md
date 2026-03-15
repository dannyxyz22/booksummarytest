# Book Summarizer & Library

Um projeto completo de curadoria literária e plataforma de leitura. Este repositório contém os resumos originais misticos e a aplicação web para leitura imersiva.

## Estrutura do Projeto

- `/webapp`: Aplicação React/Vite (o leitor imersivo).
- `/*Summary.md`: Resumos consolidados prontos para processamento.
- `/summaries`: Versões finais e refinadas dos textos.
- `/archive`: Histórico de processamento e arquivos temporários.
- `.gemini/skills`: Instruções e regras de estilo para a IA.

## Funcionalidades
- **Design Editorial**: Estética refinada de Biblioteca Clássica inspirada em encadernações de couro e tipografia de alto padrão (Cormorant Garamond e Inter).
- **Progresso de Leitura**: Barra de progresso horizontal adaptável (mobile/desktop).
- **Exportação**: Download de resumos em formato .PDF (via print) e .EPUB (pré-gerado).
- **Tempo de Leitura**: Estimativa automática baseada no volume de texto.

## Como Adicionar um Novo Resumo

> **💡 Dica Rápida:** A forma mais fácil, rápida e recomendada de adicionar um novo volume é pedindo para mim (a Inteligência Artificial) usar a skill `PublishSummary`. Basta dizer: **"Use a skill PublishSummary para publicar um novo livro"** e eu cuidarei da capa, do código e do processamento automaticamente para você!

Se preferir fazer o processo **manualmente**, para disponibilizar um novo livro no catálogo da Summa Brevis, siga estes passos:

1. **Adicione o Arquivo de Texto**: 
   - Coloque o markdown do resumo na pasta raiz do projeto ou em `/summaries` (ex: `MeuNovoResumo.md`).

2. **Gere a Capa com Inteligência Artificial**:
   - Peça ao Assistente para gerar uma imagem seguindo o prompt padrão do projeto:
     > *"A classic Catholic theological book cover. [Cor] leather binding, gold foil stamping. Title: '[Título do Livro]'. Author: '[Nome do Autor]'. Minimalist [Símbolo] symbol in the center. Elegant, sacred, antique library aesthetic. Centered text."*
   - Após a geração, salve a imagem na pasta `webapp/public/assets/covers/` com um nome simples (ex: `meulivro.png`).

3. **Registre o Livro no Sistema**:
   - Abra o arquivo `webapp/process_summaries.cjs`.
   - Adicione um novo objeto na array `summaryFiles` preenchendo as informações:
     ```javascript
     {
         id: 'meu-livro', // ID único para a URL e o EPUB
         path: '../summaries/MeuNovoResumo.md', // Caminho relativo do arquivo MD
         title: 'Título do Livro',
         author: 'Autor do Livro',
         cover: 'assets/covers/meulivro.png' // Caminho da capa gerada
     }
     ```

4. **Processe as Modificações**:
   - Dentro da pasta `webapp`, rode o comando:
     ```bash
     node process_summaries.cjs
     ```
   - Isso irá atualizar o `summaries.json` e gerar automaticamente o arquivo .EPUB para download!

## Desenvolvimento

**Importante**: Todos os comandos de desenvolvimento e deploy devem ser executados dentro da pasta `/webapp`.

Para rodar o projeto localmente:

1. Entre na pasta da aplicação:
   ```bash
   cd webapp
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

2. Processe os resumos e inicie o servidor de desenvolvimento:
   ```bash
   node process_summaries.cjs
   npm run dev
   ```

## Pré-requisitos para Deploy

O comando `npm run deploy` utiliza o pacote `gh-pages`, que exige que o projeto seja um repositório Git com um "remote" configurado.

Se você ainda não configurou o Git, siga estes passos no terminal:

1. **Inicie o Git**:
   ```bash
   git init
   git add .
   git commit -m "Configuração inicial para deploy"
   ```

2. **Conecte ao GitHub**:
   Crie um repositório no GitHub e execute:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   ```

3. **Execute o Deploy**:
   ```bash
   npm run deploy
   ```

## Deploy (GitHub Pages)

**Importante**: É necessário executar os comandos dentro da pasta `/webapp`.

O projeto está configurado para deploy simples via GitHub Pages.

1. **Configuração inicial**: Certifique-se de que o campo `base` no `vite.config.js` corresponde ao nome do seu repositório (ex: `/nome-do-repo/`) ou use `./` para caminhos relativos (já configurado).

2. **Executar Deploy**:
   ```bash
   npm run deploy
   ```

Este comando irá automaticamente:
- Processar todos os arquivos Markdown de resumo.
- Gerar os arquivos .EPUB na pasta `public`.
- Gerar o JSON consolidado de dados.
- Fazer o build de produção do Vite.
- Fazer o push da pasta `dist` para a branch `gh-pages`.

## Estrutura de Arquivos
- `process_summaries.cjs`: Script Node.js que extrai metadados dos MDs e gera EPUBs.
- `src/components/SummaryViewer.jsx`: Visualizador imersivo de leitura.
- `public/data/`: Diretório onde os dados processados e EPUBs são armazenados.
