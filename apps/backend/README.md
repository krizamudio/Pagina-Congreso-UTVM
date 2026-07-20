<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## RF-21: inscripciones y reconocimientos

### Inscripciones a talleres

- `POST /talleres/:tallerId/inscripciones` recibe `tipoParticipante` (`UTVM`,
  `EMS`, `NSU` o `EXTERNO`) y `referenciaId`.
- `GET /talleres/:tallerId/inscripciones` lista las inscripciones del taller.

El alta valida al participante, exige que el taller pertenezca a un congreso,
impide más de un taller por participante dentro del mismo congreso y bloquea el
taller durante la comprobación de cupo. No se aceptan altas después de la hora
de inicio. Hasta incorporar autenticación, los identificadores se reciben en el
cuerpo de la petición.

### Reconocimientos automáticos

El job prepara registros después de la hora de fin: uno `GENERAL` por persona
inscrita en un taller, uno `TALLERISTA` para su ponente y uno `CONFERENCISTA`
para el ponente de una conferencia. Su clave de emisión única y las inserciones
`insert-or-ignore` permiten ejecutar el job en varias instancias sin duplicar
reconocimientos.

- `GET /reconocimientos` acepta `congresoId`, `tallerId`, `conferenciaId`,
  `tipo`, `estado`, `page` y `limit`.
- `GET /reconocimientos/:id` devuelve metadatos sin el error interno.
- `GET /reconocimientos/:id/pdf` renderiza y descarga nuevamente el PDF.

Los PDF no se almacenan. Cada intento actualiza estado, contador y, cuando
tiene éxito, la primera fecha de emisión y el SHA-256 del documento. Los errores
detallados permanecen en la base de datos con `select: false`; la API responde
con un mensaje genérico.

Variables del job:

- `RECONOCIMIENTOS_JOB_ENABLED`: `true` por defecto.
- `RECONOCIMIENTOS_CRON`: `*/5 * * * *` por defecto.
- `RECONOCIMIENTOS_TIMEZONE`: `America/Mexico_City` por defecto.

Las plantillas PPTX se conservan en `src/resources`. En runtime se copian sus
fondos JPG y la fuente Unicode Noto Sans Bold (SIL Open Font License) a `dist`.

### Vista previa manual de los PDF

Esta prueba permite revisar visualmente las plantillas sin levantar PostgreSQL,
crear inscripciones ni esperar la ejecución del job. Primero compila el backend
desde la raíz del repositorio:

```bash
pnpm --filter backend build
```

Después copia en la terminal la función siguiente. Sus tres parámetros son el
tipo de reconocimiento, el nombre que aparecerá en el PDF y la ruta del archivo
de salida. Esta variante es para Bash o Zsh:

```bash
generar_reconocimiento() {
  TIPO_RECONOCIMIENTO="$1" \
  NOMBRE_RECONOCIMIENTO="$2" \
  ARCHIVO_RECONOCIMIENTO="$3" \
  node <<'NODE'
const fs = require('node:fs');
const {
  ReconocimientoRendererService,
} = require('./apps/backend/dist/reconocimiento/services/reconocimiento-renderer.service');

async function main() {
  const renderer = new ReconocimientoRendererService();
  const pdf = await renderer.render(
    process.env.TIPO_RECONOCIMIENTO,
    process.env.NOMBRE_RECONOCIMIENTO,
  );
  fs.writeFileSync(process.env.ARCHIVO_RECONOCIMIENTO, pdf);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
NODE
}
```

Si la terminal utiliza Fish, copia esta variante:

```fish
function generar_reconocimiento
  env TIPO_RECONOCIMIENTO="$argv[1]" \
      NOMBRE_RECONOCIMIENTO="$argv[2]" \
      ARCHIVO_RECONOCIMIENTO="$argv[3]" \
      node -e '
const fs = require("node:fs");
const {
  ReconocimientoRendererService,
} = require("./apps/backend/dist/reconocimiento/services/reconocimiento-renderer.service");

async function main() {
  const renderer = new ReconocimientoRendererService();
  const pdf = await renderer.render(
    process.env.TIPO_RECONOCIMIENTO,
    process.env.NOMBRE_RECONOCIMIENTO,
  );
  fs.writeFileSync(process.env.ARCHIVO_RECONOCIMIENTO, pdf);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
'
end
```

Tipos admitidos:

- `GENERAL`: reconocimiento para una persona inscrita en un taller.
- `TALLERISTA`: reconocimiento para quien imparte un taller.
- `CONFERENCISTA`: reconocimiento para quien imparte una conferencia.

Ejemplos listos para generar las tres plantillas:

```bash
generar_reconocimiento GENERAL "María José Hernández González" /tmp/reconocimiento-general.pdf
generar_reconocimiento TALLERISTA "Óscar Núñez Ramírez" /tmp/reconocimiento-tallerista.pdf
generar_reconocimiento CONFERENCISTA "María Fernanda de los Ángeles Hernández González del Valle" /tmp/reconocimiento-conferencista.pdf
```

Para abrir los documentos en Linux:

```bash
xdg-open /tmp/reconocimiento-general.pdf
xdg-open /tmp/reconocimiento-tallerista.pdf
xdg-open /tmp/reconocimiento-conferencista.pdf
```

El nombre acepta caracteres Unicode, incluidos acentos. Los nombres largos
reducen automáticamente su tamaño para ajustarse al área disponible. También
puede cambiarse `/tmp/reconocimiento-*.pdf` por cualquier ruta de salida con
permisos de escritura.

Esta vista previa solo valida el renderizado visual. No crea un registro de
reconocimiento, no incrementa intentos, no calcula un hash persistido y no
ejecuta el job automático.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
