const CHUNK_PUBLIC_PATH = "server/app/_not-found/page.js";
const runtime = require("../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/[project]__cd162a._.js");
runtime.loadChunk("server/chunks/ssr/[project]_packages_web_9dfabe._.js");
runtime.getOrInstantiateRuntimeModule("[project]/packages/web/.next-internal/server/app/_not-found/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/packages/web/node_modules/next/dist/esm/build/templates/app-page.js?page=/_not-found/page { COMPONENT_0 => \"[project]/packages/web/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/packages/web/node_modules/next/dist/client/components/not-found-error.js [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
