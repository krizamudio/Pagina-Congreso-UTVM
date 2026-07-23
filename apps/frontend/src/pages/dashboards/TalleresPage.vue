<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Talleres</div>
        <div class="text-subtitle2 text-grey-7">
          lista de talleres del congreso.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          label="Nuevo taller"
          icon="add"
          unelevated
          color="primary"
          @click="goToNew"
        />
      </div>
    </div>

    <TallerList
      :items="data"
      :tallerista-names="talleristaNames"
      :is-refreshing="isRefreshing"
      :error="error"
      :deleting-id="deletingId"
      @edit="handleEdit"
      @delete="handleDelete"
      @recognitions="handleRecognitions"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import TallerList from "../../components/list/TallerList.vue";
import { useDeleteConfirmation } from "../../composables/useDeleteConfirmation";
import { useTalleresQuery } from "../../composables/useTalleresQuery";
import { usePonente } from "../../composables/usePonente";

const router = useRouter();
const $q = useQuasar();
const { confirmDelete } = useDeleteConfirmation();
const { data, isRefreshing, error, load, remove } = useTalleresQuery();
const deletingId = ref<string | null>(null);
const { useGetPonentes } = usePonente();
const { data: ponentes, refetch: loadPonentes } = useGetPonentes(50, 0, null);

const talleristaNames = computed(() => {
  return ponentes.value.reduce<Record<string, string>>(
    (accumulator, ponente) => {
      accumulator[ponente.id] = ponente.nombre;
      return accumulator;
    },
    {}
  );
});

const goToNew = () => {
  void router.push("/talleres/nuevo");
};

const handleEdit = (id: string) => {
  void router.push(`/talleres/${id}/editar`);
};

const handleRecognitions = (id: string) => {
  void router.push({ path: "/reconocimientos", query: { tallerId: id } });
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
    title: "Eliminar taller",
    message: "¿Seguro que deseas eliminar este taller?"
  });
  if (!confirmed) return;

  deletingId.value = id;
  try {
    await remove(id);
    notify("positive", "Taller eliminado correctamente.");
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo eliminar el taller.");
  } finally {
    deletingId.value = null;
  }
};

onMounted(() => {
  void load();
  void loadPonentes();
});
</script>
