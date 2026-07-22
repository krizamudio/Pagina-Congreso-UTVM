<template>
  <q-page class="agenda-page">
    <section class="agenda-card">
      <div class="agenda-header">
        <div class="agenda-title">
          <q-icon name="calendar_month" />

          <div>
            <h1>Agenda del Congreso</h1>
            <p>Consulta el programa, actividades y horarios del evento.</p>
          </div>
        </div>

        <div class="agenda-header-actions">
          <q-btn
            outline
            no-caps
            icon="refresh"
            label="Refrescar"
            class="agenda-refresh-btn"
            :loading="cargandoAgenda"
            :disable="cargandoAgenda"
            @click="cargarAgenda"
          />
        </div>
      </div>

      <div v-if="cargandoAgenda" class="agenda-empty">
        <q-icon name="hourglass_top" />
        <strong>Cargando agenda...</strong>
        <span>Estamos consultando las actividades registradas.</span>
      </div>

      <div v-else-if="errorAgenda" class="agenda-empty">
        <q-icon name="error_outline" />
        <strong>No se pudo cargar la agenda</strong>
        <span>{{ errorAgenda }}</span>
      </div>

      <div v-else-if="eventos.length === 0" class="agenda-empty">
        <q-icon name="event_busy" />
        <strong>No hay actividades registradas</strong>
        <span>Cuando el administrador registre conferencias o talleres, aparecerán aquí.</span>
      </div>

      <template v-else>
        <div class="agenda-top-row">
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
        </div>

        <!-- Vista calendario -->
        <div
          class="agenda-table-wrapper"
          :class="{ 'is-hidden': vistaActiva !== 'calendario' }"
        >
          <div class="agenda-table" :style="agendaTableStyle">
            <div class="agenda-time-header">
              <div class="agenda-hour-title">
                Hora / Sala
              </div>

              <div class="agenda-hours" :style="gridHorasStyle">
                <div
                  v-for="hora in horas"
                  :key="hora.value"
                  class="agenda-hour"
                >
                  {{ hora.label }}
                </div>
              </div>
            </div>

            <div
              v-for="sala in salas"
              :key="sala.id"
              class="agenda-row"
              :style="getAgendaRowStyle(sala)"
            >
              <div class="agenda-room">
                <div class="room-icon" :class="`room-${sala.color}`">
                  <q-icon :name="sala.icon" />
                </div>

                <div>
                  <strong>{{ sala.nombre }}</strong>
                  <span>{{ sala.ubicacion }}</span>
                </div>
              </div>

              <div class="agenda-events-area" :style="getEventsAreaStyle(sala)">
                <div class="hour-lines" :style="gridLineasStyle">
                  <span
                    v-for="linea in lineasHoras"
                    :key="linea"
                  />
                </div>

                <article
                  v-for="evento in eventosPorSala(sala.id)"
                  :key="evento.id"
                  class="agenda-event"
                  :class="[
                    `event-${evento.tipo}`,
                    {
                      'is-clickable': esEventoSeleccionable(evento),
                      'has-overlap': evento.totalCarriles > 1,
                    },
                  ]"
                  :style="getEventStyle(evento)"
                  @click="irADetalleEvento(evento)"
                >
                  <div class="event-title-row">
                    <q-icon :name="getTipoIcon(evento.tipo)" />
                    <strong>{{ evento.titulo }}</strong>
                  </div>

                  <div class="event-time">
                    {{ formatTime(evento.inicio) }} - {{ formatTime(evento.fin) }}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista lista -->
        <div
          class="agenda-list-view"
          :class="{ 'is-hidden': vistaActiva !== 'lista' }"
        >
          <div v-if="eventosDelDia.length === 0" class="agenda-empty">
            <q-icon name="event_busy" />
            <strong>No hay actividades para este día.</strong>
            <span>Selecciona otro día para consultar más actividades.</span>
          </div>

          <article
            v-for="evento in eventosDelDia"
            :key="evento.id"
            class="agenda-list-item"
            :class="[
              `event-${evento.tipo}`,
              { 'is-clickable': esEventoSeleccionable(evento) },
            ]"
            @click="irADetalleEvento(evento)"
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
                  {{ getSalaEvento(evento)?.nombre || 'Sin ubicación' }}
                </span>

                <span>
                  <q-icon name="schedule" />
                  {{ formatTime(evento.inicio) }} - {{ formatTime(evento.fin) }}
                </span>

                <span v-if="evento.tipo === 'taller'">
                  <q-icon name="touch_app" />
                  Clic para ver información del taller
                </span>

                <span v-if="evento.tipo === 'conferencia'">
                  <q-icon name="touch_app" />
                  Clic para ver detalles de la conferencia
                </span>
              </div>
            </div>
          </article>
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

        <div class="agenda-note">
          <q-icon name="info" />
          <span>Los horarios pueden estar sujetos a cambios.</span>
        </div>
      </template>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiBaseUrl } from '@/services/api';

