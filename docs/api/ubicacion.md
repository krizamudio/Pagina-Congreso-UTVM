# API: Ubicacion

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

> **Nota:** Este modulo esta en fase de stub. Los endpoints retornan placeholders mientras se implementa la logica completa.

## Campos del DTO

El DTO de `CreateUbicacionDto` y `UpdateUbicacionDto` estan vacios actualmente (sin campos definidos).

La entidad `Ubicacion` tiene los siguientes campos en la base de datos:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | UUID | Clave primaria auto-generada |
| `nombre` | string | Nombre de la ubicacion (varchar 150) |
| `capacidad` | number | Capacidad maxima (int) |

---

## POST /ubicacion

Crea una ubicacion.

```http
POST {{base_url}}/ubicacion
```

Body (stub):

```json
{}
```

> Este endpoint retorna un stub de texto. La implementacion completa esta pendiente.

---

## GET /ubicacion

Lista todas las ubicaciones.

```http
GET {{base_url}}/ubicacion
```

> Este endpoint retorna un stub de texto.

---

## GET /ubicacion/:id

Obtiene una ubicacion por ID.

```http
GET {{base_url}}/ubicacion/1
```

> Este endpoint retorna un stub de texto.

---

## PATCH /ubicacion/:id

Actualiza parcialmente una ubicacion.

```http
PATCH {{base_url}}/ubicacion/1
```

> Este endpoint retorna un stub de texto.

---

## DELETE /ubicacion/:id

Elimina una ubicacion.

```http
DELETE {{base_url}}/ubicacion/1
```

> Este endpoint retorna un stub de texto.
