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
            <q-avatar
              class="ponente-avatar"
              :class="{ 'has-photo': !!obtenerFotoPonente(conferencia) }"
              size="74px"
            >
              <img
                v-if="obtenerFotoPonente(conferencia)"
                :src="obtenerFotoPonente(conferencia)"
                :alt="`Foto de ${obtenerNombrePonente(conferencia)}`"
              />

              <span v-else>
                {{ obtenerInicialesPonente(conferencia) }}
              </span>
            </q-avatar>

            <div class="speaker-info">
              <span class="speaker-label">Ponente</span>

              <strong>
                {{ obtenerNombrePonente(conferencia) }}
              </strong>

              <small>
                {{ obtenerInstitucionPonente(conferencia) }}
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
              {{ obtenerUbicacion(conferencia) }}
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
import { usePanelesQuery } from '@/composables/usePanelesQuery';
import type { Conferencia, Ponente } from '@/types';

interface ConferenciaPublica extends Conferencia {
  congreso?: {
    id: string;
    nombre: string;
  } | null;

  ubicacion?: {
    id: string;
    nombre: string;
    capacidad?: number;
  } | null;

  ponente?: {
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
  } | null;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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

const isRefreshing = computed(() => {
  return cargandoConferencias.value || cargandoPonentes.value;
});

const errorGeneral = computed(() => {
  return errorConferencias.value || errorPonentes.value;
});

const conferenciasOrdenadas = computed<ConferenciaPublica[]>(() => {
  return [...(conferencias.value as ConferenciaPublica[])].sort((a, b) => {
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
  ]);
}

function abrirDetalleConferencia(id: string) {
  void router.push(`/conferencias_u/${id}`);
}

function obtenerPonenteCompleto(conferencia: ConferenciaPublica): Ponente | null {
  const ponenteId = conferencia.ponente?.id || conferencia.ponente_id;

  if (!ponenteId) {
    return null;
  }

  return ponentes.value.find((ponente) => ponente.id === ponenteId) || null;
}

function obtenerFotoPonente(conferencia: ConferenciaPublica) {
  const ponenteCompleto = obtenerPonenteCompleto(conferencia);

  return ponenteCompleto?.foto?.url || conferencia.ponente?.foto?.url || '';
}

function obtenerNombrePonente(conferencia: ConferenciaPublica) {
  const ponenteCompleto = obtenerPonenteCompleto(conferencia);

  return ponenteCompleto?.nombre || conferencia.ponente?.nombre || 'Ponente asignado';
}

function obtenerInstitucionPonente(conferencia: ConferenciaPublica) {
  const ponenteCompleto = obtenerPonenteCompleto(conferencia);

  return (
    ponenteCompleto?.institucion ||
    conferencia.ponente?.institucion ||
    'Institución no disponible'
  );
}

function obtenerUbicacion(conferencia: ConferenciaPublica) {
  return conferencia.ubicacion?.nombre || 'Ubicación asignada';
}

function obtenerInicialesPonente(conferencia: ConferenciaPublica) {
  const nombre = obtenerNombrePonente(conferencia) || conferencia.titulo || '?';

  const partesNombre = nombre
    .trim()
    .split(' ')
    .filter(Boolean);

  const inicialNombre = partesNombre[0]?.charAt(0) || '';
  const inicialApellido = partesNombre[1]?.charAt(0) || '';

  const iniciales = `${inicialNombre}${inicialApellido}`.toUpperCase();

  return iniciales || '?';
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
@import "@/css/conferencias.scss";
</style>
