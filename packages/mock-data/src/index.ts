export type Tone = "default" | "primary" | "danger" | "positive" | "warning" | "failed" | "info" | "dark";

export type Merchant = {
  name: string;
  id: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
};

export const merchantOptions: Merchant[] = [
  {
    name: "Relô Consultoria Ltda.",
    id: "772614",
    user: {
      name: "Rodrigo Oliveira",
      role: "Administrador",
      email: "rodrigo.oliveira@relo.com.br"
    }
  },
  {
    name: "Acme Corp Ltd.",
    id: "489201",
    user: {
      name: "Rodrigo Oliveira",
      role: "Operações",
      email: "rodrigo.oliveira@acmecorp.com"
    }
  },

];

export type Metric = {
  title: string;
  value: string;
  delta?: string;
  variant: Tone;
  icon: string;
};

export type Transaction = {
  id: string;
  date: string;
  customer: string;
  method: string;
  brand: "pix" | "visa" | "mastercard";
  cardLast4?: string;
  value: string;
  status: string;
  statusVariant: Tone;
  risk: string;
  riskVariant: Tone;
};

export type Settlement = {
  date: string;
  description: string;
  amount: string;
  status: string;
};

export type ChartPoint = {
  label: string;
  approved: number;
  rejected: number;
};

export type ReceivableScenario = {
  seed: number;
  summary: Metric[];
  agenda: Array<{ label: string; value: string; variant: string }>;
  settlements: Settlement[];
  liquidationChart: ChartPoint[];
  transactionChart: ChartPoint[];
  balance: {
    available: string;
    pending: string;
    riskReserve: string;
  };
};

export type PortalSnapshot = {
  merchant: Merchant;
  dashboard: {
    metrics: Metric[];
    agenda: ReceivableScenario["agenda"];
    latestTransactions: Array<{ customer: string; method: string; value: string; status: string }>;
    chart: ChartPoint[];
    alerts: Array<{ title: string; description: string; time: string; variant: Tone }>;
  };
  transactions: Transaction[];
  receivables: {
    summary: Metric[];
    settlements: Settlement[];
    chart: ChartPoint[];
    balance: ReceivableScenario["balance"];
  };
  integrations: {
    health: Metric[];
    logs: Array<{ id: string; event: string; endpoint: string; status: string; statusVariant: Tone }>;
  };
  users: Array<{ name: string; role: string; status: string; lastAccess: string }>;
  reports: {
    templates: Array<{ title: string; copy: string; selected?: boolean }>;
    history: Array<{ report: string; id: string; period: string; generated: string; status: string; variant: Tone }>;
  };
  settings: {
    profile: {
      name: string;
      email: string;
      role: string;
      phone: string;
    };
    preferences: {
      language: string;
      timezone: string;
      currency: string;
    };
  };
};

export const merchant: Merchant = merchantOptions[0];

function createRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function currency(value: number, decimals = 2) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

function compactCurrency(value: number) {
  return currency(value, 0);
}

function between(random: () => number, min: number, max: number) {
  return Math.round(min + random() * (max - min));
}

function percent(random: () => number, min: number, max: number) {
  return `${(min + random() * (max - min)).toFixed(1)}%`;
}

function makeChart(random: () => number, base: number): ChartPoint[] {
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return labels.map((label, index) => {
    const pulse = Math.sin((index + random()) * 1.18) * 0.22 + 1;
    const approved = Math.round(base * pulse + between(random, 110, 920));
    const rejected = Math.round(approved * (0.05 + random() * 0.09));

    return { label, approved, rejected };
  });
}

