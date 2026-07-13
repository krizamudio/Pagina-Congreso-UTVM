import { Injectable } from '@nestjs/common';

@Injectable()
export class ArchivoLockService {
  private readonly locks = new Map<string, Promise<void>>();

  async withLock<T>(id: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(id) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    this.locks.set(id, tail);

    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.locks.get(id) === tail) {
        this.locks.delete(id);
      }
    }
  }
}
