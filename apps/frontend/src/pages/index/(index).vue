<template>
  <q-page class="hero-page dashboard-home q-pa-md q-pa-lg-lg">
    <section class="welcome-card q-mb-lg">
      <div class="welcome-content">
        <div class="welcome-kicker">Centro de control</div>
        <h1>Panel de administración</h1>
        <p>
          Consulta el estado general de participantes, validaciones y
          actividades del congreso.
        </p>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn
            unelevated
            rounded
            color="primary"
            icon="group_add"
            label="Ver participantes"
            to="/participantes"
          />
          <q-btn
            flat
            rounded
            class="soft-button"
            icon="language"
            label="Página oficial"
            to="/pagina-oficial"
          />
        </div>
      </div>
    </section>

    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-red-1 text-negative q-mb-md"
    >
      {{ errorMessage }}
      <template #action
        ><q-btn flat label="Reintentar" @click="loadDashboard"
      /></template>
    </q-banner>

    <section class="metric-grid q-mb-lg">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="dashboard-panel metric-card"
        :class="metric.tone"
      >
        <div class="metric-icon"><q-icon :name="metric.icon" /></div>
        <div>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-note">{{ metric.note }}</div>
        </div>
      </article>
    </section>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-7">
        <q-card flat class="dashboard-panel chart-card full-height">
          <q-card-section>
            <div class="section-heading">
              <div
                ><span class="eyebrow">Comunidad</span
                ><h2>Participantes por procedencia</h2></div
              >
            </div>
            <div v-if="isLoading" class="q-py-xl"
              ><q-linear-progress indeterminate rounded color="primary"
            /></div>
            <div v-else class="bar-chart">
              <div
                v-for="item in participantBreakdown"
                :key="item.label"
                class="bar-row"
              >
                <div class="bar-meta"
                  ><span>{{ item.label }}</span
                  ><strong>{{ item.value }}</strong></div
                >
                <div class="bar-track"
                  ><div
                    class="bar-fill"
                    :style="{
                      width: `${item.percentage}%`,
                      background: item.color
                    }"
                    ><span></span></div
                ></div>
              </div>
            </div>
            <div class="chart-total"
              >Total de participantes registrados:
              <strong>{{ totalParticipants }}</strong></div
            >
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat class="dashboard-panel validation-card full-height">
          <q-card-section>
            <div class="section-heading"
              ><div
                ><span class="eyebrow">Pagos</span
                ><h2>Estado de validación</h2></div
              ><q-icon name="verified"
            /></div>
            <div class="donut-layout">
              <div class="donut" :style="donutStyle"
                ><div
                  ><strong>{{ validationTotal }}</strong
                  ><span>registros</span></div
                ></div
              >
              <div class="legend">
                <div v-for="item in validationBreakdown" :key="item.label"
                  ><span
                    class="legend-dot"
                    :style="{ background: item.color }"
                  ></span
                  ><span>{{ item.label }}</span
                  ><strong>{{ item.value }}</strong></div
                >
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-lg-7">
        <q-card flat class="dashboard-panel activity-card full-height">
          <q-card-section>
            <div class="section-heading"
              ><div
                ><span class="eyebrow">Agenda</span
                ><h2>Próximas actividades</h2></div
              ><q-btn
                flat
                round
                icon="calendar_month"
                color="primary"
                to="/pagina-oficial"
            /></div>
            <div v-if="upcomingActivities.length" class="activity-list">
              <div
                v-for="activity in upcomingActivities"
                :key="`${activity.type}-${activity.id}`"
                class="activity-item"
              >
                <div class="date-bubble"
                  ><strong>{{ activity.day }}</strong
                  ><span>{{ activity.month }}</span></div
                >
                <div class="activity-copy"
                  ><q-badge
                    rounded
                    :color="
                      activity.type === 'Conferencia' ? 'pink-5' : 'purple-4'
                    "
                    >{{ activity.type }}</q-badge
                  ><strong>{{ activity.title }}</strong
                  ><span
                    ><q-icon name="schedule" /> {{ activity.time }} ·
                    {{ activity.place }}</span
                  ></div
                >
              </div>
            </div>
            <div v-else class="empty-state"
              ><q-icon name="event_available" /><strong
                >Agenda sin actividades próximas</strong
              ><span>No hay actividades próximas registradas.</span></div
            >
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat class="dashboard-panel quick-card full-height">
          <q-card-section>
            <div class="section-heading"
              ><div
                ><span class="eyebrow">Accesos directos</span
                ><h2>Gestión del congreso</h2></div
              ><q-icon name="bolt"
            /></div>
            <div class="quick-grid">
              <router-link
                v-for="action in quickActions"
                :key="action.label"
                :to="action.to"
                class="quick-action"
              >
                <span :style="{ background: action.color }"
                  ><q-icon :name="action.icon"
                /></span>
                <div
                  ><strong>{{ action.label }}</strong
                  ><small>{{ action.caption }}</small></div
                ><q-icon name="chevron_right" />
              </router-link>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useParticipantesAdmin } from "../../composables/useParticipantesAdmin";
