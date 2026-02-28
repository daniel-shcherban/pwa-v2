/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const API_ORIGINS = [
  "https://jsonplaceholder.typicode.com",
  "https://69a15b962e82ee536fa0f03a.mockapi.io",
];
const CACHE_NAME = "api-cache";

async function writeToCache(
  request: Request,
  response: Response,
  cache: Cache,
): Promise<void> {
  const body = await response.text();
  const headers = [...response.headers] as [string, string][];
  const { status, statusText } = response;
  const results = await Promise.allSettled([
    cache.put(request, new Response(body, { headers, status, statusText })),
  ]);
  console.log(
    `[SW] cached ${request.url}`,
    results.map((r) => r.status),
  );
}

async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request.clone());
    if (response.ok || response.status === 0) {
      await writeToCache(request.clone(), response.clone(), cache);
    }
    return response;
  } catch {
    // Offline – fall back to Cache Storage
  }

  const fromCache = await cache.match(request);
  if (fromCache) return fromCache;

  return new Response(
    JSON.stringify({ error: "Offline – no cached data available" }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!API_ORIGINS.includes(url.origin)) return;
  event.respondWith(handleApiRequest(event.request));
});
