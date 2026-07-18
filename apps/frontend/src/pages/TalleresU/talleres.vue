<template>
  <q-page class="talleres-page">
    <q-inner-loading :showing="isRefreshing">
      <q-spinner size="50px" color="positive" />
    </q-inner-loading>

    <div class="talleres-container">
      <div class="talleres-header">
        <div class="header-copy">
          <div class="header-kicker">
            <q-icon name="construction" />
            <span>Congreso UTVM</span>
          </div>

          <h1>Talleres</h1>

          <p>
            Consulta los talleres disponibles, sus horarios, cupo, ubicación y
            requisitos.
          </p>

          <div class="header-tags">
            <span class="header-tag featured">
              {{ talleres.length }} talleres
            </span>
            <span class="header-tag">Registro público</span>
          </div>
        </div>

        <q-btn
          no-caps
          icon="refresh"
          label="Refrescar"
          class="talleres-refresh"
          :loading="isRefreshing"
          :disable="isRefreshing"
          @click="cargarTalleres"
        />
      </div>

      <div v-if="!isRefreshing && error" class="sin-talleres error">
        <q-icon name="error_outline" size="50px" />
        <strong>No se pudieron cargar los talleres</strong>
        <p>{{ error }}</p>
      </div>

      <div
        v-else-if="!isRefreshing && talleres.length === 0"
        class="sin-talleres"
      >
        <q-icon name="event_busy" size="50px" />
        <strong>No hay talleres disponibles</strong>
        <p>Cuando el administrador registre talleres, aparecerán aquí.</p>
      </div>

      <div v-else class="talleres-layout">
        <div class="talleres-grid">
          <q-card
            v-for="taller in talleres"
            :key="taller.id"
            class="taller-card"
            :class="[
              `estado-${obtenerEstado(taller).tipo}`,
              { 'is-disabled': obtenerEstado(taller).tipo === 'gris' },
            ]"
            @click="seleccionarTaller(taller)"
          >
            <div class="card-glow"></div>

            <div class="taller-card-header">
              <div class="taller-date">
                <strong>{{ formatearDia(taller.fecha) }}</strong>
                <span>{{ formatearMes(taller.fecha) }}</span>
              </div>

              <div class="taller-status-pill">
                <span class="status-dot"></span>
                {{ obtenerEstado(taller).texto }}
              </div>
            </div>

            <div class="taller-card-info">
              <div class="taller-speaker">
                <div
                  class="taller-speaker-avatar"
                  :class="{ 'has-photo': !!taller.ponenteFotoUrl }"
                >
                  <img
                    v-if="taller.ponenteFotoUrl"
                    :src="taller.ponenteFotoUrl"
                    :alt="`Foto de ${taller.ponente}`"
                  />

                  <span v-else>
                    {{ taller.ponenteIniciales }}
                  </span>
                </div>

                <div class="taller-speaker-info">
                  <span>Tallerista</span>
                  <strong>{{ taller.ponente }}</strong>
                  <small>{{ taller.ponenteInstitucion }}</small>
                </div>
              </div>

              <h3>{{ taller.nombre }}</h3>

              <div class="taller-meta">
                <div class="taller-meta-item">
                  <q-icon name="schedule" />
                  <span>{{ taller.horario }}</span>
                </div>

                <div class="taller-meta-item">
                  <q-icon name="place" />
                  <span>{{ taller.ubicacion }}</span>
                </div>

                <div class="taller-meta-item">
                  <q-icon name="groups" />
                  <span>Cupo: {{ taller.inscritos }} / {{ taller.cupo }}</span>
                </div>
              </div>
            </div>

            <div class="taller-progress-wrap">
              <div class="taller-progress-row">
                <div class="taller-progress">
                  <div
                    class="taller-progress-bar"
                    :style="{ width: `${obtenerPorcentaje(taller)}%` }"
                  ></div>
                </div>

                <span class="taller-progress-label">
                  {{ obtenerPorcentaje(taller) }}%
                </span>
              </div>

              <p class="taller-progress-caption">
                {{
                  taller.cupo - taller.inscritos > 0
                    ? `${taller.cupo - taller.inscritos} lugares disponibles`
                    : "Cupo completo"
                }}
              </p>
            </div>

            <div class="taller-card-action">
              <span>Ver requisitos</span>
              <q-icon name="arrow_forward" />
            </div>
          </q-card>
        </div>

        <q-card class="talleres-legend">
          <h3>Estado de talleres</h3>

          <div class="legend-item verde">
            <span class="legend-dot"></span>
            <div>
              <strong>Verde</strong>
              <p>Cupos disponibles</p>
            </div>
          </div>

          <div class="legend-item amarillo">
            <span class="legend-dot"></span>
            <div>
              <strong>Amarillo</strong>
              <p>Aproximándose a la mitad del cupo</p>
            </div>
          </div>

          <div class="legend-item rojo">
            <span class="legend-dot"></span>
            <div>
              <strong>Rojo</strong>
              <p>Pocos lugares disponibles</p>
            </div>
          </div>

          <div class="legend-item gris">
            <span class="legend-dot"></span>
            <div>
              <strong>Gris</strong>
              <p>Cupo completo</p>
            </div>
          </div>
        </q-card>
      </div>

      <div
        v-if="tallerSeleccionado"
        class="taller-overlay"
        @click.self="cerrarDetalle"
      >
        <q-card
          class="taller-detalle"
          :class="`estado-${obtenerEstado(tallerSeleccionado).tipo}`"
        >
          <q-btn
            flat
            round
            dense
            icon="close"
            class="taller-detalle-close"
            @click="cerrarDetalle"
          />

          <div class="taller-detalle-body">
            <div class="taller-detalle-left">
              <div class="taller-detalle-hero">
                <div
                  class="taller-detalle-avatar"
                  :class="{ 'has-photo': !!tallerSeleccionado.ponenteFotoUrl }"
                >
                  <img
                    v-if="tallerSeleccionado.ponenteFotoUrl"
                    :src="tallerSeleccionado.ponenteFotoUrl"
                    :alt="`Foto de ${tallerSeleccionado.ponente}`"
                  />

                  <span v-else>
                    {{ tallerSeleccionado.ponenteIniciales }}
                  </span>
                </div>

                <div class="taller-detalle-info">
                  <div class="hero-tags">
                    <span class="hero-tag featured">Taller</span>
                    <span class="hero-tag">
                      {{ obtenerEstado(tallerSeleccionado).texto }}
                    </span>
                  </div>

                  <h2>{{ tallerSeleccionado.nombre }}</h2>

                  <p>
                    {{ tallerSeleccionado.ponente }}
                    <template v-if="tallerSeleccionado.ponenteInstitucion">
                      · {{ tallerSeleccionado.ponenteInstitucion }}
                    </template>
                  </p>
                </div>
              </div>

              <div class="taller-detalle-grid">
                <article class="info-card">
                  <q-icon name="event" />
                  <div>
                    <span>Fecha</span>
                    <strong>{{
                      formatearFecha(tallerSeleccionado.fecha)
                    }}</strong>
                  </div>
                </article>

                <article class="info-card">
                  <q-icon name="schedule" />
                  <div>
                    <span>Horario</span>
                    <strong>{{ tallerSeleccionado.horario }}</strong>
                  </div>
                </article>

                <article class="info-card">
                  <q-icon name="place" />
                  <div>
                    <span>Ubicación</span>
                    <strong>{{ tallerSeleccionado.ubicacion }}</strong>
                  </div>
                </article>

                <article class="info-card">
                  <q-icon name="groups" />
                  <div>
                    <span>Cupo</span>
                    <strong>
                      {{ tallerSeleccionado.inscritos }} /
                      {{ tallerSeleccionado.cupo }}
                    </strong>
                  </div>
                </article>
              </div>

              <div class="taller-progress-wrap detalle-progress">
                <div class="taller-progress-row">
                  <div class="taller-progress">
                    <div
                      class="taller-progress-bar"
                      :style="{
                        width: `${obtenerPorcentaje(tallerSeleccionado)}%`,
                      }"
                    ></div>
                  </div>

                  <span class="taller-progress-label">
                    {{ obtenerPorcentaje(tallerSeleccionado) }}% inscritos
                  </span>
                </div>
              </div>

              <section class="taller-detalle-section">
                <h3>Descripción</h3>

                <p>
                  {{ tallerSeleccionado.descripcion }}
                </p>
              </section>
            </div>

            <div class="taller-detalle-right">
              <section class="taller-detalle-section">
                <h3>Requisitos</h3>

                <ul>
                  <li
                    v-for="(tema, index) in tallerSeleccionado.temas"
                    :key="`${tema}-${index}`"
                  >
                    {{ tema }}
                  </li>
                </ul>
              </section>

              <div class="taller-detalle-actions">
                <q-btn
                  no-caps
                  label="Inscribirse"
                  icon="person_add"
                  class="btn-taller-inscribirse"
                  :loading="inscribiendoTallerId === tallerSeleccionado.id"
                  :disable="
                    obtenerEstado(tallerSeleccionado).tipo === 'gris' ||
                    inscribiendoTallerId !== null
                  "
                  @click.stop="inscribirse(tallerSeleccionado)"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { AxiosError } from "axios";

