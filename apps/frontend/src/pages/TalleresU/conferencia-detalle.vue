<template>
  <q-page class="conference-detail-page">
    <section class="conference-detail-shell">
      <div class="detail-back-row">
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Volver a conferencias"
          class="detail-back-btn"
          @click="volver"
        />

        <q-btn
          flat
          round
          icon="refresh"
          class="detail-refresh-btn"
          :loading="cargando"
          :disable="cargando"
          @click="cargarDatos"
        />
      </div>

      <div
        v-if="cargando"
        class="detail-state-card"
      >
        <q-icon name="hourglass_top" />
        <strong>Cargando conferencia...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="error"
        class="detail-state-card error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudo cargar la conferencia</strong>
        <span>{{ error }}</span>
      </div>

      <template v-else-if="conferencia">
        <section class="speaker-hero">
          <div
            class="speaker-avatar"
            :class="{ 'has-photo': !!fotoPonente }"
          >
            <img
              v-if="fotoPonente"
              :src="fotoPonente"
              :alt="`Foto de ${ponenteConferencia?.nombre || 'ponente'}`"
            />

            <span v-else>
              {{ obtenerIniciales(ponenteConferencia?.nombre || conferencia.titulo) }}
            </span>
          </div>

          <div class="speaker-main-info">
            <div class="hero-tags">
              <span class="hero-tag featured">Featured</span>
              <span class="hero-tag">Conferencia</span>
            </div>

            <h1>{{ conferencia.titulo }}</h1>

            <p>
              {{ ponenteConferencia?.nombre || 'Ponente no asignado' }}
              <template v-if="ponenteConferencia?.institucion">
                · {{ ponenteConferencia.institucion }}
              </template>
            </p>

            <div
              v-if="ponenteConferencia?.tema"
              class="speaker-topic"
            >
              <q-icon name="auto_awesome" />
              <span>{{ ponenteConferencia.tema }}</span>
            </div>
          </div>
        </section>

        <section class="detail-info-grid">
          <article class="info-card">
            <q-icon name="event" />
            <div>
              <span>Fecha</span>
              <strong>{{ formatearFecha(conferencia.fecha) }}</strong>
            </div>
          </article>

          <article class="info-card">
            <q-icon name="schedule" />
            <div>
              <span>Horario</span>
              <strong>
                {{ formatearHora(conferencia.hora_inicio) }} -
                {{ formatearHora(conferencia.hora_fin) }}
              </strong>
            </div>
          </article>

          <article class="info-card">
            <q-icon name="place" />
            <div>
              <span>Ubicación</span>
              <strong>{{ obtenerNombreUbicacion(conferencia) }}</strong>
            </div>
          </article>

          <article
            class="info-card ponente-info-card"
            :class="{ 'is-clickable': !!obtenerIdPonenteReal() }"
            @click="irADetallePonente"
          >
            <q-icon name="person" />

            <div>
              <span>Ponente</span>

              <strong>
                {{ ponenteConferencia?.nombre || 'Ponente no asignado' }}
              </strong>

              <small v-if="obtenerIdPonenteReal()">
                Clic para ver detalles
              </small>
            </div>

            <q-icon
              v-if="obtenerIdPonenteReal()"
              name="arrow_forward"
              class="ponente-arrow"
            />
          </article>
        </section>

        <section
          v-if="!conferencia.ponente"
          class="warning-card"
        >
          <q-icon name="warning" />
          <p>
            Esta conferencia no tiene un ponente asignado.
          </p>
        </section>

        <section class="content-section">
          <h2>Resumen</h2>
          <p>
            {{ conferencia.resumen || 'Esta conferencia aún no cuenta con resumen disponible.' }}
          </p>
        </section>

        <section
          v-if="ponenteConferencia"
          class="content-section"
        >
          <h2>Biografía del ponente</h2>

          <p>
            {{ ponenteConferencia.semblanza || 'Este ponente aún no cuenta con semblanza registrada.' }}
          </p>
        </section>

        <section class="sessions-section">
          <div class="section-title-row">
            <h2>Sesiones</h2>
            <span>1</span>
          </div>

          <article class="session-card">
            <div>
              <h3>{{ conferencia.titulo }}</h3>

              <p>
                {{ formatearFechaCorta(conferencia.fecha) }}
                ·
                {{ formatearHora(conferencia.hora_inicio) }}
                -
                {{ formatearHora(conferencia.hora_fin) }}
                ·
                {{ obtenerNombreUbicacion(conferencia) }}
              </p>

              <span class="session-track">
                {{ conferencia.congreso?.nombre || 'Congreso UTVM' }}
              </span>
            </div>

            <span class="session-type">
              Keynote
            </span>
          </article>
        </section>
      </template>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useConferenciasQuery } from '@/composables/useConferenciasQuery';
