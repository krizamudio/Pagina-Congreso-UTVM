<template>
  <q-page class="agenda-page">
    <section class="agenda-card">
      <div class="agenda-header">
        <div class="agenda-title">
          <q-icon name="calendar_month" />

          <div>
            <h1>Agenda del Congreso</h1>
            <p>Consulta las actividades, conferencias y talleres disponibles.</p>
          </div>
        </div>

        <q-btn
          outline
          no-caps
          icon="download"
          label="Descargar agenda"
          class="agenda-download-btn"
          @click="descargarAgenda"
        />
      </div>

      <div class="agenda-days">
        <q-btn
          v-for="dia in dias"
          :key="dia.id"
          no-caps
          unelevated
          class="agenda-day-btn"
          :class="{ 'is-active': dia.id === diaActivo }"
          @click="diaActivo = dia.id"
        >
          <div class="day-content">
            <strong>{{ dia.nombre }}</strong>
            <span>{{ dia.fecha }}</span>
          </div>
        </q-btn>
      </div>

      <div class="agenda-controls">
        <div class="agenda-view-switch">
          <q-btn
            no-caps
            unelevated
            icon="calendar_view_week"
            label="Calendario"
            class="agenda-switch-btn"
            :class="{ 'is-active': vistaActiva === 'calendario' }"
            @click="vistaActiva = 'calendario'"
          />

          <q-btn
            no-caps
            unelevated
            icon="view_agenda"
            label="Lista"
            class="agenda-switch-btn"
            :class="{ 'is-active': vistaActiva === 'lista' }"
            @click="vistaActiva = 'lista'"
          />
        </div>

        <div class="agenda-filter-row">
          <q-btn
            v-for="filtro in filtros"
            :key="filtro.id"
            no-caps
            unelevated
            class="agenda-filter-btn"
            :class="{ 'is-active': tipoActivo === filtro.id }"
            @click="tipoActivo = filtro.id"
          >
            <span
              v-if="filtro.id !== 'todos'"
              class="filter-dot"
              :class="`event-${filtro.id}`"
            ></span>

            {{ filtro.label }}
          </q-btn>
        </div>
      </div>

      <!-- Vista calendario para escritorio -->
      <div
        class="agenda-table-wrapper"
        :class="{ 'is-hidden': vistaActiva !== 'calendario' }"
      >
        <div class="agenda-table">
          <div class="agenda-time-header">
            <div class="agenda-hour-title">
              Hora
            </div>

            <div class="agenda-hours">
              <div
                v-for="hora in horas"
                :key="hora"
                class="agenda-hour"
              >
                {{ hora }}
              </div>
            </div>
          </div>

          <div
            v-for="sala in salas"
            :key="sala.id"
            class="agenda-row"
          >
            <div class="agenda-room">
              <div
                class="room-icon"
                :class="`room-${sala.color}`"
              >
                <q-icon :name="sala.icon" />
              </div>

              <div>
                <strong>{{ sala.nombre }}</strong>
                <span>{{ sala.ubicacion }}</span>
              </div>
            </div>

            <div class="agenda-events-area">
              <div class="hour-lines">
                <span
                  v-for="hora in horas"
                  :key="hora"
                />
              </div>

              <article
                v-for="evento in eventosPorSala(sala.id)"
                :key="evento.id"
                class="agenda-event"
                :class="[
                  `event-${evento.tipo}`,
                  getCupoClass(evento)
                ]"
                :style="getEventStyle(evento)"
              >
                <div class="event-title-row">
                  <q-icon :name="getTipoIcon(evento.tipo)" />
                  <strong>{{ evento.titulo }}</strong>
                </div>

                <div class="event-time">
                  {{ formatTime(evento.inicio) }} - {{ formatTime(evento.fin) }}
                </div>

                <div
                  v-if="evento.tipo === 'taller'"
                  class="event-cupo"
                >
                  {{ getCupoTexto(evento) }}
                </div>
              </article>
            </div>
          </div>

          <div class="agenda-legend">
            <span class="legend-title">Tipos de actividades</span>

            <div
              v-for="tipo in tipos"
              :key="tipo.id"
              class="legend-item"
            >
              <span :class="`legend-color event-${tipo.id}`"></span>
              {{ tipo.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Vista lista para móvil y opción alternativa -->
      <div
        class="agenda-list-view"
        :class="{ 'is-hidden': vistaActiva !== 'lista' }"
      >
        <div
          v-if="eventosDelDia.length === 0"
          class="agenda-empty"
        >
          <q-icon name="event_busy" />
          <strong>No hay actividades para este filtro.</strong>
          <span>Selecciona otro tipo de actividad o cambia de día.</span>
        </div>

        <article
          v-for="evento in eventosDelDia"
          :key="evento.id"
          class="agenda-list-item"
          :class="[
            `event-${evento.tipo}`,
            getCupoClass(evento)
          ]"
        >
          <div class="list-time">
            <strong>{{ formatTime(evento.inicio) }}</strong>
            <span>{{ formatTime(evento.fin) }}</span>
          </div>

          <div class="list-content">
            <div class="list-title-row">
              <q-icon :name="getTipoIcon(evento.tipo)" />
              <strong>{{ evento.titulo }}</strong>
            </div>

            <div class="list-meta">
              <span>
                <q-icon name="place" />
                {{ getSalaEvento(evento)?.nombre || 'Sin sala' }}
              </span>

              <span>
                <q-icon name="schedule" />
                {{ formatTime(evento.inicio) }} - {{ formatTime(evento.fin) }}
              </span>
            </div>

            <div
              v-if="evento.tipo === 'taller'"
              class="event-cupo list-cupo"
            >
              {{ getCupoTexto(evento) }}
            </div>
          </div>
        </article>
      </div>

      <div class="agenda-note">
        <q-icon name="info" />
        <span>Los horarios pueden estar sujetos a cambios.</span>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type TipoEvento =
  | 'conferencia'
  | 'taller'
  | 'sesion'
  | 'seguridad'
  | 'networking';

type TipoFiltro = TipoEvento | 'todos';

interface DiaAgenda {
  id: number;
  nombre: string;
  fecha: string;
}

interface SalaAgenda {
  id: string;
  nombre: string;
  ubicacion: string;
  icon: string;
  color: string;
}

interface EventoAgenda {
  id: number;
  dia: number;
  salaId: string;
  titulo: string;
  tipo: TipoEvento;
  inicio: string;
  fin: string;
  cupoMaximo?: number;
  cupoDisponible?: number;
}

const diaActivo = ref(1);
const vistaActiva = ref<'calendario' | 'lista'>('calendario');
const tipoActivo = ref<TipoFiltro>('todos');

const dias: DiaAgenda[] = [
  {
    id: 1,
    nombre: 'Día 1',
    fecha: 'Lunes, 03 Jun',
  },
  {
    id: 2,
    nombre: 'Día 2',
    fecha: 'Martes, 04 Jun',
  },
  {
    id: 3,
    nombre: 'Día 3',
    fecha: 'Miércoles, 05 Jun',
  },
];

const horas = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
];