import { useTalleresQuery } from "../../composables/useTalleresQuery";
import { api } from "../../services/api";

interface TallerBackend {
  id: string;
  titulo: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  cupo_maximo: number;
  descripcion?: string | null;
  requisitos?: string | null;
  estado_cupo?: string;
  porcentaje_ocupacion?: number;
  inscritos?: number;

  ubicacion?: {
    id: string;
    nombre: string;
    capacidad?: number;
  } | null;

  ponente?: {
    id: string;
    nombre: string;
    institucion?: string;
    tema?: string;
    foto?: {
      id?: string;
      url?: string;
      ruta_archivo?: string;
    } | null;
  } | null;
}

interface TallerVista {
  id: string;
  nombre: string;
  fecha: string;
  horario: string;
  cupo: number;
  inscritos: number;
  descripcion: string;
  temas: string[];
  ubicacion: string;
  ponente: string;
  ponenteInstitucion: string;
  ponenteFotoUrl: string | null;
  ponenteIniciales: string;
  estado_cupo: string | undefined;
  porcentaje_ocupacion: number | undefined;
}

interface EstadoTaller {
  tipo: "verde" | "amarillo" | "rojo" | "gris";
  texto: string;
}

interface PonenteConFoto {
  id: string;
  nombre: string;
  institucion?: string;
  foto?: {
    id?: string;
    url?: string;
    ruta_archivo?: string;
  } | null;
}

