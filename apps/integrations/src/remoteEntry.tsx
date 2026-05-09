import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, DataTable, MetricCard, Page, PageHeader, Panel, StatusBadge, Timeline } from "@mp/shared-ui";

export const routes = ["/integrations"];

function translateWebhookStatus(status: string, locale: string) {
  if (locale === "en") {
    if (status === "Entregue") return "Delivered";
    if (status === "Falha") return "Failed";
  }
  if (locale === "es") {
    if (status === "Entregue") return "Entregado";
    if (status === "Falha") return "Falla";
  }
  return status;
}

export default function IntegrationsRemote() {
  const { integrations, locale } = usePortalState();
  const actions = usePortalActions();
  const t = useT();

  return (
    <Page>
      <PageHeader
        actions={
          <>
            <Button onPress={() => actions.runAction(t("integrations.docs"), { description: "Abriria referência de API, webhooks, idempotência e retry." })}>{t("integrations.docs")}</Button>
            <Button onPress={() => actions.runAction(t("integrations.newKey"), { description: "Criaria chave sandbox mockada com rotação sugerida.", tone: "success" })} variant="primary">{t("integrations.newKey")}</Button>
          </>
        }
        subtitle={t("integrations.subtitle")}
        title={t("integrations.title")}
      />
      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
        {integrations.health.map((metric) => (
          <MetricCard key={metric.title} {...metric} onPress={() => actions.runAction(metric.title, { description: "Abriria healthcheck, SLO, latência e erros por endpoint." })} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-5">
          <DataTable
            columns={["ID", t("integrations.columns.event"), t("integrations.columns.endpoint"), t("finance.columns.status"), t("integrations.columns.action")]}
            rows={integrations.logs.map((log) => [
              <strong>{log.id}</strong>,
              log.event,
              <code>{log.endpoint}</code>,
              <StatusBadge variant={log.statusVariant}>{translateWebhookStatus(log.status, locale)}</StatusBadge>,
              log.statusVariant === "failed"
                ? <Button onPress={() => actions.runAction(t("integrations.reprocess"), { description: `${log.id} reenfileirado com backoff exponencial.`, tone: "success" })} variant="danger">{t("integrations.reprocess")}</Button>
                : <button className="text-mp-brand-primary underline" onClick={() => actions.runAction(t("integrations.viewPayload"), { description: `Payload mockado de ${log.id} exibido em modal seguro.` })} type="button">{t("integrations.viewPayload")}</button>
            ])}
          />
          <Panel>
            <Timeline
              items={[
                { title: locale === "en" ? "Recurring webhook failure" : locale === "es" ? "Falla recurrente de webhook" : "Webhook com falha recorrente", description: locale === "en" ? "Endpoint returned 500 in three attempts." : locale === "es" ? "El endpoint devolvió 500 en tres intentos." : "Endpoint retornou 500 em três tentativas.", time: locale === "en" ? "12 minutes ago" : locale === "es" ? "Hace 12 minutos" : "Há 12 minutos" },
                { title: locale === "en" ? "New key created" : locale === "es" ? "Nueva clave creada" : "Nova chave criada", description: locale === "en" ? "Sandbox key created by Rodrigo Oliveira." : locale === "es" ? "Clave sandbox creada por Rodrigo Oliveira." : "Chave de sandbox criada por Rodrigo Oliveira.", time: locale === "en" ? "Today, 09:20" : locale === "es" ? "Hoy, 09:20" : "Hoje, 09:20" },
                { title: locale === "en" ? "Rotation recommended" : locale === "es" ? "Rotación recomendada" : "Rotação recomendada", description: locale === "en" ? "Production key reaches 90 days soon." : locale === "es" ? "La clave de producción cumple 90 días pronto." : "Chave de produção completa 90 dias em breve.", time: locale === "en" ? "Yesterday, 18:02" : locale === "es" ? "Ayer, 18:02" : "Ontem, 18:02" }
              ]}
            />
          </Panel>
        </div>
        <aside className="grid gap-5">
          <Panel>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("integrations.productionKeys")}</h2>
            <ul className="grid gap-2 p-0">
              {["payments-live", "refunds-live", "legacy-checkout"].map((keyName) => (
                <li key={keyName} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                  <span className="size-2 rounded-full bg-mp-brand-secondary" />{keyName}<strong>{t("common.active")}</strong>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel onPress={() => actions.runAction(t("integrations.retryPolicy"), { description: t("integrations.retryPolicyCopy") })}>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("integrations.retryPolicy")}</h2>
            <p>{t("integrations.retryPolicyCopy")}</p>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
