import { Character, CharacterResponse, Episode } from '@/types/rickandmorty';

const API_BASE_URL = 'https://rickandmortyapi.com/api';

/** Error de la API con el código HTTP, para distinguir un 404 de otras fallas. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getCharacters(page: number = 1): Promise<CharacterResponse> {
  const res = await fetch(`${API_BASE_URL}/character?page=${page}`);

  if (!res.ok) {
    throw new ApiError('Failed to fetch characters', res.status);
  }

  return res.json();
}

export async function getCharacter(id: string): Promise<Character> {
  const res = await fetch(`${API_BASE_URL}/character/${id}`);

  if (!res.ok) {
    throw new ApiError('Failed to fetch character details', res.status);
  }

  return res.json();
}

export async function getEpisodes(ids: string[]): Promise<Episode[]> {
  if (ids.length === 0) return [];

  const res = await fetch(`${API_BASE_URL}/episode/${ids.join(',')}`);

  if (!res.ok) {
    throw new ApiError('Failed to fetch episodes', res.status);
  }

  const data = await res.json();
  // If only one episode is requested, the API returns an object, not an array.
  return Array.isArray(data) ? data : [data];
}
