<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Nueva Conferencia</div>
        <div class="text-subtitle2 text-grey-7">
          Registra una conferencia con título, ponente, resumen y horarios.
        </div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <NewConferenciaForm @submit="handleSubmit" :loading="isPending" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import NewConferenciaForm from '../../components/forms/NewConferenciaForm.vue';
import { useConferenciasQuery } from '../../composables/useConferenciasQuery';
import type { ConferenciaPayload } from '../../types';

const router = useRouter();
const $q = useQuasar();
const { create } = useConferenciasQuery();
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

const handleSubmit = async (payload: ConferenciaPayload) => {
  isPending.value = true;

  try {
    await create(payload);
    notify('positive', 'Conferencia creada exitosamente.');
    void router.push('/conferencias');
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo crear la conferencia.');
  } finally {
    isPending.value = false;
  }
};
</script>

<style scoped>
.dashboard-card {
  background: rgba(9, 30, 26, 0.92);
  border: 1px solid rgba(0, 230, 118, 0.18);
}
</style>
