import { json, options } from "../_shared";

export const runtime = "edge";

export async function POST(request: Request) {
  const event = await request.json().catch(() => ({}));

  return json({
    accepted: true,
    event,
    storedIn: "mock-analytics-buffer"
  }, {
    headers: { "cache-control": "no-store" }
  });
}

export function OPTIONS() {
  return options();
}
