import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createPortalSnapshot,
  generateReceivables,
  merchantOptions,
  type Merchant,
  type PortalSnapshot,
  type ReceivableScenario
} from "@mp/mock-data";

export type Locale = "pt-BR" | "en" | "es";
export type Theme = "light" | "dark";

export type AccessibilitySettings = {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusMode: boolean;
  textAlerts: boolean;
};

export type Toast = {
  id: number;
  title: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger";
};

export type PortalState = PortalSnapshot & {
  merchantOptions: Merchant[];
  locale: Locale;
  theme: Theme;
  accessibility: AccessibilitySettings;
  hydratedFromBff: boolean;
  busyAction: string | null;
  toast: Toast | null;
  lastUpdated: string;
};

type ActionOptions = {
  description?: string;
  tone?: Toast["tone"];
};

type PortalActions = {
  setLocale: (locale: Locale) => void;
  selectMerchant: (merchantId: string) => void;
  toggleTheme: () => void;
  toggleAccessibility: (key: keyof AccessibilitySettings) => void;
  runAction: (label: string, options?: ActionOptions) => void;
  randomizeReceivables: () => Promise<void>;
  selectReportTemplate: (title: string) => void;
  dismissToast: () => void;
  track: (event: string, payload?: Record<string, unknown>) => void;
};

type PortalContextValue = {
  state: PortalState;
  actions: PortalActions;
  t: (key: string) => string;
};

const defaultAccessibility: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  focusMode: false,
  textAlerts: false
};

