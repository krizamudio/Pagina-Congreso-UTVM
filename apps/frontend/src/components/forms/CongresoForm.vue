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
        type="datetime-local"
        label="Fecha y hora de inicio"
        :rules="[required]"
      />
      <q-input
        v-model="form.fecha_fin"
        class="col-12 col-md-6"
        :dark="!isLight"
        dense
        type="datetime-local"
        label="Fecha y hora de fin"
        :rules="[required, validRange]"
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
const form = reactive({
  nombre: "",
  eslogan: "",
  ubicacion: "",
  fecha_inicio: "",
  fecha_fin: ""
});

const toLocalInput = (value: string) => {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

watch(
  () => props.initialData,
  value => {
    if (!value) return;
    Object.assign(form, {
      nombre: value.nombre,
      eslogan: value.eslogan,
      ubicacion: value.ubicacion,
      fecha_inicio: toLocalInput(value.fechaInicio),
      fecha_fin: toLocalInput(value.fechaFin)
    });
  },
  { immediate: true }
);

const required = (value: string) => !!value || "Este campo es obligatorio";
const validRange = () =>
  !form.fecha_inicio ||
  !form.fecha_fin ||
  new Date(form.fecha_fin) >= new Date(form.fecha_inicio) ||
  "La fecha final debe ser posterior a la inicial";
const submit = () =>
  emit("submit", {
    nombre: form.nombre,
    eslogan: form.eslogan,
    ubicacion: form.ubicacion,
    fecha_inicio: new Date(form.fecha_inicio).toISOString(),
    fecha_fin: new Date(form.fecha_fin).toISOString()
  });
</script>
