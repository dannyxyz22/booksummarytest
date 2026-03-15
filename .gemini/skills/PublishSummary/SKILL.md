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
Assumindo que você gerou a imagem, copie/mova o arquivo de imagem para o diretório de assets públicos do site:
`webapp/public/assets/covers/{id-do-livro}.png`
(Use o comando do terminal para mover o arquivo).

### 3. Atualizar o Banco de Dados (process_summaries.cjs)
Edite (ou use o tool de edição/replace se preferir) o arquivo `webapp/process_summaries.cjs`. Você precisa encontrar o array `summaryFiles` e inserir um novo objeto no final dele com o padrão:

```javascript
    {
        id: '{id-do-livro}',
        path: '../{caminho-do-arquivo-md-informado-pelo-usuario}',
        title: '{Título do Livro}',
        author: '{Nome do Autor}',
        cover: 'assets/covers/{id-do-livro}.png'
    }
```

### 4. Processar o Banco e Gerar o EPUB
Abra um terminal, certifique-se de estar no diretório `webapp/` (ex: `cd webapp`) e rode o script vital do projeto:
`node process_summaries.cjs`
*(Isso atualizará o arquivo summaries.json e gerará o EPUB automaticamente).*

### 5. Finalizar 
Avise ao usuário que a publicação do novo volume está concluída, mostre a prévia da capa que você gerou, e oriente-o a visualizar no ambiente local (`http://localhost:5173/`).
