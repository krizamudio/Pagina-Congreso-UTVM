<template>
  <div class="registro-page">
    <section class="registro-header">
      <h1>Registro NSU (Nivel Superior)</h1>
      <p>
        El tutor o docente podrá registrar desde un participante y hasta n
        participantes o subir archivo CSV.
      </p>
    </section>

    <section class="registro-card">
      <div class="section-title">
        <q-icon name="person" />
        <span>Datos del participante</span>
      </div>

      <q-form class="form-grid">
        <q-input
          outlined
          v-model="form.nombre"
          label="Nombre(s) *"
          placeholder="Ingresa el nombre o nombres"
          class="light-input"
        />

        <q-input
          outlined
          v-model="form.apellidoPaterno"
          label="Apellido paterno *"
          placeholder="Ingresa el apellido paterno"
          class="light-input"
        />

        <q-input
          outlined
          v-model="form.apellidoMaterno"
          label="Apellido materno"
          placeholder="Ingresa el apellido materno"
          class="light-input"
        />

        <q-input
          outlined
          v-model="form.correo"
          label="Correo electrónico *"
          placeholder="ejemplo@correo.com"
          type="email"
          class="light-input"
        />

        <q-input
          outlined
          v-model="form.institucion"
          label="Institución *"
          placeholder="Nombre de la institución"
          class="light-input"
        />

        <q-input
          outlined
          v-model="form.carrera"
          label="Carrera *"
          placeholder="Nombre de la carrera"
          class="light-input"
        />
        <div class="telefono-container">
          <q-input
            outlined
            v-model="form.telefono"
            label="Teléfono *"
            placeholder="Ej. 55 1234 5678"
            class="light-input"
          />
        </div>

        <div class="dark-box">
          <div class="box-label">Días de participación *</div>

          <div class="days-grid">
            <q-checkbox
              v-for="dia in diasOptions"
              :key="dia.value"
              v-model="form.dias"
              :val="dia.value"
              :label="dia.label"
              color="primary"
              dark
            />
          </div>
        </div>

        <div class="dark-box">
          <div class="box-label">Monto del participante</div>
          <div class="amount">${{ montoParticipanteActual.toFixed(2) }}</div>
          <div class="box-help">Selecciona los días de participación</div>
        </div>

        <div class="add-participant-row">
          <q-btn
            outline
            icon="add"
            label="Agregar participante"
            class="btn-outline-green"
            @click="agregarParticipante"
          />
        </div>

        <div class="upload-box">
          <div class="box-label">Comprobante de pago *</div>

          <q-file
            ref="fileInput"
            v-model="form.comprobante"
            accept=".pdf,.jpg,.jpeg,.png"
            style="display: none"
          />

          <div class="file-input upload-layout">
            <div class="upload-left">
              <q-icon name="cloud_upload" size="42px" />

              <div class="upload-text">
                <strong>Arrastra tu archivo aquí o selecciona</strong>
                <span v-if="!form.comprobante">
                  Formatos permitidos: PDF, JPG, JPEG, PNG. Máx. 10 MB
                </span>
                <span v-else>
                  Archivo seleccionado: {{ form.comprobante.name }}
                </span>
              </div>
            </div>

            <q-btn
              outline
              icon="upload"
              label="Buscar archivo"
              class="btn-outline-green"
              @click="abrirSelector"
            />
          </div>
        </div>
      </q-form>
    </section>

    <section class="registro-card q-mt-lg">
      <div class="section-title">
        <q-icon name="groups" />
        <span>Participantes registrados</span>
      </div>

      <q-table
        flat
        bordered
        dark
        :rows="participantes"
        :columns="columns"
        row-key="id"
        class="registro-table"
        no-data-label="Aún no hay participantes registrados."
      >
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="delete"
              class="btn-delete-participant"
              @click="eliminarParticipante(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
      <div class="totals-box q-mt-md">
        <div class="total-item">
          <span>Participantes registrados</span>
          <strong>{{ participantes.length }}</strong>
        </div>

        <div class="total-item">
          <span>Total general a pagar</span>
          <strong>${{ totalGeneral.toFixed(2) }}</strong>
        </div>

        <div class="total-actions">
          <q-file
            ref="csvInput"
            v-model="archivoCsv"
            style="display: none"
            @update:model-value="leerCsv"
          />

          <q-btn
            outline
            icon="upload"
            label="Cargar archivo CSV"
            class="btn-outline-green"
            @click="abrirCsv"
          />

          <q-btn
            class="btn-primary-blue"
            icon="save"
            label="GUARDAR PARTICIPANTES"
            @click="guardarParticipantes"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { guardarRegistroNsu } from "../services/registroNsuService";
import { Notify } from "quasar";

const form = ref({
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  institucion: "",
  carrera: "",
  telefono: "",
  dias: [] as string[],
  comprobante: null as File | null,
});

interface Participante {
  id: number;
  nombreCompleto: string;
  correo: string;
  institucion: string;
  carrera: string;
  telefono: string;
  dias: string;
  monto: string;
  montoNumero: number;
}

