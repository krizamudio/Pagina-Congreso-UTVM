<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <q-toolbar-title> Congreso UTVM </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.label"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
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
    label: 'Registro de Participantes',
    caption: 'Externos',
    icon: 'how_to_reg',
    link: '/registro-externo',
  },
  {
    label: 'Registro NSU',
    caption: 'Formulario de registro',
    icon: 'school',
    link: '/registro_nsu',
  },
  {
    label: 'Registro EMS',
    caption: 'Participantes EMS',
    icon: 'groups',
    link: '/registro_ems',
  },
  {
    label: 'Registro UTVM',
    caption: 'Participantes UTVM',
    icon: 'account_balance',
    link: '/registro_utvm',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
