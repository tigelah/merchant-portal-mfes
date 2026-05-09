import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, CardHeading, DataTable, LineChart, MetricCard, Page, PageHeader, Panel, StatusBadge } from "@mp/shared-ui";

export const routes = ["/receivables"];

function translateSettlementStatus(status: string, locale: string) {
  if (locale === "en") {
    if (status === "Agendado") return "Scheduled";
    if (status === "Em processamento") return "Processing";
    if (status === "Previsto") return "Expected";
  }
  if (locale === "es") {
    if (status === "Agendado") return "Programado";
    if (status === "Em processamento") return "En procesamiento";
    if (status === "Previsto") return "Previsto";
  }
  return status;
}

export default function FinanceRemote() {
  const { locale, merchant, receivables, busyAction } = usePortalState();
  const actions = usePortalActions();
  const t = useT();

  return (
    <Page>
      <PageHeader
        actions={
          <>
            <Button onPress={() => actions.runAction(t("finance.currentMonth"), { description: "Período financeiro alterado para mês corrente." })}>{t("finance.currentMonth")}</Button>
            <Button disabled={busyAction === t("common.randomize")} onPress={actions.randomizeReceivables} variant="primary">
              {t("common.randomize")}
            </Button>
          </>
        }
        subtitle={t("finance.subtitle")}
        title={t("finance.title")}
      />
      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
        {receivables.summary.map((metric) => (
          <MetricCard key={metric.title} {...metric} onPress={() => actions.runAction(metric.title, { description: "Detalhe financeiro mockado com auditoria e conciliação." })} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-5">
          <LineChart data={receivables.chart} onRandomize={actions.randomizeReceivables} subtitle={t("finance.flowSubtitle")} title={t("finance.flow")} />
          <DataTable
            columns={[t("finance.columns.date"), t("finance.columns.description"), t("finance.columns.value"), t("finance.columns.status")]}
            rows={receivables.settlements.map((item) => [
              item.date,
              item.description,
              <strong>{item.amount}</strong>,
              <StatusBadge variant={item.status === "Agendado" ? "positive" : "warning"}>{translateSettlementStatus(item.status, locale)}</StatusBadge>
            ])}
          />
        </div>
        <aside className="grid gap-5">
          <Panel>
            <CardHeading title={t("finance.summary")} subtitle={`${t("settings.account")} ${merchant.name}`} />
            <ul className="grid gap-2 p-0">
              <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3"><span className="size-2 rounded-full bg-mp-brand-secondary" />{t("finance.available")}<strong>{receivables.balance.available}</strong></li>
              <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3"><span className="size-2 rounded-full bg-mp-brand-primary" />{t("finance.pending")}<strong>{receivables.balance.pending}</strong></li>
              <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3"><span className="size-2 rounded-full bg-slate-300" />{t("finance.riskReserve")}<strong>{receivables.balance.riskReserve}</strong></li>
            </ul>
          </Panel>
          <Panel>
            <CardHeading title={t("finance.reconciliation")} subtitle={t("finance.reconciliationCopy")} />
            <Button onPress={() => actions.runAction(t("finance.openReconciliation"), { description: "Abriria fila com divergências por ERP, adquirente e liquidação.", tone: "warning" })}>
              {t("finance.openReconciliation")}
            </Button>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
