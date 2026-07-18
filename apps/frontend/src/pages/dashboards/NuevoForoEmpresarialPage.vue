<template>
  <q-page class="hero-page q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Nuevo foro empresarial</div>
        <div class="text-subtitle2 text-grey-7">
          Registra la información y el logo del foro.
        </div>
      </div>
      <q-btn flat label="Volver" to="/foros-empresariales" />
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <ForoEmpresarialForm
          ref="formRef"
          :loading="isPending"
          persist-draft
          submit-label="Guardar foro"
          @submit="save"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { isAxiosError } from "axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import ForoEmpresarialForm from "../../components/forms/ForoEmpresarialForm.vue";
import { useForosEmpresarialesQuery } from "../../composables/useForosEmpresarialesQuery";
import { api } from "../../services/api";
import type {
  ForoEmpresarialFormSubmit,
  ForoEmpresarialLogo,
  ForoEmpresarialPayload
} from "../../types";

const router = useRouter();
const $q = useQuasar();
const { create } = useForosEmpresarialesQuery();
const isPending = ref(false);
const formRef = ref<{ clearDraft: () => void } | null>(null);

const apiMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
};

const uploadLogo = async (logo: File) => {
  const formData = new FormData();
  formData.append("foto", logo);
  const response = await api.post<ForoEmpresarialLogo>("fotos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

const save = async ({ foro, logo }: ForoEmpresarialFormSubmit) => {
  isPending.value = true;

  try {
    const payload: ForoEmpresarialPayload = { ...foro };
    if (logo) {
      const uploadedLogo = await uploadLogo(logo);
      payload.archivo_logo_id = uploadedLogo.id;
    }

    await create(payload);
    formRef.value?.clearDraft();
    $q.notify({
      type: "positive",
      message: "Foro empresarial creado correctamente."
    });
    await router.push("/foros-empresariales");
  } catch (error) {
    console.error(error);
    $q.notify({
      type: "negative",
      message: apiMessage(error, "No se pudo crear el foro empresarial."),
      multiLine: true
    });
  } finally {
    isPending.value = false;
  }
};
</script>
