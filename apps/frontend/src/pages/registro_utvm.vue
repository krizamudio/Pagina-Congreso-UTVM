<template>
  <div class="registro-externo-page q-pa-md">
    <q-card class="registro-externo-card">
      <q-card-section>
        <div class="titulo">Registro de Participantes UTVM</div>
        <div class="subtitulo">Congreso UTVM</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="section-title">Datos del participante</div>

        <div class="row q-col-gutter-md">
          <q-input v-model="form.nombres" label="Nombre(s)" outlined class="col-12 col-md-4" />
          <q-input v-model="form.apellidoPaterno" label="Apellido paterno" outlined class="col-12 col-md-4" />
          <q-input v-model="form.apellidoMaterno" label="Apellido materno" outlined class="col-12 col-md-4" />

          <q-input v-model="form.correo" label="Correo electrónico" outlined class="col-12 col-md-6" />
          <q-input v-model="form.telefono" label="Teléfono móvil" outlined class="col-12 col-md-6" />

          <q-input v-model.number="form.cuatrimestre" label="Cuatrimestre" type="number" outlined class="col-12 col-md-6" />
          <q-input v-model="form.grupo" label="Grupo" outlined class="col-12 col-md-6" />
        </div>

        <div class="q-mt-lg">
          <q-btn label="Agregar participante" class="btn-registro" icon="person_add" @click="agregarParticipante" />
        </div>
      </q-card-section>

      <q-card-section>
        <div class="section-title">Importar archivo CSV</div>

        <div class="row q-col-gutter-md items-center">
          <q-file v-model="archivoCsv" label="Cargar archivo CSV" outlined accept=".csv" class="col-12 col-md-6" />

          <div class="col-12 col-md-6">
            <q-btn label="Importar CSV" icon="upload_file" color="primary" @click="importarCsv" />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="participantes.length > 0">
        <div class="section-title">Participantes agregados</div>

        <q-table :rows="participantes" :columns="columns" row-key="correo" flat bordered>
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn dense round color="negative" icon="delete" @click="eliminarParticipante(props.rowIndex)" />
            </q-td>
          </template>
        </q-table>

        <div class="q-mt-lg">
          <q-btn
            label="Guardar participantes"
            color="positive"
            icon="save"
            :loading="loading"
            @click="guardarParticipantes"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import Papa from 'papaparse';

const $q = useQuasar();

interface ParticipanteUtvm {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  telefono: string;
  cuatrimestre: number;
  grupo: string;
}

const loading = ref(false);
const participantes = ref<ParticipanteUtvm[]>([]);
const archivoCsv = ref<File | null>(null);

const form = reactive<ParticipanteUtvm>({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  cuatrimestre: 1,
  grupo: '',
});

const columns = [
  { name: 'nombres', label: 'Nombre(s)', field: 'nombres', align: 'left' as const },
  { name: 'apellidoPaterno', label: 'Apellido paterno', field: 'apellidoPaterno', align: 'left' as const },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' as const },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const },
  { name: 'cuatrimestre', label: 'Cuatrimestre', field: 'cuatrimestre', align: 'center' as const },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

function limpiarFormulario() {
  form.nombres = '';
  form.apellidoPaterno = '';
  form.apellidoMaterno = '';
  form.correo = '';
  form.telefono = '';
  form.cuatrimestre = 1;
  form.grupo = '';
}

function participanteValido(participante: ParticipanteUtvm) {
  return (
    participante.nombres &&
    participante.apellidoPaterno &&
    participante.correo &&
    participante.telefono &&
    participante.cuatrimestre &&
    participante.grupo
  );
}

function agregarParticipante() {
  if (!participanteValido(form)) {
    $q.notify({
      type: 'negative',
      message: 'Completa todos los campos obligatorios',
    });
    return;
  }

  const correoExiste = participantes.value.some((p) => p.correo === form.correo);

  if (correoExiste) {
    $q.notify({
      type: 'warning',
      message: 'Ese correo ya fue agregado',
    });
    return;
  }

  participantes.value.push({ ...form });

  $q.notify({
    type: 'positive',
    message: 'Participante agregado a la lista',
  });

  limpiarFormulario();
}

function eliminarParticipante(index: number) {
  participantes.value.splice(index, 1);
}

function importarCsv() {
  if (!archivoCsv.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un archivo CSV',
    });
    return;
  }

  Papa.parse<Record<string, string>>(archivoCsv.value, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const registros = results.data.map((fila) => ({
        nombres: fila.nombres,
        apellidoPaterno: fila.apellidoPaterno,
        apellidoMaterno: fila.apellidoMaterno,
        correo: fila.correo,
        telefono: fila.telefono,
        cuatrimestre: Number(fila.cuatrimestre),
        grupo: fila.grupo,
      }));

      const registrosValidos = registros.filter((participante) => participanteValido(participante));

      const nuevos = registrosValidos.filter(
        (participante) => !participantes.value.some((p) => p.correo === participante.correo),
      );

      participantes.value.push(...nuevos);

      $q.notify({
        type: 'positive',
        message: `CSV importado correctamente. Registros agregados: ${nuevos.length}`,
      });

      archivoCsv.value = null;
    },
    error: () => {
      $q.notify({
        type: 'negative',
        message: 'Error al leer el archivo CSV',
      });
    },
  });
}

async function guardarParticipantes() {
  if (participantes.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay participantes para guardar',
    });
    return;
  }

  loading.value = true;

  try {
    const response = await fetch('http://localhost:3000/api/utvm/multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participantes.value),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al guardar participantes');
    }

    $q.notify({
      type: 'positive',
      message: 'Participantes UTVM guardados correctamente',
    });

    participantes.value = [];
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss">
@import "../css/registro-externo.scss";
</style>

