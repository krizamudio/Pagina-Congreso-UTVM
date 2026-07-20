<template>
  <q-dialog v-model="dialogoAbierto" @hide="reiniciarCentroAyuda">
    <q-card class="centro-ayuda-card">
      <q-card-section class="centro-ayuda-encabezado">
        <div class="encabezado-contenido">
          <q-icon name="support_agent" size="32px" aria-hidden="true" />
          <div>
            <h2>Centro de ayuda</h2>
            <p>Selecciona una opción para resolver tus dudas</p>
          </div>
        </div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Cerrar centro de ayuda"
          class="boton-cerrar"
          @click="cerrarCentroAyuda"
        />
      </q-card-section>

      <q-separator dark />

      <q-scroll-area class="centro-ayuda-contenido">
        <q-card-section v-if="!categoriaSeleccionada" class="contenido-seccion">
          <div class="titulo-vista">¿En qué podemos ayudarte?</div>
          <div class="categorias-grid">
            <button
              v-for="categoria in categorias"
              :key="categoria.id"
              type="button"
              class="tarjeta-categoria"
              @click="seleccionarCategoria(categoria)"
            >
              <q-icon :name="categoria.icono" size="30px" aria-hidden="true" />
              <span class="categoria-texto">
                <strong>{{ categoria.nombre }}</strong>
                <small>{{ categoria.descripcion }}</small>
              </span>
              <q-icon name="chevron_right" size="22px" aria-hidden="true" />
            </button>
          </div>
        </q-card-section>

        <q-card-section
          v-else-if="!preguntaSeleccionada"
          class="contenido-seccion"
        >
          <q-btn
            flat
            no-caps
            icon="arrow_back"
            label="Volver a categorías"
            class="boton-volver"
            @click="volverACategorias"
          />

          <div class="encabezado-vista">
            <q-icon
              :name="categoriaSeleccionada.icono"
              size="30px"
              aria-hidden="true"
            />
            <div>
              <div class="titulo-vista">{{ categoriaSeleccionada.nombre }}</div>
              <div class="subtitulo-vista">Selecciona una pregunta</div>
            </div>
          </div>

          <div class="preguntas-lista">
            <button
              v-for="pregunta in categoriaSeleccionada.preguntas"
              :key="pregunta.id"
              type="button"
              class="boton-pregunta"
              @click="seleccionarPregunta(pregunta)"
            >
              <span>{{ pregunta.pregunta }}</span>
              <q-icon name="chevron_right" size="22px" aria-hidden="true" />
            </button>
          </div>
        </q-card-section>

        <q-card-section v-else class="contenido-seccion">
          <div class="respuesta-icono" aria-hidden="true">
            <q-icon name="question_answer" size="34px" />
          </div>
          <div class="titulo-respuesta">{{
            preguntaSeleccionada.pregunta
          }}</div>
          <div class="respuesta-bloque">{{
            preguntaSeleccionada.respuesta
          }}</div>

          <div class="acciones-respuesta">
            <q-btn
              unelevated
              no-caps
              icon="arrow_back"
              label="Volver a preguntas"
              class="boton-principal"
              @click="volverAPreguntas"
            />
            <q-btn
              outline
              no-caps
              icon="home"
              label="Volver al inicio"
              class="boton-inicio"
              @click="volverACategorias"
            />
          </div>
        </q-card-section>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { categoriasAyuda } from "@/data/preguntasAyuda.js";

interface PreguntaAyuda {
  id: string;
  pregunta: string;
  respuesta: string;
}

interface CategoriaAyuda {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  preguntas: PreguntaAyuda[];
}

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [valor: boolean];
}>();

const categorias = categoriasAyuda as CategoriaAyuda[];
const categoriaSeleccionada = ref<CategoriaAyuda | null>(null);
const preguntaSeleccionada = ref<PreguntaAyuda | null>(null);

const dialogoAbierto = computed({
  get: () => props.modelValue,
  set: valor => emit("update:modelValue", valor)
});

function seleccionarCategoria(categoria: CategoriaAyuda): void {
  categoriaSeleccionada.value = categoria;
  preguntaSeleccionada.value = null;
}

function seleccionarPregunta(pregunta: PreguntaAyuda): void {
  preguntaSeleccionada.value = pregunta;
}

function volverAPreguntas(): void {
  preguntaSeleccionada.value = null;
}

