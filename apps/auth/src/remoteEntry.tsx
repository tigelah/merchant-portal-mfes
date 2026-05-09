import { ArrowLeft, ArrowRight, Mail, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { usePortalActions, useT } from "@mp/runtime";
import { Button, Field, Logo, type RemoteProps } from "@mp/shared-ui";

export const routes = ["/login", "/verify"];

function BrandPanel({
  copy,
  navigate,
  title
}: Pick<RemoteProps, "navigate"> & {
  title: string;
  copy: string;
}) {
  return (
    <section className="mp-auth-brand relative flex min-h-screen flex-col overflow-hidden p-14 text-white max-md:min-h-[360px] max-md:p-7 max-md:pt-28">
      <div className="absolute left-14 top-12 max-md:left-7 max-md:top-7">
        <Logo href="/login" onNavigate={navigate} />
      </div>
      <div className="mt-auto mb-[24vh] max-md:mb-14">
        <h1 className="mp-tracking-zero m-0 max-w-[520px] text-[42px] font-bold leading-[54px] max-md:text-[34px] max-md:leading-[42px]">
          {title}
        </h1>
        <p className="mt-5 max-w-[560px] text-lg leading-8 text-[#d4dce8]">
          {copy}
        </p>
        <div className="mt-12 flex gap-4" aria-hidden="true">
          <span className="h-1 w-5 rounded-full bg-[#174060]" />
          <span className="h-1 w-14 rounded-full bg-[#3b82f6]" />
          <span className="h-1 w-5 rounded-full bg-[#174060]" />
        </div>
      </div>
      <span className="absolute bottom-12 left-14 inline-flex items-center gap-2 text-sm text-[#a8b8cf] max-md:hidden">
        <ShieldCheck className="size-4" /> Ambiente Seguro & Criptografado
      </span>
    </section>
  );
}

function AuthPane({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[minmax(360px,35vw)_minmax(0,1fr)] bg-[#f7fafd] max-md:grid-cols-1">
      {children}
    </div>
  );
}

function FormColumn({ children }: { children: ReactNode }) {
  return (
    <section className="grid items-center justify-items-start p-10 pl-[clamp(64px,10vw,220px)] max-md:place-items-center max-md:p-6">
      {children}
    </section>
  );
}

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <article className="w-full max-w-[493px] rounded-xl border border-mp-border-subtle bg-white p-12 shadow-md max-md:p-8">
      {children}
    </article>
  );
}

function Login(props: RemoteProps) {
  const actions = usePortalActions();

  return (
    <AuthPane>
      <BrandPanel
        copy="Acesse seu painel para monitorar KPIs, conciliar transações e gerenciar recebíveis com segurança e precisão em tempo real."
        navigate={props.navigate}
        title="Gestão financeira corporativa de alta performance."
      />
      <FormColumn>
        <AuthCard>
          <h2 className="m-0 text-2xl font-bold text-mp-content-strong">Acesse sua conta</h2>
          <p className="mb-6 mt-2 text-mp-content-muted">Insira suas credenciais corporativas para continuar.</p>
          <form className="grid gap-5">
            <Field label="E-mail corporativo" value="nome@empresa.com.br" />
            <Field label="Senha" value="••••••••" type="password" />
            <div className="flex items-center justify-between gap-3 text-sm text-mp-content-muted">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" /> Lembrar sessão
              </label>
              <button
                className="text-mp-brand-primary underline"
                onClick={() => actions.runAction("Recuperar senha", { description: "Fluxo mockado de recuperação enviado para o e-mail informado." })}
                type="button"
              >
                Esqueci a senha
              </button>
            </div>
            <Button
              href="/verify"
              icon={<ArrowRight className="size-4" />}
              onNavigate={props.navigate}
              onPress={() => actions.track("auth.login.submitted", { method: "password", mock: true })}
              variant="primary"
            >
              Entrar no Portal
            </Button>
          </form>
          <div className="mt-9 border-t border-mp-border-subtle pt-8 text-center text-mp-content-muted">
            Problemas para acessar?{" "}
            <button
              className="font-bold text-mp-brand-primary"
              onClick={() => actions.runAction("Central de Ajuda", { description: "Abriria atendimento com Libras, chat e opção de leitura guiada." })}
              type="button"
            >
              Central de Ajuda
            </button>
          </div>
        </AuthCard>
      </FormColumn>
    </AuthPane>
  );
}

