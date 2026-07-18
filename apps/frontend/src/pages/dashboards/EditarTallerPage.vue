<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Editar Taller</div>
        <div class="text-subtitle2 text-grey-7">Actualiza los datos del taller.</div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div v-if="isLoading" class="q-mb-md text-grey-5">Cargando taller...</div>
        <div v-else-if="error" class="q-mb-md text-negative">{{ error }}</div>
        <UpdateTallerForm
          v-else
          :initial-data="initialTallerData"
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
import { isAxiosError } from 'axios';
import { useQuasar } from 'quasar';
import UpdateTallerForm from '../../components/forms_update/UpdateTallerForm.vue';
import { useTalleresQuery } from '../../composables/useTalleresQuery';
import type { TallerPayload } from '../../types';

const router = useRouter();
const $q = useQuasar();
const { getById, update } = useTalleresQuery();
const route = useRoute() as unknown as { params: { id?: string } };
const recordId = computed(() => route.params.id ?? '');

const data = ref<TallerPayload | null>(null);
const initialTallerData = computed<Partial<TallerPayload>>(() => {
  if (!data.value) return {};

  const source = data.value as unknown as Record<string, unknown>;
  return {
    congreso_id: String(source.congreso_id ?? ''),
    titulo: String(source.titulo ?? ''),
    descripcion: String(source.descripcion ?? ''),
    tallerista_id: String(source.tallerista_id ?? ''),
    cupo_maximo: Number(source.cupo_maximo ?? 1),
    fecha: String(source.fecha ?? ''),
    hora_inicio: String(source.hora_inicio ?? ''),
    hora_fin: String(source.hora_fin ?? ''),
    ubicacion_id: String(source.ubicacion_id ?? ''),
    requisitos: String(source.requisitos ?? ''),
  };
});
const isLoading = ref(false);
const error = ref<string | null>(null);
const isPending = ref(false);

const notify = (type: 'positive' | 'negative', message: string) => {
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
  void router.push('/talleres');
};

const load = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    data.value = await getById(recordId.value);
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo cargar el taller.';
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async (payload: TallerPayload) => {
  isPending.value = true;

  try {
    const cleanPayload: TallerPayload = {
      congreso_id: payload.congreso_id,
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      tallerista_id: payload.tallerista_id,
      cupo_maximo: payload.cupo_maximo,
      fecha: payload.fecha,
      hora_inicio: payload.hora_inicio,
      hora_fin: payload.hora_fin,
      ubicacion_id: payload.ubicacion_id,
      requisitos: payload.requisitos,
    };

    await update(recordId.value, cleanPayload);
    notify('positive', 'Taller actualizado correctamente.');
    void router.push('/talleres');
  } catch (err) {
    console.error(err);
    const message = isAxiosError(err)
      ? ((err.response?.data as { message?: string | string[] } | undefined)?.message ?? 'No se pudo actualizar el taller.')
      : 'No se pudo actualizar el taller.';

    notify('negative', Array.isArray(message) ? message.join(' ') : message);
  } finally {
    isPending.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>
