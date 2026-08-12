<template>
  <q-page class="public-home-page">
    <div class="tech-bg" aria-hidden="true">
      <div class="tech-grid"></div>
      <div class="tech-gradient tech-gradient-a"></div>
      <div class="tech-gradient tech-gradient-b"></div>
      <div class="tech-gradient tech-gradient-c"></div>
      <div class="scan-line"></div>

      <span class="node node-1"></span>
      <span class="node node-2"></span>
      <span class="node node-3"></span>
      <span class="node node-4"></span>
      <span class="node node-5"></span>
      <span class="node node-6"></span>
      <span class="node node-7"></span>

      <span class="link link-1"></span>
      <span class="link link-2"></span>
      <span class="link link-3"></span>
      <span class="link link-4"></span>
      <span class="link link-5"></span>
      <span class="link link-6"></span>
    </div>

    <section class="hero-section">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <q-icon name="auto_awesome" />
          <span>{{ tituloMenuCongreso }}</span>
        </div>

        <h1
          class="hero-title"
          :style="heroTitleStyle"
        >
          <span
            v-for="linea in tituloGrandeLineas"
            :key="linea"
          >
            {{ linea }}
          </span>
        </h1>

        <p class="hero-description">
          {{ esloganCongreso }}
        </p>

        <div class="hero-meta">
          <div class="hero-meta-item">
            <q-icon name="calendar_month" />
            <span>{{ rangoFechas }}</span>
          </div>

          <div class="hero-meta-item">
            <q-icon name="place" />
            <span>{{ ubicacionCongreso }}</span>
          </div>
        </div>

        <div class="hero-actions">
          <q-btn
            no-caps
            unelevated
            label="Ver agenda"
            icon-right="east"
            to="/agenda"
            class="btn-primary"
          />

          <q-btn
            no-caps
            outline
            label="Registrarme"
            to="/registro-externo"
            class="btn-secondary"
          />

          <q-btn
            flat
            no-caps
            label="Explorar talleres"
            to="/talleres_u"
            class="btn-link"
          />
        </div>
      </div>

      <aside class="hero-preview-card">
        <div class="preview-badge">Evento académico</div>

        <h2
          class="preview-title"
          :style="previewTitleStyle"
        >
          <span
            v-for="linea in previewTituloLineas"
            :key="`preview-${linea}`"
          >
            {{ linea }}
          </span>
        </h2>

        <p class="preview-text">
          Consulta conferencias, talleres, ponentes, panelistas y actividades del congreso.
        </p>

        <div class="preview-stats">
          <div
            v-for="item in stats"
            :key="item.label"
            class="preview-stat"
          >
            <div class="preview-stat-value">{{ item.value }}</div>
            <div class="preview-stat-label">{{ item.label }}</div>
          </div>
        </div>

        <div class="preview-orb">
          <q-icon name="hub" />
        </div>
      </aside>
    </section>

    <section class="metrics-section">
      <div class="section-heading">
        <div class="section-badge">Numeralia</div>

        <h2>Todo lo que encontrarás en el congreso</h2>

        <p>
          Conoce de forma rápida las actividades, espacios y experiencias que forman parte de {{ tituloMenuCongreso }}.
        </p>
      </div>

      <div class="metrics-grid">
        <article
          v-for="item in statsDetailed"
          :key="item.title"
          class="metric-card"
        >
          <div class="metric-icon">
            <q-icon :name="item.icon" />
          </div>

          <div class="metric-value">{{ item.value }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section
      v-if="panelistasDestacados.length > 0"
      class="home-panelists-section"
    >
      <div class="panelists-heading">
        <div class="panelists-kicker">
          <q-icon name="groups" />
          <span>Ponentes y panelistas destacados</span>
        </div>

        <h2>Voces que inspiran el congreso</h2>

        <p>
          Conoce a algunos de los ponentes y panelistas registrados que compartirán
          experiencias, ideas y conocimiento en {{ tituloMenuCongreso }}.
        </p>
      </div>

      <div class="panelists-grid">
        <router-link
          v-for="panelista in panelistasDestacados"
          :key="panelista.id"
          :to="`/panelistas_u/${panelista.id}`"
          class="panelist-card-home"
        >
          <div class="panelist-image-wrap">
            <img
              v-if="obtenerFotoPonente(panelista)"
              :src="obtenerFotoPonente(panelista)"
              :alt="panelista.nombre"
              class="panelist-image"
            />

            <div
              v-else
              class="panelist-image-placeholder"
            >
              {{ obtenerIniciales(panelista.nombre) }}
            </div>

            <div class="panelist-image-glow"></div>

            <div class="panelist-corner-icon">
              <q-icon name="auto_awesome" />
            </div>
          </div>

          <div class="panelist-info-home">
            <h3>{{ panelista.nombre }}</h3>

            <span>
              {{ panelista.tema || panelista.institucion || 'Invitado del congreso' }}
            </span>

            <p>
              {{ obtenerDescripcionPonente(panelista) }}
            </p>
          </div>

          <span class="panelist-more-mobile">
            ver más
          </span>
        </router-link>
      </div>

      <div class="panelists-actions">
        <q-btn
          no-caps
          unelevated
          class="panelists-main-btn"
          label="Ver todos"
          icon-right="arrow_forward"
          to="/panelistas_u"
        />
      </div>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <div class="section-badge">Explora el congreso</div>

        <h2>Todo lo que necesitas en un solo lugar</h2>

        <p>
          Accede rápidamente a la agenda, conferencias, talleres, ponentes y panelistas.
        </p>
      </div>

      <div class="home-feature-grid">
        <router-link
          v-for="item in accesos"
          :key="item.titulo"
          :to="item.to"
          class="home-feature-card"
        >
          <div class="feature-icon">
            <q-icon :name="item.icon" />
          </div>

          <h3>{{ item.titulo }}</h3>
          <p>{{ item.descripcion }}</p>

          <span>
            Ver más
            <q-icon name="arrow_forward" />
          </span>
        </router-link>
      </div>
    </section>

    <section class="home-section home-split">
      <div class="home-preview-card">
        <div class="section-heading compact">
          <div class="section-badge">Próximas conferencias</div>
          <h2>Temas destacados</h2>
        </div>

        <div
          v-if="conferenciasDestacadas.length === 0"
          class="home-empty"
        >
          No hay conferencias disponibles.
        </div>

        <article
          v-for="conferencia in conferenciasDestacadas"
          :key="conferencia.id"
          class="home-activity"
        >
          <div class="activity-date">
            <strong>{{ obtenerDia(conferencia.fecha) }}</strong>
            <span>{{ obtenerMes(conferencia.fecha) }}</span>
          </div>

          <div>
            <h3>{{ conferencia.titulo }}</h3>

            <p>
              {{ formatearHora(conferencia.hora_inicio) }} -
              {{ formatearHora(conferencia.hora_fin) }}
            </p>
          </div>
        </article>

        <q-btn
          no-caps
          flat
          label="Ver conferencias"
          icon-right="arrow_forward"
          class="home-link-btn"
          to="/conferencias_u"
        />
      </div>

      <div class="home-preview-card">
        <div class="section-heading compact">
          <div class="section-badge">Talleres disponibles</div>
          <h2>Aprende practicando</h2>
        </div>

        <div
          v-if="talleresDestacados.length === 0"
          class="home-empty"
        >
          No hay talleres disponibles.
        </div>

        <article
          v-for="taller in talleresDestacados"
          :key="taller.id"
          class="home-activity"
        >
          <div class="activity-date">
            <strong>{{ obtenerDia(taller.fecha) }}</strong>
            <span>{{ obtenerMes(taller.fecha) }}</span>
          </div>

          <div>
            <h3>{{ taller.titulo }}</h3>
            <p>Cupo máximo: {{ taller.cupo_maximo }}</p>
          </div>
        </article>

        <q-btn
          no-caps
          flat
          label="Ver talleres"
          icon-right="arrow_forward"
          class="home-link-btn"
          to="/talleres_u"
        />
      </div>
    </section>

    <section class="home-cta">
      <div>
        <span>Participa en {{ tituloMenuCongreso }}</span>
        <h2>Regístrate y forma parte de esta experiencia académica.</h2>
      </div>

      <q-btn
        no-caps
        unelevated
        label="Registro externo"
        icon-right="how_to_reg"
        class="btn-primary"
        to="/registro-externo"
      />
    </section>

    <section
      v-if="forosEmpresarialesVisibles.length > 0"
      class="business-forums-section"
    >
      <div class="business-forums-heading">
        <span>Aliados estratégicos</span>

        <h2>Foros empresariales</h2>

        <p>
          Empresas, instituciones y espacios participantes que forman parte de
          {{ tituloMenuCongreso }}.
        </p>
      </div>

      <div class="business-forums-grid">
        <article
          v-for="foro in forosEmpresarialesVisibles"
          :key="foro.id"
          class="business-forum-card"
        >
          <img
            v-if="obtenerLogoForo(foro)"
            :src="obtenerLogoForo(foro)"
            :alt="`Logo de ${foro.nombre}`"
          />

          <div
            v-else
            class="business-forum-placeholder"
          >
            {{ obtenerIniciales(foro.nombre) }}
          </div>
        </article>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';
import { api } from '@/services/api';

interface ApiListResponse<T> {
  data?: T[];
}

interface Congreso {
  id: string;
  nombre?: string;
  titulo?: string;
  eslogan?: string;
  slogan?: string;
  ubicacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface Conferencia {
  id: string;
  titulo: string;
  resumen?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  congreso_id?: string | null;
  congreso?: {
    id: string;
    nombre?: string;
  } | null;
}

interface Taller {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  congreso_id?: string | null;
  congreso?: {
    id: string;
    nombre?: string;
  } | null;
}

interface Ponente {
  id: string;
  nombre: string;
  institucion?: string;
  semblanza?: string;
  tema?: string;
  tipo?: string;
  visiblePublico?: boolean;
  visible_publico?: boolean;
  foto?: {
    id?: string;
    url?: string;
    ruta_archivo?: string;
  } | null;
}

interface ForoEmpresarial {
  id: string;
  nombre: string;
  direccion?: string;
  resena?: string;
  logo?: {
    id?: string;
    url?: string;
    ruta_archivo?: string;
  } | null;
  congreso?: {
    id: string;
    nombre?: string;
  } | null;
  ubicacion?: {
    id: string;
    nombre?: string;
  } | null;
}

const congresos = ref<Congreso[]>([]);
const conferencias = ref<Conferencia[]>([]);
const talleres = ref<Taller[]>([]);
const ponentes = ref<Ponente[]>([]);
const forosEmpresariales = ref<ForoEmpresarial[]>([]);

const reduceMotion = ref(false);

let revealObserver: IntersectionObserver | null = null;
let counterObserver: IntersectionObserver | null = null;
let motionMedia: MediaQueryList | null = null;
let motionHandler: (() => void) | null = null;

const congresoActivo = computed(() => {
  return (
    [...congresos.value].sort((a, b) => {
      return (
        new Date(obtenerFechaInicioCongreso(b)).getTime() -
        new Date(obtenerFechaInicioCongreso(a)).getTime()
      );
    })[0] || null
  );
});

const tituloCongresoCompleto = computed(() => {
  return obtenerNombreCongreso(congresoActivo.value);
});

const tituloGrandeCongreso = computed(() => {
  return limitarPalabras(tituloCongresoCompleto.value, 150);
});

const anioCongreso = computed(() => {
  const nombre = tituloCongresoCompleto.value;
  const matchNombre = nombre.match(/\d{4}/);

  if (matchNombre) {
    return matchNombre[0];
  }

  const fechaInicio = congresoActivo.value
    ? obtenerFechaInicioCongreso(congresoActivo.value)
    : '';

  if (fechaInicio) {
    return String(new Date(fechaInicio).getFullYear());
  }

  return '2026';
});

const tituloMenuCongreso = computed(() => {
  return `Congreso UTVM ${anioCongreso.value}`;
});

const palabrasTituloGrande = computed(() => {
  return tituloGrandeCongreso.value.trim().split(/\s+/).filter(Boolean).length;
});

const tituloGrandeLineas = computed(() => {
  return dividirTitulo(
    tituloGrandeCongreso.value,
    obtenerPalabrasPorLinea(palabrasTituloGrande.value),
  );
});

const previewTituloLineas = computed(() => {
  return dividirTitulo(
    limitarPalabras(tituloCongresoCompleto.value, 50),
    obtenerPalabrasPorLineaPreview(palabrasTituloGrande.value),
  );
});

const heroTitleStyle = computed<CSSProperties>(() => {
  return {
    fontSize: obtenerTamanoTituloHero(palabrasTituloGrande.value),
    lineHeight: obtenerLineHeightTitulo(palabrasTituloGrande.value),
  };
});

const previewTitleStyle = computed<CSSProperties>(() => {
  return {
    fontSize: obtenerTamanoTituloPreview(palabrasTituloGrande.value),
    lineHeight: obtenerLineHeightTitulo(palabrasTituloGrande.value),
  };
});

const esloganCongreso = computed(() => {
  return (
    congresoActivo.value?.eslogan?.trim() ||
    congresoActivo.value?.slogan?.trim() ||
    'Vive una experiencia académica con conferencias, talleres, ponentes, panelistas y actividades diseñadas para impulsar el talento universitario, la innovación y la tecnología.'
  );
});

const ubicacionCongreso = computed(() => {
  return congresoActivo.value?.ubicacion?.trim() || 'UTVM';
});

const conferenciasVisibles = computed(() => {
  return filtrarPorCongreso(conferencias.value);
});

const talleresVisibles = computed(() => {
  return filtrarPorCongreso(talleres.value);
});

const ponentesVisibles = computed(() => {
  return ponentes.value.filter((ponente) => {
    const visibleNuevo = ponente.visiblePublico !== false;
    const visibleViejo = ponente.visible_publico !== false;

    return visibleNuevo && visibleViejo;
  });
});

const forosEmpresarialesVisibles = computed(() => {
  return filtrarPorCongreso(forosEmpresariales.value).filter((foro) =>
    Boolean(foro.nombre),
  );
});

const totalConferencias = computed(() => conferenciasVisibles.value.length);
const totalTalleres = computed(() => talleresVisibles.value.length);
const totalPonentes = computed(() => ponentesVisibles.value.length);

const totalDias = computed(() => {
  if (!congresoActivo.value) {
    return 0;
  }

  const inicio = new Date(obtenerFechaInicioCongreso(congresoActivo.value));
  const fin = new Date(obtenerFechaFinCongreso(congresoActivo.value));

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return 1;
  }

  const inicioNormalizado = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate(),
  );

  const finNormalizado = new Date(
    fin.getFullYear(),
    fin.getMonth(),
    fin.getDate(),
  );

  const diferencia = finNormalizado.getTime() - inicioNormalizado.getTime();
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(dias, 1);
});

