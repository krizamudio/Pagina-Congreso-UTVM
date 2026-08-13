<template>
  <q-form @submit.prevent="submit" class="update-ponente-form">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.nombre"
          label="Nombre"
          :rules="[requiredRule]"
          dense
          autofocus
          :dark="!isLight"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.institucion"
          label="Institución"
          :rules="[requiredRule]"
          dense
          :dark="!isLight"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="form.tipo"
          :options="tipoOptions"
          label="Tipo"
          :rules="[requiredRule]"
          dense
          emit-value
          map-options
          :dark="!isLight"
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="form.semblanza"
          label="Semblanza"
          :rules="[requiredRule]"
          type="textarea"
          autogrow
          dense
          :dark="!isLight"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.tema"
          label="Tema"
          :rules="[requiredRule]"
          dense
          :dark="!isLight"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-toggle
          v-model="form.visible_publico"
          label="Visible públicamente"
          :dark="!isLight"
        />
      </div>

      <div class="col-12">
        <q-file
          v-model="selectedImage"
          label="Actualizar foto del ponente o panelista"
          hint="La nueva foto se convierte a WebP antes de reemplazar la actual"
          accept="image/*"
          clearable
          dense
          :dark="!isLight"
          @update:model-value="handleImageChange"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
      </div>

      <div v-if="displayedPreviewUrl" class="col-12 col-md-6">
        <q-card flat bordered class="image-preview-card">
          <q-card-section>
            <div class="text-caption q-mb-sm">{{
              selectedImage ? "Vista previa" : "Foto actual"
            }}</div>
            <img
              :src="displayedPreviewUrl"
              alt="Vista previa de foto del ponente o panelista"
              class="image-preview"
            />
            <div v-if="selectedImage" class="text-caption q-mt-sm text-grey-5">
              Archivo: {{ selectedImage.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="!selectedImage" class="col-12 text-caption text-grey-5">
        {{
          props.currentPhotoUrl
            ? "Foto actual cargada"
            : "Sin foto actual registrada"
        }}
      </div>

      <div v-if="imageError" class="col-12 text-negative">{{ imageError }}</div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        :label="props.loading ? 'Actualizando...' : 'Actualizar participante'"
        type="submit"
        :loading="props.loading"
        :disable="props.loading"
      />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import type { PonentePayload, PonenteTipo } from "../../types";

const { isLight } = useThemeMode();

interface Props {
  loading?: boolean;
  initialData: Partial<PonentePayload>;
  currentPhotoUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPhotoUrl: ""
});

const emit = defineEmits<{
  (e: "submit", payload: { ponente: PonentePayload; foto: File | null }): void;
}>();

const error = ref<string | null>(null);
const imageError = ref<string | null>(null);
const selectedImage = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);
const tipoOptions: { label: string; value: PonenteTipo }[] = [
  { label: "Ponente", value: "Ponente" },
  { label: "Panelista", value: "Panelista" },
  { label: "Evaluador", value: "Evaluador" }
];
const displayedPreviewUrl = computed(
  () => imagePreviewUrl.value || props.currentPhotoUrl || null
);

function generateUUID() {
  return "00000000-0000-4000-8000-000000000000";
}

const defaultForm = (): PonentePayload => ({
  nombre: "",
  usuario_id: generateUUID(),
  archivo_foto_id: "",
  institucion: "",
  tipo: "Ponente",
  semblanza: "",
  tema: "",
  visible_publico: true
});

const { formData: form, hydrateForm } = useFormPersistence<PonentePayload>(
  "update-ponente-form",
  defaultForm(),
  {
    hydrateOnMounted: false,
    mergeStrategy: "base-over-saved"
  }
);

const syncForm = () => {
  hydrateForm({
    ...defaultForm(),
    ...props.initialData,
    visible_publico: props.initialData?.visible_publico ?? true
  });
};

watch(
  () => props.initialData,
  () => {
    syncForm();
  },
  { immediate: true, deep: true }
);

const requiredRule = (value?: string | null) =>
  (value?.trim().length ?? 0) > 0 || "Este campo es obligatorio";

const revokePreviewUrl = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }

  imagePreviewUrl.value = null;
};

const handleImageChange = (file: File | null) => {
  imageError.value = null;
  revokePreviewUrl();

  if (!file) {
    selectedImage.value = null;
    return;
  }

  selectedImage.value = file;
  imagePreviewUrl.value = URL.createObjectURL(file);
};

const submit = () => {
  if (props.loading) {
    return;
  }

  error.value = null;

  emit("submit", {
    ponente: { ...form.value },
    foto: selectedImage.value
  });
};

onBeforeUnmount(() => {
  revokePreviewUrl();
});
</script>

<style scoped>
.image-preview-card {
  color: var(--text-main);
  background: var(--surface-strong);
  border-color: var(--surface-border);
}

.image-preview {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 8px;
}
</style>
