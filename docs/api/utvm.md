# API: UTVM (Participantes)

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `nombres` | string | Si | No puede estar vacio |
| `apellidoPaterno` | string | Si | No puede estar vacio |
| `apellidoMaterno` | string | No | Opcional |
| `correo` | string | Si | Debe ser email valido, unico |
| `cuatrimestre` | number | Si | Entero entre 1 y 11 |
| `grupo` | string | Si | No puede estar vacio |
| `telefono` | string | Si | Entre 10 y 15 caracteres |

**Validaciones adicionales:**
- El `correo` debe ser unico (si se intenta registrar uno duplicado, regresa `409 Conflict`).

---

## POST /utvm

Crea un participante UTVM.

```http
POST {{base_url}}/utvm
```

Body:

```json
{
  "nombres": "Maria Elena",
  "apellidoPaterno": "Garcia",
  "apellidoMaterno": "Lopez",
  "correo": "maria.garcia@utvm.edu.mx",
  "cuatrimestre": 5,
  "grupo": "A",
  "telefono": "8112345678"
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": 1,
  "nombres": "Maria Elena",
  "apellidoPaterno": "Garcia",
  "apellidoMaterno": "Lopez",
  "correo": "maria.garcia@utvm.edu.mx",
  "cuatrimestre": 5,
  "grupo": "A",
  "telefono": "8112345678"
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes o formato invalido.
- `409 Conflict` — el correo ya esta registrado.

---

## POST /utvm/multiple

Crea varios participantes UTVM en una sola peticion.

```http
POST {{base_url}}/utvm/multiple
```

Body:

```json
[
  {
    "nombres": "Maria Elena",
    "apellidoPaterno": "Garcia",
    "correo": "maria.garcia@utvm.edu.mx",
    "cuatrimestre": 5,
    "grupo": "A",
    "telefono": "8112345678"
  },
  {
    "nombres": "Carlos",
    "apellidoPaterno": "Hernandez",
    "correo": "carlos.hernandez@utvm.edu.mx",
    "cuatrimestre": 3,
    "grupo": "B",
    "telefono": "8112345679"
  }
]
```

Respuesta esperada: `201 Created`.

```json
[
  { "id": 1, "nombres": "Maria Elena", ... },
  { "id": 2, "nombres": "Carlos", ... }
]
```

---

## GET /utvm

Lista todos los participantes UTVM.

```http
GET {{base_url}}/utvm
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": 1,
    "nombres": "Maria Elena",
    "apellidoPaterno": "Garcia",
    "apellidoMaterno": "Lopez",
    "correo": "maria.garcia@utvm.edu.mx",
    "cuatrimestre": 5,
    "grupo": "A",
    "telefono": "8112345678"
  }
]
```

---

## GET /utvm/:id

Obtiene un participante UTVM por ID.

```http
GET {{base_url}}/utvm/1
```

Respuesta esperada: `200 OK`.

```json
{
  "id": 1,
  "nombres": "Maria Elena",
  "apellidoPaterno": "Garcia",
  "apellidoMaterno": "Lopez",
  "correo": "maria.garcia@utvm.edu.mx",
  "cuatrimestre": 5,
  "grupo": "A",
  "telefono": "8112345678"
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun participante UTVM con el id 1",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /utvm/:id

Actualiza parcialmente un participante UTVM.

```http
PATCH {{base_url}}/utvm/1
```

Body ejemplo:

```json
{
  "cuatrimestre": 6,
  "grupo": "C"
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": 1,
  "nombres": "Maria Elena",
  "apellidoPaterno": "Garcia",
  "correo": "maria.garcia@utvm.edu.mx",
  "cuatrimestre": 6,
  "grupo": "C",
  ...
}
```

---

## DELETE /utvm/:id

Elimina un participante UTVM (soft delete).

```http
DELETE {{base_url}}/utvm/1
```

Respuesta esperada: `200 OK`.

```json
{
  "message": "Participante UTVM con id 1 eliminado correctamente"
}
```

---

## PATCH /utvm/:id/restore

Restaura un participante UTVM previamente eliminado.

```http
PATCH {{base_url}}/utvm/1/restore
```

Respuesta esperada: `200 OK`.

```json
{
  "message": "Participante UTVM con id 1 restaurado correctamente"
}
```
