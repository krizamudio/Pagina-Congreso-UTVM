<template>
  <q-list bordered separator class="admin-list">
    <q-item v-for="team in teams" :key="team.id">
      <q-item-section>
        <q-item-label>{{ team.nombre }}</q-item-label>
        <q-item-label caption>
          {{ team.integrantes.length }} integrante(s)
          <span v-if="team.bloqueado"> · Reconocimientos emitidos</span>
        </q-item-label>
      </q-item-section>
      <q-item-section side class="result-column">
        <q-select
          dense
          clearable
          :dark="!isLight"
          :model-value="team.resultado"
          :options="options"
          emit-value
          map-options
          label="Resultado"
          :disable="team.bloqueado || loading"
          @update:model-value="value => $emit('result', team.id, value)"
        />
      </q-item-section>
    </q-item>
    <q-item v-if="!teams.length">
      <q-item-section class="text-secondary">
        Registra equipos antes de asignar resultados.
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useThemeMode } from "../../composables/useThemeMode";
import type { HackatonEquipo, HackatonResultado } from "../../types";

defineProps<{ teams: HackatonEquipo[]; loading: boolean }>();
defineEmits<{ result: [id: string, value: HackatonResultado | null] }>();
const { isLight } = useThemeMode();
const options = [
  { label: "Primer lugar", value: "PRIMER_LUGAR" },
  { label: "Segundo lugar", value: "SEGUNDO_LUGAR" },
  { label: "Tercer lugar", value: "TERCER_LUGAR" },
  { label: "Mención honorífica", value: "MENCION_HONORIFICA" }
];
</script>
