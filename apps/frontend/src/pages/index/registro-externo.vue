<template>
  <q-page class="registro-externo-page">
    <section class="registro-externo-header">

      <div>
        <h1>Registro de Participantes Externos</h1>

        <p>
          Completa tus datos, selecciona tus días de participación y adjunta tu comprobante de pago.
        </p>
      </div>
    </section>

    <section class="registro-externo-card">
      <div class="section-title">
        <q-icon name="person" />
        <span>Datos del participante</span>
      </div>

      <q-form
        ref="formRef"
        class="externo-form-grid"
        @submit.prevent="registrar"
      >
        <q-input
          outlined
          dense
          hide-bottom-space
          color="positive"
          class="externo-light-input"
          v-model="form.nombre"
          label="Nombre(s) *"
          placeholder="Ingresa tu nombre"
          lazy-rules
          :rules="[
            v => !!v || 'El nombre es obligatorio'
          ]"
        />

        <q-input
          outlined
          dense
          hide-bottom-space
          color="positive"
          class="externo-light-input"
          v-model="form.apellidoPaterno"
          label="Apellido paterno *"
          placeholder="Ingresa tu apellido paterno"
          lazy-rules
          :rules="[
            v => !!v || 'Campo obligatorio'
          ]"
        />

        <q-input
          outlined
          dense
          hide-bottom-space
          color="positive"
          class="externo-light-input"
          v-model="form.apellidoMaterno"
          label="Apellido materno"
          placeholder="Ingresa tu apellido materno"
        />

        <q-input
          outlined
          dense
          hide-bottom-space
          color="positive"
          class="externo-light-input"
          type="email"
          v-model="form.correo"
          label="Correo electrónico *"
          placeholder="ejemplo@correo.com"
          lazy-rules
          :rules="[
            v => !!v || 'El correo es obligatorio',
            v => /.+@.+\..+/.test(v) || 'Correo inválido'
          ]"
        />

        <q-input
          outlined
          dense
          hide-bottom-space
          color="positive"
          class="externo-light-input"
          mask="##########"
          v-model="form.telefono"
          label="Teléfono *"
          placeholder="Ej. 5512345678"
          lazy-rules
          :rules="[
            v => !!v || 'El teléfono es obligatorio',
            v => v.length === 10 || 'Debe contener 10 dígitos'
          ]"
        />

        <q-input
  outlined
  dense
  hide-bottom-space
  color="positive"
  class="externo-light-input"
  v-model="form.institucion"
  label="Institución o Empresa"
  placeholder="Nombre de la institución o empresa"