const stats = computed(() => [
  {
    value: totalConferencias.value,
    label: 'Conferencias',
  },
  {
    value: totalTalleres.value,
    label: 'Talleres',
  },
  {
    value: totalPonentes.value,
    label: 'Invitados',
  },
]);

const statsDetailed = computed(() => [
  {
    icon: 'mic',
    value: totalConferencias.value,
    title: 'Conferencias',
    description:
      'Disfruta charlas con temas actuales pensadas para aprender, inspirarte y conocer nuevas ideas.',
  },
  {
    icon: 'construction',
    value: totalTalleres.value,
    title: 'Talleres',
    description:
      'Participa en actividades prácticas donde podrás aprender haciendo y reforzar tus habilidades.',
  },
  {
    icon: 'record_voice_over',
    value: totalPonentes.value,
    title: 'Ponentes y panelistas',
    description:
      'Conoce a personas invitadas que compartirán su experiencia, conocimiento y visión profesional.',
  },
  {
    icon: 'calendar_month',
    value: totalDias.value,
    title: 'Días de evento',
    description:
      'Vive varios días llenos de actividades, aprendizaje, convivencia y experiencias académicas.',
  },
]);

const panelistasDestacados = computed(() => {
  return ponentesVisibles.value.slice(0, 4);
});

