<template>
  <div>
    <div class="row justify-between items-center q-gutter-md q-mb-md">
      <div>
        <div class="text-h6">Agenda</div>
        <div class="text-caption text-grey-7">
          La página oficial combina automáticamente conferencias y talleres.
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          icon="code"
          label="Conferencias"
          to="/conferencias"
        />
        <q-btn
          outline
          color="primary"
          icon="chat"
          label="Talleres"
          to="/talleres"
        />
      </div>
    </div>

    <q-banner rounded class="agenda-help q-mb-md">
      <template #avatar><q-icon name="info" color="primary" /></template>
      Para modificar la agenda, crea o edita las actividades desde los botones
      superiores. Aquí se muestra cómo quedarán agrupadas para
      {{ congresoNombre }}.
    </q-banner>

    <StatePanel
      v-if="error"
      class="q-mb-md"
      title="No se pudo obtener la agenda"
      :description="error"
      icon="warning"
      tone="warning"
    />

    <q-table
      class="dashboard-table"
      flat
      bordered
      row-key="id"
      :rows="items"
      :columns="columns"
      :loading="loading"
    >
      <template #body-cell-tipo="slotProps">
        <q-td :props="slotProps">
          <q-badge
            :color="
              slotProps.row.tipo === 'conferencia' ? 'primary' : 'secondary'
            "
          >
            {{
              slotProps.row.tipo === "conferencia" ? "Conferencia" : "Taller"
            }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-fecha="slotProps">
        <q-td :props="slotProps">{{ formatDate(slotProps.row.fecha) }}</q-td>
      </template>

      <template #body-cell-horario="slotProps">
        <q-td :props="slotProps">
          {{ formatTime(slotProps.row.horaInicio) }} –
          {{ formatTime(slotProps.row.horaFin) }}
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center text-grey-7 q-pa-lg">
          Aún no hay conferencias ni talleres en la agenda.
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { QTableColumn } from "quasar";

import StatePanel from "../feedback/StatePanel.vue";
import {
  contenidoOficialService,
  getContenidoError
} from "../../services/contenidoOficialService";
import type { AgendaPaginaOficialItem } from "../../types/contenido-oficial";

const props = defineProps<{
  congresoId: string;
  congresoNombre: string;
}>();

const items = ref<AgendaPaginaOficialItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const columns: QTableColumn<AgendaPaginaOficialItem>[] = [
  {
    name: "tipo",
    label: "Tipo",
    field: "tipo",
    align: "center",
    sortable: true
  },
  {
    name: "titulo",
    label: "Actividad",
    field: "titulo",
    align: "left",
    sortable: true
  },
  {
    name: "fecha",
    label: "Fecha",
    field: "fecha",
    align: "center",
    sortable: true
  },
  {
    name: "horario",
    label: "Horario",
    field: row => row.horaInicio,
    align: "center"
  },
  {
    name: "ubicacion",
    label: "Ubicación",
    field: row => row.ubicacion?.nombre ?? "Sin ubicación",
    align: "left"
  },
  {
    name: "ponente",
    label: "Ponente",
    field: row => row.ponente?.nombre ?? "Sin ponente",
    align: "left"
  }
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`)
  );

const formatTime = (value: string) => value.slice(0, 5);

const load = async () => {
  if (!props.congresoId) return;
  loading.value = true;
  error.value = null;
  try {
    const page = await contenidoOficialService.getPaginaOficial(
      props.congresoId
    );
    items.value = page.agenda;
  } catch (loadError) {
    console.error(loadError);
    items.value = [];
    error.value = getContenidoError(
      loadError,
      "No se pudo obtener la agenda del congreso."
    );
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.congresoId,
  () => void load(),
  { immediate: true }
);
</script>

<style scoped>
.agenda-help {
  color: var(--text-soft);
  background: var(--surface-strong);
  border: 1px solid var(--surface-border);
}
</style>
