<template>
  <q-page class="public-home-page">
    <section class="public-home-content">
      <h1>Congreso UTVM</h1>

<<<<<<< HEAD
      <p>
        Bienvenido al portal oficial del congreso. Consulta la agenda,
        regístrate y revisa la información del evento.
      </p>
=======
        <q-btn flat no-caps label="Inicio" to="/" />
        <q-btn flat no-caps label="Registro Externo" to="/registro-externo" />
        <q-btn outline no-caps label="Admin" to="/admin/dashboard" />
        <q-btn flat no-caps label="Registro NSU" to="/registro_nsu" />
        <q-btn flat no-caps label="Registro EMS" to="/registro_ems" />
        <q-btn flat no-caps label="Registro UTVM" to="/registro_utvm" />
        <q-btn flat no-caps label="talleres" to="/talleres_u" />
      </q-toolbar>
    </q-header>
>>>>>>> feature/talleres_usuarios

      <div class="home-actions">
        <q-btn
          color="primary"
          no-caps
          label="Ver agenda"
          to="/agenda"
        />

        <q-btn
          outline
          no-caps
          label="Registro externo"
          to="/registro-externo"
        />
      </div>
    </section>
  </q-page>
</template>

<style scoped>
.public-home-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: 48px;
}

.public-home-content {
  max-width: 720px;
  color: white;
}

.public-home-content h1 {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 16px;
}

.public-home-content p {
  font-size: 1.15rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.home-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
}
</style>