interface ParticipanteSesion {
  id: string;
  nombreCompleto: string;
  correo: string;
  institucion?: string | null;
  carrera?: string;
}

interface ErrorBackend {
  message?: string | string[];
}

type TipoParticipante = "EXTERNO" | "NSU";

const $q = useQuasar();

const { data, load, isRefreshing, error } = useTalleresQuery();

const tallerSeleccionado = ref<TallerVista | null>(null);

const ponentesConFoto = ref<Record<string, PonenteConFoto>>({});

const inscribiendoTallerId = ref<string | null>(null);

const talleres = computed<TallerVista[]>(() => {
  const registros = Array.isArray(data.value) ? data.value : [];

  return registros
    .map((item): TallerVista => {
      const taller = item as unknown as TallerBackend;

      const inscritos = Number(taller.inscritos ?? 0);

      const requisitos =
        typeof taller.requisitos === "string"
          ? taller.requisitos
              .split("\n")
              .map((requisito) => requisito.trim())
              .filter((requisito) => requisito.length > 0)
          : [];

      const nombrePonente = taller.ponente?.nombre || "Tallerista por asignar";

      return {
        id: String(taller.id),

        nombre: taller.titulo?.trim() || "Taller sin nombre",

        fecha: String(taller.fecha || ""),

        horario: obtenerHorario(taller),

        cupo: Number(taller.cupo_maximo ?? 0),

        inscritos,

        descripcion:
          taller.descripcion?.trim() || "Sin descripción registrada.",

        temas:
          requisitos.length > 0 ? requisitos : ["Sin requisitos registrados"],

        ubicacion: taller.ubicacion?.nombre || "Ubicación pendiente",

        ponente: nombrePonente,

        ponenteInstitucion:
          taller.ponente?.institucion || "Institución no registrada",

        ponenteFotoUrl: obtenerFotoPonente(taller),

        ponenteIniciales: obtenerIniciales(nombrePonente),

        estado_cupo: taller.estado_cupo,

        porcentaje_ocupacion: taller.porcentaje_ocupacion,
      };
    })
    .sort((a, b) => {
      return (
        a.fecha.localeCompare(b.fecha) || a.horario.localeCompare(b.horario)
      );
    });
});