const API_BASE = apiBaseUrl;

const router = useRouter();

type TipoEvento =
  | 'conferencia'
  | 'taller'
  | 'sesion'
  | 'seguridad'
  | 'networking';

interface DiaAgenda {
  id: string;
  nombre: string;
  fecha: string;
}

interface HoraAgenda {
  value: string;
  label: string;
}

interface SalaAgenda {
  id: string;
  nombre: string;
  ubicacion: string;
  icon: string;
  color: string;
  carriles: number;
}

interface EventoAgenda {
  id: string;
  dia: string;
  salaId: string;
  salaNombre: string;
  salaDetalle: string;
  titulo: string;
  tipo: TipoEvento;
  inicio: string;
  fin: string;
}

interface EventoAgendaRender extends EventoAgenda {
  carril: number;
  totalCarriles: number;
}

interface UbicacionApi {
  id: string;
  nombre: string;
  capacidad?: number;
}

interface ConferenciaApi {
  id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion_id?: string | null;
  ponente_id?: string | null;
  ubicacion?: UbicacionApi | null;
  ponente?: {
    id: string;
    nombre: string;
  } | null;
}

interface TallerApi {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion_id?: string | null;
  ubicacion?: UbicacionApi | null;
}

const EVENTO_ALTO = 78;
const EVENTO_GAP = 10;
const EVENTO_TOP = 16;
const FILA_BASE = 124;

const diaActivo = ref('');
const vistaActiva = ref<'calendario' | 'lista'>('calendario');

const eventos = ref<EventoAgenda[]>([]);
const ubicaciones = ref<UbicacionApi[]>([]);
const cargandoAgenda = ref(false);
const errorAgenda = ref('');

const tipos: Array<{ id: TipoEvento; label: string }> = [
  {
    id: 'conferencia',
    label: 'Conferencia',
  },
  {
    id: 'taller',
    label: 'Taller',
  },
];

const dias = computed<DiaAgenda[]>(() => {
  const fechasUnicas = Array.from(
    new Set(eventos.value.map((evento) => evento.dia)),
  ).sort();

  return fechasUnicas.map((fecha, index) => ({
    id: fecha,
    nombre: `Día ${index + 1}`,
    fecha: formatearFecha(fecha),
  }));
});

const eventosDelDia = computed(() =>
  eventos.value
    .filter((evento) => evento.dia === diaActivo.value)
    .sort(
      (a, b) =>
        convertirMinutos(a.inicio) - convertirMinutos(b.inicio) ||
        convertirMinutos(a.fin) - convertirMinutos(b.fin),
    ),
);

