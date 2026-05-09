import { createPortalSnapshot } from "@mp/mock-data";
import { json, options } from "../_shared";

export const runtime = "edge";
export const revalidate = 15;

export async function GET() {
  return json(createPortalSnapshot(Date.now()));
}

export function OPTIONS() {
  return options();
}
