<template>
  <q-page class="registro-externo-page">
    <q-card flat class="registro-externo-card">
      <!-- Encabezado -->
      <div class="text-center q-mb-xl">
        <img
          src="../../components/logo1.png"
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

      <q-form
        ref="formRef"
        @submit.prevent="registrar"
      >
        <div class="section-title">
          Datos personales
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-md-4 col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              v-model="form.nombre"
              label="Nombre(s)"
              lazy-rules
              :rules="[
                v => !!v || 'El nombre es obligatorio'
              ]"
            />
          </div>

          <div class="col-md-4 col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              v-model="form.apellidoPaterno"
              label="Apellido paterno"
              lazy-rules
              :rules="[
                v => !!v || 'Campo obligatorio'
              ]"
            />
          </div>

          <div class="col-md-4 col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              v-model="form.apellidoMaterno"
              label="Apellido materno"
            />
          </div>

          <div class="col-md-6 col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              type="email"
              v-model="form.correo"
              label="Correo electrónico"
              lazy-rules
              :rules="[
                v => !!v || 'El correo es obligatorio',
                v => /.+@.+\..+/.test(v) || 'Correo inválido'
              ]"
            />
          </div>

          <div class="col-md-6 col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              mask="##########"
              v-model="form.telefono"
              label="Teléfono"
              lazy-rules
              :rules="[
                v => !!v || 'El teléfono es obligatorio',
                v => v.length === 10 || 'Debe contener 10 dígitos'
              ]"
            />
          </div>

          <div class="col-12">
            <q-input
              outlined
              dense
              hide-bottom-space
              color="positive"
              v-model="form.institucion"
              label="Institución o Empresa"
              lazy-rules
              :rules="[
                v => !!v || 'Campo obligatorio'
              ]"
            />
          </div>
        </div>

        <q-separator class="q-my-xl" />

        <div class="row q-col-gutter-lg">
          <!-- Días -->
          <div class="col-lg-4 col-md-4 col-12">
            <q-card
              flat
              bordered
              class="info-card"
            >
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

              <div
                v-if="diasError"
                class="upload-error"
              >
                {{ diasError }}
              </div>
            </q-card>
          </div>

          <!-- Total -->
          <div class="col-lg-4 col-md-4 col-12">
            <q-card
              flat
              bordered
              class="info-card"
            >
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
              :class="{
                'is-dragging': isDragging,
                'has-file': !!form.comprobante
              }"
              @click="abrirSelector"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <q-file
                ref="fileInput"
                style="display:none"
                v-model="form.comprobante"
                accept=".pdf,.jpg,.jpeg,.png"
                @update:model-value="seleccionarArchivo"
              />

              <div class="upload-content">
                <q-icon
                  :name="form.comprobante ? 'task_alt' : 'cloud_upload'"
                  size="58px"
                  color="positive"
                />

                <div class="upload-title">
                  {{ archivo }}
                </div>

                <div class="upload-subtitle">
                  {{
                    form.comprobante
                      ? 'Haz clic para cambiar el archivo'
                      : 'Arrastra tu comprobante o haz clic aquí'
                  }}
                </div>

                <div class="upload-formats">
                  PDF · JPG · PNG · Máximo 5 MB
                </div>

                <q-btn
                  outline
                  color="positive"
                  class="q-mt-md"
                  :label="accionLabel"
                  @click.stop="abrirSelector"
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

          <div
            v-if="mensajeError"
            class="upload-error text-center q-mt-md"
          >
            {{ mensajeError }}
          </div>
        </div>
      </q-form>
    </q-card>

    <!-- Diálogo de resumen -->
    <q-dialog
      v-model="mostrarResumen"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:700px;max-width:90vw"
      >
        <q-card-section class="bg-positive text-white">
          <div class="text-h6 text-weight-bold">
            Confirmar registro
          </div>

          <div class="text-caption">
            Verifica que toda la información sea correcta.
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            Datos personales
          </div>

          <q-list dense separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="positive" />
              </q-item-section>

              <q-item-section>
                <div class="text-grey-7">
                  Nombre
                </div>

                <div class="text-weight-medium">
                  {{ nombreCompleto }}
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="mail" color="positive" />
              </q-item-section>

              <q-item-section>
                <div class="text-grey-7">
                  Correo
                </div>

                <div class="text-weight-medium">
                  {{ form.correo }}
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="business" color="positive" />
              </q-item-section>

              <q-item-section>
                <div class="text-grey-7">
                  Institución
                </div>

                <div class="text-weight-medium">
                  {{ form.institucion }}
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" color="positive" />
              </q-item-section>

              <q-item-section>
                <div class="text-grey-7">
                  Teléfono
                </div>

                <div class="text-weight-medium">
                  {{ form.telefono }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-lg" />

          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            Días seleccionados
          </div>

          <q-chip
            v-for="dia in diasSeleccionados"
            :key="dia.value"
            color="positive"
            text-color="white"
            icon="event_available"
            class="q-mr-sm q-mb-sm"
          >
            {{ dia.label }}
          </q-chip>

          <q-separator class="q-my-lg" />

          <div class="row items-center">
            <q-icon
              name="attach_file"
              color="positive"
              class="q-mr-sm"
            />

            <div>
              <div class="text-grey-7">
                Comprobante
              </div>

              <div class="text-weight-medium">
                {{ archivo }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-bold">
              Total a pagar
            </div>

            <div class="text-h4 text-positive text-weight-bold">
              $ {{ total.toFixed(2) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="grey-8"
            label="Volver"
            v-close-popup
          />

          <q-btn
            color="positive"
            label="Enviar código"
            :loading="cargando"
            @click="confirmarRegistro"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de correo duplicado -->
    <q-dialog
      v-model="mostrarCorreoDuplicado"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:500px;max-width:90vw"
      >
        <q-card-section class="bg-orange text-white">
          <div class="text-h6 text-weight-bold">
            Correo ya registrado
          </div>

          <div class="text-caption">
            No se pudo completar el registro.
          </div>
        </q-card-section>

        <q-card-section class="text-center q-pa-lg">
          <q-icon
            name="warning"
            color="orange"
            size="64px"
          />

          <div class="text-h6 q-mt-md">
            Este correo ya fue registrado anteriormente
          </div>

          <div class="text-grey-7 q-mt-sm">
            Verifica el correo ingresado o utiliza uno diferente para continuar.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="grey-8"
            label="Cerrar"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de código de verificación -->
    <q-dialog
      v-model="mostrarCodigoVerificacion"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:500px;max-width:90vw"
      >
        <q-card-section class="bg-positive text-white">
          <div class="text-h6 text-weight-bold">
            Verificación de correo
          </div>

          <div class="text-caption">
            Hemos enviado un código a tu correo electrónico.
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-grey-7 q-mb-md">
            Ingresa el código que enviamos a:
          </div>

          <div class="text-weight-bold q-mb-lg">
            {{ correoCodigo }}
          </div>

          <q-input
  outlined
  stack-label
  hide-bottom-space
  color="positive"
  class="codigo-verificacion-input"
  input-class="codigo-verificacion-text"
  v-model="codigoVerificacion"
  label="Código de verificación"
  placeholder="000000"
  maxlength="6"
  mask="######"
/>

          <div
            v-if="codigoError"
            class="upload-error q-mt-md"
          >
            {{ codigoError }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="grey-8"
            label="Cancelar"
            :disable="cargando"
            @click="cancelarCodigo"
          />

          <q-btn
            color="positive"
            label="Confirmar registro"
            :loading="cargando"
            @click="confirmarCodigoYRegistrar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de registro exitoso -->
    <q-dialog
      v-model="mostrarRegistroExitoso"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:560px;max-width:90vw"
      >
        <q-card-section class="bg-positive text-white">
          <div class="text-h6 text-weight-bold">
            Registro enviado correctamente
          </div>

          <div class="text-caption">
            Tu solicitud fue recibida.
          </div>
        </q-card-section>

        <q-card-section class="text-center q-pa-lg">
          <q-icon
            name="mark_email_read"
            color="positive"
            size="72px"
          />

          <div class="text-h6 q-mt-md">
            Tu correo fue verificado correctamente
          </div>

          <div class="text-grey-7 q-mt-sm">
            El comité revisará tu información y comprobante de pago.
            Espera el correo de confirmación para continuar con el proceso.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="positive"
            label="Entendido"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const API_EXTERNOS = 'http://localhost:3000/api/externos'
const API_ENVIAR_CODIGO =
  'http://localhost:3000/api/externos/enviar-codigo'

const COSTO_DIA = 250
const MAX_SIZE = 5 * 1024 * 1024

const TIPOS_VALIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
]

const formRef = ref(null)
const fileInput = ref(null)

const mostrarResumen = ref(false)
const cargando = ref(false)
const mostrarCorreoDuplicado = ref(false)
const mostrarRegistroExitoso = ref(false)
const mostrarCodigoVerificacion = ref(false)

const mensajeError = ref('')
const codigoVerificacion = ref('')
const codigoError = ref('')
const verificationToken = ref('')
const correoCodigo = ref('')

const dias = [
  { label: 'Día 1', value: 'dia1' },
  { label: 'Día 2', value: 'dia2' },
  { label: 'Día 3', value: 'dia3' }
]

const form = ref({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  telefono: '',
  institucion: '',
  dias: [],
  comprobante: null
})

const isDragging = ref(false)
const archivoError = ref('')
const diasError = ref('')

const total = computed(() =>
  form.value.dias.length * COSTO_DIA
)

const diasSeleccionados = computed(() =>
  dias.filter(d => form.value.dias.includes(d.value))
)

const nombreCompleto = computed(() =>
  [
    form.value.nombre,
    form.value.apellidoPaterno,
    form.value.apellidoMaterno
  ]
    .filter(Boolean)
    .join(' ')
)

const archivo = computed(() =>
  form.value.comprobante
    ? form.value.comprobante.name
    : 'Adjuntar comprobante'
)

const accionLabel = computed(() =>
  form.value.comprobante
    ? 'Cambiar archivo'
    : 'Seleccionar archivo'
)

function abrirSelector() {
  fileInput.value?.pickFiles()
}

function esArchivoValido(file) {
  if (!TIPOS_VALIDOS.includes(file.type)) {
    archivoError.value = 'Formato no válido. Solo PDF, JPG o PNG.'
    return false
  }

  if (file.size > MAX_SIZE) {
    archivoError.value = 'El archivo supera el tamaño máximo de 5 MB.'
    return false
  }

  archivoError.value = ''
  return true
}

function seleccionarArchivo(file) {
  if (!file) {
    form.value.comprobante = null
    return
  }

  if (!esArchivoValido(file)) {
    form.value.comprobante = null
    return
  }

  form.value.comprobante = file
}

function onDrop(event) {
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]

  if (!file) return
  if (!esArchivoValido(file)) return

  form.value.comprobante = file
}

function validarDias() {
  if (form.value.dias.length === 0) {
    diasError.value = 'Selecciona al menos un día.'
    return false
  }

  diasError.value = ''
  return true
}

function limpiarFormulario() {
  form.value = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    telefono: '',
    institucion: '',
    dias: [],
    comprobante: null
  }

  archivoError.value = ''
  diasError.value = ''
  mensajeError.value = ''
  codigoError.value = ''
  codigoVerificacion.value = ''
  verificationToken.value = ''
  correoCodigo.value = ''
  isDragging.value = false

  formRef.value?.resetValidation()
}

function cancelarCodigo() {
  mostrarCodigoVerificacion.value = false
  codigoVerificacion.value = ''
  codigoError.value = ''
  verificationToken.value = ''
  correoCodigo.value = ''
}

async function registrar() {
  const formularioValido = await formRef.value.validate()
  const diasValidos = validarDias()

  if (!form.value.comprobante) {
    archivoError.value = 'Debes adjuntar un comprobante.'
  }

  if (
    !formularioValido ||
    !diasValidos ||
    !form.value.comprobante
  ) {
    return
  }

  mensajeError.value = ''
  codigoError.value = ''
  mostrarResumen.value = true
}

async function confirmarRegistro() {
  cargando.value = true
  mensajeError.value = ''
  codigoError.value = ''

  try {
    const response = await fetch(API_ENVIAR_CODIGO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: form.value.correo
      })
    })

    const data = await response.json().catch(() => null)

    if (response.status === 409) {
      mostrarResumen.value = false
      mostrarCorreoDuplicado.value = true
      return
    }

    if (!response.ok) {
      throw new Error(
        data?.message || 'No se pudo enviar el código de verificación.'
      )
    }

    verificationToken.value = data.verificationToken
    correoCodigo.value = form.value.correo

    mostrarResumen.value = false
    mostrarCodigoVerificacion.value = true
  } catch (error) {
    mensajeError.value =
      error.message || 'Ocurrió un error al enviar el código.'

    console.error('Error al enviar código:', error)
  } finally {
    cargando.value = false
  }
}

