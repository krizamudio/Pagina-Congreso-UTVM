import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/acceso/qr/:token",
    component: () => import("@/layouts/QrAccessLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("@/pages/QrAccessValidationPage.vue"),
      },
    ],
  },

  {
    path: "/",
    component: () => import("@/pages/public.vue"),
    children: [
      {
        path: "",
        component: () => import("@/pages/public_home.vue"),
      },
      {
        path: "agenda",
        component: () => import("@/pages/agenda/AgendaPage.vue"),
      },
      {
        path: "registro-externo",
        component: () => import("@/pages/index/registro-externo.vue"),
      },
      {
        path: "/talleres_u",
        component: () => import("@/pages/TalleresU/talleres.vue"),
      },
      {
        path: "/conferencias_u",
        component: () => import("@/pages/TalleresU/conferencias.vue"),
      },
      {
        path: "/conferencias_u/:id",
        component: () => import("@/pages/TalleresU/conferencia-detalle.vue"),
      },
      {
        path: "/panelistas_u",
        component: () => import("@/pages/TalleresU/panelistas.vue"),
      },
      {
        path: "/panelistas_u/:id",
        component: () => import("@/pages/TalleresU/Panelista-detalle.vue"),
      },
            {
        path: "/login",
        component: () => import("@/pages/login.vue"),
      },
      {
  path: 'mi-qr',
  component: () => import('@/pages/MiQr.vue'),
},
    ],
  },

  {
    path: "/registro_nsu",
    component: () => import("@/pages/registro_nsu.vue"),
  },
  {
    path: "/registro_ems",
    component: () => import("@/pages/registro_ems.vue"),
  },
  {
    path: "/registro_utvm",
    component: () => import("@/pages/registro_utvm.vue"),
  },
  {
    path: "/registro_nsu/verificar",
    component: () => import("@/pages/verificar_correo_nsu.vue"),
  },

  {
    path: "/admin",
    component: () => import("@/pages/index.vue"),
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        component: () => import("@/pages/index/(index).vue"),
      },

      {
        path: "congresos",
        alias: "/congresos",
        component: () => import("@/pages/dashboards/CongresosPage.vue"),
      },
      {
        path: "congresos/nuevo",
        alias: "/congresos/nuevo",
        component: () => import("@/pages/dashboards/CongresoEditorPage.vue"),
      },
      {
        path: "congresos/:id/editar",
        alias: "/congresos/:id/editar",
        component: () => import("@/pages/dashboards/CongresoEditorPage.vue"),
      },

      {
        path: "ubicaciones",
        alias: "/ubicaciones",
        component: () => import("@/pages/dashboards/UbicacionesPage.vue"),
      },
      {
        path: "ubicaciones/nueva",
        alias: "/ubicaciones/nueva",
        component: () => import("@/pages/dashboards/UbicacionEditorPage.vue"),
      },
      {
        path: "ubicaciones/:id/editar",
        alias: "/ubicaciones/:id/editar",
        component: () => import("@/pages/dashboards/UbicacionEditorPage.vue"),
      },

      {
        path: "participantes",
        alias: "/participantes",
        component: () => import("@/pages/dashboards/ParticipantesPage.vue"),
      },
      {
        path: "participantes/nsu/:id",
        alias: "/participantes/nsu/:id",
        component: () => import("@/pages/dashboards/RegistroNsuDetallePage.vue"),
      },

      {
        path: "conferencias",
        alias: "/conferencias",
        component: () => import("@/pages/dashboards/ConferenciasPage.vue"),
      },
      {
        path: "conferencias/nueva",
        alias: "/conferencias/nueva",
        component: () => import("@/pages/dashboards/NuevaConferenciaPage.vue"),
      },
      {
        path: "conferencias/:id/editar",
        alias: "/conferencias/:id/editar",
        component: () => import("@/pages/dashboards/EditarConferenciaPage.vue"),
      },

      {
        path: "ponentes",
        alias: "/ponentes",
        component: () => import("@/pages/dashboards/PonentesPage.vue"),
      },
      {
        path: "ponentes/nueva",
        alias: "/ponentes/nueva",
        component: () => import("@/pages/dashboards/NuevaPonentePage.vue"),
      },
      {
        path: "ponentes/:id/editar",
        alias: "/ponentes/:id/editar",
        component: () => import("@/pages/dashboards/EditarPonentePage.vue"),
      },
      {
        path: "reconocimientos",
        alias: "/reconocimientos",
        component: () => import("@/pages/dashboards/ReconocimientosPage.vue")
      },

      {
        path: "foros-empresariales",
        alias: "/foros-empresariales",
        component: () => import("@/pages/dashboards/ForosEmpresarialesPage.vue")
      },
      {
        path: "foros-empresariales/nuevo",
        alias: "/foros-empresariales/nuevo",
        component: () =>
          import("@/pages/dashboards/NuevoForoEmpresarialPage.vue")
      },
      {
        path: "foros-empresariales/:id/editar",
        alias: "/foros-empresariales/:id/editar",
        component: () =>
          import("@/pages/dashboards/EditarForoEmpresarialPage.vue")
      },

      {
        path: "paneles",
        alias: "/paneles",
        component: () => import("@/pages/dashboards/PanelesPage.vue"),
      },
      {
        path: "paneles/nuevo",
        alias: "/paneles/nuevo",
        component: () => import("@/pages/dashboards/NuevaPanelPage.vue"),
      },
      {
        path: "paneles/:id/editar",
        alias: "/paneles/:id/editar",
        component: () => import("@/pages/dashboards/EditarPanelPage.vue"),
      },

      {
        path: "talleres",
        alias: "/talleres",
        component: () => import("@/pages/dashboards/TalleresPage.vue"),
      },
      {
        path: "talleres/nuevo",
        alias: "/talleres/nuevo",
        component: () => import("@/pages/dashboards/NuevaTallerPage.vue"),
      },
      {
        path: "talleres/:id/editar",
        alias: "/talleres/:id/editar",
        component: () => import("@/pages/dashboards/EditarTallerPage.vue"),
      },

      {
        path: "second",
        alias: "/second",
        component: () => import("@/pages/index/second.vue"),
      },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    redirect: "/",
  },
];

export default routes;
