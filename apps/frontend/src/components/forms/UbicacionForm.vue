<template>
  <q-form @submit.prevent="submit">
    <div class="row q-col-gutter-md">
      <q-input
        v-model.trim="form.nombre"
        class="col-12 col-md-8"
        :dark="!isLight"
        dense
        autofocus
        counter
        maxlength="150"
        label="Nombre"
        :rules="[required]"
      />
      <q-input
        v-model.number="form.capacidad"
        class="col-12 col-md-4"
        :dark="!isLight"
        dense
        type="number"
        min="1"
        label="Capacidad"
        :rules="[requiredNumber, positiveInteger]"
      />
    </div>
    <div class="row justify-end q-mt-md">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :loading="loading"
        :label="submitLabel"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useThemeMode } from "../../composables/useThemeMode";
import type { Ubicacion, UbicacionPayload } from "../../types";

const { isLight } = useThemeMode();

const props = withDefaults(
  defineProps<{
    initialData?: Ubicacion | null;
    loading?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialData: null,
    loading: false,
    submitLabel: "Guardar ubicación"
  }
);
const emit = defineEmits<{
  (event: "submit", payload: UbicacionPayload): void;
}>();
const form = reactive({ nombre: "", capacidad: 1 });
watch(
  () => props.initialData,
  value => {
    if (value) Object.assign(form, value);
  },
  { immediate: true }
);
const required = (value: string) => !!value || "Este campo es obligatorio";
const requiredNumber = (value: number | null) =>
  (value !== null && value !== undefined) || "Este campo es obligatorio";
const positiveInteger = (value: number) =>
  (Number.isInteger(Number(value)) && Number(value) >= 1) ||
  "Debe ser un entero mayor o igual a 1";
const submit = () =>
  emit("submit", { nombre: form.nombre, capacidad: Number(form.capacidad) });
</script>
