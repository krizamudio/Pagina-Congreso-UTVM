<template>
  <div>
    <q-form class="admin-form" @submit.prevent="submit">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-md-4">
          <q-input
            v-model.trim="form.nombre"
            dense
            :dark="!isLight"
            counter
            maxlength="150"
            label="Nombre del equipo"
            :disable="loading || !!editing?.bloqueado"
            :rules="[required]"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="form.participante_ids"
            :options="participantOptions"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            multiple
            use-chips
            dense
            :dark="!isLight"
            label="Integrantes (1–10)"
            :disable="loading || !!editing?.bloqueado"
            :rules="[memberRule]"
          />
        </div>
        <div class="col-12 col-md-2 row q-gutter-xs">
          <q-btn
            unelevated
            color="primary"
            type="submit"
            label="Guardar"
            :loading="loading"
            :disable="loading || !!editing?.bloqueado"
          />
          <q-btn
            v-if="editing"
            flat
            label="Cancelar"
            :disable="loading"
            @click="cancelEdit"
          />
        </div>
      </div>
    </q-form>

    <q-list bordered separator class="admin-list q-mt-lg">
      <q-item v-for="team in teams" :key="team.id">
        <q-item-section>
          <q-item-label>
            {{ team.nombre }}
            <q-icon v-if="team.bloqueado" name="lock" color="warning" />
          </q-item-label>
          <q-item-label caption>
            {{ team.integrantes.map(item => item.nombre).join(", ") }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="q-gutter-xs">
            <q-btn
              flat
              round
              icon="edit"
              aria-label="Editar equipo"
              :disable="team.bloqueado || loading"
              @click="edit(team)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              aria-label="Eliminar equipo"
              :disable="team.bloqueado || loading"
              @click="$emit('remove', team.id)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="!teams.length">
        <q-item-section class="text-secondary">
          Todavía no hay equipos registrados.
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormPersistence } from "../../composables/useFormPersistence";
import { useThemeMode } from "../../composables/useThemeMode";
import type { HackatonEquipo, HackatonPersona } from "../../types";

const props = defineProps<{
  teams: HackatonEquipo[];
  eligible: HackatonPersona[];
  loading: boolean;
  persistenceKey: string;
}>();
const emit = defineEmits<{
  save: [
    id: string | null,
    value: { nombre: string; participante_ids: string[] }
  ];
  remove: [id: string];
  warning: [message: string];
}>();
const { isLight } = useThemeMode();
const initialForm = { nombre: "", participante_ids: [] as string[] };
const {
  formData: form,
  clearForm,
  resetForm
} = useFormPersistence(props.persistenceKey, initialForm);
const editing = ref<HackatonEquipo | null>(null);
const participantOptions = computed(() => [
  ...props.eligible,
  ...(editing.value?.integrantes ?? []).map(item => ({
    ...item,
    id: item.participante_acceso_id
  }))
]);

const required = (value: string) =>
  !!value?.trim() || "Este campo es obligatorio";
const memberRule = (value: string[]) =>
  (value.length >= 1 && value.length <= 10) ||
  "Selecciona entre 1 y 10 integrantes";
const edit = (team: HackatonEquipo) => {
  editing.value = team;
  resetForm({
    nombre: team.nombre,
    participante_ids: team.integrantes.map(item => item.participante_acceso_id)
  });
};
const cancelEdit = () => {
  editing.value = null;
  resetForm(initialForm);
};
const submit = () => {
  if (!form.value.nombre.trim()) {
    emit("warning", "Escribe el nombre del equipo.");
    return;
  }
  if (
    form.value.participante_ids.length < 1 ||
    form.value.participante_ids.length > 10
  ) {
    emit("warning", "Selecciona entre 1 y 10 integrantes.");
    return;
  }
  emit("save", editing.value?.id ?? null, {
    nombre: form.value.nombre.trim(),
    participante_ids: [...form.value.participante_ids]
  });
};
const clearDraft = () => {
  editing.value = null;
  clearForm();
};

defineExpose({ clearDraft });
</script>
