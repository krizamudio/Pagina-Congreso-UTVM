<template>
  <q-page class="conferencias-u-page">
    <section class="conferencias-u-shell">
      <div class="conferencias-u-header">
        <div class="header-copy">
          <div class="header-kicker">
            <q-icon name="mic" />
            <span>Congreso UTVM</span>
          </div>

          <h1>Conferencias</h1>

          <p>
            Consulta las conferencias registradas, horarios y ponentes del evento.
          </p>

          <div class="header-tags">
            <span class="header-tag featured">
              {{ conferenciasOrdenadas.length }} conferencias
            </span>
            <span class="header-tag">Agenda pública</span>
          </div>
        </div>

        <q-btn
          no-caps
          icon="refresh"
          label="Refrescar"
          class="conferencias-u-refresh"
          :loading="isRefreshing"
          :disable="isRefreshing"
          @click="refrescar"
        />
      </div>

      <div
        v-if="isRefreshing"
        class="conferencias-u-empty"
      >
        <q-icon name="hourglass_top" />
        <strong>Cargando conferencias...</strong>
        <span>Estamos consultando la información registrada.</span>
      </div>

      <div
        v-else-if="errorGeneral"
        class="conferencias-u-empty is-error"
      >
        <q-icon name="error_outline" />
        <strong>No se pudieron cargar las conferencias</strong>
        <span>{{ errorGeneral }}</span>
      </div>

      <div
        v-else-if="conferenciasOrdenadas.length === 0"
        class="conferencias-u-empty"
      >
        <q-icon name="event_busy" />
        <strong>No hay conferencias registradas</strong>
        <span>
          Cuando el administrador agregue conferencias, aparecerán aquí.
        </span>
      </div>

      <div
        v-else
        class="conferencias-u-grid"
      >
        <article
          v-for="conferencia in conferenciasOrdenadas"
          :key="conferencia.id"
          class="conferencia-u-item"
          @click="abrirDetalleConferencia(conferencia.id)"
        >
          <div class="card-glow"></div>

          <div class="conferencia-u-top">
            <div class="conferencia-u-date">
              <strong>{{ formatearDia(conferencia.fecha) }}</strong>
              <span>{{ formatearMes(conferencia.fecha) }}</span>
            </div>

            <div class="conferencia-u-badge">
              <q-icon name="record_voice_over" />
              <span>Conferencia</span>
            </div>
          </div>

          <div class="conferencia-u-speaker">
            <q-avatar class="ponente-avatar" size="74px">
              <img
                v-if="obtenerFotoPonente(conferencia.ponente_id)"
                :src="obtenerFotoPonente(conferencia.ponente_id)"
                alt="Foto del ponente"
              />

              <span v-else>
                {{ obtenerInicialesPonente(conferencia.ponente_id) }}
              </span>
            </q-avatar>

            <div class="speaker-info">
              <span class="speaker-label">Ponente</span>

              <strong>
                {{ obtenerPonente(conferencia.ponente_id)?.nombre || 'Ponente asignado' }}
              </strong>

              <small>
                {{ obtenerPonente(conferencia.ponente_id)?.institucion || 'Institución no disponible' }}
              </small>
            </div>
          </div>

          <div class="conferencia-u-content">
            <h2>{{ conferencia.titulo }}</h2>

            <p>
              {{ conferencia.resumen || 'Sin resumen disponible.' }}
            </p>
          </div>

          <div class="conferencia-u-info">
            <span>
              <q-icon name="schedule" />
              {{ formatearHora(conferencia.hora_inicio) }} -
              {{ formatearHora(conferencia.hora_fin) }}
            </span>

            <span>
              <q-icon name="place" />
              Ubicación asignada
            </span>
          </div>

          <div class="conferencia-u-action">
            <span>Ver más información</span>
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

import { useConferenciasQuery } from '@/composables/useConferenciasQuery';
import { usePanelesQuery } from '@/composables/UsePanelesQuery';
import { useArchivosMultimediaQuery } from '@/composables/useArchivosMultimediaQuery';

const router = useRouter();

const {
  data: conferencias,
  isRefreshing: cargandoConferencias,
  error: errorConferencias,
  load: cargarConferencias,
} = useConferenciasQuery();

const {
  data: ponentes,
  isRefreshing: cargandoPonentes,
  error: errorPonentes,
  load: cargarPonentes,
} = usePanelesQuery();

