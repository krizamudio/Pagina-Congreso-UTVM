import { defineRouter } from "#q-app";
import routes from "./routes";

import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";

export default defineRouter((/* { store, ssrContext } */) => {
  normalizeLegacyQrHash();

  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  });

  return Router;
});

function normalizeLegacyQrHash(): void {
  if (typeof window === "undefined") return;

  const legacyPrefix = "#/acceso/qr/";
  if (!window.location.hash.startsWith(legacyPrefix)) return;

  const qrPath = window.location.hash.slice(1);
  window.history.replaceState(null, "", qrPath);
}
