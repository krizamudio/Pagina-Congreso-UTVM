export enum HackatonResultado {
  PRIMER_LUGAR = 'PRIMER_LUGAR',
  SEGUNDO_LUGAR = 'SEGUNDO_LUGAR',
  TERCER_LUGAR = 'TERCER_LUGAR',
  MENCION_HONORIFICA = 'MENCION_HONORIFICA',
}

export const HACKATON_RESULTADO_LABEL: Record<HackatonResultado, string> = {
  [HackatonResultado.PRIMER_LUGAR]: 'Primer lugar',
  [HackatonResultado.SEGUNDO_LUGAR]: 'Segundo lugar',
  [HackatonResultado.TERCER_LUGAR]: 'Tercer lugar',
  [HackatonResultado.MENCION_HONORIFICA]: 'Mención honorífica',
};
