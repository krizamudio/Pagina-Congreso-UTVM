<template>
  <router-link v-if="isInternal" :to="link" class="essential-link-link">
    <q-item clickable v-ripple :class="['essential-link', activeClass]">
      <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" class="essential-link__icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label class="essential-link__label">{{ label }}</q-item-label>
        <q-item-label caption class="essential-link__caption">
          {{ caption }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </router-link>

  <q-item
    v-else
    clickable
    tag="a"
    :href="link"
    target="_blank"
    class="essential-link"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" class="essential-link__icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="essential-link__label">{{ label }}</q-item-label>
      <q-item-label caption class="essential-link__caption">
        {{ caption }}
      </q-item-label>
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
  link: '/',
  icon: '',
});

const route = useRoute();

const isInternal = computed(() => {
  return typeof props.link === 'string' && props.link.startsWith('/');
});

const activeClass = computed(() => {
  return isInternal.value && route.path === props.link
    ? 'essential-link--active'
    : '';
});
</script>

<style scoped>
.essential-link-link {
  color: inherit;
  text-decoration: none;
}

.essential-link {
  color: var(--drawer-item-text, #ffffff);
}

.essential-link__label,
.essential-link__icon {
  color: var(--drawer-item-text, #ffffff) !important;
}

.essential-link__caption {
  color: var(--drawer-caption-text, #aabdb7) !important;
  opacity: 1;
}

.essential-link--active {
  background: rgba(0, 230, 118, 0.14);
}

</style>
