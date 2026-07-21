<template>
  <q-page class="login-page">
    <!-- Botón para regresar -->
    <button
      type="button"
      class="back-button"
      aria-label="Volver a la página principal"
      @click="volverInicio"
    >
      <q-icon name="arrow_back" size="27px" />
      <span>Volver a la página principal</span>
    </button>

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
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar, type QForm } from 'quasar';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { iniciarSesionPorCorreo } from '../services/loginService';

interface ErrorBackend {
  message?: string | string[];
}

const router = useRouter();
const $q = useQuasar();

const loginForm = ref<QForm | null>(null);
const email = ref('');
const loading = ref(false);

const emailRules = [
  (value: string) =>
    Boolean(value) || 'El correo electrónico es obligatorio',

  (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    'Ingresa un correo electrónico válido',
];

const volverInicio = async (): Promise<void> => {
  await router.push('/');
};

const enviarCorreo = async (): Promise<void> => {
  const formularioValido = await loginForm.value?.validate();

  if (!formularioValido) {
    return;
  }

  loading.value = true;

  try {
    const respuesta = await iniciarSesionPorCorreo(email.value);

    localStorage.setItem(
      'participante',
      JSON.stringify(respuesta.participante),
    );

    localStorage.setItem(
      'tipoParticipante',
      respuesta.tipo,
    );

    localStorage.setItem(
      'correoParticipante',
      respuesta.participante.correo,
    );

    $q.notify({
      type: 'positive',
      message: `Bienvenido, ${respuesta.participante.nombreCompleto}.`,
      position: 'top',
    });

    await router.push('/');
  } catch (error: unknown) {
    console.error('Error al iniciar sesión:', error);

    let mensaje = 'No fue posible iniciar sesión.';

    if (error instanceof AxiosError) {
      const data = error.response?.data as ErrorBackend | undefined;
      const mensajeBackend = data?.message;

      if (Array.isArray(mensajeBackend)) {
        mensaje = mensajeBackend.join(', ');
      } else if (typeof mensajeBackend === 'string') {
        mensaje = mensajeBackend;
      }
    }

    $q.notify({
      type: 'negative',
      message: mensaje,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss">
@import "../css/login.scss";
</style>