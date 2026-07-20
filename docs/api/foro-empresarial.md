# API: Foro Empresarial

Base URL: `http://localhost:3000/api`

Los logos se cargan previamente mediante `POST /fotos`. El `id` obtenido puede
enviarse como `archivo_logo_id`; no se aceptan documentos ni IDs de archivos que
no existan.

## Contrato

| Campo | Tipo | Requerido al crear | Reglas |
| --- | --- | --- | --- |
| `nombre` | string | Sí | Texto no vacío, máximo 200 caracteres |
| `archivo_logo_id` | UUID o `null` | No | Debe identificar una imagen existente |
| `direccion` | string | Sí | Texto no vacío, máximo 255 caracteres |
| `resena` | string | Sí | Texto no vacío, máximo 2000 caracteres |
| `congreso_id` | UUID | Sí | Debe identificar un Congreso activo |
| `ubicacion_id` | UUID | Sí | Debe identificar una Ubicación existente |

Las respuestas de creación y consulta tienen esta forma:

```json
{
  "id": "{{foro_id}}",
  "nombre": "Encuentro de Innovación Empresarial",
  "logo": {
    "id": "{{archivo_logo_id}}",
    "url": "https://storage.example.com/imagenes/logo.webp"
  },
  "direccion": "Auditorio principal, edificio A",
  "resena": "Espacio de vinculación entre empresas y comunidad universitaria.",
  "congreso": {
    "id": "{{congreso_id}}",
    "nombre": "Congreso UTVM 2026"
  },
  "ubicacion": {
    "id": "{{ubicacion_id}}",
    "nombre": "Auditorio principal"
  }
}
```

Cuando no hay logo, `logo` es `null`.

## Crear

```http
POST /api/foro-empresarial
Content-Type: application/json
```

```json
{
  "nombre": "Encuentro de Innovación Empresarial",
  "archivo_logo_id": "{{archivo_logo_id}}",
  "direccion": "Auditorio principal, edificio A",
  "resena": "Espacio de vinculación entre empresas y comunidad universitaria.",
  "congreso_id": "{{congreso_id}}",
  "ubicacion_id": "{{ubicacion_id}}"
}
```

Devuelve `201 Created`. `archivo_logo_id` puede omitirse o enviarse como `null`.

## Listar y consultar

```http
GET /api/foro-empresarial
GET /api/foro-empresarial/{{foro_id}}
```

El listado devuelve únicamente foros activos. La consulta individual devuelve
`404 Not Found` si no existe o tiene soft delete.

## Actualizar

```http
PATCH /api/foro-empresarial/{{foro_id}}
Content-Type: application/json
```

Solo deben enviarse los campos que cambian:

```json
{
  "direccion": "Centro de convenciones",
  "archivo_logo_id": null
}
```

- Omitir `archivo_logo_id` conserva el logo actual.
- Enviar un UUID agrega o reemplaza el logo.
- Enviar `null` quita el logo y elimina el archivo anterior de PostgreSQL y
  Supabase.
- Un cuerpo vacío devuelve `400 Bad Request`.

## Eliminar

```http
DELETE /api/foro-empresarial/{{foro_id}}
```

Aplica soft delete al foro. Si tenía logo, deja la relación en `null` y elimina
el archivo físico. Devuelve:

```json
"Foro empresarial eliminado correctamente"
```

Si falla la limpieza de Supabase, se intenta restaurar el foro y su relación y
se responde con un error genérico.

No existe endpoint público de restauración en esta iteración.

## Integridad de relaciones

- No se puede eliminar un Congreso ni una Ubicación mientras tenga foros
  empresariales activos; la API devuelve `409 Conflict`.
- Los parámetros de ruta y las relaciones usan UUID v4.
- Un archivo multimedia no puede compartirse entre foros ni reutilizarse como
  foto de un Ponente.
