# API: Externos (Participantes Externos)

El envio del QR se documenta en [`qr-acceso.md`](./qr-acceso.md). Endpoint:
`POST /externos/:id/qr-acceso/enviar`.

Base URL: `http://localhost:3000/api`

Los endpoints de registro usan `multipart/form-data` porque incluyen la subida de un comprobante de pago.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `nombre` | string | Si | No puede estar vacio |
| `apellidoPaterno` | string | Si | No puede estar vacio |
| `apellidoMaterno` | string | No | Opcional, puede ser null |
| `correo` | string | Si | Debe ser email valido, unico |
| `telefono` | string | Si | No puede estar vacio |
| `institucion` | string | No | Opcional, puede ser null |
| `dias` | string[] | Si | Arreglo de dias |
| `total` | number | Si | Monto a pagar |
| `comprobante` | file | Si | PDF, JPG o PNG, max 5MB |

---

## GET /externos/verificar-correo/:token

Verifica el correo electronico de un participante externo. Redirige al frontend.

```http
GET {{base_url}}/externos/verificar-correo/{{token}}
```

Respuesta: `302 Redirect` al frontend con parametro `?registro=verificado` o `?registro=error&mensaje=...`.

> Este endpoint se llama desde el link de verificacion enviado por correo.

---

## POST /externos

Registra un participante externo con comprobante de pago.

```http
POST {{base_url}}/externos
Content-Type: multipart/form-data
```

Campos del form-data:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `nombre` | string | Nombre del participante |
| `apellidoPaterno` | string | Apellido paterno |
| `apellidoMaterno` | string | Apellido materno (opcional) |
| `correo` | string | Correo electronico |
| `telefono` | string | Telefono |
| `institucion` | string | Institucion (opcional) |
| `dias` | string | Dias de asistencia (array JSON o string) |
| `total` | string | Total a pagar |
| `comprobante` | file | Archivo PDF, JPG o PNG (max 5MB) |

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/externos \
  -F "nombre=Roberto" \
  -F "apellidoPaterno=Sanchez" \
  -F "correo=roberto.sanchez@correo.com" \
  -F "telefono=8112345678" \
  -F "dias=[\"dia1\",\"dia2\"]" \
  -F "total=500" \
  -F "comprobante=@comprobante.pdf"
```

Respuesta esperada: `201 Created`.

```json
{
  "mensaje": "Registro exitoso. Se ha enviado un correo de verificacion.",
  "id": "{{externo_id}}",
  "status": "pendiente_verificacion",
  "correoVerificado": false
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes o archivo no adjuntado.
- `400 Bad Request` — formato de archivo no valido (solo PDF, JPG, PNG).
- `400 Bad Request` — archivo supera 5MB.

---

## GET /externos

Lista todos los participantes externos.

```http
GET {{base_url}}/externos
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{externo_id}}",
    "nombre": "Roberto",
    "apellidoPaterno": "Sanchez",
    "correo": "roberto.sanchez@correo.com",
    "telefono": "8112345678",
    "dias": ["dia1", "dia2"],
    "total": 500,
    "status": "pendiente_verificacion",
    "correoVerificado": false
  }
]
```

---

## GET /externos/:id

Obtiene un participante externo por ID.

```http
GET {{base_url}}/externos/{{externo_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{externo_id}}",
  "nombre": "Roberto",
  "apellidoPaterno": "Sanchez",
  "correo": "roberto.sanchez@correo.com",
  "telefono": "8112345678",
  "dias": ["dia1", "dia2"],
  "total": 500,
  "status": "pendiente_verificacion",
  "correoVerificado": false
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun participante externo con el id {{externo_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /externos/:id

Actualiza parcialmente un participante externo.

```http
PATCH {{base_url}}/externos/{{externo_id}}
```

Body:

```json
{
  "telefono": "8119876543",
  "dias": ["dia1", "dia2", "dia3"]
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{externo_id}}",
  "nombre": "Roberto",
  "telefono": "8119876543",
  "dias": ["dia1", "dia2", "dia3"],
  ...
}
```

---

## DELETE /externos/:id

Elimina un participante externo (soft delete).

```http
DELETE {{base_url}}/externos/{{externo_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{externo_id}}",
  "nombre": "Roberto",
  ...
}
```

---

## PATCH /externos/:id/restore

Restaura un participante externo previamente eliminado.

```http
PATCH {{base_url}}/externos/{{externo_id}}/restore
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{externo_id}}",
  "nombre": "Roberto",
  ...
}
```
