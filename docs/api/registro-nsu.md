# API: Registro NSU

Base URL: `http://localhost:3000/api`

Los endpoints de registro usan `multipart/form-data` porque incluyen la subida de un comprobante de pago.

## Campos del DTO

### CreateParticipanteNsuDto

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `nombreCompleto` | string | Si | Maximo 200 caracteres |
| `correo` | string | Si | Debe ser email valido, maximo 150 caracteres |
| `institucion` | string | Si | Maximo 200 caracteres |
| `carrera` | string | Si | Maximo 200 caracteres |
| `telefono` | string | Si | Solo numeros, exactamente 10 digitos |
| `dias` | string | Si | Maximo 100 caracteres |
| `montoNumero` | number | Si | Minimo 0 |

### CreateRegistroNsuDto

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `participantes` | CreateParticipanteNsuDto[] | Si | Arreglo con minimo 1 participante |
| `comprobante` | file | Si | PDF, JPG, JPEG o PNG, max 10MB |

---

## GET /registro-nsu/verificar-correo/:token

Verifica el correo electronico de un participante NSU.

```http
GET {{base_url}}/registro-nsu/verificar-correo/{{token}}
```

Respuesta esperada: `200 OK`.

```json
{
  "mensaje": "Correo verificado exitosamente"
}
```

Errores posibles:
- `400 Bad Request` — token invalido o expirado.

---

## POST /registro-nsu

Registra participantes NSU con comprobante de pago.

```http
POST {{base_url}}/registro-nsu
Content-Type: multipart/form-data
```

Campos del form-data:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `participantes` | string | Arreglo JSON de participantes |
| `comprobante` | file | Archivo PDF, JPG, JPEG o PNG (max 10MB) |

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/registro-nsu \
  -F 'participantes=[{"nombreCompleto":"Juan Perez","correo":"juan@nsu.edu.mx","institucion":"Universidad Nacional","carrera":"Ing. Sistemas","telefono":"8112345678","dias":"dia1,dia2","montoNumero":350}]' \
  -F "comprobante=@comprobante.pdf"
```

Respuesta esperada: `201 Created`.

```json
{
  "id": "{{registro_id}}",
  "total_general": 350,
  "total_participantes": 1,
  "estado_pago": "PENDIENTE",
  "participantes": [
    {
      "id": "{{participante_id}}",
      "nombre_completo": "Juan Perez",
      "correo": "juan@nsu.edu.mx",
      "institucion": "Universidad Nacional",
      "carrera": "Ing. Sistemas",
      "telefono": "8112345678",
      "dias": "dia1,dia2",
      "monto_individual": 350
    }
  ]
}
```

Errores posibles:
- `400 Bad Request` — campo `participantes` no es JSON valido.
- `400 Bad Request` — archivo no adjuntado o formato no valido.
- `400 Bad Request` — archivo supera 10MB.

---

## GET /registro-nsu

Lista todos los registros NSU.

```http
GET {{base_url}}/registro-nsu
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{registro_id}}",
    "total_general": 350,
    "total_participantes": 1,
    "estado_pago": "PENDIENTE",
    "participantes": [...]
  }
]
```

---

## GET /registro-nsu/:id

Obtiene un registro NSU por ID.

```http
GET {{base_url}}/registro-nsu/{{registro_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{registro_id}}",
  "total_general": 350,
  "total_participantes": 1,
  "estado_pago": "PENDIENTE",
  "participantes": [...]
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro el registro NSU con el id {{registro_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## DELETE /registro-nsu/:id

Elimina un registro NSU (soft delete).

```http
DELETE {{base_url}}/registro-nsu/{{registro_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{registro_id}}",
  "total_general": 350,
  ...
}
```

---

## PATCH /registro-nsu/:id/restore

Restaura un registro NSU previamente eliminado.

```http
PATCH {{base_url}}/registro-nsu/{{registro_id}}/restore
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{registro_id}}",
  "total_general": 350,
  ...
}
```
