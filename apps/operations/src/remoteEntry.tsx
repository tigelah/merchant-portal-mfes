import { ArrowDownToLine, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@mp/mock-data";
import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, CardHeading, DataTable, IconButton, InfoList, Page, PageHeader, Panel, StatusBadge, Timeline } from "@mp/shared-ui";

export const routes = ["/transactions"];

function PaymentLogo({ brand }: { brand: Transaction["brand"] }) {
  if (brand === "pix") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-label="Pix" role="img">
        <path fill="#32BCAD" d="M7.8 3.8a3 3 0 0 1 4.3 0l1.5 1.5-2.2 2.2-1.5-1.5a.7.7 0 0 0-.9 0L6 9.1a.7.7 0 0 0 0 .9l3 3a.7.7 0 0 0 .9 0l1.5-1.5 2.2 2.2-1.5 1.5a3 3 0 0 1-4.3 0L3.8 11a3 3 0 0 1 0-4.3l4-3Z" />
        <path fill="#32BCAD" d="m16.2 3.8 4 4a3 3 0 0 1 0 4.3l-4 4a3 3 0 0 1-4.3 0l-1.5-1.5 2.2-2.2 1.5 1.5a.7.7 0 0 0 .9 0l3-3a.7.7 0 0 0 0-.9l-3-3a.7.7 0 0 0-.9 0l-1.5 1.5-2.2-2.2 1.5-1.5a3 3 0 0 1 4.3 0Z" />
      </svg>
    );
  }

  if (brand === "visa") {
    return (
      <svg className="h-4 w-7 shrink-0" viewBox="0 0 54 18" aria-label="Visa" role="img">
        <text x="1" y="14" fill="#1434CB" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" letterSpacing="-1">VISA</text>
      </svg>
    );
  }

  return (
    <svg className="h-4 w-7 shrink-0" viewBox="0 0 36 22" aria-label="Mastercard" role="img">
      <circle cx="14" cy="11" r="9" fill="#EB001B" />
      <circle cx="22" cy="11" r="9" fill="#F79E1B" fillOpacity="0.92" />
      <path fill="#FF5F00" d="M18 4.2a9 9 0 0 1 0 13.6 9 9 0 0 1 0-13.6Z" />
    </svg>
  );
}

function translatedStatus(status: string, locale: string) {
  if (locale === "en") {
    if (status === "Sucesso") return "Success";
    if (status === "Pendente") return "Pending";
    if (status === "Falha") return "Failed";
  }
  if (locale === "es") {
    if (status === "Sucesso") return "Éxito";
    if (status === "Pendente") return "Pendiente";
    if (status === "Falha") return "Falla";
  }
  return status;
}

function translatedRisk(risk: string, locale: string) {
  if (risk === "-") return risk;
  if (locale === "en") {
    if (risk === "Baixo Risco") return "Low Risk";
    if (risk === "Médio Risco") return "Medium Risk";
    if (risk === "Alto Risco") return "High Risk";
  }
  if (locale === "es") {
    if (risk === "Baixo Risco") return "Bajo Riesgo";
    if (risk === "Médio Risco") return "Riesgo Medio";
    if (risk === "Alto Risco") return "Alto Riesgo";
  }
  return risk;
}

function methodLabel(transaction: Transaction) {
  if (transaction.brand === "pix") return "PIX";
  if (transaction.brand === "visa") return `VISA ${transaction.cardLast4 ?? ""}`;
  return `Mastercard ${transaction.cardLast4 ?? ""}`;
}

