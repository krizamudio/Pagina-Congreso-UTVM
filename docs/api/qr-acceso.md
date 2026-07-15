# API: QR de acceso

Base URL local: `http://localhost:3000/api`

El QR contiene un token opaco aleatorio. El backend almacena únicamente su
hash SHA-256. Un mismo QR puede utilizarse una vez por cada día autorizado.

## Prueba rápida de extremo a extremo

### 1. Preparar el entorno

Instala las dependencias desde la raíz del monorepo:

```bash
pnpm install
```

Configura PostgreSQL y el correo en `apps/backend/.env`. Para probar el flujo
visual completo, apunta el QR al frontend, que usa enrutamiento hash:

```dotenv
QR_ACCESS_BASE_URL=http://localhost:9000/acceso/qr
CONGRESS_TIMEZONE=America/Mexico_City

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=usuario
MAIL_PASS=contraseña
MAIL_FROM=Congreso UTVM <congreso@example.com>
```

También puede usarse un capturador SMTP local. Lo importante es que el mensaje
pueda consultarse, porque la imagen PNG se envía por correo y el token sin hash
no se guarda en PostgreSQL.

Levanta el backend y el frontend:

```bash
pnpm dev
```

Abre `http://localhost:9000/#/participantes`. El backend debe responder en
`http://localhost:3000/api`. Todas las rutas de esta guía heredan el rate limit
global configurado en `AppModule`.

El flujo habitual requiere un solo botón:

1. Localiza al participante en EMS, UTVM, Externos o el detalle NSU.
2. Para Externos o NSU, completa primero la validación de correo y pago/estatus.
3. Presiona el botón con el icono QR en su fila.
4. El backend selecciona el congreso vigente o próximo, genera sus días si
   todavía no existen y respeta los días elegidos durante el registro.
5. Revisa el buzón del participante.

Al escanear el QR se abre la pantalla pública de validación. Consultarlo no
consume la entrada; esta se registra únicamente al presionar
**Confirmar entrada**.

### 2. Obtener un congreso vigente

El congreso debe incluir la fecha actual en su rango. De lo contrario, el QR
se puede emitir, pero al validarlo responderá `FUERA_DE_FECHA_DEL_EVENTO`.

Consulta los congresos existentes:

```bash
curl -sS http://localhost:3000/api/congreso
```

Si necesitas crear uno, usa fechas ISO que incluyan el día de la prueba. El
ejemplo siguiente usa el 14 de julio de 2026; reemplázalo por la fecha actual:

```bash
curl -sS -X POST http://localhost:3000/api/congreso \
  -H 'Content-Type: application/json' \
  -d '{
    "nombre": "Congreso de prueba QR",
    "eslogan": "Validación de accesos",
    "ubicacion": "UTVM",
    "fecha_inicio": "2026-07-14T08:00:00-06:00",
    "fecha_fin": "2026-07-14T20:00:00-06:00"
  }'
```

La creación actual de congresos devuelve un mensaje, no el UUID. Vuelve a
consultar `GET /congreso` y copia el campo `id` del congreso creado.

En los siguientes ejemplos reemplaza:

- `CONGRESO_ID` por el UUID del congreso.
- `DIA_EVENTO_ID` por el UUID de uno de sus días.
- `PARTICIPANTE_ID` por el identificador del participante.

### 3. Generar los días del evento

La operación es idempotente: ejecutarla varias veces no duplica los días.

```bash
curl -sS -X POST \
  http://localhost:3000/api/congresos/CONGRESO_ID/dias-evento/generar
```

Respuesta esperada:

```json
[
  {
    "id": "DIA_EVENTO_ID",
    "fechaEvento": "2026-07-14",
    "etiqueta": "Dia 1"
  }
]
```

También pueden consultarse sin volver a generarlos:

```bash
curl -sS \
  http://localhost:3000/api/congresos/CONGRESO_ID/dias-evento
```

### 4. Elegir un participante válido

No se crean participantes desde el módulo QR. Usa un registro existente y
verifica sus requisitos:

| Tipo | ID de la ruta | Requisitos |
| --- | --- | --- |
| UTVM | Entero | Existente y no eliminado |
| EMS | Entero | Existente y no eliminado |
| Externo | UUID | Existente, no eliminado, correo verificado y estatus `validado` |
| NSU | UUID del registro + UUID del participante | Correo verificado, pago `VALIDADO` y pertenecer al registro indicado |

Los IDs pueden consultarse en `GET /utvm`, `GET /ems`, `GET /externos` o
`GET /registro-nsu/:registroId`, según corresponda.

### 5. Emitir y enviar el QR

El frontend utiliza las variantes semiautomáticas sin body:

```http
POST /utvm/:id/qr-acceso/enviar-automatico
POST /ems/:id/qr-acceso/enviar-automatico
POST /externos/:id/qr-acceso/enviar-automatico
POST /registro-nsu/:registroId/participantes/:participanteId/qr-acceso/enviar-automatico
```

Las rutas manuales se conservan para casos administrativos excepcionales.

El cuerpo es igual para los cuatro tipos:

```json
{
  "congresoId": "CONGRESO_ID",
  "diaEventoIds": ["DIA_EVENTO_ID"]
}
```

Ejemplo para UTVM:

