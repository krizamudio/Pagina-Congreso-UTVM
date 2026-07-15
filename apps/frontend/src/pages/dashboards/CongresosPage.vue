<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div
        ><div class="text-h4 text-weight-bold">Congresos</div
        ><div class="text-subtitle2 text-grey-7"
          >Administra las ediciones y sus periodos.</div
        ></div
      >
      <div class="row q-gutter-sm"
        ><q-btn
          outline
          color="primary"
          icon="refresh"
          label="Recargar"
          @click="load" /><q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nuevo congreso"
          to="/congresos/nuevo"
      /></div>
    </div>
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
          <template #body-cell-fechaInicio="props"
            ><q-td :props="props">{{
              formatDate(props.row.fechaInicio)
            }}</q-td></template
          >
          <template #body-cell-fechaFin="props"
            ><q-td :props="props">{{
              formatDate(props.row.fechaFin)
            }}</q-td></template
          >
          <template #body-cell-acciones="props"
            ><q-td :props="props"
              ><q-btn
                dense
                color="primary"
                icon="edit"
                class="q-mr-sm"
                :disable="deletingId === props.row.id"
                :to="`/congresos/${props.row.id}/editar`" /><q-btn
                dense
                color="negative"
                icon="delete"
                :disable="deletingId !== null"
                :loading="deletingId === props.row.id"
                @click="confirmRemove(props.row.id)" /></q-td
          ></template>
          <template #no-data
            ><div class="full-width row flex-center text-grey-5 q-pa-lg"
              >No hay congresos registrados.</div
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
import { useCongresosQuery } from "../../composables/useCongresosQuery";

const $q = useQuasar();
const { data, isRefreshing, error, load, remove } = useCongresosQuery();
const deletingId = ref<string | null>(null);
const columns: QTableColumn[] = [
  {
    name: "nombre",
    label: "Nombre",
    field: "nombre",
    align: "left",
    sortable: true
  },
  { name: "eslogan", label: "Eslogan", field: "eslogan", align: "left" },
  { name: "ubicacion", label: "Ubicación", field: "ubicacion", align: "left" },
  {
    name: "fechaInicio",
    label: "Inicio",
    field: "fechaInicio",
    align: "center",
    sortable: true
  },
  {
    name: "fechaFin",
    label: "Fin",
    field: "fechaFin",
    align: "center",
    sortable: true
  },
  { name: "acciones", label: "Acciones", field: () => "", align: "center" }
];
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
const confirmRemove = (id: string) =>
  $q
    .dialog({
      title: "Eliminar congreso",
      message: "¿Seguro que deseas eliminar este congreso?",
      cancel: true,
      persistent: true
    })
    .onOk(async () => {
      if (deletingId.value) return;
      deletingId.value = id;
      try {
        await remove(id);
        $q.notify({
          type: "positive",
          message: "Congreso eliminado correctamente."
        });
        await load();
      } catch {
        $q.notify({
          type: "negative",
          message: "No se pudo eliminar el congreso."
        });
      } finally {
        deletingId.value = null;
      }
    });
onMounted(() => void load());
</script>
