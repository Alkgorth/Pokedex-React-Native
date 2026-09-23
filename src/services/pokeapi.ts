import type {
    PokemonDetails,
    PokemonListResponse,
    PokemonSpecies,
    PokemonSummary,
} from "@/types/pokemon";

const API_URL = "https://pokeapi.co/api/v2";
const CATALOG_LIMIT = 2000;

const detailsCache = new Map<string, PokemonDetails>();
const typeCache = new Map<string, string[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`La PokéAPI a répondu avec le statut ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPokemonCatalog(): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(
    `${API_URL}/pokemon?limit=${CATALOG_LIMIT}`,
  );
}

export async function fetchPokemonDetails(
  pokemon: PokemonSummary,
): Promise<PokemonDetails> {
  const cachedPokemon = detailsCache.get(pokemon.name);

  if (cachedPokemon) {
    return cachedPokemon;
  }

  const details = await fetchJson<PokemonDetails>(pokemon.url);
  detailsCache.set(pokemon.name, details);
  return details;
}

export async function fetchPokemonById(id: number): Promise<PokemonDetails> {
  const pokemon = await fetchJson<PokemonDetails>(`${API_URL}/pokemon/${id}`);
  detailsCache.set(pokemon.name, pokemon);
  return pokemon;
}

export function fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
  return fetchJson<PokemonSpecies>(`${API_URL}/pokemon-species/${id}`);
}

export async function fetchPokemonTypeMembers(type: string): Promise<string[]> {
  const cachedMembers = typeCache.get(type);

  if (cachedMembers) {
    return cachedMembers;
  }

  const response = await fetchJson<{ pokemon: { pokemon: PokemonSummary }[] }>(
    `${API_URL}/type/${type}`,
  );
  const members = response.pokemon.map(({ pokemon }) => pokemon.name);
  typeCache.set(type, members);
  return members;
}

export function getPokemonId(pokemon: PokemonSummary): number {
  const match = pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export function getPokemonImage(pokemon: PokemonDetails): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default
  );
}
