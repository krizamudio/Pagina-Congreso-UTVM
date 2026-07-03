<template>
  <q-page class="verificar-page flex flex-center">
    <q-card class="verificar-card">
      <q-card-section class="text-center">
        <q-icon
          :name="estado === 'success' ? 'check_circle' : estado === 'error' ? 'error' : 'mail'"
          :color="estado === 'success' ? 'positive' : estado === 'error' ? 'negative' : 'primary'"
          size="64px"
          class="q-mb-md"
        />

        <div class="text-h5 q-mb-sm">
          {{ titulo }}
        </div>

        <div class="text-body1 text-grey-8">
          {{ mensaje }}
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn
          color="primary"
          label="Ir al inicio"
          to="/"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { verificarCorreoParticipante } from '../services/registroNsuService'

type Estado = 'loading' | 'success' | 'error'

const route = useRoute()

const estado = ref<Estado>('loading')
const titulo = ref('Verificando correo...')
const mensaje = ref('Espera un momento mientras validamos tu enlace.')

onMounted(async () => {
  const token = route.query.token

  if (!token || typeof token !== 'string') {
    estado.value = 'error'
    titulo.value = 'Enlace inválido'
    mensaje.value = 'No se encontró un token de verificación válido.'
    return
  }

  try {
    const response = await verificarCorreoParticipante(token)

    estado.value = 'success'
    titulo.value = 'Correo verificado'
    mensaje.value =
      response?.mensaje || 'Tu correo fue verificado correctamente.'
  } catch (error: any) {
    estado.value = 'error'
    titulo.value = 'No fue posible verificar el correo'
    mensaje.value =
      error?.response?.data?.message ||
      'El enlace es inválido, ya expiró o no pudo procesarse.'
  }
})
</script>

<style scoped>
.verificar-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(0, 224, 164, 0.12), transparent 35%),
    linear-gradient(135deg, #021817, #062b27);
  padding: 24px;
}

.verificar-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
}
</style>