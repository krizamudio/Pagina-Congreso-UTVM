<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h6">Noticias</div>
        <div class="text-caption text-grey-7">
          Publica novedades y administra su imagen de portada.
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Nueva noticia"
        :to="{
          path: '/pagina-oficial/noticias/nueva',
          query: { congreso: congresoId }
        }"
      />
    </div>

    <StatePanel
      v-if="error"
      class="q-mb-md"
      title="No se pudieron cargar las noticias"
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
      <template #body-cell-portada="slotProps">
        <q-td :props="slotProps">
          <q-avatar
            v-if="slotProps.row.portada"
            rounded
            size="46px"
            class="content-thumbnail"
          >
            <img :src="slotProps.row.portada.url" alt="Portada de noticia" />
          </q-avatar>
          <q-icon v-else name="image_not_supported" size="24px" />
        </q-td>
      </template>

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

      <template #body-cell-fechaPublicacion="slotProps">
        <q-td :props="slotProps">
          {{ formatDate(slotProps.row.fechaPublicacion) }}
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
              path: `/pagina-oficial/noticias/${slotProps.row.id}/editar`,
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
          No hay noticias para {{ congresoNombre }}.
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
import type { NoticiaContenido } from "../../types/contenido-oficial";

const props = defineProps<{
  congresoId: string;
  congresoNombre: string;
}>();

const $q = useQuasar();
const items = ref<NoticiaContenido[]>([]);
const loading = ref(false);
const deletingId = ref<string | null>(null);
const error = ref<string | null>(null);

const columns: QTableColumn<NoticiaContenido>[] = [
  { name: "portada", label: "Portada", field: "portada", align: "center" },
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
    name: "fechaPublicacion",
    label: "Publicación",
    field: "fechaPublicacion",
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

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value))
    : "Sin publicar";

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    items.value = await contenidoOficialService.listNoticias();
  } catch (loadError) {
    console.error(loadError);
    error.value = getContenidoError(
      loadError,
      "No se pudieron obtener las noticias."
    );
  } finally {
    loading.value = false;
  }
};

const confirmRemove = (item: NoticiaContenido) => {
  $q.dialog({
    title: "Eliminar noticia",
    message: `¿Seguro que deseas eliminar “${item.titulo}”?`,
    cancel: { label: "Cancelar", flat: true },
    persistent: true
  }).onOk(async () => {
    deletingId.value = item.id;
    try {
      await contenidoOficialService.removeNoticia(item.id);
      $q.notify({ type: "positive", message: "Noticia eliminada." });
      await load();
    } catch (removeError) {
      console.error(removeError);
      $q.notify({
        type: "negative",
        message: getContenidoError(
          removeError,
          "No se pudo eliminar la noticia."
        )
      });
    } finally {
      deletingId.value = null;
    }
  });
};

onMounted(() => void load());
</script>

<style scoped>
.content-thumbnail {
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>
