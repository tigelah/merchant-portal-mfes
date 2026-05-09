import type { ComponentType } from "react";
import type { RemoteProps } from "@mp/shared-ui";

export type RemoteModule = {
  routes: string[];
  default: ComponentType<RemoteProps>;
};

export type RemoteDefinition = {
  id: string;
  label: string;
  context: string;
  routes: string[];
  framed: boolean;
  load: () => Promise<RemoteModule>;
};

export const remoteManifest: RemoteDefinition[] = [
  {
    id: "auth",
    label: "Acesso Seguro",
    context: "Acesso e autenticação",
    routes: ["/login", "/verify"],
    framed: false,
    load: () => import("../../auth/src/remoteEntry")
  },
  {
    id: "dashboard",
    label: "Home Dashboard",
    context: "Saúde do negócio",
    routes: ["/"],
    framed: true,
    load: () => import("../../dashboard/src/remoteEntry")
  },
  {
    id: "operations",
    label: "Operação (Transações)",
    context: "Operação",
    routes: ["/transactions"],
    framed: true,
    load: () => import("../../operations/src/remoteEntry")
  },
  {
    id: "finance",
    label: "Financeiro (Recebíveis)",
    context: "Financeiro",
    routes: ["/receivables"],
    framed: true,
    load: () => import("../../finance/src/remoteEntry")
  },
  {
    id: "integrations",
    label: "Integrações (API Keys)",
    context: "Técnico",
    routes: ["/integrations"],
    framed: true,
    load: () => import("../../integrations/src/remoteEntry")
  },
  {
    id: "admin",
    label: "Administração (Usuários)",
    context: "Administração",
    routes: ["/admin/users"],
    framed: true,
    load: () => import("../../admin/src/remoteEntry")
  },
  {
    id: "reports",
    label: "Relatórios",
    context: "Relatórios",
    routes: ["/reports"],
    framed: true,
    load: () => import("../../reports/src/remoteEntry")
  },
  {
    id: "settings",
    label: "Configurações",
    context: "Configurações",
    routes: ["/settings/account"],
    framed: true,
    load: () => import("../../settings/src/remoteEntry")
  }
];

export function resolveRemote(pathname: string): RemoteDefinition {
  return remoteManifest.find((remote) => remote.routes.includes(pathname)) ?? remoteManifest[1];
}
