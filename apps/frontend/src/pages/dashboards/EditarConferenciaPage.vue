<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Editar Conferencia</div>
        <div class="text-subtitle2 text-grey-7">Actualiza los datos de la conferencia.</div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div v-if="isLoading" class="q-mb-md text-grey-5">Cargando conferencia...</div>
        <div v-else-if="error" class="q-mb-md text-negative">{{ error }}</div>
        <UpdateConferenciaForm
          v-else
          :initial-data="initialConferenciaData"
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
import UpdateConferenciaForm from '../../components/forms_update/UpdateConferenciaForm.vue';
import { useConferenciasQuery } from '../../composables/useConferenciasQuery';
import type { ConferenciaPayload } from '../../types';

const router = useRouter();
const route = useRoute() as unknown as { params: { id?: string } };
const $q = useQuasar();
const { getById, update } = useConferenciasQuery();
const recordId = computed(() => route.params.id ?? '');

const data = ref<ConferenciaPayload | null>(null);
const initialConferenciaData = computed<Partial<ConferenciaPayload>>(() => data.value ?? {});
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
  void router.push('/conferencias');
};

const load = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    data.value = await getById(recordId.value);
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo cargar la conferencia.';
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async (payload: ConferenciaPayload) => {
  isPending.value = true;

  try {
    await update(recordId.value, payload);
    notify('positive', 'Conferencia actualizada correctamente.');
    void router.push('/conferencias');
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo actualizar la conferencia.');
  } finally {
    isPending.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>