const pt = {
  "shell.principal": "Principal",
  "shell.system": "Sistema",
  "shell.search": "Buscar transações, clientes...",
  "shell.collapse": "Recolher Menu",
  "shell.notifications": "Notificações",
  "shell.notificationTitle": "Notificação",
  "shell.theme": "Tema",
  "shell.dark": "Modo escuro",
  "shell.light": "Modo claro",
  "shell.accessibility": "Acessibilidade",
  "shell.reducedMotion": "Reduzir movimento",
  "shell.highContrast": "Alto contraste",
  "shell.largeText": "Texto maior",
  "shell.focusMode": "Foco simplificado",
  "shell.textAlerts": "Alertas textuais",
  "shell.company": "Selecionar empresa",
  "shell.profile": "Menu do perfil",
  "shell.settings": "Configurações",
  "shell.logout": "Sair da sessão",
  "shell.close": "Fechar",
  "common.today": "Hoje",
  "common.export": "Exportar",
  "common.viewAll": "Ver todos",
  "common.randomize": "Simular recebíveis",
  "common.selected": "Selecionado",
  "common.active": "Ativa",
  "common.edit": "Editar",
  "common.yes": "Sim",
  "common.no": "Não",
  "dashboard.title": "Visão Geral",
  "dashboard.subtitle": "Acompanhe os principais indicadores da sua operação hoje.",
  "dashboard.volume": "Volume de Transações",
  "dashboard.volumeSubtitle": "Acompanhamento diário dos últimos 7 dias",
  "dashboard.alerts": "Alertas do Sistema",
  "dashboard.quickTransactions": "Ver Transações",
  "dashboard.quickApi": "Criar API Key",
  "dashboard.receivablesAgenda": "Agenda de Recebíveis",
  "dashboard.nextSettlements": "Liquidações próximas",
  "dashboard.advanceReceivables": "Antecipar Recebíveis",
  "dashboard.latestTransactions": "Últimas Transações",
  "dashboard.dragHelp": "Arraste os cards para reorganizar sua visão.",
  "dashboard.metric.gmv": "Volume Total (GMV)",
  "dashboard.metric.transactions": "Transações",
  "dashboard.metric.approval": "Taxa de Aprovação",
  "dashboard.metric.chargeback": "Taxa de Chargeback",
  "dashboard.metric.balance": "Saldo Disponível",
  "dashboard.agenda.today": "D+0 (Hoje)",
  "dashboard.agenda.tomorrow": "D+1 (Amanhã)",
  "dashboard.agenda.next7": "Próximos 7 dias",
  "dashboard.alert.declinesTitle": "Pico de transações recusadas",
  "dashboard.alert.declinesCopy": "Identificamos aumento de 15% nas recusas pelo emissor na última hora.",
  "dashboard.alert.declinesTime": "Há 15 minutos",
  "operations.title": "Transações",
  "operations.subtitle": "Gerencie e monitore todas as transações da sua operação.",
  "operations.details": "Detalhes da Transação",
  "operations.action.details": "Detalhes",
  "operations.exportCsv": "Exportar CSV",
  "operations.volumeToday": "Volume Hoje",
  "operations.approved": "Aprovadas",
  "operations.averageTicket": "Ticket Médio",
  "operations.filters.last7": "Últimos 7 dias",
  "operations.filters.status": "Status",
  "operations.filters.method": "Método",
  "operations.filters.channel": "Canal",
  "operations.filters.more": "Mais filtros",
  "operations.columns.id": "ID",
  "operations.columns.date": "Data/Hora",
  "operations.columns.customer": "Cliente",
  "operations.columns.method": "Método",
  "operations.columns.value": "Valor",
  "operations.columns.status": "Status",
  "operations.columns.risk": "Antifraude",
  "operations.columns.actions": "Ações",
  "operations.details.empty": "Clique em ... em uma transação para abrir o drilldown lateral.",
  "operations.detail.status": "Status",
  "operations.detail.customer": "Cliente",
  "operations.detail.document": "Documento",
  "operations.detail.email": "E-mail",
  "operations.detail.method": "Método",
  "operations.detail.final": "Final",
  "operations.detail.risk": "Antifraude",
  "operations.receipt": "Baixar Recibo",
  "operations.refund": "Reembolsar",
  "operations.timeline.captured": "Pagamento capturado",
  "operations.timeline.capturedCopy": "Adquirente confirmou a captura.",
  "operations.timeline.fraudApproved": "Análise antifraude aprovada",
  "operations.timeline.fraudCopy": "Risco avaliado como baixo.",
  "operations.timeline.created": "Transação criada",
  "operations.timeline.createdCopy": "Checkout iniciado pelo cliente.",
  "finance.title": "Recebíveis",
  "finance.subtitle": "Controle liquidações, antecipações e conciliação financeira.",
  "finance.currentMonth": "Mês atual",
  "finance.flow": "Fluxo de Liquidação",
  "finance.flowSubtitle": "Previsão diária de recebíveis",
  "finance.summary": "Resumo Financeiro",
  "finance.reconciliation": "Conciliação",
  "finance.openReconciliation": "Abrir conciliação",
  "finance.columns.date": "Data",
  "finance.columns.description": "Descrição",
  "finance.columns.value": "Valor",
  "finance.columns.status": "Status",
  "finance.available": "Disponível",
  "finance.pending": "A liquidar",
  "finance.riskReserve": "Retenção de risco",
  "finance.reconciliationCopy": "3 divergências aguardam conferência do time financeiro.",
  "integrations.title": "API Keys & Webhooks",
  "integrations.subtitle": "Monitore integrações técnicas, entregas e alertas operacionais.",
  "integrations.docs": "Documentação",
  "integrations.newKey": "Nova API Key",
  "integrations.columns.event": "Evento",
  "integrations.columns.endpoint": "Endpoint",
  "integrations.columns.action": "Ação",
  "integrations.viewPayload": "Ver payload",
  "integrations.reprocess": "Reprocessar",
  "integrations.productionKeys": "Chaves de Produção",
  "integrations.retryPolicy": "Política de retry",
  "integrations.retryPolicyCopy": "5 tentativas com backoff exponencial e dead-letter para falhas persistentes.",
  "admin.title": "Gestão de Usuários",
  "admin.subtitle": "Administre acessos, papéis e aprovações de alto risco.",
  "admin.exportAccess": "Exportar acessos",
  "admin.inviteUser": "Convidar usuário",
  "admin.columns.user": "Usuário",
  "admin.columns.role": "Papel",
  "admin.columns.lastAccess": "Último acesso",
  "admin.permissionsMatrix": "Matriz de permissões",
  "admin.pendingApprovals": "Aprovações pendentes",
  "admin.pendingApprovalsCopy": "Conceder refunds.create para Marina exige aprovação dupla.",
  "admin.guardrail": "Guardrail",
  "admin.guardrailCopy": "Permissões financeiras exigem justificativa, aprovação dupla e trilha de auditoria.",
  "reports.title": "Central de Relatórios",
  "reports.subtitle": "Gere, agende e baixe relatórios detalhados da sua operação financeira.",
  "reports.schedules": "Ver Agendamentos",
  "reports.models": "Modelos de Relatório",
  "reports.history": "Histórico de Execuções",
  "reports.config": "Configuração do Relatório",
  "reports.generate": "Gerar Relatório Agora",
  "reports.columns.report": "ID / Relatório",
  "reports.columns.period": "Período Base",
  "reports.columns.generated": "Gerado em",
  "reports.field.period": "Período Base",
  "reports.field.output": "Formato de Saída",
  "reports.field.transactionStatus": "Status da Transação",
  "reports.field.method": "Método de Pagamento",
  "reports.period.current": "Mês atual (até hoje)",
  "reports.all": "Todos",
  "settings.title": "Configurações da Conta",
  "settings.subtitle": "Gerencie suas preferências, segurança e dados do estabelecimento.",
  "settings.tabs.profile": "Perfil e Preferências",
  "settings.tabs.notifications": "Notificações",
  "settings.tabs.security": "Segurança",
  "settings.tabs.merchant": "Dados do Estabelecimento",
  "settings.tabs.bank": "Contas Bancárias",
  "settings.personalInfo": "Informações Pessoais",
  "settings.personalInfoCopy": "Atualize seus dados básicos.",
  "settings.fullName": "Nome Completo",
  "settings.role": "Cargo",
  "settings.phone": "Telefone",
  "settings.saveChanges": "Salvar Alterações",
  "settings.regional": "Preferências Regionais",
  "settings.regionalCopy": "Configure idioma, fuso horário e moeda.",
  "settings.language": "Idioma",
  "settings.timezone": "Fuso Horário",
  "settings.currency": "Moeda Padrão",
  "settings.savePreferences": "Salvar Preferências",
  "settings.accountStatus": "Status da Conta",
  "settings.account": "Conta",
  "settings.accessLevel": "Nível de Acesso",
  "settings.kycStatus": "Status KYC",
  "settings.memberSince": "Membro desde",
  "settings.approved": "Aprovado",
  "settings.quickActions": "Ações Rápidas",
  "settings.changePassword": "Alterar senha",
  "settings.twoFactor": "Autenticação 2FA",
  "auth.verify.back": "Voltar ao Login",
  "auth.verify.brandTitle": "Segurança em primeiro lugar.",
  "auth.verify.brandCopy": "Protegemos suas transações e dados corporativos com autenticação de múltiplos fatores, garantindo acesso exclusivo apenas a usuários autorizados.",
  "auth.verify.title": "Verificação de Segurança",
  "auth.verify.copy": "Enviamos um código de 6 dígitos para o seu dispositivo para confirmar sua identidade.",
  "auth.verify.code": "Código de Verificação",
  "auth.verify.sentByApp": "Enviado via App",
  "auth.verify.submit": "Verificar e Acessar",
  "auth.verify.otherWay": "Tentar de outra forma",
  "auth.verify.notReceived": "Não recebeu o código?",
  "auth.verify.sms": "SMS",
  "auth.verify.email": "E-mail"
};

