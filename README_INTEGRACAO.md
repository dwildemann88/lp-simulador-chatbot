# Integração PROJEM — Make, GA4 e tabela de leads

## Variáveis obrigatórias no Netlify

Defina em Site configuration > Environment variables:

```bash
VITE_MAKE_WEBHOOK_URL=https://hook.us2.make.com/apm1ykme9gg16x95zlxqftrb87x9rtk7
VITE_GA_MEASUREMENT_ID=G-XSGE5PYZFF
```

O `App.jsx` também possui fallback para esses valores, mas o padrão correto em produção é manter as variáveis no Netlify.

## O que foi corrigido

1. O evento principal agora é sempre `generate_lead`.
2. O simulador dispara `generate_lead` quando o usuário clica em `Ver minha estimativa`, antes de revelar o resultado.
3. O envio de fatura também dispara `generate_lead`, mas mantém `submit_invoice` como evento secundário para leitura operacional.
4. O payload enviado ao Make agora mantém compatibilidade com o blueprint antigo: `telefone`, `conta`, `cidade_digitada`, `origem`, `event_id`, `page_url`, `user_agent`, UTMs e IDs de clique.
5. O payload também mantém os campos mais completos do simulador: `lead_id`, `session_id`, `client_id`, `valor_conta_formatado`, estimativas de economia, status e prioridade comercial.
6. `gclid`, `gbraid` e `wbraid` são preservados para futura qualificação/importação de conversões no Google Ads.
7. Envio de fatura com arquivo continua usando `FormData`: campo `payload`, campos individuais e o arquivo `fatura`.

## Make / Google Sheets

Use o arquivo `LEADS_SCHEMA.csv` como cabeçalho da aba principal no Google Sheets.

No Make, o módulo `Google Sheets > Add a Row` deve usar os nomes das colunas exatamente como estão no CSV. Isso evita o erro clássico do blueprint anterior: colunas com espaço no nome, como `telefone ` e `conta `.

Campos mínimos para o fluxo funcionar:

- data
- timestamp
- lead_id
- event_id
- evento
- origem_formulario
- origem
- nome
- telefone
- cidade_digitada
- regiao
- tipo_imovel
- conta
- valor_conta_formatado
- fatura_enviada
- fatura_nome_arquivo
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term
- gclid
- gbraid
- wbraid
- page_url
- user_agent

## GA4

No front-end, o `gtag` envia `generate_lead` para o ID `G-XSGE5PYZFF`.

No Make, caso mantenha o envio por Measurement Protocol, use o mesmo nome de evento: `generate_lead`. Não crie nomes paralelos como evento principal.

## Google Ads

Google Ads não recebe lead bruto direto pelo Google Drive. O caminho correto é:

1. Capturar o lead no Google Sheets com `gclid`, `gbraid` ou `wbraid`.
2. Qualificar o lead no CRM/planilha.
3. Enviar depois uma conversão offline, por exemplo `qualified_lead`, usando o identificador de clique preservado.

O `generate_lead` deve ser usado para volume inicial de leads. A conversão qualificada deve ser separada para otimização real de campanha.

## Validação feita

O projeto foi compilado com `npm run build` em ambiente local. O build concluiu sem erro de sintaxe.
