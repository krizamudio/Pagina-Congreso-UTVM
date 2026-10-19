<template>
  <div>
    <q-select
      v-model="form.ids"
      :options="options"
      option-value="id"
      option-label="nombre"
      emit-value
      map-options
      multiple
      use-chips
      dense
      :dark="!isLight"
      label="Evaluadores"
      hint="Selecciona perfiles registrados con tipo Evaluador"
      :disable="loading"
    />

    <q-banner v-if="blockedNames.length" rounded class="admin-warning q-mt-md">
      <template #avatar><q-icon name="lock" color="warning" /></template>
      Con reconocimiento emitido: {{ blockedNames.join(", ") }}
    </q-banner>

    <div class="row justify-between q-gutter-sm q-mt-lg">
      <q-btn
        outline
        color="primary"
        icon="download"
        label="ZIP evaluadores"
        :loading="downloading"
        :disable="loading || !assignments.length"
        @click="$emit('download')"
      />
      <q-btn
        unelevated
        color="primary"
        label="Guardar evaluadores"
        :loading="loading"
        :disable="loading"
        @click="$emit('save', [...form.ids])"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import type { HackatonEvaluador, Ponente } from "../../types";

const props = defineProps<{
  options: Ponente[];
  assignments: HackatonEvaluador[];
  loading: boolean;
  downloading: boolean;
  persistenceKey: string;
}>();
defineEmits<{ save: [ids: string[]]; download: [] }>();
const { isLight } = useThemeMode();
const { formData: form, clearForm } = useFormPersistence(props.persistenceKey, {
  ids: props.assignments.map(item => item.ponente.id)
});
const blockedNames = computed(() =>
  props.assignments
    .filter(item => item.bloqueado)
    .map(item => item.ponente.nombre)
);

watch(
  () => props.assignments,
  value => {
    form.value.ids = value.map(item => item.ponente.id);
  },
  { deep: true }
);

const clearDraft = () => clearForm();
defineExpose({ clearDraft });
</script>
