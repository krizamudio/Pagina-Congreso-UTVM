<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Conferencias</div>
        <div class="text-subtitle2 text-grey-7">
          Lista de conferencias del congreso.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          label="Nueva conferencia"
          icon="add"
          unelevated
          color="primary"
          @click="goToNewConference"
        />
      </div>
    </div>

    <ConferenciaList
      :items="data"
      :ponente-names="ponenteNames"
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
import ConferenciaList from "../../components/list/ConferenciaList.vue";
import { useConferenciasQuery } from "../../composables/useConferenciasQuery";
import { useDeleteConfirmation } from "../../composables/useDeleteConfirmation";
import { usePonente } from "../../composables/usePonente";

const router = useRouter();
const $q = useQuasar();
const { confirmDelete } = useDeleteConfirmation();
const { data, isRefreshing, error, load, remove } = useConferenciasQuery();
const deletingId = ref<string | null>(null);
const { useGetPonentes } = usePonente();
const { data: ponentes, refetch: loadPonentes } = useGetPonentes(50, 0, null);

const ponenteNames = computed(() => {
  return ponentes.value.reduce<Record<string, string>>(
    (accumulator, ponente) => {
      accumulator[ponente.id] = ponente.nombre;
      return accumulator;
    },
    {}
  );
});

const goToNewConference = () => {
  void router.push("/conferencias/nueva");
};

const handleEdit = (id: string) => {
  void router.push(`/conferencias/${id}/editar`);
};

const handleRecognitions = (id: string) => {
  void router.push({
    path: "/reconocimientos",
    query: { conferenciaId: id }
  });
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
    title: "Eliminar conferencia",
    message: "¿Seguro que deseas eliminar esta conferencia?"
  });
  if (!confirmed) return;

  deletingId.value = id;
  try {
    await remove(id);
    notify("positive", "Conferencia eliminada correctamente.");
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo eliminar la conferencia.");
  } finally {
    deletingId.value = null;
  }
};

onMounted(() => {
  void load();
  void loadPonentes();
});
</script>
