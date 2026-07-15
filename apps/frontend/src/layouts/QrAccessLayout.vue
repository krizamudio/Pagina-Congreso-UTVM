<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="qr-header">
      <q-toolbar>
        <q-icon name="verified_user" size="28px" />
        <q-toolbar-title>Control de acceso</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.qr-header {
  background: #064e3b;
  color: white;
}
</style>