const {
  data: archivosMultimedia,
  isRefreshing: cargandoArchivos,
  error: errorArchivos,
  load: cargarArchivos,
} = useArchivosMultimediaQuery();

const isRefreshing = computed(() => {
  return (
    cargandoConferencias.value ||
    cargandoPonentes.value ||
    cargandoArchivos.value
  );
});

const errorGeneral = computed(() => {
  return (
    errorConferencias.value ||
    errorPonentes.value ||
    errorArchivos.value
  );
});

const conferenciasOrdenadas = computed(() => {
  return [...conferencias.value].sort((a, b) => {
    const fechaA = String(a.fecha || '');
    const fechaB = String(b.fecha || '');

    const horaA = normalizarHora(String(a.hora_inicio || '00:00'));
    const horaB = normalizarHora(String(b.hora_inicio || '00:00'));

    return fechaA.localeCompare(fechaB) || horaA.localeCompare(horaB);
  });
});

onMounted(() => {
  void refrescar();
});

async function refrescar() {
  await Promise.all([
    cargarConferencias(),
    cargarPonentes(),
    cargarArchivos(),
  ]);
}

function abrirDetalleConferencia(id: string) {
  void router.push(`/conferencias_u/${id}`);
}

function obtenerPonente(ponenteId: string) {
  return ponentes.value.find(
    (ponente) => ponente.id === ponenteId
  );
}

function obtenerFotoPonente(ponenteId: string) {
  const ponente = obtenerPonente(ponenteId);

  if (!ponente?.archivo_foto_id) {
    return '';
  }

  const archivos = Array.isArray(archivosMultimedia.value)
    ? archivosMultimedia.value
    : [];

  const archivo = archivos.find(
    (item) => item.id === ponente.archivo_foto_id
  );

  return archivo?.ruta_archivo || '';
}

function obtenerInicialesPonente(ponenteId: string) {
  const ponente = obtenerPonente(ponenteId);

  if (!ponente?.nombre) {
    return '?';
  }

  const partesNombre = ponente.nombre
    .trim()
    .split(' ')
    .filter(Boolean);

  const inicialNombre = partesNombre[0]?.charAt(0) || '';
  const inicialApellido = partesNombre[1]?.charAt(0) || '';

  return `${inicialNombre}${inicialApellido}`.toUpperCase();
}

function normalizarFecha(fecha: string | Date) {
  return String(fecha).slice(0, 10);
}

function formatearDia(fecha: string | Date) {
  const fechaNormalizada = normalizarFecha(fecha);
  const [, , dayText = '1'] = fechaNormalizada.split('-');

  return dayText.padStart(2, '0');
}

function formatearMes(fecha: string | Date) {
  const fechaNormalizada = normalizarFecha(fecha);

  const [yearText = '2026', monthText = '1', dayText = '1'] =
    fechaNormalizada.split('-');

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
  }).format(new Date(year, month, day));
}

function normalizarHora(hora: string) {
  const horaLimpia = String(hora).slice(0, 5);
  const [hoursText = '0', minutesText = '0'] = horaLimpia.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatearHora(hora: string) {
  return normalizarHora(hora);
}
</script>

<style scoped lang="scss">
.conferencias-u-page {
  min-height: calc(100vh - 64px);
  padding: 34px 22px;
  background:
    radial-gradient(circle at 75% 16%, rgba(0, 230, 118, 0.22), transparent 34%),
    radial-gradient(circle at 12% 76%, rgba(0, 184, 107, 0.14), transparent 30%),
    linear-gradient(135deg, #071e1b 0%, #031411 100%);
  color: #ffffff;
}

.conferencias-u-shell {
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
}

.conferencias-u-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 22px;
  margin-bottom: 34px;
}

.header-copy {
  max-width: 760px;

  h1 {
    margin: 10px 0 10px;
    color: #ffffff;
    font-size: clamp(2.8rem, 6vw, 4.6rem);
    line-height: 0.96;
    font-weight: 900;
    letter-spacing: -0.06em;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: clamp(1rem, 2vw, 1.25rem);
    line-height: 1.55;
  }
}

.header-kicker {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #66f5b5;
  font-size: 0.88rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;

  .q-icon {
    font-size: 22px;
  }
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.header-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.82rem;
  font-weight: 800;

  &.featured {
    background: rgba(0, 230, 118, 0.14);
    color: #66f5b5;
  }
}

.conferencias-u-refresh {
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(0, 230, 118, 0.12) !important;
  border: 1px solid rgba(0, 230, 118, 0.28);
  color: #66f5b5 !important;
  font-weight: 900;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 230, 118, 0.2) !important;
  }
}

