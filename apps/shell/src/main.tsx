import "@mp/design-system/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PortalProvider } from "@mp/runtime";
import { ShellApp } from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <PortalProvider>
      <ShellApp />
    </PortalProvider>
  </StrictMode>
);
