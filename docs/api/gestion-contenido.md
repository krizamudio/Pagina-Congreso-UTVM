# API RF-24: Gestión de contenido

Base URL: `http://localhost:3000/api`

Las rutas de administración todavía no incluyen autenticación. Deben protegerse
con el guard de administrador cuando esté disponible.

## Imágenes de contenido

Supabase usa prefijos virtuales; no es necesario crear carpetas manualmente.
Los destinos aceptados son `noticias` y `banners`, que generan las rutas
`imagenes/noticias/...` e `imagenes/banners/...`.

```http
POST   /gestion-contenido/imagenes/:destino
GET    /gestion-contenido/imagenes/:destino/:id
PATCH  /gestion-contenido/imagenes/:destino/:id
DELETE /gestion-contenido/imagenes/:destino/:id
```

POST y PATCH reciben `multipart/form-data` con el campo `imagen`. Se aceptan
JPEG, PNG y WebP válidos de hasta 5 MB. Una imagen solo puede administrarse y
asignarse dentro de su destino.

## Noticias

```http
POST   /gestion-contenido/noticias
GET    /gestion-contenido/noticias
GET    /gestion-contenido/noticias/:id
PATCH  /gestion-contenido/noticias/:id
DELETE /gestion-contenido/noticias/:id
```

Ejemplo de creación:

```json
{
  "congreso_id": "{{congreso_id}}",
  "titulo": "Nueva edición del Congreso UTVM",
  "cuerpo": "Información completa de la noticia.",
  "archivo_portada_id": "{{imagen_noticias_id}}",
  "estado": "publicado"
}
```

- `archivo_portada_id` es opcional y acepta `null`.
- El slug se genera al crear, resuelve colisiones y no cambia al editar el
  título.
- `estado` acepta `borrador` o `publicado`; su valor predeterminado es
  `borrador`.
- Publicar asigna `fechaPublicacion`; volver a borrador la establece en `null`.
- Omitir la portada en PATCH la conserva; enviar `null` la elimina.

## Secciones de información general

```http
POST   /gestion-contenido/secciones
GET    /gestion-contenido/secciones
GET    /gestion-contenido/secciones/:id
PATCH  /gestion-contenido/secciones/:id
DELETE /gestion-contenido/secciones/:id
```

Ejemplo:

```json
{
  "congreso_id": "{{congreso_id}}",
  "clave_seccion": "acerca-de",
  "titulo": "Acerca del Congreso",
  "cuerpo": "Información institucional.",
  "estado": "publicado"
}
```

La combinación de Congreso y `clave_seccion` es única. La clave admite letras
minúsculas, números y guiones.

## Banners

```http
POST   /gestion-contenido/banners
GET    /gestion-contenido/banners
GET    /gestion-contenido/banners/:id
PATCH  /gestion-contenido/banners/:id
DELETE /gestion-contenido/banners/:id
```

Ejemplo:

```json
{
  "congreso_id": "{{congreso_id}}",
  "archivo_multimedia_id": "{{imagen_banners_id}}",
  "titulo": "Inscripciones abiertas",
  "url_enlace": "https://www.utvm.edu.mx/registro",
  "activo": true,
  "orden": 1
}
```

La imagen es obligatoria. El enlace es opcional, pero debe ser HTTP(S). Los
banners públicos se ordenan por `orden` ascendente.

## Página oficial pública

```http
GET /pagina-oficial/congresos/:congresoId
GET /pagina-oficial/noticias/:slug
```

La primera ruta devuelve:

- Secciones con estado `publicado`.
- Tarjetas de noticias publicadas, sin el cuerpo completo.
- Banners activos ordenados.
- Conferencias y talleres en una agenda unificada por fecha y hora.

El detalle por slug devuelve el cuerpo completo de la noticia. Borradores,
banners inactivos y registros con soft delete no se exponen públicamente.

## Agenda

La administración conserva las rutas existentes:

```http
POST/PATCH /conferencias
POST/PATCH /taller
```

Las relaciones con Congreso, ubicación y ponente son obligatorias. La fecha
debe pertenecer al rango del Congreso y no puede existir otra Conferencia o
Taller superpuesto en la misma ubicación y fecha.

## Eliminación y archivos

Noticias, secciones y banners usan soft delete. Al retirar, reemplazar o
eliminar una portada o banner, el backend elimina también su registro y objeto
de Supabase. Si la limpieza falla, intenta restaurar la relación y responde un
error genérico sin exponer detalles del proveedor.
