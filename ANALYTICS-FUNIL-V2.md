# Funil de analytics v2 — PROJEM Solar

## Objetivo
Medir o funil completo sem transformar cada interação em um evento diferente. O mesmo `lead_id` acompanha o lead desde o site até o Make/iSales.

## Eventos principais
- `page_view`: entrada na landing.
- `cta_click`: clique em CTAs relevantes; usar `cta_name`, `location` e `destination`.
- `simulator_start`: primeiro início real do simulador na sessão.
- `simulator_step_view`: visualização de cada etapa.
- `simulator_step_complete`: conclusão de uma etapa, com o valor categorizado quando necessário.
- `simulator_step_error`: erro de validação por etapa.
- `lead_form_start`: entrada na coleta de dados do lead.
- `generate_lead`: conversão principal, disparada uma única vez pelo registro do lead.
- `lead_delivery_success`: Make aceitou o lead.
- `lead_delivery_failed`: falha na entrega ao Make.
- `simulator_result_view`: resultado exibido após o registro.
- `whatsapp_click`: clique para continuar pelo WhatsApp.
- `section_view`: seção relevante vista pelo menos 50%.
- `scroll_milestone`: 50%, 75% e 90% de profundidade.

## Parâmetros de atribuição
`lead_id`, `event_id`, `session_id`, `client_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, `gclid`, `gbraid`, `wbraid` e `fbclid`.

## Parâmetros de qualificação
`valor_conta`, `tipo_imovel`, `tipo_telhado`, `cidade`, `prazo_instalacao`, `nivel_intencao`, `prioridade_comercial` e `lead_priority`.

## Webhook
O webhook existente do Make é mantido. Nenhuma URL de webhook foi alterada nesta versão.

## Observação
O evento `lead_delivery_success` representa sucesso da requisição ao Make. O envio para o iSales continua sendo uma submissão feita pelo navegador; não deve ser interpretado como confirmação de processamento do CRM.