<template>
  <q-card class="dashboard-card q-pa-md">
    <q-card-section>
      <StatePanel
        v-if="props.error"
        class="q-mb-md"
        title="No se pudo cargar"
        :description="props.error"
        icon="warning"
        tone="warning"
      />

      <q-table
        class="dashboard-table"
        flat
        bordered
        row-key="id"
        :rows="props.items"
        :columns="columns"
        :loading="props.isRefreshing"
      >
        <template #body-cell-acciones="bodyProps">
          <q-td :props="bodyProps">
            <q-btn
              dense
              color="primary"
              icon="edit"
              class="q-mr-sm"
              :disable="props.deletingId === bodyProps.row.id"
              :to="`/foros-empresariales/${bodyProps.row.id}/editar`"
            >
              <q-tooltip>Editar foro</q-tooltip>
            </q-btn>
            <q-btn
              dense
              color="negative"
              icon="delete"
              :disable="props.deletingId !== null"
              :loading="props.deletingId === bodyProps.row.id"
              @click="emit('delete', bodyProps.row.id)"
            >
              <q-tooltip>Eliminar foro</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-5 q-pa-lg">
            No hay foros empresariales registrados.
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from "quasar";
import StatePanel from "../feedback/StatePanel.vue";
import type { ForoEmpresarial } from "../../types";

const props = defineProps<{
  items: ForoEmpresarial[];
  isRefreshing: boolean;
  error: string | null;
  deletingId: string | null;
}>();

const emit = defineEmits<{
  (event: "delete", id: string): void;
}>();

const columns: QTableColumn<ForoEmpresarial>[] = [
  {
    name: "nombre",
    label: "Nombre",
    field: "nombre",
    align: "left",
    sortable: true
  },
  {
    name: "direccion",
    label: "Dirección",
    field: "direccion",
    align: "left"
  },
  {
    name: "congreso",
    label: "Congreso",
    field: row => row.congreso?.nombre ?? "",
    align: "left",
    sortable: true
  },
  {
    name: "ubicacion",
    label: "Ubicación",
    field: row => row.ubicacion?.nombre ?? "",
    align: "left",
    sortable: true
  },
  {
    name: "acciones",
    label: "Acciones",
    field: () => "",
    align: "center"
  }
];
</script>
