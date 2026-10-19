<template>
  <q-page class="hero-page q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        aria-label="Volver"
        :disable="isLoading || isPending"
        to="/ubicaciones"
      />
      <div>
        <div class="text-h4 text-weight-bold">
          {{ editing ? "Editar ubicación" : "Nueva ubicación" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          {{
            editing
              ? "Actualiza el nombre o la capacidad."
              : "Registra un espacio disponible para actividades."
          }}
        </div>
      </div>
    </div>
    <q-card class="dashboard-card q-pa-md"
      ><q-card-section>
        <div
          v-if="isLoading"
          class="row items-center justify-center q-gutter-sm q-pa-lg text-grey-5"
        >
          <q-spinner color="primary" size="2em" />
          <span>Cargando ubicación...</span>
        </div>
        <StatePanel
          v-else-if="loadError"
          title="No se pudo cargar"
          :description="loadError"
          icon="warning"
          tone="warning"
        />
        <UbicacionForm
          ref="formRef"
          v-else
          :initial-data="record"
          :loading="isPending"
          :persist-draft="!editing"
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
const formRef = ref<{ clearDraft: () => void } | null>(null);
const isLoading = ref(false);
const isPending = ref(false);
const loadError = ref<string | null>(null);
const apiMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
};
const save = async (payload: UbicacionPayload) => {
  if (isPending.value) return;
  isPending.value = true;
  try {
    if (editing.value) {
      await update(id.value, payload);
    } else {
      await create(payload);
      formRef.value?.clearDraft();
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
