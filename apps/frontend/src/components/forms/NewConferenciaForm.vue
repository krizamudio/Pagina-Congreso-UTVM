<template>
  <q-form @submit.prevent="submit" class="new-conferencia-form">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.titulo"
          label="Título"
          :rules="[requiredRule]"
          dense
          autofocus
          dark
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.congreso_id"
          label="Congreso ID (autogenerado)"
          :rules="[requiredRule]"
          readonly
          dense
          dark
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="form.ponente_id"
          :options="ponenteOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Ponente"
          :rules="[requiredRule]"
          :loading="ponentesLoading"
          :disable="ponentesLoading"
          :display-value="selectedPonenteLabel"
          dense
          dark
        >
          <template #selected>
            <span>{{ selectedPonenteLabel }}</span>
          </template>
        </q-select>
      </div>

      <div v-if="ponentesError" class="col-12 text-negative">
        {{ ponentesError }}
      </div>

      <div class="col-12">
        <q-input v-model="form.resumen" label="Resumen" type="textarea" autogrow dense dark />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          type="date"
          v-model="form.fecha"
          label="Fecha"
          :rules="[requiredRule]"
          dense
          dark
        />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          v-model="form.hora_inicio"
          label="Hora de inicio"
          mask="time"
          placeholder="HH:MM"
          :rules="[requiredRule]"
          dense
          dark
        />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          v-model="form.hora_fin"
          label="Hora de fin"
          mask="time"
          placeholder="HH:MM"
          :rules="[requiredRule]"
          dense
          dark
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="form.ubicacion_id"
          label="Ubicacion ID (autogenerado)"
          :rules="[requiredRule]"
          readonly
          dense
          dark
        />
      </div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        label="Guardar conferencia"
        type="submit"
        :loading="props.loading"
      />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePonente } from '../../composables/usePonente';
import { useFormPersistence } from '../../composables/useFormPersistence';
import type { ConferenciaPayload, Ponente } from '../../types';

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', payload: ConferenciaPayload): void;
}>();

const error = ref<string | null>(null);
const { useGetPonentes } = usePonente();
const { data: ponentes, isLoading: ponentesLoading, error: ponentesError, refetch: loadPonentes } = useGetPonentes();

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const { formData: form } = useFormPersistence<ConferenciaPayload>('new-conferencia-form', {
  congreso_id: generateUUID(),
  titulo: '',
  ponente_id: '',
  resumen: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  ubicacion_id: generateUUID(),
});

const ponenteOptions = computed(() => {
  return ponentes.value.map((ponente: Ponente) => ({
    label: ponente.nombre,
    value: ponente.id,
  }));
});

const selectedPonenteLabel = computed(() => {
  return ponenteOptions.value.find((option) => option.value === form.value.ponente_id)?.label ?? form.value.ponente_id;
});

const requiredRule = (value: string) => !!value || 'Este campo es obligatorio';

const submit = () => {
  error.value = null;

  if (!form.value.congreso_id) {
    form.value.congreso_id = generateUUID();
  }

  if (!form.value.ubicacion_id) {
    form.value.ubicacion_id = generateUUID();
  }

  emit('submit', { ...form.value });
};

onMounted(() => {
  void loadPonentes();
});
</script>

<style scoped>
.new-conferencia-form {
  color: #ffffff;
}

.new-conferencia-form .q-input__control {
  color: #ffffff;
}

.new-conferencia-form .q-field__label {
  color: rgba(255, 255, 255, 0.75);
}
</style>
