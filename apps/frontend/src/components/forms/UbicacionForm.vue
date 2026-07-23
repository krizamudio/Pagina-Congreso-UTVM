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
        :max="MAX_CAPACIDAD"
        label="Capacidad"
        :rules="[requiredNumber, positiveInteger, maximumCapacity]"
      />
    </div>
    <div class="row justify-end q-mt-md">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :loading="loading"
        :disable="loading"
        :label="submitLabel"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import type { Ubicacion, UbicacionPayload } from "../../types";

const { isLight } = useThemeMode();
const MAX_CAPACIDAD = 2_147_483_647;

const props = withDefaults(
  defineProps<{
    initialData?: Ubicacion | null;
    loading?: boolean;
    persistDraft?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialData: null,
    loading: false,
    persistDraft: false,
    submitLabel: "Guardar ubicación"
  }
);
const emit = defineEmits<{
  (event: "submit", payload: UbicacionPayload): void;
}>();

const { formData: form, clearForm } = useFormPersistence<UbicacionPayload>(
  "new-ubicacion-form",
  { nombre: "", capacidad: 1 },
  {
    enabled: props.persistDraft,
    hydrateOnMounted: props.persistDraft
  }
);

watch(
  () => props.initialData,
  value => {
    if (value) {
      form.value.nombre = value.nombre;
      form.value.capacidad = value.capacidad;
    }
  },
  { immediate: true }
);

const required = (value: string) => !!value || "Este campo es obligatorio";
const requiredNumber = (value: number | null) =>
  (value !== null && value !== undefined) || "Este campo es obligatorio";
const positiveInteger = (value: number) =>
  (Number.isInteger(Number(value)) && Number(value) >= 1) ||
  "Debe ser un entero mayor o igual a 1";
const maximumCapacity = (value: number) =>
  Number(value) <= MAX_CAPACIDAD ||
  `La capacidad no puede ser mayor a ${MAX_CAPACIDAD.toLocaleString("es-MX")}`;

const submit = () =>
  emit("submit", {
    nombre: form.value.nombre.trim(),
    capacidad: Number(form.value.capacidad)
  });

const clearDraft = () => {
  if (props.persistDraft) clearForm();
};

defineExpose({ clearDraft });
</script>