const participantes = ref<Participante[]>([]);

const diasOptions = [
  { label: "Día 1", value: "Día 1" },
  { label: "Día 2", value: "Día 2" },
  { label: "Día 3", value: "Día 3" },
];

const costoPorDia = 100;

const montoParticipanteActual = computed(() => {
  return form.value.dias.length * costoPorDia;
});

const totalGeneral = computed(() => {
  return participantes.value.reduce((total, participante) => {
    return total + participante.montoNumero;
  }, 0);
});

const columns = [
  { name: "id", label: "#", field: "id", align: "left" as const },
  {
    name: "nombreCompleto",
    label: "Nombre completo",
    field: "nombreCompleto",
    align: "left" as const,
  },
  {
    name: "correo",
    label: "Correo electrónico",
    field: "correo",
    align: "left" as const,
  },
  {
    name: "institucion",
    label: "Institución",
    field: "institucion",
    align: "left" as const,
  },
  {
    name: "carrera",
    label: "Carrera",
    field: "carrera",
    align: "left" as const,
  },
  {
    name: "telefono",
    label: "Teléfono",
    field: "telefono",
    align: "left" as const,
  },
  { name: "dias", label: "Días", field: "dias", align: "left" as const },
  { name: "monto", label: "Monto", field: "monto", align: "left" as const },
  {
    name: "acciones",
    label: "Acciones",
    field: "acciones",
    align: "center" as const,
  },
];

function agregarParticipante() {
  const monto = montoParticipanteActual.value;

  participantes.value.push({
    id: participantes.value.length + 1,
    nombreCompleto: `${form.value.nombre} ${form.value.apellidoPaterno} ${form.value.apellidoMaterno}`,
    correo: form.value.correo,
    institucion: form.value.institucion,
    carrera: form.value.carrera,
    telefono: form.value.telefono,
    dias: form.value.dias.join(", "),
    monto: `$${monto.toFixed(2)}`,
    montoNumero: monto,
  });

  form.value = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    institucion: "",
    carrera: "",
    telefono: "",
    dias: [],
    comprobante: null,
  };
}
const fileInput = ref();

function abrirSelector() {
  fileInput.value?.pickFiles();
}

import Papa from "papaparse";

const archivoCsv = ref<File | null>(null);
const csvInput = ref();

function abrirCsv() {
  csvInput.value?.pickFiles();
}

function leerCsv(file: File | null) {
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const filas = result.data as any[];

      const nuevosParticipantes: Participante[] = filas.map((fila, index) => {
        const dias = fila.dias || "";
        const monto = calcularMontoDesdeDias(dias);

        return {
          id: participantes.value.length + index + 1,
          nombreCompleto:
            fila.nombreCompleto ||
            `${fila.nombre || ""} ${fila.apellidoPaterno || ""} ${fila.apellidoMaterno || ""}`.trim(),
          correo: fila.correo || "",
          institucion: fila.institucion || "",
          carrera: fila.carrera || "",
          telefono: fila.telefono || "",
          dias,
          monto: `$${monto.toFixed(2)}`,
          montoNumero: monto,
        };
      });

      participantes.value.push(...nuevosParticipantes);
      archivoCsv.value = null;
    },
  });
}
function calcularMontoDesdeDias(dias: string) {
  if (!dias) return 0;

  const cantidadDias = dias
    .split(",")
    .map((dia) => dia.trim())
    .filter((dia) => dia !== "").length;

  return cantidadDias * costoPorDia;
}
async function guardarParticipantes() {
  if (participantes.value.length === 0) {
    Notify.create({
      type: "warning",
      message: "Agrega al menos un participante antes de guardar.",
    });
    return;
  }

  if (!form.value.comprobante) {
    Notify.create({
      type: "warning",
      message: "Debes cargar el comprobante de pago.",
    });
    return;
  }

  try {
    const participantesPayload = participantes.value.map((participante) => ({
      nombreCompleto: participante.nombreCompleto,
      correo: participante.correo,
      institucion: participante.institucion,
      carrera: participante.carrera,
      telefono: participante.telefono,
      dias: participante.dias,
      montoNumero: participante.montoNumero,
    }));

    const respuesta = await guardarRegistroNsu(
      participantesPayload,
      form.value.comprobante,
    );

    console.log("Registro guardado:", respuesta);

    participantes.value = [];
    archivoCsv.value = null;

    form.value = {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
      institucion: "",
      carrera: "",
      telefono: "",
      dias: [],
      comprobante: null,
    };

    Notify.create({
      type: "positive",
      message: "Registro NSU guardado correctamente.",
    });
  } catch (error) {
    console.error("ERROR COMPLETO:", error);

    Notify.create({
      type: "negative",
      message: "Ocurrió un error al guardar el registro.",
    });
  }
}
function eliminarParticipante(id: number) {
  participantes.value = participantes.value
    .filter((participante) => participante.id !== id)
    .map((participante, index) => ({
      ...participante,
      id: index + 1,
    }));

  Notify.create({
    type: "positive",
    message: "Participante eliminado correctamente.",
  });
}
</script>
