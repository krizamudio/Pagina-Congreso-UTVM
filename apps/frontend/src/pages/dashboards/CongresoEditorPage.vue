<template>
  <q-page class="hero-page q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        aria-label="Volver"
        :disable="isLoading || isPending"
        to="/congresos"
      />
      <div>
        <div class="text-h4 text-weight-bold">
          {{ editing ? "Editar congreso" : "Nuevo congreso" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          {{
            editing
              ? "Actualiza los datos de esta edición."
              : "Registra una nueva edición del congreso."
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
          <span>Cargando congreso...</span>
        </div>
        <StatePanel
          v-else-if="loadError"
          title="No se pudo cargar"
          :description="loadError"
          icon="warning"
          tone="warning"
        />
        <CongresoForm
          ref="formRef"
          v-else
          :initial-data="record"
          :loading="isPending"
          :submit-label="editing ? 'Actualizar congreso' : 'Guardar congreso'"
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
import CongresoForm from "../../components/forms/CongresoForm.vue";
import StatePanel from "../../components/feedback/StatePanel.vue";
import { useCongresosQuery } from "../../composables/useCongresosQuery";
import type { Congreso, CongresoPayload } from "../../types";

const route = useRoute() as unknown as { params: { id?: string } };
const router = useRouter();
const $q = useQuasar();
const id = computed(() =>
  typeof route.params.id === "string" ? route.params.id : ""
);
const editing = computed(() => !!id.value);
const { getById, create, update } = useCongresosQuery();
const record = ref<Congreso | null>(null);
const formRef = ref<{ clearDraft: () => void } | null>(null);
const isLoading = ref(false);
const isPending = ref(false);
const loadError = ref<string | null>(null);
const apiMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
};
const save = async (payload: CongresoPayload) => {
  if (isPending.value) return;
  isPending.value = true;
  try {
    if (editing.value) {
      await update(id.value, payload);
    } else {
      await create(payload);
    }
    formRef.value?.clearDraft();
    $q.notify({
      type: "positive",
      message: `Congreso ${editing.value ? "actualizado" : "creado"} correctamente.`
    });
    await router.push("/congresos");
  } catch (error) {
    $q.notify({
      type: "negative",
      message: apiMessage(error, "No se pudo guardar el congreso."),
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
    loadError.value = apiMessage(error, "No se pudo cargar el congreso.");
  } finally {
    isLoading.value = false;
  }
});
</script>
