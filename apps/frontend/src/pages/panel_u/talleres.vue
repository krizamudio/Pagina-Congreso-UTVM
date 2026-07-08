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

      <div class="talleres-layout">
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
            <div class="taller-card-top">
              <img
                v-if="taller.imagen"
                :src="taller.imagen"
                :alt="taller.nombre"
                class="taller-card-image"
              />

              <div v-else class="taller-card-image taller-image-placeholder">
                <q-icon name="image" size="38px" />
              </div>

              <div class="taller-card-info">
                <h3>{{ taller.nombre }}</h3>

                <div class="taller-meta">
                  <div class="taller-meta-item">
                    <q-icon name="schedule" />
                    <span>Horario: {{ taller.horario }}</span>
                  </div>

                  <div class="taller-meta-item">
                    <q-icon name="groups" />
                    <span>Cupo: {{ taller.inscritos }} / {{ taller.cupo }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="taller-progress-wrap">
              <div class="taller-progress-row">
                <div class="taller-progress">
                  <div
                    class="taller-progress-bar"
                    :style="{ width: obtenerPorcentaje(taller) + '%' }"
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
              <div class="taller-detalle-top">
                <img
                  v-if="tallerSeleccionado.imagen"
                  :src="tallerSeleccionado.imagen"
                  :alt="tallerSeleccionado.nombre"
                  class="taller-detalle-image"
                />

                <div v-else class="taller-detalle-image taller-image-placeholder">
                  <q-icon name="image" size="52px" />
                </div>

                <div class="taller-detalle-info">
                  <h2>{{ tallerSeleccionado.nombre }}</h2>

                  <div class="taller-meta">
                    <div class="taller-meta-item">
                      <q-icon name="schedule" />
                      <span>Horario: {{ tallerSeleccionado.horario }}</span>
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
                            width: obtenerPorcentaje(tallerSeleccionado) + '%',
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
                  <li v-for="tema in tallerSeleccionado.temas" :key="tema">
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

interface TallerVista {
  id: string;
  nombre: string;
  horario: string;
  cupo: number;
  inscritos: number;
  descripcion: string;
  temas: string[];
  imagen: string;
  estado_cupo?: string;
  porcentaje_ocupacion?: number;
}

const { data, load, isRefreshing } = useTalleresQuery();

const tallerSeleccionado = ref<TallerVista | null>(null);

const API_URL = 'http://localhost:3000';

const talleres = computed<TallerVista[]>(() => {
  return data.value.map((taller: any) => ({
    id: taller.id,
    nombre: taller.titulo,
    horario: taller.horario,
    cupo: taller.cupo_maximo,
    inscritos: taller.inscritos ?? 0,
    descripcion: taller.descripcion,
    temas: taller.requisitos
      ? taller.requisitos
          .split('\n')
          .map((item: string) => item.trim())
          .filter((item: string) => item !== '')
      : ['Sin requisitos registrados'],
    imagen: taller.imagen_url ? `${API_URL}${taller.imagen_url}` : '',
    estado_cupo: taller.estado_cupo,
    porcentaje_ocupacion: taller.porcentaje_ocupacion,
  }));
});

const cerrarDetalle = () => {
  tallerSeleccionado.value = null;
};

const obtenerPorcentaje = (taller: TallerVista) => {
  return Math.round((taller.inscritos / taller.cupo) * 100);
};

const obtenerEstado = (taller: TallerVista) => {
  const porcentaje = obtenerPorcentaje(taller);

  if (porcentaje >= 100) {
    return { tipo: 'gris', texto: 'Cupo completo' };
  }

  if (porcentaje >= 80) {
    return { tipo: 'rojo', texto: 'Pocos lugares' };
  }

  if (porcentaje >= 50) {
    return { tipo: 'amarillo', texto: 'Cupo medio' };
  }

  return { tipo: 'verde', texto: 'Disponible' };
};

const seleccionarTaller = (taller: TallerVista) => {
  tallerSeleccionado.value = { ...taller };
};

const inscribirse = (taller: TallerVista) => {
  // si ya está lleno, no hace nada
  if (taller.inscritos >= taller.cupo) {
    return;
  }

  // 1) actualiza el taller en la lista principal (data del backend cargada en frontend)
  const tallerOriginal = data.value.find((item: any) => item.id === taller.id);

  if (tallerOriginal) {
    tallerOriginal.inscritos = (tallerOriginal.inscritos ?? 0) + 1;
  }

  // 2) actualiza el taller del modal para que se vea el cambio al instante
  if (tallerSeleccionado.value && tallerSeleccionado.value.id === taller.id) {
    tallerSeleccionado.value.inscritos += 1;
  }

  console.log(`Inscripción temporal en taller: ${taller.nombre}`);
};

onMounted(async () => {
  await load();
});
</script>

<style lang="scss">
@import '../../css/talleres.scss';

.taller-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-blue);
}
</style>