import { useConferenciasQuery } from "../../composables/useConferenciasQuery";
import { useTalleresQuery } from "../../composables/useTalleresQuery";

const participantQuery = useParticipantesAdmin();
const conferenceQuery = useConferenciasQuery();
const workshopQuery = useTalleresQuery();

const { ems, utvm, nsu, externos } = participantQuery;
const isLoading = computed(
  () =>
    participantQuery.isRefreshing.value ||
    conferenceQuery.isRefreshing.value ||
    workshopQuery.isRefreshing.value
);
const errorMessage = computed(
  () =>
    participantQuery.error.value ||
    conferenceQuery.error.value ||
    workshopQuery.error.value
);

const nsuPeople = computed(() =>
  nsu.value.reduce(
    (sum, record) =>
      sum + (record.participantes?.length ?? record.total_participantes ?? 0),
    0
  )
);
const totalParticipants = computed(
  () =>
    ems.value.length +
    utvm.value.length +
    nsuPeople.value +
    externos.value.length
);
const maxParticipants = computed(() =>
  Math.max(
    ems.value.length,
    utvm.value.length,
    nsuPeople.value,
    externos.value.length,
    1
  )
);

const participantBreakdown = computed(() =>
  [
    {
      label: "EMS",
      value: ems.value.length,
      color: "linear-gradient(90deg, #ff83b7, #ffb8d5)"
    },
    {
      label: "UTVM",
      value: utvm.value.length,
      color: "linear-gradient(90deg, #42d6a4, #9ae8cb)"
    },
    {
      label: "NSU",
      value: nsuPeople.value,
      color: "linear-gradient(90deg, #a98bff, #d1c2ff)"
    },
    {
      label: "Externos",
      value: externos.value.length,
      color: "linear-gradient(90deg, #55baf7, #a9dcff)"
    }
  ].map(item => ({
    ...item,
    percentage: item.value
      ? Math.max((item.value / maxParticipants.value) * 100, 7)
      : 0
  }))
);

const paymentStatuses = computed(() => [
  ...nsu.value.map(item => item.estado_pago),
  ...externos.value.map(item => item.status)
]);
const countStatus = (...values: string[]) =>
  paymentStatuses.value.filter(status => values.includes(status)).length;
const validationBreakdown = computed(() => [
  {
    label: "Validados",
    value: countStatus("VALIDADO", "validado", "aprobado"),
    color: "#58d6aa"
  },
  {
    label: "Pendientes",
    value: countStatus("PENDIENTE", "pendiente", "pendiente_verificacion"),
    color: "#ffc76b"
  },
  {
    label: "Rechazados",
    value: countStatus("RECHAZADO", "rechazado"),
    color: "#ff7fa8"
  }
]);
const validationTotal = computed(() =>
  validationBreakdown.value.reduce((sum, item) => sum + item.value, 0)
);
const donutStyle = computed(() => {
  const total = validationTotal.value || 1;
  const valid = (validationBreakdown.value[0]!.value / total) * 100;
  const pending = valid + (validationBreakdown.value[1]!.value / total) * 100;
  return {
    background: `conic-gradient(#58d6aa 0 ${valid}%, #ffc76b ${valid}% ${pending}%, #ff7fa8 ${pending}% 100%)`
  };
});

