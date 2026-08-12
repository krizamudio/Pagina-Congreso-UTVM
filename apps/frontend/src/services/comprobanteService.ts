import { apiBaseUrl } from './api';

export function abrirComprobante(id: string): void {
  window.open(
    `${apiBaseUrl}/comprobantes/${encodeURIComponent(id)}/visualizar`,
    '_blank',
    'noopener,noreferrer',
  );
}