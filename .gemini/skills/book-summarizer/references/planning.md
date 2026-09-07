# Plano de extensão e verificação mecânica

Use `scripts/editorial_plan.py` desta skill, com Python 3.10 ou superior. Ele usa apenas a biblioteca padrão. Os comandos abaixo partem da raiz do repositório.

## Arquivos de trabalho

```text
books/<slug>/
  source.txt            Texto limpo; preserve também o original recebido
  source-map.md         Edição, escopo, exclusões e correspondência à fonte
  sections.json         Mapa completo de intervalos semânticos
  plan.json             Fonte/hash e orçamento por seção
  evidence.md           Núcleos, localizadores, destinos e dúvidas
  progress.md           Estado para retomada
  summaries/
    cap-01.md           Uma redação por ID do plano
    cap-02.md
    resumo-final.md     Montagem com edição de continuidade
  review.md             Revisão semântica vinculada à versão final
```

`batches/` continua disponível para cópias dos trechos quando úteis. Não é obrigatório duplicar o texto que pode ser lido por intervalos da fonte. Não apague os lotes antigos.

Crie `sections.json` após examinar a estrutura. Este exemplo só se aplica a uma fonte com 100 linhas; substitua os intervalos pelos reais:

```json
[
  {"id": "cap-01", "title": "Fundamentos", "start_line": 1, "end_line": 40},
  {"id": "cap-02", "title": "Desenvolvimento", "start_line": 41, "end_line": 100, "weight": 1.1}
]
```

As linhas são inclusivas e começam em 1. O mapa deve cobrir todas as linhas da fonte limpa, sem intervalos sobrepostos ou omitidos. Nenhuma unidade pode estar vazia. Os IDs determinam os nomes dos rascunhos; use minúsculas, números e hífens.

`weight` é opcional e vale 1 por padrão. O alvo local é proporcional a `palavras_da_seção × peso`, com arredondamento que conserva a soma total. Registre a justificativa de pesos diferentes em `source-map.md`. O script não interpreta capítulos nem avalia sua importância.

## Criar o plano

```sh
python .gemini/skills/book-summarizer/scripts/editorial_plan.py plan books/minha-obra/source.txt --sections books/minha-obra/sections.json --output books/minha-obra/plan.json
```

O padrão usa alvo de 20%, mínimo de 18% e máximo de 22% do texto limpo. Para uma faixa solicitada diferente, use `--ratio 0.25 --tolerance 0.02`, por exemplo. A tolerância é em pontos da proporção: nesse exemplo, 23–27%.

Se o pedido define palavras diretamente:

```sh
python .gemini/skills/book-summarizer/scripts/editorial_plan.py plan books/minha-obra/source.txt --sections books/minha-obra/sections.json --output books/minha-obra/plan.json --target-words 20000 --word-tolerance 1000
```

Nesse caso a faixa é de 19.000 a 21.000 palavras; sem `--word-tolerance`, a tolerância é 10% do alvo. Não misture opções de proporção e de palavras. O alvo e a faixa precisam ser positivos e menores que a extensão da fonte.

O comando recusa sobrescrever um plano existente. Para revisar o orçamento, gere `plan-v2.json` e registre a razão. O hash vincula o plano aos bytes do arquivo original limpo; até uma mudança de quebra de linha exige revisão do plano. O caminho da fonte é relativo à pasta do plano, para permitir mover a árvore de trabalho inteira.

## Redigir e verificar

Salve cada seção como `summaries/<id>.md`. Os capítulos grandes podem ter IDs como `cap-03-a` e `cap-03-b`. Monte o final em ordem; acrescente apenas as transições necessárias e preserve a extensão. O script não agrega nem redige textos.

```sh
python .gemini/skills/book-summarizer/scripts/editorial_plan.py check books/minha-obra/plan.json --drafts books/minha-obra/summaries --final books/minha-obra/summaries/resumo-final.md
```

O resultado JSON informa palavras por seção e no final, faixa global, proporção, hashes, falhas e avisos. A saída pode ser guardada no diretório da obra como evidência da verificação. Código 1 indica fonte alterada, plano inválido, rascunho ausente/vazio, final fora da faixa ou cabeçalhos técnicos `Batch/Lote N`. Desvios locais superiores a 20% do alvo e parágrafos longos idênticos geram avisos para inspeção; não implicam correção automática.

**Limite deliberado:** `mechanical_checks_passed: true` significa somente que os testes mecânicos passaram. `semantic_review_required` permanece `true`: a presença dos rascunhos não prova que o arquivo final preservou seu conteúdo, e contagem nenhuma verifica doutrina ou fidelidade. Faça e registre a [revisão editorial](method.md) antes da entrega.

A fonte é contada por tokens separados por espaço que contenham letras ou números. No resumo, o contador exclui URLs, imagens Markdown e comentários HTML e conserva o texto dos links. Títulos e demais palavras visíveis entram na contagem. É uma aproximação para o Markdown simples do projeto, não um renderizador geral: índices manuais, código, HTML complexo e referências de trabalho devem ficar fora do resumo final. Os verificadores legados contam por espaço sem essa limpeza; não compare suas contagens como se fossem idênticas.