function volverACategorias(): void {
  categoriaSeleccionada.value = null;
  preguntaSeleccionada.value = null;
}

function reiniciarCentroAyuda(): void {
  volverACategorias();
}

function cerrarCentroAyuda(): void {
  dialogoAbierto.value = false;
}
</script>

<style scoped lang="scss">
.centro-ayuda-card {
  width: 560px;
  max-width: calc(100vw - 32px);
  height: min(82vh, 700px);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--text-main);
  background: linear-gradient(145deg, #0f2e27 0%, #071e1b 100%) !important;
  border: 1px solid var(--surface-border);
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.42);
}

.centro-ayuda-encabezado {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 22px 20px;
  background: rgba(5, 30, 30, 0.98);
}

.encabezado-contenido {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;

  > .q-icon {
    color: var(--brand-primary);
  }

  h2 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.25;
    font-weight: 800;
  }

  p {
    margin: 5px 0 0;
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.45;
  }
}

.boton-cerrar {
  flex: 0 0 auto;
  color: #ffffff;
}

.centro-ayuda-contenido {
  flex: 1 1 auto;
  min-height: 0;
}

.contenido-seccion {
  padding: 22px;
}

.titulo-vista {
  color: #ffffff;
  font-size: 1.18rem;
  line-height: 1.35;
  font-weight: 700;
}

.subtitulo-vista {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.categorias-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.tarjeta-categoria,
.boton-pregunta {
  appearance: none;
  border: 1px solid var(--surface-border);
  color: #ffffff;
  background: rgba(255, 255, 255, 0.045);
  font: inherit;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.tarjeta-categoria {
  min-height: 112px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-align: left;
  border-radius: 16px;

  > .q-icon:first-child {
    color: var(--brand-primary);
  }
}

.categoria-texto {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  small {
    margin-top: 5px;
    color: var(--text-muted);
    font-size: 0.78rem;
    line-height: 1.4;
  }
}

.tarjeta-categoria:hover,
.boton-pregunta:hover {
  background: rgba(0, 230, 118, 0.1);
  border-color: rgba(0, 230, 118, 0.42);
  transform: translateY(-1px);
}

.tarjeta-categoria:focus-visible,
.boton-pregunta:focus-visible,
.boton-cerrar:focus-visible,
.boton-volver:focus-visible,
.boton-principal:focus-visible,
.boton-inicio:focus-visible {
  outline: 3px solid var(--brand-info);
  outline-offset: 2px;
}

.boton-volver {
  margin: -8px 0 14px -10px;
  color: var(--brand-primary);
}

.encabezado-vista {
  display: flex;
  align-items: center;
  gap: 12px;

  > .q-icon {
    color: var(--brand-primary);
  }
}

.preguntas-lista {
  display: grid;
  gap: 11px;
  margin-top: 20px;
}

.boton-pregunta {
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  text-align: left;
  border-radius: 13px;
}

.respuesta-icono {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  color: var(--brand-primary);
  background: rgba(0, 230, 118, 0.12);
  border: 1px solid rgba(0, 230, 118, 0.28);
  border-radius: 50%;
}

.titulo-respuesta {
  color: #ffffff;
  font-size: 1.3rem;
  line-height: 1.4;
  font-weight: 750;
}

.respuesta-bloque {
  margin-top: 18px;
  padding: 18px;
  color: var(--text-soft);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  border-left: 4px solid var(--brand-primary);
  border-radius: 14px;
  font-size: 1rem;
  line-height: 1.75;
}

.acciones-respuesta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.boton-principal {
  color: #04140f;
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-secondary)
  );
  font-weight: 700;
}

.boton-inicio {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.26);
}

@media (max-width: 600px) {
  .centro-ayuda-card {
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    height: 84vh;
    max-height: 84vh;
    border-radius: 16px;
  }

  .centro-ayuda-encabezado {
    padding: 18px 16px;
  }

  .encabezado-contenido {
    align-items: flex-start;
    gap: 10px;

    h2 {
      font-size: 1.18rem;
    }
  }

  .contenido-seccion {
    padding: 18px 16px;
  }

  .categorias-grid {
    grid-template-columns: 1fr;
  }

  .tarjeta-categoria {
    min-height: 88px;
  }

  .acciones-respuesta {
    flex-direction: column;

    .q-btn {
      width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tarjeta-categoria,
  .boton-pregunta {
    transition: none;
  }
}
</style>
