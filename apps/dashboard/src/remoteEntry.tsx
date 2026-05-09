import { ArrowDownToLine, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, CardHeading, LineChart, MetricCard, Page, PageHeader, Panel, type RemoteProps } from "@mp/shared-ui";

export const routes = ["/"];
const metricOrderStorageKey = "mp.dashboard.metricOrder";

export default function DashboardRemote({ navigate }: RemoteProps) {
  const { dashboard, busyAction } = usePortalState();
  const actions = usePortalActions();
  const t = useT();
  const [metricOrder, setMetricOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(metricOrderStorageKey);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setMetricOrder((current) => {
      const titles = dashboard.metrics.map((metric) => metric.title);
      if (current.length === 0) return titles;
      return [...current.filter((title) => titles.includes(title)), ...titles.filter((title) => !current.includes(title))];
    });
  }, [dashboard.metrics]);

  const orderedMetrics = useMemo(
    () => metricOrder.map((title) => dashboard.metrics.find((metric) => metric.title === title)).filter((metric) => metric !== undefined),
    [dashboard.metrics, metricOrder]
  );

  useEffect(() => {
    if (typeof window === "undefined" || metricOrder.length === 0) return;
    window.localStorage.setItem(metricOrderStorageKey, JSON.stringify(metricOrder));
  }, [metricOrder]);

  function reorderMetric(sourceTitle: string, targetTitle: string) {
    if (sourceTitle === targetTitle) return;

    setMetricOrder((current) => {
      const next = [...current];
      const sourceIndex = next.indexOf(sourceTitle);
      const targetIndex = next.indexOf(targetTitle);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const [source] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return next;
    });
    actions.track("dashboard.metric.reordered", { sourceTitle, targetTitle });
  }

  return (
    <Page>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        actions={
          <>
            <Button icon={<CalendarDays className="size-4" />} onPress={() => actions.runAction(t("common.today"), { description: "Filtro aplicado para a data atual." })}>
              {t("common.today")}
            </Button>
            <Button icon={<ArrowDownToLine className="size-4" />} onPress={() => actions.runAction(t("common.export"), { description: "Exportação mockada enviada para a fila de relatórios.", tone: "success" })} variant="primary">
              {t("common.export")}
            </Button>
          </>
        }
      />
      <p className="mp-sr-status">{t("dashboard.dragHelp")}</p>
      <div className="grid grid-cols-5 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {orderedMetrics.map((metric) => (
          <div
            key={metric.title}
            draggable
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", metric.title);
            }}
            onDrop={(event) => {
              event.preventDefault();
              reorderMetric(event.dataTransfer.getData("text/plain"), metric.title);
            }}
            title={t("dashboard.dragHelp")}
          >
            <MetricCard
              {...metric}
              onPress={() => actions.runAction(metric.title, { description: `Drill-down mockado para ${metric.title}.` })}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-5">
          <LineChart
            data={dashboard.chart}
            onRandomize={actions.randomizeReceivables}
            subtitle={t("dashboard.volumeSubtitle")}
            title={t("dashboard.volume")}
          />
          <Panel>
            <CardHeading
              action={<button className="text-mp-brand-primary underline" onClick={() => actions.runAction(t("common.viewAll"), { description: "Abriria todos os alertas do cockpit operacional." })} type="button">{t("common.viewAll")}</button>}
              title={t("dashboard.alerts")}
            />
            {dashboard.alerts.map((alert) => (
              <button
                key={alert.title}
                className="w-full rounded-lg border border-orange-200 bg-orange-50 p-5 text-left"
                onClick={() => actions.runAction(alert.title, { description: alert.description, tone: "warning" })}
                type="button"
              >
                <strong className="text-mp-content-strong">{alert.title}</strong>
                <p className="mb-1 text-mp-content-default">{alert.description}</p>
                <small>{alert.time}</small>
              </button>
            ))}
          </Panel>
        </div>
        <aside className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Panel className="text-center">
              <Button href="/transactions" onNavigate={navigate} onPress={() => actions.track("quicklink.transactions")}>
                {t("dashboard.quickTransactions")}
              </Button>
            </Panel>
            <Panel className="text-center">
              <Button href="/integrations" onNavigate={navigate} onPress={() => actions.track("quicklink.api")}>
                {t("dashboard.quickApi")}
              </Button>
            </Panel>
          </div>
          <Panel>
            <CardHeading title={t("dashboard.receivablesAgenda")} subtitle={t("dashboard.nextSettlements")} />
            <ul className="mt-4 grid gap-2 p-0">
              {dashboard.agenda.map((item) => (
                <li key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                  <span className="size-2 rounded-full bg-mp-brand-secondary" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button disabled={busyAction === t("common.randomize")} onPress={actions.randomizeReceivables}>
                {t("dashboard.advanceReceivables")}
              </Button>
            </div>
          </Panel>
          <Panel>
            <CardHeading
              action={<button className="text-mp-brand-primary underline" onClick={() => navigate("/transactions")} type="button">{t("common.viewAll")}</button>}
              title={t("dashboard.latestTransactions")}
            />
            <ul className="mt-4 grid gap-2 p-0">
              {dashboard.latestTransactions.map((transaction) => (
                <li key={transaction.customer} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                  <span className="size-2 rounded-full bg-mp-brand-secondary" />
                  <span><strong>{transaction.customer}</strong><br /><small>{transaction.method}</small></span>
                  <strong>{transaction.value}</strong>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
