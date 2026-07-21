export const categoriasAyuda = [
  {
    id: "registro",
    nombre: "Registro",
    icono: "app_registration",
    descripcion: "Información sobre el proceso de registro",
    preguntas: [
      {
        id: "como-registrarme",
        pregunta: "¿Cómo me registro?",
        respuesta:
          "Selecciona en el menú el tipo de registro que te corresponde, completa todos los campos solicitados y presiona el botón para guardar tu registro."
      },
      {
        id: "tipo-registro",
        pregunta: "¿Qué tipo de registro debo elegir?",
        respuesta:
          "Utiliza Registro UTVM si perteneces a la universidad. Utiliza Registro EMS o Registro Externo según la institución o el tipo de participante indicado en el formulario."
      },
      {
        id: "varias-personas",
        pregunta: "¿Puedo registrar a varias personas?",
        respuesta:
          "Algunos formularios permiten agregar varios participantes antes de guardar. Revisa la tabla de participantes y confirma que todos los datos sean correctos."
      },
      {
        id: "registro-exitoso",
        pregunta: "¿Cómo sé si mi registro fue exitoso?",
        respuesta:
          "El sistema mostrará una notificación de confirmación después de guardar correctamente la información."
      }
    ]
  },
  {
    id: "talleres",
    nombre: "Talleres",
    icono: "construction",
    descripcion: "Consulta e inscripción a los talleres disponibles",
    preguntas: [
      {
        id: "consultar-talleres",
        pregunta: "¿Dónde consulto los talleres?",
        respuesta:
          "Puedes consultar los talleres disponibles desde la opción Talleres del menú principal."
      },
      {
        id: "registro-taller",
        pregunta: "¿Cómo me registro a un taller?",
        respuesta:
          "Ingresa a la sección Talleres, selecciona el taller disponible y sigue las instrucciones de registro mostradas en pantalla."
      },
      {
        id: "cambiar-taller",
        pregunta: "¿Puedo cambiar de taller?",
        respuesta:
          "El cambio dependerá de la disponibilidad de lugares y de las reglas establecidas por los organizadores."
      },
      {
        id: "cantidad-talleres",
        pregunta: "¿Cuántos talleres puedo elegir?",
        respuesta:
          "La cantidad permitida será indicada durante el proceso de registro a talleres."
      }
    ]
  },
  {
    id: "agenda",
    nombre: "Agenda",
    icono: "event_note",
    descripcion: "Horarios y actividades programadas del evento",
    preguntas: [
      {
        id: "consultar-agenda",
        pregunta: "¿Dónde consulto la agenda?",
        respuesta:
          "Selecciona la opción Agenda en el menú superior para consultar las actividades programadas."
      },
      {
        id: "inicio-evento",
        pregunta: "¿A qué hora inicia el evento?",
        respuesta:
          "Los horarios oficiales estarán disponibles en la sección Agenda."
      },
      {
        id: "actividades-dia",
        pregunta: "¿Dónde veo las actividades del día?",
        respuesta:
          "Dentro de la Agenda podrás revisar las actividades organizadas por fecha y horario."
      }
    ]
  },
  {
    id: "conferencias",
    nombre: "Conferencias",
    icono: "record_voice_over",
    descripcion: "Información sobre conferencias y ponentes",
    preguntas: [
      {
        id: "consultar-conferencias",
        pregunta: "¿Dónde consulto las conferencias?",
        respuesta:
          "Selecciona Conferencias en el menú superior para consultar la información disponible."
      },
      {
        id: "ponentes",
        pregunta: "¿Quiénes serán los ponentes?",
        respuesta:
          "Puedes consultar a los participantes y ponentes desde las secciones Conferencias y Panelistas."
      },
      {
        id: "ubicacion-conferencias",
        pregunta: "¿Dónde se realizarán?",
        respuesta:
          "La ubicación de cada conferencia aparecerá en su información o dentro de la agenda oficial."
      }
    ]
  },
  {
    id: "codigo-qr",
    nombre: "Código QR",
    icono: "qr_code_2",
    descripcion: "Recepción y uso del código de acceso",
    preguntas: [
      {
        id: "recibir-qr",
        pregunta: "¿Cuándo recibo mi código QR?",
        respuesta:
          "El código QR se generará o enviará después de completar correctamente el proceso de registro, según la configuración actual del sistema."
      },
      {
        id: "uso-qr",
        pregunta: "¿Para qué sirve el código QR?",
        respuesta:
          "El código QR permitirá identificar tu registro y podrá utilizarse para controlar el acceso o la asistencia al evento."
      },
      {
        id: "qr-no-recibido",
        pregunta: "¿Qué hago si no recibí mi código QR?",
        respuesta:
          "Verifica que el correo registrado sea correcto y revisa la carpeta de correo no deseado. Si el problema continúa, comunícate con los organizadores."
      },
      {
        id: "qr-impreso",
        pregunta: "¿Debo llevarlo impreso?",
        respuesta:
          "Puedes mostrarlo desde tu teléfono. También puedes llevarlo impreso como respaldo."
      }
    ]
  },
  {
    id: "contacto",
    nombre: "Contacto",
    icono: "support_agent",
    descripcion: "Ayuda adicional y contacto con los organizadores",
    preguntas: [
      {
        id: "duda-no-disponible",
        pregunta: "¿Qué hago si mi duda no aparece?",
        respuesta:
          "Comunícate directamente con los organizadores del Congreso UTVM para recibir atención personalizada."
      },
      {
        id: "ubicacion-universidad",
        pregunta: "¿Dónde está ubicada la universidad?",
        respuesta:
          "Consulta la información oficial de ubicación proporcionada por la Universidad Tecnológica del Valle del Mezquital."
      },
      {
        id: "contactar-organizadores",
        pregunta: "¿Con quién puedo comunicarme?",
        respuesta:
          "Aqui se agregar un correo de contacto, ejemplo: Bryan@gmail.com"
      }
    ]
  }
];
