import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  Phone,
  MapPin,
  Clock,
  Zap,
  FileText,
  ShieldCheck,
  MapPinned,
  PanelsTopLeft,
  Upload,
  BarChart3,
  Home,
  Building2,
  Tractor,
  Factory,
  BadgeCheck,
  UsersRound,
  ClipboardCheck,
  Mail,
  ChevronDown,
  ArrowRight,
  LocateFixed,
  MessageCircle,
  Globe,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import "./styles.css";

import logo from "./assets/logo.png";
import logoSymbol from "./assets/logo-simbolo.png";
import mapaSantaRosa from "./assets/mapa-rs-santa-rosa.png";

/*
  CONFIGURAÇÃO DE INTEGRAÇÃO

  Crie um arquivo .env na raiz do projeto:

  VITE_MAKE_WEBHOOK_URL=https://hook.us2.make.com/SEU_WEBHOOK
  VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

  O webhook do Make recebe JSON nos leads de simulação.
  No envio de fatura, se houver arquivo selecionado, recebe FormData:
  - payload: JSON completo
  - campos individuais do payload
  - fatura: arquivo, se selecionado

  Caso o webhook não esteja configurado, o fluxo continua para o WhatsApp.
*/
const DEFAULT_MAKE_WEBHOOK_URL = "https://hook.us2.make.com/pzs8lxs9o1rq48hh96el0mgmoaubts5p";
const DEFAULT_GA_MEASUREMENT_ID = "G-XSGE5PYZFF";
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK_URL;
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;
const PRIMARY_LEAD_EVENT = "generate_lead";

const ISALES_ENDPOINT = "https://app.isales.company/formulario/cliente";
const ISALES_TOKEN = "HJK1303ISAL567";
const ISALES_FORM_IDS = {
  simulador_solar: "UFD165TR951",
  envio_fatura: "UFD166TR951",
};

function submitISalesForm(payload = {}) {
  if (typeof document === "undefined") return;

  const originForm = payload.origem_formulario || payload.origem || "simulador_solar";
  const fid = originForm === "envio_fatura" ? ISALES_FORM_IDS.envio_fatura : ISALES_FORM_IDS.simulador_solar;

  const nome = safeValue(payload.nome, payload.name || payload.fullName || "").toString().trim();
  const telefone = cleanNumber(payload.telefone || payload.phone || payload.whatsapp || payload.celular || "");
  const cidade = safeValue(payload.cidade, payload.city || payload.cidade_digitada || "").toString().trim();
  const valorEnergia = safeValue(
    payload.valor_energia,
    payload.valor_conta || payload.billValue || payload.conta || payload.valor_conta_formatado || ""
  );

  const fields = {
    e: ISALES_TOKEN,
    fid,
    redirect: "1",
  };

  if (nome) fields.nome = nome;
  if (telefone) fields.telefone = telefone;
  if (cidade) fields.cidade = cidade;
  if (valorEnergia !== "" && valorEnergia !== null && valorEnergia !== undefined) {
    fields.valor_energia = String(valorEnergia);
  }

  const tipoTelhado = safeValue(payload.tipo_telhado, payload.structureType || "").toString().trim();
  const statusPesquisa = safeValue(payload.status_pesquisa_solar, payload.ja_fez_orcamento || "").toString().trim();
  const empresaOuPropriedade = safeValue(payload.empresa_ou_propriedade, payload.empresa || payload.propriedade || "").toString().trim();
  const segmento = safeValue(payload.segmento, payload.tipo_unidade || payload.tipo_imovel || "").toString().trim();
  const linkFatura = safeValue(payload.link_fatura, payload.fatura_url || payload.url_fatura || "").toString().trim();

  if (tipoTelhado) fields.tipo_telhado = tipoTelhado;
  if (statusPesquisa && statusPesquisa !== "Não informado") fields.status_pesquisa_solar = statusPesquisa;
  if (empresaOuPropriedade) fields.empresa_ou_propriedade = empresaOuPropriedade;
  if (segmento) fields.segmento = segmento;
  if (linkFatura) fields.link_fatura = linkFatura;

  const frameName = "isales_hidden_frame";
  let frame = document.querySelector(`iframe[name="${frameName}"]`);
  if (!frame) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.style.display = "none";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);
  }

  const form = document.createElement("form");
  form.action = ISALES_ENDPOINT;
  form.method = "POST";
  form.target = frameName;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => form.remove(), 1500);
}
import heroCoupleImg from "./assets/hero-casal-projem.png";
import heroMockupImg from "./assets/hero-mockup-projem.png";
import simulatorVisualImg from "./assets/simulator-visual-projem.png";
import chatbotAvatarImg from "./assets/chatbot-projem.png";
import equipeProjemImg from "./assets/equipe-projem.png";
import trustInstallerImg from "./assets/trust-installer-projem.png";
import residentialImg from "./assets/servico-residencial-projem.png";
import commercialImg from "./assets/servico-comercial-projem.png";
import ruralImg from "./assets/servico-rural-projem.png";
import industrialImg from "./assets/servico-industrial-projem.png";
const imageSlots = {
  heroCouple: heroCoupleImg,
  heroFloatingMockup: heroMockupImg,
  simulatorVisual: simulatorVisualImg,
  aboutInstaller: equipeProjemImg,
  trustInstaller: trustInstallerImg,
  residential: residentialImg,
  commercial: commercialImg,
  rural: ruralImg,
  industrial: industrialImg,
  map: mapaSantaRosa,
};
const phoneNumberPrimary = "(55) 9968-6302";
const whatsappNumber = "555599686302";
const whatsappDefaultMessage = "Olá, vim pelo site. Gostaria de tirar algumas dúvidas.";
const mapsLocationUrl = "https://www.google.com/maps/search/?api=1&query=Projem%20energia%20solar%20-%20Santa%20Rosa%20RS%20-%20R.%20Guapor%C3%A9%20401";

const unitTypes = [
  { id: "Residencial", label: "Residencial", helper: "Casa ou condomínio" },
  { id: "Comercial", label: "Comercial", helper: "Empresa ou loja" },
  { id: "Rural", label: "Rural", helper: "Propriedade rural" },
  { id: "Industrial", label: "Industrial", helper: "Grande demanda" },
];

const structureTypes = [
  { id: "Telha cerâmica/barro", label: "Telha cerâmica", helper: "modelo residencial comum" },
  { id: "Fibrocimento", label: "Fibrocimento", helper: "cobertura leve e comum" },
  { id: "Metálico", label: "Metálico", helper: "estrutura metálica" },
  { id: "Laje", label: "Laje", helper: "superfície plana" },
  { id: "Não informado", label: "Não sei informar", helper: "a fatura ajuda na análise" },
];

const cityOptions = [
  "Santa Rosa",
  "Santo Ângelo",
  "Ijuí",
  "Horizontina",
  "Giruá",
  "Santo Cristo",
  "Cândido Godói",
  "Chiapetta",
  "Três de Maio",
];

const installationIntents = [
  { id: "0_3_meses", label: "Até 3 meses", helper: "Quero instalar em breve" },
  { id: "3_6_meses", label: "De 3 a 6 meses", helper: "Estou me planejando" },
  { id: "6_12_meses", label: "De 6 a 12 meses", helper: "Ainda tenho algum prazo" },
  { id: "sem_prazo", label: "Ainda pesquisando", helper: "Quero entender melhor primeiro" },
];

