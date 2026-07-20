<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" aria-label="Volver" @click="goBack" />
      <div>
        <div class="text-h4 text-weight-bold">Nuevo ponente o panelista</div>
        <div class="text-subtitle2 text-grey-7"
          >Registra un ponente o panelista.</div
        >
      </div>
    </div>

    <q-card class="dashboard-card q-pa-md">
      <q-card-section>
        <NewPonenteForm
          @submit="handleSubmit"
          :loading="isPending || isSubmitting"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
import NewPonenteForm from "../../components/forms/NewPonenteForm.vue";
import { usePonente } from "../../composables/usePonente";
import type { PonentePayload } from "../../types";
import { api } from "../../services/api";
import { convertImageToWebp } from "../../utils/convertImageToWebp";

interface NewPonenteSubmitPayload {
  ponente: PonentePayload;
  foto: File | null;
}

const router = useRouter();
const $q = useQuasar();
const { useCreatePonente } = usePonente();
const { mutate: createPonente, isPending } = useCreatePonente();
const isSubmitting = ref(false);
const ponentePhotoUploadEndpoint =
  (
    import.meta.env.VITE_UPLOAD_PONENTE_PHOTO_ENDPOINT as string | undefined
  )?.trim() || "fotos";

const notify = (type: "positive" | "negative" | "warning", message: string) => {
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

const goBack = () => {
  void router.push("/ponentes");
};

const handleSubmit = async ({ ponente, foto }: NewPonenteSubmitPayload) => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const payload: PonentePayload = { ...ponente };

    // Ignore any stale persisted id; only keep archivo_foto_id when upload succeeds in this submit.
    delete (payload as Partial<PonentePayload>).archivo_foto_id;

    if (foto) {
      const optimizedPhoto = await convertImageToWebp(foto);
      const uploadFormData = new FormData();
      uploadFormData.append("foto", optimizedPhoto);

      const uploadResponse = await api.post(
        ponentePhotoUploadEndpoint,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const uploadedPhotoId =
        uploadResponse.data?.id ??
        uploadResponse.data?.archivo_foto_id ??
        uploadResponse.data?.data?.id ??
        uploadResponse.data?.data?.archivo_foto_id;

      if (typeof uploadedPhotoId === "string" && uploadedPhotoId.length > 0) {
        payload.archivo_foto_id = uploadedPhotoId;
      } else {
        throw new Error("La subida de foto no devolvio un id valido.");
      }
    }

    await createPonente(payload);
    notify("positive", `${ponente.tipo} creado correctamente.`);
    void router.push("/ponentes");
  } catch (err) {
    console.error("Error al crear el participante:", err);

    let detail = "";
    if (axios.isAxiosError(err)) {
      const backendMessage = err.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        detail = backendMessage.join(" | ");
      } else if (
        typeof backendMessage === "string" &&
        backendMessage.length > 0
      ) {
        detail = backendMessage;
      }
    } else if (err instanceof Error && err.message.length > 0) {
      detail = err.message;
    }

    notify(
      "negative",
      detail
        ? `No se pudo crear el participante. ${detail}`
        : "No se pudo crear el participante."
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
