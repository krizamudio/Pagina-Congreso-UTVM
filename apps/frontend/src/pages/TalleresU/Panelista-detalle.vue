<template>
  <q-page class="panelista-detail-page">
    <section class="panelista-detail-shell">
      <div class="panelista-detail-back">
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Volver a ponentes y panelistas"
          class="panelista-back-btn"
          @click="irAListado"
        />

        <q-btn
          flat
          round
          icon="refresh"
          class="panelista-refresh-btn"
          :loading="isLoading"
          :disable="isLoading"
          @click="cargarPanelista"
        />
      </div>

      <div
        v-if="isLoading"
        class="panelistas-state"
      >
        <q-icon name="hourglass_top" />
        <strong>Cargando información...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="error"
        class="panelistas-state error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudo cargar la información</strong>
        <span>{{ error }}</span>
      </div>

      <template v-else-if="panelista">
        <section class="panelista-hero">
          <div
            class="panelista-hero-avatar panelista-detail-avatar"
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
            <span
              class="panelista-badge"
              :class="obtenerClaseTipo(panelista.tipo)"
            >
              {{ obtenerTextoTipo(panelista.tipo) }}
            </span>

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
            {{ panelista.semblanza || 'Esta persona aún no cuenta con semblanza registrada.' }}
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
              <span>Tipo</span>
              <strong>{{ obtenerTextoTipo(panelista.tipo) }}</strong>
            </div>

            <div>
              <span>Institución</span>
              <strong>{{ panelista.institucion || 'Sin institución' }}</strong>
            </div>

            <div>
              <span>Tema</span>
              <strong>{{ panelista.tema || 'Sin tema' }}</strong>
            </div>
          </div>
        </section>
      </template>

      <div
        v-else
        class="panelistas-state"
      >
        <q-icon name="person_off" />
        <strong>No se encontró la información</strong>
        <span>Verifica que el registro exista en la base de datos.</span>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePonente } from '@/composables/usePonente';

interface FotoPanelista {
  url?: string | null;
  ruta_archivo?: string | null;
}

interface PanelistaDetalle {
  id: string;
  nombre: string;
  institucion?: string | null;
  tema?: string | null;
  semblanza?: string | null;
  tipo?: string | null;
  visible_publico?: boolean;
  visiblePublico?: boolean;
  foto?: FotoPanelista | null;
}

const route = useRoute();
const router = useRouter();

const id = String(route.params.id || '');

const { useGetPonenteById } = usePonente();

const {
  data,
  isLoading,
  error,
  fetch: cargarPanelista,
} = useGetPonenteById(id);

const panelista = computed<PanelistaDetalle | null>(() => {
  if (!data.value) {
    return null;
  }

  return data.value as unknown as PanelistaDetalle;
});

onMounted(() => {
  void cargarPanelista();
});

function irAListado() {
  void router.push('/panelistas_u');
}

function obtenerFotoPanelista(item: PanelistaDetalle) {
  return item.foto?.url || item.foto?.ruta_archivo || '';
}

function obtenerIniciales(nombre: string) {
  if (!nombre) {
    return '?';
  }

  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

function obtenerTextoTipo(tipo?: string | null) {
  const tipoNormalizado = String(tipo || '').toLowerCase();

  if (tipoNormalizado === 'ponente') {
    return 'Ponente';
  }

  if (tipoNormalizado === 'panelista') {
    return 'Panelista';
  }

  return 'Invitado';
}

function obtenerClaseTipo(tipo?: string | null) {
  const tipoNormalizado = String(tipo || '').toLowerCase();

  if (tipoNormalizado === 'ponente') {
    return 'is-ponente';
  }

  if (tipoNormalizado === 'panelista') {
    return 'is-panelista';
  }

  return 'is-invitado';
}
</script>

<style lang="scss">
@import "@/css/panelistas.scss";
</style>