const conferenciasDestacadas = computed(() => {
  return [...conferenciasVisibles.value]
    .sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) ||
        a.hora_inicio.localeCompare(b.hora_inicio),
    )
    .slice(0, 3);
});

const talleresDestacados = computed(() => {
  return [...talleresVisibles.value]
    .sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) ||
        a.hora_inicio.localeCompare(b.hora_inicio),
    )
    .slice(0, 3);
});

const rangoFechas = computed(() => {
  if (!congresoActivo.value) {
    return 'Fechas por confirmar';
  }

  const inicio = formatearFechaCorta(
    obtenerFechaInicioCongreso(congresoActivo.value),
  );

  const fin = formatearFechaCorta(
    obtenerFechaFinCongreso(congresoActivo.value),
  );

  return `${inicio} - ${fin}`;
});

const accesos = [
  {
    titulo: 'Agenda',
    descripcion: 'Consulta horarios, días, salas y actividades del evento.',
    icon: 'calendar_month',
    to: '/agenda',
  },
  {
    titulo: 'Conferencias',
    descripcion: 'Explora las charlas y temas principales del congreso.',
    icon: 'mic',
    to: '/conferencias_u',
  },
  {
    titulo: 'Talleres',
    descripcion: 'Revisa talleres, cupos, requisitos y horarios disponibles.',
    icon: 'construction',
    to: '/talleres_u',
  },
  {
    titulo: 'Ponentes y panelistas',
    descripcion: 'Conoce a los ponentes, panelistas y especialistas invitados.',
    icon: 'groups',
    to: '/panelistas_u',
  },
];