const formatearHora = (hora?: string): string => {
  return String(hora || "00:00").substring(0, 5);
};

const obtenerHorario = (taller: TallerBackend): string => {
  if (taller.hora_inicio && taller.hora_fin) {
    return `${formatearHora(
      taller.hora_inicio,
    )} - ${formatearHora(taller.hora_fin)}`;
  }

  if (taller.hora_inicio) {
    return formatearHora(taller.hora_inicio);
  }

  return "Horario no registrado";
};

const cerrarDetalle = (): void => {
  tallerSeleccionado.value = null;
};

const obtenerPorcentaje = (taller: TallerVista): number => {
  if (taller.cupo <= 0) {
    return 0;
  }

  const porcentaje = Math.round((taller.inscritos / taller.cupo) * 100);

  return Math.min(Math.max(porcentaje, 0), 100);
};

const obtenerEstado = (taller: TallerVista): EstadoTaller => {
  const porcentaje = obtenerPorcentaje(taller);

  if (porcentaje >= 100) {
    return {
      tipo: "gris",
      texto: "Cupo completo",
    };
  }

  if (porcentaje >= 80) {
    return {
      tipo: "rojo",
      texto: "Pocos lugares",
    };
  }

  if (porcentaje >= 50) {
    return {
      tipo: "amarillo",
      texto: "Cupo medio",
    };
  }

  return {
    tipo: "verde",
    texto: "Disponible",
  };
};

const seleccionarTaller = (taller: TallerVista): void => {
  tallerSeleccionado.value = {
    ...taller,
    temas: [...taller.temas],
  };
};

function obtenerParticipanteSesion(): ParticipanteSesion | null {
  const participanteGuardado = localStorage.getItem("participante");

  if (!participanteGuardado) {
    return null;
  }

  try {
    const participante = JSON.parse(participanteGuardado) as ParticipanteSesion;

    if (!participante?.id) {
      return null;
    }

    return participante;
  } catch (err) {
    console.error("No fue posible leer la sesión del participante:", err);

    return null;
  }
}

function obtenerTipoParticipante(): TipoParticipante | null {
  const tipo = localStorage.getItem("tipoParticipante");

  if (tipo === "EXTERNO" || tipo === "NSU") {
    return tipo;
  }

  return null;
}

function obtenerMensajeError(error: unknown): string {
  let mensaje = "No fue posible realizar la inscripción.";

  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorBackend | undefined;

    const mensajeBackend = data?.message;

    if (Array.isArray(mensajeBackend)) {
      mensaje = mensajeBackend.join(", ");
    } else if (typeof mensajeBackend === "string") {
      mensaje = mensajeBackend;
    }
  }

  return mensaje;
}

