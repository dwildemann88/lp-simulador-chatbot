# Chatbot de qualificação + Make

O botão flutuante de WhatsApp foi convertido em um chatbot de pré-atendimento. O fluxo usa a integração já existente em `src/App.jsx` e envia o lead para `VITE_MAKE_WEBHOOK_URL`.

## Fluxo de perguntas

1. Intenção de compra
2. Faixa da conta de energia
3. Tipo de imóvel
4. Prazo para instalação
5. Cidade
6. Nome + WhatsApp

Depois do envio, o chatbot mantém o lead na página por alguns segundos enquanto exibe o estado de encaminhamento. O retorno humano é informado como sendo pelo WhatsApp fornecido.

## Payload enviado ao Make

Além dos campos de atribuição já usados pelo site, o chatbot acrescenta:

```json
{
  "origem_formulario": "chatbot_whatsapp",
  "origem": "chatbot_whatsapp",
  "evento": "generate_lead",
  "nome": "João da Silva",
  "telefone": "55999999999",
  "whatsapp": "55999999999",
  "cidade": "Santa Rosa",
  "cidade_digitada": "Santa Rosa",
  "tipo_imovel": "Residencial",
  "segmento": "Residencial",
  "intencao_compra": "orcamento",
  "intencao_compra_label": "Quero um orçamento",
  "faixa_conta": "600_1000",
  "faixa_conta_label": "R$ 600 a R$ 1.000",
  "prazo_instalacao": "ate_30_dias",
  "prazo_instalacao_label": "Nos próximos 30 dias",
  "ja_fez_orcamento": "Não informado",
  "lead_score": 9,
  "nivel_intencao": "Quente",
  "prioridade_comercial": "Alta",
  "qualified_lead": "Sim",
  "status_lead": "Aguardando atendimento humano",
  "canal_origem": "chatbot_site",
  "canal_preferido": "WhatsApp",
  "chatbot_nome": "Assistente Projem",
  "chatbot_versao": "1.0",
  "tempo_chat_segundos": 42,
  "tempo_pagina_segundos": 91,
  "respostas_chatbot": "{...}",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "energia_solar",
  "gclid": "...",
  "fbclid": "..."
}
```

O payload real também contém os identificadores e metadados já gerados pelo site, como `lead_id`, `event_id`, `session_id`, `client_id`, `timestamp`, `page_url`, `referrer`, `user_agent` e UTMs.

## Lead score

- Intenção `orcamento` ou `comparar`: +4
- Intenção `economia`: +2
- Conta de R$ 600 a R$ 1.000 ou acima de R$ 1.000: +2
- Conta de R$ 300 a R$ 600: +1
- Instalação em até 30 dias: +3
- Instalação em 1 a 3 meses: +2
- Instalação em 3 a 6 meses: +1
- Comercial, Rural ou Industrial: +1

Classificação:

- `lead_score >= 7`: `nivel_intencao = Quente`, `prioridade_comercial = Alta`
- `lead_score >= 4`: `nivel_intencao = Morno`, `prioridade_comercial = Média`
- abaixo de 4: `nivel_intencao = Nutrição`, `prioridade_comercial = Baixa`
- `qualified_lead = Sim` para score 4 ou maior

## Router sugerido no Make

Use um Router logo depois do Custom Webhook:

- Rota 1: `lead_score >= 7` → prioridade alta / comercial imediato
- Rota 2: `lead_score >= 4 AND lead_score < 7` → fila comercial normal
- Rota 3: `lead_score < 4` → nutrição / acompanhamento posterior

Para identificar especificamente este fluxo, filtre por:

```text
origem_formulario = chatbot_whatsapp
```

## Variável de ambiente

O projeto já aceita:

```env
VITE_MAKE_WEBHOOK_URL=https://hook.us2.make.com/SEU_WEBHOOK
```

Se ela não for definida, permanece o webhook padrão já existente no projeto original.

## Atualização responsiva do chatbot

- Avatar do bot: `src/assets/chatbot-projem.png`.
- Respostas exibem o estado "digitando" por pelo menos ~720 ms antes de avançar.
- Ao final do fluxo existe a ação **Voltar ao início**, que limpa as respostas locais e reinicia a triagem sem recarregar a página.
- Desktop (acima de 760 px): janela lateral de aproximadamente 420 px, com maior área de mensagens e controles.
- Mobile (até 760 px): janela adaptada à largura e altura útil da tela, com suporte a `100dvh` e `safe-area-inset-bottom`.
- Não existem duas páginas separadas: o mesmo frontend usa CSS responsivo para alternar automaticamente entre layout desktop e mobile.
