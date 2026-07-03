import { BadRequestException, Injectable } from '@nestjs/common';

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
}
