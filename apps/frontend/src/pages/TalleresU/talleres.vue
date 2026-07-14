<template>
  <q-page class="talleres-page">
    <q-inner-loading :showing="isRefreshing">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <div class="talleres-container">
      <div class="talleres-header">
        <q-icon name="event_note" />
        <h1>Registro de Talleres</h1>
      </div>

      <div v-if="!isRefreshing && talleres.length === 0" class="sin-talleres">
        <q-icon name="event_busy" size="50px" />
        <p>No hay talleres disponibles.</p>
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
            <div class="taller-card-top taller-card-top-sin-imagen">
              <div class="taller-card-info taller-card-info-completa">
                <h3>{{ taller.nombre }}</h3>

                <div class="taller-meta">
                  <div class="taller-meta-item">
                    <q-icon name="schedule" />
                    <span>Horario: {{ taller.horario }}</span>
                  </div>

                  <div class="taller-meta-item">
                    <q-icon name="groups" />
                    <span>
                      Cupo: {{ taller.inscritos }} / {{ taller.cupo }}
                    </span>
                  </div>
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
                  {{ obtenerPorcentaje(taller) }}% inscritos
                </span>
              </div>
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
              <div class="taller-detalle-top taller-detalle-top-sin-imagen">
                <div class="taller-detalle-info taller-detalle-info-completa">
                  <h2>{{ tallerSeleccionado.nombre }}</h2>

                  <div class="taller-meta">
                    <div class="taller-meta-item">
                      <q-icon name="schedule" />
                      <span>
                        Horario: {{ tallerSeleccionado.horario }}
                      </span>
                    </div>

                    <div class="taller-meta-item">
                      <q-icon name="groups" />
                      <span>
                        Cupo: {{ tallerSeleccionado.inscritos }} /
                        {{ tallerSeleccionado.cupo }}
                      </span>
                    </div>
                  </div>

                  <div class="taller-progress-wrap">
                    <div class="taller-progress-row">
                      <div class="taller-progress">
                        <div
                          class="taller-progress-bar"
                          :style="{
                            width: `${obtenerPorcentaje(
                              tallerSeleccionado,
                            )}%`,
                          }"
                        ></div>
                      </div>

                      <span class="taller-progress-label">
                        {{ obtenerPorcentaje(tallerSeleccionado) }}% inscritos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p class="taller-detalle-desc">
                {{ tallerSeleccionado.descripcion }}
              </p>
            </div>

            <div class="taller-detalle-right">
              <div>
                <h3>Requisitos:</h3>

                <ul>
                  <li
                    v-for="(tema, index) in tallerSeleccionado.temas"
                    :key="`${tema}-${index}`"
                  >
                    {{ tema }}
                  </li>
                </ul>
              </div>

              <div class="taller-detalle-actions">
                <q-btn
                  label="Inscribirse"
                  icon="person_add"
                  class="btn-taller-inscribirse"
                  :disable="obtenerEstado(tallerSeleccionado).tipo === 'gris'"
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
import { computed, onMounted, ref } from 'vue';
import { useTalleresQuery } from '../../composables/useTalleresQuery';

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
}

interface TallerVista {
  id: string;
  nombre: string;
  horario: string;
  cupo: number;
  inscritos: number;
  descripcion: string;
  temas: string[];
  estado_cupo?: string;
  porcentaje_ocupacion?: number;
}

interface EstadoTaller {
  tipo: 'verde' | 'amarillo' | 'rojo' | 'gris';
  texto: string;
}

const { data, load, isRefreshing } = useTalleresQuery();

const tallerSeleccionado = ref<TallerVista | null>(null);

const inscritosTemporales = ref<Record<string, number>>({});

const formatearHora = (hora: string): string => {
  return hora.substring(0, 5);
};

const obtenerHorario = (taller: TallerBackend): string => {
  if (taller.hora_inicio && taller.hora_fin) {
    return `${formatearHora(taller.hora_inicio)} - ${formatearHora(
      taller.hora_fin,
    )}`;
  }

  if (taller.hora_inicio) {
    return formatearHora(taller.hora_inicio);
  }

  return 'Horario no registrado';
};

const talleres = computed<TallerVista[]>(() => {
  const registros = Array.isArray(data.value) ? data.value : [];

  return registros.map((item): TallerVista => {
    const taller = item as unknown as TallerBackend;

    const inscritosBackend = Number(taller.inscritos ?? 0);

    const inscritos =
      inscritosTemporales.value[taller.id] ?? inscritosBackend;

    const requisitos =
      typeof taller.requisitos === 'string'
        ? taller.requisitos
            .split('\n')
            .map((requisito) => requisito.trim())
            .filter((requisito) => requisito.length > 0)
        : [];

    return {
      id: String(taller.id),
      nombre: taller.titulo?.trim() || 'Taller sin nombre',
      horario: obtenerHorario(taller),
      cupo: Number(taller.cupo_maximo ?? 0),
      inscritos,
      descripcion:
        taller.descripcion?.trim() || 'Sin descripción registrada.',
      temas:
        requisitos.length > 0
          ? requisitos
          : ['Sin requisitos registrados'],
      estado_cupo: taller.estado_cupo,
      porcentaje_ocupacion: taller.porcentaje_ocupacion,
    };
  });
});

const cerrarDetalle = (): void => {
  tallerSeleccionado.value = null;
};

const obtenerPorcentaje = (taller: TallerVista): number => {
  if (taller.cupo <= 0) {
    return 0;
  }

  const porcentaje = Math.round(
    (taller.inscritos / taller.cupo) * 100,
  );

  return Math.min(Math.max(porcentaje, 0), 100);
};

const obtenerEstado = (taller: TallerVista): EstadoTaller => {
  const porcentaje = obtenerPorcentaje(taller);

  if (porcentaje >= 100) {
    return {
      tipo: 'gris',
      texto: 'Cupo completo',
    };
  }

  if (porcentaje >= 80) {
    return {
      tipo: 'rojo',
      texto: 'Pocos lugares',
    };
  }

  if (porcentaje >= 50) {
    return {
      tipo: 'amarillo',
      texto: 'Cupo medio',
    };
  }

  return {
    tipo: 'verde',
    texto: 'Disponible',
  };
};

const seleccionarTaller = (taller: TallerVista): void => {
  tallerSeleccionado.value = {
    ...taller,
    temas: [...taller.temas],
  };
};

const inscribirse = (taller: TallerVista): void => {
  if (taller.cupo <= 0 || taller.inscritos >= taller.cupo) {
    return;
  }

  const nuevosInscritos = taller.inscritos + 1;

  inscritosTemporales.value[taller.id] = nuevosInscritos;

  if (
    tallerSeleccionado.value &&
    tallerSeleccionado.value.id === taller.id
  ) {
    tallerSeleccionado.value = {
      ...tallerSeleccionado.value,
      inscritos: nuevosInscritos,
    };
  }

  console.log(`Inscripción temporal en taller: ${taller.nombre}`);
};

onMounted(async (): Promise<void> => {
  try {
    await load();
  } catch (error) {
    console.error('Error al cargar los talleres:', error);
  }
});
</script>

<style lang="scss">
@import '../../css/talleres.scss';

.taller-card-top-sin-imagen {
  display: block;
}

.taller-card-info-completa {
  width: 100%;
}

.taller-detalle-top-sin-imagen {
  display: block;
}

.taller-detalle-info-completa {
  width: 100%;
}

.sin-talleres {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.sin-talleres p {
  margin: 0;
  font-size: 1.1rem;
}
</style>