function Verify(props: RemoteProps) {
  const actions = usePortalActions();
  const t = useT();

  return (
    <AuthPane>
      <BrandPanel copy={t("auth.verify.brandCopy")} navigate={props.navigate} title={t("auth.verify.brandTitle")} />
      <section className="relative grid min-h-screen place-items-center px-10 py-12 max-md:px-6">
        <button
          className="absolute left-12 top-10 inline-flex items-center gap-2 text-sm font-bold text-mp-content-muted"
          onClick={() => props.navigate("/login")}
          type="button"
        >
          <ArrowLeft className="size-4" /> {t("auth.verify.back")}
        </button>
        <article className="w-full max-w-[430px] rounded-xl bg-[#071525] p-10 text-white shadow-md">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#0f2c55] text-[#3b82f6]">
            <Sparkles className="size-6" />
          </div>
          <div className="mt-8 text-center">
            <h2 className="m-0 text-2xl font-bold">{t("auth.verify.title")}</h2>
            <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-[#a8b8cf]">{t("auth.verify.copy")}</p>
            <span className="mt-3 inline-flex rounded-md bg-[#0f2c55] px-3 py-1 text-xs text-[#c7d2e6]">🔒 Acessando: {props.merchant.name}</span>
          </div>
          <div className="mt-9 flex items-end justify-between gap-4 text-xs text-[#a8b8cf]">
            <span>{t("auth.verify.code")}</span>
            <span>{t("auth.verify.sentByApp")}</span>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2" aria-label={t("auth.verify.code")}>
            {["2", "8", "4", "9", "1", "6"].map((digit, index) => (
              <input
                key={`${digit}-${index}`}
                className="h-12 rounded-md border border-[#194674] bg-[#0f2c55] text-center text-lg font-bold text-white outline-none focus:border-[#3b82f6]"
                defaultValue=""
                inputMode="numeric"
                maxLength={1}
                placeholder=" "
              />
            ))}
          </div>
          <div className="mt-9 grid gap-4">
            <Button
              href="/"
              icon={<ArrowRight className="size-4" />}
              onNavigate={props.navigate}
              onPress={() => actions.track("auth.mfa.verified", { channel: "device", mock: true })}
              variant="primary"
            >
              {t("auth.verify.submit")}
            </Button>
            <div className="border-t border-[#19314f] pt-4 text-center text-xs uppercase text-[#7890ac]">{t("auth.verify.otherWay")}</div>
            <p className="m-0 text-center text-xs text-[#8fa2bc]">{t("auth.verify.notReceived")}</p>
            <button className="grid min-h-14 grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg bg-[#0f2c55] px-4 text-left" onClick={() => actions.runAction(t("auth.verify.sms"), { description: "Código reenviado via SMS final ***4589.", tone: "success" })} type="button">
              <Smartphone className="size-4 text-[#91a7c4]" />
              <span><strong className="block">{t("auth.verify.sms")}</strong><small className="text-[#8fa2bc]">Final ***4589</small></span>
              <span>›</span>
            </button>
            <button className="grid min-h-14 grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg bg-[#0f2c55] px-4 text-left" onClick={() => actions.runAction(t("auth.verify.email"), { description: "Código reenviado para j***@acme.com.", tone: "success" })} type="button">
              <Mail className="size-4 text-[#91a7c4]" />
              <span><strong className="block">{t("auth.verify.email")}</strong><small className="text-[#8fa2bc]">r***@acme.com</small></span>
              <span>›</span>
            </button>
          </div>
        </article>
        <small className="absolute bottom-10 text-mp-content-subtle">© 2024 Merchant Portal. Todos os direitos reservados.</small>
      </section>
    </AuthPane>
  );
}

export default function AuthRemote(props: RemoteProps) {
  return props.pathname === "/verify" ? <Verify {...props} /> : <Login {...props} />;
}
