<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Reconocimientos</div>
        <div class="text-subtitle2 text-grey-7">
          Reconocimientos de actividades, evaluadores y premiación de Hackatón.
        </div>
      </div>
      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Actualizar"
        :loading="isLoading"
        :disable="isLoading || downloadingId !== null"
        @click="loadItems"
      />
    </div>

    <q-banner rounded class="recognition-help q-mb-md">
      <template #avatar><q-icon name="info" color="primary" /></template>
      Los reconocimientos aparecen automáticamente cuando termina la actividad.
      Al descargar se genera el PDF y su estado cambia a emitido.
    </q-banner>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              dense
              clearable
              label="Buscar por nombre o actividad"
              :dark="!isLight"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="estado"
              dense
              clearable
              emit-value
              map-options
              label="Estado"
              :options="estadoOptions"
              :dark="!isLight"
              @update:model-value="loadItems"
            />
          </div>
        </div>

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
          :rows="filteredItems"
          :columns="columns"
          :loading="isLoading"
        >
          <template #body-cell-estado="slotProps">
            <q-td :props="slotProps"
              ><q-badge :color="statusColor(slotProps.row.estado)">{{
                statusLabel(slotProps.row.estado)
              }}</q-badge></q-td
            >
          </template>
          <template #body-cell-acciones="slotProps">
            <q-td :props="slotProps">
              <q-btn
                color="primary"
                dense
                unelevated
                icon="download"
                label="Descargar"
                :loading="downloadingId === slotProps.row.id"
                :disable="isLoading || downloadingId !== null"
                @click="downloadPdf(slotProps.row)"
              />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-lg"
              >No hay reconocimientos disponibles con estos filtros.</div
            >
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import type { QTableColumn } from "quasar";
import StatePanel from "../../components/feedback/StatePanel.vue";
import { useReconocimientosQuery } from "../../composables/useReconocimientosQuery";
import { useThemeMode } from "../../composables/useThemeMode";
import type { Reconocimiento, ReconocimientoEstado } from "../../types";

const route = useRoute();
const $q = useQuasar();
const { isLight } = useThemeMode();
const {
  data,
  isLoading,
  error,
  load,
  download,
  prepareForTaller,
  prepareForConferencia
} = useReconocimientosQuery();
const search = ref("");
const estado = ref<ReconocimientoEstado | null>(null);
const downloadingId = ref<string | null>(null);
const tallerId = computed(() =>
  typeof route.query.tallerId === "string" ? route.query.tallerId : undefined
);
const conferenciaId = computed(() =>
  typeof route.query.conferenciaId === "string"
    ? route.query.conferenciaId
    : undefined
);

const estadoOptions = [
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Emitido", value: "EMITIDO" },
  { label: "Fallido", value: "FALLIDO" }
];

const columns: QTableColumn<Reconocimiento>[] = [
  {
    name: "destinatario",
    label: "Destinatario",
    field: "nombre_destinatario",
    align: "left",
    sortable: true
  },
  {
    name: "tipoPersona",
    label: "Tipo",
    field: row =>
      row.ponente?.tipo ?? (row.participante ? "Participante" : "—"),
    align: "left"
  },
  {
    name: "actividad",
    label: "Actividad",
    field: row =>
      row.taller?.titulo ??
      row.conferencia?.titulo ??
      row.hackaton_equipo?.nombre ??
      row.hackaton?.nombre ??
      "Sin actividad",
    align: "left",
    sortable: true
  },
  {
    name: "estado",
    label: "Estado",
    field: "estado",
    align: "center",
    sortable: true
  },
  { name: "acciones", label: "Acciones", field: "id", align: "center" }
];

const filteredItems = computed(() => {
  const term = search.value.trim().toLocaleLowerCase("es-MX");
  if (!term) return data.value;
  return data.value.filter(item =>
    [
      item.nombre_destinatario,
      item.taller?.titulo,
      item.conferencia?.titulo,
      item.hackaton?.nombre,
      item.hackaton_equipo?.nombre,
      item.ponente?.tipo
    ]
      .filter(Boolean)
      .some(value => value?.toLocaleLowerCase("es-MX").includes(term))
  );
});

const loadItems = () =>
  load({
    ...(tallerId.value ? { tallerId: tallerId.value } : {}),
    ...(conferenciaId.value ? { conferenciaId: conferenciaId.value } : {}),
    ...(tallerId.value
      ? { tipo: "TALLERISTA" as const }
      : conferenciaId.value
        ? { tipo: "CONFERENCISTA" as const }
        : {}),
    ...(estado.value ? { estado: estado.value } : {})
  });

const statusLabel = (value: ReconocimientoEstado) =>
  ({ PENDIENTE: "Pendiente", EMITIDO: "Emitido", FALLIDO: "Fallido" })[value];
const statusColor = (value: ReconocimientoEstado) =>
  ({ PENDIENTE: "warning", EMITIDO: "positive", FALLIDO: "negative" })[value];

const downloadPdf = async (item: Reconocimiento) => {
  if (downloadingId.value || isLoading.value) return;

  downloadingId.value = item.id;
  try {
    await download(item);
    $q.notify({
      type: "positive",
      message: "Reconocimiento generado correctamente.",
      position: "top"
    });
    await loadItems();
  } catch (downloadError) {
    console.error(downloadError);
    $q.notify({
      type: "negative",
      message: "No se pudo generar el reconocimiento.",
      position: "top"
    });
  } finally {
    downloadingId.value = null;
  }
};

const initialize = async () => {
  try {
    if (tallerId.value) await prepareForTaller(tallerId.value);
    if (conferenciaId.value) {
      await prepareForConferencia(conferenciaId.value);
    }
    await loadItems();
  } catch (prepareError) {
    console.error(prepareError);
    $q.notify({
      type: "negative",
      message: "No se pudo preparar el reconocimiento de la actividad.",
      position: "top"
    });
  }
};

onMounted(() => void initialize());
</script>

<style scoped>
.recognition-help {
  color: var(--text-soft);
  background: var(--surface-strong);
  border: 1px solid var(--surface-border);
}
</style>
