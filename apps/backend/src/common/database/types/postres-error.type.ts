export type PostgresError = {
  code?: string;
  detail?: string;
  constraint?: string;
};