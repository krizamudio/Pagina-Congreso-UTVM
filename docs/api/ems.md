# API: EMS (Participantes)

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
| `institucion` | string | Si | No puede estar vacio |
| `carrera` | string | Si | No puede estar vacio |
| `telefono` | string | Si | Entre 10 y 15 caracteres |

**Validaciones adicionales:**
- El `correo` debe ser unico (si se intenta registrar uno duplicado, regresa `409 Conflict`).

---

## POST /ems

Crea un participante EMS.

```http
POST {{base_url}}/ems
```

Body:

```json
{
  "nombres": "Carlos",
  "apellidoPaterno": "Hernandez",
  "apellidoMaterno": "Ruiz",
  "correo": "carlos.hernandez@ems.edu.mx",
  "institucion": "Universidad Estatal de Mexico",
  "carrera": "Ingenieria en Sistemas",
  "telefono": "8112345678"
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": 1,
  "nombres": "Carlos",
  "apellidoPaterno": "Hernandez",
  "apellidoMaterno": "Ruiz",
  "correo": "carlos.hernandez@ems.edu.mx",
  "institucion": "Universidad Estatal de Mexico",
  "carrera": "Ingenieria en Sistemas",
  "telefono": "8112345678"
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes o formato invalido.
- `409 Conflict` — el correo ya esta registrado.

---

## POST /ems/multiple

Crea varios participantes EMS en una sola peticion.

```http
POST {{base_url}}/ems/multiple
```

Body:

```json
[
  {
    "nombres": "Carlos",
    "apellidoPaterno": "Hernandez",
    "correo": "carlos.hernandez@ems.edu.mx",
    "institucion": "Universidad Estatal de Mexico",
    "carrera": "Ingenieria en Sistemas",
    "telefono": "8112345678"
  },
  {
    "nombres": "Ana",
    "apellidoPaterno": "Martinez",
    "correo": "ana.martinez@ems.edu.mx",
    "institucion": "Instituto Tecnologico de Chihuahua",
    "carrera": "Quimica",
    "telefono": "8112345679"
  }
]
```

Respuesta esperada: `201 Created`.

```json
[
  { "id": 1, "nombres": "Carlos", ... },
  { "id": 2, "nombres": "Ana", ... }
]
```

---

## GET /ems

Lista todos los participantes EMS.

```http
GET {{base_url}}/ems
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": 1,
    "nombres": "Carlos",
    "apellidoPaterno": "Hernandez",
    "correo": "carlos.hernandez@ems.edu.mx",
    "institucion": "Universidad Estatal de Mexico",
    "carrera": "Ingenieria en Sistemas",
    "telefono": "8112345678"
  }
]
```

---

## GET /ems/:id

Obtiene un participante EMS por ID.

```http
GET {{base_url}}/ems/1
```

Respuesta esperada: `200 OK`.

```json
{
  "id": 1,
  "nombres": "Carlos",
  "apellidoPaterno": "Hernandez",
  "correo": "carlos.hernandez@ems.edu.mx",
  "institucion": "Universidad Estatal de Mexico",
  "carrera": "Ingenieria en Sistemas",
  "telefono": "8112345678"
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun participante EMS con el id 1",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /ems/:id

Actualiza parcialmente un participante EMS.

```http
PATCH {{base_url}}/ems/1
```

Body ejemplo:

```json
{
  "institucion": "Universidad Autonoma de Nuevo Leon",
  "carrera": "Ingenieria Civil"
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": 1,
  "nombres": "Carlos",
  "institucion": "Universidad Autonoma de Nuevo Leon",
  "carrera": "Ingenieria Civil",
  ...
}
```

---

## DELETE /ems/:id

Elimina un participante EMS (soft delete).

```http
DELETE {{base_url}}/ems/1
```

Respuesta esperada: `200 OK`.

```json
{
  "message": "Participante EMS con id 1 eliminado correctamente"
}
```

---

## PATCH /ems/:id/restore

Restaura un participante EMS previamente eliminado.

```http
PATCH {{base_url}}/ems/1/restore
```

Respuesta esperada: `200 OK`.

```json
{
  "message": "Participante EMS con id 1 restaurado correctamente"
}
```
