# Alterações aplicadas

## Integração iSales

Foi adicionada integração paralela ao fluxo atual do Make. O envio para o Make foi mantido.

Endpoint:
`https://app.isales.company/formulario/cliente`

Token:
`HJK1303ISAL567`

Formulários:
- Simulador: `UFD165TR951`
- Envio de fatura: `UFD166TR951`

Campos padrão iSales enviados quando existem no formulário/payload:
- `nome`
- `telefone`
- `cidade`
- `valor_energia`

Campo não enviado:
- `email`

Campos personalizados enviados somente quando existem com valor real:
- `tipo_telhado`
- `status_pesquisa_solar`
- `empresa_ou_propriedade`
- `segmento`
- `link_fatura`

Observação: `link_fatura` só será enviado se o front-end ou o Make já gerar uma URL. O arquivo da fatura continua sendo enviado para o Make como antes.

## Design e conteúdo

- Cabeçalho com logo símbolo para melhor leitura.
- Rodapé com logo completa.
- Seção “Sobre a PROJEM” com imagem da equipe.
- Texto da seção “Sobre a PROJEM” reforçando 12 anos de mercado e mais de 3000 projetos solares.
- Botão flutuante verde e pulsante para WhatsApp.
- Balão fechável “Fale com um especialista”.
- Instagram no rodapé: `@projem.solar`.
- Campo de anexo de fatura redesenhado para ficar mais claro onde clicar.
- Telefone no topo com link para WhatsApp.
- Localização no topo com link para Google Maps.

## Validação

O projeto foi compilado com:
`npm run build`

Build final gerado em:
`dist/`