import { usePanelesQuery } from '@/composables/usePanelesQuery';
import type { Conferencia, Ponente } from '@/types';

interface RelacionSimple {
  id: string;
  nombre: string;
}

interface PonenteRelacionado extends RelacionSimple {
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

interface ConferenciaDetalle extends Conferencia {
  congreso?: RelacionSimple | null;
  ubicacion?: RelacionSimple | null;
  ponente?: PonenteRelacionado | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

const route = useRoute();
const router = useRouter();

const { getById } = useConferenciasQuery();

const {
  data: ponentes,
  load: cargarPonentes,
} = usePanelesQuery();

const conferencia = ref<ConferenciaDetalle | null>(null);
const cargando = ref(false);
const error = ref('');

const ponenteConferencia = computed<PonenteRelacionado | Ponente | null>(() => {
  const ponenteRelacionado = conferencia.value?.ponente;

  if (!ponenteRelacionado?.id) {
    return null;
  }

  const ponenteCompleto = ponentes.value.find(
    (ponente) => ponente.id === ponenteRelacionado.id,
  );

  return ponenteCompleto || ponenteRelacionado;
});

const fotoPonente = computed(() => {
  return ponenteConferencia.value?.foto?.url || '';
});

onMounted(() => {
  void cargarDatos();
});

async function cargarDatos() {
  const id = String(route.params.id || '');

  if (!id) {
    error.value = 'No se encontró el identificador de la conferencia.';
    return;
  }

  cargando.value = true;
  error.value = '';

  try {
    const [conferenciaData] = await Promise.all([
      getById(id),
      cargarPonentes(),
    ]);

    conferencia.value = conferenciaData as ConferenciaDetalle;
  } catch (err) {
    error.value = 'No se pudo cargar la información de la conferencia.';
    console.error(err);
  } finally {
    cargando.value = false;
  }
}

function volver() {
  void router.push('/conferencias_u');
}

function obtenerIdPonenteReal() {
  return (
    ponenteConferencia.value?.id ||
    conferencia.value?.ponente?.id ||
    conferencia.value?.ponente_id ||
    ''
  );
}

function irADetallePonente() {
  const ponenteId = obtenerIdPonenteReal();

  if (!ponenteId) {
    return;
  }

  void router.push(`/panelistas_u/${ponenteId}`);
}

function obtenerNombreUbicacion(data: ConferenciaDetalle) {
  return data.ubicacion?.nombre || 'Ubicación asignada';
}

function formatearFecha(fecha: string | Date) {
  const fechaNormalizada = String(fecha).slice(0, 10);

  const [yearText = '2026', monthText = '1', dayText = '1'] =
    fechaNormalizada.split('-');

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, day));
}

function formatearFechaCorta(fecha: string | Date) {
  const fechaNormalizada = String(fecha).slice(0, 10);

  const [yearText = '2026', monthText = '1', dayText = '1'] =
    fechaNormalizada.split('-');

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(year, month, day));
}

function normalizarHora(hora?: string) {
  const horaLimpia = String(hora || '00:00').slice(0, 5);
  const [hoursText = '0', minutesText = '0'] = horaLimpia.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatearHora(hora?: string) {
  return normalizarHora(hora);
}

function obtenerIniciales(texto: string) {
  const partes = texto.trim().split(' ').filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  const iniciales = `${primera}${segunda}`.toUpperCase();

  return iniciales || '?';
}
</script>

<style scoped lang="scss">
@import "@/css/conferencia-detalle.scss";
</style>
