<template>
  <q-page class="public-home-page">
    <section class="public-home-content">
      <h1>Congreso UTVM</h1>

      <p>
        Bienvenido al portal oficial del congreso. Consulta la agenda,
        las conferencias, los talleres y revisa la información del evento.
      </p>

      <div class="home-actions">
        <q-btn
          color="primary"
          no-caps
          label="Ver agenda"
          to="/agenda"
        />

        <q-btn
          color="primary"
          outline
          no-caps
          label="Conferencias"
          to="/conferencias_u"
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
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

@media (max-width: 600px) {
  .public-home-page {
    padding: 28px 18px;
  }

  .public-home-content h1 {
    font-size: 2.6rem;
    line-height: 1.05;
  }

  .public-home-content p {
    font-size: 1rem;
  }

  .home-actions {
    flex-direction: column;
  }

  .home-actions .q-btn {
    width: 100%;
  }
}
</style>
