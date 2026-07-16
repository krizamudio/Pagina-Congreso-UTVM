<template>
  <q-form @submit.prevent="submit" class="update-conferencia-form">
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
          label="Congreso"
          hint="Escribe el nombre del congreso o pega su UUID"
          persistent-hint
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

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.ubicacion_id"
          label="Ubicación"
          hint="Escribe el nombre de la ubicación o pega su UUID"
          persistent-hint
          dense
          dark
        />
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
    </div>

    <div class="row items-center justify-end q-gutter-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        label="Actualizar conferencia"
        type="submit"
        :loading="props.loading"
      />
    </div>

  </q-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { usePonente } from '../../composables/usePonente';
import { useFormPersistence } from '../../composables/useFormPersistence';
import { api } from '../../services/api';
import type { ConferenciaPayload, Ponente } from '../../types';

interface Props {
  loading?: boolean;
  initialData: Partial<ConferenciaPayload>;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', payload: ConferenciaPayload): void;
}>();

const $q = useQuasar();
const { useGetPonentes } = usePonente();
const {
  data: ponentes,
  isLoading: ponentesLoading,
  error: ponentesError,
  refetch: loadPonentes,
} = useGetPonentes();
const congresosCatalog = ref<Array<{ id: string; nombre: string }>>([]);
const ubicacionesCatalog = ref<Array<{ id: string; nombre: string }>>([]);

const defaultForm = (): ConferenciaPayload => ({
  congreso_id: '',
  titulo: '',
  ponente_id: '',
  resumen: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  ubicacion_id: '',
});

const { formData: form, hydrateForm } = useFormPersistence<ConferenciaPayload>('update-conferencia-form', defaultForm(), {
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

const ponenteOptions = computed(() => {
  return ponentes.value.map((ponente: Ponente) => ({
    label: ponente.nombre,
    value: ponente.id,
  }));
});

const selectedPonenteLabel = computed(() => {
  return ponenteOptions.value.find((option) => option.value === form.value.ponente_id)?.label ?? form.value.ponente_id;
});

const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const normalize = (value: string) => value.trim().toLowerCase();

const resolveByNameOrId = (
  rawValue: string,
  catalog: Array<{ id: string; nombre: string }>,
) => {
  const value = rawValue.trim();
  if (!value) return value;
  if (isUuid(value)) return value;

  const match = catalog.find((item) => normalize(item.nombre) === normalize(value));
  return match?.id ?? value;
};

const labelFromId = (rawValue: string, catalog: Array<{ id: string; nombre: string }>) => {
  const value = rawValue.trim();
  const match = catalog.find((item) => item.id === value);
  return match?.nombre ?? rawValue;
};

const loadCatalogs = async () => {
  try {
    const [congresosResponse, ubicacionesResponse] = await Promise.all([
      api.get('congreso'),
      api.get('ubicacion'),
    ]);

    const congresos = Array.isArray(congresosResponse.data) ? congresosResponse.data : [];
    const ubicaciones = Array.isArray(ubicacionesResponse.data) ? ubicacionesResponse.data : [];

    congresosCatalog.value = congresos
      .filter((item: any) => item?.id && item?.nombre)
      .map((item: any) => ({ id: String(item.id), nombre: String(item.nombre) }));

    ubicacionesCatalog.value = ubicaciones
      .filter((item: any) => item?.id && item?.nombre)
      .map((item: any) => ({ id: String(item.id), nombre: String(item.nombre) }));

    form.value.congreso_id = labelFromId(form.value.congreso_id, congresosCatalog.value);
    form.value.ubicacion_id = labelFromId(form.value.ubicacion_id, ubicacionesCatalog.value);
  } catch (catalogError) {
    console.warn('No se pudo cargar catálogo de congreso/ubicación', catalogError);
  }
};

const requiredRule = (value: string) => !!value || 'Este campo es obligatorio';

const notifyValidationError = (message: string) => {
  if (typeof $q.notify === 'function') {
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 3200,
      multiLine: true,
      progress: true,
      textColor: 'white',
      classes: 'app-notify app-notify-negative',
    });
  }
};

const submit = () => {
  const congresoId = resolveByNameOrId(form.value.congreso_id, congresosCatalog.value);
  const ubicacionId = resolveByNameOrId(form.value.ubicacion_id, ubicacionesCatalog.value);

  if (!isUuid(congresoId)) {
    notifyValidationError('No se encontró el congreso. Escribe un nombre existente o un UUID válido.');
    return;
  }

  if (!isUuid(ubicacionId)) {
    notifyValidationError('No se encontró la ubicación. Escribe un nombre existente o un UUID válido.');
    return;
  }

  emit('submit', {
    ...form.value,
    congreso_id: congresoId,
    ubicacion_id: ubicacionId,
  });
};

onMounted(() => {
  void loadPonentes();
  void loadCatalogs();
});
</script>

<style scoped>
.update-conferencia-form {
  color: #ffffff;
}

.update-conferencia-form .q-input__control {
  color: #ffffff;
}

.update-conferencia-form .q-field__label {
  color: rgba(255, 255, 255, 0.75);
}
</style>