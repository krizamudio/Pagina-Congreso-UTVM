# Sistema Congreso

Monorepo para el sistema web del congreso. Este repositorio contiene el backend desarrollado con NestJS y el frontend desarrollado con Quasar/Vue.

## Estructura del proyecto

```text
sistema-congreso/
├── apps/
│   ├── backend/      # API REST con NestJS
│   └── frontend/     # Aplicación web con Quasar/Vue
├── package.json      # Scripts generales del monorepo
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── README.md
```

## Tecnologías principales

### Backend

* NestJS
* TypeScript
* Node.js
* pnpm

### Frontend

* Quasar Framework
* Vue
* TypeScript
* Vite
* pnpm

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

```bash
node -v
pnpm -v
```

Este proyecto utiliza pnpm como gestor de paquetes. No se recomienda usar `npm install` ni `yarn install` dentro del proyecto.

Si no tienes pnpm, puedes instalarlo con:

```bash
corepack enable
```

O directamente con npm:

```bash
npm install -g pnpm
```

## Instalación del proyecto

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd sistema-congreso
```

Instalar dependencias desde la raíz del monorepo:

```bash
pnpm install
```

No instales dependencias entrando manualmente a `apps/backend` o `apps/frontend`, a menos que sepas exactamente lo que estás haciendo.

## Cómo ejecutar el proyecto

### Levantar backend

Desde la raíz:

```bash
pnpm dev:backend
```

El backend normalmente se ejecutará en:

```text
http://localhost:3000
```

### Levantar frontend

Desde la raíz:

```bash
pnpm dev:frontend
```

El frontend normalmente se ejecutará en:

```text
http://localhost:9000
```

### Levantar backend y frontend al mismo tiempo

Desde la raíz:

```bash
pnpm dev
```

Este comando ejecuta los proyectos del monorepo en paralelo.

## Scripts principales

Los scripts principales se ejecutan desde la raíz del repositorio.

```bash
pnpm dev
```

Levanta backend y frontend al mismo tiempo.

```bash
pnpm dev:backend
```

Levanta solamente el backend.

```bash
pnpm dev:frontend
```

Levanta solamente el frontend.

```bash
pnpm build
```

Compila todos los proyectos del monorepo.

```bash
pnpm build:backend
```

Compila solamente el backend.

```bash
pnpm build:frontend
```

Compila solamente el frontend.

## Cómo instalar dependencias

### Instalar una dependencia solo en el backend

```bash
pnpm --filter backend add nombre-paquete
```

Ejemplo:

```bash
pnpm --filter backend add @nestjs/config
```

### Instalar una dependencia solo en el frontend

```bash
pnpm --filter frontend add nombre-paquete
```

Ejemplo:

```bash
pnpm --filter frontend add axios
```

### Instalar una dependencia de desarrollo en la raíz

```bash
pnpm add -D nombre-paquete -w
```

Ejemplo:

```bash
pnpm add -D prettier -w
```

El parámetro `-w` indica que la dependencia se instalará en la raíz del workspace.

## Reglas importantes del monorepo

Este proyecto es un monorepo, por lo tanto:

* Hay un solo repositorio Git.
* Hay un solo `pnpm-lock.yaml` en la raíz.
* Las dependencias se instalan desde la raíz.
* Backend y frontend están separados dentro de `apps/`.
* No se debe crear un repositorio Git dentro de `apps/backend` ni dentro de `apps/frontend`.

La estructura correcta es:

```text
apps/backend/
apps/frontend/
```

La estructura incorrecta sería:

```text
apps/backend/.git/
apps/frontend/.git/
```

Para verificar que no existan repositorios internos:

```bash
find apps -name .git -type d
```

Si el comando no muestra nada, está correcto.

## Archivos que no deben subirse

No se deben subir archivos o carpetas generadas automáticamente, por ejemplo:

```text
node_modules/
dist/
.quasar/
.env
```

El archivo `.gitignore` de la raíz debe evitar que estos archivos se agreguen al repositorio.

## Variables de entorno

Cada aplicación puede tener sus propias variables de entorno.

Ejemplo para backend:

```text
apps/backend/.env
```

Ejemplo para frontend:

```text
apps/frontend/.env
```

No se deben subir archivos `.env` reales al repositorio.

En su lugar, se recomienda crear archivos de ejemplo:

```text
apps/backend/.env.example
apps/frontend/.env.example
```

## Comunicación entre frontend y backend

El frontend no debe importar código directamente desde el backend.

La comunicación debe hacerse mediante peticiones HTTP a la API.

Ejemplo:

```text
Frontend Quasar  →  Backend NestJS
http://localhost:9000  →  http://localhost:3000
```

El backend usa prefijo global `/api`, las rutas quedarían así:

```text
http://localhost:3000/api/auth/login
http://localhost:3000/api/users
```

## Flujo de trabajo con GitFlow

Este proyecto puede trabajarse usando GitFlow.

### Ramas principales

```text
main
develop
```

La rama `main` representa la versión estable del proyecto.

La rama `develop` representa la versión de desarrollo donde se integran las nuevas funcionalidades.

### Crear una nueva funcionalidad

Primero actualizar `develop`:

```bash
git checkout develop
git pull origin develop
```

Crear una rama nueva desde `develop`:

```bash
git checkout -b feature/nombre-funcionalidad
```

Ejemplo:

```bash
git checkout -b feature/login
```

Trabajar normalmente y guardar cambios:

```bash
git add .
git commit -m "feat: agregar login"
```

Subir la rama:

```bash
git push -u origin feature/login
```

Después se debe abrir un Pull Request hacia:

```text
feature/login → develop
```

## Actualizar una rama feature con develop

Si `develop` recibió cambios mientras se trabaja en una feature, se puede actualizar la rama con merge.

Estando en la rama feature:

```bash
git fetch origin
git merge origin/develop
```

Si hay conflictos, se resuelven los archivos afectados y luego:

```bash
git add .
git commit
git push
```

Este proyecto recomienda usar merge para evitar reescribir historial, especialmente si varias personas trabajan en la misma rama.

## Convención recomendada para commits

Se recomienda usar mensajes claros y consistentes.

Ejemplos:

```bash
git commit -m "feat: agregar inicio de sesión"
git commit -m "fix: corregir validación de formulario"
git commit -m "chore: configurar monorepo"
git commit -m "docs: actualizar README"
git commit -m "style: ajustar estilos del navbar"
git commit -m "refactor: reorganizar servicio de usuarios"
```

Tipos comunes:

```text
feat      Nueva funcionalidad
fix       Corrección de error
docs      Cambios en documentación
style     Cambios visuales o de formato
refactor  Mejora interna del código
chore     Configuración o mantenimiento
test      Pruebas
```

## Builds aprobados de pnpm

pnpm puede bloquear scripts de instalación de algunas dependencias por seguridad.

Para revisar paquetes con builds bloqueados:

```bash
pnpm ignored-builds
```

Para aprobar un paquete específico:

```bash
pnpm approve-builds nombre-paquete
```

No se recomienda aprobar paquetes desconocidos sin revisar primero su origen.

Para revisar de dónde viene una dependencia:

```bash
pnpm why nombre-paquete
```

## Comandos útiles

Ver estado de Git:

```bash
git status
```

Ver ramas:

```bash
git branch
```

Cambiar de rama:

```bash
git checkout nombre-rama
```

Actualizar dependencias del monorepo:

```bash
pnpm install
```

Ver proyectos detectados por pnpm:

```bash
pnpm -r list --depth -1
```

Ejecutar backend:

```bash
pnpm dev:backend
```

Ejecutar frontend:

```bash
pnpm dev:frontend
```

Ejecutar todo:

```bash
pnpm dev
```

## Recomendaciones para el equipo

* Usar siempre pnpm.
* Instalar dependencias desde la raíz.
* No subir `node_modules`.
* No subir archivos `.env`.
* Trabajar en ramas feature.
* Hacer Pull Request hacia `develop`.
* Probar backend y frontend antes de abrir un Pull Request.
* Mantener actualizado el `README.md` cuando cambie el flujo del proyecto.
