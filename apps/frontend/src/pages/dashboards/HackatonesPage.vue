<template>
  <q-page class="hero-page hackaton-page">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Hackatón</div>
        <div class="text-subtitle2 text-grey-7">
          Equipos, evaluadores, resultados y reconocimientos por lote.
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Nuevo Hackatón"
        :disable="busy"
        @click="newHackathon"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card class="dashboard-card hackaton-sidebar">
          <q-card-section>
            <div class="text-h6">Hackatones</div>
            <div class="text-caption text-secondary">
              Selecciona un registro para administrarlo.
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator class="admin-list">
            <q-item
              v-for="item in items"
              :key="item.id"
              clickable
              :active="current?.id === item.id"
              active-class="hackaton-item-active"
              :disable="busy"
              @click="select(item.id)"
            >
              <q-item-section>
                <q-item-label>{{ item.nombre }}</q-item-label>
                <q-item-label caption>{{ item.congreso?.nombre }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
            <q-item v-if="!items.length && !initialLoading">
              <q-item-section class="text-secondary">
                Sin Hackatones registrados.
              </q-item-section>
            </q-item>
          </q-list>
          <q-inner-loading :showing="initialLoading" color="primary" />
        </q-card>
      </div>

      <div class="col-12 col-md-9">
        <q-card class="dashboard-card hackaton-admin-card">
          <q-card-section v-if="editingNew || current">
            <q-tabs
              v-model="tab"
              :dark="!isLight"
              align="left"
              active-color="primary"
              indicator-color="primary"
              outside-arrows
              mobile-arrows
              class="hackaton-tabs"
            >
              <q-tab name="general" label="Datos generales" />
              <q-tab v-if="current" name="evaluators" label="Evaluadores" />
              <q-tab v-if="current" name="teams" label="Equipos" />
              <q-tab v-if="current" name="results" label="Resultados" />
              <q-tab v-if="current" name="downloads" label="ZIP" />
            </q-tabs>
            <q-separator />

            <q-tab-panels
              v-model="tab"
              animated
              :dark="!isLight"
              class="hackaton-panels"
            >
              <q-tab-panel name="general">
                <HackatonGeneralForm
                  :key="current?.id ?? 'new'"
                  ref="generalFormRef"
                  :value="payload"
                  :congresos="congresos"
                  :loading="busy"
                  :persist-draft="editingNew"
                  @save="saveGeneral"
                />
                <div v-if="current" class="row justify-end q-mt-lg">
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    label="Eliminar Hackatón"
                    :disable="busy"
                    @click="removeHackathon"
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="evaluators">
                <HackatonEvaluadoresPanel
                  v-if="current"
                  :key="`evaluators-${current.id}`"
                  ref="evaluatorsPanelRef"
                  :options="evaluatorOptions"
                  :assignments="current.evaluadores"
                  :loading="busy"
                  :downloading="downloadBusy === 'evaluators'"
                  :persistence-key="`hackaton-${current.id}-evaluators`"
                  @save="saveEvaluators"
                  @download="downloadEvaluatorsZip"
                />
              </q-tab-panel>

              <q-tab-panel name="teams">
                <HackatonEquiposPanel
                  v-if="current"
                  :key="`teams-${current.id}`"
                  ref="teamsPanelRef"
                  :teams="current.equipos"
                  :eligible="eligiblePeople"
                  :loading="busy"
                  :persistence-key="`hackaton-${current.id}-new-team`"
                  @save="saveTeam"
                  @remove="removeTeam"
                  @warning="message => notify('warning', message)"
                />
              </q-tab-panel>

              <q-tab-panel name="results">
                <HackatonResultadosPanel
                  :teams="current?.equipos ?? []"
                  :loading="busy"
                  @result="saveResult"
                />
              </q-tab-panel>

              <q-tab-panel name="downloads">
                <HackatonDescargasPanel
                  :teams="current?.equipos ?? []"
                  :downloading="downloadBusy"
                  @download="downloadTeamZip"
                />
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>

          <q-card-section v-else class="empty-admin-state">
            <q-icon name="emoji_events" size="48px" color="primary" />
            <div class="text-h6 q-mt-md">Selecciona un Hackatón</div>
            <div class="text-secondary">
              También puedes crear uno nuevo para comenzar.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import HackatonDescargasPanel from "../../components/hackaton/HackatonDescargasPanel.vue";
import HackatonEquiposPanel from "../../components/hackaton/HackatonEquiposPanel.vue";
import HackatonEvaluadoresPanel from "../../components/hackaton/HackatonEvaluadoresPanel.vue";
import HackatonGeneralForm from "../../components/hackaton/HackatonGeneralForm.vue";
import HackatonResultadosPanel from "../../components/hackaton/HackatonResultadosPanel.vue";
import { useCongresosQuery } from "../../composables/useCongresosQuery";
import { useHackatones } from "../../composables/useHackatones";
import { usePonente } from "../../composables/usePonente";
import { useThemeMode } from "../../composables/useThemeMode";
import type {
  Hackaton,
  HackatonPayload,
  HackatonPersona,
  HackatonResultado
} from "../../types";

type DraftControl = { clearDraft: () => void };
type NotifyType = "positive" | "negative" | "warning";

const $q = useQuasar();
const { isLight } = useThemeMode();
const hackatones = useHackatones();
const { items } = hackatones;
const congresosQuery = useCongresosQuery();
const congresos = congresosQuery.data;
const evaluadoresQuery = usePonente().useGetPonentes(100, 0, "Evaluador");
const evaluatorOptions = evaluadoresQuery.data;
const current = ref<Hackaton | null>(null);
const editingNew = ref(false);
const busy = ref(false);
const initialLoading = ref(false);
const eligibleLoading = ref(false);
const downloadBusy = ref<string | null>(null);
const tab = ref("general");
const eligiblePeople = ref<HackatonPersona[]>([]);
const generalFormRef = ref<DraftControl | null>(null);
const teamsPanelRef = ref<DraftControl | null>(null);
const evaluatorsPanelRef = ref<DraftControl | null>(null);

const empty = (): HackatonPayload => ({
  congreso_id: "",
  nombre: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: ""
});
const payload = ref(empty());

const notify = (type: NotifyType, message: string) => {
  if (typeof $q.notify === "function") {
    $q.notify({
      type,
      message,
      position: "top",
      timeout: 3200,
      multiLine: true,
      progress: true,
      textColor: type === "negative" ? "white" : "black",
      classes: `app-notify app-notify-${type}`
    });
    return;
  }
  console.warn(`[${type}] ${message}`);
};

const errorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" && message.trim() ? message : fallback;
};
const errorNotificationType = (error: unknown): NotifyType => {
  if (!axios.isAxiosError(error)) return "negative";
  return error.response?.status === 400 || error.response?.status === 409
    ? "warning"
    : "negative";
};