export function generateReceivables(seed = Date.now()): ReceivableScenario {
  const random = createRandom(seed);
  const today = between(random, 94000, 168000);
  const tomorrow = between(random, 76000, 142000);
  const restOfWeek = between(random, 188000, 292000);
  const nextSeven = today + tomorrow + restOfWeek;
  const riskReserve = between(random, 12800, 28900);
  const disputes = between(random, 5, 14);
  const available = between(random, 390000, 520000);
  const liquidationChart = makeChart(random, Math.round(nextSeven / 34));
  const transactionChart = makeChart(random, between(random, 1520, 2420));

  return {
    seed,
    summary: [
      { title: "A liquidar hoje", value: compactCurrency(today), delta: `${between(random, 24, 38)} lotes`, variant: "positive", icon: "D0" },
      { title: "Próximos 7 dias", value: compactCurrency(nextSeven), delta: percent(random, 5.4, 9.8), variant: "default", icon: "7D" },
      { title: "Em disputa", value: compactCurrency(disputes * between(random, 980, 1820)), delta: `${disputes} casos`, variant: "danger", icon: "ED" }
    ],
    agenda: [
      { label: "D+0 (Hoje)", value: currency(today), variant: "settlement" },
      { label: "D+1 (Amanhã)", value: currency(tomorrow), variant: "default" },
      { label: "Próximos 7 dias", value: currency(nextSeven), variant: "muted" }
    ],
    settlements: [
      { date: "Hoje, 18:00", description: "Lote cartões crédito", amount: currency(today * 0.66), status: "Agendado" },
      { date: "Amanhã, 10:00", description: "PIX e cartão débito", amount: currency(tomorrow), status: "Em processamento" },
      { date: "27/08/2024", description: "Ajustes e antecipações", amount: currency(restOfWeek), status: "Previsto" }
    ],
    liquidationChart,
    transactionChart,
    balance: {
      available: currency(available),
      pending: currency(nextSeven + today + tomorrow),
      riskReserve: currency(riskReserve)
    }
  };
}

