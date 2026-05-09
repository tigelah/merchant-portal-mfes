import type { ReactNode } from "react";

export const metadata = {
  title: "Merchant Portal BFF",
  description: "Mock BFF para apresentação do Portal Merchant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