const run = async (
  operation: () => Promise<void>,
  success: string,
  fallbackError: string
) => {
  if (busy.value) return false;
  busy.value = true;
  try {
    await operation();
    notify("positive", success);
    return true;
  } catch (error) {
    console.error(error);
    notify(errorNotificationType(error), errorMessage(error, fallbackError));
    return false;
  } finally {
    busy.value = false;
  }
};

const refresh = async (id?: string) => {
  await hackatones.load();
  if (id) current.value = await hackatones.get(id);
};

const select = async (id: string, nextTab = "general") => {
  try {
    current.value = await hackatones.get(id);
    editingNew.value = false;
    payload.value = {
      congreso_id: current.value.congreso.id,
      nombre: current.value.nombre,
      descripcion: current.value.descripcion,
      fecha_inicio: current.value.fecha_inicio,
      fecha_fin: current.value.fecha_fin
    };
    tab.value = nextTab;
    await loadEligible();
  } catch (error) {
    console.error(error);
    notify("negative", errorMessage(error, "No se pudo cargar el Hackatón."));
  }
};

const newHackathon = () => {
  editingNew.value = true;
  current.value = null;
  payload.value = empty();
  tab.value = "general";
};

const saveGeneral = async (value: HackatonPayload) => {
  const wasNew = !current.value;
  let savedId = current.value?.id;
  const succeeded = await run(
    async () => {
      const saved = current.value
        ? await hackatones.update(current.value.id, value)
        : await hackatones.create(value);
      savedId = saved.id;
      if (wasNew) generalFormRef.value?.clearDraft();
      editingNew.value = false;
      await refresh(saved.id);
      current.value = await hackatones.get(saved.id);
      payload.value = { ...value };
    },
    "Hackatón guardado correctamente.",
    "No se pudo guardar el Hackatón."
  );
  if (succeeded && savedId) tab.value = "general";
};

