<template>
  <q-form @submit.prevent="submit">
    <div class="row q-col-gutter-md">
      <q-input
        v-model.trim="form.nombre"
        class="col-12 col-md-6"
        :dark="!isLight"
        dense
        autofocus
        counter
        maxlength="150"
        label="Nombre"
        :rules="[required]"
      />
      <q-input
        v-model.trim="form.eslogan"
        class="col-12 col-md-6"
        :dark="!isLight"
        dense
        counter
        maxlength="200"
        label="Eslogan"
        :rules="[required]"
      />
      <q-input
        v-model.trim="form.ubicacion"
        class="col-12"
        :dark="!isLight"
        dense
        counter
        maxlength="255"
        label="Ubicación general"
        :rules="[required]"
      />
      <q-input
        v-model="form.fecha_inicio"
        class="col-12 col-md-6"
        :dark="!isLight"
        dense
        type="date"
        label="Fecha de inicio"
        :rules="[required]"
      />
      <q-input
        v-model="form.fecha_fin"
        class="col-12 col-md-6"
        :dark="!isLight"
        dense
        type="date"
        label="Fecha de fin"
        :rules="[required, validRange]"
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
import type { Congreso, CongresoPayload } from "../../types";

const { isLight } = useThemeMode();

const props = withDefaults(
  defineProps<{
    initialData?: Congreso | null;
    loading?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialData: null,
    loading: false,
    submitLabel: "Guardar congreso"
  }
);
const emit = defineEmits<{
  (event: "submit", payload: CongresoPayload): void;
}>();

type CongresoFormData = CongresoPayload & Record<string, unknown>;

const defaultForm = (): CongresoFormData => ({
  nombre: "",
  eslogan: "",
  ubicacion: "",
  fecha_inicio: "",
  fecha_fin: ""
});

const toDateInput = (value: string) => value.slice(0, 10);

const initialForm = (): CongresoFormData => {
  if (!props.initialData) return defaultForm();

  return {
    nombre: props.initialData.nombre,
    eslogan: props.initialData.eslogan,
    ubicacion: props.initialData.ubicacion,
    fecha_inicio: toDateInput(props.initialData.fechaInicio),
    fecha_fin: toDateInput(props.initialData.fechaFin)
  };
};

const { formData: form, hydrateForm, clearForm } =
  useFormPersistence<CongresoFormData>(
    props.initialData
      ? `update-congreso-form-${props.initialData.id}`
      : "new-congreso-form",
    initialForm(),
    props.initialData
      ? {
          hydrateOnMounted: false,
          mergeStrategy: "base-over-saved"
        }
      : undefined
  );

watch(
  () => props.initialData,
  value => {
    if (!value) return;
    hydrateForm({
      nombre: value.nombre,
      eslogan: value.eslogan,
      ubicacion: value.ubicacion,
      fecha_inicio: toDateInput(value.fechaInicio),
      fecha_fin: toDateInput(value.fechaFin)
    });
  },
  { immediate: true }
);

const required = (value: string) => !!value || "Este campo es obligatorio";
const validRange = () =>
  !form.value.fecha_inicio ||
  !form.value.fecha_fin ||
  form.value.fecha_fin >= form.value.fecha_inicio ||
  "La fecha final debe ser posterior a la inicial";
const submit = () =>
  emit("submit", {
    nombre: form.value.nombre,
    eslogan: form.value.eslogan,
    ubicacion: form.value.ubicacion,
    fecha_inicio: `${form.value.fecha_inicio}T00:00:00.000Z`,
    fecha_fin: `${form.value.fecha_fin}T23:59:59.999Z`
  });

defineExpose({ clearDraft: clearForm });
</script>
