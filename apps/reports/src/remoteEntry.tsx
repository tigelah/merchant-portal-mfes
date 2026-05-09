import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, DataTable, Field, Page, PageHeader, Panel, StatusBadge } from "@mp/shared-ui";

export const routes = ["/reports"];

function reportTitle(title: string, locale: string) {
  const map: Record<string, Record<string, string>> = {
    "Transações Detalhadas": { en: "Detailed Transactions", es: "Transacciones Detalladas" },
    "Recebíveis (Liquidações)": { en: "Receivables (Settlements)", es: "Cobranzas (Liquidaciones)" },
    "Chargebacks & Disputas": { en: "Chargebacks & Disputes", es: "Chargebacks y Disputas" },
    "Conciliação Financeira": { en: "Financial Reconciliation", es: "Conciliación Financiera" },
    Recebíveis: { en: "Receivables", es: "Cobranzas" }
  };
  return map[title]?.[locale] ?? title;
}

function reportCopy(copy: string, locale: string) {
  const map: Record<string, Record<string, string>> = {
    "Status, taxas, adquirente e metadados por transação.": {
      en: "Status, fees, acquirer and metadata by transaction.",
      es: "Estado, tasas, adquirente y metadatos por transacción."
    },
    "Valores liquidados, previstos e ajustes em conta corrente.": {
      en: "Settled values, forecasts and current-account adjustments.",
      es: "Valores liquidados, previstos y ajustes en cuenta corriente."
    },
    "Contestações, motivos de chargeback e resolução.": {
      en: "Disputes, chargeback reasons and resolution.",
      es: "Disputas, motivos de chargeback y resolución."
    },
    "Arquivo para ERP com vendas processadas vs. liquidadas.": {
      en: "ERP file comparing processed sales versus settlements.",
      es: "Archivo para ERP con ventas procesadas versus liquidadas."
    }
  };
  return map[copy]?.[locale] ?? copy;
}

function reportStatus(status: string, locale: string) {
  if (locale === "en") {
    if (status === "Concluído") return "Completed";
    if (status === "Falha Parcial") return "Partial Failure";
  }
  if (locale === "es") {
    if (status === "Concluído") return "Concluido";
    if (status === "Falha Parcial") return "Falla Parcial";
  }
  return status;
}

export default function ReportsRemote() {
  const { locale, reports } = usePortalState();
  const actions = usePortalActions();
  const t = useT();
  const selected = reports.templates.find((template) => template.selected) ?? reports.templates[0];

  return (
    <Page>
      <PageHeader
        actions={<Button onPress={() => actions.runAction(t("reports.schedules"), { description: "Abriria calendário de recorrências, SLA e entregas." })}>{t("reports.schedules")}</Button>}
        subtitle={t("reports.subtitle")}
        title={t("reports.title")}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-6">
          <section>
            <h2 className="mt-0 text-xl font-bold text-mp-content-strong">{t("reports.models")}</h2>
            <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
              {reports.templates.map((template) => (
                <Panel
                  key={template.title}
                  ariaLabel={`Selecionar ${template.title}`}
                  className={template.selected ? "border-mp-brand-primary" : ""}
                  onPress={() => actions.selectReportTemplate(template.title)}
                >
                  <div className="flex justify-between gap-4">
                    <div><h3 className="m-0 text-lg font-bold">{reportTitle(template.title, locale)}</h3><p>{reportCopy(template.copy, locale)}</p></div>
                    {template.selected ? <StatusBadge variant="info">{t("common.selected")}</StatusBadge> : null}
                  </div>
                </Panel>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-mp-content-strong">{t("reports.history")}</h2>
            <DataTable
              columns={[t("reports.columns.report"), t("reports.columns.period"), t("reports.columns.generated"), t("finance.columns.status")]}
              rows={reports.history.map((item) => [
                <><strong>{reportTitle(item.report, locale)}</strong><br /><small>{item.id}</small></>,
                item.period,
                item.generated,
                <StatusBadge variant={item.variant}>{reportStatus(item.status, locale)}</StatusBadge>
              ])}
            />
          </section>
        </div>
        <Panel>
          <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("reports.config")}</h2>
          <p>{reportTitle(selected.title, locale)}</p>
          <div className="mt-6 grid gap-4">
            <Field label={t("reports.field.period")} onChange={(value) => actions.runAction(t("reports.field.period"), { description: `Valor mockado alterado para ${value}.` })} value={t("reports.period.current")} />
            <Field label={t("reports.field.output")} onChange={(value) => actions.runAction(t("reports.field.output"), { description: `Formato escolhido: ${value}.` })} value="CSV" />
            <Field label={t("reports.field.transactionStatus")} onChange={(value) => actions.runAction(t("reports.field.transactionStatus"), { description: `Filtro escolhido: ${value}.` })} value={t("reports.all")} />
            <Field label={t("reports.field.method")} onChange={(value) => actions.runAction(t("reports.field.method"), { description: `Método escolhido: ${value}.` })} value={t("reports.all")} />
          </div>
          <div className="mt-5">
            <Button onPress={() => actions.runAction(t("reports.generate"), { description: "Relatório mockado entrou em fila BFF com cache e notificação.", tone: "success" })} variant="primary">
              {t("reports.generate")}
            </Button>
          </div>
        </Panel>
      </div>
    </Page>
  );
}
