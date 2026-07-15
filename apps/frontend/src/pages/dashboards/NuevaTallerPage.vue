<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Nuevo Taller</div>
        <div class="text-subtitle2 text-grey-7">
          Registra un taller con título, horarios y requisitos.
        </div>
      </div>
      <q-btn label="Volver" flat text-color="white" @click="goBack" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <NewTallerForm @submit="handleSubmit" :loading="isPending" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import NewTallerForm from '../../components/forms/NewTallerForm.vue';
import { useTalleresQuery } from '../../composables/useTalleresQuery';
import type { TallerPayload } from '../../types';

const router = useRouter();
const $q = useQuasar();
const { create } = useTalleresQuery();
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

const handleSubmit = async (payload: TallerPayload) => {
  isPending.value = true;

  try {
    await create(payload);
    notify('positive', 'Taller creado exitosamente.');
    void router.push('/talleres');
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo crear el taller.');
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
