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
          {{ isEditing ? "Editar sección" : "Nueva sección" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          Modifica la información general que aparece en la página oficial.
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
            <div class="col-12 col-md-5">
              <q-input
                v-model="form.clave_seccion"
                :dark="!isLight"
                dense
                autofocus
                counter
                maxlength="100"
                label="Clave de sección"
                hint="Ejemplo: acerca-de"
                :rules="[requiredRule, sectionKeyRule]"
                @update:model-value="normalizeKey"
              />
            </div>
            <div class="col-12 col-md-7">
              <q-input
                v-model.trim="form.titulo"
                :dark="!isLight"
                dense
                counter
                maxlength="200"
                label="Título visible"
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
                label="Contenido"
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
            label="Guardar sección"
            :loading="saving"
            :disable="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
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
  SeccionContenido,
  SeccionContenidoPayload
} from "../../types/contenido-oficial";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { isLight } = useThemeMode();
const {
  data: congresses,
  error: congressesError,
  load: loadCongresses
} = useCongresosQuery();

const current = ref<SeccionContenido | null>(null);
const loading = ref(true);
const saving = ref(false);
const pageError = ref<string | null>(null);

const form = reactive({
  congreso_id: "",
  clave_seccion: "",
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
    tab: "informacion",
    ...(form.congreso_id ? { congreso: form.congreso_id } : {})
  }
}));

const statusOptions = [
  { label: "Borrador", value: "borrador" },
  { label: "Publicada", value: "publicado" }
];

const requiredRule = (value: string) =>
  Boolean(value?.trim()) || "Este campo es obligatorio";
const sectionKeyRule = (value: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
  "Usa minúsculas, números y guiones";

const normalizeKey = (value: string | number | null) => {
  form.clave_seccion = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
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
      current.value = await contenidoOficialService.getSeccion(editingId.value);
      form.congreso_id = current.value.congreso.id;
      form.clave_seccion = current.value.clave;
      form.titulo = current.value.titulo;
      form.cuerpo = current.value.cuerpo ?? "";
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
      "No se pudo cargar la sección."
    );
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    const payload: SeccionContenidoPayload = {
      congreso_id: form.congreso_id,
      clave_seccion: form.clave_seccion,
      titulo: form.titulo.trim(),
      cuerpo: form.cuerpo.trim() || null,
      estado: form.estado
    };

    if (current.value) {
      await contenidoOficialService.updateSeccion(current.value.id, payload);
    } else {
      await contenidoOficialService.createSeccion(payload);
    }

    $q.notify({ type: "positive", message: "Sección guardada correctamente." });
    await router.push(backTarget.value);
  } catch (saveError) {
    console.error(saveError);
    $q.notify({
      type: "negative",
      message: getContenidoError(saveError, "No se pudo guardar la sección.")
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => void load());
</script>
