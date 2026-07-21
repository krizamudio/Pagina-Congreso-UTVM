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

      <template v-else-if="panelista">
        <section class="panelista-hero">
          <div
            class="panelista-hero-avatar"
            :class="{ 'has-photo': !!obtenerFotoPanelista(panelista) }"
          >
            <img
              v-if="obtenerFotoPanelista(panelista)"
              :src="obtenerFotoPanelista(panelista)"
              :alt="`Foto de ${panelista.nombre}`"
            />

            <span v-else>
              {{ obtenerIniciales(panelista.nombre) }}
            </span>
          </div>

          <div class="panelista-hero-info">
            <span class="panelista-badge">Panelista</span>

            <h1>{{ panelista.nombre }}</h1>

            <p>
              {{ panelista.institucion || 'Institución no registrada' }}
            </p>

            <div
              v-if="panelista.tema"
              class="panelista-topic"
            >
              <q-icon name="auto_awesome" />
              <span>{{ panelista.tema }}</span>
            </div>
          </div>
        </section>

        <section class="panelista-content-card">
          <h2>Semblanza</h2>

          <p>
            {{ panelista.semblanza || 'Este panelista aún no cuenta con semblanza registrada.' }}
          </p>
        </section>

        <section class="panelista-content-card">
          <h2>Información adicional</h2>

          <div class="panelista-info-grid">
            <div>
              <span>Nombre</span>
              <strong>{{ panelista.nombre }}</strong>
            </div>

            <div>
              <span>Institución</span>
              <strong>{{ panelista.institucion || 'Sin institución' }}</strong>
            </div>

            <div>
              <span>Tema</span>
              <strong>{{ panelista.tema || 'Sin tema' }}</strong>
            </div>

            <div>
              <span>ID de panelista</span>
              <strong>{{ panelista.id }}</strong>
            </div>
          </div>
        </section>
      </template>

      <div
        v-else
        class="panelistas-state"
      >
        <q-icon name="person_off" />
        <strong>No se encontró el panelista</strong>
        <span>Verifica que el panelista exista en la base de datos.</span>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { usePonente } from '@/composables/usePonente';

interface PanelistaDetalle {
  id: string;
  nombre: string;
  institucion?: string;
  semblanza?: string;
  tema?: string;

  usuario_id?: string;
  usuarioId?: string;

  archivo_foto_id?: string | null;

  visible_publico?: boolean;
  visiblePublico?: boolean;

  foto?: {
    id: string;
    url: string;
  };
}

const route = useRoute();
const router = useRouter();

const id = String(route.params.id || '');

const { useGetPonenteById } = usePonente();

const {
  data,
  isLoading,
  error,
  fetch,
} = useGetPonenteById(id);

const panelista = computed<PanelistaDetalle | null>(() => {
  return data.value as unknown as PanelistaDetalle | null;
});

onMounted(() => {
  void fetch();
});

function volver() {
  void router.push('/panelistas_u');
}

function obtenerFotoPanelista(item: PanelistaDetalle) {
  return item.foto?.url || '';
}

function obtenerIniciales(nombre?: string) {
  const partes = String(nombre || '')
    .trim()
    .split(' ')
    .filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  const iniciales = `${primera}${segunda}`.toUpperCase();

  return iniciales || '?';
}
</script>

<style scoped lang="scss">
@import "@/css/panelistas.scss";
</style>
