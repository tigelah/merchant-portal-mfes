import { merchant } from "@mp/mock-data";
import { json, options } from "../../_shared";

export const runtime = "edge";

export async function GET() {
  return json({
    authenticated: true,
    merchant,
    roles: ["admin", "finance", "operations"],
    expiresIn: 900
  });
}

export async function POST() {
  return json({
    authenticated: true,
    merchant,
    mfaRequired: true,
    challengeId: "mock-challenge-489201"
  }, {
    headers: { "cache-control": "no-store" }
  });
}

export async function DELETE() {
  return json({ authenticated: false }, { headers: { "cache-control": "no-store" } });
}

export function OPTIONS() {
  return options();
}
