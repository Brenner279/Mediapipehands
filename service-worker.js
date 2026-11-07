const CACHE_VERSION = "libras-pwa-v1";
const CORE_CACHE = CACHE_VERSION + "-core";
const RUNTIME_CACHE = CACHE_VERSION + "-runtime";

const CORE_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", letter => "./referencias-libras/" + letter + ".jpg")
];

const REMOTE_ASSETS = [
  {
    local: "./__mediapipe__/vision_bundle.mjs",
    remote: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/vision_bundle.mjs"
  },
  {
    local: "./__mediapipe__/wasm/vision_wasm_internal.js",
    remote: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm/vision_wasm_internal.js"
  },
  {
    local: "./__mediapipe__/wasm/vision_wasm_internal.wasm",
    remote: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm/vision_wasm_internal.wasm"
  },
  {
    local: "./__mediapipe__/wasm/vision_wasm_nosimd_internal.js",
    remote: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm/vision_wasm_nosimd_internal.js"
  },
  {
    local: "./__mediapipe__/wasm/vision_wasm_nosimd_internal.wasm",
    remote: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm/vision_wasm_nosimd_internal.wasm"
  },
  {
    local: "./__mediapipe__/hand_landmarker.task",
    remote: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
  }
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE_CACHE);
    await core.addAll(CORE_FILES.map(path => new Request(new URL(path, self.registration.scope))));

    const runtime = await caches.open(RUNTIME_CACHE);
    for (const asset of REMOTE_ASSETS) {
      const response = await fetch(asset.remote, { mode: "cors", credentials: "omit" });
      if (!response.ok || response.type === "opaque") {
        throw new Error("Falha ao baixar recurso necessário para uso offline: " + asset.remote);
      }
      const localUrl = new URL(asset.local, self.registration.scope);
      await runtime.put(new Request(localUrl.href), response);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("libras-pwa-") &&
      key !== CORE_CACHE && key !== RUNTIME_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);

  if (url.origin !== scopeUrl.origin || !url.pathname.startsWith(scopeUrl.pathname)) return;

  event.respondWith((async () => {
    const runtime = await caches.open(RUNTIME_CACHE);
    const runtimeMatch = await runtime.match(request, { ignoreSearch: true });
    if (runtimeMatch) return runtimeMatch;

    const core = await caches.open(CORE_CACHE);
    const coreMatch = await core.match(request, { ignoreSearch: true });
    if (coreMatch) return coreMatch;

    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        await core.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response("Este recurso não está disponível offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
