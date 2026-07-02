<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Talleres</div>
        <div class="text-subtitle2 text-grey-7">
          lista de talleres del congreso.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn label="Recargar" icon="refresh" color="primary" @click="load" />
        <q-btn label="Nuevo taller" icon="add" unelevated color="primary" @click="goToNew" />
      </div>
    </div>

    <TallerList
      :items="data"
      :tallerista-names="talleristaNames"
      :is-refreshing="isRefreshing"
      :error="error"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import TallerList from '../../components/list/TallerList.vue';
import { useTalleresQuery } from '../../composables/useTalleresQuery';
import { usePonente } from '../../composables/usePonente';

const router = useRouter();
const $q = useQuasar();
const { data, isRefreshing, error, load, remove } = useTalleresQuery();
const { useGetPonentes } = usePonente();
const { data: ponentes, refetch: loadPonentes } = useGetPonentes();

const talleristaNames = computed(() => {
  return ponentes.value.reduce<Record<string, string>>((accumulator, ponente) => {
    accumulator[ponente.id] = ponente.nombre;
    return accumulator;
  }, {});
});

const goToNew = () => {
  void router.push('/talleres/nuevo');
};

const handleEdit = (id: string) => {
  void router.push(`/talleres/${id}/editar`);
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
  const confirmed = window.confirm('¿Seguro que deseas eliminar este taller?');
  if (!confirmed) return;

  try {
    await remove(id);
    notify('positive', 'Taller eliminado correctamente.');
    await load();
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo eliminar el taller.');
  }
};

onMounted(() => {
  void load();
  void loadPonentes();
});
</script>
