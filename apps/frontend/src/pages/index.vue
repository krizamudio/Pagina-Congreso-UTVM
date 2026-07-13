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

const linksList: EssentialLinkProps[] = [
  {
    label: "Registro de Participantes",
    caption: "Externos",
    icon: "how_to_reg",
    link: "/registro-externo"
  },
  {
    label: "Registro NSU",
    caption: "Formulario de registro",
    icon: "school",
    link: "/registro_nsu"
  },
  {
    label: "Registro EMS",
    caption: "Participantes EMS",
    icon: "groups",
    link: "/registro_ems"
  },
  {
    label: "Registro UTVM",
    caption: "Participantes UTVM",
    icon: "account_balance",
    link: "/registro_utvm"
  },
  {
<<<<<<< HEAD
    label: "Conferencias",
    caption: "Gestión de conferencias",
    icon: "code",
    link: "/conferencias"
=======
    label: 'Participantes',
    caption: 'Administración y validación',
    icon: 'badge',
    link: '/participantes',
  },
  {
    label: 'Conferencias',
    caption: 'Gestión de conferencias',
    icon: 'code',
    link: '/conferencias',
>>>>>>> feature/rate-limit
  },
  {
    label: "Congresos",
    caption: "Ediciones y periodos",
    icon: "event",
    link: "/congresos"
  },
  {
    label: "Ubicaciones",
    caption: "Espacios y capacidades",
    icon: "place",
    link: "/ubicaciones"
  },
  {
    label: "Talleres",
    caption: "Gestión de talleres",
    icon: "chat",
    link: "/talleres"
  },
  {
    label: "Ponentes",
    caption: "Gestión de ponentes",
    icon: "record_voice_over",
    link: "/ponentes"
  },
  {
    label: "Paneles",
    caption: "Gestión de panelistas",
    icon: "rss_feed",
    link: "/paneles"
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