const salas: SalaAgenda[] = [
  {
    id: 'auditorio',
    nombre: 'Auditorio',
    ubicacion: 'Principal',
    icon: 'groups',
    color: 'blue',
  },
  {
    id: 'sala-a',
    nombre: 'Sala A',
    ubicacion: 'Segundo piso',
    icon: 'developer_board',
    color: 'green',
  },
  {
    id: 'sala-b',
    nombre: 'Sala B',
    ubicacion: 'Segundo piso',
    icon: 'storage',
    color: 'yellow',
  },
  {
    id: 'sala-c',
    nombre: 'Sala C',
    ubicacion: 'Tercer piso',
    icon: 'security',
    color: 'purple',
  },
  {
    id: 'networking',
    nombre: 'Área de Networking',
    ubicacion: 'Lobby principal',
    icon: 'diversity_3',
    color: 'pink',
  },
];

const tipos: Array<{ id: TipoEvento; label: string }> = [
  {
    id: 'conferencia',
    label: 'Conferencia',
  },
  {
    id: 'taller',
    label: 'Taller',
  },
  {
    id: 'sesion',
    label: 'Sesión Técnica',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
  },
  {
    id: 'networking',
    label: 'Networking',
  },
];

const filtros: Array<{ id: TipoFiltro; label: string }> = [
  {
    id: 'todos',
    label: 'Todos',
  },
  ...tipos,
];

