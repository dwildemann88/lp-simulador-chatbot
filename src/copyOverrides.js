const COPY = {
  heroTitle: 'Receba seu orçamento de energia solar em poucos minutos.',
  heroSupport: 'Envie sua fatura ou faça uma simulação rápida. A PROJEM analisa o seu consumo e prepara uma proposta adequada para o seu imóvel.',
  simulatorCta: 'Simular minha economia',
  whatsappCta: 'Falar pelo WhatsApp',
};

const WHATSAPP_NUMBER = '555599686302';
const WHATSAPP_MESSAGES = {
  quote: 'Olá! Vim pelo site da PROJEM e gostaria de receber um orçamento de energia solar. Posso enviar minha fatura para análise?',
  question: 'Olá! Vim pelo site da PROJEM e tenho uma dúvida sobre energia solar.',
};

function normalize(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function setText(element, text) {
  if (!element || normalize(element.textContent) === normalize(text)) return;
  element.textContent = text;
}

function setTextKeepingIcon(element, text) {
  if (!element || normalize(element.textContent) === normalize(text)) return;

  const textNodes = [...element.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
  );

  if (textNodes.length) {
    textNodes[textNodes.length - 1].nodeValue = ` ${text}`;
    return;
  }

  const label = element.querySelector('span:not(.chatbotNotificationBadge)');
  if (label) {
    setText(label, text);
    return;
  }

  element.append(document.createTextNode(` ${text}`));
}

function buildWhatsappUrl(message = WHATSAPP_MESSAGES.quote) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function trackWhatsappSource(source) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'whatsapp_click',
    event_category: 'solar_lead',
    origem_formulario: 'landing_fundo_funil',
    origem_cta: source,
    page_path: window.location.pathname,
  });
}

function bindDirectWhatsapp(element, source, message = WHATSAPP_MESSAGES.quote) {
  if (!element) return;

  element.href = buildWhatsappUrl(message);
  element.target = '_blank';
  element.rel = 'noopener noreferrer';
  element.classList.add('whatsappDestination');

  if (element.dataset.directWhatsappBound === '1') return;
  element.dataset.directWhatsappBound = '1';

  element.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
      trackWhatsappSource(source);
    },
    true
  );
}

function applyHero() {
  const title = document.querySelector('.heroCopy h1');
  if (title && normalize(title.textContent) !== COPY.heroTitle) {
    title.innerHTML = 'Receba seu orçamento de energia solar <span>em poucos minutos.</span>';
  }

  setText(document.querySelector('.heroCopy > p'), COPY.heroSupport);

  const simulatorButton = document.querySelector('.heroButtons .primaryButton');
  setTextKeepingIcon(simulatorButton, COPY.simulatorCta);

  const whatsappButton = document.querySelector('.heroButtons .outlineButton');
  if (whatsappButton) {
    setTextKeepingIcon(whatsappButton, COPY.whatsappCta);
    whatsappButton.classList.add('heroWhatsappButton');
    bindDirectWhatsapp(whatsappButton, 'hero_whatsapp');
  }
}

function markWhatsappDestinations() {
  document.querySelectorAll('a[href*="wa.me/"]').forEach((anchor) => {
    anchor.classList.add('whatsappDestination');
  });

  document.querySelector('.invoiceSubmitButton')?.classList.add('whatsappActionButton');
  document.querySelector('.resultFlow > button.primaryButton')?.classList.add('whatsappActionButton');
  document.querySelector('.chatbotFinished a')?.classList.add('whatsappActionButton');
}

function applyCompactChatbot() {
  const promptText = document.querySelector('.chatbotPromptBubble > span');
  if (promptText && normalize(promptText.textContent) !== 'Oi! Quer falar com a nossa equipe?') {
    promptText.innerHTML = '<strong>Oi!</strong> Quer falar com a nossa equipe?';
  }

  const chatbotWindow = document.querySelector('.chatbotWindow');
  if (!chatbotWindow) return;
  chatbotWindow.classList.add('chatbotCompact');

  const messages = [...chatbotWindow.querySelectorAll('.chatMessage')];
  const botMessages = messages.filter((message) => message.classList.contains('bot'));
  const lastBot = botMessages.at(-1);

  messages.forEach((message) => {
    message.classList.toggle('chatbotCompactHidden', message !== lastBot);
  });

  if (lastBot) {
    const textBox = [...lastBot.children].find((child) => child.tagName === 'DIV');
    setText(textBox, 'Olá! Como podemos ajudar?');
  }

  const options = [...chatbotWindow.querySelectorAll('.chatbotOptions button')];
  if (options.length >= 2) {
    const configs = [
      { label: 'Quero um orçamento', source: 'chatbot_orcamento', message: WHATSAPP_MESSAGES.quote },
      { label: 'Tenho uma dúvida', source: 'chatbot_duvida', message: WHATSAPP_MESSAGES.question },
    ];

    options.forEach((button, index) => {
      if (index > 1) {
        button.classList.add('chatbotCompactHidden');
        return;
      }

      const config = configs[index];
      button.classList.add('chatbotWhatsappOption');
      setText(button, config.label);

      if (button.dataset.compactWhatsappBound === '1') return;
      button.dataset.compactWhatsappBound = '1';

      button.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          trackWhatsappSource(config.source);
          window.open(buildWhatsappUrl(config.message), '_blank', 'noopener,noreferrer');
        },
        true
      );
    });
  }

  const privacy = chatbotWindow.querySelector('.chatbotPrivacy');
  setText(privacy, 'Atendimento rápido pelo WhatsApp.');
}

