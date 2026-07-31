import { defaultCache } from "@serwist/next/worker";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: Array<string> | undefined;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    skipWaiting(): Promise<void>;
    clients: { claim(): Promise<void> };
    location: Location;
  }
}

declare const self: WorkerGlobalScope;

self.addEventListener("install", (event: any) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event: any) => {
  if (event.request.method !== "GET") return;

  event.respondWith(fetch(event.request));
});
