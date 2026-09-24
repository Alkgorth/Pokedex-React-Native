import { useEffect, useMemo, useRef, useState } from "react";

import {
  fetchPokemonCatalog,
  fetchPokemonDetails,
  fetchPokemonTypeMembers,
  getPokemonId,
} from "@/services/pokeapi";
import type {
  PokemonDetails,
  PokemonSort,
  PokemonSummary,
  PokemonTypeName,
} from "@/types/pokemon";

export const POKEMON_BATCH_SIZE = 12;

type UsePokemonListOptions = {
  searchQuery: string;
  sortBy: PokemonSort;
  filterTypes: PokemonTypeName[];
};

type UsePokemonListResult = {
  pokemon: PokemonDetails[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
};

function sortCatalog(
  catalog: PokemonSummary[],
  sortBy: PokemonSort,
): PokemonSummary[] {
  return [...catalog].sort((firstPokemon, secondPokemon) => {
    if (sortBy === "name_asc") {
      return firstPokemon.name.localeCompare(secondPokemon.name);
    }

    const firstId = getPokemonId(firstPokemon);
    const secondId = getPokemonId(secondPokemon);
    return sortBy === "number_desc" ? secondId - firstId : firstId - secondId;
  });
}

export function usePokemonList({
  searchQuery,
  sortBy,
  filterTypes,
}: UsePokemonListOptions): UsePokemonListResult {
  const myRef = useRef(false);
  const [catalog, setCatalog] = useState<PokemonSummary[]>([]);
  const [allowedNames, setAllowedNames] = useState<Set<string> | null>(null);
  const [pokemon, setPokemon] = useState<PokemonDetails[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const filterKey = filterTypes.join(",");

  useEffect(() => {
    let isActive = true;

    async function loadCatalog() {
      try {
        const response = await fetchPokemonCatalog();

        if (isActive) {
          setCatalog(response.results);
          setCatalogLoading(false);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Une erreur est survenue.",
          );
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadTypeMembers() {
      if (filterTypes.length === 0) {
        setAllowedNames(new Set());
        return;
      }

      try {
        const typeMembers = await Promise.all(
          filterTypes.map(fetchPokemonTypeMembers),
        );
        const names = new Set(typeMembers.flat());

        if (isActive) {
          setAllowedNames(names);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Impossible de filtrer les types.",
          );
        }
      }
    }

    void loadTypeMembers();

    return () => {
      isActive = false;
    };
  }, [filterKey, filterTypes]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchingCatalog = useMemo(() => {
    return sortCatalog(
      catalog.filter((summary) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          summary.name.includes(normalizedSearch);
        const matchesType =
          filterTypes.length === 0 ||
          (allowedNames?.has(summary.name) ?? false);
        return matchesSearch && matchesType;
      }),
      sortBy,
    );
  }, [allowedNames, catalog, filterTypes.length, normalizedSearch, sortBy]);

  useEffect(() => {
    if (catalogLoading || (filterTypes.length > 0 && allowedNames === null)) {
      return;
    }

    let isActive = true;
    const firstBatch = matchingCatalog.slice(0, POKEMON_BATCH_SIZE);

    async function loadFirstBatch() {
      try {
        setLoadingMore(true);
        setError(null);
        const details = await Promise.all(firstBatch.map(fetchPokemonDetails));

        if (isActive) {
          setPokemon(details);
          setHasMore(firstBatch.length < matchingCatalog.length);
          setLoadingMore(false);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Une erreur est survenue.",
          );
          setLoadingMore(false);
        }
      }
    }

    void loadFirstBatch();

    return () => {
      isActive = false;
    };
  }, [
    allowedNames,
    catalog,
    catalogLoading,
    filterTypes.length,
    matchingCatalog,
  ]);

  function loadMore() {
    if (loadingMore || myRef.current || !hasMore || catalogLoading) {
      return;
    }

    const nextBatch = matchingCatalog.slice(
      pokemon.length,
      pokemon.length + POKEMON_BATCH_SIZE,
    );

    if (nextBatch.length === 0) {
      setHasMore(false);
      return;
    }

    myRef.current = true;

    setLoadingMore(true);
    void Promise.all(nextBatch.map(fetchPokemonDetails))
      .then((details) => {
        setPokemon((currentPokemon) => [...currentPokemon, ...details]);
        setHasMore(pokemon.length + details.length < matchingCatalog.length);
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Une erreur est survenue.",
        );
      })
      .finally(() => {
        setLoadingMore(false);
        myRef.current = false;
      });
  }

  return {
    pokemon,
    total: matchingCatalog.length,
    loading: catalogLoading || loadingMore,
    loadingMore,
    hasMore,
    error,
    loadMore,
  };
}