const salas = computed<SalaAgenda[]>(() => {
  const salasMap = new Map<string, EventoAgenda>();

  eventosDelDia.value.forEach((evento) => {
    if (!salasMap.has(evento.salaId)) {
      salasMap.set(evento.salaId, evento);
    }
  });

  const colores = ['blue', 'green', 'yellow', 'purple', 'pink'];

  return Array.from(salasMap.values()).map((evento, index) => ({
    id: evento.salaId,
    nombre: evento.salaNombre,
    ubicacion: evento.salaDetalle,
    icon: getIconoSala(index),
    color: colores[index % colores.length] ?? 'blue',
    carriles: calcularCarrilesSala(evento.salaId),
  }));
});

const horas = computed<HoraAgenda[]>(() => {
  if (eventosDelDia.value.length === 0) {
    return generarHoras(8, 18);
  }

  const minutosInicio = eventosDelDia.value.map((evento) =>
    convertirMinutos(evento.inicio),
  );

  const minutosFin = eventosDelDia.value.map((evento) =>
    convertirMinutos(evento.fin),
  );

  const menorInicio = Math.min(...minutosInicio);
  const mayorFin = Math.max(...minutosFin);

  let horaInicio = Math.floor(menorInicio / 60);
  let horaFin = Math.ceil(mayorFin / 60);

  horaInicio = Math.min(8, horaInicio);
  horaFin = Math.max(18, horaFin);

  horaInicio = Math.max(0, horaInicio);
  horaFin = Math.min(23, horaFin);

  return generarHoras(horaInicio, horaFin);
});

const lineasHoras = computed(() => {
  const total = Math.max(horas.value.length - 1, 1);

  return Array.from({ length: total }, (_, index) => index);
});

const gridHorasStyle = computed(() => ({
  gridTemplateColumns: `repeat(${horas.value.length}, minmax(110px, 1fr))`,
}));

const gridLineasStyle = computed(() => ({
  gridTemplateColumns: `repeat(${lineasHoras.value.length}, 1fr)`,
}));

const agendaTableStyle = computed(() => {
  const anchoMinimo = Math.max(1280, 170 + horas.value.length * 112);

  return {
    minWidth: `${anchoMinimo}px`,
  };
});

onMounted(() => {
  void cargarAgenda();
});

async function cargarAgenda() {
  if (cargandoAgenda.value) {
    return;
  }

  const diaSeleccionadoAntes = diaActivo.value;

  cargandoAgenda.value = true;
  errorAgenda.value = '';

  try {
    const [conferenciasResponse, talleresResponse, ubicacionesResponse] =
      await Promise.all([
        fetch(`${API_BASE}/conferencias`),
        fetch(`${API_BASE}/taller`),
        fetch(`${API_BASE}/ubicacion`),
      ]);

    if (!conferenciasResponse.ok) {
      throw new Error('No se pudieron cargar las conferencias.');
    }

    if (!talleresResponse.ok) {
      throw new Error('No se pudieron cargar los talleres.');
    }

    const conferencias =
      (await conferenciasResponse.json()) as ConferenciaApi[];

    const talleres =
      (await talleresResponse.json()) as TallerApi[];

    if (ubicacionesResponse.ok) {
      ubicaciones.value = (await ubicacionesResponse.json()) as UbicacionApi[];
    } else {
      ubicaciones.value = [];
    }

    const eventosConferencias = conferencias.map(mapearConferencia);
    const eventosTalleres = talleres.map(mapearTaller);

    eventos.value = [
      ...eventosConferencias,
      ...eventosTalleres,
    ].sort(
      (a, b) =>
        a.dia.localeCompare(b.dia) ||
        convertirMinutos(a.inicio) - convertirMinutos(b.inicio),
    );

    const diaSeleccionadoExiste = dias.value.some(
      (dia) => dia.id === diaSeleccionadoAntes,
    );

    if (diaSeleccionadoExiste) {
      diaActivo.value = diaSeleccionadoAntes;
    } else {
      const primerDia = dias.value[0]?.id;

      if (primerDia) {
        diaActivo.value = primerDia;
      }
    }
  } catch (error) {
    errorAgenda.value =
      error instanceof Error
        ? error.message
        : 'No se pudo cargar la agenda.';

    console.error('Error al cargar agenda:', error);
  } finally {
    cargandoAgenda.value = false;
  }
}

