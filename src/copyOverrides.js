const HERO_TITLE = 'Energia solar em Santa Rosa e região.';
const HERO_SUPPORT = 'Projeto e acompanhamento técnico realizados por engenheiro, instalação própria e pós-venda preparado para acompanhar você depois da instalação.';
const WHATSAPP_NUMBER = '555599686302';
const WHATSAPP_QUOTE_MESSAGE = 'Olá! Vim pelo site da PROJEM e gostaria de receber um orçamento de energia solar. Posso enviar minha fatura para análise?';
const WHATSAPP_QUESTION_MESSAGE = 'Olá! Vim pelo site da PROJEM e tenho uma dúvida sobre energia solar.';

function normalize(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function buildWhatsappUrl(message = WHATSAPP_QUOTE_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
    label.textContent = text;
    return;
  }

  element.append(document.createTextNode(` ${text}`));
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

function configureWhatsappLink(element, source, message = WHATSAPP_QUOTE_MESSAGE) {
  if (!element) return;

  element.href = buildWhatsappUrl(message);
  element.target = '_blank';
  element.rel = 'noopener noreferrer';
  element.classList.add('whatsappDestination');

  if (element.dataset.whatsappTrackingBound === '1') return;
  element.dataset.whatsappTrackingBound = '1';
  element.addEventListener('click', () => trackWhatsappSource(source), true);
}

function applyHeroChanges() {
  const title = document.querySelector('.heroCopy h1');
  if (title && normalize(title.textContent) !== HERO_TITLE) {
    title.innerHTML = 'Receba seu orçamento de energia solar <span>em poucos minutos.</span>';
  }

  setText(document.querySelector('.heroCopy > p'), HERO_SUPPORT);
  setTextKeepingIcon(document.querySelector('.heroButtons .primaryButton'), 'Simular minha economia');

  const whatsappButton = document.querySelector('.heroButtons .outlineButton');
  if (whatsappButton) {
    setTextKeepingIcon(whatsappButton, 'Falar pelo WhatsApp');
    whatsappButton.classList.add('whatsappActionButton');
    configureWhatsappLink(whatsappButton, 'hero_whatsapp');
  }
}

function createSimulatorWhatsappCard(variant) {
  const card = document.createElement('aside');
  card.className = `simulatorWhatsappCard simulatorWhatsappCard--${variant}`;
  card.innerHTML = `
    <span class="simulatorWhatsappEyebrow">ATENDIMENTO DIRETO</span>
    <h3>Prefere falar com a equipe?</h3>
    <p>Tire suas dúvidas e converse com a equipe comercial pelo WhatsApp.</p>
    <a href="${buildWhatsappUrl(WHATSAPP_QUOTE_MESSAGE)}" target="_blank" rel="noopener noreferrer">
      Falar pelo WhatsApp
    </a>
  `;

  const link = card.querySelector('a');
  link.classList.add('whatsappDestination');
  link.addEventListener('click', () => trackWhatsappSource(`simulador_${variant}_whatsapp`), true);
  return card;
}

function ensureSimulatorWhatsappCtas() {
  const economyGrid = document.querySelector('.economyGrid');
  const visualWrap = document.querySelector('.simulatorVisualSlotWrap');
  const flowShell = document.querySelector('.flowShell');
  if (!economyGrid || !flowShell) return;

  if (visualWrap && !visualWrap.querySelector('.simulatorWhatsappCard--desktop')) {
    visualWrap.appendChild(createSimulatorWhatsappCard('desktop'));
  }

  if (!economyGrid.querySelector('.simulatorWhatsappCard--mobile')) {
    flowShell.insertAdjacentElement('beforebegin', createSimulatorWhatsappCard('mobile'));
  }
}

function markWhatsappDestinations() {
  document.querySelectorAll('a[href*="wa.me/"]').forEach((anchor) => {
    anchor.classList.add('whatsappDestination');
  });

  // O fluxo de fatura foi removido; o simulador é a conversão principal.
  document.querySelector('.resultFlow > button.primaryButton')?.classList.add('whatsappActionButton');
  document.querySelector('.chatbotFinished a')?.classList.add('whatsappActionButton');
}

function applyCompactChatbot() {
  const promptText = document.querySelector('.chatbotPromptBubble > span');
  if (promptText) {
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
      ['Quero um orçamento', 'chatbot_orcamento', WHATSAPP_QUOTE_MESSAGE],
      ['Tenho uma dúvida', 'chatbot_duvida', WHATSAPP_QUESTION_MESSAGE],
    ];

    options.forEach((button, index) => {
      if (index > 1) {
        button.classList.add('chatbotCompactHidden');
        return;
      }

      const [label, source, message] = configs[index];
      setText(button, label);
      button.classList.add('chatbotWhatsappOption');

      if (button.dataset.compactWhatsappBound === '1') return;
      button.dataset.compactWhatsappBound = '1';
      button.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          trackWhatsappSource(source);
          window.open(buildWhatsappUrl(message), '_blank', 'noopener,noreferrer');
        },
        true
      );
    });
  }

  setText(chatbotWindow.querySelector('.chatbotPrivacy'), 'Atendimento rápido pelo WhatsApp.');
}

