import {
  Accessibility,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  KeyRound,
  Languages,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePortalActions, usePortalState, useT, type Locale } from "@mp/runtime";
import { Logo, cn } from "@mp/shared-ui";
import type { RemoteModule } from "./remotes";
import { remoteManifest, resolveRemote } from "./remotes";

function getPathname(): string {
  return window.location.pathname || "/";
}

export function ShellApp() {
  const [pathname, setPathname] = useState(getPathname);
  const [remoteModule, setRemoteModule] = useState<RemoteModule | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = window.localStorage.getItem("mp.sidebar.collapsed");
    return stored === null ? true : stored === "true";
  });
  const remote = useMemo(() => resolveRemote(pathname), [pathname]);
  const state = usePortalState();
  const actions = usePortalActions();

  function navigate(nextPathname: string) {
    if (window.location.pathname !== nextPathname) {
      window.history.pushState({}, "", nextPathname);
    }

    actions.track("route.changed", { from: pathname, to: nextPathname });
    setPathname(nextPathname);
  }

  useEffect(() => {
    const onPopState = () => setPathname(getPathname());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRemoteModule(null);

    remote.load().then((module) => {
      if (!cancelled) setRemoteModule(module);
    });

    return () => {
      cancelled = true;
    };
  }, [remote]);

  const RemoteComponent = remoteModule?.default;

  if (!remote.framed) {
    return RemoteComponent ? (
      <RemoteComponent merchant={state.merchant} navigate={navigate} pathname={pathname} />
    ) : (
      <div className="p-8 text-mp-content-muted">Carregando {remote.context}...</div>
    );
  }

  return (
    <div className={cn("grid min-h-screen bg-mp-surface-subtle max-[900px]:grid-cols-1", sidebarCollapsed ? "grid-cols-[88px_minmax(0,1fr)]" : "grid-cols-[264px_minmax(0,1fr)] max-[1180px]:grid-cols-[248px_minmax(0,1fr)]")}>
      <Sidebar activeId={remote.id} collapsed={sidebarCollapsed} navigate={navigate} onToggleCollapsed={() => {
        const next = !sidebarCollapsed;
        window.localStorage.setItem("mp.sidebar.collapsed", String(next));
        setSidebarCollapsed(next);
      }} />
      <div className="min-w-0">
        <Topbar context={remote.context} contextId={remote.id} navigate={navigate} />
        <main className="min-h-[calc(100vh-76px)] px-11 py-12 outline-none max-[1180px]:px-6 max-[900px]:px-4 max-[900px]:py-6">
          {RemoteComponent ? (
            <RemoteComponent merchant={state.merchant} navigate={navigate} pathname={pathname} />
          ) : (
            <div className="text-mp-content-muted">Carregando {remote.context}...</div>
          )}
        </main>
      </div>
      <ToastAnnouncer />
    </div>
  );
}

const navIcons: Record<string, LucideIcon> = {
  dashboard: BarChart3,
  operations: CreditCard,
  finance: WalletCards,
  integrations: KeyRound,
  admin: UsersRound,
  reports: FileText,
  settings: Settings
};

const remoteCopy: Record<Locale, Record<string, { label: string; context: string }>> = {
  "pt-BR": {
    dashboard: { label: "Home Dashboard", context: "Saúde do negócio" },
    operations: { label: "Operação (Transações)", context: "Operação" },
    finance: { label: "Financeiro (Recebíveis)", context: "Financeiro" },
    integrations: { label: "Integrações (API Keys)", context: "Técnico" },
    admin: { label: "Administração (Usuários)", context: "Administração" },
    reports: { label: "Relatórios", context: "Relatórios" },
    settings: { label: "Configurações", context: "Configurações" }
  },
  en: {
    dashboard: { label: "Home Dashboard", context: "Business health" },
    operations: { label: "Operations (Transactions)", context: "Operations" },
    finance: { label: "Finance (Receivables)", context: "Finance" },
    integrations: { label: "Integrations (API Keys)", context: "Technical" },
    admin: { label: "Administration (Users)", context: "Administration" },
    reports: { label: "Reports", context: "Reports" },
    settings: { label: "Settings", context: "Settings" }
  },
  es: {
    dashboard: { label: "Home Dashboard", context: "Salud del negocio" },
    operations: { label: "Operación (Transacciones)", context: "Operación" },
    finance: { label: "Finanzas (Cobranzas)", context: "Finanzas" },
    integrations: { label: "Integraciones (API Keys)", context: "Técnico" },
    admin: { label: "Administración (Usuarios)", context: "Administración" },
    reports: { label: "Reportes", context: "Reportes" },
    settings: { label: "Configuración", context: "Configuración" }
  }
};