onMounted(() => {
  configurarPreferenciaMovimiento();

  void cargarInicio().then(async () => {
    await nextTick();
    prepararAnimaciones();
  });
});

onBeforeUnmount(() => {
  revealObserver?.disconnect();
  counterObserver?.disconnect();

  if (motionMedia && motionHandler) {
    motionMedia.removeEventListener('change', motionHandler);
  }
});

async function cargarInicio() {
  const [
    congresosRes,
    conferenciasRes,
    talleresRes,
    ponentesRes,
    forosRes,
  ] = await Promise.allSettled([
    api.get<Congreso[] | ApiListResponse<Congreso>>('congreso'),
    api.get<Conferencia[] | ApiListResponse<Conferencia>>('conferencias'),
    api.get<Taller[] | ApiListResponse<Taller>>('taller'),
    api.get<Ponente[] | ApiListResponse<Ponente>>('ponente'),
    api.get<ForoEmpresarial[] | ApiListResponse<ForoEmpresarial>>('foro-empresarial'),
  ]);

  if (congresosRes.status === 'fulfilled') {
    congresos.value = extraerLista(congresosRes.value.data);
  }

  if (conferenciasRes.status === 'fulfilled') {
    conferencias.value = extraerLista(conferenciasRes.value.data);
  }

  if (talleresRes.status === 'fulfilled') {
    talleres.value = extraerLista(talleresRes.value.data);
  }

  if (ponentesRes.status === 'fulfilled') {
    ponentes.value = extraerLista(ponentesRes.value.data);
  }

  if (forosRes.status === 'fulfilled') {
    forosEmpresariales.value = extraerLista(forosRes.value.data);
  }
}

