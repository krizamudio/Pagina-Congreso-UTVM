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
          {{ isEditing ? "Editar banner" : "Nuevo banner" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          Gestiona las imágenes destacadas de la página oficial.
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
              <q-input
                v-model.number="form.orden"
                :dark="!isLight"
                dense
                min="0"
                type="number"
                label="Orden"
                :rules="[orderRule]"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.titulo"
                :dark="!isLight"
                dense
                autofocus
                counter
                maxlength="150"
                label="Título (opcional)"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.url_enlace"
                :dark="!isLight"
                dense
                counter
                maxlength="500"
                type="url"
                label="Enlace HTTP(S) (opcional)"
                :rules="[urlRule]"
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
                :label="
                  isEditing
                    ? 'Reemplazar imagen (opcional)'
                    : 'Imagen del banner'
                "
                hint="Se convierte automáticamente a WebP; máximo 5 MB"
                :rules="[imageRule]"
                @rejected="notifyInvalidImage"
              >
                <template #prepend><q-icon name="image" /></template>
              </q-file>
            </div>
            <div v-if="previewUrl" class="col-12 col-md-7">
              <q-card flat bordered class="image-preview-card">
                <q-card-section>
                  <div class="text-caption q-mb-sm">Vista previa</div>
                  <img
                    :src="previewUrl"
                    alt="Vista previa de la imagen del banner"
                    class="image-preview"
                  />
                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{
                      selectedImage
                        ? `Archivo: ${selectedImage.name}`
                        : "Imagen actual"
                    }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12">
              <q-toggle
                v-model="form.activo"
                :dark="!isLight"
                color="positive"
                label="Mostrar este banner en la página oficial"
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
            label="Guardar banner"
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
  BannerContenido,
  BannerContenidoPayload
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

const current = ref<BannerContenido | null>(null);
const loading = ref(true);
const saving = ref(false);
const pageError = ref<string | null>(null);
const selectedImage = ref<File | null>(null);
const localPreviewUrl = ref<string | null>(null);

const form = reactive({
  congreso_id: "",
  titulo: "",
  url_enlace: "",
  activo: true,
  orden: 0
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
    tab: "banners",
    ...(form.congreso_id ? { congreso: form.congreso_id } : {})
  }
}));
const previewUrl = computed(
  () => localPreviewUrl.value ?? current.value?.imagen.url ?? null
);

watch(selectedImage, file => {
  revokePreview();
  if (file) localPreviewUrl.value = URL.createObjectURL(file);
});

const requiredRule = (value: string) =>
  Boolean(value?.trim()) || "Este campo es obligatorio";
const orderRule = (value: number | null) =>
  (Number.isInteger(Number(value)) && Number(value) >= 0) ||
  "El orden debe ser un entero mayor o igual a cero";
const urlRule = (value: string) => {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) || "Usa una URL HTTP(S)";
  } catch {
    return "Ingresa una URL válida";
  }
};
const imageRule = (value: File | null) =>
  Boolean(value || current.value) || "La imagen es obligatoria";

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
      current.value = await contenidoOficialService.getBanner(editingId.value);
      form.congreso_id = current.value.congreso.id;
      form.titulo = current.value.titulo ?? "";
      form.url_enlace = current.value.urlEnlace ?? "";
      form.activo = current.value.activo;
      form.orden = current.value.orden;
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
      "No se pudo cargar el banner."
    );
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (saving.value || (!current.value && !selectedImage.value)) return;
  saving.value = true;
  let orphanImageId: string | null = null;

  try {
    if (current.value) {
      const payload: Partial<BannerContenidoPayload> = {
        congreso_id: form.congreso_id,
        titulo: form.titulo.trim() || null,
        url_enlace: form.url_enlace.trim() || null,
        activo: form.activo,
        orden: Number(form.orden)
      };

      if (selectedImage.value) {
        await contenidoOficialService.updateImage(
          "banners",
          current.value.imagen.id,
          selectedImage.value
        );
      }
      await contenidoOficialService.updateBanner(current.value.id, payload);
    } else if (selectedImage.value) {
      const uploaded = await contenidoOficialService.uploadImage(
        "banners",
        selectedImage.value
      );
      orphanImageId = uploaded.id;
      await contenidoOficialService.createBanner({
        congreso_id: form.congreso_id,
        archivo_multimedia_id: uploaded.id,
        titulo: form.titulo.trim() || null,
        url_enlace: form.url_enlace.trim() || null,
        activo: form.activo,
        orden: Number(form.orden)
      });
    }

    orphanImageId = null;
    $q.notify({ type: "positive", message: "Banner guardado correctamente." });
    await router.push(backTarget.value);
  } catch (saveError) {
    console.error(saveError);
    if (orphanImageId) {
      try {
        await contenidoOficialService.removeImage("banners", orphanImageId);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }
    $q.notify({
      type: "negative",
      message: getContenidoError(saveError, "No se pudo guardar el banner.")
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
