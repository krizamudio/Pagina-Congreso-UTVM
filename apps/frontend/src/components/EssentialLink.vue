<template>
  <q-item
    clickable
    v-bind="isExternal ? { tag: 'a', href: link, target: '_blank' } : { to: link, exact: true }"
  >
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
import { computed } from 'vue'

export interface EssentialLinkProps {
  label: string
  caption?: string
  link?: string
  icon?: string
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: ''
})

const isExternal = computed(() => /^https?:\/\//.test(props.link))
</script>
