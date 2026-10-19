<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-h6"> Congreso UTVM </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          :icon="isLight ? 'dark_mode' : 'light_mode'"
          :aria-label="isLight ? 'Activar modo oscuro' : 'Activar modo claro'"
          @click="toggleTheme"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="app-drawer"
    >
      <q-list padding>
        <q-item-label header class="drawer-title">
          Menú de Administrador
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.label"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container class="page-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EssentialLink, {
  type EssentialLinkProps
} from "@/components/EssentialLink.vue";
import { useThemeMode } from "@/composables/useThemeMode";

const { isLight, toggleTheme } = useThemeMode();

const linksList: EssentialLinkProps[] = [
  {
    label: "Dashboard de administrador",
    caption: "Resumen general",
    icon: "dashboard",
    link: "/admin/dashboard"
  },
  {
    label: "Página principal",
    caption: "Ir al sitio público",
    icon: "home",
    link: "/"
  },
  {
    label: "Participantes",
    caption: "Administración y validación",
    icon: "groups",
    link: "/participantes"
  },
  {
    label: "Conferencias",
    caption: "Gestión de conferencias",
    icon: "campaign",
    link: "/conferencias"
  },
  {
    label: "Congresos",
    caption: "Ediciones y periodos",
    icon: "event_available",
    link: "/congresos"
  },
  {
    label: "Ubicaciones",
    caption: "Espacios y capacidades",
    icon: "meeting_room",
    link: "/ubicaciones"
  },
  {
    label: "Talleres",
    caption: "Gestión de talleres",
    icon: "build",
    link: "/talleres"
  },
  {
    label: "Ponentes, panelistas y evaluadores",
    caption: "Gestión de perfiles de actividades",
    icon: "record_voice_over",
    link: "/ponentes"
  },
  {
    label: "Hackatón",
    caption: "Equipos, resultados y lotes",
    icon: "emoji_events",
    link: "/hackatones"
  },
  {
    label: "Reconocimientos",
    caption: "Emisión para ponentes y panelistas",
    icon: "workspace_premium",
    link: "/reconocimientos"
  },
  {
    label: "Foros empresariales",
    caption: "Gestión de foros empresariales",
    icon: "business_center",
    link: "/foros-empresariales"
  },
  {
    label: "Página oficial",
    caption: "Noticias, agenda y contenido",
    icon: "language",
    link: "/pagina-oficial"
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
