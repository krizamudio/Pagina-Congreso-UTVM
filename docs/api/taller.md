# API: Taller

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `congreso_id` | UUID v4 | No | Debe ser UUID valido si se envia |
| `titulo` | string | Si | Maximo 200 caracteres |
| `descripcion` | string | Si | Maximo 2000 caracteres |
| `tallerista_id` | UUID v4 | No | Debe ser UUID valido si se envia |
| `cupo_maximo` | number | Si | Entero mayor o igual a 1 |
| `fecha` | string | Si | ISO 8601 (`YYYY-MM-DD`) |
| `hora_inicio` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `hora_fin` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `ubicacion_id` | UUID v4 | No | Debe ser UUID valido si se envia |
| `requisitos` | string | Si | Maximo 2000 caracteres |

**Validaciones adicionales:**
- `hora_fin` no puede ser igual ni menor a `hora_inicio`.
- `congreso_id`, `tallerista_id` y `ubicacion_id` son opcionales pero si se envian deben existir en la base de datos.

---

## POST /taller

Crea un taller.

```http
POST {{base_url}}/taller
```

Body:

```json
{
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller practico de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 30,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00",
  "hora_fin": "13:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion."
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": "{{taller_id}}",
  "titulo": "Taller practico de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "cupo_maximo": 30,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00:00",
  "hora_fin": "13:00:00",
  "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
  "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" },
  "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
  "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" }
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes, `cupo_maximo` < 1, formato de hora/fecha incorrecto.
- `404 Not Found` — el `congreso_id`, `tallerista_id` o `ubicacion_id` no existe.

---

## GET /taller

Lista todos los talleres.

```http
GET {{base_url}}/taller
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{taller_id}}",
    "titulo": "Taller practico de prototipado con IA",
    "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
    "cupo_maximo": 30,
    "fecha": "2026-09-18",
    "hora_inicio": "10:00:00",
    "hora_fin": "13:00:00",
    "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
    "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" },
    "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
    "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" }
  }
]
```

---

## GET /taller/:id

Obtiene un taller por ID.

```http
GET {{base_url}}/taller/{{taller_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "titulo": "Taller practico de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "cupo_maximo": 30,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00:00",
  "hora_fin": "13:00:00",
  "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
  "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" },
  "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
  "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" }
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun taller con el id {{taller_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /taller/:id

Actualiza parcialmente un taller.

```http
PATCH {{base_url}}/taller/{{taller_id}}
```

Body ejemplo:

```json
{
  "titulo": "Taller avanzado de prototipado con IA",
  "cupo_maximo": 25,
  "hora_inicio": "11:00",
  "hora_fin": "14:00"
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "titulo": "Taller avanzado de prototipado con IA",
  "cupo_maximo": 25,
  "hora_inicio": "11:00:00",
  "hora_fin": "14:00:00",
  ...
}
```

Errores posibles:
- `400 Bad Request` — campos invalidos.
- `404 Not Found` — taller no encontrado.

---

## DELETE /taller/:id

Elimina un taller (soft delete).

```http
DELETE {{base_url}}/taller/{{taller_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "titulo": "Taller avanzado de prototipado con IA",
  ...
}
```

Respuesta si no existe: `404 Not Found`.