const metrics = computed(() => [
  {
    label: "Participantes",
    value: totalParticipants.value,
    note: "registrados en total",
    icon: "groups",
    tone: "pink"
  },
  {
    label: "Por validar",
    value: validationBreakdown.value[1]!.value,
    note: "pendientes de revisión",
    icon: "hourglass_top",
    tone: "yellow"
  },
  {
    label: "Conferencias",
    value: conferenceQuery.data.value.length,
    note: "actividades registradas",
    icon: "record_voice_over",
    tone: "purple"
  },
  {
    label: "Talleres",
    value: workshopQuery.data.value.length,
    note: "actividades registradas",
    icon: "palette",
    tone: "mint"
  }
]);

const formatActivity = (
  item: {
    id: string;
    titulo: string;
    fecha: string;
    hora_inicio: string;
    ubicacion?: { nombre: string } | null;
  },
  type: "Conferencia" | "Taller"
) => {
  const date = new Date(`${item.fecha}T00:00:00`);
  return {
    id: item.id,
    type,
    title: item.titulo,
    rawDate: item.fecha,
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("es-MX", { month: "short" })
      .format(date)
      .replace(".", ""),
    time: item.hora_inicio.slice(0, 5),
    place: item.ubicacion?.nombre ?? "Por definir"
  };
};
const upcomingActivities = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    ...conferenceQuery.data.value.map(item =>
      formatActivity(item, "Conferencia")
    ),
    ...workshopQuery.data.value.map(item => formatActivity(item, "Taller"))
  ]
    .filter(item => item.rawDate >= today)
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .slice(0, 4);
});

const quickActions = [
  {
    label: "Nueva conferencia",
    caption: "Registrar actividad",
    icon: "mic",
    color: "#ff9bc2",
    to: "/conferencias/nueva"
  },
  {
    label: "Nuevo taller",
    caption: "Registrar actividad",
    icon: "brush",
    color: "#b69cff",
    to: "/talleres/nuevo"
  },
  {
    label: "Ponentes y panelistas",
    caption: "Gestionar perfiles",
    icon: "stars",
    color: "#68dcb4",
    to: "/ponentes"
  },
  {
    label: "Reconocimientos",
    caption: "Administrar documentos",
    icon: "workspace_premium",
    color: "#ffc86e",
    to: "/reconocimientos"
  }
];

const loadDashboard = async () => {
  await Promise.all([
    participantQuery.load(),
    conferenceQuery.load(),
    workshopQuery.load()
  ]);
};

onMounted(() => void loadDashboard());
</script>

