export function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function normalizeContentKey(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
