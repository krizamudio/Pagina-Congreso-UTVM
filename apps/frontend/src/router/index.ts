import { defineRouter } from '#q-app';
import { routes as autoRoutes } from 'vue-router/auto-routes';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

const routes = [
  {
    path: '/registro_nsu',
    component: () => import('../pages/registro_nsu.vue'),
  },
  {
    path: '/registro_ems',
    component: () => import('../pages/registro_ems.vue'),
  },
  {
    path: '/registro_utvm',
    component: () => import('../pages/registro_utvm.vue'),
  },
  {
    path: '/registro_nsu/verificar',
    component: () => import('../pages/verificar_correo_nsu.vue'),
  },

  ...autoRoutes,
];

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  return Router;
});