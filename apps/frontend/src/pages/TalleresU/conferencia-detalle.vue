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
          <div class="speaker-avatar">
            <span>
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

          <article class="info-card">
            <q-icon name="person" />
            <div>
              <span>Ponente</span>
              <strong>
                {{ ponenteConferencia?.nombre || 'Ponente no asignado' }}
              </strong>
            </div>
          </article>
        </section>

        <section
          v-if="!conferencia.ponente"
          class="warning-card"
        >
          <q-icon name="warning" />
          <p>
            Esta conferencia no tiene un ponente asignado desde el panel de administración.
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

        <section class="technical-section">
          <h2>Información adicional</h2>

          <div class="technical-grid">
            <div>
              <span>ID de conferencia</span>
              <strong>{{ conferencia.id }}</strong>
            </div>

            <div>
              <span>ID de ubicación</span>
              <strong>{{ obtenerIdUbicacion(conferencia) }}</strong>
            </div>

            <div>
              <span>ID de ponente asignado</span>
              <strong>{{ obtenerIdPonente(conferencia) }}</strong>
            </div>
          </div>
        </section>
      </template>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useConferenciasQuery } from '@/composables/useConferenciasQuery';
import { usePanelesQuery } from '@/composables/UsePanelesQuery';
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

function obtenerNombreUbicacion(data: ConferenciaDetalle) {
  return data.ubicacion?.nombre || 'Ubicación asignada';
}

function obtenerIdUbicacion(data: ConferenciaDetalle) {
  return data.ubicacion?.id || data.ubicacion_id || 'Sin ubicación';
}

function obtenerIdPonente(data: ConferenciaDetalle) {
  return data.ponente?.id || data.ponente_id || 'Sin ponente';
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
.conference-detail-page {
  min-height: calc(100vh - 64px);
  padding: 34px 22px;
  background:
    radial-gradient(circle at 75% 18%, rgba(0, 230, 118, 0.22), transparent 34%),
    radial-gradient(circle at 10% 70%, rgba(0, 184, 107, 0.14), transparent 30%),
    linear-gradient(135deg, #071e1b 0%, #031411 100%);
  color: #ffffff;
}

.conference-detail-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.detail-back-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 34px;
}

.detail-back-btn {
  color: rgba(255, 255, 255, 0.72) !important;
  font-weight: 700;

  &:hover {
    color: #00e676 !important;
  }
}

.detail-refresh-btn {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.speaker-hero {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 34px;
  align-items: center;
  margin-bottom: 44px;
}

.speaker-avatar {
  width: 150px;
  height: 150px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(circle at top, rgba(102, 245, 181, 0.28), transparent 58%),
    linear-gradient(145deg, rgba(0, 230, 118, 0.28), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(0, 230, 118, 0.35);
  box-shadow:
    0 0 0 10px rgba(0, 230, 118, 0.04),
    0 26px 60px rgba(0, 0, 0, 0.35);

  span {
    font-size: 3rem;
    font-weight: 900;
    color: #ffffff;
  }
}

.speaker-main-info {
  h1 {
    margin: 8px 0 10px;
    font-size: clamp(2.4rem, 6vw, 4.4rem);
    line-height: 0.96;
    font-weight: 900;
    letter-spacing: -0.06em;
    color: #ffffff;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: clamp(1rem, 2vw, 1.35rem);
    line-height: 1.45;
  }
}

.hero-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;

  &.featured {
    background: rgba(0, 230, 118, 0.14);
    color: #66f5b5;
  }
}

.speaker-topic {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 8px 12px;
  border-radius: 999px;
  color: #66f5b5;
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.22);
  font-weight: 800;

  .q-icon {
    font-size: 18px;
  }
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}

.info-card {
  display: flex;
  gap: 12px;
  padding: 18px;
  min-height: 112px;
  border-radius: 18px;
  background: rgba(31, 42, 40, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);

  .q-icon {
    color: #00e676;
    font-size: 28px;
  }

  span {
    display: block;
    color: rgba(255, 255, 255, 0.56);
    font-size: 0.88rem;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: #ffffff;
    font-size: 1rem;
    line-height: 1.35;
    font-weight: 900;
  }
}

.content-section,
.sessions-section,
.technical-section {
  margin-bottom: 28px;
}

.content-section {
  h2 {
    margin: 0 0 20px;
    color: #ffffff;
    font-size: 1.35rem;
    font-weight: 900;
  }

  p {
    margin: 0;
    max-width: 1050px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 1.05rem;
    line-height: 1.8;
  }
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.35rem;
    font-weight: 900;
  }

  span {
    color: rgba(255, 255, 255, 0.72);
    font-weight: 900;
  }
}

.session-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border-radius: 18px;
  background: rgba(0, 230, 118, 0.06);
  border: 1px solid rgba(0, 230, 118, 0.32);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);

  h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 900;
  }

  p {
    margin: 8px 0 12px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.session-track {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  color: #66f5b5;
  background: rgba(102, 245, 181, 0.08);
  border: 1px solid rgba(102, 245, 181, 0.28);
  font-size: 0.78rem;
  font-weight: 800;
}

.session-type {
  align-self: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.82rem;
  font-weight: 900;
}

.warning-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 26px;
  border-radius: 16px;
  background: rgba(255, 176, 32, 0.12);
  border: 1px solid rgba(255, 176, 32, 0.32);
  color: rgba(255, 255, 255, 0.78);

  .q-icon {
    color: #ffb020;
    font-size: 24px;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  strong {
    color: #ffffff;
  }
}

.technical-section {
  padding: 22px;
  border-radius: 18px;
  background: rgba(31, 42, 40, 0.54);
  border: 1px solid rgba(255, 255, 255, 0.08);

  h2 {
    margin: 0 0 18px;
    color: #00e676;
    font-size: 1.2rem;
    font-weight: 900;
  }
}

.technical-grid {
  display: grid;
  gap: 14px;

  span {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.82rem;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: #ffffff;
    font-size: 0.9rem;
    line-height: 1.4;
    word-break: break-word;
  }
}

.detail-state-card {
  min-height: 300px;
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 34px;
  border-radius: 20px;
  background: rgba(31, 42, 40, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;

  .q-icon {
    color: #00e676;
    font-size: 44px;
  }

  strong {
    font-size: 1.15rem;
    color: #ffffff;
  }

  span {
    color: rgba(255, 255, 255, 0.62);
  }

  &.error {
    .q-icon {
      color: #ff4d9d;
    }
  }
}

@media (max-width: 980px) {
  .speaker-hero {
    grid-template-columns: 110px 1fr;
    gap: 22px;
  }

  .speaker-avatar {
    width: 110px;
    height: 110px;

    span {
      font-size: 2.25rem;
    }
  }

  .detail-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .conference-detail-page {
    padding: 22px 14px;
  }

  .detail-back-row {
    margin-bottom: 24px;
  }

  .speaker-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .speaker-avatar {
    margin: 0 auto;
  }

  .hero-tags,
  .speaker-topic {
    justify-content: center;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .session-card {
    flex-direction: column;
  }

  .session-type {
    align-self: flex-start;
  }
}
</style>