function extraerLista<T>(respuesta: T[] | ApiListResponse<T>): T[] {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta.data)) {
    return respuesta.data;
  }

  return [];
}

function obtenerNombreCongreso(congreso: Congreso | null) {
  return congreso?.nombre?.trim() || congreso?.titulo?.trim() || 'Congreso UTVM';
}

function obtenerFechaInicioCongreso(congreso: Congreso) {
  return congreso.fechaInicio || congreso.fecha_inicio || '';
}

function obtenerFechaFinCongreso(congreso: Congreso) {
  return congreso.fechaFin || congreso.fecha_fin || obtenerFechaInicioCongreso(congreso);
}

function filtrarPorCongreso<
  T extends {
    congreso_id?: string | null;
    congreso?: { id: string } | null;
  },
>(lista: T[]) {
  if (!Array.isArray(lista)) {
    return [];
  }

  if (!congresoActivo.value) {
    return lista;
  }

  const hayRelaciones = lista.some(
    (item) => item.congreso_id || item.congreso?.id,
  );

  if (!hayRelaciones) {
    return lista;
  }

  return lista.filter((item) => {
    const congresoId = item.congreso_id || item.congreso?.id;

    return !congresoId || congresoId === congresoActivo.value?.id;
  });
}

function limitarPalabras(texto: string, maxPalabras = 150) {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);

  if (palabras.length <= maxPalabras) {
    return palabras.join(' ');
  }

  return `${palabras.slice(0, maxPalabras).join(' ')}...`;
}

