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
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ComponentPublicInstance, CSSProperties } from 'vue';
import { useRoute } from 'vue-router';

interface PublicLink {
  label: string;
  to: string;
  icon: string;
  variant?: 'normal' | 'cta' | 'admin';
}

const route = useRoute();

const menuOpen = ref(false);
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
  {
    label: 'Login',
    to: '/login',
    icon: 'login',
  },
];

const handleResize = () => {
  scheduleIndicatorUpdate();
};

onMounted(() => {
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
    await nextTick();
    scheduleIndicatorUpdate();
  },
);

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

<style scoped>
.public-layout {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(0, 230, 118, 0.08), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(102, 245, 181, 0.06), transparent 28%),
    linear-gradient(135deg, #071e1b 0%, #0b241f 52%, #071e1b 100%);
}

:deep(.q-page-container) {
  min-height: calc(100vh - 64px);
  background: transparent;
}

.public-header {
  height: 64px;
  overflow: visible;
  background: rgba(7, 30, 27, 0.9);
  color: #ffffff;
  border-bottom: 1px solid rgba(102, 245, 181, 0.12);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(18px);
  transform: translateZ(0);
  backface-visibility: hidden;
}

.public-toolbar {
  min-height: 64px;
  height: 64px;
  padding: 0 18px;
  gap: 12px;
  align-items: stretch;
}

.public-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  text-decoration: none;
  min-width: max-content;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #66f5b5;
  background: rgba(102, 245, 181, 0.09);
  border: 1px solid rgba(102, 245, 181, 0.16);
  box-shadow: 0 0 22px rgba(0, 230, 118, 0.08);
}

.brand-mark .q-icon {
  font-size: 22px;
}

.brand-text {
  font-size: 1.18rem;
  font-weight: 900;
  letter-spacing: 0.01em;
}

/* ===============================
   Menú desktop
   =============================== */

.public-nav {
  position: relative;
  height: 64px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 20px;
  contain: layout paint style;
  transform: translateZ(0);
}

/* Línea inferior deslizante */
.nav-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(90deg, #66f5b5 0%, #00e676 100%);
  box-shadow:
    0 0 10px rgba(0, 230, 118, 0.75),
    0 0 22px rgba(102, 245, 181, 0.35),
    0 -4px 18px rgba(0, 230, 118, 0.2);
  transition:
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, width;
  pointer-events: none;
  z-index: 2;
}

.nav-btn,
.nav-btn-cta,
.nav-btn-admin,
.nav-btn-active {
  position: relative;
  z-index: 3;
  height: 64px;
  min-width: auto;
  padding: 0 2px;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  color: rgba(255, 255, 255, 0.72) !important;
  overflow: visible;
  font-weight: 900;
  transition:
    color 0.22s ease,
    filter 0.22s ease;
}

.nav-btn :deep(.q-focus-helper) {
  display: none;
}

.nav-btn :deep(.q-btn__content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1;
  text-align: center;
}

.nav-btn :deep(.q-icon) {
  margin: 0;
  font-size: 24px;
  color: currentColor;
  transition:
    color 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.nav-btn :deep(.block) {
  margin: 0;
  line-height: 1;
  white-space: nowrap;
  font-weight: 900;
}

.nav-btn:hover {
  color: #ffffff !important;
  transform: none;
}

.nav-btn:hover :deep(.q-icon) {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 10px rgba(102, 245, 181, 0.38));
}

.nav-btn-active {
  color: #9cf2c4 !important;
}

.nav-btn-active :deep(.q-icon) {
  color: #66f5b5;
  filter: drop-shadow(0 0 12px rgba(0, 230, 118, 0.55));
}

.nav-btn-cta,
.nav-btn-admin {
  color: rgba(255, 255, 255, 0.82) !important;
}

.nav-btn-cta.nav-btn-active,
.nav-btn-admin.nav-btn-active {
  color: #9cf2c4 !important;
}