const serviceItems = [
  {
    id: "residential",
    title: "Residencial",
    text: "Soluções completas para casas e condomínios.",
    icon: Home,
    brief: "Imagem residencial em aberto. Casa moderna com placas solares.",
  },
  {
    id: "commercial",
    title: "Comercial",
    text: "Redução de custos e aumento da eficiência para seu negócio.",
    icon: Building2,
    brief: "Imagem comercial em aberto. Empresa, loja, mercado ou telhado corporativo.",
  },
  {
    id: "rural",
    title: "Rural",
    text: "Energia confiável para fazendas e propriedades.",
    icon: Tractor,
    brief: "Imagem rural em aberto. Propriedade no campo, lavoura, galpão e solar.",
  },
  {
    id: "industrial",
    title: "Engenharia e Industrial",
    text: "Projetos sob medida para grandes demandas.",
    icon: Factory,
    brief: "Imagem industrial em aberto. Instalação de grande porte ou equipe técnica.",
  },
];

const steps = [
  { title: "Conta de luz", text: "Informe o valor ou envie sua fatura.", icon: FileText },
  { title: "Simulação", text: "Avance pelas etapas do consumo.", icon: BarChart3 },
  { title: "Envio da fatura", text: "Você pode enviar a conta pelo WhatsApp.", icon: Upload },
  { title: "Análise técnica", text: "A equipe avalia seu cenário.", icon: ShieldCheck },
  { title: "Economia", text: "Receba uma estimativa com mais clareza.", icon: Zap },
];

const faqItems = [
  {
    question: "A análise da fatura gera algum custo ou compromisso?",
    answer:
      "Não. A análise inicial é gratuita e sem compromisso. A PROJEM avalia sua fatura para entender seu consumo e indicar se a energia solar faz sentido para o seu caso.",
  },
  {
    question: "Preciso fazer alguma manutenção no sistema?",
    answer:
      "Sim, mas é uma manutenção simples e periódica. Em geral, envolve limpeza dos módulos e conferência do funcionamento do sistema para manter a geração eficiente.",
  },
  {
    question: "Quanto tempo leva para receber a análise técnica?",
    answer:
      "Após o envio da fatura e dos dados básicos, a equipe consegue fazer uma avaliação inicial e retornar pelo WhatsApp com mais clareza sobre economia, viabilidade e próximos passos.",
  },
  {
    question: "A PROJEM cuida de toda a parte de documentação?",
    answer:
      "Sim. A PROJEM acompanha o processo técnico, projeto, documentação e etapas necessárias para a instalação e regularização do sistema junto à concessionária.",
  },
];

function cleanNumber(value = "") {
  return String(value).replace(/\D/g, "");
}

function parseCurrency(value = "") {
  const digits = cleanNumber(value);
  if (!digits) return 0;
  return Number(digits) / 100;
}

