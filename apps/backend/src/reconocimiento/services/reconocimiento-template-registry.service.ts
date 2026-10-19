import { Injectable } from '@nestjs/common';
import { ReconocimientoTipo } from '../enums/reconocimiento-tipo.enum';

export interface RecognitionTemplate {
  background: string;
  nameBox: { x: number; yFromTop: number; width: number; height: number };
  detailBoxes?: { yFromTop: number; height: number; size: number }[];
}

@Injectable()
export class ReconocimientoTemplateRegistryService {
  private readonly standard = {
    x: 115.71,
    yFromTop: 321.43,
    width: 574.46,
    height: 29.08,
  };
  private readonly templates: Record<ReconocimientoTipo, RecognitionTemplate> =
    {
      [ReconocimientoTipo.GENERAL]: {
        background: 'general.jpg',
        nameBox: this.standard,
      },
      [ReconocimientoTipo.TALLERISTA]: {
        background: 'tallerista.jpg',
        nameBox: this.standard,
      },
      [ReconocimientoTipo.CONFERENCISTA]: {
        background: 'conferencista.jpg',
        nameBox: this.standard,
      },
      [ReconocimientoTipo.HACKATON_EVALUADOR]: {
        background: 'hackaton-evaluador-temporal.jpg',
        nameBox: { x: 110, yFromTop: 275, width: 548, height: 38 },
        detailBoxes: [{ yFromTop: 335, height: 28, size: 17 }],
      },
      [ReconocimientoTipo.HACKATON_PREMIACION]: {
        background: 'hackaton-premiacion-temporal.jpg',
        nameBox: { x: 110, yFromTop: 260, width: 548, height: 38 },
        detailBoxes: [
          { yFromTop: 325, height: 28, size: 17 },
          { yFromTop: 365, height: 28, size: 18 },
        ],
      },
    };
  get(tipo: ReconocimientoTipo): RecognitionTemplate {
    return this.templates[tipo];
  }
}