function getRemoteCopy(id: string, locale: Locale, fallback: string, field: "label" | "context") {
  return remoteCopy[locale][id]?.[field] ?? remoteCopy["pt-BR"][id]?.[field] ?? fallback;
}

function Sidebar({
  activeId,
  collapsed,
  navigate,
  onToggleCollapsed
}: {
  activeId: string;
  collapsed: boolean;
  navigate: (pathname: string) => void;
  onToggleCollapsed: () => void;
}) {
  const framedRemotes = remoteManifest.filter((remote) => remote.framed);
  const state = usePortalState();
  const actions = usePortalActions();
  const t = useT();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-[#132238] bg-[#071525] text-white max-[900px]:static max-[900px]:h-auto">
      <div className={cn("py-7", collapsed ? "px-5" : "px-6")}>
        <Logo compact={collapsed} href="/" onNavigate={navigate} />
      </div>
      <nav className={cn("mt-4 flex flex-col gap-1 max-[900px]:mt-0 max-[900px]:grid max-[900px]:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]", collapsed ? "px-3" : "px-4")} aria-label="Menu principal">
        <NavSection collapsed={collapsed} label={t("shell.principal")} />
        {framedRemotes.slice(0, 3).map((remote) => (
          <NavItem
            key={remote.id}
            active={remote.id === activeId}
            collapsed={collapsed}
            href={remote.routes[0]}
            icon={navIcons[remote.id] ?? Home}
            label={getRemoteCopy(remote.id, state.locale, remote.label, "label")}
            onNavigate={navigate}
          />
        ))}
        <NavSection collapsed={collapsed} label={t("shell.system")} />
        {framedRemotes.slice(3).map((remote) => (
          <NavItem
            key={remote.id}
            active={remote.id === activeId}
            collapsed={collapsed}
            href={remote.routes[0]}
            icon={navIcons[remote.id] ?? Home}
            label={getRemoteCopy(remote.id, state.locale, remote.label, "label")}
            onNavigate={navigate}
          />
        ))}
      </nav>
      <button
        aria-label={t("shell.collapse")}
        className="mt-auto grid min-h-16 place-items-center border-0 border-t border-[#132238] bg-transparent text-slate-400 transition hover:bg-[#0d2035] hover:text-white max-[900px]:hidden"
        onClick={() => {
          onToggleCollapsed();
          actions.track("sidebar.collapsed.toggled", { collapsed: !collapsed });
        }}
        title={t("shell.collapse")}
        type="button"
      >
        {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
      </button>
    </aside>
  );
}

function NavSection({ collapsed, label }: { collapsed: boolean; label: string }) {
  return <span className={cn("mx-3 mt-9 mb-2 text-sm font-bold uppercase text-[#7d8aa0] max-[900px]:hidden", collapsed && "sr-only")}>{label}</span>;
}

function NavItem({
  active,
  collapsed,
  icon: Icon,
  label,
  href,
  onNavigate
}: {
  active: boolean;
  collapsed: boolean;
  icon: LucideIcon;
  label: string;
  href: string;
  onNavigate: (pathname: string) => void;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
      className={cn(
        "grid min-h-[50px] items-center rounded-lg text-sm font-bold leading-tight text-[#aab7c8] no-underline transition hover:bg-[#0d2035] hover:text-white",
        collapsed ? "grid-cols-1 place-items-center px-3 py-3" : "grid-cols-[28px_minmax(0,1fr)] gap-3 px-4 py-3",
        active && "bg-[#0f2c55] text-white ring-1 ring-[#2d6bf0]"
      )}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      <Icon className={cn("size-5 text-[#9aa8ba]", active && "text-[#3b82f6]")} />
      <span className={collapsed ? "sr-only" : ""}>{label}</span>
    </a>
  );
}

function Topbar({
  context,
  contextId,
  navigate
}: {
  context: string;
  contextId: string;
  navigate: (pathname: string) => void;
}) {
  const state = usePortalState();
  const actions = usePortalActions();
  const t = useT();
  const [notification, setNotification] = useState<string | null>(null);

  const notifications: Record<Locale, string[]> = {
    "pt-BR": [
      "3 divergências aguardam conferência do time financeiro.",
      "Webhook WH-7839 falhou após três tentativas.",
      "Novo lote de recebíveis ficará disponível às 18:00.",
      "Solicitação de reembolso exige aprovação dupla."
    ],
    en: [
      "3 discrepancies are waiting for finance review.",
      "Webhook WH-7839 failed after three attempts.",
      "A new receivables batch will be available at 18:00.",
      "A refund request requires dual approval."
    ],
    es: [
      "3 divergencias aguardan revisión del equipo financiero.",
      "El webhook WH-7839 falló después de tres intentos.",
      "Un nuevo lote de cobranzas estará disponible a las 18:00.",
      "Una solicitud de reembolso exige aprobación doble."
    ]
  };

  function openRandomNotification() {
    const items = notifications[state.locale];
    const item = items[Math.floor(Math.random() * items.length)];
    actions.track("notification.opened", { message: item });
    setNotification(item);
  }

  return (
    <header className="sticky top-0 z-10 grid h-[76px] grid-cols-[auto_minmax(280px,640px)_minmax(260px,330px)_auto_auto_auto_48px_56px] items-center gap-4 border-b border-mp-border-subtle bg-white px-8 max-[1420px]:grid-cols-[auto_minmax(240px,1fr)_auto_auto_48px] max-[1420px]:gap-3 max-[900px]:relative max-[900px]:grid-cols-1 max-[900px]:px-4 max-[900px]:py-4 max-[900px]:h-auto">
      <div className="flex items-center gap-3 whitespace-nowrap text-base font-bold text-mp-content-strong">
        <Home className="size-5 text-mp-content-subtle" />
        <span className="text-mp-content-subtle">/</span>
        {getRemoteCopy(contextId, state.locale, context, "context")}
      </div>
      <form
        className="grid h-14 grid-cols-[28px_1fr] items-center gap-2 rounded-lg border border-mp-border-subtle bg-[#fafcff] px-5 text-mp-content-subtle shadow-xs"
        onSubmit={(event) => {
          event.preventDefault();
          actions.runAction("Busca simulada", { description: "A busca registra telemetria e manteria cache de resultados em produção." });
        }}
      >
        <Search className="size-5" />
        <input className="w-full border-0 bg-transparent text-base text-mp-content-default outline-none placeholder:text-[#8a96a8]" type="search" placeholder={t("shell.search")} />
      </form>
      <label className="relative grid h-14 min-w-[260px] grid-cols-[40px_1fr_16px] items-center gap-3 rounded-lg border border-mp-border-subtle bg-[#fafcff] px-4 text-left shadow-xs max-[1420px]:hidden" title={t("shell.company")}>
        <span className="grid size-10 place-items-center rounded-md bg-[#0b1d35] text-lg font-bold text-white">{state.merchant.name.slice(0, 1)}</span>
        <span>
          <strong className="block text-sm text-mp-content-strong">{state.merchant.name}</strong>
          <small className="block text-xs text-mp-content-muted">ID: {state.merchant.id}</small>
        </span>
        <select
          aria-label={t("shell.company")}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(event) => actions.selectMerchant(event.currentTarget.value)}
          value={state.merchant.id}
        >
          {state.merchantOptions.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
          ))}
        </select>
        <ChevronDown className="size-4 text-mp-content-muted" aria-hidden="true" />
      </label>
      <label className="inline-grid h-11 grid-cols-[18px_1fr] items-center gap-2 rounded-lg border border-mp-border-subtle bg-white px-3 text-sm font-bold text-mp-content-strong shadow-sm max-[1420px]:hidden">
        <Languages className="size-4 text-mp-content-muted" />
        <select
          aria-label="Idioma"
          className="border-0 bg-transparent font-bold outline-none"
          onChange={(event) => actions.setLocale(event.currentTarget.value as Locale)}
          value={state.locale}
        >
          <option value="pt-BR">PT-BR</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </label>
      <button
        aria-label={state.theme === "dark" ? t("shell.light") : t("shell.dark")}
        className="grid size-11 place-items-center rounded-lg border border-mp-border-subtle bg-white text-mp-content-strong shadow-sm"
        onClick={actions.toggleTheme}
        title={state.theme === "dark" ? t("shell.light") : t("shell.dark")}
        type="button"
      >
        {state.theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
      <AccessibilityMenu />
      <button
        className="relative grid size-12 place-items-center rounded-full bg-white text-mp-content-default"
        onClick={openRandomNotification}
        type="button"
        aria-label={t("shell.notifications")}
      >
        <Bell className="size-6" />
        <span className="absolute right-3 top-2 size-2 rounded-full bg-red-500" />
      </button>
      <details className="relative max-[900px]:hidden">
        <summary className="grid size-14 cursor-pointer list-none place-items-center rounded-full bg-[#111827] text-base font-bold text-white shadow-sm" aria-label={t("shell.profile")}>
          RO
        </summary>
        <div className="absolute right-0 top-16 z-30 grid w-56 gap-1 rounded-xl border border-mp-border-subtle bg-white p-2 text-sm shadow-md">
          <button className="rounded-lg px-3 py-2 text-left font-bold text-mp-content-strong hover:bg-slate-50" onClick={() => navigate("/settings/account")} type="button">
            {t("shell.settings")}
          </button>
          <button className="rounded-lg px-3 py-2 text-left text-mp-content-default hover:bg-slate-50" onClick={() => actions.runAction(t("shell.logout"), { description: "Sessão encerrada apenas nesta simulação." })} type="button">
            {t("shell.logout")}
          </button>
        </div>
      </details>
      {notification ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" role="presentation" onMouseDown={() => setNotification(null)}>
          <section
            aria-labelledby="notification-title"
            className="w-full max-w-md rounded-xl border border-mp-border-subtle bg-white p-6 shadow-md"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="notification-title" className="m-0 text-xl font-bold text-mp-content-strong">{t("shell.notificationTitle")}</h2>
                <p className="mt-2 text-mp-content-default">{notification}</p>
              </div>
              <button className="rounded-lg border border-mp-border-subtle px-3 py-1 font-bold" onClick={() => setNotification(null)} type="button">
                {t("shell.close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}

function AccessibilityMenu() {
  const { accessibility } = usePortalState();
  const actions = usePortalActions();
  const t = useT();
  const items: Array<[keyof typeof accessibility, string]> = [
    ["reduceMotion", t("shell.reducedMotion")],
    ["highContrast", t("shell.highContrast")],
    ["largeText", t("shell.largeText")],
    ["focusMode", t("shell.focusMode")],
    ["textAlerts", t("shell.textAlerts")]
  ];

  return (
    <details className="relative max-[1420px]:hidden">
      <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-mp-border-subtle bg-white text-mp-content-strong shadow-sm" aria-label={t("shell.accessibility")}>
        <Accessibility className="size-5" />
      </summary>
      <div className="absolute right-0 top-14 z-20 grid w-64 gap-3 rounded-xl border border-mp-border-subtle bg-white p-4 shadow-md">
        <strong className="text-sm text-mp-content-strong">{t("shell.accessibility")}</strong>
        {items.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-3 text-sm text-mp-content-default">
            <span>{label}</span>
            <input checked={accessibility[key]} onChange={() => actions.toggleAccessibility(key)} type="checkbox" />
          </label>
        ))}
      </div>
    </details>
  );
}

function ToastAnnouncer() {
  const { accessibility, toast } = usePortalState();
  if (!toast) return null;

  return (
    <>
      {accessibility.textAlerts ? <div className="mp-sr-status" aria-live="polite">{toast.title}. {toast.description}</div> : null}
      <output className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-mp-border-subtle bg-white p-4 text-sm text-mp-content-default shadow-md" role="status">
        <strong className="block text-mp-content-strong">{toast.title}</strong>
        <span>{toast.description}</span>
      </output>
    </>
  );
}
