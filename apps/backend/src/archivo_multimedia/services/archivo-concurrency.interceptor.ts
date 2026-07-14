import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const MAX_OPERACIONES_CONCURRENTES = 3;

@Injectable()
export class ArchivoConcurrencyInterceptor implements NestInterceptor {
  private operacionesActivas = 0;

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (this.operacionesActivas >= MAX_OPERACIONES_CONCURRENTES) {
      throw new HttpException(
        'No se puede procesar la solicitud en este momento',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.operacionesActivas += 1;
    return next.handle().pipe(
      finalize(() => {
        this.operacionesActivas -= 1;
      }),
    );
  }
}
