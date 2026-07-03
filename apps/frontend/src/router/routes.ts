import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/index.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('@/pages/index/(index).vue'),
      },
      {
        path: 'conferencias',
        component: () => import('@/pages/dashboards/ConferenciasPage.vue'),
      },
      {
        path: 'conferencias/nueva',
        component: () => import('@/pages/dashboards/NuevaConferenciaPage.vue'),
      },
      {
        path: 'conferencias/:id/editar',
        component: () => import('@/pages/dashboards/EditarConferenciaPage.vue'),
      },
      {
        path: 'ponentes',
        component: () => import('@/pages/dashboards/PonentesPage.vue'),
      },
      {
        path: 'ponentes/nueva',
        component: () => import('@/pages/dashboards/NuevaPonentePage.vue'),
      },
      {
        path: 'ponentes/:id/editar',
        component: () => import('@/pages/dashboards/EditarPonentePage.vue'),
      },
      {
        path: 'paneles',
        component: () => import('@/pages/dashboards/PanelesPage.vue'),
      },
      {
        path: 'paneles/nuevo',
        component: () => import('@/pages/dashboards/NuevaPanelPage.vue'),
      },
      {
        path: 'paneles/:id/editar',
        component: () => import('@/pages/dashboards/EditarPanelPage.vue'),
      },
      {
        path: 'talleres',
        component: () => import('@/pages/dashboards/TalleresPage.vue'),
      },
      {
        path: 'talleres/nuevo',
        component: () => import('@/pages/dashboards/NuevaTallerPage.vue'),
      },
      {
        path: 'talleres/:id/editar',
        component: () => import('@/pages/dashboards/EditarTallerPage.vue'),
      },
      {
        path: 'second',
        component: () => import('@/pages/index/second.vue'),
      },
    ],
  },
];

export default routes;