.conferencias-u-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 18px;
}

.conferencia-u-item {
  position: relative;
  overflow: hidden;
  min-height: 390px;
  padding: 18px;
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(31, 42, 40, 0.78), rgba(7, 30, 27, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(0, 230, 118, 0.34);
    box-shadow:
      0 28px 64px rgba(0, 0, 0, 0.34),
      0 0 0 1px rgba(0, 230, 118, 0.12);
  }

  &:active {
    transform: translateY(-2px) scale(0.99);
  }
}

.card-glow {
  position: absolute;
  inset: -80px -80px auto auto;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(0, 230, 118, 0.18);
  filter: blur(44px);
  pointer-events: none;
}

.conferencia-u-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.conferencia-u-date {
  width: 66px;
  min-height: 66px;
  display: grid;
  place-items: center;
  padding: 8px;
  border-radius: 17px;
  background: rgba(0, 230, 118, 0.12);
  border: 1px solid rgba(0, 230, 118, 0.3);
  color: #ffffff;

  strong {
    display: block;
    font-size: 1.55rem;
    line-height: 1;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 5px;
    color: #66f5b5;
    font-size: 0.72rem;
    font-weight: 900;
    text-transform: uppercase;
  }
}

.conferencia-u-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.78rem;
  font-weight: 900;

  .q-icon {
    color: #00e676;
    font-size: 17px;
  }
}

.conferencia-u-speaker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  margin-bottom: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);

  .ponente-avatar {
    flex: 0 0 auto;
    background:
      radial-gradient(circle at top, rgba(102, 245, 181, 0.3), transparent 58%),
      linear-gradient(145deg, rgba(0, 230, 118, 0.22), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(0, 230, 118, 0.26);
    color: #ffffff;
    font-weight: 900;
    font-size: 1.1rem;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.speaker-info {
  min-width: 0;
}

.speaker-label {
  display: block;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.conferencia-u-speaker {
  strong {
    display: block;
    margin-top: 3px;
    color: #ffffff;
    font-size: 1rem;
    line-height: 1.25;
    font-weight: 900;
  }

  small {
    display: block;
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.82rem;
    line-height: 1.35;
    font-weight: 700;
  }
}

.conferencia-u-content {
  position: relative;
  z-index: 1;
  min-height: 118px;

  h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.35rem;
    line-height: 1.18;
    font-weight: 900;
    letter-spacing: -0.03em;
  }

  p {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.94rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.conferencia-u-info {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 9px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.88rem;
    font-weight: 800;
  }

  .q-icon {
    font-size: 18px;
    color: #00e676;
  }
}

.conferencia-u-action {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
  padding: 10px 12px;
  border-radius: 14px;
  color: #66f5b5;
  background: rgba(0, 230, 118, 0.09);
  border: 1px solid rgba(0, 230, 118, 0.18);
  font-weight: 900;
  font-size: 0.86rem;

  .q-icon {
    font-size: 18px;
  }
}

.conferencias-u-empty {
  min-height: 280px;
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 38px;
  border-radius: 22px;
  background: rgba(31, 42, 40, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.62);
  text-align: center;

  .q-icon {
    font-size: 44px;
    color: #00e676;
  }

  strong {
    color: #ffffff;
    font-size: 1.15rem;
  }

  span {
    max-width: 520px;
    line-height: 1.6;
  }

  &.is-error {
    .q-icon {
      color: #ff4d9d;
    }
  }
}

@media (max-width: 800px) {
  .conferencias-u-page {
    padding: 22px 14px;
  }

  .conferencias-u-header {
    flex-direction: column;
  }

  .conferencias-u-refresh {
    width: 100%;
    justify-content: center;
  }

  .conferencias-u-grid {
    grid-template-columns: 1fr;
  }

  .conferencia-u-item {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .header-copy {
    h1 {
      font-size: 2.55rem;
    }

    p {
      font-size: 0.96rem;
    }
  }

  .conferencia-u-item {
    padding: 16px;
    border-radius: 18px;
  }

  .conferencia-u-speaker {
    align-items: flex-start;
  }
}
</style>
