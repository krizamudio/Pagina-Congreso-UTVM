<template>
  <q-page class="mi-qr-page">
    <section class="mi-qr-card">
      <div class="mi-qr-hero">
        <div class="mi-qr-icon-box">
          <q-icon name="qr_code_2" />
        </div>

        <div>
          <span class="mi-qr-kicker">Acceso del participante</span>

          <h1>Mi QR de acceso</h1>

          <p>
            Tu registro ya fue validado. Si perdiste el correo donde venía tu QR,
            puedes solicitar que se genere y envíe nuevamente.
          </p>
        </div>
      </div>

      <div
        v-if="!participante"
        class="mi-qr-state"
      >
        <q-icon name="lock" />

        <h2>Necesitas iniciar sesión</h2>

        <p>
          Para solicitar el reenvío de tu QR, primero inicia sesión con el correo
          con el que te registraste.
        </p>

        <q-btn
          no-caps
          unelevated
          label="Iniciar sesión"
          to="/login"
          class="primary-action"
        />
      </div>

      <div
        v-else
        class="mi-qr-content"
      >
        <div class="participant-card">
          <div class="participant-avatar">
            {{ iniciales }}
          </div>

          <div class="participant-info">
            <h2>{{ participante.nombreCompleto }}</h2>
            <p>{{ participante.correo }}</p>

            <div class="participant-tags">
              <span>{{ tipoParticipante }}</span>

              <span v-if="participante.institucion">
                {{ participante.institucion }}
              </span>

              <span v-if="participante.carrera">
                {{ participante.carrera }}
              </span>

              <span v-if="participante.cuatrimestre && participante.grupo">
                {{ participante.cuatrimestre }}° {{ participante.grupo }}
              </span>
            </div>
          </div>
        </div>

        <div class="qr-message-card">
          <q-icon name="mark_email_read" />

          <div>
            <h3>Tu QR se envía a tu correo</h3>

            <p>
              Al presionar el botón, el sistema generará un QR nuevo y lo enviará
              al correo registrado:
              <strong>{{ participante.correo }}</strong>
            </p>
          </div>
        </div>

        <q-btn
          no-caps
          unelevated
          class="primary-action full-width"
          :loading="loading"
          :disable="loading"
          @click="reenviarQr"
        >
          <q-icon name="send" />
          <span>Reenviar mi QR</span>

          <template #loading>
            <q-spinner size="22px" />
            <span>Enviando QR...</span>
          </template>
        </q-btn>

        <q-btn
          no-caps
          flat
          class="logout-action full-width"
          :disable="loading"
          @click="cerrarSesion"
        >
          <q-icon name="logout" />
          <span>Cerrar sesión</span>
        </q-btn>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { reenviarMiQr } from '../services/miQrService';
import type {
  ParticipanteLogin,
  TipoParticipanteLogin,
} from '../services/loginService';

interface ErrorBackend {
  message?: string | string[];
}

const router = useRouter();
const $q = useQuasar();

const participante = ref<ParticipanteLogin | null>(null);
const tipoParticipante = ref<TipoParticipanteLogin | ''>('');
const loading = ref(false);

const iniciales = computed(() => {
  const nombre = participante.value?.nombreCompleto || '';
  const partes = nombre.trim().split(' ').filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  return `${primera}${segunda}`.toUpperCase() || 'QR';
});

onMounted(() => {
  cargarSesion();
});

function cargarSesion() {
  const participanteGuardado = localStorage.getItem('participante');
  const tipoGuardado = localStorage.getItem('tipoParticipante');

  if (!participanteGuardado || !tipoGuardado) {
    participante.value = null;
    tipoParticipante.value = '';
    return;
  }

  try {
    participante.value = JSON.parse(participanteGuardado) as ParticipanteLogin;
    tipoParticipante.value = tipoGuardado as TipoParticipanteLogin;
  } catch {
    participante.value = null;
    tipoParticipante.value = '';
    localStorage.removeItem('participante');
    localStorage.removeItem('tipoParticipante');
    localStorage.removeItem('correoParticipante');
  }
}

async function reenviarQr() {
  if (!participante.value || !tipoParticipante.value) {
    await router.push('/login');
    return;
  }

  loading.value = true;

  try {
    const respuesta = await reenviarMiQr(
      tipoParticipante.value,
      participante.value,
    );

    $q.notify({
      type: 'positive',
      message:
        respuesta.mensaje ||
        'Tu QR fue generado y enviado nuevamente a tu correo.',
      position: 'top',
      timeout: 3500,
      progress: true,
    });
  } catch (error: unknown) {
    console.error('Error al reenviar QR:', error);

    let mensaje =
      'No fue posible reenviar tu QR. Verifica que tu registro esté validado.';

    if (error instanceof AxiosError) {
      const data = error.response?.data as ErrorBackend | undefined;
      const mensajeBackend = data?.message;

      if (Array.isArray(mensajeBackend)) {
        mensaje = mensajeBackend.join(', ');
      } else if (typeof mensajeBackend === 'string') {
        mensaje = mensajeBackend;
      }
    } else if (error instanceof Error) {
      mensaje = error.message;
    }

    $q.notify({
      type: 'negative',
      message: mensaje,
      position: 'top',
      timeout: 4500,
      progress: true,
      multiLine: true,
    });
  } finally {
    loading.value = false;
  }
}

async function cerrarSesion() {
  localStorage.removeItem('participante');
  localStorage.removeItem('tipoParticipante');
  localStorage.removeItem('correoParticipante');

  $q.notify({
    type: 'positive',
    message: 'Sesión cerrada correctamente.',
    position: 'top',
  });

  await router.push('/');
}
</script>

<style lang="scss" scoped>
@import "@/css/mi-qr.scss";
</style>
