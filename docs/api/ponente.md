# API: Ponente

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `usuario_id` | UUID v4 | Si | Debe ser UUID valido |
| `nombre` | string | Si | Maximo 200 caracteres |
| `archivo_foto_id` | UUID v4 | Si | Debe ser UUID valido |
| `institucion` | string | Si | Maximo 200 caracteres |
| `semblanza` | string | Si | Maximo 2000 caracteres |
| `tema` | string | Si | Maximo 255 caracteres |
| `visible_publico` | boolean | No | Por defecto queda en `true` si se omite |

---

## POST /ponente

Crea un ponente.

```http
POST {{base_url}}/ponente
```

Body:

```json
{
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visible_publico": true
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": "{{ponente_id}}",
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visible_publico": true
}
```

Errores posibles:
- `400 Bad Request` — campos faltantes o UUID invalido.
- `409 Conflict` — ya existe un ponente con ese `usuario_id`.

---

## GET /ponente

Lista todos los ponentes.

```http
GET {{base_url}}/ponente
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{ponente_id}}",
    "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
    "nombre": "Dra. Mariana Lopez Hernandez",
    "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
    "institucion": "Universidad Nacional Autonoma de Mexico",
    "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
    "tema": "Inteligencia artificial aplicada a la educacion superior",
    "visible_publico": true
  }
]
```

---

## GET /ponente/:id

Obtiene un ponente por ID.

```http
GET {{base_url}}/ponente/{{ponente_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{ponente_id}}",
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visible_publico": true
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro ningun ponente con el id {{ponente_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /ponente/:id

Actualiza parcialmente un ponente.

```http
PATCH {{base_url}}/ponente/{{ponente_id}}
```

Body ejemplo:

```json
{
  "institucion": "Instituto Politecnico Nacional",
  "tema": "Etica y gobernanza de la inteligencia artificial",
  "visible_publico": false
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{ponente_id}}",
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "Instituto Politecnico Nacional",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Etica y gobernanza de la inteligencia artificial",
  "visible_publico": false
}
```

Errores posibles:
- `400 Bad Request` — campos invalidos.
- `404 Not Found` — ponente no encontrado.

---

## DELETE /ponente/:id

Elimina un ponente (soft delete).

```http
DELETE {{base_url}}/ponente/{{ponente_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{ponente_id}}",
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  ...
}
```

Respuesta si no existe: `404 Not Found`.
