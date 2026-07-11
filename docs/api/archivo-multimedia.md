# API: Archivo Multimedia

Base URL: `http://localhost:3000/api`

El endpoint de subida usa `multipart/form-data`.

## Campos del DTO

| Campo | Tipo | Requerido | Reglas |
| --- | --- | --- | --- |
| `subido_por_usuario_id` | UUID v4 | Si | Debe ser UUID valido |
| `ruta_archivo` | string | Si | Maximo 2000 caracteres |
| `tipo_mime` | string | Si | Debe ser un MIME type valido, maximo 50 caracteres |

---

## POST /archivo-multimedia/upload/photo

Sube una foto a Supabase Storage y guarda un registro en la base de datos.

```http
POST {{base_url}}/archivo-multimedia/upload/photo
Content-Type: multipart/form-data
```

Campos del form-data:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `foto` | file | Archivo de imagen (JPEG, PNG o WebP, max 5MB) |

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/archivo-multimedia/upload/photo \
  -F "foto=@foto.jpg"
```

Respuesta esperada: `201 Created`.

```json
{
  "path": "public/fotos/abc123.jpg",
  "url": "https://supabase.example.com/storage/v1/object/public/bucket/fotos/abc123.jpg",
  "originalName": "foto.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000
}
```

Errores posibles:
- `400 Bad Request` — formato no valido (solo JPEG, PNG, WebP).
- `400 Bad Request` — archivo supera 5MB.

---

## GET /archivo-multimedia

Lista todos los archivos multimedia.

```http
GET {{base_url}}/archivo-multimedia
```

Respuesta esperada: `200 OK`.

```json
[
  {
    "id": "{{archivo_id}}",
    "subido_por_usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
    "ruta_archivo": "https://supabase.example.com/storage/...",
    "tipo_mime": "image/jpeg"
  }
]
```

---

## GET /archivo-multimedia/:id

Obtiene un archivo multimedia por ID.

```http
GET {{base_url}}/archivo-multimedia/{{archivo_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{archivo_id}}",
  "subido_por_usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "ruta_archivo": "https://supabase.example.com/storage/...",
  "tipo_mime": "image/jpeg"
}
```

Respuesta si no existe: `404 Not Found`.

```json
{
  "message": "No se encontro el archivo multimedia con el id {{archivo_id}}",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## PATCH /archivo-multimedia/:id

Actualiza parcialmente un archivo multimedia.

```http
PATCH {{base_url}}/archivo-multimedia/{{archivo_id}}
```

Body:

```json
{
  "ruta_archivo": "https://supabase.example.com/storage/v2/nueva-ruta.jpg"
}
```

Respuesta esperada: `200 OK`.

> Nota: este endpoint actualmente retorna un stub (mensaje de texto).

---

## DELETE /archivo-multimedia/:id

Elimina un archivo multimedia (soft delete).

```http
DELETE {{base_url}}/archivo-multimedia/{{archivo_id}}
```

Respuesta esperada: `200 OK`.

```json
{
  "id": "{{archivo_id}}",
  "subido_por_usuario_id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "ruta_archivo": "https://supabase.example.com/storage/...",
  "tipo_mime": "image/jpeg"
}
```
