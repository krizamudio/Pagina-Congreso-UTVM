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
          dark
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input v-model="form.institucion" label="Institución" dense dark />
      </div>

      <div class="col-12">
        <q-input v-model="form.semblanza" label="Semblanza" type="textarea" autogrow dense dark />
      </div>

      <div class="col-12 col-md-6">
        <q-input v-model="form.tema" label="Tema" dense dark />
      </div>

      <div class="col-12 col-md-6">
        <q-toggle v-model="form.visible_publico" label="Visible públicamente" dark />
      </div>

      <div class="col-12">
        <q-file
          v-model="selectedImage"
          label="Actualizar foto del ponente"
          hint="Si seleccionas un archivo, se enviará como reemplazo"
          accept="image/*"
          clearable
          dense
          dark
          @update:model-value="handleImageChange"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
      </div>

      <div v-if="imagePreviewUrl" class="col-12 col-md-6">
        <q-card flat bordered class="image-preview-card bg-grey-10">
          <q-card-section>
            <div class="text-caption q-mb-sm">Vista previa</div>
            <img :src="imagePreviewUrl" alt="Vista previa de foto de ponente" class="image-preview" />
            <div v-if="selectedImage" class="text-caption q-mt-sm text-grey-5">
              Archivo: {{ selectedImage.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="form.archivo_foto_id" class="col-12 text-caption text-grey-5">
        Foto actual: {{ form.archivo_foto_id }}
      </div>

      <div v-if="imageError" class="col-12 text-negative">{{ imageError }}</div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        label="Actualizar ponente"
        type="submit"
        :loading="props.loading"
      />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useFormPersistence } from '../../composables/useFormPersistence';
import type { PonentePayload } from '../../types';

interface Props {
  loading?: boolean;
  initialData: Partial<PonentePayload>;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', payload: { ponente: PonentePayload; foto: File | null }): void;
}>();

const error = ref<string | null>(null);
const imageError = ref<string | null>(null);
const selectedImage = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const defaultForm = (): PonentePayload => ({
  nombre: '',
  usuario_id: generateUUID(),
  archivo_foto_id: generateUUID(),
  institucion: '',
  semblanza: '',
  tema: '',
  visible_publico: true,
});

const { formData: form, hydrateForm } = useFormPersistence<PonentePayload>('update-ponente-form', defaultForm(), {
  hydrateOnMounted: false,
});

const syncForm = () => {
  hydrateForm({
    ...defaultForm(),
    ...props.initialData,
    visible_publico: props.initialData?.visible_publico ?? true,
  });
};

watch(
  () => props.initialData,
  () => {
    syncForm();
  },
  { immediate: true, deep: true },
);

const requiredRule = (value: string) => !!value || 'Este campo es obligatorio';

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
  error.value = null;

  emit('submit', {
    ponente: { ...form.value },
    foto: selectedImage.value,
  });
};

onBeforeUnmount(() => {
  revokePreviewUrl();
});
</script>

<style scoped>
.update-ponente-form {
  color: #ffffff;
}

.image-preview-card {
  border-color: #394150;
}

.image-preview {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 8px;
}
</style>