<template>
  <q-page class="hero-page q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        aria-label="Volver"
        to="/foros-empresariales"
      />
      <div>
        <div class="text-h4 text-weight-bold">Editar foro empresarial</div>
        <div class="text-subtitle2 text-grey-7">
          Actualiza la información y el logo del foro.
        </div>
      </div>
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <div v-if="isLoading" class="text-grey-5">
          Cargando foro empresarial...
        </div>
        <StatePanel
          v-else-if="loadError"
          title="No se pudo cargar"
          :description="loadError"
          icon="warning"
          tone="warning"
        />
        <ForoEmpresarialForm
          v-else
          :initial-data="initialData"
          :current-logo="record?.logo ?? null"
          :loading="isPending"
          submit-label="Actualizar foro"
          @submit="save"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import ForoEmpresarialForm from "../../components/forms/ForoEmpresarialForm.vue";
import StatePanel from "../../components/feedback/StatePanel.vue";
import { useForosEmpresarialesQuery } from "../../composables/useForosEmpresarialesQuery";
import { api } from "../../services/api";
import type {
  ForoEmpresarial,
  ForoEmpresarialFormSubmit,
  ForoEmpresarialLogo,
  ForoEmpresarialPayload
} from "../../types";
import { convertImageToWebp } from "../../utils/convertImageToWebp";

const route = useRoute() as unknown as { params: { id?: string } };
const router = useRouter();
const $q = useQuasar();
const { getById, update } = useForosEmpresarialesQuery();
const id = computed(() =>
  typeof route.params.id === "string" ? route.params.id : ""
);
const record = ref<ForoEmpresarial | null>(null);
const isLoading = ref(false);
const isPending = ref(false);
const loadError = ref<string | null>(null);

const initialData = computed<Partial<ForoEmpresarialPayload>>(() => ({
  nombre: record.value?.nombre ?? "",
  direccion: record.value?.direccion ?? "",
  resena: record.value?.resena ?? "",
  congreso_id: record.value?.congreso.id ?? "",
  ubicacion_id: record.value?.ubicacion.id ?? ""
}));

const apiMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message) ? message.join(" ") : message || fallback;
  }

  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
};

const uploadLogo = async (logo: File) => {
  const optimizedLogo = await convertImageToWebp(logo);
  const formData = new FormData();
  formData.append("foto", optimizedLogo);
  const response = await api.post<ForoEmpresarialLogo>("fotos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

const load = async () => {
  if (!id.value) {
    loadError.value = "El identificador del foro no es válido.";
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  try {
    record.value = await getById(id.value);
  } catch (error) {
    console.error(error);
    loadError.value = apiMessage(
      error,
      "No se pudo cargar el foro empresarial."
    );
  } finally {
    isLoading.value = false;
  }
};

const save = async ({
  foro,
  logo,
  eliminarLogo
}: ForoEmpresarialFormSubmit) => {
  isPending.value = true;

  try {
    const payload: ForoEmpresarialPayload = { ...foro };
    if (logo) {
      const uploadedLogo = await uploadLogo(logo);
      payload.archivo_logo_id = uploadedLogo.id;
    } else if (eliminarLogo) {
      payload.archivo_logo_id = null;
    }

    await update(id.value, payload);
    $q.notify({
      type: "positive",
      message: "Foro empresarial actualizado correctamente."
    });
    await router.push("/foros-empresariales");
  } catch (error) {
    console.error(error);
    $q.notify({
      type: "negative",
      message: apiMessage(error, "No se pudo actualizar el foro empresarial."),
      multiLine: true
    });
  } finally {
    isPending.value = false;
  }
};

onMounted(() => void load());
</script>