/>

        <div
          v-if="correoVerificado"
          class="correo-verificado-box"
        >
          <q-icon name="verified" />
          <span>Correo verificado correctamente</span>
        </div>

        <div class="externo-dark-box">
          <div class="box-label">
            Días de participación *
          </div>

          <div class="externo-days-grid">
            <q-checkbox
              v-for="dia in dias"
              :key="dia.value"
              v-model="form.dias"
              :val="dia.value"
              :label="dia.label"
              color="primary"
              dark
            />
          </div>

          <div
            v-if="diasError"
            class="upload-error"
          >
            {{ diasError }}
          </div>
        </div>

        <div class="externo-dark-box externo-total-box">
          <div class="box-label">
            Total a pagar
          </div>

          <div class="amount">
            $ {{ total.toFixed(2) }}
          </div>

          <div class="box-help">
            Selecciona los días de participación
          </div>
        </div>

        <div class="externo-upload-box">
          <div class="box-label">
            Comprobante de pago *
          </div>

          <q-file
            ref="fileInput"
            style="display:none"
            v-model="form.comprobante"
            accept=".pdf,.jpg,.jpeg,.png"
            @update:model-value="seleccionarArchivo"
          />

          <div
            class="externo-file-input externo-upload-layout"
            :class="{
              'is-dragging': isDragging,
              'has-file': !!form.comprobante
            }"
            @click="abrirSelector"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <div class="externo-upload-left">
              <q-icon
                :name="form.comprobante ? 'task_alt' : 'cloud_upload'"
                size="44px"
              />

              <div class="externo-upload-text">
                <strong>
                  {{ form.comprobante ? 'Comprobante seleccionado' : 'Arrastra tu archivo aquí o selecciona' }}
                </strong>

                <span v-if="!form.comprobante">
                  Formatos permitidos: PDF, JPG, JPEG, PNG. Máx. 5 MB
                </span>

                <span v-else>
                  Archivo seleccionado: {{ form.comprobante.name }}
                </span>
              </div>
            </div>

            <q-btn
              outline
              icon="upload"
              :label="accionLabel"
              class="externo-btn-outline"
              @click.stop="abrirSelector"
            />
          </div>

          <div
            v-if="archivoError"
            class="upload-error"
          >
            {{ archivoError }}
          </div>
        </div>

        <div class="externo-actions-row">
          <q-btn
            unelevated
            icon="how_to_reg"
            label="Registrar participante"
            type="submit"
            class="btn-registro"
            :loading="cargando"
          />
        </div>

        <div
          v-if="mensajeError"
          class="upload-error externo-main-error"
        >
          {{ mensajeError }}
        </div>
      </q-form>
    </section>

    <!-- Diálogo de resumen -->
    <q-dialog
      v-model="mostrarResumen"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:700px;max-width:90vw"
      >
        <q-card-section class="dialog-header">
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
                <q-icon name="person" />
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
                <q-icon name="mail" />
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
                <q-icon name="business" />
              </q-item-section>

              <q-item-section>
                <div class="text-grey-7">
                  Institución o Empresa
                </div>

                <div class="text-weight-medium">
                  {{ form.institucion }}
                </div>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" />
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
            class="externo-chip"
            icon="event_available"
          >
            {{ dia.label }}
          </q-chip>

          <q-separator class="q-my-lg" />

          <div class="row items-center">
            <q-icon
              name="attach_file"
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

            <div class="dialog-total">
              $ {{ total.toFixed(2) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Volver"
            class="dialog-btn-flat"
            v-close-popup
          />

          <q-btn
            label="Confirmar registro"
            class="dialog-btn-primary"
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
        <q-card-section class="dialog-header dialog-header-warning">
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
            class="dialog-warning-icon"
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
            label="Cerrar"
            class="dialog-btn-flat"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de verificación enviada -->
    <q-dialog
      v-model="mostrarVerificacionEnviada"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:560px;max-width:90vw"
      >
        <q-card-section class="dialog-header">
          <div class="text-h6 text-weight-bold">
            Verifica tu correo electrónico
          </div>

          <div class="text-caption">
            Aún no se ha guardado el registro.
          </div>
        </q-card-section>

        <q-card-section class="text-center q-pa-lg">
          <q-icon
            name="outgoing_mail"
            class="dialog-main-icon"
            size="72px"
          />

          <div class="text-h6 q-mt-md">
            Te enviamos un enlace de verificación
          </div>

          <div class="text-grey-7 q-mt-sm">
            Ingresa a tu correo electrónico y da clic en el enlace de verificación.
            Después vuelve a esta pantalla para finalizar el registro.
          </div>

          <div class="dialog-email q-mt-md">
            {{ form.correo }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Entendido"
            class="dialog-btn-primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de correo verificado -->
    <q-dialog
      v-model="mostrarCorreoVerificado"
      persistent
    >
      <q-card
        class="resumen-externo-card"
        style="width:560px;max-width:90vw"
      >
        <q-card-section class="dialog-header">
          <div class="text-h6 text-weight-bold">
            Correo verificado
          </div>

          <div class="text-caption">
            Ya puedes finalizar tu registro.
          </div>
        </q-card-section>

        <q-card-section class="text-center q-pa-lg">
          <q-icon
            name="verified"
            class="dialog-main-icon"
            size="72px"
          />

          <div class="text-h6 q-mt-md">
            Tu correo fue verificado correctamente
          </div>

          <div class="text-grey-7 q-mt-sm">
            Ahora confirma tu registro. Si el comprobante no aparece,
            vuelve a adjuntarlo antes de continuar.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Continuar"
            class="dialog-btn-primary"
            v-close-popup
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
        <q-card-section class="dialog-header">
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
            class="dialog-main-icon"
            size="72px"
          />

          <div class="text-h6 q-mt-md">
            Tu registro fue completado correctamente
          </div>

          <div class="text-grey-7 q-mt-sm">
            El comité revisará tu información y comprobante de pago.
            Espera el correo de confirmación para continuar con el proceso.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Entendido"
            class="dialog-btn-primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_EXTERNOS = 'http://localhost:3000/api/externos'
const API_ENVIAR_VERIFICACION =
  'http://localhost:3000/api/externos/enviar-verificacion'

const COSTO_DIA = 250
const MAX_SIZE = 5 * 1024 * 1024
const BORRADOR_KEY = 'registro_externo_borrador'

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
const mostrarVerificacionEnviada = ref(false)
const mostrarCorreoVerificado = ref(false)

const mensajeError = ref('')
const verificationToken = ref('')
const correoVerificado = ref(false)
const correoVerificadoPara = ref('')

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
    : 'Buscar archivo'
)

onMounted(() => {
  restaurarBorradorRegistro()
  leerVerificacionDesdeUrl()
})

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase()
}

function correoEstaVerificado() {
  return (
    correoVerificado.value &&
    verificationToken.value &&
    correoVerificadoPara.value === normalizarCorreo(form.value.correo)
  )
}

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

function guardarBorradorRegistro() {
  const borrador = {
    nombre: form.value.nombre,
    apellidoPaterno: form.value.apellidoPaterno,
    apellidoMaterno: form.value.apellidoMaterno,
    correo: form.value.correo,
    telefono: form.value.telefono,
    institucion: form.value.institucion,
    dias: form.value.dias
  }

  localStorage.setItem(
    BORRADOR_KEY,
    JSON.stringify(borrador)
  )
}

function restaurarBorradorRegistro() {
  const borradorGuardado = localStorage.getItem(BORRADOR_KEY)

  if (!borradorGuardado) return

  try {
    const borrador = JSON.parse(borradorGuardado)

    form.value.nombre = borrador.nombre || ''
    form.value.apellidoPaterno = borrador.apellidoPaterno || ''
    form.value.apellidoMaterno = borrador.apellidoMaterno || ''
    form.value.correo = borrador.correo || ''
    form.value.telefono = borrador.telefono || ''
    form.value.institucion = borrador.institucion || ''
    form.value.dias = Array.isArray(borrador.dias)
      ? borrador.dias
      : []
  } catch {
    localStorage.removeItem(BORRADOR_KEY)
  }
}

function leerVerificacionDesdeUrl() {
  const hash = window.location.hash || ''
  const queryString = hash.includes('?')
    ? hash.split('?')[1]
    : window.location.search.replace('?', '')

  if (!queryString) return

  const params = new URLSearchParams(queryString)
  const correo = params.get('correo')
  const token = params.get('verificationToken')

  if (!correo || !token) return

  form.value.correo = correo
  verificationToken.value = token
  correoVerificado.value = true
  correoVerificadoPara.value = normalizarCorreo(correo)
  mostrarCorreoVerificado.value = true

  window.history.replaceState(
    null,
    '',
    `${window.location.origin}${window.location.pathname}#/registro-externo`
  )
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
  verificationToken.value = ''
  correoVerificado.value = false
  correoVerificadoPara.value = ''
  isDragging.value = false

  localStorage.removeItem(BORRADOR_KEY)
  formRef.value?.resetValidation()
}

async function enviarCorreoVerificacion() {
  guardarBorradorRegistro()

  const response = await fetch(API_ENVIAR_VERIFICACION, {
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
    mostrarCorreoDuplicado.value = true
    return
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'No se pudo enviar el correo de verificación.'
    )
  }

  mostrarVerificacionEnviada.value = true
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

  if (!correoEstaVerificado()) {
    try {
      cargando.value = true
      await enviarCorreoVerificacion()
    } catch (error) {
      mensajeError.value =
        error.message ||
        'Por favor ingresa a tu correo electrónico y verifica tu registro antes de continuar.'

      console.error('Error al enviar verificación:', error)
    } finally {
      cargando.value = false
    }

    return
  }

  mostrarResumen.value = true
}

async function confirmarRegistro() {
  cargando.value = true
  mensajeError.value = ''

  if (!correoEstaVerificado()) {
    mensajeError.value =
      'Por favor ingresa a tu correo electrónico y verifica tu registro antes de continuar.'
    mostrarResumen.value = false
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

    if (response.status === 409) {
      mostrarResumen.value = false
      mostrarCorreoDuplicado.value = true
      return
    }

    if (!response.ok) {
      throw new Error(
        data?.message || 'No se pudo registrar el participante.'
      )
    }

    mostrarResumen.value = false
    mostrarRegistroExitoso.value = true
    limpiarFormulario()
  } catch (error) {
    mensajeError.value =
      error.message || 'Ocurrió un error al registrar.'

    console.error('Error al registrar:', error)
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="scss">
@import "../../css/registro-externo.scss";
</style>
