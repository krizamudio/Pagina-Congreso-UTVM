export const categoriasAyuda = [
  {
    id: 'registro',
    nombre: 'Registro',
    icono: 'how_to_reg',
    descripcion: 'Dudas sobre inscripción al congreso.',
    preguntas: [
      {
        id: 'registro-1',
        pregunta: '¿Cómo puedo registrarme al congreso?',
        respuesta:
          'Puedes registrarte desde el menú principal seleccionando el tipo de registro que corresponde: Registro Externo, NSU, EMS o UTVM.',
      },
      {
        id: 'registro-2',
        pregunta: '¿Qué datos necesito para registrarme?',
        respuesta:
          'Necesitas tu nombre completo, correo electrónico, institución o empresa, teléfono y, dependiendo del tipo de registro, comprobante de pago y días de participación.',
      },
    ],
  },
  {
    id: 'qr',
    nombre: 'Código QR',
    icono: 'qr_code_2',
    descripcion: 'Consulta o reenvío de QR de acceso.',
    preguntas: [
      {
        id: 'qr-1',
        pregunta: '¿Dónde puedo consultar mi QR?',
        respuesta:
          'Después de iniciar sesión, entra al apartado Mi QR. Desde ahí puedes solicitar que tu código QR sea enviado nuevamente a tu correo.',
      },
      {
        id: 'qr-2',
        pregunta: '¿Qué pasa si perdí mi QR?',
        respuesta:
          'Puedes iniciar sesión con el correo registrado y usar la opción Reenviar mi QR para recibirlo nuevamente en tu correo.',
      },
    ],
  },
  {
    id: 'correo',
    nombre: 'Correo',
    icono: 'mail',
    descripcion: 'Validación y correos automáticos.',
    preguntas: [
      {
        id: 'correo-1',
        pregunta: '¿Qué hago si no recibí mi correo?',
        respuesta:
          'Revisa tu bandeja de entrada, spam o correo no deseado. Si el problema continúa, contacta al administrador del congreso.',
      },
      {
        id: 'correo-2',
        pregunta: '¿Necesito verificar mi correo?',
        respuesta:
          'Sí. Para algunos tipos de registro es necesario verificar el correo antes de poder iniciar sesión o recibir información del congreso.',
      },
    ],
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    icono: 'payments',
    descripcion: 'Validación de comprobantes.',
    preguntas: [
      {
        id: 'pagos-1',
        pregunta: '¿Cómo sé si mi pago fue validado?',
        respuesta:
          'Cuando el administrador valide tu comprobante, tu registro quedará autorizado y podrás recibir tu QR de acceso.',
      },
      {
        id: 'pagos-2',
        pregunta: '¿Qué pasa si mi comprobante es rechazado?',
        respuesta:
          'Deberás revisar la información enviada y contactar al área encargada para corregir o reenviar el comprobante correspondiente.',
      },
    ],
  },
  {
    id: 'talleres',
    nombre: 'Talleres',
    icono: 'construction',
    descripcion: 'Información sobre talleres disponibles.',
    preguntas: [
      {
        id: 'talleres-1',
        pregunta: '¿Cómo puedo ver los talleres disponibles?',
        respuesta:
          'Puedes consultar los talleres desde la opción Talleres del menú principal.',
      },
      {
        id: 'talleres-2',
        pregunta: '¿Puedo registrarme a un taller?',
        respuesta:
          'Cuando la inscripción esté habilitada, podrás seleccionar un taller disponible siempre que tenga cupo.',
      },
    ],
  },
  {
    id: 'contacto',
    nombre: 'Contacto',
    icono: 'support_agent',
    descripcion: 'Ayuda general del congreso.',
    preguntas: [
      {
        id: 'contacto-1',
        pregunta: '¿Con quién puedo resolver una duda?',
        respuesta:
          'Puedes acudir con el área encargada del congreso o consultar la información publicada en el portal oficial.',
      },
    ],
  },
];
