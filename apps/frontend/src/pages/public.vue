<template>
  <q-layout view="lHh Lpr lFf" class="public-layout">
    <q-header elevated class="public-header">
      <q-toolbar class="public-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="mobile-menu-btn"
          aria-label="Abrir menú"
          @click="menuOpen = true"
        />

        <router-link to="/" class="public-brand">
          <span class="brand-mark">
            <q-icon name="auto_awesome" />
          </span>

          <span class="brand-text">
            Congreso UTVM
          </span>
        </router-link>

        <q-space />

        <nav ref="navRef" class="public-nav desktop-nav">
          <span class="nav-indicator" :style="indicatorStyle"></span>

          <q-btn
            v-for="item in publicLinks"
            :key="item.label"
            :ref="(el) => setNavItemRef(el, item.to)"
            flat
            no-caps
            :to="item.to"
            :label="item.label"
            :icon="item.icon"
            class="nav-btn"
            :class="{
              'nav-btn-active': isActive(item.to),
              'nav-btn-cta': item.variant === 'cta',
              'nav-btn-admin': item.variant === 'admin',
            }"
          />

          <q-btn
            flat
            no-caps
            label="Dudas"
            icon="support_agent"
            class="nav-btn"
            @click="mostrarCentroAyuda = true"
          />

          <q-btn
            v-if="!sesionActiva"
            flat
            no-caps
            to="/login"
            label="Login"
            icon="login"
            class="nav-btn nav-btn-session"
            :class="{
              'nav-btn-active': isActive('/login'),
            }"
          />

          <q-btn
            v-else
            flat
            no-caps
            label="Cerrar sesión"
            icon="logout"
            class="nav-btn nav-btn-session nav-btn-logout"
            @click="pedirConfirmacionCerrarSesion"
          />
        </nav>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="menuOpen"
      side="left"
      overlay
      bordered
      :width="320"
      class="public-drawer"
    >
      <div class="drawer-header">
        <div>
          <div class="drawer-title">Congreso UTVM</div>
          <div class="drawer-subtitle">Menú público</div>
        </div>

        <q-btn
          flat
          dense
          round
          icon="close"
          class="drawer-close"
          aria-label="Cerrar menú"
          @click="menuOpen = false"
        />
      </div>

      <q-list class="drawer-list">
        <q-item
          v-for="item in publicLinks"
          :key="item.label"
          clickable
          v-ripple
          :to="item.to"
          class="drawer-item"
          :class="{
            'drawer-item-active': isActive(item.to),
            'drawer-item-cta': item.variant === 'cta',
            'drawer-item-admin': item.variant === 'admin',
          }"
          @click="menuOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="arrow_forward" />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          class="drawer-item"
          @click="abrirCentroAyuda"
        >
          <q-item-section avatar>
            <q-icon name="support_agent" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Dudas</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="arrow_forward" />
          </q-item-section>
        </q-item>

        <q-item
          v-if="!sesionActiva"
          clickable
          v-ripple
          to="/login"
          class="drawer-item drawer-item-session"
          :class="{
            'drawer-item-active': isActive('/login'),
          }"
          @click="menuOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Login</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="arrow_forward" />
          </q-item-section>
        </q-item>

        <q-item
          v-else
          clickable
          v-ripple
          class="drawer-item drawer-item-session drawer-item-logout"
          @click="pedirConfirmacionCerrarSesion"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Cerrar sesión</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="arrow_forward" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-dialog v-model="confirmLogout" persistent>
      <q-card class="logout-dialog-card">
        <q-card-section class="logout-dialog-header">
          <div class="logout-dialog-icon">
            <q-icon name="logout" />
          </div>

          <div>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Seguro que quieres cerrar tu sesión actual?</p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="logout-dialog-actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="logout-cancel-btn"
            @click="confirmLogout = false"
          />

          <q-btn
            unelevated
            no-caps
            label="Sí, cerrar sesión"
            icon="logout"
            class="logout-confirm-btn"
            @click="cerrarSesion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>

    <CentroAyuda v-model="mostrarCentroAyuda" />
  </q-layout>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ComponentPublicInstance, CSSProperties } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import CentroAyuda from '@/components/centroAyuda.vue';

