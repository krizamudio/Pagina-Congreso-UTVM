<template>
  <q-page class="panelista-detail-page">
    <section class="panelista-detail-shell">
      <div class="panelista-detail-back">
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Volver a panelistas"
          class="panelista-back-btn"
          @click="volver"
        />

        <q-btn
          flat
          round
          icon="refresh"
          class="panelista-refresh-btn"
          :loading="isLoading"
          :disable="isLoading"
          @click="fetch"
        />
      </div>

      <div
        v-if="isLoading"
        class="panelistas-state"
      >
        <q-icon name="hourglass_top" />
        <strong>Cargando panelista...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="error"
        class="panelistas-state error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudo cargar el panelista</strong>
        <span>{{ error }}</span>
      </div>

      <template v-else-if="data">
        <section class="panelista-hero">
          <div class="panelista-hero-avatar">
            <span>{{ obtenerIniciales(data.nombre) }}</span>
          </div>

          <div class="panelista-hero-info">
            <span class="panelista-badge">Panelista</span>

            <h1>{{ data.nombre }}</h1>

            <p>
              {{ data.institucion || 'Institución no registrada' }}
            </p>

            <div
              v-if="data.tema"
              class="panelista-topic"
            >
              <q-icon name="auto_awesome" />
              <span>{{ data.tema }}</span>
            </div>
          </div>
        </section>

        <section class="panelista-content-card">
          <h2>Semblanza</h2>

          <p>
            {{ data.semblanza || 'Este panelista aún no cuenta con semblanza registrada.' }}
          </p>
        </section>

        <section class="panelista-content-card">
          <h2>Información adicional</h2>

          <div class="panelista-info-grid">
            <div>
              <span>Nombre</span>
              <strong>{{ data.nombre }}</strong>
            </div>

            <div>
              <span>Institución</span>
              <strong>{{ data.institucion || 'Sin institución' }}</strong>
            </div>

            <div>
              <span>Tema</span>
              <strong>{{ data.tema || 'Sin tema' }}</strong>
            </div>

            <div>
              <span>ID de panelista</span>
              <strong>{{ data.id }}</strong>
            </div>
          </div>
        </section>
      </template>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { usePonente } from '@/composables/usePonente';

const route = useRoute();
const router = useRouter();

const id = String(route.params.id || '');

const {
  useGetPonenteById,
} = usePonente();

const {
  data,
  isLoading,
  error,
  fetch,
} = useGetPonenteById(id);

onMounted(() => {
  void fetch();
});

function volver() {
  void router.push('/panelistas_u');
}

function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(' ').filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  return `${primera}${segunda}`.toUpperCase();
}
</script>

<style scoped lang="scss">
@import "@/css/panelistas.scss";
</style>
