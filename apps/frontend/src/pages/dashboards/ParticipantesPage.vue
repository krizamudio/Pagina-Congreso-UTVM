<template>
  <q-page class="hero-page q-pa-md participantes-page">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Participantes</div>
        <div class="text-subtitle2 text-grey-7">
          Administración de registros EMS, UTVM, NSU y Externos.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="text-caption text-grey-7">{{ metric.label }}</div>
            <div class="text-h5 text-weight-bold">{{ metric.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">
      {{ error }}
    </q-banner>

    <q-card flat bordered class="admin-card">
      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="ems" icon="groups" label="EMS" />
        <q-tab name="utvm" icon="account_balance" label="UTVM" />
        <q-tab name="nsu" icon="school" label="NSU" />
        <q-tab name="externos" icon="how_to_reg" label="Externos" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="ems">
          <div class="row justify-between items-center q-mb-md">
            <div>
              <div class="text-h6">Participantes EMS</div>
              <div class="text-caption text-grey-7"
                >CRUD sin comprobante de pago.</div
              >
            </div>
            <q-btn
              label="Nuevo EMS"
              icon="add"
              color="primary"
              unelevated
              @click="goToEmsRegistro"
            />
          </div>

          <q-table
            class="dashboard-table"
            :rows="ems"
            :columns="emsColumns"
            row-key="id"
            flat
            bordered
            :loading="isRefreshing"
          >
            <template #body-cell-acciones="props">
              <q-td align="center">
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  color="primary"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  @click="openEmsDialog(props.row)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="qr_code_2"
                  color="positive"
                  title="Enviar QR"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="qrSendingKey === `EMS:${props.row.id}`"
                  @click="sendAutomaticQr('EMS', props.row.id)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="actionKey === `EMS:delete:${props.row.id}`"
                  @click="deleteEms(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="utvm">
          <div class="row justify-between items-center q-mb-md">
            <div>
              <div class="text-h6">Participantes UTVM</div>
              <div class="text-caption text-grey-7"
                >CRUD sin comprobante de pago.</div
              >
            </div>
            <q-btn
              label="Nuevo UTVM"
              icon="add"
              color="primary"
              unelevated
              @click="goToUtvmRegistro"
            />
          </div>

          <q-table
            class="dashboard-table"
            :rows="utvm"
            :columns="utvmColumns"
            row-key="id"
            flat
            bordered
            :loading="isRefreshing"
          >
            <template #body-cell-acciones="props">
              <q-td align="center">
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  color="primary"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  @click="openUtvmDialog(props.row)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="qr_code_2"
                  color="positive"
                  title="Enviar QR"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="qrSendingKey === `UTVM:${props.row.id}`"
                  @click="sendAutomaticQr('UTVM', props.row.id)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="actionKey === `UTVM:delete:${props.row.id}`"
                  @click="deleteUtvm(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="nsu">
          <div class="row justify-between items-center q-mb-md">
            <div>
              <div class="text-h6">Registros NSU</div>
              <div class="text-caption text-grey-7"
                >Con comprobante, participantes agrupados y estatus de
                pago.</div
              >
            </div>
            <q-btn
              label="Nuevo NSU"
              icon="add"
              color="primary"
              unelevated
              @click="goToNsuRegistro"
            />
          </div>

          <q-table
            class="dashboard-table"
            :rows="nsu"
            :columns="nsuColumns"
            row-key="id"
            flat
            bordered
            :loading="isRefreshing"
          >
            <template #body-cell-estado_pago="props">
              <q-td align="center">
                <q-badge
                  :color="statusColor(mapNsuStatus(props.row.estado_pago))"
                >
                  {{ statusLabel(mapNsuStatus(props.row.estado_pago)) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-comprobante="props">
              <q-td class="row items-center no-wrap q-gutter-xs">
                {{
                  normalizeText(props.row.comprobante?.nombre_original) ||
                  "Sin comprobante"
                }}
                <q-btn
                  v-if="props.row.comprobante"
                  dense
                  flat
                  round
                  icon="open_in_new"
                  color="primary"
                  title="Ver comprobante"
                  @click="abrirComprobante(props.row.comprobante.id)"
                />
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td align="center" class="actions-cell">
                <q-btn
                  dense
                  flat
                  round
                  icon="visibility"
                  color="primary"
                  :disable="isRefreshing || saving"
                  @click="goToNsuDetail(props.row.id)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="check_circle"
                  color="positive"
                  :disable="isRefreshing || saving"
                  :loading="actionKey === `NSU:VALIDADO:${props.row.id}`"
                  @click="setNsuStatus(props.row.id, 'VALIDADO')"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="cancel"
                  color="negative"
                  :disable="isRefreshing || saving"
                  :loading="actionKey === `NSU:RECHAZADO:${props.row.id}`"
                  @click="setNsuStatus(props.row.id, 'RECHAZADO')"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  :disable="isRefreshing || saving"
                  :loading="actionKey === `NSU:delete:${props.row.id}`"
                  @click="deleteNsu(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="externos">
          <div class="row justify-between items-center q-mb-md">
            <div>
              <div class="text-h6">Participantes Externos</div>
              <div class="text-caption text-grey-7"
                >Con comprobante individual y control de estatus.</div
              >
            </div>
            <q-btn
              label="Nuevo externo"
              icon="add"
              color="primary"
              unelevated
              @click="goToExternoRegistro"
            />
          </div>

          <q-table
            class="dashboard-table"
            :rows="externos"
            :columns="externosColumns"
            row-key="id"
            flat
            bordered
            :loading="isRefreshing"
          >
            <template #body-cell-status="props">
              <q-td align="center">
                <q-badge
                  :color="statusColor(mapExternoStatus(props.row.status))"
                >
                  {{ statusLabel(mapExternoStatus(props.row.status)) }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-comprobante="props">
              <q-td class="row items-center no-wrap q-gutter-xs">
                {{
                  normalizeText(props.row.comprobante?.nombre_original) ||
                  "Sin comprobante"
                }}
                <q-btn
                  v-if="props.row.comprobante"
                  dense
                  flat
                  round
                  icon="open_in_new"
                  color="primary"
                  title="Ver comprobante"
                  @click="abrirComprobante(props.row.comprobante.id)"
                />
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td align="center">
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  color="primary"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  @click="openExternoDialog(props.row)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="check_circle"
                  color="positive"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="actionKey === `EXTERNO:validado:${props.row.id}`"
                  @click="setExternoStatus(props.row.id, 'validado')"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="cancel"
                  color="warning"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="actionKey === `EXTERNO:rechazado:${props.row.id}`"
                  @click="setExternoStatus(props.row.id, 'rechazado')"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="qr_code_2"
                  color="positive"
                  title="Enviar QR"
                  :disable="
                    saving ||
                    isRefreshing ||
                    qrSendingKey !== null ||
                    !props.row.correoVerificado ||
                    props.row.status !== 'validado'
                  "
                  :loading="qrSendingKey === `EXTERNO:${props.row.id}`"
                  @click="sendAutomaticQr('EXTERNO', props.row.id)"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  :disable="saving || isRefreshing || qrSendingKey !== null"
                  :loading="actionKey === `EXTERNO:delete:${props.row.id}`"
                  @click="deleteExterno(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="emsDialogOpen">
      <q-card class="form-dialog">
        <q-card-section>
          <div class="text-h6">{{
            editingEmsId ? "Editar EMS" : "Nuevo EMS"
          }}</div>
        </q-card-section>
        <q-card-section>
          <q-form class="row q-col-gutter-md" @submit.prevent="saveEms">
            <q-input
              v-model="emsForm.nombres"
              class="col-12 col-md-6"
              label="Nombres"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="emsForm.apellidoPaterno"
              class="col-12 col-md-6"
              label="Apellido paterno"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="emsForm.apellidoMaterno"
              class="col-12 col-md-6"
              label="Apellido materno"
              dense
            />
            <q-input
              v-model="emsForm.correo"
              class="col-12 col-md-6"
              label="Correo"
              type="email"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="emsForm.institucion"
              class="col-12 col-md-6"
              label="Institución"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="emsForm.carrera"
              class="col-12 col-md-6"
              label="Carrera"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="emsForm.telefono"
              class="col-12 col-md-6"
              label="Teléfono"
              mask="###############"
              :rules="[requiredRule]"
              dense
            />
            <div class="col-12 row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" :disable="saving" v-close-popup />
              <q-btn
                color="primary"
                label="Guardar"
                type="submit"
                :loading="saving"
                :disable="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="utvmDialogOpen">
      <q-card class="form-dialog">
        <q-card-section>
          <div class="text-h6">{{
            editingUtvmId ? "Editar UTVM" : "Nuevo UTVM"
          }}</div>
        </q-card-section>
        <q-card-section>
          <q-form class="row q-col-gutter-md" @submit.prevent="saveUtvm">
            <q-input
              v-model="utvmForm.nombres"
              class="col-12 col-md-6"
              label="Nombres"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="utvmForm.apellidoPaterno"
              class="col-12 col-md-6"
              label="Apellido paterno"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="utvmForm.apellidoMaterno"
              class="col-12 col-md-6"
              label="Apellido materno"
              dense
            />
            <q-input
              v-model="utvmForm.correo"
              class="col-12 col-md-6"
              label="Correo"
              type="email"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model.number="utvmForm.cuatrimestre"
              class="col-12 col-md-4"
              label="Cuatrimestre"
              type="number"
              min="1"
              max="11"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="utvmForm.grupo"
              class="col-12 col-md-4"
              label="Grupo"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="utvmForm.telefono"
              class="col-12 col-md-4"
              label="Teléfono"
              mask="###############"
              :rules="[requiredRule]"
              dense
            />
            <div class="col-12 row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" :disable="saving" v-close-popup />
              <q-btn
                color="primary"
                label="Guardar"
                type="submit"
                :loading="saving"
                :disable="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="externoDialogOpen">
      <q-card class="form-dialog">
        <q-card-section>
          <div class="text-h6">{{
            editingExternoId ? "Editar externo" : "Nuevo externo"
          }}</div>
        </q-card-section>
        <q-card-section>
          <q-form class="row q-col-gutter-md" @submit.prevent="saveExterno">
            <q-input
              v-model="externoForm.nombre"
              class="col-12 col-md-6"
              label="Nombre"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="externoForm.apellidoPaterno"
              class="col-12 col-md-6"
              label="Apellido paterno"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="externoForm.apellidoMaterno"
              class="col-12 col-md-6"
              label="Apellido materno"
              dense
            />
            <q-input
              v-model="externoForm.correo"
              class="col-12 col-md-6"
              label="Correo"
              type="email"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="externoForm.telefono"
              class="col-12 col-md-6"
              label="Teléfono"
              mask="###############"
              :rules="[requiredRule]"
              dense
            />
            <q-input
              v-model="externoForm.institucion"
              class="col-12 col-md-6"
              label="Institución"
              dense
            />
            <q-select
              v-model="externoForm.dias"
              class="col-12 col-md-6"
              :options="diasOptions"
              label="Días"
              multiple
              emit-value
              map-options
              dense
            />
            <q-input
              v-model.number="externoForm.total"
              class="col-12 col-md-3"
              label="Total"
              type="number"
              min="0"
              dense
            />
            <q-select
              v-model="externoForm.status"
              class="col-12 col-md-3"
              :options="externoStatusOptions"
              label="Estatus"
              emit-value
              map-options
              dense
            />
            <q-file
              v-if="!editingExternoId"
              v-model="externoComprobante"
              class="col-12"
              label="Comprobante"
              accept=".pdf,.jpg,.jpeg,.png"
              dense
            />
            <div class="col-12 row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" :disable="saving" v-close-popup />
              <q-btn
                color="primary"
                label="Guardar"
                type="submit"
                :loading="saving"
                :disable="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useQuasar, type QTableColumn } from "quasar";
import { useRouter } from "vue-router";
import { api } from "../../services/api";
import { abrirComprobante } from "../../services/comprobanteService";
import { getQrApiError, qrAccessService } from "../../services/qrAccessService";
import { useDeleteConfirmation } from "../../composables/useDeleteConfirmation";
import { useParticipantesAdmin } from "../../composables/useParticipantesAdmin";
import type { QrParticipantType } from "../../types/qr-access";
import type {
  ParticipanteEms,
  ParticipanteEmsPayload,
  ParticipanteEstatus,
  ParticipanteExterno,
  ParticipanteExternoPayload,
  ParticipanteUtvm,
  ParticipanteUtvmPayload,
  RegistroNsu
} from "../../types";

const $q = useQuasar();
const { confirmDelete } = useDeleteConfirmation();
const router = useRouter();
const tab = ref("ems");
const saving = ref(false);
const emsDialogOpen = ref(false);
const utvmDialogOpen = ref(false);
const externoDialogOpen = ref(false);
const editingEmsId = ref<number | null>(null);
const editingUtvmId = ref<number | null>(null);
const editingExternoId = ref<string | null>(null);
const externoComprobante = ref<File | null>(null);
const qrSendingKey = ref<string | null>(null);
const actionKey = ref<string | null>(null);

const {
  ems,
  utvm,
  nsu,
  externos,
  isRefreshing,
  error,
  load,
  createEms,
  updateEms,
  removeEms,
  createUtvm,
  updateUtvm,
  removeUtvm,
  updateNsuStatus,
  removeNsu,
  updateExterno,
  updateExternoStatus,
  removeExterno
} = useParticipantesAdmin();

const emptyEmsForm = (): ParticipanteEmsPayload => ({
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  institucion: "",
  carrera: "",
  telefono: ""
});

const emptyUtvmForm = (): ParticipanteUtvmPayload => ({
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  cuatrimestre: 1,
  grupo: "",
  telefono: ""
});

const emptyExternoForm = (): ParticipanteExternoPayload => ({
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  telefono: "",
  institucion: "",
  dias: [],
  total: 0,
  correoVerificado: true,
  status: "pendiente"
});

const emsForm = reactive<ParticipanteEmsPayload>(emptyEmsForm());
const utvmForm = reactive<ParticipanteUtvmPayload>(emptyUtvmForm());
const externoForm = reactive<ParticipanteExternoPayload>(emptyExternoForm());

const diasOptions = [
  { label: "Día 1", value: "dia_1" },
  { label: "Día 2", value: "dia_2" },
  { label: "Día 3", value: "dia_3" }
];

const externoStatusOptions = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Validado", value: "validado" },
  { label: "Rechazado", value: "rechazado" },
  { label: "Pendiente de verificación", value: "pendiente_verificacion" }
];

const emsColumns: QTableColumn[] = [
  {
    name: "nombres",
    label: "Nombres",
    field: "nombres",
    align: "left",
    sortable: true
  },
  {
    name: "apellidoPaterno",
    label: "Apellido paterno",
    field: "apellidoPaterno",
    align: "left",
    sortable: true
  },
  { name: "correo", label: "Correo", field: "correo", align: "left" },
  {
    name: "institucion",
    label: "Institución",
    field: "institucion",
    align: "left"
  },
  { name: "carrera", label: "Carrera", field: "carrera", align: "left" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" }
];

const utvmColumns: QTableColumn[] = [
  {
    name: "nombres",
    label: "Nombres",
    field: "nombres",
    align: "left",
    sortable: true
  },
  {
    name: "apellidoPaterno",
    label: "Apellido paterno",
    field: "apellidoPaterno",
    align: "left",
    sortable: true
  },
  { name: "correo", label: "Correo", field: "correo", align: "left" },
  {
    name: "cuatrimestre",
    label: "Cuatrimestre",
    field: "cuatrimestre",
    align: "center",
    sortable: true
  },
  { name: "grupo", label: "Grupo", field: "grupo", align: "center" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" }
];

const nsuColumns: QTableColumn[] = [
  {
    name: "created_at",
    label: "Fecha",
    field: (row: RegistroNsu) => formatDate(row.created_at),
    align: "left",
    sortable: true
  },
  {
    name: "total_participantes",
    label: "Participantes",
    field: "total_participantes",
    align: "center",
    sortable: true
  },
  {
    name: "total_general",
    label: "Total",
    field: (row: RegistroNsu) => money(row.total_general),
    align: "right"
  },
  {
    name: "estado_pago",
    label: "Estatus",
    field: "estado_pago",
    align: "center"
  },
  {
    name: "comprobante",
    label: "Voucher",
    field: "comprobante",
    align: "left"
  },
  {
    name: "acciones",
    label: "Acciones",
    field: "acciones",
    align: "center",
    style: "min-width: 170px; width: 170px;",
    headerStyle: "min-width: 170px; width: 170px;"
  }
];

const externosColumns: QTableColumn[] = [
  {
    name: "nombre",
    label: "Nombre",
    field: (row: ParticipanteExterno) => fullExternoName(row),
    align: "left",
    sortable: true
  },
  { name: "correo", label: "Correo", field: "correo", align: "left" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "left" },
  {
    name: "dias",
    label: "Días",
    field: (row: ParticipanteExterno) => row.dias.join(", "),
    align: "left"
  },
  {
    name: "total",
    label: "Total",
    field: (row: ParticipanteExterno) => money(row.total),
    align: "right"
  },
  { name: "status", label: "Estatus", field: "status", align: "center" },
  {
    name: "comprobante",
    label: "Voucher",
    field: "comprobante",
    align: "left"
  },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" }
];

const metrics = computed(() => {
  const nsuValidaciones = nsu.value.map(registro =>
    mapNsuStatus(registro.estado_pago)
  );
  const externoValidaciones = externos.value.map(externo =>
    mapExternoStatus(externo.status)
  );
  const validaciones = [...nsuValidaciones, ...externoValidaciones];

  return [
    {
      label: "Participantes directos",
      value: ems.value.length + utvm.value.length
    },
    {
      label: "Registros con voucher",
      value: nsu.value.length + externos.value.length
    },
    {
      label: "Pendientes",
      value: validaciones.filter(status => status === "pendiente").length
    },
    {
      label: "Validados",
      value: validaciones.filter(status => status === "validado").length
    }
  ];
});

const requiredRule = (value: unknown) =>
  Boolean(value) || "Este campo es obligatorio";

function notify(type: "positive" | "negative", message: string) {
  $q.notify({ type, message, position: "top", timeout: 2800 });
}

function resetReactive<T extends object>(target: T, source: T) {
  Object.assign(target, source);
}

function money(value: number | string) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN"
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX");
}

function fullExternoName(externo: ParticipanteExterno) {
  return [externo.nombre, externo.apellidoPaterno, externo.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function mapNsuStatus(status: RegistroNsu["estado_pago"]): ParticipanteEstatus {
  if (status === "VALIDADO") return "validado";
  if (status === "RECHAZADO") return "rechazado";
  return "pendiente";
}

function mapExternoStatus(
  status: ParticipanteExterno["status"]
): ParticipanteEstatus {
  if (status === "validado") return "validado";
  if (status === "rechazado") return "rechazado";
  return "pendiente";
}

function statusColor(status: ParticipanteEstatus) {
  return {
    pendiente: "orange",
    validado: "positive",
    rechazado: "negative"
  }[status];
}

function statusLabel(status: ParticipanteEstatus) {
  return {
    pendiente: "Pendiente",
    validado: "Validado",
    rechazado: "Rechazado"
  }[status];
}

function normalizeText(value?: string | null) {
  const text = value ?? "";
  if (!text) return "";
  if (!/[ÃÂÐ]/.test(text)) return text;

  try {
    const bytes = Uint8Array.from(text, char => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);

    return decoded.includes("�") ? text : decoded;
  } catch {
    return text;
  }
}

function openEmsDialog(row?: ParticipanteEms) {
  editingEmsId.value = row?.id ?? null;
  resetReactive(emsForm, row ? { ...row } : emptyEmsForm());
  emsDialogOpen.value = true;
}

async function saveEms() {
  if (saving.value) return;

  saving.value = true;
  try {
    if (editingEmsId.value) {
      await updateEms(editingEmsId.value, { ...emsForm });
    } else {
      await createEms({ ...emsForm });
    }
    notify("positive", "Participante EMS guardado correctamente.");
    emsDialogOpen.value = false;
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo guardar el participante EMS.");
  } finally {
    saving.value = false;
  }
}

async function deleteEms(id: number) {
  const confirmed = await confirmDelete({
    title: "Eliminar participante EMS",
    message: "¿Seguro que deseas eliminar este participante EMS?"
  });
  if (!confirmed) return;
  await removeWithReload(
    () => removeEms(id),
    "Participante EMS eliminado.",
    `EMS:delete:${id}`
  );
}

function openUtvmDialog(row?: ParticipanteUtvm) {
  editingUtvmId.value = row?.id ?? null;
  resetReactive(utvmForm, row ? { ...row } : emptyUtvmForm());
  utvmDialogOpen.value = true;
}

async function saveUtvm() {
  if (saving.value) return;

  saving.value = true;
  try {
    if (editingUtvmId.value) {
      await updateUtvm(editingUtvmId.value, { ...utvmForm });
    } else {
      await createUtvm({ ...utvmForm });
    }
    notify("positive", "Participante UTVM guardado correctamente.");
    utvmDialogOpen.value = false;
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo guardar el participante UTVM.");
  } finally {
    saving.value = false;
  }
}

async function deleteUtvm(id: number) {
  const confirmed = await confirmDelete({
    title: "Eliminar participante UTVM",
    message: "¿Seguro que deseas eliminar este participante UTVM?"
  });
  if (!confirmed) return;
  await removeWithReload(
    () => removeUtvm(id),
    "Participante UTVM eliminado.",
    `UTVM:delete:${id}`
  );
}

function openExternoDialog(row?: ParticipanteExterno) {
  editingExternoId.value = row?.id ?? null;
  externoComprobante.value = null;
  resetReactive(
    externoForm,
    row
      ? {
          nombre: row.nombre,
          apellidoPaterno: row.apellidoPaterno,
          apellidoMaterno: row.apellidoMaterno,
          correo: row.correo,
          telefono: row.telefono,
          institucion: row.institucion,
          dias: [...row.dias],
          total: Number(row.total),
          correoVerificado: row.correoVerificado,
          status: row.status
        }
      : emptyExternoForm()
  );
  externoDialogOpen.value = true;
}

async function saveExterno() {
  if (saving.value) return;

  saving.value = true;
  try {
    if (editingExternoId.value) {
      await updateExterno(editingExternoId.value, { ...externoForm });
    } else {
      if (!externoComprobante.value) {
        notify("negative", "El comprobante es obligatorio para externos.");
        return;
      }

      const formData = new FormData();
      formData.append("nombre", externoForm.nombre);
      formData.append("apellidoPaterno", externoForm.apellidoPaterno);
      formData.append("apellidoMaterno", externoForm.apellidoMaterno ?? "");
      formData.append("correo", externoForm.correo);
      formData.append("telefono", externoForm.telefono);
      formData.append("institucion", externoForm.institucion ?? "");
      formData.append("dias", JSON.stringify(externoForm.dias));
      formData.append("total", String(externoForm.total));
      formData.append("comprobante", externoComprobante.value);
      await api.post("externos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    notify("positive", "Participante externo guardado correctamente.");
    externoDialogOpen.value = false;
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo guardar el participante externo.");
  } finally {
    saving.value = false;
  }
}

async function setNsuStatus(id: string, status: RegistroNsu["estado_pago"]) {
  await removeWithReload(
    () => updateNsuStatus(id, status),
    "Estatus NSU actualizado.",
    `NSU:${status}:${id}`
  );
}

async function deleteNsu(id: string) {
  const confirmed = await confirmDelete({
    title: "Eliminar registro NSU",
    message: "¿Seguro que deseas eliminar este registro NSU?"
  });
  if (!confirmed) return;
  await removeWithReload(
    () => removeNsu(id),
    "Registro NSU eliminado.",
    `NSU:delete:${id}`
  );
}

async function setExternoStatus(
  id: string,
  status: ParticipanteExterno["status"]
) {
  await removeWithReload(
    () => updateExternoStatus(id, status),
    "Estatus de externo actualizado.",
    `EXTERNO:${status}:${id}`
  );
}

function goToNsuDetail(id: string) {
  void router.push(`/participantes/nsu/${id}`);
}

function goToEmsRegistro() {
  void router.push("/registro_ems");
}

function goToUtvmRegistro() {
  void router.push("/registro_utvm");
}

function goToNsuRegistro() {
  void router.push("/registro_nsu");
}

function goToExternoRegistro() {
  void router.push("/registro-externo");
}

async function deleteExterno(id: string) {
  const confirmed = await confirmDelete({
    title: "Eliminar participante externo",
    message: "¿Seguro que deseas eliminar este participante externo?"
  });
  if (!confirmed) return;
  await removeWithReload(
    () => removeExterno(id),
    "Participante externo eliminado.",
    `EXTERNO:delete:${id}`
  );
}

async function removeWithReload(
  action: () => Promise<unknown>,
  successMessage: string,
  key: string
) {
  if (isRefreshing.value || saving.value) return;

  saving.value = true;
  actionKey.value = key;

  try {
    await action();
    notify("positive", successMessage);
    await load();
  } catch (err) {
    console.error(err);
    notify("negative", "No se pudo completar la acción.");
  } finally {
    saving.value = false;
    actionKey.value = null;
  }
}

async function sendAutomaticQr(type: QrParticipantType, id: string | number) {
  if (qrSendingKey.value || saving.value || isRefreshing.value) return;
  qrSendingKey.value = `${type}:${id}`;
  try {
    const response = await qrAccessService.sendAutomatic(type, id);
    notify("positive", response.mensaje);
  } catch (err) {
    notify("negative", getQrApiError(err));
  } finally {
    qrSendingKey.value = null;
  }
}

onMounted(() => {
  void load();
});
</script>

<style scoped>
.participantes-page {
  min-height: 100%;
}

.metric-card,
.admin-card {
  border-radius: 20px;
  background: rgba(9, 30, 26, 0.92);
  border: 1px solid rgba(0, 230, 118, 0.18);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(18px);
}

.metric-card :deep(.q-card__section),
.admin-card :deep(.q-card__section),
.admin-card :deep(.q-tab-panel) {
  color: #ffffff;
}

.admin-card :deep(.q-tabs) {
  color: #00e676;
}

.admin-card :deep(.q-tab-panels),
.admin-card :deep(.q-panel),
.admin-card :deep(.q-tab-panel),
.admin-card :deep(.q-separator) {
  background: rgba(7, 30, 27, 0.85) !important;
}

.admin-card :deep(.q-tab-panel) {
  padding: 16px;
}

.admin-card :deep(.dashboard-table .actions-cell) {
  white-space: nowrap;
  overflow: visible !important;
}

.admin-card :deep(.dashboard-table .actions-cell .q-btn) {
  margin: 0 2px;
}

.admin-card :deep(.q-tab .q-icon),
.admin-card :deep(.q-tab__label) {
  color: #ffffff !important;
}

.form-dialog {
  width: min(760px, 92vw);
}

:global(body.theme-light) .participantes-page .metric-card,
:global(body.theme-light) .participantes-page .admin-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(16, 43, 37, 0.14);
  box-shadow: 0 14px 32px rgba(16, 43, 37, 0.08);
}

:global(body.theme-light)
  .participantes-page
  .metric-card
  :deep(.q-card__section),
:global(body.theme-light)
  .participantes-page
  .admin-card
  :deep(.q-card__section),
:global(body.theme-light) .participantes-page .admin-card :deep(.q-tab-panel) {
  color: #173a33 !important;
}

:global(body.theme-light) .participantes-page .admin-card :deep(.q-tabs),
:global(body.theme-light) .participantes-page .admin-card :deep(.q-tab__label),
:global(body.theme-light)
  .participantes-page
  .admin-card
  :deep(.q-tab .q-icon) {
  color: #1f4a42 !important;
}

:global(body.theme-light) .participantes-page .admin-card :deep(.q-separator),
:global(body.theme-light) .participantes-page .admin-card :deep(.q-tab-panels),
:global(body.theme-light) .participantes-page .admin-card :deep(.q-panel),
:global(body.theme-light) .participantes-page .admin-card :deep(.q-tab-panel) {
  background: rgba(242, 250, 247, 0.95) !important;
}

:global(body.theme-light) .participantes-page .admin-card :deep(.text-grey-7),
:global(body.theme-light) .participantes-page .admin-card :deep(.text-caption) {
  color: #5b7570 !important;
}
</style>