const eventos: EventoAgenda[] = [
  {
    id: 1,
    dia: 1,
    salaId: 'auditorio',
    titulo: 'Conferencia Magistral',
    tipo: 'conferencia',
    inicio: '08:00',
    fin: '09:00',
  },
  {
    id: 2,
    dia: 1,
    salaId: 'auditorio',
    titulo: 'Inteligencia Artificial: El futuro hoy',
    tipo: 'conferencia',
    inicio: '09:30',
    fin: '11:00',
  },
  {
    id: 3,
    dia: 1,
    salaId: 'auditorio',
    titulo: 'Innovación y tecnología',
    tipo: 'conferencia',
    inicio: '11:30',
    fin: '12:30',
  },
  {
    id: 4,
    dia: 1,
    salaId: 'auditorio',
    titulo: 'Ciberseguridad en la era digital',
    tipo: 'conferencia',
    inicio: '14:00',
    fin: '15:30',
  },
  {
    id: 5,
    dia: 1,
    salaId: 'auditorio',
    titulo: 'Panel de Expertos',
    tipo: 'conferencia',
    inicio: '16:00',
    fin: '17:00',
  },
  {
    id: 6,
    dia: 1,
    salaId: 'sala-a',
    titulo: 'Taller: QA - Testing',
    tipo: 'taller',
    inicio: '08:00',
    fin: '10:00',
    cupoMaximo: 30,
    cupoDisponible: 18,
  },
  {
    id: 7,
    dia: 1,
    salaId: 'sala-a',
    titulo: 'Taller: Automatización de pruebas',
    tipo: 'taller',
    inicio: '10:30',
    fin: '12:00',
    cupoMaximo: 25,
    cupoDisponible: 5,
  },
  {
    id: 8,
    dia: 1,
    salaId: 'sala-a',
    titulo: 'Taller: Pruebas de seguridad',
    tipo: 'taller',
    inicio: '13:00',
    fin: '14:30',
    cupoMaximo: 20,
    cupoDisponible: 0,
  },
  {
    id: 9,
    dia: 1,
    salaId: 'sala-a',
    titulo: 'Taller: Performance Testing',
    tipo: 'taller',
    inicio: '15:00',
    fin: '17:00',
    cupoMaximo: 30,
    cupoDisponible: 12,
  },
  {
    id: 10,
    dia: 1,
    salaId: 'sala-b',
    titulo: 'Introducción a Data Warehouse',
    tipo: 'sesion',
    inicio: '08:45',
    fin: '10:00',
  },
  {
    id: 11,
    dia: 1,
    salaId: 'sala-b',
    titulo: 'Modelado dimensional con éxito',
    tipo: 'sesion',
    inicio: '10:15',
    fin: '11:45',
  },
  {
    id: 12,
    dia: 1,
    salaId: 'sala-b',
    titulo: 'ETL y procesos de carga',
    tipo: 'sesion',
    inicio: '12:00',
    fin: '13:00',
  },
  {
    id: 13,
    dia: 1,
    salaId: 'sala-b',
    titulo: 'Consultas y reportes eficientes',
    tipo: 'sesion',
    inicio: '14:00',
    fin: '15:30',
  },
  {
    id: 14,
    dia: 1,
    salaId: 'sala-b',
    titulo: 'Casos prácticos en DW',
    tipo: 'sesion',
    inicio: '16:00',
    fin: '17:30',
  },
  {
    id: 15,
    dia: 1,
    salaId: 'sala-c',
    titulo: 'Hacking Ético Fundamentos',
    tipo: 'seguridad',
    inicio: '08:30',
    fin: '09:30',
  },
  {
    id: 16,
    dia: 1,
    salaId: 'sala-c',
    titulo: 'Análisis de Vulnerabilidades',
    tipo: 'seguridad',
    inicio: '10:00',
    fin: '11:30',
  },
  {
    id: 17,
    dia: 1,
    salaId: 'sala-c',
    titulo: 'Explotación y Post-explotación',
    tipo: 'seguridad',
    inicio: '12:00',
    fin: '13:30',
  },
  {
    id: 18,
    dia: 1,
    salaId: 'sala-c',
    titulo: 'Ingeniería Social',
    tipo: 'seguridad',
    inicio: '14:00',
    fin: '15:00',
  },
  {
    id: 19,
    dia: 1,
    salaId: 'sala-c',
    titulo: 'Taller: Pentesting Básico',
    tipo: 'seguridad',
    inicio: '15:30',
    fin: '17:00',
  },
  {
    id: 20,
    dia: 1,
    salaId: 'networking',
    titulo: 'Coffee Break & Networking',
    tipo: 'networking',
    inicio: '10:00',
    fin: '10:30',
  },
  {
    id: 21,
    dia: 1,
    salaId: 'networking',
    titulo: 'Almuerzo',
    tipo: 'networking',
    inicio: '13:00',
    fin: '14:00',
  },
  {
    id: 22,
    dia: 1,
    salaId: 'networking',
    titulo: 'Coffee Break & Networking',
    tipo: 'networking',
    inicio: '16:00',
    fin: '16:30',
  },
  {
    id: 23,
    dia: 2,
    salaId: 'auditorio',
    titulo: 'Transformación digital',
    tipo: 'conferencia',
    inicio: '09:00',
    fin: '10:00',
  },
  {
    id: 24,
    dia: 2,
    salaId: 'sala-a',
    titulo: 'Taller: Diseño de APIs REST',
    tipo: 'taller',
    inicio: '10:00',
    fin: '12:00',
    cupoMaximo: 25,
    cupoDisponible: 3,
  },
  {
    id: 25,
    dia: 2,
    salaId: 'sala-b',
    titulo: 'Bases de datos modernas',
    tipo: 'sesion',
    inicio: '12:00',
    fin: '13:30',
  },
  {
    id: 26,
    dia: 2,
    salaId: 'networking',
    titulo: 'Networking estudiantil',
    tipo: 'networking',
    inicio: '15:00',
    fin: '16:00',
  },
  {
    id: 27,
    dia: 3,
    salaId: 'auditorio',
    titulo: 'Clausura del Congreso',
    tipo: 'conferencia',
    inicio: '16:00',
    fin: '17:00',
  },
  {
    id: 28,
    dia: 3,
    salaId: 'sala-c',
    titulo: 'Ciberseguridad aplicada',
    tipo: 'seguridad',
    inicio: '09:30',
    fin: '11:00',
  },
];

