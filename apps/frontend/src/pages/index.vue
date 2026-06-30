<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-h6">Pagina del Congreso</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="app-drawer">
      <q-list padding>
        <q-item-label header class="drawer-title">Menu de Administrador</q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.label" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container class="page-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from '@/components/EssentialLink.vue';

const linksList: EssentialLinkProps[] = [
  {
    label: 'Participantes',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    label: 'Conferencias',
    icon: 'code',
    link: '/conferencias',
  },
  {
    label: 'Talleres',
    icon: 'chat',
    link: '/talleres',
  },
  {
    label: 'Ponentes',
    icon: 'record_voice_over',
    link: '/ponentes',
  },
  {
    label: 'Panelelista',
    icon: 'rss_feed',
    link: '/paneles',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>