function mapearConferencia(conferencia: ConferenciaApi): EventoAgenda {
  const ubicacion = obtenerUbicacionDesdeActividad(
    conferencia.ubicacion,
    conferencia.ubicacion_id,
  );

  return {
    id: conferencia.id,
    dia: normalizarFecha(conferencia.fecha),
    salaId: ubicacion.id,
    salaNombre: ubicacion.nombre,
    salaDetalle: ubicacion.detalle,
    titulo: conferencia.titulo,
    tipo: 'conferencia',
    inicio: normalizarHora(conferencia.hora_inicio),
    fin: normalizarHora(conferencia.hora_fin),
  };
}

function mapearTaller(taller: TallerApi): EventoAgenda {
  const ubicacion = obtenerUbicacionDesdeActividad(
    taller.ubicacion,
    taller.ubicacion_id,
  );

  return {
    id: taller.id,
    dia: normalizarFecha(taller.fecha),
    salaId: ubicacion.id,
    salaNombre: ubicacion.nombre,
    salaDetalle: ubicacion.detalle,
    titulo: taller.titulo,
    tipo: 'taller',
    inicio: normalizarHora(taller.hora_inicio),
    fin: normalizarHora(taller.hora_fin),
  };
}

function obtenerUbicacionDesdeActividad(
  ubicacionRelacion?: UbicacionApi | null,
  ubicacionId?: string | null,
) {
  if (ubicacionRelacion?.id) {
    return {
      id: ubicacionRelacion.id,
      nombre: ubicacionRelacion.nombre || 'Ubicación asignada',
      detalle: obtenerDetalleUbicacion(ubicacionRelacion),
    };
  }

  if (ubicacionId) {
    const ubicacionEncontrada = ubicaciones.value.find(
      (ubicacion) => ubicacion.id === ubicacionId,
    );

    if (ubicacionEncontrada) {
      return {
        id: ubicacionEncontrada.id,
        nombre: ubicacionEncontrada.nombre || 'Ubicación asignada',
        detalle: obtenerDetalleUbicacion(ubicacionEncontrada),
      };
    }

    return {
      id: ubicacionId,
      nombre: 'Ubicación asignada',
      detalle: 'Sede del congreso',
    };
  }

  return {
    id: 'sin-ubicacion',
    nombre: 'Sin ubicación',
    detalle: 'Ubicación pendiente',
  };
}

function obtenerDetalleUbicacion(ubicacion: UbicacionApi) {
  if (typeof ubicacion.capacidad === 'number') {
    return `Capacidad: ${ubicacion.capacidad}`;
  }

  return 'Sede del congreso';
}

function eventosPorSala(salaId: string): EventoAgendaRender[] {
  const eventosSala = eventosDelDia.value
    .filter((evento) => evento.salaId === salaId)
    .sort(
      (a, b) =>
        convertirMinutos(a.inicio) - convertirMinutos(b.inicio) ||
        convertirMinutos(a.fin) - convertirMinutos(b.fin),
    );

  return asignarCarriles(eventosSala);
}

function asignarCarriles(eventosSala: EventoAgenda[]): EventoAgendaRender[] {
  const carrilesFin: number[] = [];

  const eventosConCarril = eventosSala.map((evento) => {
    const inicio = convertirMinutos(evento.inicio);
    const fin = convertirMinutos(evento.fin);

    let carril = carrilesFin.findIndex(
      (finCarril) => finCarril <= inicio,
    );

    if (carril === -1) {
      carril = carrilesFin.length;
      carrilesFin.push(fin);
    } else {
      carrilesFin[carril] = fin;
    }

    return {
      ...evento,
      carril,
      totalCarriles: 1,
    };
  });

  const totalCarriles = Math.max(carrilesFin.length, 1);

  return eventosConCarril.map((evento) => ({
    ...evento,
    totalCarriles,
  }));
}

