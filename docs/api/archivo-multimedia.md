# API: Archivo multimedia

Base URL: `http://localhost:3000/api`

Las cargas usan `multipart/form-data`, tienen un limite de 5 MB y se almacenan
en un bucket publico. Por ello, las consultas y actualizaciones devuelven una
URL publica.

## Fotos

- `POST /fotos`, campo `foto`: acepta JPEG, PNG o WebP.
- `GET /fotos/:id`: consulta una foto.
- `PATCH /fotos/:id`, campo `foto`: sustituye una foto, conserva su ID y elimina
  el objeto anterior del bucket.
- `DELETE /fotos/:id`: elimina una foto.

## Archivos

- `POST /archivos`, campo `archivo`: acepta exclusivamente PDF con extension
  `.pdf`.
- `GET /archivos/:id`: consulta un PDF.
- `PATCH /archivos/:id`, campo `archivo`: sustituye un PDF.
- `DELETE /archivos/:id`: elimina un PDF.

Los parametros `:id` deben ser UUID validos. No existen endpoints de listado.
El servidor valida el MIME declarado y la firma binaria esperada. Esta
comprobacion identifica el formato permitido, pero no sustituye un analisis
antivirus ni una validacion estructural completa del contenido.

## Respuestas

Las operaciones de creacion, consulta y actualizacion comparten este contrato:

```json
{
  "id": "7b0ef2d1-65b4-4db3-ae8b-2d25e1c5a901",
  "url": "https://proyecto.supabase.co/storage/v1/object/public/bucket/imagenes/archivo.jpg",
  "path": "imagenes/archivo.jpg",
  "tipoMime": "image/jpeg"
}
```

La eliminacion conserva una respuesta simple:

```text
Archivo eliminado correctamente
```

Los errores del proveedor de almacenamiento se registran en el servidor y se
responden al cliente con un mensaje generico.
