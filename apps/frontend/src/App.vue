<template>
  <router-view />
</template>

<script setup lang="ts">
import { useThemeMode } from './composables/useThemeMode';

const { initTheme } = useThemeMode();
initTheme();
</script>
