import { Injectable, Logger } from '@nestjs/common';

const MAX_INTENTOS = 3;
const RETRY_BASE_DELAY_MS = 100;

@Injectable()
export class ArchivoRetryService {
  private readonly logger = new Logger(ArchivoRetryService.name);

  async execute(
    descripcion: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    for (let intento = 1; intento <= MAX_INTENTOS; intento += 1) {
      try {
        await operation();
        return true;
      } catch (error) {
        this.logger.warn(
          `${descripcion} (intento ${intento}/${MAX_INTENTOS}): ${this.errorDetail(error)}`,
        );
        if (intento < MAX_INTENTOS) {
          await this.delay(this.retryDelay(intento));
        }
      }
    }
    return false;
  }

  async compensate(
    descripcion: string,
    operation: () => Promise<unknown>,
  ): Promise<boolean> {
    const completada = await this.execute(descripcion, operation);
    if (!completada) {
      this.logger.error(`No fue posible compensar: ${descripcion}`);
    }
    return completada;
  }

  private retryDelay(intento: number): number {
    const exponential = RETRY_BASE_DELAY_MS * 2 ** (intento - 1);
    const jitter = Math.floor(Math.random() * RETRY_BASE_DELAY_MS);
    return exponential + jitter;
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  private errorDetail(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