const eventosDelDia = computed(() =>
  eventos
    .filter((evento) => evento.dia === diaActivo.value)
    .filter((evento) => {
      if (tipoActivo.value === 'todos') {
        return true;
      }

      return evento.tipo === tipoActivo.value;
    })
    .sort(
      (a, b) =>
        convertirMinutos(a.inicio) - convertirMinutos(b.inicio)
    )
);

function eventosPorSala(salaId: string) {
  return eventosDelDia.value.filter(
    (evento) => evento.salaId === salaId
  );
}

function getSalaEvento(evento: EventoAgenda) {
  return salas.find((sala) => sala.id === evento.salaId);
}

function convertirMinutos(hora: string) {
  const [hoursText = '0', minutesText = '0'] = hora.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return (hours * 60) + minutes;
}

function calcularPorcentaje(hora: string) {
  const inicioAgenda = convertirMinutos('08:00');
  const finAgenda = convertirMinutos('18:00');
  const horaActual = convertirMinutos(hora);

  const porcentaje =
    ((horaActual - inicioAgenda) / (finAgenda - inicioAgenda)) * 100;

  return Math.min(Math.max(porcentaje, 0), 100);
}

function getEventStyle(evento: EventoAgenda) {
  const left = calcularPorcentaje(evento.inicio);
  const right = calcularPorcentaje(evento.fin);
  const width = Math.max(right - left, 7);

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

function formatTime(hora: string) {
  const [hoursText = '0', minutesText = '0'] = hora.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  const periodo = hours >= 12 ? 'pm' : 'am';
  const hora12 = hours % 12 || 12;

  return `${hora12}:${String(minutes).padStart(2, '0')} ${periodo}`;
}

function getTipoIcon(tipo: TipoEvento) {
  const icons: Record<TipoEvento, string> = {
    conferencia: 'mic',
    taller: 'construction',
    sesion: 'storage',
    seguridad: 'shield',
    networking: 'groups',
  };

  return icons[tipo];
}

function getCupoClass(evento: EventoAgenda) {
  if (evento.tipo !== 'taller') {
    return '';
  }

  const disponible = evento.cupoDisponible ?? 0;
  const maximo = evento.cupoMaximo ?? 0;

  if (disponible <= 0) {
    return 'cupo-rojo';
  }

  if (disponible <= Math.ceil(maximo * 0.25)) {
    return 'cupo-amarillo';
  }

  return 'cupo-verde';
}

function getCupoTexto(evento: EventoAgenda) {
  const disponible = evento.cupoDisponible ?? 0;

  if (disponible <= 0) {
    return 'Sin cupo';
  }

  if (disponible <= 5) {
    return `Últimos ${disponible} lugares`;
  }

  return `${disponible} lugares disponibles`;
}

function descargarAgenda() {
  window.print();
}
</script>

<style lang="scss">
@import "@/css/agenda.scss";
</style>
