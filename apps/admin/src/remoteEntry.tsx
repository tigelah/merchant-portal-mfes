import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, DataTable, Page, PageHeader, Panel, StatusBadge } from "@mp/shared-ui";

export const routes = ["/admin/users"];

function statusVariant(status: string): "positive" | "warning" | "failed" {
  if (status === "Ativo") return "positive";
  if (status === "Pendente") return "warning";
  return "failed";
}

function translateUserStatus(status: string, locale: string) {
  if (locale === "en") {
    if (status === "Ativo") return "Active";
    if (status === "Pendente") return "Pending";
    if (status === "Bloqueado") return "Blocked";
  }
  if (locale === "es") {
    if (status === "Ativo") return "Activo";
    if (status === "Pendente") return "Pendiente";
    if (status === "Bloqueado") return "Bloqueado";
  }
  return status;
}

function translateRole(role: string, locale: string) {
  if (locale === "en") {
    if (role === "Administrador") return "Administrator";
    if (role === "Operação") return "Operations";
    if (role === "Auditoria") return "Audit";
    if (role === "Suporte") return "Support";
  }
  if (locale === "es") {
    if (role === "Administrador") return "Administrador";
    if (role === "Operação") return "Operación";
    if (role === "Auditoria") return "Auditoría";
    if (role === "Suporte") return "Soporte";
  }
  return role;
}

export default function AdminRemote() {
  const { locale, users } = usePortalState();
  const actions = usePortalActions();
  const t = useT();

  return (
    <Page>
      <PageHeader
        actions={
          <>
            <Button onPress={() => actions.runAction(t("admin.exportAccess"), { description: "Exportação mockada com trilha LGPD e auditoria.", tone: "success" })}>{t("admin.exportAccess")}</Button>
            <Button onPress={() => actions.runAction(t("admin.inviteUser"), { description: "Convite mockado enviado com papel mínimo e expiração.", tone: "success" })} variant="primary">{t("admin.inviteUser")}</Button>
          </>
        }
        subtitle={t("admin.subtitle")}
        title={t("admin.title")}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-5">
          <DataTable
            columns={[t("admin.columns.user"), t("admin.columns.role"), t("finance.columns.status"), t("admin.columns.lastAccess"), t("operations.columns.actions")]}
            rows={users.map((user) => [
              <strong>{user.name}</strong>,
              translateRole(user.role, locale),
              <StatusBadge variant={statusVariant(user.status)}>{translateUserStatus(user.status, locale)}</StatusBadge>,
              user.lastAccess,
              <button className="text-mp-brand-primary underline" onClick={() => actions.runAction(`${t("common.edit")} ${user.name}`, { description: "Abriria perfil com papéis, MFA, sessão e auditoria." })} type="button">{t("common.edit")}</button>
            ])}
          />
          <Panel>
            <h2 className="m-0 mb-4 text-xl font-bold text-mp-content-strong">{t("admin.permissionsMatrix")}</h2>
            <DataTable
              columns={["Permissão", translateRole("Administrador", locale), translateRole("Operação", locale), translateRole("Auditoria", locale), translateRole("Suporte", locale)]}
              rows={[
                ["transactions.read", t("common.yes"), t("common.yes"), t("common.yes"), t("common.yes")],
                ["refunds.create", t("common.yes"), locale === "en" ? "Request" : locale === "es" ? "Solicitud" : "Solicitação", t("common.no"), t("common.no")],
                ["roles.write", t("common.yes"), t("common.no"), t("common.no"), t("common.no")],
                ["exports.request", t("common.yes"), t("common.yes"), t("common.yes"), t("common.no")]
              ]}
            />
          </Panel>
        </div>
        <aside className="grid gap-5">
          <Panel onPress={() => actions.runAction(t("admin.pendingApprovals"), { description: t("admin.pendingApprovalsCopy"), tone: "warning" })}>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("admin.pendingApprovals")}</h2>
            <p>{t("admin.pendingApprovalsCopy")}</p>
          </Panel>
          <Panel onPress={() => actions.runAction(t("admin.guardrail"), { description: t("admin.guardrailCopy") })}>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("admin.guardrail")}</h2>
            <p>{t("admin.guardrailCopy")}</p>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
