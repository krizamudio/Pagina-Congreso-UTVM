# API: Conferencia

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `congreso_id` | UUID v4 | Si | Debe ser UUID valido |
| `titulo` | string | Si | Maximo 200 caracteres |
| `ponente_id` | UUID v4 | Si | Debe ser UUID valido |
| `resumen` | string | Si | Maximo 2000 caracteres |
| `fecha` | string | Si | ISO 8601 (`YYYY-MM-DD`) |
| `hora_inicio` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `hora_fin` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `ubicacion_id` | UUID v4 | Si | Debe ser UUID valido |

**Validaciones adicionales:**
- `congreso_id`, `ponente_id` y `ubicacion_id` deben existir en la base de datos.
- `hora_fin` no puede ser igual ni menor a `hora_inicio`.

---

## POST /conferencias

Crea una conferencia.

```http
POST {{base_url}}/conferencias
```

Body:

```json
{
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Conferencia magistral sobre IA responsable",
  "ponente_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "resumen": "Una sesion para discutir los retos eticos y regulatorios de la inteligencia artificial.",
  "fecha": "2026-10-01",
  "hora_inicio": "16:00",
  "hora_fin": "17:30",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe"
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": "{{conferencia_id}}",
  "titulo": "Conferencia magistral sobre IA responsable",
  "resumen": "Una sesion para discutir los retos eticos y regulatorios de la inteligencia artificial.",
  "fecha": "2026-10-01",
  "hora_inicio": "16:00:00",
  "hora_fin": "17:30:00",
  "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
  "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" },
  "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" }
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes, UUID invalido, o formato de hora/fecha incorrecto.
- `404 Not Found` — el `congreso_id`, `ponente_id` o `ubicacion_id` no existe.

---

## GET /conferencias

Lista todas las conferencias.

```http
GET {{base_url}}/conferencias
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{conferencia_id}}",
    "titulo": "Conferencia magistral sobre IA responsable",
    "resumen": "Una sesion para discutir los retos eticos y regulatorios de la inteligencia artificial.",
    "fecha": "2026-10-01",
    "hora_inicio": "16:00:00",
    "hora_fin": "17:30:00",
    "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
    "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" },
    "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" }
  }
]
```

---

## GET /conferencias/:id

Obtiene una conferencia por ID.

```http
GET {{base_url}}/conferencias/{{conferencia_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{conferencia_id}}",
  "titulo": "Conferencia magistral sobre IA responsable",
  "resumen": "Una sesion para discutir los retos eticos y regulatorios de la inteligencia artificial.",
  "fecha": "2026-10-01",
  "hora_inicio": "16:00:00",
  "hora_fin": "17:30:00",
  "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
  "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" },
  "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" }
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro la conferencia con el id {{conferencia_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /conferencias/:id

Actualiza parcialmente una conferencia.

```http
PATCH {{base_url}}/conferencias/{{conferencia_id}}
```

Body ejemplo:

```json
{
  "titulo": "Conferencia magistral sobre IA responsable (actualizada)",
  "hora_fin": "18:00"
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{conferencia_id}}",
  "titulo": "Conferencia magistral sobre IA responsable (actualizada)",
  "resumen": "Una sesion para discutir los retos eticos y regulatorios de la inteligencia artificial.",
  "fecha": "2026-10-01",
  "hora_inicio": "16:00:00",
  "hora_fin": "18:00:00",
  "congreso": { "id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10" },
  "ubicacion": { "id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe" },
  "ponente": { "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901" }
}
```

Errores posibles:
- `400 Bad Request` — campos invalidos.
- `404 Not Found` — conferencia o referencia no encontrada.

---

## DELETE /conferencias/:id

Elimina una conferencia (soft delete).

```http
DELETE {{base_url}}/conferencias/{{conferencia_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{conferencia_id}}",
  "titulo": "Conferencia magistral sobre IA responsable (actualizada)",
  ...
}
```

Respuesta si no existe: `404 Not Found`.
