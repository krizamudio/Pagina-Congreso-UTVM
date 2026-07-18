<template>
  <q-form class="foro-form text-white" @submit.prevent="submit">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model.trim="form.nombre"
          :dark="!isLight"
          dense
          autofocus
          counter
          maxlength="200"
          label="Nombre del foro"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model.trim="form.direccion"
          :dark="!isLight"
          dense
          counter
          maxlength="255"
          label="Dirección"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="form.congreso_id"
          :options="congresoOptions"
          :dark="!isLight"
          dense
          emit-value
          map-options
          option-label="label"
          option-value="value"
          label="Congreso"
          :loading="catalogsLoading"
          :disable="catalogsLoading"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="form.ubicacion_id"
          :options="ubicacionOptions"
          :dark="!isLight"
          dense
          emit-value
          map-options
          option-label="label"
          option-value="value"
          label="Ubicación"
          :loading="catalogsLoading"
          :disable="catalogsLoading"
          :rules="[requiredRule]"
        />
      </div>

      <div v-if="catalogsError" class="col-12">
        <q-banner rounded class="bg-red-10 text-white">
          {{ catalogsError }}
          <template #action>
            <q-btn flat label="Reintentar" @click="loadCatalogs" />
          </template>
        </q-banner>
      </div>

      <div class="col-12">
        <q-input
          v-model.trim="form.resena"
          :dark="!isLight"
          dense
          autogrow
          counter
          maxlength="2000"
          type="textarea"
          label="Reseña"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12">
        <q-file
          v-model="selectedLogo"
          :dark="!isLight"
          dense
          clearable
          accept="image/*"
          :max-file-size="MAX_LOGO_SIZE"
          label="Logo del foro (opcional)"
          hint="Se convierte automáticamente a WebP; máximo 5 MB"
          @rejected="handleRejectedLogo"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
      </div>

      <div v-if="logoError" class="col-12 text-negative">
        {{ logoError }}
      </div>

      <div v-if="logoPreviewUrl" class="col-12 col-md-5">
        <q-card flat bordered class="logo-preview-card">
          <q-card-section>
            <div class="text-caption text-grey-5 q-mb-sm">
              {{ selectedLogo ? "Nuevo logo" : "Logo actual" }}
            </div>
            <img
              :src="logoPreviewUrl"
              alt="Vista previa del logo del foro"
              class="logo-preview"
            />
          </q-card-section>
        </q-card>
      </div>

      <div v-if="props.currentLogo && !selectedLogo" class="col-12">
        <q-checkbox
          v-model="eliminarLogo"
          :dark="!isLight"
          label="Eliminar el logo actual"
        />
      </div>
    </div>

    <div class="row justify-end q-mt-lg">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :loading="props.loading"
        :disable="catalogsLoading || !!catalogsError"
        :label="props.submitLabel"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useCongresosQuery } from "../../composables/useCongresosQuery";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import { useUbicacionesQuery } from "../../composables/useUbicacionesQuery";
import type {
  ForoEmpresarialFormSubmit,
  ForoEmpresarialLogo,
  ForoEmpresarialPayload
} from "../../types";

const { isLight } = useThemeMode();

const MAX_LOGO_SIZE = 5 * 1024 * 1024;

const props = withDefaults(
  defineProps<{
    initialData?: Partial<ForoEmpresarialPayload> | null;
    currentLogo?: ForoEmpresarialLogo | null;
    loading?: boolean;
    persistDraft?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialData: null,
    currentLogo: null,
    loading: false,
    persistDraft: false,
    submitLabel: "Guardar foro"
  }
);

const emit = defineEmits<{
  (event: "submit", payload: ForoEmpresarialFormSubmit): void;
}>();

const {
  data: congresos,
  error: congresosError,
  load: loadCongresos
} = useCongresosQuery();
const {
  data: ubicaciones,
  error: ubicacionesError,
  load: loadUbicaciones
} = useUbicacionesQuery();

const initialForm = {
  nombre: "",
  direccion: "",
  resena: "",
  congreso_id: "",
  ubicacion_id: ""
};
const { formData: form, clearForm } = useFormPersistence(
  "new-foro-empresarial-form",
  initialForm,
  {
    enabled: props.persistDraft,
    hydrateOnMounted: props.persistDraft
  }
);
const catalogsLoading = ref(false);
const selectedLogo = ref<File | null>(null);
const eliminarLogo = ref(false);
const logoError = ref<string | null>(null);
const localPreviewUrl = ref<string | null>(null);

const congresoOptions = computed(() =>
  congresos.value.map(congreso => ({
    label: congreso.nombre,
    value: congreso.id
  }))
);
const ubicacionOptions = computed(() =>
  ubicaciones.value.map(ubicacion => ({
    label: ubicacion.nombre,
    value: ubicacion.id
  }))
);
const catalogsError = computed(
  () => congresosError.value || ubicacionesError.value
);
const logoPreviewUrl = computed(() => {
  if (localPreviewUrl.value) return localPreviewUrl.value;
  return eliminarLogo.value ? null : props.currentLogo?.url || null;
});

watch(
  () => props.initialData,
  value => {
    Object.assign(form.value, {
      nombre: value?.nombre ?? "",
      direccion: value?.direccion ?? "",
      resena: value?.resena ?? "",
      congreso_id: value?.congreso_id ?? "",
      ubicacion_id: value?.ubicacion_id ?? ""
    });
  },
  { immediate: true, deep: true }
);

watch(selectedLogo, file => {
  logoError.value = null;
  revokeLocalPreview();

  if (!file) return;
  eliminarLogo.value = false;
  localPreviewUrl.value = URL.createObjectURL(file);
});

const requiredRule = (value: string) =>
  !!value?.trim() || "Este campo es obligatorio";

const revokeLocalPreview = () => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
  localPreviewUrl.value = null;
};

const handleRejectedLogo = () => {
  logoError.value = "Selecciona una imagen compatible de máximo 5 MB.";
};

const loadCatalogs = async () => {
  catalogsLoading.value = true;
  await Promise.all([loadCongresos(), loadUbicaciones()]);
  catalogsLoading.value = false;
};

const submit = () => {
  emit("submit", {
    foro: {
      nombre: form.value.nombre.trim(),
      direccion: form.value.direccion.trim(),
      resena: form.value.resena.trim(),
      congreso_id: form.value.congreso_id,
      ubicacion_id: form.value.ubicacion_id
    },
    logo: selectedLogo.value,
    eliminarLogo: eliminarLogo.value
  });
};

const clearDraft = () => {
  if (props.persistDraft) clearForm();
};

defineExpose({ clearDraft });

onMounted(() => void loadCatalogs());
onBeforeUnmount(revokeLocalPreview);
</script>

<style scoped>
.logo-preview-card {
  color: var(--text-main);
  background: var(--surface-strong);
  border-color: var(--surface-border);
}

.logo-preview {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: contain;
  border-radius: 8px;
}
</style>
