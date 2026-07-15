<template>
  <q-form @submit.prevent="submit" class="new-taller-form">
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
          v-model="form.tallerista_id"
          :options="talleristaOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Panelista"
          :rules="[requiredRule]"
          :loading="talleristasLoading"
          :disable="talleristasLoading"
          :display-value="selectedTalleristaLabel"
          dense
          dark
        >
          <template #selected>
            <span>{{ selectedTalleristaLabel }}</span>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model.number="form.cupo_maximo"
          type="number"
          min="1"
          label="Cupo máximo"
          :rules="[requiredRule, positiveIntRule]"
          dense
          dark
        />
      </div>

      <div class="col-12" v-if="talleristasError">
        <div class="text-negative">{{ talleristasError }}</div>
      </div>

      <div class="col-12">
        <q-input
          v-model="form.descripcion"
          label="Descripción"
          type="textarea"
          autogrow
          dense
          dark
        />
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

      <div class="col-12">
        <q-input v-model="form.requisitos" label="Requisitos" type="textarea" autogrow dense dark />
      </div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn unelevated color="primary" label="Guardar taller" type="submit" :loading="props.loading" />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePonente } from '../../composables/usePonente';
import { useFormPersistence } from '../../composables/useFormPersistence';
import type { Ponente, TallerPayload } from '../../types';

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', payload: TallerPayload): void;
}>();

const error = ref<string | null>(null);
const { useGetPonentes } = usePonente();
const {
  data: talleristas,
  isLoading: talleristasLoading,
  error: talleristasError,
  refetch: loadTalleristas,
} = useGetPonentes();

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

const { formData: form } = useFormPersistence<TallerPayload>('new-taller-form', {
  congreso_id: generateUUID(),
  titulo: '',
  descripcion: '',
  tallerista_id: '',
  cupo_maximo: 1,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  ubicacion_id: generateUUID(),
  requisitos: '',
});

const talleristaOptions = computed(() => {
  return talleristas.value.map((ponente: Ponente) => ({
    label: ponente.nombre,
    value: ponente.id,
  }));
});

const selectedTalleristaLabel = computed(() => {
  return talleristaOptions.value.find((option) => option.value === form.value.tallerista_id)?.label ?? form.value.tallerista_id;
});

const requiredRule = (value: string) => !!value || 'Este campo es obligatorio';
const positiveIntRule = (value: number) => Number.isInteger(value) && value > 0 || 'Debe ser un entero mayor a 0';

const submit = () => {
  error.value = null;

  if (!form.value.congreso_id) {
    form.value.congreso_id = generateUUID();
  }

  if (!form.value.ubicacion_id) {
    form.value.ubicacion_id = generateUUID();
  }

  form.value.cupo_maximo = Number(form.value.cupo_maximo) || 1;

  emit('submit', { ...form.value });
};

onMounted(() => {
  void loadTalleristas();
});
</script>

<style scoped>
.new-taller-form {
  color: #ffffff;
}

.new-taller-form .q-input__control {
  color: #ffffff;
}

.new-taller-form .q-field__label {
  color: rgba(255, 255, 255, 0.75);
}
</style>