function dividirTitulo(texto: string, palabrasPorLinea = 3) {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  const lineas: string[] = [];

  for (let i = 0; i < palabras.length; i += palabrasPorLinea) {
    lineas.push(palabras.slice(i, i + palabrasPorLinea).join(' '));
  }

  return lineas;
}

function obtenerPalabrasPorLinea(totalPalabras: number) {
  if (totalPalabras <= 4) return 2;
  if (totalPalabras <= 10) return 4;
  if (totalPalabras <= 18) return 5;
  if (totalPalabras <= 32) return 6;
  return 7;
}

function obtenerPalabrasPorLineaPreview(totalPalabras: number) {
  if (totalPalabras <= 6) return 2;
  if (totalPalabras <= 12) return 3;
  if (totalPalabras <= 24) return 4;
  return 5;
}

function obtenerTamanoTituloHero(totalPalabras: number) {
  if (totalPalabras <= 3) return 'clamp(3.9rem, 7.5vw, 6.4rem)';
  if (totalPalabras <= 6) return 'clamp(3.4rem, 6.2vw, 5.4rem)';
  if (totalPalabras <= 10) return 'clamp(2.9rem, 5.1vw, 4.4rem)';
  if (totalPalabras <= 18) return 'clamp(2.4rem, 4.2vw, 3.6rem)';
  if (totalPalabras <= 32) return 'clamp(2rem, 3.4vw, 2.9rem)';

  return 'clamp(1.7rem, 2.8vw, 2.4rem)';
}

function obtenerTamanoTituloPreview(totalPalabras: number) {
  if (totalPalabras <= 3) return 'clamp(2.4rem, 4vw, 3.5rem)';
  if (totalPalabras <= 6) return 'clamp(2.1rem, 3.5vw, 3rem)';
  if (totalPalabras <= 10) return 'clamp(1.8rem, 3vw, 2.45rem)';
  if (totalPalabras <= 18) return 'clamp(1.55rem, 2.5vw, 2rem)';
  if (totalPalabras <= 32) return 'clamp(1.35rem, 2vw, 1.7rem)';

  return 'clamp(1.2rem, 1.7vw, 1.45rem)';
}

