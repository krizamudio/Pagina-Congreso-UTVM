<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Foros empresariales</div>
        <div class="text-subtitle2 text-grey-7">
          Administra los foros empresariales del congreso.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nuevo foro"
          to="/foros-empresariales/nuevo"
        />
      </div>
    </div>

    <ForosEmpresarialesList
      :items="data"
      :is-refreshing="isRefreshing"
      :error="error"
      :deleting-id="deletingId"
      @delete="confirmRemove"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import ForosEmpresarialesList from "../../components/list/ForosEmpresarialesList.vue";
import { useForosEmpresarialesQuery } from "../../composables/useForosEmpresarialesQuery";

const $q = useQuasar();
const { data, isRefreshing, error, load, remove } =
  useForosEmpresarialesQuery();
const deletingId = ref<string | null>(null);

const confirmRemove = (id: string) => {
  $q.dialog({
    title: "Eliminar foro empresarial",
    message: "¿Seguro que deseas eliminar este foro empresarial?",
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if (deletingId.value) return;

    deletingId.value = id;
    try {
      await remove(id);
      $q.notify({
        type: "positive",
        message: "Foro empresarial eliminado correctamente."
      });
      await load();
    } catch (removeError) {
      console.error(removeError);
      $q.notify({
        type: "negative",
        message: "No se pudo eliminar el foro empresarial."
      });
    } finally {
      deletingId.value = null;
    }
  });
};

onMounted(() => void load());
</script>
