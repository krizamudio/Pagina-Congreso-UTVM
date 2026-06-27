# API: Ponentes y Talleres

Base URL para Postman:

```text
{{base_url}} = http://localhost:3000/api
```

Configura cada request con:

```text
Content-Type: application/json
```

El backend usa validacion global con `ValidationPipe`, `whitelist: true` y `transform: true`. Esto significa que los campos no definidos en el DTO se eliminan, los tipos transformables se convierten cuando aplique y los errores de validacion regresan como `400 Bad Request`.

## Variables sugeridas en Postman

| Variable | Valor inicial sugerido |
| --- | --- |
| `base_url` | `http://localhost:3000/api` |
| `ponente_id` | Se llena con el `id` devuelto al crear un ponente |
| `taller_id` | Se llena con el `id` devuelto al crear un taller |

## Ponentes

Ruta base:

```text
{{base_url}}/ponente
```

### Campos

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `usuario_id` | UUID v4 | Si | Debe ser UUID valido |
| `nombre` | string | Si | Maximo 200 caracteres |
| `archivo_foto_id` | UUID v4 | Si | Debe ser UUID valido |
| `institucion` | string | Si | Maximo 200 caracteres |
| `semblanza` | string | Si | Maximo 2000 caracteres |
| `tema` | string | Si | Maximo 255 caracteres |
| `visible_publico` | boolean | No | Por defecto queda en `true` si se omite |

### POST /ponente

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
  "usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "Universidad Nacional Autonoma de Mexico",
  "semblanza": "Investigadora especializada en inteligencia artificial aplicada a educacion, con mas de 10 anos de experiencia en proyectos de innovacion academica.",
  "tema": "Inteligencia artificial aplicada a la educacion superior",
  "visible_publico": true,
  "id": "{{ponente_id}}"
}
```

### GET /ponente

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

### GET /ponente/:id

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

### PATCH /ponente/:id

Actualiza parcialmente un ponente. Puedes enviar uno o varios campos del DTO.

```http
PATCH {{base_url}}/ponente/{{ponente_id}}
```

Body:

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

### DELETE /ponente/:id

Elimina un ponente y regresa el registro eliminado.

```http
DELETE {{base_url}}/ponente/{{ponente_id}}
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

## Talleres

Ruta base:

```text
{{base_url}}/taller
```

### Campos

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `congreso_id` | UUID v4 | Si | Debe ser UUID valido |
| `titulo` | string | Si | Maximo 200 caracteres |
| `descripcion` | string | Si | Maximo 2000 caracteres |
| `tallerista_id` | UUID v4 | Si | Debe ser UUID valido |
| `cupo_maximo` | number | Si | Entero mayor o igual a 1 |
| `fecha` | string | Si | ISO 8601. Recomendado: `YYYY-MM-DD` |
| `hora_inicio` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `hora_fin` | string | Si | Formato `HH:MM` o `HH:MM:SS` |
| `ubicacion_id` | UUID v4 | Si | Debe ser UUID valido |
| `requisitos` | string | Si | Maximo 2000 caracteres |

