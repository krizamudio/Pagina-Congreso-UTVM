<template>
  <q-list bordered separator class="admin-list">
    <q-item v-for="team in awardedTeams" :key="team.id">
      <q-item-section>
        <q-item-label>{{ team.nombre }}</q-item-label>
        <q-item-label caption>{{ label(team.resultado) }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          unelevated
          color="primary"
          icon="download"
          label="Descargar ZIP"
          :loading="downloading === team.id"
          :disable="!!downloading"
          @click="$emit('download', team.id)"
        />
      </q-item-section>
    </q-item>
    <q-item v-if="!awardedTeams.length">
      <q-item-section class="text-secondary">
        Asigna resultados para habilitar las descargas.
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HackatonEquipo, HackatonResultado } from "../../types";

const props = defineProps<{
  teams: HackatonEquipo[];
  downloading: string | null;
}>();
defineEmits<{ download: [id: string] }>();
const awardedTeams = computed(() => props.teams.filter(item => item.resultado));
const labels: Record<HackatonResultado, string> = {
  PRIMER_LUGAR: "Primer lugar",
  SEGUNDO_LUGAR: "Segundo lugar",
  TERCER_LUGAR: "Tercer lugar",
  MENCION_HONORIFICA: "Mención honorífica"
};
const label = (value: HackatonResultado | null) => (value ? labels[value] : "");
</script>
