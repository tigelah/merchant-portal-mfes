import { usePortalActions, usePortalState, useT } from "@mp/runtime";
import { Button, Field, InfoList, Page, PageHeader, Panel, StatusBadge } from "@mp/shared-ui";

export const routes = ["/settings/account"];

export default function SettingsRemote() {
  const { merchant, settings } = usePortalState();
  const actions = usePortalActions();
  const t = useT();

  return (
    <Page>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <nav className="mb-7 flex gap-5 overflow-x-auto border-b border-mp-border-subtle" aria-label="Configurações">
        {[t("settings.tabs.profile"), t("settings.tabs.notifications"), t("settings.tabs.security"), t("settings.tabs.merchant"), t("settings.tabs.bank")].map((tab, index) => (
          <button
            key={tab}
            className={`min-h-12 whitespace-nowrap border-0 border-b-4 bg-transparent font-bold ${index === 0 ? "border-mp-brand-primary text-mp-content-strong" : "border-transparent text-mp-content-muted"}`}
            onClick={() => actions.runAction(tab, { description: `Aba ${tab} selecionada em modo mock.` })}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 max-[1180px]:grid-cols-1">
        <div className="grid gap-5">
          <Panel>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("settings.personalInfo")}</h2>
            <p>{t("settings.personalInfoCopy")}</p>
            <div className="mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <Field label={t("settings.fullName")} onChange={(value) => actions.runAction("Nome atualizado", { description: value })} value={settings.profile.name} />
              <Field label="E-mail" onChange={(value) => actions.runAction("E-mail atualizado", { description: value })} value={settings.profile.email} />
              <Field label={t("settings.role")} onChange={(value) => actions.runAction("Cargo atualizado", { description: value })} value={settings.profile.role} />
              <Field label={t("settings.phone")} onChange={(value) => actions.runAction("Telefone atualizado", { description: value })} value={settings.profile.phone} />
            </div>
            <div className="mt-5 flex justify-end">
              <Button onPress={() => actions.runAction(t("settings.saveChanges"), { description: "Dados pessoais mockados persistidos no estado local.", tone: "success" })} variant="primary">{t("settings.saveChanges")}</Button>
            </div>
          </Panel>
          <Panel>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("settings.regional")}</h2>
            <p>{t("settings.regionalCopy")}</p>
            <div className="mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <Field label={t("settings.language")} onChange={(value) => actions.runAction(t("settings.language"), { description: value })} value={settings.preferences.language} />
              <Field label={t("settings.timezone")} onChange={(value) => actions.runAction(t("settings.timezone"), { description: value })} value={settings.preferences.timezone} />
              <Field label={t("settings.currency")} onChange={(value) => actions.runAction(t("settings.currency"), { description: value })} value={settings.preferences.currency} />
            </div>
            <div className="mt-5 flex justify-end">
              <Button onPress={() => actions.runAction(t("settings.savePreferences"), { description: "Preferências mockadas salvas com validade de cache local.", tone: "success" })} variant="primary">{t("settings.savePreferences")}</Button>
            </div>
          </Panel>
        </div>
        <aside className="grid gap-5">
          <Panel>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("settings.accountStatus")}</h2>
            <InfoList items={[{ label: t("settings.account"), value: merchant.name }, { label: t("settings.accessLevel"), value: "Administrador" }, { label: t("settings.kycStatus"), value: t("settings.approved") }, { label: t("settings.memberSince"), value: "15 de Março, 2024" }]} />
            <div className="mt-4"><StatusBadge>{t("settings.approved")}</StatusBadge></div>
          </Panel>
          <Panel>
            <h2 className="m-0 text-xl font-bold text-mp-content-strong">{t("settings.quickActions")}</h2>
            <ul className="grid gap-2 p-0">
              <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 py-3"><span className="size-2 rounded-full bg-mp-brand-primary" /><button className="text-left" onClick={() => actions.runAction(t("settings.changePassword"), { description: "Abriria fluxo com MFA e força mínima de senha." })} type="button">{t("settings.changePassword")}</button><strong>›</strong></li>
              <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3"><span className="size-2 rounded-full bg-mp-brand-secondary" /><button className="text-left" onClick={() => actions.runAction(t("settings.twoFactor"), { description: "Abriria método de autenticação, backup codes e trusted devices." })} type="button">{t("settings.twoFactor")}</button><strong>{t("common.active")}</strong></li>
            </ul>
          </Panel>
        </aside>
      </div>
    </Page>
  );
}