### POST /taller

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
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller practico de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 30,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00:00",
  "hora_fin": "13:00:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
  "id": "{{taller_id}}",
  "fecha_creacion": "2026-06-27T18:00:00.000Z",
  "fecha_actualizacion": "2026-06-27T18:00:00.000Z"
}
```

### GET /taller

Lista todos los talleres.

```http
GET {{base_url}}/taller
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{taller_id}}",
    "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
    "titulo": "Taller practico de prototipado con IA",
    "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
    "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
    "cupo_maximo": 30,
    "fecha": "2026-09-18",
    "hora_inicio": "10:00:00",
    "hora_fin": "13:00:00",
    "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
    "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
    "fecha_creacion": "2026-06-27T18:00:00.000Z",
    "fecha_actualizacion": "2026-06-27T18:00:00.000Z"
  }
]
```

### GET /taller/:id

Obtiene un taller por ID.

```http
GET {{base_url}}/taller/{{taller_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller practico de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 30,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00:00",
  "hora_fin": "13:00:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Laptop personal, navegador actualizado y conocimientos basicos de programacion.",
  "fecha_creacion": "2026-06-27T18:00:00.000Z",
  "fecha_actualizacion": "2026-06-27T18:00:00.000Z"
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

### PATCH /taller/:id

Actualiza parcialmente un taller. Puedes enviar uno o varios campos del DTO.

```http
PATCH {{base_url}}/taller/{{taller_id}}
```

Body:

```json
{
  "titulo": "Taller avanzado de prototipado con IA",
  "cupo_maximo": 25,
  "hora_inicio": "11:00",
  "hora_fin": "14:00",
  "requisitos": "Laptop personal, cuenta activa en las herramientas indicadas y experiencia basica con APIs."
}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller avanzado de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 25,
  "fecha": "2026-09-18",
  "hora_inicio": "11:00:00",
  "hora_fin": "14:00:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Laptop personal, cuenta activa en las herramientas indicadas y experiencia basica con APIs.",
  "fecha_creacion": "2026-06-27T18:00:00.000Z",
  "fecha_actualizacion": "2026-06-27T18:20:00.000Z"
}
```

### DELETE /taller/:id

Elimina un taller y regresa el registro eliminado.

```http
DELETE {{base_url}}/taller/{{taller_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{taller_id}}",
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller avanzado de prototipado con IA",
  "descripcion": "Sesion practica para disenar prototipos funcionales utilizando herramientas de inteligencia artificial generativa.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 25,
  "fecha": "2026-09-18",
  "hora_inicio": "11:00:00",
  "hora_fin": "14:00:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Laptop personal, cuenta activa en las herramientas indicadas y experiencia basica con APIs.",
  "fecha_creacion": "2026-06-27T18:00:00.000Z",
  "fecha_actualizacion": "2026-06-27T18:20:00.000Z"
}
```

## Errores comunes

### UUID invalido

Request invalido para `POST /ponente`:

```json
{
  "usuario_id": "123",
  "nombre": "Dra. Mariana Lopez Hernandez",
  "archivo_foto_id": "3b241101-e2bb-4255-8caf-4136c566a962",
  "institucion": "UNAM",
  "semblanza": "Texto de semblanza",
  "tema": "IA educativa"
}
```

Respuesta esperada: `400 Bad Request`.

```json
{
  "message": [
    "El campo \"usuario_id\" debe ser un UUID valido."
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Cupo maximo invalido

Request invalido para `POST /taller`:

```json
{
  "congreso_id": "c85b7c4a-f0a1-4f3b-8f9b-9b7f6b5a7e10",
  "titulo": "Taller sin cupo",
  "descripcion": "Ejemplo invalido.",
  "tallerista_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "cupo_maximo": 0,
  "fecha": "2026-09-18",
  "hora_inicio": "10:00",
  "hora_fin": "13:00",
  "ubicacion_id": "1f77a7e0-43b4-4f5d-a30e-821b3f45cafe",
  "requisitos": "Ninguno"
}
```

Respuesta esperada: `400 Bad Request`.

```json
{
  "message": [
    "El campo \"cupo_maximo\" debe ser mayor o igual a 1."
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Flujo recomendado para probar en Postman

1. Crea una variable `base_url` con `http://localhost:3000/api`.
2. Ejecuta `POST {{base_url}}/ponente`.
3. Copia el `id` de la respuesta y guardalo como variable `ponente_id`.
4. Ejecuta `GET {{base_url}}/ponente/{{ponente_id}}`.
5. Ejecuta `PATCH {{base_url}}/ponente/{{ponente_id}}`.
6. Ejecuta `POST {{base_url}}/taller`.
7. Copia el `id` de la respuesta y guardalo como variable `taller_id`.
8. Ejecuta `GET {{base_url}}/taller/{{taller_id}}`.
9. Ejecuta `PATCH {{base_url}}/taller/{{taller_id}}`.
10. Cuando termines las pruebas, ejecuta `DELETE` para los registros creados.

## Notas tecnicas actuales

- `tallerista_id`, `congreso_id`, `ubicacion_id`, `usuario_id` y `archivo_foto_id` se manejan como UUID, pero todavia no tienen relaciones TypeORM declaradas en estas entidades.
- `tallerista_id` puede recibir el `id` de un ponente si quieres mantener esa relacion de forma manual mientras se agregan las FK.
- La respuesta de fechas y horas puede variar ligeramente por PostgreSQL/TypeORM. Por ejemplo, una hora enviada como `10:00` puede regresar como `10:00:00`.