export function createPortalSnapshot(seed = 489201): PortalSnapshot {
  const receivableScenario = generateReceivables(seed);

  return {
    merchant,
    dashboard: {
      metrics: [
        { title: "Volume Total (GMV)", value: "R$ 1.245.890", delta: "12.5%", variant: "default", icon: "V" },
        { title: "Transações", value: "14.592", delta: "8.2%", variant: "default", icon: "T" },
        { title: "Taxa de Aprovação", value: "92.4%", delta: "0.0%", variant: "positive", icon: "A" },
        { title: "Taxa de Chargeback", value: "0.8%", delta: "0.2%", variant: "danger", icon: "C" },
        { title: "Saldo Disponível", value: "R$ 450.200", variant: "dark", icon: "S" }
      ],
      agenda: receivableScenario.agenda,
      latestTransactions: [
        { customer: "João Silva", method: "Cartão de Crédito - 14:32", value: "R$ 450,00", status: "approved" },
        { customer: "Maria Oliveira", method: "PIX - 14:15", value: "R$ 1.200,00", status: "approved" },
        { customer: "Carlos Santos", method: "Cartão de Crédito - 13:45", value: "R$ 89,90", status: "failed" }
      ],
      chart: receivableScenario.transactionChart,
      alerts: [
        {
          title: "Pico de transações recusadas",
          description: "Identificamos aumento de 15% nas recusas pelo emissor na última hora.",
          time: "Há 15 minutos",
          variant: "warning"
        }
      ]
    },
    transactions: [
      { id: "#TRX-8921", date: "24/08/2024 14:32", customer: "João Silva", method: "Cartão 4242", brand: "mastercard", cardLast4: "4242", value: "R$ 450,00", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" },
      { id: "#TRX-8920", date: "24/08/2024 14:15", customer: "Maria Oliveira", method: "PIX", brand: "pix", value: "R$ 1.200,00", status: "Pendente", statusVariant: "warning", risk: "-", riskVariant: "info" },
      { id: "#TRX-8919", date: "24/08/2024 13:45", customer: "Carlos Santos", method: "VISA 1892", brand: "visa", cardLast4: "1892", value: "R$ 89,90", status: "Falha", statusVariant: "failed", risk: "Alto Risco", riskVariant: "failed" },
      { id: "#TRX-8918", date: "24/08/2024 11:20", customer: "Ana Lima", method: "Cartão 5521", brand: "mastercard", cardLast4: "5521", value: "R$ 3.500,00", status: "Sucesso", statusVariant: "positive", risk: "Médio Risco", riskVariant: "warning" },
      { id: "#TRX-8917", date: "24/08/2024 10:48", customer: "Bruno Rocha", method: "PIX", brand: "pix", value: "R$ 980,40", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" },
      { id: "#TRX-8916", date: "24/08/2024 10:12", customer: "Bianca Nunes", method: "VISA 7781", brand: "visa", cardLast4: "7781", value: "R$ 2.140,00", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" },
      { id: "#TRX-8915", date: "24/08/2024 09:56", customer: "Diego Martins", method: "Cartão 2014", brand: "mastercard", cardLast4: "2014", value: "R$ 719,90", status: "Pendente", statusVariant: "warning", risk: "Médio Risco", riskVariant: "warning" },
      { id: "#TRX-8914", date: "24/08/2024 09:31", customer: "Elaine Ribeiro", method: "PIX", brand: "pix", value: "R$ 64,50", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" },
      { id: "#TRX-8913", date: "24/08/2024 09:05", customer: "Felipe Costa", method: "VISA 3309", brand: "visa", cardLast4: "3309", value: "R$ 1.849,00", status: "Falha", statusVariant: "failed", risk: "Alto Risco", riskVariant: "failed" },
      { id: "#TRX-8912", date: "23/08/2024 18:42", customer: "Gabriela Souza", method: "Cartão 9090", brand: "mastercard", cardLast4: "9090", value: "R$ 310,75", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" },
      { id: "#TRX-8911", date: "23/08/2024 17:28", customer: "Henrique Alves", method: "PIX", brand: "pix", value: "R$ 5.420,00", status: "Pendente", statusVariant: "warning", risk: "-", riskVariant: "info" },
      { id: "#TRX-8910", date: "23/08/2024 16:03", customer: "Isabela Pereira", method: "VISA 4412", brand: "visa", cardLast4: "4412", value: "R$ 245,90", status: "Sucesso", statusVariant: "positive", risk: "Baixo Risco", riskVariant: "positive" }
    ],
    receivables: {
      summary: receivableScenario.summary,
      settlements: receivableScenario.settlements,
      chart: receivableScenario.liquidationChart,
      balance: receivableScenario.balance
    },
    integrations: {
      health: [
        { title: "API Payments", value: "99.98%", delta: "latência 118ms", variant: "positive", icon: "API" },
        { title: "Webhooks", value: "1.248", delta: "12 falhas", variant: "danger", icon: "WH" },
        { title: "Chaves ativas", value: "6", delta: "2 produção", variant: "default", icon: "KEY" }
      ],
      logs: [
        { id: "WH-7842", event: "payment.approved", endpoint: "/merchant/webhooks/payments", status: "Entregue", statusVariant: "positive" },
        { id: "WH-7841", event: "refund.created", endpoint: "/merchant/webhooks/refunds", status: "Retry", statusVariant: "warning" },
        { id: "WH-7839", event: "chargeback.opened", endpoint: "/merchant/webhooks/disputes", status: "Falha", statusVariant: "failed" }
      ]
    },
    users: [
      { name: "Rodrigo Oliveira", role: "Administrador", status: "Ativo", lastAccess: "Hoje, 09:42" },
      { name: "Heloísa Paolloze ", role: "Operação", status: "Ativo", lastAccess: "Ontem, 18:11" },
      { name: "Julia Aiko", role: "Auditoria", status: "Pendente", lastAccess: "Convite enviado" },
      { name: "Gabrielly Reis", role: "Suporte", status: "Bloqueado", lastAccess: "05/08/2024" }
    ],
    reports: {
      templates: [
        { title: "Transações Detalhadas", copy: "Status, taxas, adquirente e metadados por transação.", selected: true },
        { title: "Recebíveis (Liquidações)", copy: "Valores liquidados, previstos e ajustes em conta corrente." },
        { title: "Chargebacks & Disputas", copy: "Contestações, motivos de chargeback e resolução." },
        { title: "Conciliação Financeira", copy: "Arquivo para ERP com vendas processadas vs. liquidadas." }
      ],
      history: [
        { report: "Transações Detalhadas", id: "REP-09482", period: "01/05/2024 - 15/05/2024", generated: "Hoje, 10:30", status: "Concluído", variant: "positive" },
        { report: "Recebíveis", id: "REP-09481", period: "01/05/2024 - 31/05/2024", generated: "Ontem, 18:00", status: "Concluído", variant: "positive" },
        { report: "Conciliação Financeira", id: "REP-09480", period: "01/04/2024 - 30/04/2024", generated: "10/05/2024, 02:15", status: "Falha Parcial", variant: "warning" }
      ]
    },
    settings: {
      profile: {
        name: "Rodrigo Oliveira",
        email: "rodrigo.oliveira@acmecorp.com",
        role: "Administrador Financeiro",
        phone: "+55 (11) 99999-9999"
      },
      preferences: {
        language: "Português (BR)",
        timezone: "(GMT-03:00) Brasília",
        currency: "BRL - Real Brasileiro (R$)"
      }
    }
  };
}

export const portalSnapshot = createPortalSnapshot();
export const dashboard = portalSnapshot.dashboard;
export const transactions = portalSnapshot.transactions;
export const receivables = portalSnapshot.receivables;
export const integrations = portalSnapshot.integrations;
export const users = portalSnapshot.users;
export const reports = portalSnapshot.reports;
export const settings = portalSnapshot.settings;
