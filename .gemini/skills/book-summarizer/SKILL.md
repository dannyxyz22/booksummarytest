---
name: book-summarizer
description: Produza resumos editoriais substanciais de livros, especialmente obras católicas de 100 a 500 páginas, com escrita por seções, orçamento de palavras, rastreabilidade ao original e revisão de cobertura e fidelidade. Use para criar ou revisar o conteúdo do resumo; capa, cadastro e interface pertencem às skills de publicação e design.
---

# Book Summarizer — síntese editorial extensa

Escreva uma leitura substancial, fiel à obra e fluida em pt-BR (ou no idioma pedido). Preserve o estilo editorial do Summa Brevis: parágrafos desenvolvidos, títulos formais, conceitos explicados e progressão do autor. Consulte trechos de dois resumos publicados para calibrar a voz, nunca como evidência sobre a nova obra.

Leia [o método e os critérios católicos](references/method.md) antes da redação. Para planejar e validar arquivos, leia [o contrato do plano](references/planning.md). A pesquisa e seus limites estão em [docs/METODO_RESUMOS.md](../../../docs/METODO_RESUMOS.md).

## Extensão como contrato editorial

- Preserve escolhas explícitas de idioma, profundidade e tamanho. Sem outra indicação, use alvo de 20% das palavras do corpo da obra, com faixa final de 18% a 22%. É a convenção deste projeto para evitar resumos excessivamente curtos, não um ótimo científico universal.
- Conte a fonte limpa e registre o que foi excluído: anúncios, índice remissivo, cabeçalhos repetidos etc. Prefácios autorais, notas doutrinais e conclusões relevantes entram no escopo. Não altere o denominador depois para fazer um resumo passar.
- Páginas servem para estimar esforço; defina a entrega em palavras. Se o usuário especificar páginas, declare a hipótese de diagramação usada na conversão. Traduções entre idiomas podem precisar de outra meta explícita.
- Distribua o orçamento total pelas seções da obra. Preserve um mínimo de desenvolvimento para cada núcleo relevante; redistribua espaço conforme densidade, sem exigir 20% de cada parágrafo ou acrescentar conteúdo para preencher quota.
- Uma resposta curta no chat não substitui o arquivo extenso. Escreva e salve uma seção por vez, retomando do plano quando necessário. Não prometa continuação automática se o ambiente não a oferece.

## Fluxo preferencial

1. **Fixar a fonte.** Identifique edição, tradução, gênero e integridade. Preserve o original; crie texto limpo com correspondência de capítulo/página ou parágrafo e registre lacunas de OCR. Se faltar parte da obra, descreva a cobertura como parcial.
2. **Mapear antes de resumir.** Leia o sumário, a abertura e o fecho; percorra todos os capítulos para montar a estrutura. Isso orienta o plano, mas não conta como leitura integral. Crie `books/<slug>/source-map.md` e `sections.json` com intervalos reais da fonte limpa.
3. **Planejar extensão.** Gere `plan.json` com `scripts/editorial_plan.py plan`. Use limites semânticos (capítulo, questão, carta, conjunto de aforismos); subdivida se necessário, geralmente em 3–6 mil palavras de entrada. Tamanho é heurística: respeite a capacidade de leitura e saída do ambiente. Contexto vizinho pode ser lido como apoio, sem contá-lo duas vezes.
4. **Ler e registrar evidência.** Para cada unidade, leia o original inteiro e registre em `books/<slug>/evidence.md` a tese, argumentos, distinções, exemplos decisivos e localizadores. Mantenha um glossário e notas de continuidade. Se a ferramenta truncar a leitura, continue até cobrir o intervalo.
5. **Redigir da fonte.** Escreva `books/<slug>/summaries/<section-id>.md` consultando o original, a evidência e o plano global. As notas ajudam a navegar; não substituem a fonte. Preserve exceções, condições, objeções e respostas. Integre citações breves e verificadas quando a formulação do autor acrescentar precisão, força espiritual ou uma imagem decisiva. Adapte ao gênero conforme a referência.
6. **Revisar localmente.** Confira cada seção contra suas fontes e orçamento. Corrija falta de conteúdo recuperando argumentos e exemplos omitidos. Corte redundância real, não distinções necessárias. Não use expansões genéricas ou conhecimento externo para aumentar o tamanho.
7. **Montar sem comprimir outra vez.** Concatene as seções em ordem e faça edição de continuidade localizada. Não peça um novo resumo dos resumos. A abertura apresenta a obra brevemente, sem repetir o corpo; o fecho preserva a conclusão do autor. Remova marcas de lote e notas de processo do texto público.
8. **Auditar o arquivo final.** Execute `scripts/editorial_plan.py check`, depois a revisão semântica em duas direções descrita na referência: fonte → cobertura e resumo → evidência. Revise explicitamente início, meio e fim, inclusive unidades curtas. Registre o resultado em `books/<slug>/review.md`, vinculado ao hash do arquivo final.
9. **Entregar ou integrar.** Procure links pertinentes com livros publicados e verifique os slugs no catálogo; não invente relações. Verifique novamente o arquivo após os últimos ajustes. Com a extensão contratada, cobertura e revisão satisfeitas, coloque o final em `summaries/published/<slug>.md`. Só execute capa, cadastro ou publicação quando fizerem parte do pedido, seguindo a `PublishSummary`.

