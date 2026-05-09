export const runtime = "edge";

export default function BffStatusPage() {
  return (
    <main style={{ fontFamily: "Inter, ui-sans-serif, system-ui", padding: 32 }}>
      <h1>Merchant Portal BFF</h1>
      <p>Edge-ready mock BFF ativo para autenticação, analytics, bootstrap e recebíveis aleatórios.</p>
      <ul>
        <li><code>GET /api/bootstrap</code></li>
        <li><code>POST /api/receivables/randomize</code></li>
        <li><code>GET|POST|DELETE /api/auth/session</code></li>
        <li><code>POST /api/events</code></li>
      </ul>
    </main>
  );
}
