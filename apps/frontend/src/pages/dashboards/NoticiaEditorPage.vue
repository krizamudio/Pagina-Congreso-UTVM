<template>
  <q-page class="hero-page content-editor-page q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn
        flat
        round
        icon="arrow_back"
        aria-label="Volver"
        :to="backTarget"
      />
      <div>
        <div class="text-h4 text-weight-bold">
          {{ isEditing ? "Editar noticia" : "Nueva noticia" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          {{
            isEditing
              ? "Actualiza la información y el estado de publicación."
              : "Publica una novedad en la página oficial."
          }}
        </div>
      </div>
    </div>

    <StatePanel
      v-if="pageError"
      title="No se pudo abrir el formulario"
      :description="pageError"
      icon="warning"
      tone="warning"
    />

    <q-card v-else class="dashboard-card editor-card q-pa-md">
      <q-inner-loading :showing="loading">
        <q-spinner color="primary" size="48px" />
      </q-inner-loading>

      <q-form v-if="!loading" @submit.prevent="save">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.congreso_id"
                :dark="!isLight"
                dense
                emit-value
                map-options
                option-label="label"
                option-value="value"
                label="Congreso"
                :options="congressOptions"
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.estado"
                :dark="!isLight"
                dense
                emit-value
                map-options
                label="Estado"
                :options="statusOptions"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.titulo"
                :dark="!isLight"
                dense
                autofocus
                counter
                maxlength="200"
                label="Título"
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.cuerpo"
                :dark="!isLight"
                dense
                autogrow
                counter
                maxlength="50000"
                type="textarea"
                label="Contenido de la noticia"
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-12">
              <q-file
                v-model="selectedImage"
                :dark="!isLight"
                dense
                clearable
                accept="image/*"
                :max-file-size="MAX_IMAGE_SIZE"
                label="Imagen de portada (opcional)"
                hint="Se convierte automáticamente a WebP; máximo 5 MB"
                @rejected="notifyInvalidImage"
              >
                <template #prepend><q-icon name="image" /></template>
              </q-file>
            </div>
            <div v-if="previewUrl" class="col-12 col-md-6">
              <q-card flat bordered class="image-preview-card">
                <q-card-section>
                  <div class="text-caption q-mb-sm">Vista previa</div>
                  <img
                    :src="previewUrl"
                    alt="Vista previa de la portada de la noticia"
                    class="image-preview"
                  />
                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{
                      selectedImage
                        ? `Archivo: ${selectedImage.name}`
                        : "Portada actual"
                    }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div v-if="current?.portada && !selectedImage" class="col-12">
              <q-checkbox
                v-model="removeCurrentImage"
                :dark="!isLight"
                label="Eliminar la portada actual"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" :disable="saving" :to="backTarget" />
          <q-btn
            unelevated
            color="primary"
            type="submit"
            label="Guardar noticia"
            :loading="saving"
            :disable="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";

import StatePanel from "../../components/feedback/StatePanel.vue";
import { useCongresosQuery } from "../../composables/useCongresosQuery";
import { useThemeMode } from "../../composables/useThemeMode";
import {
  contenidoOficialService,
  getContenidoError
} from "../../services/contenidoOficialService";
import type {
  EstadoContenido,
  NoticiaContenido,
  NoticiaContenidoPayload
} from "../../types/contenido-oficial";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { isLight } = useThemeMode();
const {
  data: congresses,
  error: congressesError,
  load: loadCongresses
} = useCongresosQuery();

const current = ref<NoticiaContenido | null>(null);
const loading = ref(true);
const saving = ref(false);
const pageError = ref<string | null>(null);
const selectedImage = ref<File | null>(null);
const removeCurrentImage = ref(false);
const localPreviewUrl = ref<string | null>(null);

const form = reactive({
  congreso_id: "",
  titulo: "",
  cuerpo: "",
  estado: "borrador" as EstadoContenido
});

const editingId = computed(() => {
  const id = (route.params as Record<string, unknown>).id;
  return typeof id === "string" ? id : null;
});
const isEditing = computed(() => Boolean(editingId.value));
const requestedCongressId = computed(() =>
  typeof route.query.congreso === "string" ? route.query.congreso : ""
);
const congressOptions = computed(() =>
  congresses.value.map(congreso => ({
    label: congreso.nombre,
    value: congreso.id
  }))
);
const backTarget = computed(() => ({
  path: "/pagina-oficial",
  query: {
    tab: "noticias",
    ...(form.congreso_id ? { congreso: form.congreso_id } : {})
  }
}));
const previewUrl = computed(() => {
  if (localPreviewUrl.value) return localPreviewUrl.value;
  if (removeCurrentImage.value) return null;
  return current.value?.portada?.url ?? null;
});

const statusOptions = [
  { label: "Borrador", value: "borrador" },
  { label: "Publicada", value: "publicado" }
];

watch(selectedImage, file => {
  revokePreview();
  if (!file) return;
  removeCurrentImage.value = false;
  localPreviewUrl.value = URL.createObjectURL(file);
});

const requiredRule = (value: string) =>
  Boolean(value?.trim()) || "Este campo es obligatorio";

const revokePreview = () => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
  localPreviewUrl.value = null;
};

const notifyInvalidImage = () => {
  $q.notify({
    type: "negative",
    message: "Selecciona una imagen compatible de máximo 5 MB."
  });
};

const load = async () => {
  loading.value = true;
  pageError.value = null;
  await loadCongresses();

  if (congressesError.value) {
    pageError.value = congressesError.value;
    loading.value = false;
    return;
  }

  try {
    if (editingId.value) {
      current.value = await contenidoOficialService.getNoticia(editingId.value);
      form.congreso_id = current.value.congreso.id;
      form.titulo = current.value.titulo;
      form.cuerpo = current.value.cuerpo;
      form.estado = current.value.estado;
    } else {
      const requestedExists = congresses.value.some(
        congreso => congreso.id === requestedCongressId.value
      );
      form.congreso_id = requestedExists
        ? requestedCongressId.value
        : (congresses.value[0]?.id ?? "");
    }
  } catch (loadError) {
    console.error(loadError);
    pageError.value = getContenidoError(
      loadError,
      "No se pudo cargar la noticia."
    );
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (saving.value) return;
  saving.value = true;
  let orphanImageId: string | null = null;

  try {
    const payload: NoticiaContenidoPayload = {
      congreso_id: form.congreso_id,
      titulo: form.titulo.trim(),
      cuerpo: form.cuerpo.trim(),
      estado: form.estado
    };

    if (current.value) {
      if (selectedImage.value && current.value.portada) {
        await contenidoOficialService.updateImage(
          "noticias",
          current.value.portada.id,
          selectedImage.value
        );
      } else if (selectedImage.value) {
        const uploaded = await contenidoOficialService.uploadImage(
          "noticias",
          selectedImage.value
        );
        orphanImageId = uploaded.id;
        payload.archivo_portada_id = uploaded.id;
      } else if (removeCurrentImage.value) {
        payload.archivo_portada_id = null;
      }
      await contenidoOficialService.updateNoticia(current.value.id, payload);
    } else {
      if (selectedImage.value) {
        const uploaded = await contenidoOficialService.uploadImage(
          "noticias",
          selectedImage.value
        );
        orphanImageId = uploaded.id;
        payload.archivo_portada_id = uploaded.id;
      }
      await contenidoOficialService.createNoticia(payload);
    }

    orphanImageId = null;
    $q.notify({ type: "positive", message: "Noticia guardada correctamente." });
    await router.push(backTarget.value);
  } catch (saveError) {
    console.error(saveError);
    if (orphanImageId) {
      try {
        await contenidoOficialService.removeImage("noticias", orphanImageId);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }
    $q.notify({
      type: "negative",
      message: getContenidoError(saveError, "No se pudo guardar la noticia.")
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => void load());
onBeforeUnmount(revokePreview);
</script>

<style scoped>
.image-preview-card {
  color: var(--text-main);
  background: var(--surface-strong);
  border-color: var(--surface-border);
}

.image-preview {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 12px;
}
</style>