function calcularCarrilesSala(salaId: string) {
  const eventosSala = eventosDelDia.value.filter(
    (evento) => evento.salaId === salaId,
  );

  return asignarCarriles(eventosSala)[0]?.totalCarriles ?? 1;
}

function getSalaEvento(evento: EventoAgenda) {
  return salas.value.find((sala) => sala.id === evento.salaId);
}

function normalizarFecha(fecha: string) {
  return String(fecha).slice(0, 10);
}

function normalizarHora(hora: string) {
  const horaLimpia = String(hora).slice(0, 5);
  const [hoursText = '0', minutesText = '0'] = horaLimpia.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generarHoras(inicio: number, fin: number): HoraAgenda[] {
  const horasGeneradas: HoraAgenda[] = [];

  for (let hora = inicio; hora <= fin; hora += 1) {
    const value = `${String(hora).padStart(2, '0')}:00`;

    horasGeneradas.push({
      value,
      label: formatTime(value),
    });
  }

  return horasGeneradas;
}

function formatearFecha(fecha: string) {
  const [yearText = '2026', monthText = '1', dayText = '1'] =
    fecha.split('-');

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  const fechaObjeto = new Date(year, month, day);

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  }).format(fechaObjeto);
}

function convertirMinutos(hora: string) {
  const [hoursText = '0', minutesText = '0'] = hora.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return (hours * 60) + minutes;
}

function calcularPorcentaje(hora: string) {
  const primeraHora = horas.value[0]?.value ?? '08:00';
  const ultimaHora = horas.value[horas.value.length - 1]?.value ?? '18:00';

  const inicioAgenda = convertirMinutos(primeraHora);
  const finAgenda = convertirMinutos(ultimaHora);
  const horaActual = convertirMinutos(hora);

  if (finAgenda === inicioAgenda) {
    return 0;
  }

  const porcentaje =
    ((horaActual - inicioAgenda) / (finAgenda - inicioAgenda)) * 100;

  return Math.min(Math.max(porcentaje, 0), 100);
}

function calcularAlturaFila(carriles: number) {
  return Math.max(
    FILA_BASE,
    EVENTO_TOP * 2 + carriles * EVENTO_ALTO + (carriles - 1) * EVENTO_GAP,
  );
}

function getAgendaRowStyle(sala: SalaAgenda) {
  return {
    minHeight: `${calcularAlturaFila(sala.carriles)}px`,
  };
}

function getEventsAreaStyle(sala: SalaAgenda) {
  return {
    minHeight: `${calcularAlturaFila(sala.carriles)}px`,
  };
}

function getEventStyle(evento: EventoAgendaRender) {
  const left = calcularPorcentaje(evento.inicio);
  const right = calcularPorcentaje(evento.fin);
  const width = Math.max(right - left, 7);
  const top = EVENTO_TOP + evento.carril * (EVENTO_ALTO + EVENTO_GAP);

  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${top}px`,
    height: `${EVENTO_ALTO}px`,
    minHeight: `${EVENTO_ALTO}px`,
    zIndex: `${10 + evento.carril}`,
  };
}

function formatTime(hora: string) {
  const [hoursText = '0', minutesText = '0'] = hora.split(':');

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

function getIconoSala(index: number) {
  const icons = [
    'groups',
    'developer_board',
    'storage',
    'security',
    'diversity_3',
  ];

  return icons[index % icons.length] ?? 'meeting_room';
}

function esEventoSeleccionable(evento: EventoAgenda) {
  return evento.tipo === 'taller' || evento.tipo === 'conferencia';
}

function irADetalleEvento(evento: EventoAgenda) {
  if (evento.tipo === 'taller') {
    void router.push('/talleres_u');
    return;
  }

  if (evento.tipo === 'conferencia') {
    void router.push(`/conferencias_u/${evento.id}`);
  }
}
</script>

<style lang="scss">
@import "@/css/agenda.scss";
</style>