const saveEvaluators = async (ids: string[]) => {
  if (!current.value) return;
  const id = current.value.id;
  await run(
    async () => {
      await hackatones.replaceEvaluators(id, ids);
      evaluatorsPanelRef.value?.clearDraft();
      await select(id, "evaluators");
    },
    "Evaluadores actualizados correctamente.",
    "No se pudieron actualizar los evaluadores."
  );
};

const loadEligible = async () => {
  if (!current.value) return;
  const hackatonId = current.value.id;
  eligibleLoading.value = true;
  try {
    eligiblePeople.value = await hackatones.eligible(hackatonId);
  } catch (error) {
    console.error(error);
    notify(
      errorNotificationType(error),
      errorMessage(error, "No se pudieron cargar los participantes elegibles.")
    );
  } finally {
    eligibleLoading.value = false;
  }
};

const saveTeam = async (
  teamId: string | null,
  value: { nombre: string; participante_ids: string[] }
) => {
  if (!current.value) return;
  const hackatonId = current.value.id;
  await run(
    async () => {
      await hackatones.saveTeam(hackatonId, teamId, value);
      teamsPanelRef.value?.clearDraft();
      await select(hackatonId, "teams");
    },
    "Equipo guardado correctamente.",
    "No se pudo guardar el equipo."
  );
};

const removeTeam = (teamId: string) => {
  if (!current.value) return;
  const hackatonId = current.value.id;
  $q.dialog({
    title: "Eliminar equipo",
    message: "¿Seguro que deseas eliminar este equipo?",
    cancel: true,
    persistent: true
  }).onOk(() => {
    void run(
      async () => {
        await hackatones.deleteTeam(hackatonId, teamId);
        await select(hackatonId, "teams");
      },
      "Equipo eliminado correctamente.",
      "No se pudo eliminar el equipo."
    );
  });
};

const saveResult = async (teamId: string, value: HackatonResultado | null) => {
  if (!current.value) return;
  const hackatonId = current.value.id;
  await run(
    async () => {
      await hackatones.result(hackatonId, teamId, value);
      await select(hackatonId, "results");
    },
    "Resultado actualizado correctamente.",
    "No se pudo actualizar el resultado."
  );
};

const removeHackathon = () => {
  if (!current.value) return;
  const id = current.value.id;
  $q.dialog({
    title: "Eliminar Hackatón",
    message: "¿Seguro que deseas eliminar este Hackatón?",
    cancel: true,
    persistent: true
  }).onOk(() => {
    void run(
      async () => {
        await hackatones.remove(id);
        current.value = null;
        payload.value = empty();
        await hackatones.load();
      },
      "Hackatón eliminado correctamente.",
      "No se pudo eliminar el Hackatón."
    );
  });
};

const downloadEvaluatorsZip = async () => {
  if (!current.value || downloadBusy.value) return;
  const id = current.value.id;
  downloadBusy.value = "evaluators";
  try {
    await hackatones.downloadEvaluators(id);
    notify("positive", "ZIP de evaluadores generado correctamente.");
    await select(id, "evaluators");
  } catch (error) {
    console.error(error);
    notify(
      errorNotificationType(error),
      errorMessage(error, "No se pudo generar el ZIP de evaluadores.")
    );
  } finally {
    downloadBusy.value = null;
  }
};

const downloadTeamZip = async (teamId: string) => {
  if (!current.value || downloadBusy.value) return;
  const hackatonId = current.value.id;
  downloadBusy.value = teamId;
  try {
    await hackatones.downloadTeam(hackatonId, teamId);
    notify("positive", "ZIP de premiación generado correctamente.");
    await select(hackatonId, "downloads");
  } catch (error) {
    console.error(error);
    notify(
      errorNotificationType(error),
      errorMessage(error, "No se pudo generar el ZIP de premiación.")
    );
  } finally {
    downloadBusy.value = null;
  }
};

onMounted(async () => {
  initialLoading.value = true;
  try {
    await Promise.all([
      hackatones.load(),
      congresosQuery.load(),
      evaluadoresQuery.refetch()
    ]);
    const catalogError =
      hackatones.error.value ||
      congresosQuery.error.value ||
      evaluadoresQuery.error.value;
    if (catalogError) notify("negative", catalogError);
    if (items.value[0]) await select(items.value[0].id);
  } catch (error) {
    console.error(error);
    notify("negative", "No se pudo cargar la administración de Hackatón.");
  } finally {
    initialLoading.value = false;
  }
});
</script>
