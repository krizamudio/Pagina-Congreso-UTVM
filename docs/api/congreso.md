# API: Congreso

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`. Los campos no definidos en el DTO se eliminan y los errores de validacion regresan como `400 Bad Request`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `nombre` | string | Si | Maximo 150 caracteres |
| `eslogan` | string | Si | Maximo 200 caracteres |
| `ubicacion` | string | Si | Maximo 255 caracteres |
| `fecha_inicio` | string | Si | ISO 8601 (`YYYY-MM-DDThh:mm:ss`) |
| `fecha_fin` | string | Si | ISO 8601 (`YYYY-MM-DDThh:mm:ss`) |

**Validaciones adicionales:**
- `fecha_inicio` y `fecha_fin` deben ser fechas futuras.
- `fecha_fin` no puede ser anterior a `fecha_inicio`.
- Las fechas no pueden solaparse con las de otro congreso existente.

---

## POST /congreso

Crea un congreso.

```http
POST {{base_url}}/congreso
```

Body:

```json
{
  "nombre": "Congreso Internacional de Tecnologia Educativa 2026",
  "eslogan": "Innovacion que conecta conocimiento y futuro",
  "ubicacion": "Universidad Tecnologica del Valle del Mezquital",
  "fecha_inicio": "2026-09-17T09:00:00.000Z",
  "fecha_fin": "2026-09-19T18:00:00.000Z"
}
```

Respuesta esperada: `201 Created`.

```json
"Congreso -> Congreso Internacional de Tecnologia Educativa 2026 creado correctamente"
```

Errores posibles:
- `400 Bad Request` — campos faltantes, formato de fecha invalido, fechas en el pasado, o solapamiento con otro congreso.
- `409 Conflict` — nombre duplicado (violacion de constraint UNIQUE).

---

## GET /congreso

Lista todos los congresos.

```http
GET {{base_url}}/congreso
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{congreso_id}}",
    "nombre": "Congreso Internacional de Tecnologia Educativa 2026",
    "eslogan": "Innovacion que conecta conocimiento y futuro",
    "ubicacion": "Universidad Tecnologica del Valle del Mezquital",
    "fechaInicio": "2026-09-17T09:00:00.000Z",
    "fechaFin": "2026-09-19T18:00:00.000Z"
  }
]
```

> Nota: los campos de fecha se devuelven como `fechaInicio` y `fechaFin` (camelCase) gracias al mapper.

---

## GET /congreso/:id

Obtiene un congreso por ID.

```http
GET {{base_url}}/congreso/{{congreso_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{congreso_id}}",
  "nombre": "Congreso Internacional de Tecnologia Educativa 2026",
  "eslogan": "Innovacion que conecta conocimiento y futuro",
  "ubicacion": "Universidad Tecnologica del Valle del Mezquital",
  "fechaInicio": "2026-09-17T09:00:00.000Z",
  "fechaFin": "2026-09-19T18:00:00.000Z"
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun congreso con el id {{congreso_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /congreso/:id

Actualiza parcialmente un congreso. Solo envia los campos que quieras cambiar.

```http
PATCH {{base_url}}/congreso/{{congreso_id}}
```

Body ejemplo:

```json
{
  "eslogan": "Tecnologia, investigacion e innovacion para transformar",
  "fecha_fin": "2026-09-20T18:00:00.000Z"
}
```

Respuesta esperada: `200 OK`.

```json
"El congreso: Congreso Internacional de Tecnologia Educativa 2026, se actualizo correctamente"
```

Errores posibles:
- `400 Bad Request` — campos invalidos o fechas que generan solapamiento.
- `404 Not Found` — congreso no encontrado.

---

## DELETE /congreso/:id

Elimina un congreso (soft delete).

```http
DELETE {{base_url}}/congreso/{{congreso_id}}
```

Respuesta esperada: `200 OK`.

```json
"Congreso: Congreso Internacional de Tecnologia Educativa 2026 eliminado correctamente"
```

Respuesta si no existe: `404 Not Found`.
