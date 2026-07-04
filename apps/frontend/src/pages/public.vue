\<template>
  <q-layout view="lHh Lpr lFf" class="public-layout">
    <q-header elevated class="public-header">
      <q-toolbar>
        <q-toolbar-title>Congreso UTVM</q-toolbar-title>

        <q-btn flat no-caps label="Inicio" to="/" />
        <q-btn flat no-caps label="Agenda" to="/agenda" />
        <q-btn flat no-caps label="Registro Externo" to="/registro-externo" />
        <q-btn outline no-caps label="Admin" to="/admin/dashboard" />
        <q-btn flat no-caps label="Registro NSU" to="/registro_nsu" />
        <q-btn flat no-caps label="Registro EMS" to="/registro_ems" />
        <q-btn flat no-caps label="Registro UTVM" to="/registro_utvm" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #032f2f 0%, #054b45 100%);
}

.public-header {
  background: rgba(5, 30, 30, 0.95);
  color: white;
}
</style>
