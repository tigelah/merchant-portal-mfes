import { generateReceivables } from "@mp/mock-data";
import { json, options } from "../../_shared";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({})) as { seed?: number };
  return json(generateReceivables(payload.seed ?? Date.now()), {
    headers: { "cache-control": "no-store" }
  });
}

export function OPTIONS() {
  return options();
}
