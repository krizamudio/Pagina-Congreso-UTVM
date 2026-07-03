<template>
  <q-form @submit.prevent="submit" class="new-panel-form">
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
          label="Foto del panelista"
          hint="Se sube tal como fue seleccionada"
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
            <img :src="imagePreviewUrl" alt="Vista previa de foto de panelista" class="image-preview" />
            <div v-if="selectedImage" class="text-caption q-mt-sm text-grey-5">
              Archivo: {{ selectedImage.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="imageError" class="col-12 text-negative">{{ imageError }}</div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn unelevated color="primary" label="Guardar panelista" type="submit" :loading="props.loading" />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useFormPersistence } from '../../composables/useFormPersistence';
import type { PanelPayload } from '../../types';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', payload: NewPanelSubmitPayload): void;
}>();

interface NewPanelSubmitPayload {
  panelista: PanelPayload;
  foto: File | null;
}

const error = ref<string | null>(null);
const imageError = ref<string | null>(null);
const selectedImage = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);

const { formData: form } = useFormPersistence<PanelPayload>('new-panel-form', {
  nombre: '',
  usuario_id: generateUUID(),
  archivo_foto_id: generateUUID(),
  institucion: '',
  semblanza: '',
  tema: '',
  visible_publico: true,
});

const requiredRule = (value: string) => !!value || 'Este campo es obligatorio';

const revokePreviewUrl = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
  imagePreviewUrl.value = null;
};

const resetImageState = () => {
  imageError.value = null;
  revokePreviewUrl();
};

const handleImageChange = (file: File | null) => {
  if (!file) {
    resetImageState();
    return;
  }

  imageError.value = null;
  revokePreviewUrl();
  imagePreviewUrl.value = URL.createObjectURL(file);
};

const submit = () => {
  error.value = null;
  emit('submit', {
    panelista: { ...form.value },
    foto: selectedImage.value,
  });
};

onBeforeUnmount(() => {
  revokePreviewUrl();
});
</script>

<style scoped>
.new-panel-form {
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