function injectStyles() {
  if (document.getElementById('projem-fundo-funil-adjustments')) return;

  const style = document.createElement('style');
  style.id = 'projem-fundo-funil-adjustments';
  style.textContent = `
    .logoLink img.headerLogoSymbol {
      width: 52px !important;
      max-height: 46px !important;
    }

    .drawer img.drawerLogoSymbol {
      width: 72px !important;
      max-height: 72px !important;
    }

    .heroCopy h1 span {
      font-weight: inherit !important;
    }

    .heroCopy > p,
    .economyText > p,
    .invoiceIntro > p,
    .flowPanel > p {
      font-weight: 400 !important;
    }

    .heroWhatsappButton,
    .whatsappActionButton,
    .chatbotWhatsappOption,
    .chatbotFinished a {
      background: #25d366 !important;
      background-image: none !important;
      border-color: #25d366 !important;
      color: #fff !important;
      box-shadow: 0 8px 18px rgba(37, 211, 102, .22) !important;
    }

    .heroWhatsappButton:hover,
    .whatsappActionButton:hover,
    .chatbotWhatsappOption:hover,
    .chatbotFinished a:hover {
      background: #1fb85a !important;
      border-color: #1fb85a !important;
    }

    .topbar a.whatsappDestination,
    .footer a.whatsappDestination {
      color: #25d366 !important;
    }

    .chatbotWindow.chatbotCompact {
      width: 330px !important;
      height: 330px !important;
      min-height: 0 !important;
      max-height: calc(100vh - 112px) !important;
    }

    .chatbotWindow.chatbotCompact .chatbotHeader {
      min-height: 64px !important;
      padding: 10px 12px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotHeaderAvatar {
      width: 40px !important;
      height: 40px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotMessages {
      flex: 0 0 auto !important;
      min-height: 92px !important;
      max-height: 112px !important;
      padding: 14px 12px !important;
      overflow: hidden !important;
    }

    .chatbotWindow.chatbotCompact .chatbotComposer {
      flex: 1 1 auto !important;
      padding: 12px !important;
    }

    .chatbotCompactHidden {
      display: none !important;
    }

    .chatbotWindow.chatbotCompact .chatbotOptions {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotOptions button {
      min-height: 44px !important;
      text-align: center !important;
      justify-content: center !important;
      font-size: 12px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotPrivacy {
      margin-top: 10px !important;
    }

    .floatingWhatsappButton {
      background: #25d366 !important;
    }

    .floatingWhatsappButton.chatOpen {
      background: #141414 !important;
    }

    @media (max-width: 760px) {
      .logoLink img.headerLogoSymbol {
        width: 44px !important;
        max-height: 40px !important;
      }

      .header {
        height: 64px !important;
      }

      .topCta,
      .mobileMenuButton {
        width: 40px !important;
        height: 40px !important;
        min-height: 40px !important;
        flex-basis: 40px !important;
      }

      .hero {
        min-height: 455px !important;
      }

      .heroContent {
        min-height: 455px !important;
        padding: 24px 20px 30px !important;
      }

      .heroCopy h1 {
        max-width: 320px !important;
        font-size: 28px !important;
        line-height: 1.1 !important;
      }

      .heroCopy p {
        max-width: 320px !important;
        margin-top: 15px !important;
        font-size: 13.5px !important;
        line-height: 1.5 !important;
      }

      .heroButtons {
        max-width: 320px !important;
        gap: 9px !important;
        margin-top: 20px !important;
      }

      .heroButtons .primaryButton,
      .heroButtons .outlineButton {
        width: 100% !important;
        min-height: 44px !important;
        padding-inline: 14px !important;
        font-size: 13px !important;
      }

      .economySection {
        padding-top: 38px !important;
      }

      .flowShell {
        width: 100% !important;
        max-width: 100% !important;
      }

      .simulatorPanel,
      .invoicePanel {
        padding: 16px !important;
      }

      .modeTabs button {
        min-height: 46px !important;
        font-size: 12px !important;
      }

      .choiceGrid button {
        min-height: 70px !important;
      }

      .invoiceUploadBox {
        padding: 13px !important;
      }

      .chatbotPromptBubble {
        width: min(250px, calc(100vw - 82px)) !important;
        min-height: 62px !important;
        grid-template-columns: 40px 1fr !important;
        font-size: 12px !important;
      }

      .chatbotPromptAvatar {
        width: 40px !important;
        height: 40px !important;
      }

      .chatbotWindow.chatbotCompact {
        width: calc(100vw - 20px) !important;
        height: 300px !important;
        max-height: calc(100dvh - 82px) !important;
        border-radius: 16px !important;
      }

      .floatingWhatsapp {
        right: 10px !important;
        bottom: max(10px, env(safe-area-inset-bottom)) !important;
      }

      .floatingWhatsappButton {
        width: 56px !important;
        height: 56px !important;
      }
    }

    @media (max-width: 390px) {
      .logoLink img.headerLogoSymbol {
        width: 42px !important;
      }

      .heroCopy h1 {
        font-size: 27px !important;
      }

      .heroCopy p {
        font-size: 13px !important;
      }

      .stepLine {
        gap: 5px !important;
      }

      .stepLine small {
        font-size: 9px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function applyAdjustments() {
  injectStyles();
  applyHero();
  markWhatsappDestinations();
  applyCompactChatbot();
}

let scheduled = false;
function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyAdjustments();
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
