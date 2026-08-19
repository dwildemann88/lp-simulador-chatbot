const COPY = {
  heroTitle: 'Faça sua simulação e solicite seu orçamento.',
  heroSupport: 'Informe sua conta de luz em poucos passos, veja uma estimativa inicial e avance para uma análise personalizada da PROJEM.',
  topCta: 'Fazer simulação',
  heroCta: 'Simular e pedir orçamento',
  sectionLabel: 'Simulação e orçamento',
  sectionTitle: 'Simule seu cenário e solicite seu orçamento.',
  sectionSupport: 'Nossa simulação é rápida, gratuita e sem compromisso. Em poucos passos, você vê uma estimativa inicial e pode avançar para uma análise personalizada.',
};

function normalize(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function setText(element, text) {
  if (!element || normalize(element.textContent) === normalize(text)) return;
  element.textContent = text;
}

function setTextKeepingIcon(element, text) {
  if (!element) return;
  const current = normalize(element.textContent);
  if (current === normalize(text)) return;

  const textNodes = [...element.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
  );

  if (textNodes.length) {
    const target = textNodes[textNodes.length - 1];
    target.nodeValue = ` ${text}`;
    return;
  }

  element.append(document.createTextNode(` ${text}`));
}

function applyHeroCopy() {
  const title = document.querySelector('.heroCopy h1');
  if (title && normalize(title.textContent) !== COPY.heroTitle) {
    title.innerHTML = 'Faça sua simulação e <span>solicite seu orçamento.</span>';
  }

  setText(document.querySelector('.heroCopy > p'), COPY.heroSupport);

  const topCta = document.querySelector('.topCta');
  if (topCta) topCta.setAttribute('aria-label', COPY.topCta);
  setText(document.querySelector('.topCta span'), COPY.topCta);
  setTextKeepingIcon(document.querySelector('.drawerCta'), COPY.topCta);
  setTextKeepingIcon(document.querySelector('.heroButtons .primaryButton'), COPY.heroCta);
}

function applySimulatorCopy() {
  setText(document.querySelector('.economyText .sectionLabel'), COPY.sectionLabel);
  setText(document.querySelector('.economyText h2'), COPY.sectionTitle);
  setText(document.querySelector('.economyText > p'), COPY.sectionSupport);
  setText(document.querySelector('.modeTabs button:first-child'), 'Fazer simulação');

  setText(document.querySelector('.resultGate h3'), 'Veja sua simulação e avance para o orçamento');
  setText(
    document.querySelector('.resultGate > p'),
    'Informe seu nome e WhatsApp para visualizar a estimativa e permitir que nossa equipe continue a análise se você quiser solicitar uma proposta.'
  );
  setTextKeepingIcon(document.querySelector('.revealButton'), 'Ver minha simulação');

  const resultFlow = document.querySelector('.resultFlow');
  if (resultFlow) {
    setText(resultFlow.querySelector('h3'), 'Sua simulação inicial');
    setText(
      resultFlow.querySelector(':scope > div > p'),
      'Os valores abaixo são estimativas. Para receber um orçamento adequado ao seu consumo e imóvel, avance para o WhatsApp.'
    );
    setTextKeepingIcon(resultFlow.querySelector(':scope > button.primaryButton'), 'Solicitar orçamento pelo WhatsApp');
  }

  setText(document.querySelector('.invoiceIntro h3'), 'Envie sua fatura para análise e orçamento');
  setText(
    document.querySelector('.invoiceIntro p'),
    'Preencha os dados e vá para o WhatsApp. A fatura ajuda nossa equipe a analisar seu consumo e preparar o próximo passo; o arquivo também pode ser anexado direto na conversa.'
  );
  setTextKeepingIcon(document.querySelector('.invoiceSubmitButton'), 'Enviar fatura e pedir orçamento');
}

function applySupportingCopy() {
  document.querySelectorAll('.stepCard').forEach((card) => {
    const heading = card.querySelector('h3');
    if (normalize(heading?.textContent) !== 'Economia' && normalize(heading?.textContent) !== 'Orçamento') return;
    setText(heading, 'Orçamento');
    setText(card.querySelector('p'), 'Avance para uma proposta adequada ao seu cenário.');
  });

  setTextKeepingIcon(document.querySelector('.trustText .primaryButton.wide'), 'Fazer simulação');
  setText(document.querySelector('.footerCta h3'), 'Faça sua simulação e avance para seu orçamento.');
  setTextKeepingIcon(document.querySelector('.footerCta .primaryButton'), 'Começar simulação');
}

const WHATSAPP_REPLACEMENTS = [
  [
    'Olá, vim pelo site. Gostaria de tirar algumas dúvidas.',
    'Olá, vim pelo site da PROJEM. Quero fazer um orçamento de energia solar.',
  ],
  [
    'Olá, fiz uma simulação no site da PROJEM e gostaria de uma análise técnica.',
    'Olá, fiz uma simulação no site da PROJEM e quero solicitar um orçamento de energia solar.',
  ],
  [
    'Olá, gostaria de enviar minha fatura para uma análise técnica da PROJEM.',
    'Olá, gostaria de enviar minha fatura para uma análise da PROJEM e solicitar um orçamento de energia solar.',
  ],
];

function rewriteWhatsappLinks() {
  document.querySelectorAll('a[href*="wa.me/555599686302"]').forEach((anchor) => {
    try {
      const url = new URL(anchor.href);
      const current = url.searchParams.get('text');
      if (!current) return;

      let next = current;
      WHATSAPP_REPLACEMENTS.forEach(([from, to]) => {
        if (next.includes(from)) next = next.replace(from, to);
      });

      if (next !== current) {
        url.searchParams.set('text', next);
        anchor.href = url.toString();
      }
    } catch {
      // Mantém o link original se ele ainda estiver incompleto durante a renderização.
    }
  });
}

function applyCopy() {
  applyHeroCopy();
  applySimulatorCopy();
  applySupportingCopy();
  rewriteWhatsappLinks();
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyCopy();
  });
}

function start() {
  scheduleApply();

  const root = document.getElementById('root');
  if (!root) return;

  const observer = new MutationObserver(scheduleApply);
  observer.observe(root, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