interface PublicLink {
  label: string;
  to: string;
  icon: string;
  variant?: 'normal' | 'cta' | 'admin';
}

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const menuOpen = ref(false);
const sesionActiva = ref(false);
const confirmLogout = ref(false);
const mostrarCentroAyuda = ref(false);

const navRef = ref<HTMLElement | null>(null);
const navItems = new Map<string, HTMLElement>();

let indicatorFrame = 0;

const indicatorStyle = ref<CSSProperties>({
  width: '0px',
  transform: 'translate3d(0, 0, 0)',
  opacity: '0',
});

const publicLinks: PublicLink[] = [
  {
    label: 'Inicio',
    to: '/',
    icon: 'home',
  },
  {
    label: 'Panelistas',
    to: '/panelistas_u',
    icon: 'groups',
  },
  {
    label: 'Agenda',
    to: '/agenda',
    icon: 'calendar_month',
  },
  {
    label: 'Conferencias',
    to: '/conferencias_u',
    icon: 'mic',
  },
  {
    label: 'Talleres',
    to: '/talleres_u',
    icon: 'construction',
  },
  {
    label: 'Registro Externo',
    to: '/registro-externo',
    icon: 'how_to_reg',
    variant: 'cta',
  },
  {
    label: 'Mi QR',
    to: '/mi-qr',
    icon: 'qr_code_2',
  },
  {
    label: 'Admin',
    to: '/admin/dashboard',
    icon: 'admin_panel_settings',
    variant: 'admin',
  },
  {
    label: 'Registro NSU',
    to: '/registro_nsu',
    icon: 'school',
  },
  {
    label: 'Registro EMS',
    to: '/registro_ems',
    icon: 'groups_2',
  },
  {
    label: 'Registro UTVM',
    to: '/registro_utvm',
    icon: 'account_balance',
  },
];

const handleResize = () => {
  scheduleIndicatorUpdate();
};

onMounted(() => {
  cargarSesion();

  void nextTick(() => {
    scheduleIndicatorUpdate();
  });

  window.addEventListener('resize', handleResize, {
    passive: true,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);

  if (indicatorFrame) {
    cancelAnimationFrame(indicatorFrame);
  }
});

watch(
  () => route.path,
  async () => {
    cargarSesion();
    await nextTick();
    scheduleIndicatorUpdate();
  },
);

function cargarSesion() {
  const participanteGuardado = localStorage.getItem('participante');
  const tipoGuardado = localStorage.getItem('tipoParticipante');

  sesionActiva.value = Boolean(participanteGuardado && tipoGuardado);
}

function abrirCentroAyuda() {
  menuOpen.value = false;
  mostrarCentroAyuda.value = true;
}

function pedirConfirmacionCerrarSesion() {
  menuOpen.value = false;
  confirmLogout.value = true;
}

async function cerrarSesion() {
  localStorage.removeItem('participante');
  localStorage.removeItem('tipoParticipante');
  localStorage.removeItem('correoParticipante');

  sesionActiva.value = false;
  menuOpen.value = false;
  confirmLogout.value = false;

  $q.notify({
    type: 'positive',
    message: 'Sesión cerrada correctamente.',
    position: 'top',
  });

  await router.push('/');
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/';
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}

function setNavItemRef(
  el: Element | ComponentPublicInstance | null,
  path: string,
) {
  if (!el) {
    navItems.delete(path);
    return;
  }

  const element = '$el' in el ? (el.$el as HTMLElement) : (el as HTMLElement);
  navItems.set(path, element);
}

function getActivePath() {
  return publicLinks.find((item) => isActive(item.to))?.to || '/';
}

function scheduleIndicatorUpdate() {
  if (indicatorFrame) {
    cancelAnimationFrame(indicatorFrame);
  }

  indicatorFrame = requestAnimationFrame(() => {
    updateIndicator();
  });
}

function updateIndicator() {
  const nav = navRef.value;
  const activePath = getActivePath();
  const activeItem = navItems.get(activePath);

  if (!nav || !activeItem) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();

  const width = Math.max(itemRect.width * 0.68, 42);
  const left = itemRect.left - navRect.left + itemRect.width / 2 - width / 2;

  indicatorStyle.value = {
    width: `${width}px`,
    transform: `translate3d(${left}px, 0, 0)`,
    opacity: '1',
  };
}
</script>

<style lang="scss" scoped>
@import "@/css/public.scss";
</style>
