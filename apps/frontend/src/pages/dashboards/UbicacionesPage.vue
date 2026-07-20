<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg"
      ><div
        ><div class="text-h4 text-weight-bold">Ubicaciones</div
        ><div class="text-subtitle2 text-grey-7"
          >Administra auditorios, aulas y su capacidad.</div
        ></div
      ><div class="row q-gutter-sm"
        ><q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nueva ubicación"
          to="/ubicaciones/nueva" /></div
    ></div>
    <q-card class="dashboard-card q-pa-md"
      ><q-card-section>
        <StatePanel
          v-if="error"
          class="q-mb-md"
          title="No se pudo cargar"
          :description="error"
          icon="warning"
          tone="warning"
        />
        <q-table
          class="dashboard-table"
          flat
          bordered
          row-key="id"
          :rows="data"
          :columns="columns"
          :loading="isRefreshing"
        >
          <template #body-cell-capacidad="props"
            ><q-td :props="props"
              >{{ props.row.capacidad }} personas</q-td
            ></template
          >
          <template #body-cell-acciones="props"
            ><q-td :props="props"
              ><q-btn
                dense
                color="primary"
                icon="edit"
                class="q-mr-sm"
                :disable="deletingId === props.row.id"
                :to="`/ubicaciones/${props.row.id}/editar`" /><q-btn
                dense
                color="negative"
                icon="delete"
                :disable="deletingId !== null"
                :loading="deletingId === props.row.id"
                @click="confirmRemove(props.row.id)" /></q-td
          ></template>
          <template #no-data
            ><div class="full-width row flex-center text-grey-5 q-pa-lg"
              >No hay ubicaciones registradas.</div
            ></template
          >
        </q-table>
      </q-card-section></q-card
    >
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useQuasar, type QTableColumn } from "quasar";
import StatePanel from "../../components/feedback/StatePanel.vue";
import { useUbicacionesQuery } from "../../composables/useUbicacionesQuery";
const $q = useQuasar();
const { data, isRefreshing, error, load, remove } = useUbicacionesQuery();
const deletingId = ref<string | null>(null);
const columns: QTableColumn[] = [
  {
    name: "nombre",
    label: "Nombre",
    field: "nombre",
    align: "left",
    sortable: true
  },
  {
    name: "capacidad",
    label: "Capacidad",
    field: "capacidad",
    align: "center",
    sortable: true
  },
  { name: "acciones", label: "Acciones", field: () => "", align: "center" }
];
const confirmRemove = (id: string) =>
  $q
    .dialog({
      title: "Eliminar ubicación",
      message: "¿Seguro que deseas eliminar esta ubicación?",
      cancel: { label: "Cancelar", flat: true },
      persistent: true
    })
    .onOk(async () => {
      if (deletingId.value) return;
      deletingId.value = id;
      try {
        await remove(id);
        $q.notify({
          type: "positive",
          message: "Ubicación eliminada correctamente."
        });
        await load();
      } catch {
        $q.notify({
          type: "negative",
          message: "No se pudo eliminar la ubicación."
        });
      } finally {
        deletingId.value = null;
      }
    });
onMounted(() => void load());
</script>
