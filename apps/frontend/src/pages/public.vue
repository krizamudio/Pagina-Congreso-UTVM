<template>
  <q-layout view="lHh Lpr lFf" class="public-layout">
    <q-header elevated class="public-header">
      <q-toolbar>
        <q-toolbar-title>Congreso UTVM</q-toolbar-title>

        <q-btn
          flat
          dense
          round
          :icon="isLight ? 'dark_mode' : 'light_mode'"
          :aria-label="isLight ? 'Activar modo oscuro' : 'Activar modo claro'"
          @click="toggleTheme"
        />

        <q-btn flat no-caps label="Inicio" to="/" />
        <q-btn flat no-caps label="Registro Externo" to="/registro-externo" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useThemeMode } from '@/composables/useThemeMode';

const { isLight, toggleTheme } = useThemeMode();
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #032f2f, #054b45);
}

.public-header {
  background: rgba(5, 30, 30, 0.95);
  color: white;
}
</style>