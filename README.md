# Book Summarizer & Library

Um projeto completo de curadoria literária e plataforma de leitura. Este repositório contém os resumos originais misticos e a aplicação web para leitura imersiva.

## Estrutura do Projeto

- `/webapp`: Aplicação React/Vite (o leitor imersivo).
- `/*Summary.md`: Resumos consolidados prontos para processamento.
- `/summaries`: Versões finais e refinadas dos textos.
- `/archive`: Histórico de processamento e arquivos temporários.
- `.gemini/skills`: Instruções e regras de estilo para a IA.

## Funcionalidades
- **Design Editorial**: Estética refinada com fontes Cinzel e Crimson Text.
- **Progresso de Leitura**: Barra de progresso horizontal e mensagens motivacionais dinâmicas.
- **Exportação**: Download de resumos em formato .PDF (via print) e .EPUB (pré-gerado).
- **Tempo de Leitura**: Estimativa automática baseada no volume de texto.

## Desenvolvimento

Para rodar o projeto localmente:

1. Instale as dependências:
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
