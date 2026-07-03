<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Ponentes</div>
        <div class="text-subtitle2 text-grey-7">Lista de ponentes del congreso.</div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn label="Recargar" icon="refresh" color="primary" @click="load" />
        <q-btn label="Nuevo ponente" icon="add" unelevated color="primary" @click="goToNew" />
      </div>
    </div>

    <PonenteList :items="data" :is-refreshing="isLoading" :error="error" @edit="handleEdit" @delete="handleDelete" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import PonenteList from '../../components/list/PonenteList.vue';
import { usePonente } from '../../composables/usePonente';

const router = useRouter();
const $q = useQuasar();
const { useGetPonentes, useDeletePonente } = usePonente();
const { data, isLoading, error, refetch } = useGetPonentes();
const { mutate: deletePonente } = useDeletePonente();

const load = async () => {
  await refetch();
};

const goToNew = () => router.push('/ponentes/nueva');

const handleEdit = (id: string) => {
  void router.push(`/ponentes/${id}/editar`);
};

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

const handleDelete = async (id: string) => {
  const confirmed = window.confirm('¿Seguro que deseas eliminar este ponente?');
  if (!confirmed) return;

  try {
    await deletePonente(id);
    notify('positive', 'Ponente eliminado correctamente.');
    await refetch();
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo eliminar el ponente.');
  }
};

onMounted(() => {
  void load();
});
</script>
