const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/'
).replace(/\/$/, '');

export function abrirComprobante(id: string): void {
  window.open(
    `${apiBaseUrl}/comprobantes/${encodeURIComponent(id)}/visualizar`,
    '_blank',
    'noopener,noreferrer',
  );
}
