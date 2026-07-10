import { BadRequestException, Injectable } from '@nestjs/common';

/*
 * ValidadorCommon — Validación de fechas y horas para eventos
 *
 * Formatos esperados:
 *   - Fecha: ISO 8601 con separador "T" → "YYYY-MM-DDThh:mm:ss"
 *     Ejemplo: "2026-07-15T10:00:00"
 *   - Hora:  "HH:mm" o "HH:mm:ss"
 *     Ejemplo: "14:30" o "14:30:00"
 *
 * ¿Por qué convertir la fecha manualmente?
 *   Si se usa `new Date("2026-07-15")` JavaScript la interpreta como
 *   medianoche en UTC, lo que al comparar con la hora local del servidor
 *   puede causar un desfase de un día. Para evitarlo, `convertirFechaLocal`
 *   extrae año, mes y día de la cadena ISO y construye el Date con
 *   componentes numéricos locales (year, month-1, day).
 *
 * ¿Cómo se comparan las horas?
 *   Se convierten a total de segundos (h×3600 + m×60 + s) y se compara
 *   directamente. Si `horaFin <= horaInicio` se lanza BadRequestException.
 *
 * Finalidad del flujo:
 *   Esta clase es una capa de validación reutilizable que se invoca antes
 *   de create y update para garantizar que las fechas y horas de los
 *   eventos siempre tengan sentido lógico y estén en el futuro:
 *     1. No crear eventos en el pasado.
 *     2. No crear eventos con horas invertidas.
 *     3. No actualizar parcialmente rompiendo la lógica (PATCH).
 *     4. No crear eventos con rangos de fechas inválidos.
 *
 * Métodos públicos:
 *   - FechaValida(fecha):
 *       Valida que la fecha sea estrictamente posterior a la fecha actual.
 *       Compara fechas a medianoche local para evitar falsos negativos.
 *   - ValidarHoras(horaFin, horaInicio):
 *       Valida que horaFin > horaInicio (ambas en segundos).
 *   - ValidarRangoFechas(fechaInicio, fechaFin):
 *       Para eventos multi-día: valida que ambas fechas sean posteriores
 *       a hoy y que fin >= inicio.
 *   - ValidarHorasActualizacion(horaFinActual, horaInicioActual, ...):
 *       Para PATCH/PUT: usa el valor nuevo si se proporcionó, si no usa el
 *       actual (con ??), y delega a ValidarHoras.
 *   - ValidarFechasActualizacion(fechaInicioActual, fechaFinActual, ...):
 *       Para PATCH/PUT: usa el valor nuevo si se proporcionó, si no usa el
 *       actual (con ??), y delega a ValidarRangoFechas.
 */
@Injectable()
export class ValidadorCommon {
  private convertirFechaLocal(fecha: string): Date {
    const [anio, mes, dia] = fecha.split('T')[0].split('-').map(Number);

    return new Date(anio, mes - 1, dia);
  }

  private convertirHoraASegundos(hora: string): number {
    const [horas, minutos, segundos = '0'] = hora.split(':');

    return Number(horas) * 3600 + Number(minutos) * 60 + Number(segundos);
  }

  // Valida fechas de eventos futuros sin depender del huso horario UTC.
  FechaValida(fecha: string | undefined): void {
    if (fecha) {
      const fechaFormateada: Date = this.convertirFechaLocal(fecha);
      const diaActual: Date = new Date();
      const diaActualFormateado: Date = new Date(
        diaActual.getFullYear(),
        diaActual.getMonth(),
        diaActual.getDate(),
      );

      if (fechaFormateada.getTime() <= diaActualFormateado.getTime()) {
        throw new BadRequestException(
          'La fecha no puede ser anterior ni igual al dia actual',
        );
      }
    }
  }

  // Valida que un evento termine despues de iniciar.
  ValidarHoras(horaFin: string, horaInicio: string): void {
    if (
      this.convertirHoraASegundos(horaFin) <=
      this.convertirHoraASegundos(horaInicio)
    ) {
      throw new BadRequestException(
        'La hora de fin no puede ser igual ni menor a la hora de inicio',
      );
    }
  }

  // Valida rango de fechas: ambas posteriores a hoy y fin >= inicio.
  ValidarRangoFechas(fechaInicio: string, fechaFin: string): void {
    const inicio = this.convertirFechaLocal(fechaInicio);
    const fin = this.convertirFechaLocal(fechaFin);
    const hoy = new Date();
    const hoyFormateado = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );

    if (inicio.getTime() < hoyFormateado.getTime()) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser anterior al día actual',
      );
    }

    if (fin.getTime() < hoyFormateado.getTime()) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior al día actual',
      );
    }

    if (fin.getTime() < inicio.getTime()) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }
  }

  // Valida horas durante actualizaciones parciales.
  ValidarHorasActualizacion(
    horaFinActual: string,
    horaInicioActual: string,
    horaFinActualizada?: string,
    horaInicioActualizada?: string,
  ): void {
    const horaFin = horaFinActualizada ?? horaFinActual;
    const horaInicio = horaInicioActualizada ?? horaInicioActual;

    this.ValidarHoras(horaFin, horaInicio);
  }

  // Valida fechas durante actualizaciones parciales.
  ValidarFechasActualizacion(
    fechaInicioActual: string,
    fechaFinActual: string,
    fechaInicioActualizada?: string,
    fechaFinActualizada?: string,
  ): void {
    const fechaInicio = fechaInicioActualizada ?? fechaInicioActual;
    const fechaFin = fechaFinActualizada ?? fechaFinActual;

    this.ValidarRangoFechas(fechaInicio, fechaFin);
  }
}
