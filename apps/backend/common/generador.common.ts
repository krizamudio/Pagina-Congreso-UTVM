import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneradorCommon {
  
  CadenasAleatorias(): string {
    const letras = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let aleatorio = '';

    for (let i = 0; i < 20; i++) {
      aleatorio += letras.charAt(Math.floor(Math.random() * letras.length));
    }

    const timestamp = Date.now();
    return `${timestamp}_${aleatorio}`;
  }
}
