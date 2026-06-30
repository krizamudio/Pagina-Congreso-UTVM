<template>
  <router-link v-if="isInternal" :to="link" class="essential-link-link">
    <q-item clickable v-ripple :class="['essential-link', activeClass]">
      <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ label }}</q-item-label>
        <q-item-label caption>{{ caption }}</q-item-label>
      </q-item-section>
    </q-item>
  </router-link>

  <q-item v-else clickable tag="a" :href="link" target="_blank" class="essential-link">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ label }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export interface EssentialLinkProps {
  label: string;
  caption?: string;
  link?: string;
  icon?: string;
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

const route = useRoute();

const isInternal = computed(() => {
  return typeof props.link === 'string' && props.link.startsWith('/');
});

const activeClass = computed(() => {
  return isInternal.value && route.path === props.link ? 'essential-link--active' : '';
});
</script>

<style scoped>
.essential-link-link {
  color: inherit;
  text-decoration: none;
}

.essential-link {
  color: #ffffff;
}

.essential-link .q-item-label,
.essential-link .q-item-label.caption {
  color: #ffffff;
}

.essential-link--active {
  background: rgba(0, 230, 118, 0.14);
}

.essential-link--active .q-item-label,
.essential-link--active .q-item-label.caption {
  color: #ffffff !important;
}
</style>