<style scoped>
.dashboard-home {
  color: var(--text-main);
}
.welcome-card {
  position: relative;
  overflow: hidden;
  min-height: 230px;
  padding: 34px 38px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(
    125deg,
    rgba(255, 139, 184, 0.23),
    rgba(170, 139, 255, 0.2) 48%,
    rgba(80, 220, 174, 0.18)
  );
  border: 1px solid rgba(255, 165, 204, 0.3);
  box-shadow: 0 18px 55px rgba(18, 8, 35, 0.16);
}
.welcome-card::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -50px;
  top: -85px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.22),
    transparent 68%
  );
}
.welcome-content {
  position: relative;
  z-index: 2;
  max-width: 680px;
}
.welcome-kicker,
.eyebrow {
  color: #ff87b5;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.welcome-content h1 {
  margin: 6px 0;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.1;
}
.welcome-content p {
  max-width: 610px;
  margin: 12px 0 0;
  color: var(--text-soft);
  font-size: 16px;
}
.soft-button {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.08);
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.dashboard-panel {
  border-radius: 22px;
  color: var(--text-main);
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid var(--surface-border);
  box-shadow: 0 12px 35px rgba(4, 20, 17, 0.12);
}
.metric-card {
  min-height: 126px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 17px;
  position: relative;
  overflow: hidden;
}
.metric-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 27px;
}
.metric-card.pink .metric-icon {
  background: #ff9bc233;
  color: #ff79ad;
}
.metric-card.yellow .metric-icon {
  background: #ffc86e33;
  color: #e7a52d;
}
.metric-card.purple .metric-icon {
  background: #b69cff33;
  color: #9b79ff;
}
.metric-card.mint .metric-icon {
  background: #68dcb433;
  color: #42c99a;
}
.metric-value {
  font-size: 30px;
  font-weight: 850;
  line-height: 1;
}
.metric-label {
  font-weight: 750;
  margin-top: 5px;
}
.metric-note {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}
.chart-card,
.validation-card,
.activity-card,
.quick-card {
  padding: 8px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.section-heading h2 {
  font-size: 20px;
  margin: 3px 0 0;
}
.tiny-deco,
.section-heading > span,
.section-heading > .q-icon {
  font-size: 26px;
  color: #ff91ba;
}
.bar-chart {
  display: grid;
  gap: 18px;
}
.bar-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: var(--text-soft);
}
.bar-track {
  height: 15px;
  border-radius: 99px;
  background: var(--surface-strong);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.7s ease;
  position: relative;
}
.bar-fill span {
  position: absolute;
  right: 4px;
  top: 3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff9;
}
.chart-total {
  margin-top: 24px;
  padding: 12px 15px;
  border-radius: 14px;
  text-align: center;
  color: var(--text-soft);
  background: var(--surface-strong);
}
.donut-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  min-height: 235px;
}
.donut {
  width: 165px;
  height: 165px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
}
.donut::after {
  content: "";
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background: var(--surface);
}
.donut > div {
  position: relative;
  z-index: 1;
  text-align: center;
}
.donut strong {
  display: block;
  font-size: 30px;
}
.donut span {
  font-size: 12px;
  color: var(--text-muted);
}
.legend {
  display: grid;
  gap: 14px;
  min-width: 140px;
}
.legend > div {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 8px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.activity-list {
  display: grid;
  gap: 10px;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 17px;
  background: var(--surface-strong);
  transition: transform 0.2s;
}
.activity-item:hover {
  transform: translateX(4px);
}
.date-bubble {
  width: 54px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(145deg, #ff8fba, #b291ff);
  color: white;
  display: grid;
  place-content: center;
  text-align: center;
  flex: none;
}
.date-bubble strong {
  font-size: 20px;
  line-height: 1;
}
.date-bubble span {
  text-transform: uppercase;
  font-size: 10px;
}
.activity-copy {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}
.activity-copy > strong {
  width: calc(100% - 90px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.activity-copy > span {
  width: 100%;
  font-size: 12px;
  color: var(--text-muted);
}
.empty-state {
  min-height: 210px;
  display: grid;
  place-content: center;
  text-align: center;
  color: var(--text-muted);
}
.empty-state div {
  font-size: 38px;
}
.empty-state strong {
  color: var(--text-soft);
  font-size: 16px;
}
.quick-grid {
  display: grid;
  gap: 10px;
}
.quick-action {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-main);
  background: var(--surface-strong);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
}
.quick-action > span {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 21px;
}
.quick-action strong,
.quick-action small {
  display: block;
}
.quick-action small {
  color: var(--text-muted);
  margin-top: 2px;
}
@media (max-width: 1023px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 650px) {
  .dashboard-home {
    padding: 14px;
  }
  .welcome-card {
    padding: 27px 22px;
    min-height: 300px;
    align-items: flex-start;
  }
  .welcome-content p {
    max-width: 85%;
  }
  .metric-grid {
    grid-template-columns: 1fr;
  }
  .donut-layout {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
