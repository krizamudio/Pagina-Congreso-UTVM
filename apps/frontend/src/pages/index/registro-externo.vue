<template>
  <q-page class="registro-page">
    <q-card flat class="registro-card">

      <!-- Encabezado -->
      <div class="text-center q-mb-xl">
        <img
          src="/logo.png"
          alt="Congreso"
          width="110"
        >

        <div class="titulo q-mt-md">
          Registro de Participantes Externos
        </div>

        <div class="subtitulo">
          Completa tus datos para participar en el Congreso.
        </div>

        <div class="linea-titulo"></div>
      </div>

      <q-form @submit.prevent="registrar">

        <!-- Datos personales -->
        <div class="section-title">
          Datos personales
        </div>

        <div class="row q-col-gutter-lg">

          <div class="col-12">
            <q-input
              outlined
              dense
              color="positive"
              v-model="form.nombre"
              label="Nombre completo"
            />
          </div>

          <div class="col-md-6 col-12">
            <q-input
              outlined
              dense
              color="positive"
              v-model="form.correo"
              type="email"
              label="Correo electrónico"
            />
          </div>

          <div class="col-md-6 col-12">
            <q-input
              outlined
              dense
              color="positive"
              v-model="form.telefono"
              label="Teléfono"
            />
          </div>

          <div class="col-12">
            <q-input
              outlined
              dense
              color="positive"
              v-model="form.institucion"
              label="Institución o Empresa"
            />
          </div>

        </div>

        <q-separator class="q-my-xl" />

        <div class="row q-col-gutter-lg">

          <!-- Días -->
          <div class="col-lg-4 col-md-4 col-12">

            <q-card flat bordered class="info-card">

              <div class="card-title">
                <q-icon
                  name="event"
                  color="positive"
                  size="26px"
                />

                <span>Días de participación</span>
              </div>

              <q-option-group
                v-model="form.dias"
                :options="dias"
                type="checkbox"
                color="positive"
              />

            </q-card>

          </div>

          <!-- Total -->
          <div class="col-lg-4 col-md-4 col-12">

            <q-card flat bordered class="info-card">

              <div class="card-title">
                <q-icon
                  name="payments"
                  color="positive"
                  size="26px"
                />

                <span>Total a pagar</span>
              </div>

              <div class="precio">
                $ {{ total.toFixed(2) }}
              </div>

              <div class="moneda">
                MXN
              </div>

            </q-card>

          </div>

          <!-- Comprobante -->
          <div class="col-lg-4 col-md-4 col-12">

            <q-card
              flat
              bordered
              class="upload-card"
              :class="{ 'is-dragging': isDragging, 'has-file': !!form.comprobante }"
              @click="$refs.fileInput.pickFiles()"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >

              <!-- input real, oculto -->
              <q-file
                ref="fileInput"
                v-model="form.comprobante"
                accept=".pdf,.jpg,.jpeg,.png"
                style="display: none"
              />

              <div class="upload-content">

                <q-icon
                  :name="form.comprobante ? 'task' : 'cloud_upload'"
                  size="55px"
                  color="positive"
                />

                <div class="upload-title">
                  {{ archivo }}
                </div>

                <div class="upload-subtitle">
                  {{ form.comprobante ? 'Haz clic o arrastra otro archivo para cambiarlo' : 'Arrastra tu archivo aquí o haz clic para seleccionarlo' }}
                </div>

                <div class="upload-formats">
                  PDF · JPG · PNG
                </div>

                <q-btn
                  outline
                  color="positive"
                  class="q-mt-md"
                  :label="accionLabel"
                  @click.stop="$refs.fileInput.pickFiles()"
                />

                <div
                  v-if="archivoError"
                  class="upload-error"
                >
                  {{ archivoError }}
                </div>

              </div>

            </q-card>

          </div>

        </div>

        <div class="text-center q-mt-xl">

          <q-btn
            unelevated
            class="btn-registro"
            icon="how_to_reg"
            label="Registrar participante"
            type="submit"
          />

        </div>

      </q-form>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const COSTO_DIA = 250

const TIPOS_VALIDOS = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

const dias = [
  { label: 'Día 1', value: 'dia1' },
  { label: 'Día 2', value: 'dia2' },
  { label: 'Día 3', value: 'dia3' }
]

const form = ref({
  nombre: '',
  correo: '',
  telefono: '',
  institucion: '',
  dias: [],
  comprobante: null
})

const isDragging = ref(false)
const archivoError = ref('')

const total = computed(() => form.value.dias.length * COSTO_DIA)

const archivo = computed(() =>
  form.value.comprobante
    ? form.value.comprobante.name
    : 'Adjuntar comprobante'
)

// Cambia el texto del botón una vez que ya hay un archivo cargado
const accionLabel = computed(() =>
  form.value.comprobante ? 'Cambiar archivo' : 'Seleccionar archivo'
)

function esArchivoValido(file) {
  return TIPOS_VALIDOS.includes(file.type)
}

function onDrop(event) {
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  if (!esArchivoValido(file)) {
    archivoError.value = 'Formato no válido. Usa PDF, JPG o PNG.'
    return
  }

  archivoError.value = ''
  form.value.comprobante = file
}

function registrar() {
  console.log(form.value)
}
</script>

<style lang="scss">
@import "../../css/registro-externo.scss";
</style>
