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
        <q-select
          v-model="form.congreso_id"
          :options="congresoOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Congreso"
          :rules="[requiredRule]"
          :loading="congresosLoading"
          :disable="congresosLoading"
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
          dense
          dark
        />
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

      <div v-if="catalogsError" class="col-12">
        <q-banner rounded class="bg-red-10 text-white">
          {{ catalogsError }}
          <template #action>
            <q-btn flat label="Reintentar" @click="loadCatalogs" />
          </template>
        </q-banner>
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
        <q-select
          v-model="form.ubicacion_id"
          :options="ubicacionOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Ubicación"
          :rules="[requiredRule]"
          :loading="ubicacionesLoading"
          :disable="ubicacionesLoading"
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
  </q-form>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useCongresosQuery } from '../../composables/useCongresosQuery';
import { usePonente } from '../../composables/usePonente';
import { useFormPersistence } from '../../composables/useFormPersistence';
import { useUbicacionesQuery } from '../../composables/useUbicacionesQuery';
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

const { useGetPonentes } = usePonente();
const {
  data: talleristas,
  isLoading: talleristasLoading,
  error: talleristasError,
  refetch: loadTalleristas,
} = useGetPonentes();
const {
  data: congresos,
  isRefreshing: congresosLoading,
  error: congresosError,
  load: loadCongresos,
} = useCongresosQuery();
const {
  data: ubicaciones,
  isRefreshing: ubicacionesLoading,
  error: ubicacionesError,
  load: loadUbicaciones,
} = useUbicacionesQuery();

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

const congresoOptions = computed(() =>
  congresos.value.map((congreso) => ({
    label: congreso.nombre,
    value: congreso.id,
  })),
);

const ubicacionOptions = computed(() =>
  ubicaciones.value.map((ubicacion) => ({
    label: ubicacion.nombre,
    value: ubicacion.id,
  })),
);

const catalogsError = computed(
  () => talleristasError.value || congresosError.value || ubicacionesError.value,
);

const loadCatalogs = async () => {
  await Promise.all([loadTalleristas(), loadCongresos(), loadUbicaciones()]);
};

const requiredRule = (value: string | number) => value !== '' && value !== null && value !== undefined || 'Este campo es obligatorio';
const positiveIntRule = (value: number) => Number.isInteger(value) && value > 0 || 'Debe ser un entero mayor a 0';

const submit = () => {
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
  void loadCatalogs();
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
