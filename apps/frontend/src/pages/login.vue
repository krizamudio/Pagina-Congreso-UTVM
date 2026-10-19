<template>
  <q-page class="login-page">
    <!-- Elementos decorativos -->
    <div class="background-decoration background-decoration-left"></div>
    <div class="background-decoration background-decoration-right"></div>

    <div class="dots dots-top"></div>
    <div class="dots dots-bottom"></div>

    <!-- Contenido principal -->
    <main class="login-container">
      <section class="login-card">
        <!-- Icono -->
        <div class="login-icon-container">
          <q-icon name="person_outline" class="login-icon" />

          <span class="icon-line icon-line-one"></span>
          <span class="icon-line icon-line-two"></span>
          <span class="icon-line icon-line-three"></span>
        </div>

        <!-- Encabezado -->
        <div class="login-header">
          <h1>¡Bienvenido!</h1>
          <p>Inicia sesión y disfruta del congreso.</p>
        </div>

        <!-- Formulario -->
        <q-form
          ref="loginForm"
          class="login-form"
          @submit.prevent="enviarCorreo"
        >
          <div class="form-group">
            <label class="input-label" for="email">
              Correo electrónico
            </label>

            <q-input
              id="email"
              v-model.trim="email"
              type="email"
              outlined
              no-error-icon
              hide-bottom-space
              autocomplete="email"
              placeholder="ejemplo@correo.com"
              class="email-input"
              :rules="emailRules"
              :disable="loading"
            >
              <template #prepend>
                <q-icon name="mail_outline" class="input-icon" />
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="submit-button full-width"
            :loading="loading"
            :disable="loading"
          >
            <q-icon name="mail_outline" size="24px" />
            <span>Enviar</span>

            <template #loading>
              <q-spinner size="24px" />
              <span>Enviando...</span>
            </template>
          </q-btn>
        </q-form>
      </section>
    </main>

    <!-- ===================================================== -->
    <!-- MODAL DE VERIFICACIÓN DEL CÓDIGO -->
    <!-- ===================================================== -->
    <q-dialog
      v-model="mostrarModalCodigo"
      persistent
    >
      <q-card class="codigo-card">
        <q-card-section class="text-center">
          <div class="codigo-icon-container">
            <q-icon
              name="mark_email_read"
              size="55px"
              color="primary"
            />
          </div>

          <div class="text-h5 text-weight-bold q-mt-md">
            Verifica tu identidad
          </div>

          <div class="text-body1 q-mt-sm text-grey-7">
            Enviamos un código de 6 dígitos a:
          </div>

          <div class="text-weight-bold q-mt-xs">
            {{ email }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="verificarCodigo">
            <q-input
              ref="codigoInput"
              v-model="codigo"
              outlined
              autofocus
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              placeholder="000000"
              class="codigo-input"
              :disable="verificandoCodigo"
              :rules="codigoRules"
              @update:model-value="filtrarCodigo"
            />

            <div class="text-caption text-grey-7 text-center q-mt-sm">
              El código tiene una vigencia de 5 minutos.
            </div>

            <q-btn
              type="submit"
              unelevated
              no-caps
              color="primary"
              label="Verificar código"
              class="full-width q-mt-lg"
              :loading="verificandoCodigo"
              :disable="
                verificandoCodigo ||
                codigo.length !== 6
              "
            />

            <q-btn
              flat
              no-caps
              color="grey-8"
              label="Cancelar"
              class="full-width q-mt-sm"
              :disable="verificandoCodigo"
              @click="cerrarModalCodigo"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { api } from '../services/api';

interface ParticipanteLogin {
  id: string;
  registroId?: string | null;
  nombreCompleto: string;
  correo: string;
  institucion?: string;
  carrera?: string;
  telefono?: string;
  cuatrimestre?: string | number;
  grupo?: string;
}

interface RespuestaEnvioCodigo {
  mensaje: string;
  requiereCodigo: boolean;
  minutosVigencia?: number;
}

interface RespuestaLogin {
  mensaje: string;
  tipo: 'EXTERNO' | 'NSU' | 'EMS' | 'UTVM';
  participante: ParticipanteLogin;
}

const $q = useQuasar();
const router = useRouter();

const email = ref('');
const codigo = ref('');

const loading = ref(false);
const verificandoCodigo = ref(false);
const mostrarModalCodigo = ref(false);

const codigoInput = ref();

const emailRules = [
  (value: string) =>
    !!value || 'El correo electrónico es obligatorio.',

  (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    'Ingresa un correo electrónico válido.',
];

const codigoRules = [
  (value: string) =>
    !!value || 'Ingresa el código de verificación.',

  (value: string) =>
    /^\d{6}$/.test(value) ||
    'El código debe contener exactamente 6 dígitos.',
];

/*
 * ============================================================
 * PASO 1
 * ============================================================
 *
 * Envía el correo al backend.
 *
 * El backend:
 * - busca al participante
 * - valida sus requisitos
 * - genera el OTP
 * - guarda el OTP
 * - envía el correo
 */
async function enviarCorreo() {
  if (!email.value) {
    return;
  }

  loading.value = true;

  try {
    const response = await api.post<RespuestaEnvioCodigo>(
      '/login',
      {
        correo: email.value,
      },
    );

    if (response.data.requiereCodigo) {
      codigo.value = '';
      mostrarModalCodigo.value = true;

      $q.notify({
        type: 'positive',
        message:
          response.data.mensaje ||
          'Código de verificación enviado.',
        position: 'top',
      });

      /*
       * Esperamos a que el modal sea renderizado
       * para enfocar el campo del código.
       */
      await nextTick();

      codigoInput.value?.focus();
    }
  } catch (error: any) {
    const mensaje =
      error?.response?.data?.message ||
      error?.response?.data?.mensaje ||
      'No fue posible iniciar sesión.';

    $q.notify({
      type: 'negative',
      message: mensaje,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

/*
 * ============================================================
 * FILTRO DEL OTP
 * ============================================================
 *
 * Solamente permite números y máximo 6 caracteres.
 */
function filtrarCodigo(value: string | number | null) {
  codigo.value = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 6);
}

/*
 * ============================================================
 * PASO 2
 * ============================================================
 *
 * Envía:
 *
 * correo + código
 *
 * al endpoint:
 *
 * POST /login/verificar-codigo
 */
async function verificarCodigo() {
  if (!/^\d{6}$/.test(codigo.value)) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa los 6 dígitos del código.',
      position: 'top',
    });

    return;
  }

  verificandoCodigo.value = true;

  try {
    const response = await api.post<RespuestaLogin>(
      '/login/verificar-codigo',
      {
        correo: email.value,
        codigo: codigo.value,
      },
    );

    /*
     * ==========================================================
     * LOGIN CORRECTO
     * ==========================================================
     */

    const datosLogin = response.data;

    /*
     * Temporalmente guardamos la información del participante
     * para mantener la sesión del frontend.
     *
     * Después podemos adaptarlo a Pinia si tu proyecto ya
     * utiliza un store para el participante.
     */
    localStorage.setItem(
      'participante',
      JSON.stringify(datosLogin.participante),
    );

    localStorage.setItem(
      'tipoParticipante',
      datosLogin.tipo,
    );

    $q.notify({
      type: 'positive',
      message: `Bienvenido, ${datosLogin.participante.nombreCompleto}`,
      position: 'top',
    });

    mostrarModalCodigo.value = false;
    codigo.value = '';

    /*
     * Redirección después del login.
     *
     * Si tu sistema utiliza otra ruta después de iniciar sesión,
     * solamente cambia '/' por esa ruta.
     */
    await router.push('/');
  } catch (error: any) {
  console.log('ERROR COMPLETO:', error);
  console.log('RESPUESTA BACKEND:', error?.response?.data);

  const mensaje =
    error?.response?.data?.message ||
    error?.response?.data?.mensaje ||
    'El código de verificación no es válido.';

  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'top',
  });

  codigo.value = '';

  await nextTick();
  codigoInput.value?.focus();
} finally {
    verificandoCodigo.value = false;
  }
}

/*
 * ============================================================
 * CANCELAR VERIFICACIÓN
 * ============================================================
 */
function cerrarModalCodigo() {
  mostrarModalCodigo.value = false;
  codigo.value = '';
}
</script>

<style lang="scss">
@import "../css/login.scss";
</style>