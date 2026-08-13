<template>
  <q-form class="admin-form" @submit.prevent="submit">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-select
          v-model="form.congreso_id"
          :options="congresos"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          dense
          :dark="!isLight"
          label="Congreso"
          :rules="[required]"
          :disable="loading"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model.trim="form.nombre"
          dense
          :dark="!isLight"
          counter
          maxlength="180"
          label="Nombre"
          :rules="[required]"
          :disable="loading"
        />
      </div>
      <div class="col-12">
        <q-input
          v-model.trim="form.descripcion"
          dense
          :dark="!isLight"
          type="textarea"
          autogrow
          counter
          maxlength="4000"
          label="Descripción"
          :rules="[required]"
          :disable="loading"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.fecha_inicio"
          dense
          :dark="!isLight"
          type="date"
          label="Fecha inicial"
          stack-label
          :rules="[required]"
          :disable="loading"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.fecha_fin"
          dense
          :dark="!isLight"
          type="date"
          label="Fecha final"
          stack-label
          :rules="[required]"
          :disable="loading"
        />
      </div>
    </div>

    <div class="row justify-end q-mt-lg">
      <q-btn
        unelevated
        type="submit"
        color="primary"
        label="Guardar datos generales"
        :loading="loading"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import type { Congreso, HackatonPayload } from "../../types";

const props = defineProps<{
  value: HackatonPayload;
  congresos: Congreso[];
  loading: boolean;
  persistDraft: boolean;
}>();
const emit = defineEmits<{ save: [value: HackatonPayload] }>();
const { isLight } = useThemeMode();
const {
  formData: form,
  clearForm,
  hydrateForm
} = useFormPersistence(
  "new-hackaton-form",
  { ...props.value },
  { enabled: props.persistDraft, hydrateOnMounted: props.persistDraft }
);

watch(
  () => props.value,
  value => {
    if (!props.persistDraft) hydrateForm(value);
  },
  { deep: true }
);

const required = (value: string) =>
  !!value?.trim() || "Este campo es obligatorio";
const submit = () => emit("save", { ...form.value });
const clearDraft = () => clearForm();

defineExpose({ clearDraft });
</script>