const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": pt,
  en: {
    ...pt,
    "shell.principal": "Main",
    "shell.system": "System",
    "shell.search": "Search transactions, customers...",
    "shell.collapse": "Collapse menu",
    "shell.notifications": "Notifications",
    "shell.notificationTitle": "Notification",
    "shell.dark": "Dark mode",
    "shell.light": "Light mode",
    "shell.accessibility": "Accessibility",
    "shell.reducedMotion": "Reduce motion",
    "shell.highContrast": "High contrast",
    "shell.largeText": "Larger text",
    "shell.focusMode": "Focus mode",
    "shell.textAlerts": "Text alerts",
    "shell.company": "Select company",
    "shell.profile": "Profile menu",
    "shell.settings": "Settings",
    "shell.logout": "Sign out",
    "shell.close": "Close",
    "common.today": "Today",
    "common.export": "Export",
    "common.viewAll": "View all",
    "common.randomize": "Simulate receivables",
    "common.selected": "Selected",
    "common.active": "Active",
    "common.edit": "Edit",
    "common.yes": "Yes",
    "common.no": "No",
    "dashboard.title": "Overview",
    "dashboard.subtitle": "Track the main indicators of your operation today.",
    "dashboard.volume": "Transaction Volume",
    "dashboard.volumeSubtitle": "Daily view for the last 7 days",
    "dashboard.alerts": "System Alerts",
    "dashboard.quickTransactions": "View Transactions",
    "dashboard.quickApi": "Create API Key",
    "dashboard.receivablesAgenda": "Receivables Schedule",
    "dashboard.nextSettlements": "Upcoming settlements",
    "dashboard.advanceReceivables": "Advance Receivables",
    "dashboard.latestTransactions": "Latest Transactions",
    "dashboard.dragHelp": "Drag cards to reorder your view.",
    "dashboard.metric.gmv": "Total Volume (GMV)",
    "dashboard.metric.transactions": "Transactions",
    "dashboard.metric.approval": "Approval Rate",
    "dashboard.metric.chargeback": "Chargeback Rate",
    "dashboard.metric.balance": "Available Balance",
    "dashboard.agenda.today": "D+0 (Today)",
    "dashboard.agenda.tomorrow": "D+1 (Tomorrow)",
    "dashboard.agenda.next7": "Next 7 days",
    "dashboard.alert.declinesTitle": "Spike in declined transactions",
    "dashboard.alert.declinesCopy": "We identified a 15% increase in issuer declines in the last hour.",
    "dashboard.alert.declinesTime": "15 minutes ago",
    "operations.title": "Transactions",
    "operations.subtitle": "Manage and monitor every transaction in your operation.",
    "operations.details": "Transaction Details",
    "operations.action.details": "Details",
    "operations.exportCsv": "Export CSV",
    "operations.volumeToday": "Today Volume",
    "operations.approved": "Approved",
    "operations.averageTicket": "Average Ticket",
    "operations.filters.last7": "Last 7 days",
    "operations.filters.status": "Status",
    "operations.filters.method": "Method",
    "operations.filters.channel": "Channel",
    "operations.filters.more": "More filters",
    "operations.columns.id": "ID",
    "operations.columns.date": "Date/Time",
    "operations.columns.customer": "Customer",
    "operations.columns.method": "Method",
    "operations.columns.value": "Amount",
    "operations.columns.status": "Status",
    "operations.columns.risk": "Fraud Check",
    "operations.columns.actions": "Actions",
    "operations.details.empty": "Click ... on a transaction to open the side drilldown.",
    "operations.detail.customer": "Customer",
    "operations.detail.document": "Document",
    "operations.detail.method": "Method",
    "operations.detail.final": "Last digits",
    "operations.detail.risk": "Fraud Check",
    "operations.receipt": "Download Receipt",
    "operations.refund": "Refund",
    "operations.timeline.captured": "Payment captured",
    "operations.timeline.capturedCopy": "Acquirer confirmed the capture.",
    "operations.timeline.fraudApproved": "Fraud analysis approved",
    "operations.timeline.fraudCopy": "Risk evaluated as low.",
    "operations.timeline.created": "Transaction created",
    "operations.timeline.createdCopy": "Checkout started by the customer.",
    "finance.title": "Receivables",
    "finance.subtitle": "Control settlements, advances and financial reconciliation.",
    "finance.currentMonth": "Current month",
    "finance.flow": "Settlement Flow",
    "finance.flowSubtitle": "Daily receivables forecast",
    "finance.summary": "Financial Summary",
    "finance.reconciliation": "Reconciliation",
    "finance.openReconciliation": "Open reconciliation",
    "finance.columns.date": "Date",
    "finance.columns.description": "Description",
    "finance.columns.value": "Amount",
    "finance.columns.status": "Status",
    "finance.available": "Available",
    "finance.pending": "To settle",
    "finance.riskReserve": "Risk reserve",
    "finance.reconciliationCopy": "3 discrepancies are waiting for finance review.",
    "integrations.subtitle": "Monitor technical integrations, deliveries and operational alerts.",
    "integrations.docs": "Documentation",
    "integrations.newKey": "New API Key",
    "integrations.columns.event": "Event",
    "integrations.columns.endpoint": "Endpoint",
    "integrations.columns.action": "Action",
    "integrations.viewPayload": "View payload",
    "integrations.reprocess": "Reprocess",
    "integrations.productionKeys": "Production Keys",
    "integrations.retryPolicy": "Retry policy",
    "integrations.retryPolicyCopy": "5 attempts with exponential backoff and dead-letter for persistent failures.",
    "admin.title": "User Management",
    "admin.subtitle": "Manage access, roles and high-risk approvals.",
    "admin.exportAccess": "Export access",
    "admin.inviteUser": "Invite user",
    "admin.columns.user": "User",
    "admin.columns.role": "Role",
    "admin.columns.lastAccess": "Last access",
    "admin.permissionsMatrix": "Permission matrix",
    "admin.pendingApprovals": "Pending approvals",
    "admin.pendingApprovalsCopy": "Granting refunds.create to Marina requires dual approval.",
    "admin.guardrail": "Guardrail",
    "admin.guardrailCopy": "Financial permissions require justification, dual approval and an audit trail.",
    "reports.title": "Reports Hub",
    "reports.subtitle": "Generate, schedule and download detailed financial reports.",
    "reports.schedules": "View Schedules",
    "reports.models": "Report Models",
    "reports.history": "Execution History",
    "reports.config": "Report Configuration",
    "reports.generate": "Generate Report Now",
    "reports.columns.report": "ID / Report",
    "reports.columns.period": "Base Period",
    "reports.columns.generated": "Generated at",
    "reports.field.period": "Base Period",
    "reports.field.output": "Output Format",
    "reports.field.transactionStatus": "Transaction Status",
    "reports.field.method": "Payment Method",
    "reports.period.current": "Current month (to date)",
    "reports.all": "All",
    "settings.title": "Account Settings",
    "settings.subtitle": "Manage preferences, security and merchant data.",
    "settings.tabs.profile": "Profile and Preferences",
    "settings.tabs.notifications": "Notifications",
    "settings.tabs.security": "Security",
    "settings.tabs.merchant": "Merchant Data",
    "settings.tabs.bank": "Bank Accounts",
    "settings.personalInfo": "Personal Information",
    "settings.personalInfoCopy": "Update your basic data.",
    "settings.fullName": "Full Name",
    "settings.role": "Role",
    "settings.phone": "Phone",
    "settings.saveChanges": "Save Changes",
    "settings.regional": "Regional Preferences",
    "settings.regionalCopy": "Configure language, timezone and currency.",
    "settings.language": "Language",
    "settings.timezone": "Timezone",
    "settings.currency": "Default Currency",
    "settings.savePreferences": "Save Preferences",
    "settings.accountStatus": "Account Status",
    "settings.account": "Account",
    "settings.accessLevel": "Access Level",
    "settings.kycStatus": "KYC Status",
    "settings.memberSince": "Member since",
    "settings.approved": "Approved",
    "settings.quickActions": "Quick Actions",
    "settings.changePassword": "Change password",
    "settings.twoFactor": "2FA Authentication",
    "auth.verify.back": "Back to Login",
    "auth.verify.brandTitle": "Security comes first.",
    "auth.verify.brandCopy": "We protect your transactions and corporate data with multi-factor authentication, ensuring access only for authorized users.",
    "auth.verify.title": "Security Verification",
    "auth.verify.copy": "We sent a 6-digit code to your device to confirm your identity.",
    "auth.verify.code": "Verification Code",
    "auth.verify.sentByApp": "Sent via App",
    "auth.verify.submit": "Verify and Access",
    "auth.verify.otherWay": "Try another way",
    "auth.verify.notReceived": "Did not receive the code?"
  },
  es: {
    ...pt,
    "shell.system": "Sistema",
    "shell.search": "Buscar transacciones, clientes...",
    "shell.collapse": "Contraer menú",
    "shell.notifications": "Notificaciones",
    "shell.notificationTitle": "Notificación",
    "shell.dark": "Modo oscuro",
    "shell.light": "Modo claro",
    "shell.accessibility": "Accesibilidad",
    "shell.reducedMotion": "Reducir movimiento",
    "shell.highContrast": "Alto contraste",
    "shell.largeText": "Texto grande",
    "shell.focusMode": "Modo foco",
    "shell.textAlerts": "Alertas textuales",
    "shell.company": "Seleccionar empresa",
    "shell.profile": "Menú de perfil",
    "shell.settings": "Configuración",
    "shell.logout": "Cerrar sesión",
    "shell.close": "Cerrar",
    "common.today": "Hoy",
    "common.viewAll": "Ver todo",
    "common.randomize": "Simular cobranzas",
    "common.selected": "Seleccionado",
    "common.active": "Activa",
    "common.edit": "Editar",
    "common.yes": "Sí",
    "dashboard.title": "Visión General",
    "dashboard.subtitle": "Acompaña los principales indicadores de tu operación hoy.",
    "dashboard.volume": "Volumen de Transacciones",
    "dashboard.volumeSubtitle": "Seguimiento diario de los últimos 7 días",
    "dashboard.alerts": "Alertas del Sistema",
    "dashboard.quickTransactions": "Ver Transacciones",
    "dashboard.quickApi": "Crear API Key",
    "dashboard.receivablesAgenda": "Agenda de Cobranzas",
    "dashboard.nextSettlements": "Liquidaciones próximas",
    "dashboard.advanceReceivables": "Anticipar Cobranzas",
    "dashboard.latestTransactions": "Últimas Transacciones",
    "dashboard.dragHelp": "Arrastra las tarjetas para reorganizar tu vista.",
    "dashboard.metric.gmv": "Volumen Total (GMV)",
    "dashboard.metric.transactions": "Transacciones",
    "dashboard.metric.approval": "Tasa de Aprobación",
    "dashboard.metric.chargeback": "Tasa de Chargeback",
    "dashboard.metric.balance": "Saldo Disponible",
    "dashboard.agenda.today": "D+0 (Hoy)",
    "dashboard.agenda.tomorrow": "D+1 (Mañana)",
    "dashboard.agenda.next7": "Próximos 7 días",
    "dashboard.alert.declinesTitle": "Pico de transacciones rechazadas",
    "dashboard.alert.declinesCopy": "Identificamos un aumento del 15% en los rechazos del emisor durante la última hora.",
    "dashboard.alert.declinesTime": "Hace 15 minutos",
    "operations.title": "Transacciones",
    "operations.subtitle": "Gestiona y monitorea todas las transacciones de tu operación.",
    "operations.details": "Detalles de la Transacción",
    "operations.action.details": "Detalles",
    "operations.volumeToday": "Volumen Hoy",
    "operations.approved": "Aprobadas",
    "operations.averageTicket": "Ticket Medio",
    "operations.filters.last7": "Últimos 7 días",
    "operations.filters.status": "Estado",
    "operations.filters.more": "Más filtros",
    "operations.columns.date": "Fecha/Hora",
    "operations.columns.customer": "Cliente",
    "operations.columns.value": "Valor",
    "operations.columns.status": "Estado",
    "operations.columns.actions": "Acciones",
    "operations.details.empty": "Haz clic en ... en una transacción para abrir el drilldown lateral.",
    "operations.detail.customer": "Cliente",
    "operations.detail.document": "Documento",
    "operations.detail.final": "Final",
    "operations.receipt": "Descargar Recibo",
    "operations.refund": "Reembolsar",
    "operations.timeline.captured": "Pago capturado",
    "operations.timeline.capturedCopy": "El adquirente confirmó la captura.",
    "operations.timeline.fraudApproved": "Análisis antifraude aprobado",
    "operations.timeline.fraudCopy": "Riesgo evaluado como bajo.",
    "operations.timeline.created": "Transacción creada",
    "operations.timeline.createdCopy": "Checkout iniciado por el cliente.",
    "finance.title": "Cobranzas",
    "finance.subtitle": "Controla liquidaciones, anticipos y conciliación financiera.",
    "finance.currentMonth": "Mes actual",
    "finance.flow": "Flujo de Liquidación",
    "finance.flowSubtitle": "Previsión diaria de cobranzas",
    "finance.summary": "Resumen Financiero",
    "finance.reconciliation": "Conciliación",
    "finance.openReconciliation": "Abrir conciliación",
    "finance.columns.date": "Fecha",
    "finance.columns.description": "Descripción",
    "finance.columns.value": "Valor",
    "finance.columns.status": "Estado",
    "finance.available": "Disponible",
    "finance.pending": "A liquidar",
    "finance.riskReserve": "Retención de riesgo",
    "finance.reconciliationCopy": "3 divergencias aguardan revisión del equipo financiero.",
    "integrations.subtitle": "Monitorea integraciones técnicas, entregas y alertas operativas.",
    "integrations.docs": "Documentación",
    "integrations.newKey": "Nueva API Key",
    "integrations.columns.event": "Evento",
    "integrations.columns.endpoint": "Endpoint",
    "integrations.columns.action": "Acción",
    "integrations.viewPayload": "Ver payload",
    "integrations.reprocess": "Reprocesar",
    "integrations.productionKeys": "Claves de Producción",
    "integrations.retryPolicy": "Política de retry",
    "integrations.retryPolicyCopy": "5 intentos con backoff exponencial y dead-letter para fallas persistentes.",
    "admin.title": "Gestión de Usuarios",
    "admin.subtitle": "Administra accesos, roles y aprobaciones de alto riesgo.",
    "admin.exportAccess": "Exportar accesos",
    "admin.inviteUser": "Invitar usuario",
    "admin.columns.user": "Usuario",
    "admin.columns.role": "Rol",
    "admin.columns.lastAccess": "Último acceso",
    "admin.permissionsMatrix": "Matriz de permisos",
    "admin.pendingApprovals": "Aprobaciones pendientes",
    "admin.pendingApprovalsCopy": "Conceder refunds.create a Marina exige aprobación doble.",
    "admin.guardrail": "Guardrail",
    "admin.guardrailCopy": "Los permisos financieros exigen justificación, aprobación doble y auditoría.",
    "reports.title": "Central de Reportes",
    "reports.subtitle": "Genera, programa y descarga reportes financieros detallados.",
    "reports.schedules": "Ver Agendamientos",
    "reports.models": "Modelos de Reporte",
    "reports.history": "Historial de Ejecuciones",
    "reports.config": "Configuración del Reporte",
    "reports.generate": "Generar Reporte Ahora",
    "reports.columns.report": "ID / Reporte",
    "reports.columns.period": "Período Base",
    "reports.columns.generated": "Generado en",
    "reports.field.period": "Período Base",
    "reports.field.output": "Formato de Salida",
    "reports.field.transactionStatus": "Estado de la Transacción",
    "reports.field.method": "Método de Pago",
    "reports.period.current": "Mes actual (hasta hoy)",
    "reports.all": "Todos",
    "settings.title": "Configuración de Cuenta",
    "settings.subtitle": "Gestiona preferencias, seguridad y datos del establecimiento.",
    "settings.tabs.profile": "Perfil y Preferencias",
    "settings.tabs.notifications": "Notificaciones",
    "settings.tabs.security": "Seguridad",
    "settings.tabs.merchant": "Datos del Establecimiento",
    "settings.tabs.bank": "Cuentas Bancarias",
    "settings.personalInfo": "Información Personal",
    "settings.personalInfoCopy": "Actualiza tus datos básicos.",
    "settings.fullName": "Nombre Completo",
    "settings.role": "Cargo",
    "settings.phone": "Teléfono",
    "settings.saveChanges": "Guardar Cambios",
    "settings.regional": "Preferencias Regionales",
    "settings.regionalCopy": "Configura idioma, zona horaria y moneda.",
    "settings.language": "Idioma",
    "settings.timezone": "Zona Horaria",
    "settings.currency": "Moneda Predeterminada",
    "settings.savePreferences": "Guardar Preferencias",
    "settings.accountStatus": "Estado de la Cuenta",
    "settings.account": "Cuenta",
    "settings.accessLevel": "Nivel de Acceso",
    "settings.kycStatus": "Estado KYC",
    "settings.memberSince": "Miembro desde",
    "settings.approved": "Aprobado",
    "settings.quickActions": "Acciones Rápidas",
    "settings.changePassword": "Cambiar contraseña",
    "settings.twoFactor": "Autenticación 2FA",
    "auth.verify.back": "Volver al login",
    "auth.verify.brandTitle": "La seguridad es lo primero.",
    "auth.verify.brandCopy": "Protegemos tus transacciones y datos corporativos con autenticación multifactor, garantizando acceso solo a usuarios autorizados.",
    "auth.verify.title": "Verificación de Seguridad",
    "auth.verify.copy": "Enviamos un código de 6 dígitos a tu dispositivo para confirmar tu identidad.",
    "auth.verify.code": "Código de Verificación",
    "auth.verify.sentByApp": "Enviado por App",
    "auth.verify.submit": "Verificar y Acceder",
    "auth.verify.otherWay": "Intentar otra forma",
    "auth.verify.notReceived": "¿No recibiste el código?"
  }
};

