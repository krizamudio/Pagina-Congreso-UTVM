<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Panelistas</div>
        <div class="text-subtitle2 text-grey-7">
          Lista de panelistas del congreso.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          label="Nuevo panelista"
          icon="add"
          unelevated
          color="primary"
          @click="goToNew"
        />
      </div>
    </div>

    <PanelesList
      :items="data"
      :is-refreshing="isRefreshing"
      :error="error"
      :deleting-id="deletingId"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import PanelesList from "../../components/list/PanelesList.vue";
import { useDeleteConfirmation } from "../../composables/useDeleteConfirmation";
import { usePanelesQuery } from "../../composables/usePanelesQuery";

const router = useRouter();
const $q = useQuasar();
const { confirmDelete } = useDeleteConfirmation();
const { data, isRefreshing, error, load, remove } = usePanelesQuery();
const deletingId = ref<string | null>(null);

const goToNew = () => {
  void router.push("/paneles/nuevo");
};

const handleEdit = (id: string) => {
  void router.push(`/paneles/${id}/editar`);
};

const notify = (type: "positive" | "negative", message: string) => {
  if (typeof $q.notify === "function") {
    $q.notify({
      type,
      message,
      position: "top",
      timeout: 3200,
      multiLine: true,
      progress: true,
      textColor: type === "negative" ? "white" : "black",
      classes: `app-notify app-notify-${type}`
    });
    return;
  }

  console.warn(`[${type}] ${message}`);
};

const handleDelete = async (id: string) => {
  if (deletingId.value) return;

  const confirmed = await confirmDelete({
    title: "Eliminar panelista",
    message: "¿Seguro que deseas eliminar este panelista?"
  });
  if (!confirmed) return;

  deletingId.value = id;
  try {
    await remove(id);
    notify("positive", "Panelista eliminado correctamente.");
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo eliminar el panelista.");
  } finally {
    deletingId.value = null;
  }
};

onMounted(() => {
  void load();
});
</script>