export default function OperationsRemote() {
  const { locale, transactions } = usePortalState();
  const actions = usePortalActions();
  const t = useT();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const firstTransactionId = transactions[0]?.id;

  function openDetails(transaction: Transaction) {
    if (transaction.id !== firstTransactionId) return;
    setSelectedTransaction(transaction);
    setActionMenuId(null);
    actions.track("transaction.drilldown.opened", { id: transaction.id, brand: transaction.brand });
    window.requestAnimationFrame(() => document.getElementById("transaction-details")?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  return (
    <Page full>
      <PageHeader
        title={t("operations.title")}
        subtitle={t("operations.subtitle")}
        actions={
          <article className="flex gap-6 rounded-xl border border-mp-border-subtle bg-white px-5 py-3 shadow-sm">
            <button className="text-left" onClick={() => actions.runAction(t("operations.volumeToday"), { description: "Abriria breakdown por bandeira, canal e adquirente." })} type="button"><small>{t("operations.volumeToday")}</small><br /><strong>R$ 145.200,00</strong></button>
            <button className="text-left" onClick={() => actions.runAction(t("operations.approved"), { description: "Filtro aplicado para transações aprovadas." })} type="button"><small>{t("operations.approved")}</small><br /><strong className="text-mp-feedback-success">94.2%</strong></button>
            <button className="text-left" onClick={() => actions.runAction(t("operations.averageTicket"), { description: "Métrica recalculada no período selecionado." })} type="button"><small>{t("operations.averageTicket")}</small><br /><strong>R$ 245,50</strong></button>
          </article>
        }
      />
      <div className={selectedTransaction ? "grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5 max-[1500px]:grid-cols-1" : "grid"}>
        <div className="min-w-0">
          <Panel className="mb-5 flex flex-wrap items-center gap-3">
            {[
              t("operations.filters.last7"),
              t("operations.filters.status"),
              t("operations.filters.method"),
              t("operations.filters.channel")
            ].map((label) => (
              <button
                key={label}
                className="inline-flex min-h-9 items-center rounded-lg border border-mp-border-subtle bg-white px-4 font-bold"
                onClick={() => actions.runAction(label, { description: `Filtro mockado ${label} aplicado na tabela.` })}
                type="button"
              >
                {label}
              </button>
            ))}
            <button className="font-bold text-mp-brand-primary" onClick={() => actions.runAction(t("operations.filters.more"), { description: "Abriria drawer com status, método, canal, antifraude e faixa de valor." })} type="button">{t("operations.filters.more")}</button>
            <span className="ml-auto">
              <Button icon={<ArrowDownToLine className="size-4" />} onPress={() => actions.runAction(t("operations.exportCsv"), { description: "CSV mockado enviado para processamento assíncrono.", tone: "success" })} variant="primary">
                {t("operations.exportCsv")}
              </Button>
            </span>
          </Panel>
          <DataTable
            columns={[
              t("operations.columns.id"),
              t("operations.columns.date"),
              t("operations.columns.customer"),
              t("operations.columns.method"),
              t("operations.columns.value"),
              t("operations.columns.status"),
              t("operations.columns.risk"),
              t("operations.columns.actions")
            ]}
            rows={transactions.map((transaction, index) => [
              <strong>{transaction.id}</strong>,
              transaction.date,
              transaction.customer,
              <span className="inline-flex items-center gap-2"><PaymentLogo brand={transaction.brand} />{methodLabel(transaction)}</span>,
              <strong>{transaction.value}</strong>,
              <StatusBadge variant={transaction.statusVariant}>{translatedStatus(transaction.status, locale)}</StatusBadge>,
              transaction.risk === "-" ? "-" : <StatusBadge variant={transaction.riskVariant}>{translatedRisk(transaction.risk, locale)}</StatusBadge>,
              <div className="relative inline-flex">
                <IconButton
                  disabled={index !== 0}
                  label={`Ações ${transaction.id}`}
                  onPress={() => setActionMenuId((current) => current === transaction.id ? null : transaction.id)}
                >
                  <MoreHorizontal className="size-4" />
                </IconButton>
                {actionMenuId === transaction.id ? (
                  <div className="absolute right-0 top-12 z-20 grid w-36 rounded-lg border border-mp-border-subtle bg-white p-2 shadow-md">
                    <button
                      className="rounded-md px-3 py-2 text-left text-sm font-bold text-mp-content-strong hover:bg-slate-50"
                      onClick={() => openDetails(transaction)}
                      type="button"
                    >
                      {t("operations.details")}
                    </button>
                  </div>
                ) : null}
              </div>
            ])}
          />
        </div>
        {selectedTransaction ? (
        <Panel className="sticky top-24 max-[1500px]:static" id="transaction-details">
          {selectedTransaction ? (
            <>
              <CardHeading title={t("operations.details")} subtitle={selectedTransaction.id} />
              <button
                className="w-full rounded-xl border border-mp-border-subtle p-5 text-left"
                onClick={() => actions.runAction(t("operations.detail.status"), { description: "Abriria linha do tempo de autorização, captura e antifraude." })}
                type="button"
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span className="size-2 rounded-full bg-mp-brand-secondary" />
                  <span>{t("operations.detail.status")}<br /><strong>{translatedStatus(selectedTransaction.status, locale)}</strong></span>
                  <strong>{selectedTransaction.value}</strong>
                </div>
              </button>
              <InfoList
                items={[
                  { label: t("operations.detail.customer"), value: selectedTransaction.customer },
                  { label: t("operations.detail.document"), value: "***.456.789-**" },
                  { label: t("operations.detail.email"), value: `${selectedTransaction.customer.toLowerCase().split(" ")[0]}@email.com` },
                  { label: t("operations.detail.method"), value: methodLabel(selectedTransaction) },
                  { label: t("operations.detail.final"), value: selectedTransaction.cardLast4 ?? "PIX" },
                  { label: t("operations.detail.risk"), value: selectedTransaction.risk === "-" ? "-" : `${translatedRisk(selectedTransaction.risk, locale)} (Score 92)` }
                ]}
              />
              <Timeline
                items={[
                  { title: t("operations.timeline.captured"), description: t("operations.timeline.capturedCopy"), time: "24/08/2024 14:32:45" },
                  { title: t("operations.timeline.fraudApproved"), description: t("operations.timeline.fraudCopy"), time: "24/08/2024 14:32:12" },
                  { title: t("operations.timeline.created"), description: t("operations.timeline.createdCopy"), time: "24/08/2024 14:30:05" }
                ]}
              />
              <div className="mt-5 flex gap-3">
                <Button onPress={() => actions.runAction(t("operations.receipt"), { description: "PDF mockado gerado com trilha de auditoria.", tone: "success" })}>{t("operations.receipt")}</Button>
                <Button onPress={() => actions.runAction(t("operations.refund"), { description: "Fluxo exigiria justificativa e aprovação dupla antes de executar.", tone: "warning" })} variant="danger">{t("operations.refund")}</Button>
              </div>
            </>
          ) : (
            <p className="text-mp-content-muted">{t("operations.details.empty")}</p>
          )}
        </Panel>
        ) : null}
      </div>
    </Page>
  );
}
