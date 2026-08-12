# PROJEM — versão senior funcional

## Correções principais

- Mobile sem limite fixo de tela.
- Header mobile com logo centralizada, menu funcional e botão de simulação alinhado.
- Hero não mostra mais texto de placeholder atrás do título.
- “Como funciona” voltou a ser horizontal com rolagem no mobile, sem cortar o topo dos cards.
- Simulador por etapas e por clique.
- Estimativa aparece apenas no final.
- Aba “Enviar fatura” separada, com formulário, WhatsApp e campo de arquivo opcional.
- Campo de cidade com digitação manual + geolocalização automática.
- Payload preparado para Make no padrão de lead do simulador.
- Eventos preparados para GA4/GTM via `gtag` e `dataLayer`.

## Configurar Make e GA4

Crie um arquivo `.env` na raiz:

```bash
VITE_MAKE_WEBHOOK_URL=https://hook.us2.make.com/SEU_WEBHOOK_AQUI
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Se `VITE_MAKE_WEBHOOK_URL` estiver vazio, o site continua funcionando e direciona para o WhatsApp, mas não envia para o Make.

## Payload enviado ao Make

Campos principais:

- lead_id
- session_id
- origem_formulario
- evento
- evento_origem
- timestamp
- nome
- whatsapp
- email
- cidade
- cidade_origem
- latitude
- longitude
- tipo_imovel
- tipo_unidade
- tipo_telhado
- valor_conta
- valor_conta_formatado
- estimativa_economia_mensal
- economia_anual_estimada
- nova_conta_estimada
- percentual_economia
- fatura_enviada
- fatura_nome_arquivo
- status_lead
- nivel_intencao
- prioridade_comercial
- consentimento_contato
- utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id
- gclid, gbraid, wbraid, fbclid
- pagina_url
- referrer
- user_agent
- screen_width
- screen_height

No envio com arquivo, o Make recebe `FormData` com:
- `payload` em JSON
- campos individuais do payload
- `fatura` com o arquivo, se selecionado

## Eventos GA4/GTM

Eventos disparados:

- page_view_landing
- simulator_mode_change
- simulator_step_next
- generate_lead
- submit_invoice
- make_webhook_success
- make_webhook_failed
- whatsapp_click

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Imagens

As imagens ainda não foram geradas. Substitua os `null` no objeto `imageSlots` em `src/App.jsx`.


## Correções v2

- O simulador agora pede Nome e WhatsApp antes de revelar a estimativa.
- Depois do envio dos dados, há uma tela de loading antes dos valores.
- O lead é enviado ao Make antes de mostrar o resultado, quando o usuário clica em “Ver minha estimativa”.
- O botão “Simular agora” no rodapé agora ancora no simulador, não no WhatsApp.
- Telefone único aplicado em todos os pontos: 5599686302.
- Slots de imagem foram restaurados para hero/mockup e visual do simulador.


## Correções v3

- Stepper do simulador resumido para 4 etapas: Conta, Perfil, Dados e Resultado.
- Removido email do simulador e do envio de fatura.
- Adicionada animação suave ao alternar entre “Simular economia” e “Enviar fatura”.
- Logo do desktop aumentada.


## Correção v4 — mobile

- No mobile, o mockup lateral do simulador é ocultado.
- O formulário/simulador agora aparece imediatamente abaixo do texto “Descubra quanto você pode economizar”.
- `.economyGrid` recebeu áreas explícitas `copy` e `form` para evitar que a imagem lateral empurre ou esconda o formulário.