function injectStyles() {
  if (document.getElementById('projem-conversion-adjustments')) return;

  const style = document.createElement('style');
  style.id = 'projem-conversion-adjustments';
  style.textContent = `
    .logoLink img.headerLogoSymbol {
      width: 50px !important;
      max-height: 44px !important;
    }

    .drawer img.drawerLogoSymbol {
      width: 72px !important;
      max-height: 72px !important;
    }

    .heroCopy h1 span { font-weight: inherit !important; }

    .heroCopy > p,
    .economyText > p,
    .invoiceIntro > p,
    .flowPanel > p { font-weight: 400 !important; }

    .whatsappActionButton,
    .chatbotWhatsappOption,
    .chatbotFinished a,
    .simulatorWhatsappCard a {
      background: #25d366 !important;
      background-image: none !important;
      border-color: #25d366 !important;
      color: #fff !important;
      box-shadow: 0 8px 18px rgba(37, 211, 102, .22) !important;
    }

    .whatsappActionButton:hover,
    .chatbotWhatsappOption:hover,
    .chatbotFinished a:hover,
    .simulatorWhatsappCard a:hover {
      background: #1fb85a !important;
      border-color: #1fb85a !important;
    }

    .topbar a.whatsappDestination,
    .footer a.whatsappDestination { color: #25d366 !important; }

    .simulatorVisualSlotWrap {
      flex-direction: column !important;
      gap: 16px !important;
    }

    .simulatorWhatsappCard {
      width: 100%;
      border: 1px solid #e7e7e7;
      border-radius: 12px;
      padding: 16px;
      background: #fff;
      box-shadow: 0 10px 24px rgba(0,0,0,.05);
    }

    .simulatorWhatsappEyebrow {
      display: block;
      margin-bottom: 7px;
      color: #148447;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .06em;
    }

    .simulatorWhatsappCard h3 {
      margin: 0;
      color: #171717;
      font-size: 16px;
      line-height: 1.25;
      font-weight: 600;
    }

    .simulatorWhatsappCard p {
      margin: 8px 0 13px;
      color: #666;
      font-size: 12px;
      line-height: 1.45;
      font-weight: 400;
    }

    .simulatorWhatsappCard a {
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      padding: 0 12px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
    }

    .simulatorWhatsappCard--mobile { display: none; }

    .chatbotWindow.chatbotCompact {
      width: 330px !important;
      height: 320px !important;
      min-height: 0 !important;
      max-height: calc(100vh - 110px) !important;
    }

    .chatbotWindow.chatbotCompact .chatbotHeader {
      min-height: 62px !important;
      padding: 10px 12px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotHeaderAvatar {
      width: 38px !important;
      height: 38px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotMessages {
      flex: 0 0 auto !important;
      min-height: 88px !important;
      max-height: 105px !important;
      padding: 13px 12px !important;
      overflow: hidden !important;
    }

    .chatbotWindow.chatbotCompact .chatbotComposer {
      flex: 1 1 auto !important;
      padding: 11px 12px !important;
    }

    .chatbotCompactHidden { display: none !important; }

    .chatbotWindow.chatbotCompact .chatbotOptions {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }

    .chatbotWindow.chatbotCompact .chatbotOptions button {
      min-height: 43px !important;
      text-align: center !important;
      font-size: 12px !important;
    }

    .floatingWhatsappButton { background: #25d366 !important; }
    .floatingWhatsappButton.chatOpen { background: #141414 !important; }

    @media (max-width: 1120px) {
      .simulatorWhatsappCard--desktop { display: none !important; }
      .simulatorWhatsappCard--mobile {
        display: block !important;
        max-width: 520px;
        margin: 0 auto;
      }
    }

    @media (max-width: 760px) {
      .logoLink img.headerLogoSymbol {
        width: 42px !important;
        max-height: 38px !important;
      }

      .header { height: 62px !important; }

      .topCta,
      .mobileMenuButton {
        width: 40px !important;
        height: 40px !important;
        min-height: 40px !important;
        flex: 0 0 40px !important;
      }

      .hero { min-height: 450px !important; }

      .heroContent {
        min-height: 450px !important;
        padding: 22px 20px 28px !important;
      }

      .heroCopy h1 {
        max-width: 320px !important;
        font-size: 28px !important;
        line-height: 1.1 !important;
      }

      .heroCopy p {
        max-width: 320px !important;
        margin-top: 14px !important;
        font-size: 13.5px !important;
        line-height: 1.5 !important;
      }

      .heroButtons {
        max-width: 320px !important;
        gap: 9px !important;
        margin-top: 19px !important;
      }

      .heroButtons .primaryButton,
      .heroButtons .outlineButton {
        width: 100% !important;
        min-height: 44px !important;
        padding-inline: 14px !important;
        font-size: 13px !important;
      }

      .economySection { padding-top: 36px !important; }

      .economyGrid {
        gap: 18px !important;
      }

      .simulatorWhatsappCard--mobile {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 14px !important;
      }

      .flowShell {
        width: 100% !important;
        max-width: 100% !important;
      }

      .simulatorPanel,
      .invoicePanel { padding: 16px !important; }

      .modeTabs button {
        min-height: 46px !important;
        font-size: 12px !important;
      }

      .choiceGrid button { min-height: 68px !important; }
      .invoiceUploadBox { padding: 13px !important; }

      .chatbotPromptBubble {
        width: min(245px, calc(100vw - 82px)) !important;
        min-height: 60px !important;
        grid-template-columns: 38px 1fr !important;
        font-size: 12px !important;
      }

      .chatbotPromptAvatar {
        width: 38px !important;
        height: 38px !important;
      }

      .chatbotWindow.chatbotCompact {
        width: calc(100vw - 20px) !important;
        height: 292px !important;
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
      .logoLink img.headerLogoSymbol { width: 40px !important; }
      .heroCopy h1 { font-size: 27px !important; }
      .heroCopy p { font-size: 13px !important; }
      .stepLine { gap: 5px !important; }
      .stepLine small { font-size: 9px !important; }
    }
  `;

  document.head.appendChild(style);
}

function applyAdjustments() {
  injectStyles();
  applyHeroChanges();
  ensureSimulatorWhatsappCtas();
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
  observer.observe(root, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