const PortalContext = createContext<PortalContextValue | null>(null);
const cache = new Map<string, { expiresAt: number; value: unknown }>();
const bffBase = "http://127.0.0.1:4300";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be disabled in private browsing. The UI keeps working in memory.
  }
}

async function cachedFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) return cached.value as T;

  const value = await fetcher();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`BFF responded ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function selectedMerchant() {
  const storedMerchantId = readStored("mp.merchantId", merchantOptions[0].id);
  return merchantOptions.find((item) => item.id === storedMerchantId) ?? merchantOptions[0];
}

function makeInitialState(): PortalState {
  return {
    ...createPortalSnapshot(),
    merchant: selectedMerchant(),
    merchantOptions,
    locale: readStored<Locale>("mp.locale", "pt-BR"),
    theme: readStored<Theme>("mp.theme", "light"),
    accessibility: readStored<AccessibilitySettings>("mp.accessibility", defaultAccessibility),
    hydratedFromBff: false,
    busyAction: null,
    toast: null,
    lastUpdated: new Date().toISOString()
  };
}

function applyReceivables(state: PortalState, scenario: ReceivableScenario): PortalState {
  return {
    ...state,
    dashboard: {
      ...state.dashboard,
      agenda: scenario.agenda,
      chart: scenario.transactionChart,
      metrics: state.dashboard.metrics.map((metric) => {
        if (metric.title === "Saldo Disponível") return { ...metric, value: scenario.balance.available.replace(",00", "") };
        if (metric.title === "Transações") {
          const total = scenario.transactionChart.reduce((sum, point) => sum + point.approved + point.rejected, 0);
          return { ...metric, value: total.toLocaleString("pt-BR") };
        }
        return metric;
      })
    },
    receivables: {
      ...state.receivables,
      summary: scenario.summary,
      settlements: scenario.settlements,
      chart: scenario.liquidationChart,
      balance: scenario.balance
    },
    lastUpdated: new Date().toISOString()
  };
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(makeInitialState);

  const t = useCallback(
    (key: string) => translations[state.locale][key] ?? translations["pt-BR"][key] ?? key,
    [state.locale]
  );

  const track = useCallback((event: string, payload: Record<string, unknown> = {}) => {
    const body = {
      event,
      payload,
      timestamp: new Date().toISOString(),
      sessionMode: "mock-presentation"
    };

    console.info("[merchant-portal analytics]", body);
    void fetch(`${bffBase}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(() => undefined);
  }, []);

  const announce = useCallback((title: string, description = "Ação simulada registrada.", tone: Toast["tone"] = "info") => {
    setState((current) => ({
      ...current,
      busyAction: null,
      toast: {
        id: Date.now(),
        title,
        description,
        tone
      }
    }));
  }, []);

  const actions = useMemo<PortalActions>(
    () => ({
      setLocale(locale) {
        writeStored("mp.locale", locale);
        setState((current) => ({ ...current, locale }));
        track("locale.changed", { locale });
      },
      selectMerchant(merchantId) {
        const merchant = merchantOptions.find((item) => item.id === merchantId);
        if (!merchant) return;
        writeStored("mp.merchantId", merchantId);
        setState((current) => ({ ...current, merchant }));
        track("merchant.changed", { merchantId, merchantName: merchant.name });
        announce("Empresa selecionada", merchant.name, "success");
      },
      toggleTheme() {
        setState((current) => {
          const theme = current.theme === "dark" ? "light" : "dark";
          writeStored("mp.theme", theme);
          track("theme.changed", { theme });
          return { ...current, theme };
        });
      },
      toggleAccessibility(key) {
        setState((current) => {
          const accessibility = { ...current.accessibility, [key]: !current.accessibility[key] };
          writeStored("mp.accessibility", accessibility);
          track("accessibility.changed", { key, value: accessibility[key] });
          return { ...current, accessibility };
        });
      },
      runAction(label, options) {
        track("ui.action", { label, tone: options?.tone ?? "info" });
        announce(label, options?.description, options?.tone);
      },
      async randomizeReceivables() {
        const label = t("common.randomize");
        setState((current) => ({ ...current, busyAction: label }));
        track("receivables.randomize.requested");

        try {
          const scenario = await fetchJson<ReceivableScenario>(`${bffBase}/api/receivables/randomize`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ seed: Date.now() })
          });
          setState((current) => applyReceivables({ ...current, busyAction: null }, scenario));
          announce(label, "Cenário de recebíveis atualizado com dados mockados do BFF.", "success");
        } catch {
          const scenario = generateReceivables(Date.now());
          setState((current) => applyReceivables({ ...current, busyAction: null }, scenario));
          announce(label, "BFF indisponível: cenário gerado localmente para a apresentação.", "warning");
        }
      },
      selectReportTemplate(title) {
        setState((current) => ({
          ...current,
          reports: {
            ...current.reports,
            templates: current.reports.templates.map((template) => ({
              ...template,
              selected: template.title === title
            }))
          }
        }));
        track("report.template.selected", { title });
        announce("Modelo selecionado", title, "success");
      },
      dismissToast() {
        setState((current) => ({ ...current, toast: null }));
      },
      track
    }),
    [announce, t, track]
  );

  useEffect(() => {
    document.documentElement.lang = state.locale;
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.reduceMotion = String(state.accessibility.reduceMotion);
    document.documentElement.dataset.highContrast = String(state.accessibility.highContrast);
    document.documentElement.dataset.largeText = String(state.accessibility.largeText);
    document.documentElement.dataset.focusMode = String(state.accessibility.focusMode);
    document.documentElement.dataset.textAlerts = String(state.accessibility.textAlerts);
  }, [state.accessibility, state.locale, state.theme]);

  useEffect(() => {
    void cachedFetch("portal.bootstrap", 30_000, () => fetchJson<PortalSnapshot>(`${bffBase}/api/bootstrap`))
      .then((snapshot) => {
        setState((current) => ({
          ...current,
          ...snapshot,
          merchant: current.merchant,
          merchantOptions: current.merchantOptions,
          locale: current.locale,
          theme: current.theme,
          accessibility: current.accessibility,
          hydratedFromBff: true,
          lastUpdated: new Date().toISOString()
        }));
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ state, actions, t }), [actions, state, t]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortalState() {
  const value = useContext(PortalContext);
  if (!value) throw new Error("usePortalState must be used within PortalProvider.");
  return value.state;
}

export function usePortalActions() {
  const value = useContext(PortalContext);
  if (!value) throw new Error("usePortalActions must be used within PortalProvider.");
  return value.actions;
}

export function useT() {
  const value = useContext(PortalContext);
  if (!value) throw new Error("useT must be used within PortalProvider.");
  return value.t;
}
