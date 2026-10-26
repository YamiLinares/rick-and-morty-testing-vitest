import type { Character } from '@/types/rickandmorty';

/**
 * Convierte el parámetro ?page= de la URL en un número de página válido.
 * Antes se usaba parseInt directamente: "abc" daba NaN y "0" o "-3" llegaban
 * a la API y a la paginación ("Page NaN of 42"). Ahora cualquier valor que no
 * sea un entero positivo vuelve a la página 1.
 */
export function parsePageParam(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return 1;
  const page = Number(value.trim());
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/** true si el id de la ruta /character/[id] es un entero positivo. */
export function isValidCharacterId(id: string): boolean {
  return /^[1-9]\d*$/.test(id);
}

/**
 * Extrae los ids de las URLs de episodios que devuelve la API
 * ("https://rickandmortyapi.com/api/episode/28" → "28").
 * Ignora URLs vacías o sin un id numérico al final.
 */
export function getEpisodeIds(episodeUrls: string[]): string[] {
  return episodeUrls
    // split siempre devuelve al menos un elemento: el último es el id.
    .map((url) => url.replace(/\/+$/, '').split('/').slice(-1)[0])
    .filter((id) => /^\d+$/.test(id));
}

const STATUS_COLORS: Record<Character['status'], string> = {
  Alive: 'bg-green-500',
  Dead: 'bg-red-500',
  unknown: 'bg-gray-500',
};

/** Clase de Tailwind del indicador de estado (gris si el estado no es conocido). */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as Character['status']] ?? 'bg-gray-500';
}

/** Fecha de creación en formato "November 4, 2017"; "Unknown" si la fecha no es válida. */
export function formatCreatedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
