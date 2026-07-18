# API: Ponente

Base URL: `http://localhost:3000/api`

Configura cada request con `Content-Type: application/json`.

El backend usa validacion global con `ValidationPipe`, `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`.

## Campos del DTO

| Campo             | Tipo    | Requerido | Reglas                                   |
| ----------------- | ------- | --------- | ---------------------------------------- |
| `usuario_id`      | UUID v4 | Si        | Debe ser UUID valido                     |
| `nombre`          | string  | Si        | Maximo 200 caracteres                    |
| `archivo_foto_id` | UUID v4 | No        | JPEG, PNG o WebP de `archivo-multimedia`  |
| `institucion`     | string  | Si        | Maximo 200 caracteres                    |
| `tipo`            | enum    | Si        | `Ponente` o `Panelista`                  |
| `semblanza`       | string  | Si        | Maximo 2000 caracteres                   |
| `tema`            | string  | Si        | Maximo 255 caracteres                    |
| `visible_publico` | boolean | No        | Por defecto queda en `true` si se omite  |

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
  "tipo": "Ponente",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visible_publico": true
}
```

Respuesta esperada: `201 Created`.

```json
{
  "id": "{{ponente_id}}",
  "usuarioId": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "foto": {
    "id": "3b241101-e2bb-4255-8caf-4136c566a962",
    "url": "https://proyecto.supabase.co/storage/v1/object/public/bucket/imagenes/foto.jpg"
  },
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "tipo": "Ponente",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visiblePublico": true
}
```

Errores posibles:

- `400 Bad Request` — campos faltantes o UUID invalido.
- `404 Not Found` — `archivo_foto_id` no existe o no corresponde a una imagen.

---

## GET /ponente

Lista ponentes y panelistas. Permite filtrar por tipo y paginar resultados.

```http
GET {{base_url}}/ponente?tipo=Ponente&limit=50&offset=0
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{ponente_id}}",
    "usuarioId": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
    "nombre": "Dra. Mariana Lopez Hernandez",
    "foto": {
      "id": "3b241101-e2bb-4255-8caf-4136c566a962",
      "url": "https://proyecto.supabase.co/storage/v1/object/public/bucket/imagenes/foto.jpg"
    },
    "institucion": "Universidad Nacional Autonoma de Mexico",
    "tipo": "Ponente",
    "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
    "tema": "Inteligencia artificial aplicada a la educacion superior",
    "visiblePublico": true
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
  "usuarioId": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "foto": {
    "id": "3b241101-e2bb-4255-8caf-4136c566a962",
    "url": "https://proyecto.supabase.co/storage/v1/object/public/bucket/imagenes/foto.jpg"
  },
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "tipo": "Ponente",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visiblePublico": true
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

Para retirar la fotografia sin asignar otra:

```json
{
  "archivo_foto_id": null
}
```

Omitir `archivo_foto_id` conserva la fotografia actual. Enviar un ID diferente
asigna la nueva fotografia y elimina la anterior tanto de PostgreSQL como de
Supabase. Enviar `null` retira y elimina la fotografia actual.

Cada fotografia se considera propiedad exclusiva de un registro. Otros modulos
pueden usar sus propias imagenes, pero no deben compartir el mismo ID.

Respuesta esperada: `200 OK`.

```text
Ponente actualizado correctamente
```

Errores posibles:

- `400 Bad Request` — campos invalidos o body vacio.
- `404 Not Found` — ponente o foto no encontrados.
- `500 Internal Server Error` — no se pudo realizar la actualizacion.

---

## DELETE /ponente/:id

Elimina un ponente mediante soft delete y elimina permanentemente su fotografia
de PostgreSQL y Supabase. Si la limpieza de almacenamiento falla, el servidor
intenta restaurar el ponente y responde con un error generico.

```http
DELETE {{base_url}}/ponente/{{ponente_id}}
```

Respuesta esperada: `200 OK`.

```text
Ponente eliminado correctamente
```

Respuesta si no existe: `404 Not Found`.
