<template>
  <q-page class="hero-page q-pa-md registro-nsu-detalle-page">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Registro NSU</div>
        <div class="text-subtitle2 text-grey-7">
          {{ registro?.id ?? 'Detalle del registro' }}
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn flat icon="arrow_back" label="Volver" @click="goBack" />
        <q-btn icon="refresh" label="Recargar" color="primary" :loading="isLoading" @click="load" />
      </div>
    </div>

    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">
      {{ error }}
    </q-banner>

    <div v-if="isLoading" class="q-pa-lg text-grey-7">Cargando registro...</div>

    <template v-else-if="registro">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card dashboard-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Participantes</div>
              <div class="text-h5 text-weight-bold">{{ registro.total_participantes }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card dashboard-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Total</div>
              <div class="text-h5 text-weight-bold">{{ money(registro.total_general) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card dashboard-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Estatus grupal</div>
              <q-badge :color="statusColor(mapNsuStatus(registro.estado_pago))">
                {{ statusLabel(mapNsuStatus(registro.estado_pago)) }}
              </q-badge>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card dashboard-card">
            <q-card-section>
              <div class="text-caption text-grey-7">Comprobante</div>
              <div class="text-body2 ellipsis">{{ normalizeText(registro.comprobante?.nombre_original) || 'Sin comprobante' }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="detail-card dashboard-card q-mb-md">
        <q-card-section class="row justify-between items-center q-gutter-sm">
          <div>
            <div class="text-h6">Validación grupal</div>
            <div class="text-caption text-grey-7">Aplica el estatus a todos los participantes del registro.</div>
          </div>

          <div class="row q-gutter-sm">
            <q-btn outline icon="pending" color="orange" label="Pendiente todos" :loading="isSaving" @click="setGroupStatus('PENDIENTE')" />
            <q-btn outline icon="check_circle" color="positive" label="Validar todos" :loading="isSaving" @click="setGroupStatus('VALIDADO')" />
            <q-btn outline icon="cancel" color="negative" label="Rechazar todos" :loading="isSaving" @click="setGroupStatus('RECHAZADO')" />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="detail-card dashboard-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">Integrantes</div>

          <q-table class="dashboard-table" :rows="registro.participantes" :columns="participantColumns" row-key="id" flat bordered :loading="isSaving">
            <template #body-cell-estado_pago="props">
              <q-td align="center">
                <q-badge :color="statusColor(mapNsuStatus(props.row.estado_pago))">
                  {{ statusLabel(mapNsuStatus(props.row.estado_pago)) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td align="center" class="actions-cell">
                <q-btn class="nsu-action-btn nsu-action-pending" dense flat round icon="pending" color="orange" :disable="isSaving || isLoading" @click="setParticipantStatus(props.row.id, 'PENDIENTE')" />
                <q-btn class="nsu-action-btn nsu-action-valid" dense flat round icon="check_circle" color="positive" :disable="isSaving || isLoading" @click="setParticipantStatus(props.row.id, 'VALIDADO')" />
                <q-btn class="nsu-action-btn nsu-action-reject" dense flat round icon="cancel" color="negative" :disable="isSaving || isLoading" @click="setParticipantStatus(props.row.id, 'RECHAZADO')" />
                <q-btn class="nsu-action-btn nsu-action-delete" dense flat round icon="delete" color="grey-7" :disable="isSaving || isLoading" @click="deleteParticipant(props.row.id)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useParticipantesAdmin } from '../../composables/useParticipantesAdmin';
import type { ParticipanteEstatus, ParticipanteNsuDetalle, RegistroNsu } from '../../types';

const route = useRoute() as unknown as { params: { id?: string } };
const router = useRouter();
const $q = useQuasar();
const registro = ref<RegistroNsu | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref<string | null>(null);

const {
  getNsuById,
  updateNsuStatus,
  updateNsuParticipantStatus,
  removeNsuParticipant,
} = useParticipantesAdmin();

const registroId = computed(() => route.params.id ?? '');

const participantColumns: QTableColumn[] = [
  { name: 'nombre_completo', label: 'Nombre', field: 'nombre_completo', align: 'left', sortable: true },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
  { name: 'institucion', label: 'Institución', field: 'institucion', align: 'left' },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left' },
  { name: 'dias', label: 'Días', field: 'dias', align: 'left' },
  { name: 'monto_individual', label: 'Monto', field: (row: ParticipanteNsuDetalle) => money(row.monto_individual), align: 'right' },
  { name: 'correo_verificado', label: 'Correo verificado', field: (row: ParticipanteNsuDetalle) => (row.correo_verificado ? 'Sí' : 'No'), align: 'center' },
  { name: 'estado_pago', label: 'Estatus', field: 'estado_pago', align: 'center' },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
    style: 'min-width: 180px; width: 180px;',
    headerStyle: 'min-width: 180px; width: 180px;',
  },
];

function notify(type: 'positive' | 'negative', message: string) {
  if (typeof $q.notify === 'function') {
    $q.notify({
      type,
      message,
      position: 'top',
      timeout: 3200,
      multiLine: true,
      progress: true,
      textColor: type === 'negative' ? 'white' : 'black',
      classes: `app-notify app-notify-${type}`,
    });
    return;
  }

  console.warn(`[${type}] ${message}`);
}

function money(value: number | string) {
  return Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

function mapNsuStatus(status?: RegistroNsu['estado_pago']): ParticipanteEstatus {
  if (status === 'VALIDADO') return 'validado';
  if (status === 'RECHAZADO') return 'rechazado';
  return 'pendiente';
}

function statusColor(status: ParticipanteEstatus) {
  return {
    pendiente: 'orange',
    validado: 'positive',
    rechazado: 'negative',
  }[status];
}

function statusLabel(status: ParticipanteEstatus) {
  return {
    pendiente: 'Pendiente',
    validado: 'Validado',
    rechazado: 'Rechazado',
  }[status];
}

function normalizeText(value?: string | null) {
  const text = value ?? '';
  if (!text) return '';
  if (!/[ÃÂÐ]/.test(text)) return text;

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder('utf-8').decode(bytes);

    return decoded.includes('�') ? text : decoded;
  } catch {
    return text;
  }
}

async function load() {
  if (isLoading.value || isSaving.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    registro.value = await getNsuById(registroId.value);
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo cargar el registro NSU.';
  } finally {
    isLoading.value = false;
  }
}

async function setGroupStatus(status: RegistroNsu['estado_pago']) {
  await runAction(async () => {
    registro.value = await updateNsuStatus(registroId.value, status);
  }, 'Estatus grupal actualizado.');
}

async function setParticipantStatus(participanteId: string, status: RegistroNsu['estado_pago']) {
  await runAction(async () => {
    registro.value = await updateNsuParticipantStatus(registroId.value, participanteId, status);
  }, 'Estatus del participante actualizado.');
}

async function deleteParticipant(participanteId: string) {
  if (!window.confirm('¿Eliminar participante de este registro NSU?')) return;

  await runAction(async () => {
    registro.value = await removeNsuParticipant(registroId.value, participanteId);
  }, 'Participante eliminado del registro.');
}

async function runAction(action: () => Promise<void>, successMessage: string) {
  if (isSaving.value || isLoading.value) return;

  isSaving.value = true;

  try {
    await action();
    notify('positive', successMessage);
  } catch (err) {
    console.error(err);
    notify('negative', 'No se pudo completar la acción.');
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  void router.push('/participantes');
}

onMounted(() => {
  void load();
});
</script>

<style scoped>
.registro-nsu-detalle-page {
  min-height: 100%;
}

.summary-card,
.detail-card {
  border-radius: 20px;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn .q-icon) {
  color: #ffffff !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 999px;
  border: 1px solid transparent;
  opacity: 1 !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn .q-btn__content),
.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn .q-icon),
.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn .material-icons),
.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn .material-symbols-outlined) {
  opacity: 1 !important;
  visibility: visible !important;
  font-size: 20px !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-btn.q-btn--disabled) {
  opacity: 0.72 !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .actions-cell) {
  white-space: nowrap;
  overflow: visible !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .actions-cell .q-btn) {
  margin: 0 2px;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-pending) {
  color: #ffffff !important;
  background: #ef6c00 !important;
  border-color: #e65100 !important;
  box-shadow: 0 6px 14px rgba(239, 108, 0, 0.38) !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-valid) {
  color: #ffffff !important;
  background: #1b8f3c !important;
  border-color: #0f6e2b !important;
  box-shadow: 0 6px 14px rgba(27, 143, 60, 0.4) !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-reject) {
  color: #ffffff !important;
  background: #d81b60 !important;
  border-color: #ad1457 !important;
  box-shadow: 0 6px 14px rgba(216, 27, 96, 0.4) !important;
}

.registro-nsu-detalle-page :deep(.dashboard-table .nsu-action-delete) {
  color: #ffffff !important;
  background: #455a64 !important;
  border-color: #37474f !important;
  box-shadow: 0 6px 14px rgba(55, 71, 79, 0.36) !important;
}
</style>
