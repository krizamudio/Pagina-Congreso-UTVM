<template>
  <q-page class="qr-validation-page flex flex-center q-pa-md">
    <q-card class="validation-card" flat bordered>
      <q-card-section class="text-center q-py-lg">
        <q-avatar :color="stateColor" text-color="white" size="76px">
          <q-icon :name="stateIcon" size="44px" />
        </q-avatar>
        <div class="text-h5 text-weight-bold q-mt-md">{{ title }}</div>
        <div class="text-body2 text-grey-7 q-mt-sm">{{ subtitle }}</div>
      </q-card-section>

      <q-linear-progress v-if="loading" indeterminate color="primary" />

      <template v-if="access">
        <q-separator />
        <q-list>
          <q-item>
            <q-item-section avatar
              ><q-icon name="person" color="primary"
            /></q-item-section>
            <q-item-section>
              <q-item-label>{{
                access.participante.nombreCompleto
              }}</q-item-label>
              <q-item-label caption>{{
                access.participante.tipo
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar
              ><q-icon name="festival" color="primary"
            /></q-item-section>
            <q-item-section>
              <q-item-label>{{ access.congreso.nombre }}</q-item-label>
              <q-item-label caption>Congreso</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar
              ><q-icon name="event" color="primary"
            /></q-item-section>
            <q-item-section>
              <q-item-label>{{ formatDate(access.dia.fecha) }}</q-item-label>
              <q-item-label caption>Día autorizado</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="access.dia.fechaIngreso">
            <q-item-section avatar
              ><q-icon name="schedule" color="positive"
            /></q-item-section>
            <q-item-section>
              <q-item-label>{{
                formatDateTime(access.dia.fechaIngreso)
              }}</q-item-label>
              <q-item-label caption>Entrada registrada</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <q-card-actions
        v-if="access && !access.dia.accesoUtilizado"
        class="q-pa-md"
      >
        <q-btn
          class="full-width"
          color="positive"
          size="lg"
          icon="login"
          label="Confirmar entrada"
          :loading="confirming"
          @click="confirmAccess"
        />
      </q-card-actions>

      <q-card-actions v-if="error" class="q-pa-md">
        <q-btn
          class="full-width"
          outline
          color="primary"
          label="Volver a validar"
          @click="inspect"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getQrApiError, qrAccessService } from "../services/qrAccessService";
import type { QrAccessResponse } from "../types/qr-access";

const route = useRoute() as unknown as { params: { token?: string } };
const access = ref<QrAccessResponse | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);
const confirming = ref(false);
const token = computed(() => String(route.params.token ?? ""));
const title = computed(() => {
  if (loading.value) return "Validando código";
  if (error.value) return "Acceso no autorizado";
  if (access.value?.dia.accesoUtilizado) return "Entrada confirmada";
  return "QR válido";
});
const subtitle = computed(
  () => error.value ?? "Comprueba los datos antes de permitir el ingreso."
);
const stateColor = computed(() =>
  error.value
    ? "negative"
    : access.value?.dia.accesoUtilizado
      ? "positive"
      : "primary"
);
const stateIcon = computed(() =>
  error.value
    ? "block"
    : access.value?.dia.accesoUtilizado
      ? "check"
      : "qr_code_2"
);

async function inspect() {
  loading.value = true;
  error.value = null;
  access.value = null;
  try {
    access.value = await qrAccessService.inspect(token.value);
  } catch (requestError) {
    error.value = getQrApiError(requestError);
  } finally {
    loading.value = false;
  }
}

async function confirmAccess() {
  if (confirming.value) return;
  confirming.value = true;
  error.value = null;
  try {
    access.value = await qrAccessService.confirm(token.value);
  } catch (requestError) {
    access.value = null;
    error.value = getQrApiError(requestError);
  } finally {
    confirming.value = false;
  }
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    dateStyle: "full"
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

onMounted(() => {
  void inspect();
});
</script>

<style scoped>
.qr-validation-page {
  min-height: calc(100vh - 50px);
  background: linear-gradient(135deg, #e8f5e9, #e0f2f1);
}

.validation-card {
  width: min(100%, 520px);
  border-radius: 24px;
}
</style>
