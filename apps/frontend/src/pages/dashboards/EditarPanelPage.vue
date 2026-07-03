<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Editar Panelista</div>
        <div class="text-subtitle2 text-grey-7">Actualiza los datos del panelista.</div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div v-if="isLoading" class="q-mb-md text-grey-5">Cargando panelista...</div>
        <div v-else-if="error" class="q-mb-md text-negative">{{ error }}</div>
        <UpdatePanelForm
          v-else
          :initial-data="initialPanelistaData"
          :loading="isPending"
          @submit="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import UpdatePanelForm from '../../components/forms_update/UpdatePanelForm.vue';
import { usePonente } from '../../composables/usePonente';
import type { PanelPayload } from '../../types';
import { api } from '../../services/api';

const router = useRouter();
const route = useRoute() as unknown as { params: { id?: string } };
const $q = useQuasar();
const { useGetPonenteById, useUpdatePonente } = usePonente();
const recordId = computed(() => route.params.id ?? '');

const { data, isLoading, error, fetch } = useGetPonenteById(recordId.value);
const { mutate: updatePanelista, isPending } = useUpdatePonente();
const panelistaPhotoUploadEndpoint = (import.meta.env.VITE_UPLOAD_PANELISTA_PHOTO_ENDPOINT as string | undefined)?.trim() || (import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined)?.trim() || '';
const initialPanelistaData = computed<Partial<PanelPayload>>(() => data.value ?? {});

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

const handleSubmit = async ({ panelista, foto }: { panelista: PanelPayload; foto: File | null }) => {
  try {
    const payload: Partial<PanelPayload> = { ...panelista };

    if (foto && panelistaPhotoUploadEndpoint) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', foto);

      const uploadResponse = await api.post(panelistaPhotoUploadEndpoint, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

    await updatePanelista(recordId.value, payload);
    notify('positive', 'Panelista actualizado correctamente.');
    void router.push('/paneles');
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo actualizar el panelista.');
  }
};

onMounted(() => {
  void fetch();
});
</script>