async function confirmarCodigoYRegistrar() {
  cargando.value = true
  codigoError.value = ''

  if (!codigoVerificacion.value) {
    codigoError.value =
      'Ingresa el código que enviamos a tu correo electrónico.'
    cargando.value = false
    return
  }

  try {
    const formData = new FormData()

    formData.append('nombre', form.value.nombre)
    formData.append('apellidoPaterno', form.value.apellidoPaterno)
    formData.append('apellidoMaterno', form.value.apellidoMaterno || '')
    formData.append('correo', form.value.correo)
    formData.append('telefono', form.value.telefono)
    formData.append('institucion', form.value.institucion)
    formData.append('total', String(total.value))
    formData.append('codigoVerificacion', codigoVerificacion.value)
    formData.append('verificationToken', verificationToken.value)

    form.value.dias.forEach((dia) => {
      formData.append('dias', dia)
    })

    formData.append('comprobante', form.value.comprobante)

    const response = await fetch(API_EXTERNOS, {
      method: 'POST',
      body: formData
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      codigoError.value =
        data?.message ||
        'Código incorrecto. Verifica tu correo electrónico o vuelve a intentarlo.'
      return
    }

    mostrarCodigoVerificacion.value = false
    mostrarRegistroExitoso.value = true
    limpiarFormulario()
  } catch (error) {
    codigoError.value =
      error.message ||
      'Código incorrecto. Verifica tu correo electrónico o vuelve a intentarlo.'

    console.error('Error al confirmar código:', error)
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="scss">
@import "../../css/registro-externo.scss";
</style>