```bash
curl -sS -X POST \
  http://localhost:3000/api/utvm/PARTICIPANTE_ID/qr-acceso/enviar \
  -H 'Content-Type: application/json' \
  -d '{
    "congresoId": "CONGRESO_ID",
    "diaEventoIds": ["DIA_EVENTO_ID"]
  }'
```

Rutas equivalentes:

```http
POST /ems/:id/qr-acceso/enviar
POST /externos/:id/qr-acceso/enviar
POST /registro-nsu/:registroId/participantes/:participanteId/qr-acceso/enviar
```

Respuesta esperada:

```json
{
  "mensaje": "QR de acceso enviado correctamente",
  "participante_id": "PARTICIPANTE_ID"
}
```

Revisa el buzón configurado. Una segunda emisión para la misma persona y
congreso revoca el QR anterior y envía uno nuevo. Los accesos diarios que ya
fueron consumidos no se reinician.

Si SMTP falla, la API responde `503`. El QR ya emitido queda activo, pero un
nuevo intento lo revoca y genera otro, por lo que es seguro reintentar.

### 6. Consultar sin consumir

Escanea la imagen recibida. El navegador abrirá la pantalla visual de
validación en:

```text
http://localhost:9000/acceso/qr/TOKEN_QR
```

La pantalla consulta el QR sin registrar la entrada y muestra el botón
`Confirmar entrada`. Para probar directamente el contrato HTTP también puedes
usar:

```bash
curl -sS http://localhost:3000/api/acceso/qr/TOKEN_QR
```

Respuesta esperada:

```json
{
  "valido": true,
  "puedeIngresar": true,
  "resultado": "QR_VALIDO",
  "participante": {
    "id": "PARTICIPANTE_ID",
    "nombreCompleto": "Nombre del participante",
    "tipo": "UTVM"
  },
  "dia": {
    "id": "DIA_EVENTO_ID",
    "fecha": "2026-07-14",
    "accesoUtilizado": false
  }
}
```

### 7. Confirmar la entrada

```bash
curl -sS -X POST \
  http://localhost:3000/api/acceso/qr/TOKEN_QR/confirmar
```

La respuesta debe incluir `"accesoUtilizado": true` y `fechaIngreso`. Repetir
la misma petición debe devolver HTTP `409` con
`resultado: "ACCESO_YA_UTILIZADO"`.

## Probar concurrencia manualmente

Ejecuta dos confirmaciones casi simultáneas con un QR todavía no utilizado:

```bash
curl -sS -o /tmp/qr-confirmacion-1.json -w 'peticion 1: %{http_code}\n' \
  -X POST http://localhost:3000/api/acceso/qr/TOKEN_QR/confirmar &
curl -sS -o /tmp/qr-confirmacion-2.json -w 'peticion 2: %{http_code}\n' \
  -X POST http://localhost:3000/api/acceso/qr/TOKEN_QR/confirmar &
wait
```

El resultado correcto es una respuesta `200` y una `409`. Nunca deben existir
dos confirmaciones exitosas para el mismo participante y día.

## Revocar manualmente

```bash
curl -sS -X PATCH \
  http://localhost:3000/api/codigo-qr/CODIGO_QR_ID/revocar \
  -H 'Content-Type: application/json' \
  -d '{"motivo":"QR reportado como extraviado"}'
```

Respuesta: `Codigo QR revocado correctamente`.

El endpoint de envío no expone `CODIGO_QR_ID`. Mientras no exista una consulta
administrativa autenticada, para esta prueba debe obtenerse desde una consola
de PostgreSQL:

```sql
SELECT codigo_qr.id, participante_acceso.tipo,
       participante_acceso.referencia_id
FROM qr_acceso
JOIN codigo_qr ON codigo_qr.id = qr_acceso.codigo_qr_id
JOIN participante_acceso
  ON participante_acceso.id = qr_acceso.participante_id
WHERE codigo_qr.activo = TRUE;
```

Después de revocarlo, consultar o confirmar su token debe responder `422` con
`resultado: "QR_INACTIVO"`.

## Casos negativos recomendados

- Token con caracteres inválidos o longitud distinta de 43: `400`.
- UUID de congreso o día inválido: `400`.
- Día que pertenece a otro congreso: `400`.
- Participante inexistente o eliminado: `404`.
- Externo sin correo verificado: `422`.
- NSU sin correo verificado o sin pago `VALIDADO`: `422`.
- QR válido en un día fuera del congreso: `422`.
- Segundo uso del mismo QR en el mismo día: `409`.
- QR anterior después de regenerarlo: `422`, `QR_INACTIVO`.
- Proveedor SMTP no disponible: `503` sin detalles internos del proveedor.

## Verificación del código

Desde la raíz del repositorio:

```bash
pnpm --filter backend build
pnpm --filter frontend typecheck
pnpm --filter frontend build
```

## Códigos de error

- `400`: token, UUID, días o cuerpo inválidos.
- `404`: `QR_NO_ENCONTRADO` o recurso inexistente.
- `409`: `ACCESO_YA_UTILIZADO`.
- `422`: QR inactivo o expirado, participante no validado, día no autorizado
  o fecha fuera del congreso.
- `503`: el QR se generó, pero el proveedor SMTP no pudo enviar el correo.

Autenticación, bitácora de escaneos, identificación del validador, salida y
reingreso quedan fuera de esta fase.
