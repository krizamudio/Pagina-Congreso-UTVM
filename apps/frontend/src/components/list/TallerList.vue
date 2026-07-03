<template>
  <q-card class="dashboard-card q-pa-md">
    <q-card-section>
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="text-h6">Lista de talleres</div>
          <div class="text-caption text-grey-7">Datos cargados con caché local y revalidación.</div>
        </div>
      </div>

      <div v-if="isRefreshing" class="q-mb-md">
        <q-banner rounded class="bg-grey-10 text-white">Actualizando información...</q-banner>
      </div>

      <div v-if="error" class="q-mb-md">
        <StatePanel title="No se pudo cargar" :description="error" icon="warning" tone="warning" />
      </div>

      <q-table
        class="dashboard-table"
        :rows="props.items"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="isRefreshing"
      >
        <template #body-cell-acciones="bodyProps">
          <q-td align="center">
            <q-btn dense color="primary" icon="edit" class="q-mr-sm" @click="emit('edit', bodyProps.row.id)" />
            <q-btn dense color="negative" icon="delete" @click="emit('delete', bodyProps.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import StatePanel from '@/components/feedback/StatePanel.vue';
import type { Taller } from '../../types';

const emit = defineEmits<{
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
}>();

interface Props {
  items: Taller[];
  talleristaNames: Record<string, string>;
  isRefreshing: boolean;
  error: string | null;
}

const props = defineProps<Props>();

const columns: QTableColumn[] = [
  { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true },
  {
    name: 'tallerista_id',
    label: 'Panelista',
    field: (row: Taller) => props.talleristaNames[row.tallerista_id] ?? row.tallerista_id,
    align: 'left',
  },
  { name: 'cupo_maximo', label: 'Cupo', field: 'cupo_maximo', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'hora_inicio', label: 'Inicio', field: 'hora_inicio', align: 'center' },
  { name: 'hora_fin', label: 'Fin', field: 'hora_fin', align: 'center' },
  { name: 'ubicacion_id', label: 'Ubicación ID', field: 'ubicacion_id', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
];
</script>
