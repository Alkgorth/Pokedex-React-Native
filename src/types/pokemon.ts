export type PokemonSummary = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSummary[];
};

export type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: {
    type: PokemonSummary;
  }[];
  stats: {
    base_stat: number;
    stat: PokemonSummary;
  }[];
};

export type PokemonSpecies = {
  flavor_text_entries: {
    flavor_text: string;
    language: PokemonSummary;
  }[];
};

export type PokemonSort = "number_asc" | "number_desc" | "name_asc";

export type PokemonTypeName =
  | "bug"
  | "dark"
  | "dragon"
  | "electric"
  | "fairy"
  | "fighting"
  | "fire"
  | "flying"
  | "ghost"
  | "grass"
  | "ground"
  | "ice"
  | "normal"
  | "poison"
  | "psychic"
  | "rock"
  | "steel"
  | "water";
