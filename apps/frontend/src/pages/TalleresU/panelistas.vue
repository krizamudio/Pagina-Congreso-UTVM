<template>
  <q-page class="panelistas-page">
    <section class="panelistas-shell">
      <div class="panelistas-header">
        <div>
          <span class="panelistas-kicker">Congreso UTVM</span>
          <h1>Panelistas</h1>
          <p>
            Conoce a los panelistas registrados para el congreso.
          </p>
        </div>

        <q-btn
          no-caps
          outline
          icon="refresh"
          label="Refrescar"
          class="panelistas-refresh-btn"
          :loading="isRefreshing"
          :disable="isRefreshing"
          @click="load"
        />
      </div>

      <div
        v-if="isRefreshing"
        class="panelistas-state"
      >
        <q-icon name="hourglass_top" />
        <strong>Cargando panelistas...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="error"
        class="panelistas-state error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudieron cargar los panelistas</strong>
        <span>{{ error }}</span>
      </div>

      <div
        v-else-if="panelistasVisibles.length === 0"
        class="panelistas-state"
      >
        <q-icon name="groups" />
        <strong>No hay panelistas registrados</strong>
        <span>Cuando el administrador registre panelistas, aparecerán aquí.</span>
      </div>

      <div
        v-else
        class="panelistas-grid"
      >
        <article
          v-for="panelista in panelistasVisibles"
          :key="panelista.id"
          class="panelista-card"
          @click="irADetalle(panelista.id)"
        >
          <div
            class="panelista-avatar"
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

          <h2>{{ panelista.nombre }}</h2>

          <p class="panelista-tema">
            {{ panelista.tema || 'Tema no registrado' }}
          </p>

          <p class="panelista-semblanza">
            {{ panelista.semblanza || 'Este panelista aún no cuenta con semblanza registrada.' }}
          </p>

          <div class="panelista-footer">
            <span>
              <q-icon name="business" />
              {{ panelista.institucion || 'Institución no registrada' }}
            </span>

            <q-icon name="arrow_forward" />
          </div>
        </article>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { usePanelesQuery } from '@/composables/UsePanelesQuery';

interface PanelistaPublico {
  id: string;
  nombre: string;
  institucion?: string;
  semblanza?: string;
  tema?: string;

  visible_publico?: boolean;
  visiblePublico?: boolean;

  foto?: {
    id: string;
    url: string;
  };
}

const router = useRouter();

const {
  data,
  isRefreshing,
  error,
  load,
} = usePanelesQuery();

const panelistasVisibles = computed<PanelistaPublico[]>(() =>
  (data.value as PanelistaPublico[]).filter((panelista) => {
    return panelista.visible_publico !== false && panelista.visiblePublico !== false;
  }),
);

onMounted(() => {
  void load();
});

function irADetalle(id: string) {
  void router.push(`/panelistas_u/${id}`);
}

function obtenerFotoPanelista(panelista: PanelistaPublico) {
  return panelista.foto?.url || '';
}

function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(' ').filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  const iniciales = `${primera}${segunda}`.toUpperCase();

  return iniciales || '?';
}
</script>

<style scoped lang="scss">
@import "@/css/panelistas.scss";
</style>