function currencyInput(value = "") {
  const digits = cleanNumber(value);
  if (!digits) return "";
  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function phoneIsValid(value = "") {
  const phone = cleanNumber(value);
  return phone.length >= 10 && phone.length <= 13;
}

function calculateEstimate({ billValue, unitType, structureType }) {
  let percent = 0.72;

  if (billValue >= 650) percent += 0.04;
  if (billValue >= 1000) percent += 0.035;

  if (unitType === "Comercial") percent += 0.025;
  if (unitType === "Rural") percent += 0.03;
  if (unitType === "Industrial") percent += 0.02;

  if (structureType === "Fibrocimento") percent += 0.02;
  if (structureType === "Metálico") percent += 0.015;
  if (structureType === "Laje") percent -= 0.035;
  if (structureType === "Não informado") percent -= 0.015;

  percent = Math.max(0.62, Math.min(0.89, percent));

  const monthlySavings = billValue * percent;
  const newBill = Math.max(0, billValue - monthlySavings);

  return {
    percent,
    monthlySavings,
    newBill,
    annualSavings: monthlySavings * 12,
    twentyFiveYears: monthlySavings * 12 * 25,
  };
}

function buildWhatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function getOrCreateId(key) {
  try {
    const current = localStorage.getItem(key);
    if (current) return current;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(key, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function createRuntimeId(prefix = "lead") {
  const raw =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${String(raw).replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function safeValue(value, fallback = "") {
  return value === undefined || value === null ? fallback : value;
}

function toSheetDate(date = new Date()) {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function collectAttribution() {
  const params = new URLSearchParams(window.location.search);
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
  ];

  const fromUrl = {};
  keys.forEach((key) => {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  });

  try {
    const stored = JSON.parse(localStorage.getItem("projem_attribution") || "{}");
    const merged = { ...stored, ...fromUrl };

    if (Object.keys(fromUrl).length > 0) {
      localStorage.setItem("projem_attribution", JSON.stringify(merged));
    }

    return merged;
  } catch {
    return fromUrl;
  }
}

function buildBasePayload(originForm) {
  const attribution = collectAttribution();
  const eventId = createRuntimeId("lead");
  const now = new Date();

  return {
    lead_id: eventId,
    event_id: eventId,
    session_id: getOrCreateId("projem_session_id"),
    client_id: getOrCreateId("projem_client_id"),
    origem_formulario: originForm,
    origem: originForm,
    evento: PRIMARY_LEAD_EVENT,
    evento_origem: "site_projem_solar",
    fonte_site: window.location.hostname || "sitesolar.projem.com.br",
    timestamp: now.toISOString(),
    data: toSheetDate(now),
    pagina_url: window.location.href,
    page_url: window.location.href,
    pagina_path: window.location.pathname,
    referrer: document.referrer || "",
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    utm_source: attribution.utm_source || "",
    utm_medium: attribution.utm_medium || "",
    utm_campaign: attribution.utm_campaign || "",
    utm_content: attribution.utm_content || "",
    utm_term: attribution.utm_term || "",
    utm_id: attribution.utm_id || "",
    gclid: attribution.gclid || "",
    gbraid: attribution.gbraid || "",
    wbraid: attribution.wbraid || "",
    fbclid: attribution.fbclid || "",
  };
}
function getCommercialPriority({ billValue = 0, installationIntent = "sem_prazo", hasInvoice = false }) {
  const nearTerm = installationIntent === "0_3_meses";
  const midTerm = installationIntent === "3_6_meses";
  if (billValue >= 850 && nearTerm) return "Alta";
  if (billValue >= 500 && (nearTerm || midTerm)) return "Média Alta";
  if (billValue >= 500) return "Média";
  if (hasInvoice && billValue >= 400) return "Média";
  return "Baixa";
}

function normalizeLeadPayload(payload = {}) {
  const eventId = payload.event_id || payload.lead_id || createRuntimeId("lead");
  const phone = cleanNumber(payload.telefone || payload.whatsapp || "");
  const bill = safeValue(payload.conta, payload.valor_conta || "");
  const city = safeValue(payload.cidade_digitada, payload.cidade || "");

  return {
    ...payload,
    lead_id: eventId,
    event_id: eventId,
    evento: PRIMARY_LEAD_EVENT,
    origem: payload.origem || payload.origem_formulario || "site",
    telefone: phone,
    whatsapp: phone,
    conta: bill,
    valor_conta: bill,
    cidade_digitada: city,
    cidade: payload.cidade || city,
    regiao: payload.regiao || "Santa Rosa/RS e região",
    ja_fez_orcamento: payload.ja_fez_orcamento || "Não informado",
    page_url: payload.page_url || payload.pagina_url || window.location.href,
    pagina_url: payload.pagina_url || payload.page_url || window.location.href,
    data: payload.data || toSheetDate(),
    status_lead: payload.status_lead || "Novo",
    qualified_lead_enviado_ads: payload.qualified_lead_enviado_ads || "Não",
    valor_conversao: safeValue(payload.valor_conversao, ""),
  };
}

function buildTrackingParams(payload = {}) {
  return {
    lead_id: payload.lead_id || "",
    event_id: payload.event_id || "",
    session_id: payload.session_id || "",
    client_id: payload.client_id || "",
    origem_formulario: payload.origem_formulario || "",
    origem: payload.origem || "",
    origem_cta: payload.origem_cta || "",
    valor_conta: payload.valor_conta ?? "",
    conta: payload.conta ?? "",
    tipo_imovel: payload.tipo_imovel || "",
    tipo_unidade: payload.tipo_unidade || "",
    tipo_telhado: payload.tipo_telhado || "",
    cidade: payload.cidade || "",
    cidade_digitada: payload.cidade_digitada || "",
    prazo_instalacao: payload.prazo_instalacao || "",
    fatura_enviada: payload.fatura_enviada ?? "",
    nivel_intencao: payload.nivel_intencao || "",
    prioridade_comercial: payload.prioridade_comercial || "",
    lead_priority: payload.lead_priority || "",
    utm_source: payload.utm_source || "",
    utm_medium: payload.utm_medium || "",
    utm_campaign: payload.utm_campaign || "",
    utm_content: payload.utm_content || "",
    utm_term: payload.utm_term || "",
    utm_id: payload.utm_id || "",
    gclid: payload.gclid || "",
    gbraid: payload.gbraid || "",
    wbraid: payload.wbraid || "",
    fbclid: payload.fbclid || "",
  };
}

function trackEvent(name, params = {}) {
  const payload = {
    event_category: "solar_lead",
    page_path: window.location.pathname,
    source_site: window.location.hostname || "sitesolar.projem.com.br",
    site_version: "qualified-funnel-v2",
    ...params,
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
}

function markSimulatorStarted(entryPoint = "simulator") {
  try {
    if (sessionStorage.getItem("projem_simulator_started") === "1") return;
    sessionStorage.setItem("projem_simulator_started", "1");
  } catch {}
  trackEvent("simulator_start", { entry_point: entryPoint, simulator_version: "v2" });
}

function trackSimulatorStepView(step, stepName) {
  trackEvent("simulator_step_view", { simulator_version: "v2", step_number: step, step_name: stepName });
}

function trackSimulatorStepComplete(step, stepName, value = {}) {
  trackEvent("simulator_step_complete", { simulator_version: "v2", step_number: step, step_name: stepName, ...value });
}

function trackSimulatorStepError(step, stepName, errorType) {
  trackEvent("simulator_step_error", { simulator_version: "v2", step_number: step, step_name: stepName, error_type: errorType });
}

function setupBehaviorTracking() {
  const seenSections = new Set();
  const sections = ["inicio", "simulador", "servicos", "vantagens", "sobre", "analises", "contato"];
  let observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        const id = entry.target.id;
        if (!id || seenSections.has(id)) return;
        seenSections.add(id);
        trackEvent("section_view", { section_name: id });
      });
    }, { threshold: [0.5] });
    sections.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
  }
  const milestones = new Set();
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const percent = Math.round((window.scrollY / max) * 100);
      [50, 75, 90].forEach((milestone) => {
        if (percent >= milestone && !milestones.has(milestone)) { milestones.add(milestone); trackEvent("scroll_milestone", { percent: milestone }); }
      });
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => { observer?.disconnect(); window.removeEventListener("scroll", onScroll); };
}
function initGa() {
  if (!GA_MEASUREMENT_ID || typeof document === "undefined") return;
  if (document.querySelector(`[data-ga-id="${GA_MEASUREMENT_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.dataset.gaId = GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

async function sendLeadToMake(payload, file) {
  if (!MAKE_WEBHOOK_URL) {
    return { ok: false, skipped: true, reason: "MAKE_WEBHOOK_URL_NOT_CONFIGURED" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response;

    if (file) {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      formData.append("fatura", file);

      response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } else {
      response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    }

    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error?.message || "MAKE_POST_FAILED" };
  } finally {
    clearTimeout(timeout);
  }
}

async function registerLeadSubmission(payload, file) {
  const normalizedPayload = normalizeLeadPayload(payload);

  trackEvent(PRIMARY_LEAD_EVENT, buildTrackingParams(normalizedPayload));
  submitISalesForm(normalizedPayload);

  const makeResponse = await sendLeadToMake(normalizedPayload, file);

  if (makeResponse.ok) {
    trackEvent("lead_delivery_success", {
      ...buildTrackingParams(normalizedPayload),
      delivery_system: "make",
      crm_system: "isales",
    });
  } else {
    trackEvent("lead_delivery_failed", {
      ...buildTrackingParams(normalizedPayload),
      delivery_system: "make",
      reason: makeResponse.reason || makeResponse.error || makeResponse.status || "unknown",
    });
  }

  return { payload: normalizedPayload, makeResponse };
}

async function submitLead({ payload, file, whatsappMessage, eventName }) {
  const { payload: normalizedPayload } = await registerLeadSubmission(payload, file);

  if (eventName && eventName !== PRIMARY_LEAD_EVENT) {
    trackEvent(eventName, buildTrackingParams(normalizedPayload));
  }

  trackEvent("whatsapp_click", {
    origem_formulario: normalizedPayload.origem_formulario,
    lead_id: normalizedPayload.lead_id,
    event_id: normalizedPayload.event_id,
  });

  window.location.href = buildWhatsappUrl(whatsappMessage);
}

async function reverseGeocode(latitude, longitude) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("reverse-geocode-failed");
  const data = await response.json();

  return (
    data.city ||
    data.locality ||
    data.principalSubdivision ||
    data.countryName ||
    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function SectionLabel({ children }) {
  return <p className="sectionLabel">{children}</p>;
}

function ImageSlot({ src, title, brief, className = "", children }) {
  return (
    <div className={`imageSlot ${className}`}>
      {src ? (
        <img src={src} alt={title} />
      ) : (
        <div className="slotPlaceholder" aria-label={title}>
          <strong>{title}</strong>
          {brief && <span>{brief}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function LocationField({ city, setCity, locationStatus, setLocationStatus, setGeo }) {
  async function detectLocation() {
    setLocationStatus({ type: "loading", text: "Detectando localização..." });

    if (!("geolocation" in navigator)) {
      setLocationStatus({
        type: "error",
        text: "Seu navegador não permite detectar localização. Digite sua cidade.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGeo?.({ latitude, longitude });

        try {
          const detectedCity = await reverseGeocode(latitude, longitude);
          setCity(detectedCity);
          setLocationStatus({
            type: "success",
            text: "Localização detectada. Você pode editar se necessário.",
          });
        } catch {
          setCity(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationStatus({
            type: "success",
            text: "Coordenadas detectadas. Você pode trocar pela cidade manualmente.",
          });
        }
      },
      () => {
        setLocationStatus({
          type: "error",
          text: "Permissão negada ou indisponível. Digite sua cidade manualmente.",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 120000,
      }
    );
  }

  return (
    <div className="locationBlock">
      <label>
        Cidade
        <input
          list="city-options"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite sua cidade"
        />
      </label>

      <button type="button" className="locationButton" onClick={detectLocation}>
        <LocateFixed size={16} />
        Usar localização atual
      </button>

      {locationStatus.text && (
        <small className={`locationStatus ${locationStatus.type}`}>
          {locationStatus.text}
        </small>
      )}

      <datalist id="city-options">
        {cityOptions.map((cityName) => (
          <option key={cityName} value={cityName} />
        ))}
      </datalist>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    ["Início", "#inicio"],
    ["Sobre", "#sobre"],
    ["Serviços", "#servicos"],
    ["Vantagens", "#vantagens"],
    ["Análises", "#analises"],
    ["Contato", "#contato"],
  ];

  return (
    <>
      <div className="topbar">
        <div className="pageWidth topbarInner">
          <div className="topbarLeft">
            <span>
              <Phone size={13} />
              <a href={buildWhatsappUrl(whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                {phoneNumberPrimary}
              </a>
            </span>
            <span>
              <MapPin size={13} />
              <a href={mapsLocationUrl} target="_blank" rel="noopener noreferrer">
                Projem energia solar - Santa Rosa RS - R. Guaporé 401
              </a>
            </span>
          </div>
          <span><Clock size={13} /> Segunda a sexta: 08h às 18h</span>
        </div>
      </div>

      <header className="header">
        <div className="pageWidth headerInner">
          <button
            className="mobileMenuButton"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          <a href="#inicio" className="logoLink" aria-label="PROJEM Energia Solar">
            <img className="headerLogoSymbol" src={logoSymbol} alt="PROJEM Energia Solar" />
          </a>

          <nav className="desktopNav" aria-label="Navegação principal">
            {links.map(([label, href], index) => (
              <a key={href} href={href} className={index === 0 ? "active" : ""}>
                {label}
              </a>
            ))}
          </nav>

          <a className="topCta" href="#simulador" aria-label="Simular economia">
            <Zap size={15} />
            <span>Simular economia</span>
          </a>
        </div>
      </header>

      <div className={`drawerOverlay ${open ? "show" : ""}`} onClick={() => setOpen(false)}>
        <aside className="drawer" onClick={(event) => event.stopPropagation()}>
          <button className="drawerClose" type="button" onClick={() => setOpen(false)}>
            <X size={19} />
            Fechar
          </button>

          <img className="drawerLogoSymbol" src={logoSymbol} alt="PROJEM Energia Solar" />

          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}

          <a className="drawerCta" href="#simulador" onClick={() => setOpen(false)}>
            <Zap size={16} />
            Simular economia
          </a>
        </aside>
      </div>
    </>
  );
}

function Hero() {
  function handleSimulatorClick() {
    trackEvent("cta_click", { cta_name: "simulate_economy", location: "hero", destination: "simulator" });
    markSimulatorStarted("hero");
  }

  function handleWhatsappClick() {
    trackEvent("cta_click", { cta_name: "whatsapp", location: "hero", destination: "whatsapp" });
    trackEvent("whatsapp_click", { origem_formulario: "hero", origem_cta: "hero_whatsapp" });
  }

  return (
    <section id="inicio" className="hero">
      <div className="heroBackground">
        {imageSlots.heroCouple ? <img src={imageSlots.heroCouple} alt="Casal em frente a uma residência com energia solar" /> : <div className="heroImagePlaceholder" aria-label="Imagem de fundo do casal pendente" />}
      </div>
      <div className="heroOverlay" />
      <div className="pageWidth heroContent">
        <div className="heroCopy">
          <h1>Energia solar em Santa Rosa <span>e região.</span></h1>
          <p>Projeto e acompanhamento técnico realizados por engenheiro, instalação própria e pós-venda preparado para acompanhar você depois da instalação.</p>
          <div className="heroButtons">
            <a href="#simulador" className="primaryButton" onClick={handleSimulatorClick}><Zap size={16} />Simular minha economia</a>
            <a href={buildWhatsappUrl(whatsappDefaultMessage)} className="outlineButton dark" target="_blank" rel="noopener noreferrer" onClick={handleWhatsappClick}><MessageCircle size={16} />Falar pelo WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
function ProofBar() {
  return (
    <section className="proofBar">
      <div className="pageWidth proofGrid">
        <article>
          <Zap size={27} />
          <p>Análise técnica<br />da sua fatura</p>
        </article>
        <article>
          <MapPinned size={27} />
          <p>Atendimento próximo<br />em Santa Rosa/RS e região</p>
        </article>
        <article>
          <ShieldCheck size={27} />
          <p>Projetos bem<br />dimensionados</p>
        </article>
      </div>
    </section>
  );
}

function SimulateFlow() {
  const [step, setStep] = useState(1);
  const [billInput, setBillInput] = useState("");
  const [unitType, setUnitType] = useState("Residencial");
  const [structureType, setStructureType] = useState("Telha cerâmica/barro");
  const [city, setCity] = useState("");
  const [geo, setGeo] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ type: "", text: "" });
  const [installationIntent, setInstallationIntent] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [leadPayload, setLeadPayload] = useState(null);

  const billValue = parseCurrency(billInput);
  const result = useMemo(
    () => calculateEstimate({ billValue: billValue || 850, unitType, structureType }),
    [billValue, unitType, structureType]
  );

  const stepLabels = [
    { label: "Conta" },
    { label: "Perfil" },
    { label: "Local" },
    { label: "Prazo" },
    { label: "Contato" },
    { label: "Resultado" },
  ];

  const stepNames = {
    1: "bill_value",
    2: "property_type",
    3: "roof_type",
    4: "city",
    5: "installation_intent",
    6: "name",
    7: "whatsapp",
  };

  useEffect(() => {
    if (step <= 7) {
      trackSimulatorStepView(step, stepNames[step]);
      if (step === 6) {
        trackEvent("lead_form_start", {
          simulator_version: "v2",
          form_type: "simulator_lead",
          form_step: 6,
        });
      }
    }
  }, [step]);

  function getVisualStep() {
    if (step <= 1) return 1;
    if (step <= 3) return 2;
    if (step === 4) return 3;
    if (step === 5) return 4;
    if (step <= 7) return 5;
    return 6;
  }

  function next() {
    setError("");
    markSimulatorStarted("simulator_interaction");

    if (step === 1 && billValue <= 0) {
      setError("Informe o valor médio da conta de luz.");
      trackSimulatorStepError(step, stepNames[step], "missing_bill_value");
      return;
    }

    if (step === 4 && !city.trim()) {
      setError("Informe sua cidade ou use a localização automática.");
      trackSimulatorStepError(step, stepNames[step], "missing_city");
      return;
    }

    if (step === 5 && !installationIntent) {
      setError("Informe quando pretende instalar.");
      trackSimulatorStepError(step, stepNames[step], "missing_installation_intent");
      return;
    }

    if (step === 6 && !name.trim()) {
      setError("Informe seu nome.");
      trackSimulatorStepError(step, stepNames[step], "missing_name");
      return;
    }

    if (step <= 5) {
      trackSimulatorStepComplete(step, stepNames[step], {
        ...(step === 1 ? { bill_range: billValue >= 1000 ? "1000_plus" : billValue >= 500 ? "500_999" : "under_500" } : {}),
        ...(step === 2 ? { property_type: unitType } : {}),
        ...(step === 3 ? { roof_type: structureType } : {}),
        ...(step === 4 ? { city: city.trim() } : {}),
        ...(step === 5 ? { installation_intent: installationIntent } : {}),
      });
      setStep((current) => current + 1);
    } else if (step === 6) {
      trackSimulatorStepComplete(step, stepNames[step], { name_provided: "yes" });
      setStep(7);
    }
  }

  function back() {
    setError("");
    if (isSubmitting || isCalculating) return;
    if (step > 1) setStep((current) => current - 1);
  }

  function buildSimulationPayload() {
    const phoneNumber = cleanNumber(phone);

    return normalizeLeadPayload({
      ...buildBasePayload("simulador_solar"),
      nome: name.trim(),
      telefone: phoneNumber,
      whatsapp: phoneNumber,
      cidade: city.trim(),
      cidade_digitada: city.trim(),
      cidade_origem: geo ? "localizacao_automatica" : "manual",
      latitude: geo?.latitude || "",
      longitude: geo?.longitude || "",
      tipo_imovel: unitType,
      tipo_unidade: unitType,
      tipo_telhado: structureType,
      valor_conta: billValue,
      conta: billValue,
      valor_conta_formatado: formatMoney(billValue),
      estimativa_economia_mensal: Number(result.monthlySavings.toFixed(2)),
      economia_anual_estimada: Number(result.annualSavings.toFixed(2)),
      nova_conta_estimada: Number(result.newBill.toFixed(2)),
      percentual_economia: Number((result.percent * 100).toFixed(2)),
      fatura_enviada: false,
      fatura_nome_arquivo: "",
      status_lead: "Novo",
      nivel_intencao: billValue >= 850 ? "Alta" : "Média",
      prazo_instalacao: installationIntent,
      prioridade_comercial: getCommercialPriority({ billValue, installationIntent, hasInvoice: false }),
      lead_priority: getCommercialPriority({ billValue, installationIntent, hasInvoice: false }).toLowerCase().replace(/\s+/g, "_"),
      consentimento_contato: true,
      etapa_finalizada: "dados_completos",
      origem_cta: "revelar_estimativa",
      ja_fez_orcamento: "Não informado",
    });
  }

  async function revealEstimate() {
    setError("");

    if (!name.trim()) {
      setError("Informe seu nome para ver a estimativa.");
      return;
    }

    if (!phoneIsValid(phone)) {
      setError("Informe um WhatsApp válido para ver a estimativa.");
      return;
    }

    const payload = buildSimulationPayload();

    setIsSubmitting(true);
    setIsCalculating(true);
    setStep(8);
    setLeadPayload(payload);

    trackSimulatorStepComplete(7, "whatsapp", { whatsapp_provided: "yes" });
    trackEvent("generate_lead", {
      ...buildTrackingParams(payload),
      simulator_version: "v2",
    });

    const { payload: registeredPayload } = await registerLeadSubmission(payload);
    setLeadPayload(registeredPayload);

    window.setTimeout(() => {
      setIsCalculating(false);
      setIsSubmitting(false);
      trackEvent("simulator_result_view", {
        ...buildTrackingParams(registeredPayload),
        simulator_version: "v2",
        estimated_monthly_saving: registeredPayload.estimativa_economia_mensal,
      });
    }, 1600);
  }

  function sendResultToWhatsapp() {
    const payload = leadPayload || buildSimulationPayload();

    const whatsappMessage = [
      "Olá, fiz uma simulação no site da PROJEM e gostaria de uma análise técnica.",
      `Nome: ${name.trim()}`,
      `WhatsApp: ${phone}`,
      `Conta aproximada: ${formatMoney(billValue)}`,
      `Tipo de unidade: ${unitType}`,
      `Estrutura/telhado: ${structureType}`,
      `Cidade: ${city}`,
      `Prazo para instalação: ${installationIntent}`,
      `Economia estimada: ${formatMoney(result.monthlySavings)} por mês`,
      `Economia anual estimada: ${formatMoney(result.annualSavings)}`,
    ].filter(Boolean).join("\n");

    trackEvent("whatsapp_click", {
      origem_formulario: "simulador_solar",
      origem_cta: "resultado_simulador_whatsapp",
      lead_id: payload.lead_id,
      event_id: payload.event_id,
    });

    window.location.href = buildWhatsappUrl(whatsappMessage);
  }

  return (
    <div className="simulatorPanel">
      <div className="stepLine compactStepper" aria-label="Etapas da simulação">
        {stepLabels.map((item, index) => {
          const number = index + 1;
          const visualStep = getVisualStep();

          return (
            <div key={item.label} className={visualStep >= number ? "active" : ""}>
              <span>{number}</span>
              <small>{item.label}</small>
            </div>
          );
        })}
      </div>

      <div className="progressBar">
        <i style={{ width: `${(getVisualStep() / stepLabels.length) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="flowPanel">
          <h3>Qual o valor médio da sua conta de luz?</h3>
          <p>Use uma média mensal. A estimativa aparece apenas depois do preenchimento dos seus dados.</p>

          <label className="inputLabel">
            Valor da conta
            <input
              value={billInput}
              onChange={(event) => setBillInput(currencyInput(event.target.value))}
              placeholder="Ex.: R$ 850,00"
              inputMode="numeric"
            />
          </label>

          <div className="quickValues">
            {[350, 550, 850, 1200].map((value) => (
              <button type="button" key={value} onClick={() => setBillInput(formatMoney(value))}>
                {formatMoney(value)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flowPanel">
          <h3>Qual é o tipo de unidade?</h3>
          <p>Essa etapa ajuda a ajustar a projeção ao perfil de consumo.</p>

          <div className="choiceGrid">
            {unitTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={unitType === item.id ? "selected" : ""}
                onClick={() => setUnitType(item.id)}
              >
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flowPanel">
          <h3>Qual é a estrutura do telhado?</h3>
          <p>Se não souber, escolha a opção mais próxima. A fatura refina a análise depois.</p>

          <div className="choiceGrid">
            {structureTypes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={structureType === item.id ? "selected" : ""}
                onClick={() => setStructureType(item.id)}
              >
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flowPanel">
          <h3>Onde será o projeto?</h3>
          <p>Você pode detectar automaticamente ou digitar a cidade manualmente.</p>

          <LocationField
            city={city}
            setCity={setCity}
            locationStatus={locationStatus}
            setLocationStatus={setLocationStatus}
            setGeo={setGeo}
          />
        </div>
      )}

      {step === 5 && (
        <div className="flowPanel">
          <h3>Quando você pretende instalar?</h3>
          <p>Essa informação ajuda a equipe a priorizar o atendimento.</p>
          <div className="choiceGrid">
            {installationIntents.map((item) => (
              <button key={item.id} type="button" className={installationIntent === item.id ? "selected" : ""} onClick={() => setInstallationIntent(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="flowPanel resultGate">
          <h3>Para liberar sua estimativa</h3>
          <p>Informe seu nome para continuar.</p>
          <div className="leadForm">
            <label>
              Nome
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" autoComplete="name" />
            </label>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="flowPanel resultGate">
          <h3>Agora, seu WhatsApp</h3>
          <p>Precisamos dele para registrar o lead e permitir o contato da SDR.</p>
          <div className="leadForm">
            <label>
              WhatsApp
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(55) 9968-6302" inputMode="tel" autoComplete="tel" />
            </label>
          </div>
        </div>
      )}

      {step === 8 && isCalculating && (
        <div className="loadingPanel">
          <div className="loadingRing">
            <Zap size={28} />
          </div>
          <h3>Analisando seu cenário</h3>
          <p>Estamos calculando a estimativa com base no consumo, unidade, estrutura e localização informados.</p>
          <div className="loadingSteps">
            <span><CheckCircle2 size={16} /> Leitura da conta</span>
            <span><CheckCircle2 size={16} /> Perfil de consumo</span>
            <span><CheckCircle2 size={16} /> Projeção de economia</span>
          </div>
        </div>
      )}

      {step === 8 && !isCalculating && (
        <div className="flowPanel resultFlow">
          <div>
            <h3>Sua estimativa inicial</h3>
            <p>Esse valor é uma projeção. A análise da fatura deixa o cenário mais preciso.</p>
          </div>

          <div className="resultCards">
            <article>
              <span>Economia estimada</span>
              <strong>{formatMoney(result.monthlySavings)}</strong>
              <small>por mês</small>
            </article>
            <article>
              <span>Economia anual</span>
              <strong>{formatMoney(result.annualSavings)}</strong>
              <small>estimada</small>
            </article>
            <article>
              <span>Nova conta estimada</span>
              <strong>{formatMoney(result.newBill)}</strong>
              <small>após compensação</small>
            </article>
          </div>

          <button type="button" className="primaryButton full" onClick={sendResultToWhatsapp}>
            Receber análise pelo WhatsApp
          </button>
        </div>
      )}

      {error && <div className="formError">{error}</div>}

      <div className="flowActions">
        {step > 1 && step < 8 && (
          <button type="button" className="secondaryButton" onClick={back}>
            Voltar
          </button>
        )}

        {step < 8 && (
          <button type="button" className="primaryButton" onClick={step === 7 ? revealEstimate : next} disabled={isSubmitting}>
            {step === 7 ? (isSubmitting ? "Enviando..." : "Ver minha estimativa") : "Continuar"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}


function EconomySection() {
  return (
    <section id="simulador" className="economySection">
      <div className="pageWidth economyGrid">
        <div className="economyText">
          <SectionLabel>Simule sua economia</SectionLabel>
          <h2>Descubra quanto você pode economizar.</h2>
          <p>Em poucos passos, informe seu consumo e perfil. A estimativa só aparece depois que os dados necessários forem preenchidos.</p>
          <ul className="iconList">
            <li><BadgeCheck size={18} /> Análise clara e objetiva</li>
            <li><BadgeCheck size={18} /> Estimativa inicial de investimento</li>
            <li><BadgeCheck size={18} /> Atendimento regional</li>
          </ul>
        </div>
        <div className="simulatorVisualSlotWrap">
          <ImageSlot src={imageSlots.simulatorVisual} title="Imagem do simulador" brief="Visual complementar do simulador." className="simulatorVisualSlot" />
        </div>
        <div className="flowShell">
          <SimulateFlow />
        </div>
      </div>
    </section>
  );
}
function StepsSection() {
  return (
    <section className="stepsSection">
      <div className="pageWidth">
        <h2 className="centerMiniTitle">Como funciona</h2>

        <div className="stepsScroller" aria-label="Passos do processo">
          <div className="stepsRow">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className="stepCard">
                  <span className="stepNumber">{index + 1}</span>
                  <Icon size={39} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="servicos" className="servicesSection">
      <div className="pageWidth">
        <SectionLabel>Nossos serviços</SectionLabel>

        <div className="serviceGrid">
          {serviceItems.map((service) => {
            const Icon = service.icon;

            return (
              <article key={service.id} className="serviceCard">
                <ImageSlot
                  src={imageSlots[service.id]}
                  title={service.title}
                  brief={service.brief}
                  className="serviceImage"
                >
                  <div className="serviceBadge">
                    <Icon size={23} />
                  </div>
                </ImageSlot>

                <div className="serviceInfo">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustBand() {
  return (
    <section id="vantagens" className="trustBand">
      <div className="pageWidth trustContent">
        <div className="trustText">
          <SectionLabel>Resultados que geram confiança</SectionLabel>

          <div className="trustItems">
            <article>
              <MapPinned size={31} />
              <h3>Atendimento regional</h3>
              <p>Presença em Santa Rosa/RS e região.</p>
            </article>

            <article>
              <UsersRound size={31} />
              <h3>Equipe técnica especializada</h3>
              <p>Engenheiros e técnicos com experiência comprovada.</p>
            </article>

            <article>
              <ClipboardCheck size={31} />
              <h3>Projetos residenciais, comerciais e rurais</h3>
              <p>Soluções personalizadas para diferentes perfis de consumo.</p>
            </article>
          </div>

          <a className="primaryButton wide" href="#simulador">
            <Zap size={16} />
            Simular minha economia
          </a>
        </div>

        <ImageSlot
          src={imageSlots.trustInstaller}
          title="Imagem de confiança em aberto"
          brief="Aqui entra imagem técnica escura com instalador e painéis."
          className="trustImage"
        />
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="aboutSection">
      <div className="pageWidth aboutGrid">
        <div className="aboutText">
          <SectionLabel>Sobre a PROJEM</SectionLabel>
          <h2>Engenharia que transforma energia em resultados.</h2>
          <p>
            A PROJEM é uma empresa de engenharia elétrica especializada em projetos fotovoltaicos, com <strong>mais de 12 anos de mercado</strong> e <strong>mais de 3000 projetos solares</strong>. Atuamos com análise técnica, dimensionamento preciso e soluções para reduzir custos e aumentar a eficiência no uso da energia.
          </p>

          <div className="aboutIcons">
            <span><BadgeCheck size={18} /> Análise técnica</span>
            <span><MapPinned size={18} /> Atendimento próximo</span>
            <span><PanelsTopLeft size={18} /> Projetos bem dimensionados</span>
          </div>
        </div>

        <ImageSlot
          src={imageSlots.aboutInstaller}
          title="Equipe da PROJEM Energia Solar"
          brief="Equipe da PROJEM em Santa Rosa/RS."
          className="aboutImage"
        />
      </div>
    </section>
  );
}

function RegionFaq() {
  return (
    <section id="analises" className="regionFaq">
      <div className="pageWidth regionFaqGrid">
        <div className="regionBox">
          <SectionLabel>Atendimento regional</SectionLabel>
          <h2>Santa Rosa/RS e região</h2>
          <p>Atuamos com atendimento próximo e análise técnica especializada.</p>

          <div className="regionText">
            <MapPin size={19} />
            <span>Santa Rosa/RS, Horizontina, Três de Maio, Santo Ângelo, Panambi e região.</span>
          </div>

          <ImageSlot
            src={imageSlots.map}
            title="Mapa de Santa Rosa"
            brief="Mapa do RS marcando Santa Rosa."
            className="mapSlot"
          />
        </div>

        <div className="faqBox">
          <SectionLabel>Perguntas frequentes</SectionLabel>

          {faqItems.map((item) => (
  <details key={item.question}>
    <summary>
      {item.question}
      <ChevronDown size={17} />
    </summary>
    <p>{item.answer}</p>
  </details>
))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  function trackFooterSimulator() {
    trackEvent("footer_simulator_click", {
      origem_formulario: "footer_cta",
      origem_cta: "footer_simular_agora",
    });
  }

  return (
    <footer id="contato" className="footer">
      <div className="pageWidth footerGrid">
        <div>
          <img className="footerLogoFull" src={logo} alt="PROJEM Engenharia Elétrica" />
          <p>Soluções completas em energia. Projetos com precisão. Resultados reais.</p>

          <div className="socials">
            <a href="https://www.instagram.com/projem.solar/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da PROJEM Solar">
              <InstagramIcon size={18} />
              <span>@projem.solar</span>
            </a>
          </div>
        </div>

        <div>
          <h3>Navegação</h3>
          <a href="#inicio">Início</a>
          <a href="#sobre">Sobre</a>
          <a href="#servicos">Serviços</a>
          <a href="#vantagens">Vantagens</a>
          <a href="#analises">Análises</a>
          <a href="#contato">Contato</a>
        </div>

        <div>
          <h3>Serviços</h3>
          <a href="#servicos">Residencial</a>
          <a href="#servicos">Comercial</a>
          <a href="#servicos">Rural</a>
          <a href="#servicos">Engenharia e Industrial</a>
        </div>

        <div>
          <h3>Contato</h3>
          <a href={buildWhatsappUrl(whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
            <Phone size={15} /> {phoneNumberPrimary}
          </a>
          <span><Mail size={15} /> contato@projem.com.br</span>
          <a href={mapsLocationUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={15} /> Projem energia solar - Santa Rosa RS - R. Guaporé 401
          </a>
        </div>

        <div className="footerCta">
          <h3>Simule sua economia sem compromisso.</h3>
          <a className="primaryButton" href="#simulador" onClick={trackFooterSimulator}>
            <Zap size={16} />
            Simular agora
          </a>
        </div>
      </div>

      <div className="pageWidth footerBottom">
        <span>© 2025 PROJEM Energia. Todos os direitos reservados.</span>
        <span>Política de Privacidade · Termos de Uso</span>
      </div>
    </footer>
  );
}


const CHATBOT_RESPONSE_DELAY = 720;

const chatbotInitialMessages = [
  { from: "bot", text: "Oi! Sou o assistente virtual da Projem." },
  { from: "bot", text: "Posso fazer algumas perguntas rápidas para entender seu projeto e encaminhar você para a pessoa certa?" },
];

const chatbotQuestions = [
  {
    id: "intencao_compra",
    text: "Pra eu te encaminhar certo: o que você está buscando hoje?",
    options: [
      { value: "orcamento", label: "Quero um orçamento" },
      { value: "comparar", label: "Já tenho proposta e quero comparar" },
      { value: "economia", label: "Quero entender quanto posso economizar" },
      { value: "pesquisa", label: "Só estou pesquisando por enquanto" },
    ],
  },
  {
    id: "faixa_conta",
    text: "Hoje, em média, quanto vem sua conta de energia?",
    options: [
      { value: "ate_300", label: "Até R$ 300" },
      { value: "300_600", label: "R$ 300 a R$ 600" },
      { value: "600_1000", label: "R$ 600 a R$ 1.000" },
      { value: "acima_1000", label: "Acima de R$ 1.000" },
    ],
  },
  {
    id: "tipo_imovel",
    text: "E esse consumo é de qual tipo de imóvel?",
    options: [
      { value: "Residencial", label: "Residencial" },
      { value: "Comercial", label: "Comercial" },
      { value: "Rural", label: "Rural" },
      { value: "Industrial", label: "Industrial" },
    ],
  },
  {
    id: "prazo_instalacao",
    text: "Se a proposta fizer sentido, quando você pretende instalar?",
    options: [
      { value: "ate_30_dias", label: "Nos próximos 30 dias" },
      { value: "1_3_meses", label: "Entre 1 e 3 meses" },
      { value: "3_6_meses", label: "Entre 3 e 6 meses" },
      { value: "sem_prazo", label: "Ainda sem prazo definido" },
    ],
  },
  {
    id: "cidade",
    text: "Qual é a sua cidade?",
    input: "text",
    placeholder: "Ex.: Santa Rosa",
  },
  {
    id: "contato",
    text: "Última etapa: como posso te identificar e chamar no WhatsApp?",
    input: "contact",
  },
];

function calculateChatbotLeadScore(answers = {}) {
  let score = 0;

  if (["orcamento", "comparar"].includes(answers.intencao_compra)) score += 4;
  else if (answers.intencao_compra === "economia") score += 2;

  if (["600_1000", "acima_1000"].includes(answers.faixa_conta)) score += 2;
  else if (answers.faixa_conta === "300_600") score += 1;

  if (answers.prazo_instalacao === "ate_30_dias") score += 3;
  else if (answers.prazo_instalacao === "1_3_meses") score += 2;
  else if (answers.prazo_instalacao === "3_6_meses") score += 1;

  if (["Comercial", "Rural", "Industrial"].includes(answers.tipo_imovel)) score += 1;

  const nivel = score >= 7 ? "Quente" : score >= 4 ? "Morno" : "Nutrição";
  const prioridade = score >= 7 ? "Alta" : score >= 4 ? "Média" : "Baixa";

  return { score, nivel, prioridade };
}

function FloatingWhatsappButton() {
  const [showBubble, setShowBubble] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState(chatbotInitialMessages);
  const [typing, setTyping] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitingHuman, setWaitingHuman] = useState(false);
  const [finished, setFinished] = useState(false);
  const [makeFailed, setMakeFailed] = useState(false);
  const chatStartRef = useRef(Date.now());
  const pageStartRef = useRef(Date.now());
  const scrollRef = useRef(null);

  const currentQuestion = chatbotQuestions[questionIndex];

  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, isOpen, waitingHuman]);

  function openChat() {
    setIsOpen(true);
    setShowBubble(false);
    trackEvent("chatbot_open", {
      origem_formulario: "chatbot_whatsapp",
      origem_cta: "whatsapp_flutuante",
    });

    if (!hasStarted) {
      chatStartRef.current = Date.now();
      setHasStarted(true);
      setTyping(true);
      window.setTimeout(() => {
        appendMessage("bot", chatbotQuestions[0].text);
        setTyping(false);
      }, CHATBOT_RESPONSE_DELAY);
    }
  }

  function closeChat() {
    setIsOpen(false);
  }

  function appendMessage(from, text) {
    setMessages((current) => [...current, { from, text }]);
  }

  function restartConversation() {
    setQuestionIndex(0);
    setAnswers({});
    setMessages(chatbotInitialMessages);
    setTextValue("");
    setNameValue("");
    setPhoneValue("");
    setError("");
    setSubmitting(false);
    setWaitingHuman(false);
    setFinished(false);
    setMakeFailed(false);
    setTyping(true);
    chatStartRef.current = Date.now();

    trackEvent("chatbot_restart", {
      origem_formulario: "chatbot_whatsapp",
    });

    window.setTimeout(() => {
      appendMessage("bot", chatbotQuestions[0].text);
      setTyping(false);
    }, CHATBOT_RESPONSE_DELAY);
  }

  function advanceQuestion(answerKey, answerLabel) {
    if (!currentQuestion || typing || submitting || waitingHuman) return;

    appendMessage("user", answerLabel);
    const nextAnswers = { ...answers, [currentQuestion.id]: answerKey };
    setAnswers(nextAnswers);
    setError("");
    setTyping(true);

    const nextIndex = questionIndex + 1;
    window.setTimeout(() => {
      if (nextIndex < chatbotQuestions.length) {
        setQuestionIndex(nextIndex);
        appendMessage("bot", chatbotQuestions[nextIndex].text);
      }
      setTyping(false);
    }, CHATBOT_RESPONSE_DELAY);
  }

  function submitTextAnswer(event) {
    event.preventDefault();
    const value = textValue.trim();
    if (!value) {
      setError("Digite sua cidade para continuar.");
      return;
    }
    setTextValue("");
    advanceQuestion(value, value);
  }

  async function submitContact(event) {
    event.preventDefault();
    const nome = nameValue.trim();
    const telefone = cleanNumber(phoneValue);

    if (nome.length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (!phoneIsValid(telefone)) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }

    const finalAnswers = {
      ...answers,
      contato: { nome, telefone },
    };
    setAnswers(finalAnswers);
    appendMessage("user", `${nome} · ${phoneValue}`);
    setError("");
    setSubmitting(true);
    setTyping(true);

    const qualification = calculateChatbotLeadScore(finalAnswers);
    const base = buildBasePayload("chatbot_whatsapp");
    const intentLabels = {
      orcamento: "Quero um orçamento",
      comparar: "Já tenho proposta e quero comparar",
      economia: "Quero entender quanto posso economizar",
      pesquisa: "Só estou pesquisando",
    };
    const billLabels = {
      ate_300: "Até R$ 300",
      "300_600": "R$ 300 a R$ 600",
      "600_1000": "R$ 600 a R$ 1.000",
      acima_1000: "Acima de R$ 1.000",
    };
    const deadlineLabels = {
      ate_30_dias: "Nos próximos 30 dias",
      "1_3_meses": "Entre 1 e 3 meses",
      "3_6_meses": "Entre 3 e 6 meses",
      sem_prazo: "Ainda sem prazo definido",
    };

    const payload = {
      ...base,
      nome,
      telefone,
      whatsapp: telefone,
      cidade: finalAnswers.cidade || "",
      cidade_digitada: finalAnswers.cidade || "",
      tipo_imovel: finalAnswers.tipo_imovel || "",
      segmento: finalAnswers.tipo_imovel || "",
      intencao_compra: finalAnswers.intencao_compra || "",
      intencao_compra_label: intentLabels[finalAnswers.intencao_compra] || "",
      faixa_conta: finalAnswers.faixa_conta || "",
      faixa_conta_label: billLabels[finalAnswers.faixa_conta] || "",
      prazo_instalacao: finalAnswers.prazo_instalacao || "",
      prazo_instalacao_label: deadlineLabels[finalAnswers.prazo_instalacao] || "",
      ja_fez_orcamento: finalAnswers.intencao_compra === "comparar" ? "Sim" : "Não informado",
      lead_score: qualification.score,
      nivel_intencao: qualification.nivel,
      prioridade_comercial: qualification.prioridade,
      qualified_lead: qualification.score >= 4 ? "Sim" : "Não",
      status_lead: "Aguardando atendimento humano",
      canal_origem: "chatbot_site",
      canal_preferido: "WhatsApp",
      chatbot_nome: "Assistente Projem",
      chatbot_versao: "1.0",
      tempo_chat_segundos: Math.max(1, Math.round((Date.now() - chatStartRef.current) / 1000)),
      tempo_pagina_segundos: Math.max(1, Math.round((Date.now() - pageStartRef.current) / 1000)),
      respostas_chatbot: JSON.stringify({
        intencao_compra: finalAnswers.intencao_compra || "",
        faixa_conta: finalAnswers.faixa_conta || "",
        tipo_imovel: finalAnswers.tipo_imovel || "",
        prazo_instalacao: finalAnswers.prazo_instalacao || "",
        cidade: finalAnswers.cidade || "",
      }),
    };

    try {
      const { makeResponse } = await registerLeadSubmission(payload);
      await new Promise((resolve) => window.setTimeout(resolve, CHATBOT_RESPONSE_DELAY));
      setTyping(false);
      setSubmitting(false);

      if (!makeResponse.ok) {
        setMakeFailed(true);
        setFinished(true);
        appendMessage("bot", "Tive um problema para registrar seus dados automaticamente. Você pode continuar direto no WhatsApp e eu já deixei a mensagem pronta.");
        return;
      }

      appendMessage("bot", `Perfeito, ${nome.split(" ")[0]}. Já organizei suas respostas e estou encaminhando seu pedido para a equipe comercial.`);
      setWaitingHuman(true);

      window.setTimeout(() => {
        setWaitingHuman(false);
        setFinished(true);
        appendMessage("bot", "Pronto. Sua solicitação foi recebida. O atendimento humano continua pelo WhatsApp que você informou.");
        trackEvent("chatbot_handoff_ready", {
          origem_formulario: "chatbot_whatsapp",
          lead_id: payload.lead_id,
          event_id: payload.event_id,
          lead_score: qualification.score,
          nivel_intencao: qualification.nivel,
        });
      }, 8000);
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, CHATBOT_RESPONSE_DELAY));
      setTyping(false);
      setSubmitting(false);
      setMakeFailed(true);
      setFinished(true);
      appendMessage("bot", "Não consegui concluir o envio automático. Use o botão abaixo para falar com a equipe pelo WhatsApp.");
    }
  }

  const whatsappFollowupMessage = useMemo(() => {
    const qualification = calculateChatbotLeadScore(answers);
    const nome = answers.contato?.nome || nameValue || "";
    const cidade = answers.cidade || "";
    return [
      "Olá, vim pelo chatbot do site da Projem.",
      nome ? `Nome: ${nome}` : "",
      cidade ? `Cidade: ${cidade}` : "",
      answers.tipo_imovel ? `Imóvel: ${answers.tipo_imovel}` : "",
      answers.prazo_instalacao ? `Prazo: ${answers.prazo_instalacao}` : "",
      `Classificação do pré-atendimento: ${qualification.nivel}`,
    ].filter(Boolean).join("\n");
  }, [answers, nameValue]);

  return (
    <div className="floatingWhatsapp" aria-label="Pré-atendimento da Projem">
      {showBubble && !isOpen && (
        <div className="floatingWhatsappBubble chatbotPromptBubble">
          <button type="button" onClick={() => setShowBubble(false)} aria-label="Fechar aviso">
            <X size={13} />
          </button>
          <div className="chatbotPromptAvatar">
            <img src={chatbotAvatarImg} alt="Atendente virtual da Projem" />
            <span className="chatbotOnlineDot" />
          </div>
          <span><strong>Oi!</strong> Posso analisar seu caso em 1 minuto?</span>
        </div>
      )}

      {isOpen && (
        <section className="chatbotWindow" aria-label="Chat de pré-atendimento">
          <header className="chatbotHeader">
            <div className="chatbotHeaderIdentity">
              <div className="chatbotHeaderAvatar">
                <img src={chatbotAvatarImg} alt="Assistente virtual da Projem" />
                <span className="chatbotOnlineDot" />
              </div>
              <div>
                <strong>Projem · Atendimento</strong>
                <span>Assistente virtual</span>
              </div>
            </div>
            <button type="button" onClick={closeChat} aria-label="Fechar chat"><X size={18} /></button>
          </header>

          <div className="chatbotMessages" ref={scrollRef}>
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`chatMessage ${message.from}`}>
                {message.from === "bot" && (
                  <img className="chatMessageAvatar" src={chatbotAvatarImg} alt="" />
                )}
                <div>{message.text}</div>
              </div>
            ))}

            {typing && (
              <div className="chatMessage bot">
                <img className="chatMessageAvatar" src={chatbotAvatarImg} alt="" />
                <div className="typingDots" aria-label="Digitando"><span /><span /><span /></div>
              </div>
            )}

            {waitingHuman && (
              <div className="chatbotHandoffStatus">
                <span className="chatbotHandoffSpinner" />
                <div>
                  <strong>Encaminhando para a equipe...</strong>
                  <small>Estou organizando seu atendimento.</small>
                </div>
              </div>
            )}
          </div>

          {!finished && !submitting && !waitingHuman && !typing && currentQuestion && (
            <div className="chatbotComposer">
              {currentQuestion.options && (
                <div className="chatbotOptions">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => advanceQuestion(option.value, option.label)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.input === "text" && (
                <form className="chatbotTextForm" onSubmit={submitTextAnswer}>
                  <input
                    value={textValue}
                    onChange={(event) => setTextValue(event.target.value)}
                    placeholder={currentQuestion.placeholder}
                    autoComplete="address-level2"
                  />
                  <button type="submit" aria-label="Enviar resposta"><ArrowRight size={18} /></button>
                </form>
              )}

              {currentQuestion.input === "contact" && (
                <form className="chatbotContactForm" onSubmit={submitContact}>
                  <input
                    value={nameValue}
                    onChange={(event) => setNameValue(event.target.value)}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                  <input
                    value={phoneValue}
                    onChange={(event) => setPhoneValue(event.target.value)}
                    placeholder="WhatsApp com DDD"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  <button type="submit">Enviar e solicitar atendimento <ArrowRight size={16} /></button>
                </form>
              )}

              {error && <p className="chatbotError">{error}</p>}
              <small className="chatbotPrivacy">Seus dados são usados apenas para este atendimento.</small>
            </div>
          )}

          {finished && (
            <div className="chatbotFinished">
              <div className="chatbotFinishedActions">
                <a
                  href={buildWhatsappUrl(whatsappFollowupMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("chatbot_whatsapp_fallback", { origem_formulario: "chatbot_whatsapp", make_failed: makeFailed ? "Sim" : "Não" })}
                >
                  <MessageCircle size={17} />
                  {makeFailed ? "Continuar pelo WhatsApp" : "Abrir WhatsApp"}
                </a>
                <button type="button" className="chatbotRestartButton" onClick={restartConversation}>
                  <RotateCcw size={16} />
                  Voltar ao início
                </button>
              </div>
              <small>{makeFailed ? "Use o WhatsApp se preferir continuar por lá." : "A equipe responderá pelo número informado."}</small>
            </div>
          )}
        </section>
      )}

      <button
        className={`floatingWhatsappButton ${isOpen ? "chatOpen" : ""}`}
        type="button"
        aria-label={isOpen ? "Fechar pré-atendimento" : "Abrir pré-atendimento"}
        onClick={isOpen ? closeChat : openChat}
      >
        {!isOpen && <span className="chatbotNotificationBadge">1</span>}
        {isOpen ? <X size={28} /> : <MessageCircle size={31} />}
      </button>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    collectAttribution();
    initGa();
    trackEvent("page_view_landing", {
      origem_formulario: "page_view",
    });
  }, []);

  return (
    <main>
      <Header />
      <Hero />
      <ProofBar />
      <EconomySection />
      <StepsSection />
      <Services />
      <TrustBand />
      <About />
      <RegionFaq />
      <Footer />
      <FloatingWhatsappButton />
    </main>
  );
}
