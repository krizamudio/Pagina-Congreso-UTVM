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
          :current-photo-url="currentPhotoUrl"
          :loading="isPending || isSubmitting"
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
import axios from 'axios';
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
const isSubmitting = ref(false);
const ponentePhotoUploadEndpoint =
  (import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined)?.trim() ||
  'fotos';

const initialPonenteData = computed<Partial<PonentePayload>>(() => {
  const raw = data.value as
    | (Partial<PonentePayload> & {
        usuarioId?: string;
        visiblePublico?: boolean;
        foto?: { id?: string; url?: string };
      })
    | null;

  if (!raw) {
    return {};
  }

  return {
    nombre: raw.nombre ?? '',
    usuario_id: raw.usuario_id ?? raw.usuarioId ?? '',
    archivo_foto_id: raw.archivo_foto_id ?? raw.foto?.id ?? '',
    institucion: raw.institucion ?? '',
    semblanza: raw.semblanza ?? '',
    tema: raw.tema ?? '',
    visible_publico: raw.visible_publico ?? raw.visiblePublico ?? true,
  };
});

const currentPhotoUrl = computed(() => {
  const raw = data.value as { foto?: { id?: string; url?: string } } | null;
  return raw?.foto?.url ?? '';
});

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
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const payload: Partial<PonentePayload> = {
      nombre: ponente.nombre,
      institucion: ponente.institucion,
      semblanza: ponente.semblanza,
      tema: ponente.tema,
      visible_publico: ponente.visible_publico ?? true,
    };

    if (foto) {
      const uploadFormData = new FormData();
      uploadFormData.append('foto', foto);

      if (!ponente.archivo_foto_id) {
        throw new Error('No se pudo obtener el ID de la foto actual para reemplazarla.');
      }

      const uploadResponse = await api.patch(`fotos/${ponente.archivo_foto_id}`, uploadFormData, {
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
        throw new Error('La subida de foto no devolvio un id valido.');
      }
    }

    await updatePonente(recordId.value, payload);
    notify('positive', 'Ponente actualizado correctamente.');
    void router.push('/ponentes');
  } catch (err) {
    console.error(err);

    let detail = '';
    if (axios.isAxiosError(err)) {
      const backendMessage = err.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        detail = backendMessage.join(' | ');
      } else if (typeof backendMessage === 'string' && backendMessage.length > 0) {
        detail = backendMessage;
      }
    } else if (err instanceof Error && err.message.length > 0) {
      detail = err.message;
    }

    notify(
      'negative',
      detail ? `No se pudo actualizar el ponente. ${detail}` : 'No se pudo actualizar el ponente.',
    );
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  void fetch();
});
</script>