const inscribirse = async (taller: TallerVista): Promise<void> => {
  if (taller.cupo <= 0 || taller.inscritos >= taller.cupo) {
    $q.notify({
      type: "warning",
      message: "Este taller ya no tiene lugares disponibles.",
      position: "top",
    });

    return;
  }

  const participante = obtenerParticipanteSesion();

  const tipoParticipante = obtenerTipoParticipante();

  if (!participante || !tipoParticipante) {
    $q.notify({
      type: "warning",
      message: "Debes iniciar sesión para inscribirte a un taller.",
      position: "top",
    });

    return;
  }

  if (inscribiendoTallerId.value) {
    return;
  }

  inscribiendoTallerId.value = taller.id;

  try {
    const response = await api.post("inscripcion-taller", {
      tallerId: taller.id,
      participanteId: participante.id,
      tipoParticipante,
    });

    const mensaje =
      response.data?.mensaje || "Inscripción realizada correctamente.";

    $q.notify({
      type: "positive",
      message: mensaje,
      position: "top",
    });

    await cargarTalleres();

    const tallerActualizado = talleres.value.find(
      (item) => item.id === taller.id,
    );

    if (tallerActualizado) {
      tallerSeleccionado.value = {
        ...tallerActualizado,
        temas: [...tallerActualizado.temas],
      };
    } else {
      cerrarDetalle();
    }
  } catch (error: unknown) {
    console.error("Error al inscribirse al taller:", error);

    $q.notify({
      type: "negative",
      message: obtenerMensajeError(error),
      position: "top",
    });
  } finally {
    inscribiendoTallerId.value = null;
  }
};

function obtenerFotoPonente(taller: TallerBackend): string | null {
  const fotoDesdeTaller =
    taller.ponente?.foto?.url || taller.ponente?.foto?.ruta_archivo || null;

  if (fotoDesdeTaller) {
    return fotoDesdeTaller;
  }

  const ponenteId = taller.ponente?.id;

  if (!ponenteId) {
    return null;
  }

  const ponenteCompleto = ponentesConFoto.value[ponenteId];

  return (
    ponenteCompleto?.foto?.url || ponenteCompleto?.foto?.ruta_archivo || null
  );
}

function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(" ").filter(Boolean);

  const primera = partes[0]?.charAt(0) || "";

  const segunda = partes[1]?.charAt(0) || "";

  return `${primera}${segunda}`.toUpperCase() || "TA";
}

function normalizarFecha(fecha: string | Date): string {
  return String(fecha || "").slice(0, 10);
}

function formatearDia(fecha: string | Date): string {
  const fechaNormalizada = normalizarFecha(fecha);

  const [, , dayText = "1"] = fechaNormalizada.split("-");

  return dayText.padStart(2, "0");
}

function formatearMes(fecha: string | Date): string {
  const fechaNormalizada = normalizarFecha(fecha);

  const [yearText = "2026", monthText = "1", dayText = "1"] =
    fechaNormalizada.split("-");

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
  }).format(new Date(year, month, day));
}

function formatearFecha(fecha: string | Date): string {
  const fechaNormalizada = normalizarFecha(fecha);

  const [yearText = "2026", monthText = "1", dayText = "1"] =
    fechaNormalizada.split("-");

  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, day));
}

async function cargarPonentesConFoto(): Promise<void> {
  try {
    const response = await api.get<PonenteConFoto[]>("ponente", {
      params: {
        _t: Date.now(),
      },
    });

    const mapa: Record<string, PonenteConFoto> = {};

    response.data.forEach((ponente) => {
      mapa[ponente.id] = ponente;
    });

    ponentesConFoto.value = mapa;

    console.log("Ponentes con foto cargados:", ponentesConFoto.value);
  } catch (err) {
    console.error("Error cargando fotos de ponentes:", err);
  }
}

const cargarTalleres = async (): Promise<void> => {
  if (isRefreshing.value) {
    return;
  }

  try {
    await Promise.all([load(), cargarPonentesConFoto()]);

    console.log("Talleres cargados:", data.value);
  } catch (err) {
    console.error("Error al cargar los talleres:", err);
  }
};

onMounted(() => {
  void cargarTalleres();
});
</script>

<style scoped lang="scss">
@import "@/css/talleres.scss";
</style>
