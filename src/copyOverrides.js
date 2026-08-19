const TEXT_REPLACEMENTS = new Map([
  ["Antes de pedir orçamento, entenda sua conta de luz.", "Faça sua simulação e solicite seu orçamento."],
  ["Simular economia", "Fazer simulação"],
  ["Simule sua economia", "Simulação e orçamento"],
  ["Descubra quanto você pode economizar.", "Simule seu cenário e solicite seu orçamento."],
  [
    "Nossa simulação é rápida, gratuita e sem compromisso. Em poucos passos, você entende sua estrutura e potencial de economia.",
    "Nossa simulação é rápida, gratuita e sem compromisso. Em poucos passos, você vê uma estimativa inicial e pode avançar para uma análise personalizada."
  ],
  ["Para liberar sua estimativa", "Veja sua simulação e avance para o orçamento"],
  [
    "Preencha seus dados. Assim a PROJEM consegue salvar o lead e continuar a análise se você quiser avançar.",
    "Informe seu nome e WhatsApp para visualizar a estimativa e permitir que nossa equipe continue a análise se você quiser solicitar uma proposta."
  ],
  ["Ver minha estimativa", "Ver minha simulação"],
  ["Sua estimativa inicial", "Sua simulação inicial"],
  [
    "Esse valor é uma projeção. A análise da fatura deixa o cenário mais preciso.",
    "Os valores abaixo são estimativas. Para receber um orçamento adequado ao seu consumo e imóvel, avance para o WhatsApp."
  ],
  ["Receber análise pelo WhatsApp", "Solicitar orçamento pelo WhatsApp"],
  ["Envie sua fatura para análise", "Envie sua fatura para análise e orçamento"],
  ["Ir para o WhatsApp", "Enviar fatura e pedir orçamento"],
  ["Simule sua economia sem compromisso.", "Faça sua simulação e avance para seu orçamento."],
  ["Simular agora", "Começar simulação"],
  ["Economia", "Orçamento"],
  ["Receba uma estimativa com mais clareza.", "Avance para uma proposta adequada ao seu cenário."]
]);

const PARTIAL_REPLACEMENTS = [
  [
    "Simule sua economia ou envie sua fatura para uma análise técnica gratuita e descubra o melhor caminho para pagar a luz pelo preço certo.",
    "Informe sua conta de luz em poucos passos, veja uma estimativa inicial e avance para uma análise personalizada da PROJEM."
  ],
  [
    "Preencha os dados e vá para o WhatsApp. O arquivo da fatura é opcional; você também pode anexar direto na conversa.",
    "Preencha os dados e vá para o WhatsApp. A fatura ajuda nossa equipe a analisar seu consumo e preparar o próximo passo; o arquivo também pode ser anexado direto na conversa."
  ]
];

const WHATSAPP_REPLACEMENTS = [
  [
    "Olá, vim pelo site. Gostaria de tirar algumas dúvidas.",
    "Olá, vim pelo site da PROJEM. Quero fazer um orçamento de energia solar."
  ],
  [
    "Olá, fiz uma simulação no site da PROJEM e gostaria de uma análise técnica.",
    "Olá, fiz uma simulação no site da PROJEM e quero solicitar um orçamento de energia solar."
  ],
  [
    "Olá, gostaria de enviar minha fatura para uma análise técnica da PROJEM.",
    "Olá, gostaria de enviar minha fatura para uma análise da PROJEM e solicitar um orçamento de energia solar."
  ]
];

function replaceTextNode(node) {
  if (!node?.nodeValue) return;

  const parent = node.parentElement;
  if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) return;

  const trimmed = node.nodeValue.trim();
  if (!trimmed) return;

  const exact = TEXT_REPLACEMENTS.get(trimmed);
  if (exact) {
    node.nodeValue = node.nodeValue.replace(trimmed, exact);
    return;
  }

  let next = node.nodeValue;
  for (const [from, to] of PARTIAL_REPLACEMENTS) {
    if (next.includes(from)) next = next.replace(from, to);
  }
  if (next !== node.nodeValue) node.nodeValue = next;
}

function rewriteWhatsappLink(anchor) {
  const href = anchor.getAttribute("href");
  if (!href || !href.includes("wa.me/555599686302")) return;

  try {
    const url = new URL(href, window.location.origin);
    const current = url.searchParams.get("text");
    if (!current) return;

    let next = current;
    for (const [from, to] of WHATSAPP_REPLACEMENTS) {
      if (next.includes(from)) next = next.replace(from, to);
    }

    if (next !== current) {
      url.searchParams.set("text", next);
      anchor.setAttribute("href", url.toString());
    }
  } catch {
    // Mantém o fluxo original caso o href ainda esteja incompleto durante a renderização.
  }
}

function applyCopyOverrides(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    replaceTextNode(node);
    node = walker.nextNode();
  }

  if (root.matches?.('a[href*="wa.me/555599686302"]')) rewriteWhatsappLink(root);
  root.querySelectorAll?.('a[href*="wa.me/555599686302"]').forEach(rewriteWhatsappLink);
}

function startCopyOverrides() {
  applyCopyOverrides();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) replaceTextNode(node);
        if (node.nodeType === Node.ELEMENT_NODE) applyCopyOverrides(node);
      });

      if (mutation.type === "attributes" && mutation.target instanceof HTMLAnchorElement) {
        rewriteWhatsappLink(mutation.target);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"]
  });
}

if (document.body) startCopyOverrides();
else window.addEventListener("DOMContentLoaded", startCopyOverrides, { once: true });
