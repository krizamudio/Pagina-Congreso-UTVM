<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg"
      ><div
        ><div class="text-h4 text-weight-bold">{{
          editing ? "Editar ubicación" : "Nueva ubicación"
        }}</div
        ><div class="text-subtitle2 text-grey-7">{{
          editing
            ? "Actualiza el nombre o la capacidad."
            : "Registra un espacio disponible para actividades."
        }}</div></div
      ><q-btn flat label="Volver" to="/ubicaciones"
    /></div>
    <q-card class="dashboard-card q-pa-md"
      ><q-card-section>
        <div v-if="isLoading" class="text-grey-5">Cargando ubicación...</div>
        <StatePanel
          v-else-if="loadError"
          title="No se pudo cargar"
          :description="loadError"
          icon="warning"
          tone="warning"
        />
        <UbicacionForm
          v-else
          :initial-data="record"
          :loading="isPending"
          :submit-label="editing ? 'Actualizar ubicación' : 'Guardar ubicación'"
          @submit="save"
        /> </q-card-section
    ></q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { isAxiosError } from "axios";
import UbicacionForm from "../../components/forms/UbicacionForm.vue";
import StatePanel from "../../components/feedback/StatePanel.vue";
import { useUbicacionesQuery } from "../../composables/useUbicacionesQuery";
import type { Ubicacion, UbicacionPayload } from "../../types";
const route = useRoute() as unknown as { params: { id?: string } };
const router = useRouter();
const $q = useQuasar();
const id = computed(() =>
  typeof route.params.id === "string" ? route.params.id : ""
);
const editing = computed(() => !!id.value);
const { getById, create, update } = useUbicacionesQuery();
const record = ref<Ubicacion | null>(null);
const isLoading = ref(false);
const isPending = ref(false);
const loadError = ref<string | null>(null);
const apiMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
};
const save = async (payload: UbicacionPayload) => {
  isPending.value = true;
  try {
    if (editing.value) {
      await update(id.value, payload);
    } else {
      await create(payload);
    }
    $q.notify({
      type: "positive",
      message: `Ubicación ${editing.value ? "actualizada" : "creada"} correctamente.`
    });
    await router.push("/ubicaciones");
  } catch (error) {
    $q.notify({
      type: "negative",
      message: apiMessage(error, "No se pudo guardar la ubicación."),
      multiLine: true
    });
  } finally {
    isPending.value = false;
  }
};
onMounted(async () => {
  if (!editing.value) return;
  isLoading.value = true;
  try {
    record.value = await getById(id.value);
  } catch (error) {
    loadError.value = apiMessage(error, "No se pudo cargar la ubicación.");
  } finally {
    isLoading.value = false;
  }
});
</script>
