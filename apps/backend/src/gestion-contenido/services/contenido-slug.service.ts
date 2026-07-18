import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Noticia } from '../entities/noticia.entity';

@Injectable()
export class ContenidoSlugService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticias: Repository<Noticia>,
  ) {}

  async generate(titulo: string): Promise<string> {
    const base = this.normalize(titulo).slice(0, 210) || 'noticia';
    let candidate = base;
    let suffix = 2;

    while (await this.noticias.exists({ where: { slug: candidate } })) {
      const ending = `-${suffix}`;
      candidate = `${base.slice(0, 220 - ending.length)}${ending}`;
      suffix += 1;
    }
    return candidate;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
