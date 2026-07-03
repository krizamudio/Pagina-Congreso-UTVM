<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Editar Ponente</div>
        <div class="text-subtitle2 text-grey-7">Actualiza los datos del ponente.</div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div v-if="isLoading" class="q-mb-md text-grey-5">Cargando ponente...</div>
        <div v-else-if="error" class="q-mb-md text-negative">{{ error }}</div>
        <UpdatePonenteForm
          v-else
          :initial-data="initialPonenteData"
          :loading="isPending"
          @submit="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import UpdatePonenteForm from '../../components/forms_update/UpdatePonenteForm.vue';
import { usePonente } from '../../composables/usePonente';
import type { PonentePayload } from '../../types';
import { api } from '../../services/api';

const router = useRouter();
const route = useRoute() as unknown as { params: { id?: string } };
const $q = useQuasar();
const { useGetPonenteById, useUpdatePonente } = usePonente();
const recordId = computed(() => route.params.id ?? '');

const { data, isLoading, error, fetch } = useGetPonenteById(recordId.value);
const { mutate: updatePonente, isPending } = useUpdatePonente();
const ponentePhotoUploadEndpoint = (import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined)?.trim() ?? '';
const initialPonenteData = computed<Partial<PonentePayload>>(() => data.value ?? {});

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

const handleSubmit = async ({ ponente, foto }: { ponente: PonentePayload; foto: File | null }) => {
  try {
    const payload: Partial<PonentePayload> = { ...ponente };

    if (foto && ponentePhotoUploadEndpoint) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', foto);

      const uploadResponse = await api.post(ponentePhotoUploadEndpoint, uploadFormData, {
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

    await updatePonente(recordId.value, payload);
    notify('positive', 'Ponente actualizado correctamente.');
    void router.push('/ponentes');
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo actualizar el ponente.');
  }
};

onMounted(() => {
  void fetch();
});
</script>