<template>
  <q-form @submit.prevent="submit" class="update-taller-form">
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
          label="Congreso ID"
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
          label="Tallerista"
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

      <div v-if="talleristasError" class="col-12 text-negative">
        {{ talleristasError }}
      </div>

      <div class="col-12">
        <q-input v-model="form.descripcion" label="Descripción" type="textarea" autogrow dense dark />
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

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.ubicacion_id"
          label="Ubicación ID"
          readonly
          dense
          dark
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input v-model="form.requisitos" label="Requisitos" type="textarea" autogrow dense dark />
      </div>
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        label="Actualizar taller"
        type="submit"
        :loading="props.loading"
      />
    </div>

    <div v-if="error" class="q-mt-md text-negative">{{ error }}</div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { usePonente } from '../../composables/usePonente';
import { useFormPersistence } from '../../composables/useFormPersistence';
import type { Ponente, TallerPayload } from '../../types';

interface Props {
  loading?: boolean;
  initialData?: Partial<TallerPayload>;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialData: () => ({}),
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

const defaultForm = (): TallerPayload => ({
  congreso_id: '',
  titulo: '',
  descripcion: '',
  tallerista_id: '',
  cupo_maximo: 1,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  ubicacion_id: '',
  requisitos: '',
});

const { formData: form, hydrateForm } = useFormPersistence<TallerPayload>('update-taller-form', defaultForm(), {
  hydrateOnMounted: false,
  mergeStrategy: 'base-over-saved',
});

const syncForm = () => {
  hydrateForm({
    ...defaultForm(),
    ...props.initialData,
  });
};

watch(
  () => props.initialData,
  () => {
    syncForm();
  },
  { immediate: true, deep: true },
);

const talleristaOptions = computed(() => {
  return talleristas.value.map((ponente: Ponente) => ({
    label: ponente.nombre,
    value: ponente.id,
  }));
});

const selectedTalleristaLabel = computed(() => {
  return talleristaOptions.value.find((option) => option.value === form.value.tallerista_id)?.label ?? form.value.tallerista_id;
});

const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const resolveTalleristaId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (isUuid(trimmed)) return trimmed;

  const match = talleristaOptions.value.find((option) => {
    return option.label.trim().toLowerCase() === trimmed.toLowerCase();
  });

  return match?.value ?? trimmed;
};

const requiredRule = (value: string | number) => value !== '' && value !== null && value !== undefined || 'Este campo es obligatorio';
const positiveIntRule = (value: number) => Number.isInteger(value) && value > 0 || 'Debe ser un entero mayor a 0';

const submit = () => {
  error.value = null;
  form.value.tallerista_id = resolveTalleristaId(form.value.tallerista_id);

  if (!isUuid(form.value.tallerista_id)) {
    error.value = 'El tallerista debe ser un registro existente.';
    return;
  }

  form.value.cupo_maximo = Number(form.value.cupo_maximo) || 1;

  emit('submit', {
    congreso_id: form.value.congreso_id,
    titulo: form.value.titulo,
    descripcion: form.value.descripcion,
    tallerista_id: form.value.tallerista_id,
    cupo_maximo: form.value.cupo_maximo,
    fecha: form.value.fecha,
    hora_inicio: form.value.hora_inicio,
    hora_fin: form.value.hora_fin,
    ubicacion_id: form.value.ubicacion_id,
    requisitos: form.value.requisitos,
  });
};

onMounted(() => {
  void loadTalleristas();
});
</script>

<style scoped>
.update-taller-form {
  color: #ffffff;
}

.update-taller-form .q-input__control {
  color: #ffffff;
}

.update-taller-form .q-field__label {
  color: rgba(255, 255, 255, 0.75);
}
</style>