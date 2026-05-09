export function corsHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "access-control-allow-origin": "http://127.0.0.1:4173",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-request-id",
    ...extra
  };
}

export function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(corsHeaders({ "cache-control": "s-maxage=15, stale-while-revalidate=60" }));

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }

  return Response.json(data, {
    ...init,
    headers
  });
}

export function options() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
