import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Conferencia } from '../entities/conferencia.entity';

export const relacionesConferencia: FindOptionsRelations<Conferencia> = {
  congreso: true,
  ubicacion: true,
  ponente: true,
};

export const seleccionConferencia: FindOptionsSelect<Conferencia> = {
  id: true,
  titulo: true,
  resumen: true,
  fecha: true,
  hora_inicio: true,
  hora_fin: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  congreso: {
    id: true,
    nombre: true,
  },
  ubicacion: {
    id: true,
    nombre: true,
  },
  ponente: {
    id: true,
    nombre: true,
  },
};
