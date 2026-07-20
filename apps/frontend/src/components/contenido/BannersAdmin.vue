<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h6">Banners e imágenes</div>
        <div class="text-caption text-grey-7">
          Organiza las imágenes destacadas de la página oficial.
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add_photo_alternate"
        label="Nuevo banner"
        :to="{
          path: '/pagina-oficial/banners/nuevo',
          query: { congreso: congresoId }
        }"
      />
    </div>

    <StatePanel
      v-if="error"
      class="q-mb-md"
      title="No se pudieron cargar los banners"
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
      <template #body-cell-imagen="slotProps">
        <q-td :props="slotProps">
          <q-avatar rounded size="64px" class="content-thumbnail">
            <img :src="slotProps.row.imagen.url" alt="Imagen del banner" />
          </q-avatar>
        </q-td>
      </template>

      <template #body-cell-activo="slotProps">
        <q-td :props="slotProps">
          <q-badge :color="slotProps.row.activo ? 'positive' : 'grey-7'">
            {{ slotProps.row.activo ? "Activo" : "Inactivo" }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-urlEnlace="slotProps">
        <q-td :props="slotProps">
          <span class="ellipsis link-cell">
            {{ slotProps.row.urlEnlace || "Sin enlace" }}
          </span>
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
              path: `/pagina-oficial/banners/${slotProps.row.id}/editar`,
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
          No hay banners para {{ congresoNombre }}.
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
import type { BannerContenido } from "../../types/contenido-oficial";

const props = defineProps<{
  congresoId: string;
  congresoNombre: string;
}>();

const $q = useQuasar();
const items = ref<BannerContenido[]>([]);
const loading = ref(false);
const deletingId = ref<string | null>(null);
const error = ref<string | null>(null);

const columns: QTableColumn<BannerContenido>[] = [
  { name: "imagen", label: "Imagen", field: "imagen", align: "center" },
  {
    name: "titulo",
    label: "Título",
    field: row => row.titulo ?? "",
    align: "left"
  },
  {
    name: "urlEnlace",
    label: "Enlace",
    field: "urlEnlace",
    align: "left"
  },
  {
    name: "orden",
    label: "Orden",
    field: "orden",
    align: "center",
    sortable: true
  },
  {
    name: "activo",
    label: "Estado",
    field: "activo",
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
    items.value = await contenidoOficialService.listBanners();
  } catch (loadError) {
    console.error(loadError);
    error.value = getContenidoError(
      loadError,
      "No se pudieron obtener los banners."
    );
  } finally {
    loading.value = false;
  }
};

const confirmRemove = (item: BannerContenido) => {
  $q.dialog({
    title: "Eliminar banner",
    message: `¿Seguro que deseas eliminar “${item.titulo || "Banner sin título"}”?`,
    cancel: { label: "Cancelar", flat: true },
    persistent: true
  }).onOk(async () => {
    deletingId.value = item.id;
    try {
      await contenidoOficialService.removeBanner(item.id);
      $q.notify({ type: "positive", message: "Banner eliminado." });
      await load();
    } catch (removeError) {
      console.error(removeError);
      $q.notify({
        type: "negative",
        message: getContenidoError(
          removeError,
          "No se pudo eliminar el banner."
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

.link-cell {
  display: inline-block;
  max-width: 260px;
}
</style>
