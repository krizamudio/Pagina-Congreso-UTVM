# Configuración de Supabase Storage

Guía paso a paso para crear una cuenta en Supabase, configurar el Storage y obtener las variables de entorno necesarias para el backend.

## 1. Crear una cuenta en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Click en **Start your project** o **Sign Up**
3. Puedes registrarte con GitHub, email o Google
4. Verifica tu cuenta si es necesario

## 2. Crear un nuevo proyecto

1. Una vez dentro del dashboard, click en **New Project**
2. Selecciona tu organización (o crea una nueva)
3. Completa los campos:
   - **Project name**: el nombre que quieras (ej: `congreso-imagenes`)
   - **Database Password**: genera una contraseña segura (guárdala, no se vuelve a mostrar)
   - **Region**: selecciona la más cercana a tu equipo
4. Click en **Create new project**
5. Espera a que el proyecto se cree (puede tomar 1-2 minutos)

## 3. Crear un bucket para las imágenes

1. En el dashboard del proyecto, ve a **Storage** en el menú lateral izquierdo
2. Click en **New bucket**
3. Completa los campos:
   - **Name**: `congreso-imagenes` (debe coincidir con la variable `SUPABASE_BUCKET`)
   - **Public bucket**: activar esta opción para que las imágenes sean accesibles por URL pública
4. Click en **Create bucket**

## 4. Configurar permisos del bucket

Para que el backend pueda subir archivos, necesitas configurar las políticas de acceso:

1. Ve a **Storage** > click en el bucket `congreso-imagenes`
2. Ve a la pestaña **Policies**
3. Click en **New policy** y selecciona **For full customization**
4. Crea una política con los siguientes datos:

**Nombre**: `allow_upload_from_backend`

**Operación**: `INSERT`

**Effect**: `ALLOW`

**Target roles**: `authenticated` (o `service_role` si usas la service role key)

** USING expression** (para SELECT/DELETE):

```sql
bucket_id = 'congreso-imagenes'
```

**WITH CHECK expression** (para INSERT/UPDATE):

```sql
bucket_id = 'congreso-imagenes'
```

> **Nota**: Si usas la `service_role` key, las políticas de RLS no aplican porque esa key tiene acceso total. En ese caso, la configuración de políticas es opcional pero recomendada como buena práctica.

## 5. Obtener las API Keys

### URL del proyecto

1. En el dashboard, ve a **Project Settings** (icono de engranaje)
2. En la pestaña **General**, busca **Project URL**
3. Copia la URL. Tiene el formato:

```text
https://TU-PROYECTO.supabase.co
```

Esta es tu variable `SUPABASE_URL`.

### Service Role Key

1. Ve a **Project Settings** > **API**
2. En la sección **Project API keys**, busca **service_role**
3. Copia la clave. Tiene el formato:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O en nuevos proyectos:

```text
sb_secret_...
```

> **IMPORTANTE**: La `service_role` key tiene acceso total a tu proyecto, incluyendo la capacidad de eliminar buckets y archivos. Nunca la subas al repositorio ni la expongas en el frontend.

Esta es tu variable `SUPABASE_SECRET_KEY`.

## 6. Configurar las variables de entorno en el backend

Abre el archivo `apps/backend/.env` y completa las variables de Supabase:

```env
# =========================
# Supabase Storage
# =========================
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SECRET_KEY=tu_service_role_key_aqui
SUPABASE_BUCKET=congreso-imagenes
SUPABASE_TIMEOUT_MS=15000
```

Si no tienes el archivo `.env`, copia el ejemplo:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Y edita con tus valores.

## 7. Verificar la conexión

El backend valida las variables de entorno al iniciar. Si algo está mal, mostrará un error claro:

| Error                                                             | Causa                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| `Faltan variables de entorno de Supabase`                         | `SUPABASE_URL` o `SUPABASE_SECRET_KEY` no están definidas |
| `SUPABASE_URL debe tener formato https://TU-PROYECTO.supabase.co` | La URL no contiene `.supabase.co`                         |
| `SUPABASE_SECRET_KEY debe ser una API key de Supabase...`         | La key no tiene formato válido (JWT o `sb_secret_...`)    |

Si el backend inicia sin errores, la conexión con Supabase está configurada correctamente.

### Carpetas virtuales de RF-24

Supabase Storage crea las carpetas implícitamente a partir del nombre del
objeto. RF-24 no requiere configurarlas en el dashboard: el backend utiliza
`imagenes/noticias/` para portadas y `imagenes/banners/` para banners dentro
del bucket configurado.

## Variables de entorno requeridas

| Variable              | Descripción                                | Ejemplo                         |
| --------------------- | ------------------------------------------ | ------------------------------- |
| `SUPABASE_URL`        | URL del proyecto Supabase                  | `https://abc123.supabase.co`    |
| `SUPABASE_SECRET_KEY` | API key (service_role o anon)              | `eyJhbGci...` o `sb_secret_...` |
| `SUPABASE_BUCKET`     | Nombre del bucket de Storage               | `congreso-imagenes`             |
| `SUPABASE_TIMEOUT_MS` | Timeout de las solicitudes en milisegundos | `15000`                         |

> **Nota**: `SUPABASE_BUCKET` tiene valor por defecto `congreso-imagenes`, por lo que es opcional si no cambiaste el nombre del bucket.

## Errores comunes

### Las imágenes no se suben

1. Verifica que el bucket exista y sea **público**
2. Verifica que la API key tenga permisos de `INSERT` en Storage
3. Revisa los logs del backend para ver el mensaje de error exacto

### Las imágenes se suben pero no se pueden acceder

1. Verifica que el bucket esté configurado como **público**
2. Prueba acceder directamente a la URL que devuelve el endpoint

### Error de CORS

1. Ve a **Project Settings** > **API** > **CORS Configuration**
2. Agrega el dominio de tu frontend a la lista de orígenes permitidos
