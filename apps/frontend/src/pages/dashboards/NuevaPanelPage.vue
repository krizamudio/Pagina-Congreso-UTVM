<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Nuevo Panelista</div>
        <div class="text-subtitle2 text-grey-7">
          Registra un panelista para el congreso.
        </div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <NewPanelForm @submit="handleSubmit" :loading="isPending" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import NewPanelForm from '../../components/forms/NewPanelForm.vue';
import { usePonente } from '../../composables/usePonente';
import { api } from '../../services/api';
import type { PanelPayload } from '../../types';

interface NewPanelSubmitPayload {
  panelista: PanelPayload;
  foto: File | null;
}

const router = useRouter();
const $q = useQuasar();
const { useCreatePonente } = usePonente();
const { mutate: createPanelista, isPending } = useCreatePonente();
const panelistaPhotoUploadEndpoint =
  (import.meta.env.VITE_UPLOAD_PANELISTA_PHOTO_ENDPOINT as string | undefined)?.trim() ||
  (import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined)?.trim() ||
  '';

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
  void router.push('/paneles');
};

const handleSubmit = async ({ panelista, foto }: NewPanelSubmitPayload) => {
  try {
    const payload: PanelPayload = { ...panelista };

    if (foto && panelistaPhotoUploadEndpoint) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', foto);

      const uploadResponse = await api.post(panelistaPhotoUploadEndpoint, uploadFormData, {
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
        notify('warning', 'La imagen se subio, pero no se recibio archivo_foto_id en la respuesta.');
      }
    }

    if (foto && !panelistaPhotoUploadEndpoint) {
      notify('warning', 'No hay endpoint de upload configurado. Define VITE_UPLOAD_PANELISTA_PHOTO_ENDPOINT.');
    }

    await createPanelista(payload);
    notify('positive', 'Panelista creado exitosamente.');
    void router.push('/paneles');
  } catch (err) {
    console.error('Error al crear panelista:', err);
    notify('negative', 'No se pudo crear el panelista.');
  }
};
</script>

<style scoped>
.dashboard-card {
  background: rgba(9, 30, 26, 0.92);
  border: 1px solid rgba(0, 230, 118, 0.18);
}
</style>
