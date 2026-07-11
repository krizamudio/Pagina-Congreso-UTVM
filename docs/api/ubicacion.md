# API: Ubicación

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validación global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`. Los campos no definidos en el DTO generan un `400 Bad Request`.

## Campos del DTO

| Campo | Tipo | Requerido al crear | Reglas |
| --- | --- | --- | --- |
| `nombre` | string | Sí | No vacío, máximo 150 caracteres |
| `capacidad` | number | Sí | Entero mayor o igual a 1 |

En una actualización ambos campos son opcionales.

---

## POST /ubicacion

Crea una ubicación.

```http
POST {{base_url}}/ubicacion
```

Body:

```json
{
  "nombre": "Auditorio principal",
  "capacidad": 350
}
```

Respuesta esperada: `201 Created`.

```json
"Ubicación registrada correctamente"
```

Errores posibles:

- `400 Bad Request` — nombre vacío o demasiado largo, capacidad menor a 1, decimal o campos desconocidos.
- `409 Conflict` — conflicto con una restricción de la base de datos.

---

## GET /ubicacion

Lista todas las ubicaciones.

```http
GET {{base_url}}/ubicacion
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "b835edcb-cc41-4c78-a349-f2525dde06f6",
    "nombre": "Auditorio principal",
    "capacidad": 350
  }
]
```

---

## GET /ubicacion/:id

Obtiene una ubicación por UUID.

```http
GET {{base_url}}/ubicacion/b835edcb-cc41-4c78-a349-f2525dde06f6
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "b835edcb-cc41-4c78-a349-f2525dde06f6",
  "nombre": "Auditorio principal",
  "capacidad": 350
}
```

Errores posibles:

- `400 Bad Request` — el parámetro no es un UUID válido.
- `404 Not Found` — no existe una ubicación con ese ID.

---

## PATCH /ubicacion/:id

Actualiza parcialmente una ubicación. Envía únicamente los campos que quieras cambiar.

```http
PATCH {{base_url}}/ubicacion/b835edcb-cc41-4c78-a349-f2525dde06f6
```

Body ejemplo:

```json
{
  "capacidad": 400
}
```

Respuesta esperada: `200 OK`.

```json
"Ubicación actualizada correctamente"
```

Errores posibles:

- `400 Bad Request` — UUID o campos inválidos.
- `404 Not Found` — no existe una ubicación con ese ID.

---

## DELETE /ubicacion/:id

Elimina definitivamente una ubicación. Actualmente este recurso no usa borrado lógico.

```http
DELETE {{base_url}}/ubicacion/b835edcb-cc41-4c78-a349-f2525dde06f6
```

Respuesta esperada: `200 OK`.

```json
"Ubicación eliminada correctamente"
```

Errores posibles:

- `400 Bad Request` — el parámetro no es un UUID válido.
- `404 Not Found` — no existe una ubicación con ese ID.