## Citações e voz do autor

Combine síntese desenvolvida com passagens expressivas do livro entre aspas, integradas aos parágrafos e atribuídas naturalmente. Selecione-as ao ler a fonte: uma definição precisa, uma exortação marcante ou uma frase que condense o percurso pode merecer a voz direta do autor. Não imponha quantidade por capítulo nem transforme o resumo numa sequência de excertos; as citações entram no orçamento total e não devem repetir a paráfrase ao redor.

Confira cada passagem na edição usada e registre seu localizador em `evidence.md`. Não coloque paráfrases entre aspas. Quando traduzir uma citação, mantenha fidelidade ao trecho e identifique a tradução própria em nota editorial breve, uma única vez se isso valer para todas. Veja as regras de seleção, recorte e conferência em [Citações na síntese](references/method.md#citações-na-síntese).

## Fidelidade própria de obras católicas

Adote as maiúsculas reverenciais do projeto nos pronomes que se referem a Deus, a Jesus Cristo ou ao Espírito Santo, inclusive nas citações: Ele, O, Lhe, Seu, Sua, Dele, Nele, conhecê-Lo, amá-Lo e ocultar-Se. Confira o referente em cada contexto; pronomes relativos ao autor ou a outras pessoas mantêm a grafia comum. Aplique também essa convenção às traduções próprias.

Distinga o que o autor afirma, uma citação de outra autoridade, posição de escola teológica, hipótese histórica, testemunho e revelação privada. Não transforme opinião de um autor em definição da Igreja nem experiência mística em promessa universal. Use atribuições naturais, como “o autor sustenta” e “a santa relata”, sem esfriar artificialmente o tom devocional.

Preserve terminologia, graus de certeza e o sentido das distinções. Não acrescente biografias, aprovações eclesiásticas, datas, milagres, citações bíblicas ou comentários doutrinais de memória. Citações diretas precisam ser verificadas na edição; traduções próprias devem ser identificadas ou parafraseadas. Consulta externa, quando necessária, fica identificada como contexto editorial, separada do resumo da obra.

## Controle de qualidade e retomada

- Extensão e presença de arquivos são verificações mecânicas; não provam cobertura, fidelidade ou ortodoxia. Não declare “aprovado” apenas porque um script retornou 0.
- Aplique os critérios de aceite da referência. Para cada achado, registre fonte, trecho do resumo e correção feita; revise de novo o trecho alterado e a contagem final.
- Se duas revisões direcionadas não resolverem o mesmo problema, diagnostique fonte, orçamento ou divisão antes de reescrever. Não repita indefinidamente “expanda até atingir a meta”. Registre uma limitação real em vez de inventar conteúdo ou marcar como completo.
- Mantenha `progress.md` com fonte/hash, unidades lidas, unidades revisadas, palavras atuais, pendências e próxima unidade. Uma retomada deve reler plano, registro de progresso e fonte relevante.
- Nunca apague automaticamente lotes, sínteses ou revisões. Intermediários ficam em `books/<slug>/`; materiais antigos ou genéricos podem ir a `summaries/workspace/`.

Os auxiliares antigos `book_tools.py`, `split_book.py` e `verify_summary_ratio.py` continuam disponíveis para compatibilidade. O agregador antigo insere `## Batch N`; retire esses rótulos na edição. O novo planejador não gera texto, não chama APIs, não apaga intermediários e não publica.