/* ===============================
   Botón menú móvil
   =============================== */

.mobile-menu-btn {
  display: none;
  align-self: center;
  width: 44px;
  height: 44px;
  border-radius: 50% !important;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.045) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.mobile-menu-btn :deep(.q-btn__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===============================
   Drawer móvil
   =============================== */

:deep(.public-drawer) {
  background:
    radial-gradient(circle at top left, rgba(0, 230, 118, 0.16), transparent 36%),
    linear-gradient(180deg, #071e1b 0%, #061512 100%) !important;
  color: #ffffff !important;
  border-right: 1px solid rgba(102, 245, 181, 0.18);
  border-left: none;
}

:deep(.q-drawer__backdrop) {
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(3px);
}

.drawer-header {
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 22px 18px;
  border-bottom: 1px solid rgba(102, 245, 181, 0.14);
  background: rgba(255, 255, 255, 0.025);
}

.drawer-title {
  color: #ffffff;
  font-size: 1.18rem;
  font-weight: 900;
}

.drawer-subtitle {
  margin-top: 4px;
  color: #8ca09a;
  font-size: 0.86rem;
  font-weight: 700;
}

.drawer-close {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-list {
  padding: 14px;
}

.drawer-item {
  min-height: 56px;
  margin-bottom: 10px;
  padding: 0 14px;
  border-radius: 18px;
  color: rgba(255, 255, 255, 0.82) !important;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-weight: 850;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    transform 0.22s ease;
}

.drawer-item:hover {
  background: rgba(102, 245, 181, 0.09);
  border-color: rgba(102, 245, 181, 0.18);
  transform: translateX(3px);
}

.drawer-item :deep(.q-item__label) {
  color: inherit;
  font-weight: 900;
}

.drawer-item :deep(.q-icon) {
  color: #66f5b5;
  font-size: 24px;
}

.drawer-item-active {
  color: #9cf2c4 !important;
  background: rgba(102, 245, 181, 0.13);
  border-color: rgba(102, 245, 181, 0.28);
  box-shadow:
    inset 3px 0 0 #00e676,
    0 0 24px rgba(0, 230, 118, 0.08);
}

.drawer-item-cta {
  color: #071e1b !important;
  background: linear-gradient(135deg, #66f5b5 0%, #00e676 100%);
  border-color: transparent;
  box-shadow: 0 14px 28px rgba(0, 230, 118, 0.16);
}

.drawer-item-cta :deep(.q-icon),
.drawer-item-cta :deep(.q-item__label) {
  color: #071e1b !important;
}

.drawer-item-admin {
  border-color: rgba(230, 236, 234, 0.22);
}

.drawer-item :deep(.q-item__section--side .q-icon) {
  opacity: 0.75;
}

/* ===============================
   Responsive
   =============================== */

@media (max-width: 1320px) {
  .public-nav {
    gap: 14px;
  }

  .nav-btn {
    font-size: 0.86rem;
  }

  .nav-btn :deep(.q-icon) {
    font-size: 22px;
  }
}

@media (max-width: 1180px) {
  .desktop-nav {
    display: none;
  }

  .public-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 14px;
    gap: 10px;
  }

  .mobile-menu-btn {
    display: inline-flex;
    order: 1;
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    margin: 0;
  }

  .public-brand {
    order: 2;
    flex: 1;
    min-width: 0;
    gap: 0;
  }

  .brand-mark {
    display: none;
  }

  .brand-text {
    display: block;
    max-width: 100%;
    font-size: 1.05rem;
    font-weight: 900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .public-toolbar .q-space {
    display: none;
  }
}

@media (max-width: 520px) {
  .public-header {
    height: 60px;
  }

  .public-toolbar {
    min-height: 60px;
    height: 60px;
  }

  :deep(.q-page-container) {
    min-height: calc(100vh - 60px);
  }

  .brand-text {
    font-size: 1rem;
  }

  .mobile-menu-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
