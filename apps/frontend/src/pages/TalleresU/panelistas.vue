<template>
  <q-page class="panelistas-page">
    <section class="panelistas-shell">
      <div class="panelistas-header">
        <div>
          <span class="panelistas-kicker">Congreso UTVM</span>

          <h1>Ponentes y panelistas</h1>

          <p>
            Conoce a los ponentes y panelistas registrados para el congreso.
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
        <strong>Cargando ponentes y panelistas...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="error"
        class="panelistas-state error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudieron cargar los ponentes y panelistas</strong>
        <span>{{ error }}</span>
      </div>

      <div
        v-else-if="panelistasVisibles.length === 0"
        class="panelistas-state"
      >
        <q-icon name="groups" />
        <strong>No hay ponentes o panelistas registrados</strong>
        <span>
          Cuando el administrador registre ponentes o panelistas, aparecerán aquí.
        </span>
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

          <span
            class="panelista-tipo"
            :class="obtenerClaseTipo(panelista.tipo)"
          >
            {{ obtenerTextoTipo(panelista.tipo) }}
          </span>

          <p class="panelista-tema">
            {{ panelista.tema || 'Tema no registrado' }}
          </p>

          <p class="panelista-semblanza">
            {{ panelista.semblanza || 'Esta persona aún no cuenta con semblanza registrada.' }}
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
import { usePonente } from '@/composables/usePonente';

interface PanelistaPublico {
  id: string;
  nombre: string;
  institucion?: string | null;
  tema?: string | null;
  semblanza?: string | null;
  tipo?: string | null;
  visible_publico?: boolean;
  visiblePublico?: boolean;
  foto?: {
    url?: string | null;
    ruta_archivo?: string | null;
  } | null;
}

const router = useRouter();

const { useGetPonentes } = usePonente();

const {
  data,
  isLoading: isRefreshing,
  error,
  refetch,
} = useGetPonentes(50, 0, null);

const panelistasVisibles = computed<PanelistaPublico[]>(() => {
  const lista: PanelistaPublico[] = Array.isArray(data.value)
    ? (data.value as PanelistaPublico[])
    : [];

  return lista.filter((panelista) => {
    const visibleNuevo = panelista.visiblePublico !== false;
    const visibleViejo = panelista.visible_publico !== false;

    return visibleNuevo && visibleViejo;
  });
});

onMounted(() => {
  void load();
});

function load() {
  return refetch();
}

function irADetalle(id: string) {
  void router.push(`/panelistas_u/${id}`);
}

function obtenerFotoPanelista(panelista: PanelistaPublico) {
  return panelista.foto?.url || panelista.foto?.ruta_archivo || '';
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
