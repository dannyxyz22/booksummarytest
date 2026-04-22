---
name: Publicar Novo Resumo
description: Uma skill completa de fluxo de trabalho para adicionar novos resumos de livros no catálogo Summa Brevis, gerando sua capa em estilo de encadernação de couro clássica e atualizando o sistema do site.
---

# Skill: Publicar Novo Resumo (Summa Brevis)

Esta skill deve ser ativada sempre que o usuário quiser adicionar um novo livro/resumo ao site "Summa Brevis" de forma ágil e automatizada. 

## Objetivo
Atuar como um assistente editorial, guiando o usuário no processo de publicação: geração da imagem promocional (capa), registro das informações no banco de dados e processamento/deploy local.

## Pré-requisitos
Antes de começar o fluxo, você (a IA) deve pedir ao usuário:
1. Qual é o arquivo `.md` com o resumo finalizado.
2. Qual é o Título do livro.
3. Qual é o Autor da obra.
4. Qual é a Cor preferencial para a capa de couro (ex: carmesim escuro, verde oliva, azul marinho) e um Símbolo (ex: cruz, âncora, sagrado coração, lírio) que represente a obra.
5. Qual é o `id-do-livro` (slug), para manter os artefatos organizados por livro.

## Política de preservação de intermediários

- Nunca apagar automaticamente arquivos intermediários de batches e sínteses.
- Manter cada obra isolada em:
    - `books/<book-name>/batches`
    - `books/<book-name>/summaries`
- A publicação usa o resumo final, mas não deve remover os arquivos intermediários da obra.

---

## Passo a Passo de Execução

Ao receber as informações acima, execute os seguintes passos SEQUENCIALMENTE:

### 1. Gerar a Capa via IA (generate_image tool)
Utilize o seu gerenciador de imagens para gerar uma imagem seguindo ESTRITAMENTE o prompt de estilo do projeto "Summa Brevis".
Substitua os valores entre chaves `{}` pelas escolhas do usuário.
**Prompt obrigatório:**
`"A classic Catholic theological book cover. {Cor escolhida} leather binding, gold foil stamping. Title: '{Título do Livro}'. Author: '{Nome do Autor}'. Minimalist {Símbolo escolhido} symbol in the center. Elegant, sacred, antique library aesthetic. Centered text."`

Salve a imagem inicialmente.

### 2. Mover a Imagem
Assumindo que você gerou a imagem, copie/mova o arquivo de imagem para o diretório de fontes (fora da pasta pública):
`webapp/source-covers/{id-do-livro}.png`
(Use o comando do terminal para mover o arquivo).

### 3. Gerar o Thumbnail
O site exibe thumbnails WebP otimizados, não as imagens originais. Após mover a capa, gere o thumbnail executando no terminal:
```bash
cd webapp && python scripts/generate_thumbs.py
```
Isso criará `webapp/public/assets/covers/thumbs/{id-do-livro}.webp` automaticamente a partir da imagem original em `source-covers`.

### 4. Registrar no Catálogo (summaries.json)
O arquivo `webapp/public/data/summaries.json` é a **fonte de verdade** do catálogo e está sob controle de versão. Edite-o diretamente, adicionando um novo objeto ao final do array JSON com o padrão:

```json
    {
        "id": "{id-do-livro}",
        "path": "../{caminho-do-arquivo-md-informado-pelo-usuario}",
        "title": "{Título do Livro}",
        "author": "{Nome do Autor}",
        "year": {ano-de-publicação},
        "cover": "assets/covers/{nome-do-arquivo-de-capa}"
    }
```
Para manter consistência entre obras, prefira caminhos finais no padrão `../books/<book-name>/summaries/<arquivo-final>.md` sempre que aplicável.

Os campos `description`, `readingTime`, `epubPath` e `pdfPath` serão gerados automaticamente pelo script no passo seguinte.

### 5. Processar o Banco e Gerar o EPUB
Abra um terminal, certifique-se de estar no diretório `webapp/` (ex: `cd webapp`) e rode o script vital do projeto:
`node process_summaries.cjs`
*(Isso atualizará o arquivo summaries.json e gerará o EPUB automaticamente).*

### 6. Atualizar o Meta Description Global (SEO)
O site mantém um `<meta name="description">` global em `webapp/index.html` e uma constante `DEFAULT_DESCRIPTION` em `webapp/src/App.jsx` que listam os títulos de **todos** os livros do catálogo. Após adicionar um novo livro, atualize essas duas listas para incluir o novo título.

**Locais a editar:**

1. **`webapp/index.html`** — dentro do bloco `<!-- SEO_DYNAMIC_START -->`, atualize os quatro atributos que contêm a lista de títulos:
   - `<meta name="description" content="... {Novo Título} ...">`
   - `<meta property="og:description" content="...">`
   - `<meta name="twitter:description" content="...">`
   - O campo `"description"` dentro do `<script type="application/ld+json">` do WebSite schema

2. **`webapp/src/App.jsx`** — atualize a constante `DEFAULT_DESCRIPTION` no topo do arquivo para incluir o novo título na lista.

> **Nota sobre SEO por página:** O script `webapp/scripts/generate-static-book-routes.cjs` gera automaticamente páginas estáticas com SEO individualizado para cada livro (título, descrição, `og:image`, `canonical`, JSON-LD `Book` schema) durante o `npm run build`. Não é necessário editá-lo ao adicionar novos livros — ele lê os dados diretamente do `summaries.json`.

### 7. Finalizar 
Avise ao usuário que a publicação do novo volume está concluída, mostre a prévia da capa que você gerou, e oriente-o a visualizar no ambiente local (`http://localhost:5173/`).

### 8. Regra para ajustes de conteúdo (quando necessário)
Se for necessário aumentar ou reduzir conteúdo do resumo, edite o trecho correlacionado dentro do arquivo/seção de origem em `books/<book-name>/summaries` (ou no batch correspondente) e regenere o resultado. Não criar seções soltas de "expansão" fora da ordem natural da obra.