function obtenerLineHeightTitulo(totalPalabras: number) {
  if (totalPalabras <= 6) return '0.98';
  if (totalPalabras <= 18) return '1.04';

  return '1.1';
}

function obtenerFotoPonente(ponente: Ponente) {
  return ponente.foto?.url || ponente.foto?.ruta_archivo || '';
}

function obtenerLogoForo(foro: ForoEmpresarial) {
  return foro.logo?.url || foro.logo?.ruta_archivo || '';
}

function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(' ').filter(Boolean);

  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes[1]?.charAt(0) || '';

  return `${primera}${segunda}`.toUpperCase();
}

function obtenerDescripcionPonente(ponente: Ponente) {
  const texto =
    ponente.semblanza ||
    ponente.tema ||
    ponente.institucion ||
    `Invitado de ${tituloMenuCongreso.value}.`;

  if (texto.length <= 120) {
    return texto;
  }

  return `${texto.slice(0, 120)}...`;
}

function formatearFechaCorta(fecha: string) {
  if (!fecha) {
    return 'Por confirmar';
  }

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return 'Por confirmar';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function obtenerDia(fecha: string) {
  return String(fecha || '').slice(8, 10) || '00';
}

function obtenerMes(fecha: string) {
  const date = new Date(`${String(fecha).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '---';
  }

  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
  }).format(date);
}

function formatearHora(hora: string) {
  return String(hora || '').slice(0, 5);
}

function configurarPreferenciaMovimiento() {
  if (typeof window === 'undefined') return;

  motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  motionHandler = () => {
    reduceMotion.value = motionMedia?.matches ?? false;
  };

  motionHandler();
  motionMedia.addEventListener('change', motionHandler);
}

function prepararAnimaciones() {
  if (typeof window === 'undefined') return;

  const elementosAnimados = document.querySelectorAll<HTMLElement>(
    [
      '.hero-copy',
      '.hero-preview-card',
      '.metrics-section',
      '.metric-card',
      '.home-panelists-section',
      '.panelist-card-home',
      '.home-section',
      '.home-feature-card',
      '.home-preview-card',
      '.home-activity',
      '.home-cta',
      '.business-forums-section',
      '.business-forum-card',
    ].join(','),
  );

  elementosAnimados.forEach((elemento, index) => {
    elemento.classList.add('reveal-item');
    elemento.style.setProperty(
      '--reveal-delay',
      `${Math.min(index * 45, 280)}ms`,
    );
  });

  if (reduceMotion.value) {
    elementosAnimados.forEach((elemento) => {
      elemento.classList.add('is-visible');
    });

    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver?.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  elementosAnimados.forEach((elemento) => {
    revealObserver?.observe(elemento);
  });

  prepararContadores();
}

function prepararContadores() {
  if (typeof window === 'undefined' || reduceMotion.value) return;

  const contadores = document.querySelectorAll<HTMLElement>(
    '.metric-value, .preview-stat-value',
  );

  counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animarContador(entry.target as HTMLElement);
        counterObserver?.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5,
    },
  );

  contadores.forEach((contador) => {
    counterObserver?.observe(contador);
  });
}

function animarContador(elemento: HTMLElement) {
  const textoOriginal = elemento.textContent?.trim() || '0';
  const valorFinal = Number(textoOriginal.replace(/[^\d]/g, ''));

  if (!Number.isFinite(valorFinal)) return;

  const duracion = 900;
  const inicio = performance.now();

  const animar = (tiempoActual: number) => {
    const progreso = Math.min((tiempoActual - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - progreso, 3);
    const valorActual = Math.round(valorFinal * suavizado);

    elemento.textContent = String(valorActual);

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      elemento.textContent = textoOriginal;
    }
  };

  requestAnimationFrame(animar);
}
</script>

<style scoped lang="scss">
@import '@/css/public-home.scss';
</style>
