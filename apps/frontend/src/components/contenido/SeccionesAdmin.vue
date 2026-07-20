<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h6">Información general</div>
        <div class="text-caption text-grey-7">
          Edita secciones como Acerca de, Objetivos o Información de contacto.
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Nueva sección"
        :to="{
          path: '/pagina-oficial/secciones/nueva',
          query: { congreso: congresoId }
        }"
      />
    </div>

    <StatePanel
      v-if="error"
      class="q-mb-md"
      title="No se pudieron cargar las secciones"
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
      :loading="loading"
    >
      <template #body-cell-estado="slotProps">
        <q-td :props="slotProps">
          <q-badge
            :color="
              slotProps.row.estado === 'publicado' ? 'positive' : 'grey-7'
            "
          >
            {{
              slotProps.row.estado === "publicado" ? "Publicada" : "Borrador"
            }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acciones="slotProps">
        <q-td :props="slotProps">
          <q-btn
            dense
            flat
            round
            icon="edit"
            color="primary"
            :disable="deletingId !== null"
            :to="{
              path: `/pagina-oficial/secciones/${slotProps.row.id}/editar`,
              query: { congreso: congresoId }
            }"
          />
          <q-btn
            dense
            flat
            round
            icon="delete"
            color="negative"
            :disable="deletingId !== null"
            :loading="deletingId === slotProps.row.id"
            @click="confirmRemove(slotProps.row)"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center text-grey-7 q-pa-lg">
          No hay secciones para {{ congresoNombre }}.
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar, type QTableColumn } from "quasar";

import StatePanel from "../feedback/StatePanel.vue";
import {
  contenidoOficialService,
  getContenidoError
} from "../../services/contenidoOficialService";
import type { SeccionContenido } from "../../types/contenido-oficial";

const props = defineProps<{
  congresoId: string;
  congresoNombre: string;
}>();

const $q = useQuasar();
const items = ref<SeccionContenido[]>([]);
const loading = ref(false);
const deletingId = ref<string | null>(null);
const error = ref<string | null>(null);

const columns: QTableColumn<SeccionContenido>[] = [
  {
    name: "clave",
    label: "Clave",
    field: "clave",
    align: "left",
    sortable: true
  },
  {
    name: "titulo",
    label: "Título",
    field: "titulo",
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
  {
    name: "acciones",
    label: "Acciones",
    field: () => "",
    align: "center"
  }
];

const filteredItems = computed(() =>
  items.value.filter(item => item.congreso.id === props.congresoId)
);

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    items.value = await contenidoOficialService.listSecciones();
  } catch (loadError) {
    console.error(loadError);
    error.value = getContenidoError(
      loadError,
      "No se pudieron obtener las secciones."
    );
  } finally {
    loading.value = false;
  }
};

const confirmRemove = (item: SeccionContenido) => {
  $q.dialog({
    title: "Eliminar sección",
    message: `¿Seguro que deseas eliminar “${item.titulo}”?`,
    cancel: { label: "Cancelar", flat: true },
    persistent: true
  }).onOk(async () => {
    deletingId.value = item.id;
    try {
      await contenidoOficialService.removeSeccion(item.id);
      $q.notify({ type: "positive", message: "Sección eliminada." });
      await load();
    } catch (removeError) {
      console.error(removeError);
      $q.notify({
        type: "negative",
        message: getContenidoError(
          removeError,
          "No se pudo eliminar la sección."
        )
      });
    } finally {
      deletingId.value = null;
    }
  });
};

onMounted(() => void load());
</script>
