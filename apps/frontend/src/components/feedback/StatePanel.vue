<template>
  <q-banner :class="['text-white', bannerClass]" rounded>
    <template #avatar>
      <q-icon :name="icon" />
    </template>
    <div class="text-subtitle2 text-weight-bold">{{ title }}</div>
    <div class="text-caption">{{ description }}</div>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  description?: string;
  icon?: string;
  tone?: 'warning' | 'error' | 'info' | 'success';
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'info',
  tone: 'info',
});

const bannerClass = computed(() => {
  const toneMap: Record<string, string> = {
    warning: 'bg-warning',
    error: 'bg-negative',
    info: 'bg-info',
    success: 'bg-positive',
  };
  return toneMap[props.tone] || 'bg-info';
});
</script>
