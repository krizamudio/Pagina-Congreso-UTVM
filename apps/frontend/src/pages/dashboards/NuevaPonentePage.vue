<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Nuevo Ponente</div>
        <div class="text-subtitle2 text-grey-7">Registra un ponente.</div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <NewPonenteForm @submit="handleSubmit" :loading="isPending || isSubmitting" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import NewPonenteForm from '../../components/forms/NewPonenteForm.vue';
import { usePonente } from '../../composables/usePonente';
import type { PonentePayload } from '../../types';
import { api } from '../../services/api';

interface NewPonenteSubmitPayload {
  ponente: PonentePayload;
  foto: File | null;
}

const router = useRouter();
const $q = useQuasar();
const { useCreatePonente } = usePonente();
const { mutate: createPonente, isPending } = useCreatePonente();
const isSubmitting = ref(false);
const ponentePhotoUploadEndpoint =
  (import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined)?.trim() ||
  'fotos';

const notify = (type: 'positive' | 'negative' | 'warning', message: string) => {
  if (typeof $q.notify === 'function') {
    $q.notify({
      type,
      message,
      position: 'top',
      timeout: 3200,
      multiLine: true,
      progress: true,
      textColor: type === 'negative' ? 'white' : 'black',
      classes: `app-notify app-notify-${type}`,
    });
    return;
  }

  console.warn(`[${type}] ${message}`);
};

const goBack = () => {
  void router.push('/ponentes');
};

const handleSubmit = async ({ ponente, foto }: NewPonenteSubmitPayload) => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const payload: PonentePayload = { ...ponente };

    // Ignore any stale persisted id; only keep archivo_foto_id when upload succeeds in this submit.
    delete (payload as Partial<PonentePayload>).archivo_foto_id;

    if (foto) {
      const uploadFormData = new FormData();
      uploadFormData.append('foto', foto);

      const uploadResponse = await api.post(ponentePhotoUploadEndpoint, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedPhotoId =
        uploadResponse.data?.id ??
        uploadResponse.data?.archivo_foto_id ??
        uploadResponse.data?.data?.id ??
        uploadResponse.data?.data?.archivo_foto_id;

      if (typeof uploadedPhotoId === 'string' && uploadedPhotoId.length > 0) {
        payload.archivo_foto_id = uploadedPhotoId;
      } else {
        throw new Error('La subida de foto no devolvio un id valido.');
      }
    }

    await createPonente(payload);
    notify('positive', 'Ponente creado exitosamente.');
    void router.push('/ponentes');
  } catch (err) {
    console.error('Error al crear el ponente:', err);

    let detail = '';
    if (axios.isAxiosError(err)) {
      const backendMessage = err.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        detail = backendMessage.join(' | ');
      } else if (typeof backendMessage === 'string' && backendMessage.length > 0) {
        detail = backendMessage;
      }
    }

    notify(
      'negative',
      detail ? `No se pudo crear el ponente. ${detail}` : 'No se pudo crear el ponente.',
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
