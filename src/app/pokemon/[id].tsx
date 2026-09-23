import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GeneralColors, PokemonColors, Spacing } from "@/constants/theme";
import {
    fetchPokemonById,
    fetchPokemonSpecies,
    getPokemonImage,
} from "@/services/pokeapi";
import type {
    PokemonDetails,
    PokemonSpecies,
    PokemonTypeName,
} from "@/types/pokemon";

const MAX_POKEMON_ID = 1025;
const STAT_MAX = 255;

const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SATK",
  "special-defense": "SDEF",
  speed: "SPD",
};

function getTypeColor(typeName: string): string {
  return PokemonColors[typeName as PokemonTypeName] ?? GeneralColors.primary;
}

function getDescription(species: PokemonSpecies): string {
  const englishEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  );

  return (englishEntry?.flavor_text ?? "No description available.").replace(
    /[\n\f\r]+/g,
    " ",
  );
}

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height } = useWindowDimensions();
  const pokemonId = Number(id);
  const headerHeight = Math.max(300, height * 0.4);
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [error, setError] = useState<string | null>(() =>
    Number.isInteger(pokemonId) && pokemonId > 0
      ? null
      : "Invalid Pokémon number.",
  );

  useEffect(() => {
    let isActive = true;

    async function loadPokemon() {
      try {
        const [pokemonDetails, speciesDetails] = await Promise.all([
          fetchPokemonById(pokemonId),
          fetchPokemonSpecies(pokemonId),
        ]);

        if (isActive) {
          setPokemon(pokemonDetails);
          setSpecies(speciesDetails);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load this Pokémon.",
          );
        }
      }
    }

    if (Number.isInteger(pokemonId) && pokemonId > 0) {
      void loadPokemon();
    }

    return () => {
      isActive = false;
    };
  }, [pokemonId]);

  function navigateToPokemon(nextId: number) {
    router.replace({
      pathname: "/pokemon/[id]",
      params: { id: String(nextId) },
    });
    setPokemon(null);
    setSpecies(null);
    setError(null);
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButtonLight}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!pokemon || !species) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={GeneralColors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const primaryColor = getTypeColor(primaryType);
  const imageUri = getPokemonImage(pokemon);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.hero,
            { height: headerHeight, backgroundColor: primaryColor },
          ]}
        >
          <Image
            source={require("@/assets/images/icons/pokeball.png")}
            style={styles.watermark}
          />
          <View style={styles.heroTopRow}>
            <Pressable
              accessibilityLabel="Back"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>←</Text>
            </Pressable>
            <Text numberOfLines={1} style={styles.heroName}>
              {pokemon.name}
            </Text>
            <Text style={styles.heroNumber}>
              #{String(pokemon.id).padStart(3, "0")}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Previous Pokémon"
            disabled={pokemon.id <= 1}
            onPress={() => navigateToPokemon(pokemon.id - 1)}
            style={[
              styles.navigationArrow,
              styles.navigationLeft,
              pokemon.id <= 1 && styles.hiddenArrow,
            ]}
          >
            <Text style={styles.navigationArrowText}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Next Pokémon"
            disabled={pokemon.id >= MAX_POKEMON_ID}
            onPress={() => navigateToPokemon(pokemon.id + 1)}
            style={[
              styles.navigationArrow,
              styles.navigationRight,
              pokemon.id >= MAX_POKEMON_ID && styles.hiddenArrow,
            ]}
          >
            <Text style={styles.navigationArrowText}>›</Text>
          </Pressable>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.pokemonImage} />
          ) : null}
        </View>

        <View style={styles.contentCard}>
          <View style={styles.typeBadges}>
            {pokemon.types.map(({ type }) => (
              <View
                key={type.name}
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeColor(type.name) },
                ]}
              >
                <Text style={styles.typeBadgeText}>{type.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: primaryColor }]}>
            About
          </Text>
          <View style={styles.infoRow}>
            <InfoItem
              label="Weight"
              value={`${(pokemon.weight / 10).toFixed(1)} kg`}
            />
            <View style={styles.infoDivider} />
            <InfoItem
              label="Height"
              value={`${(pokemon.height / 10).toFixed(1)} m`}
            />
            <View style={styles.infoDivider} />
            <InfoItem label="Moves" value="--" />
          </View>

          <Text style={styles.description}>{getDescription(species)}</Text>

          <Text style={[styles.sectionTitle, { color: primaryColor }]}>
            Base Stats
          </Text>
          <View style={styles.statsList}>
            {pokemon.stats.map((stat) => {
              const percentage = Math.min(
                (stat.base_stat / STAT_MAX) * 100,
                100,
              );
              return (
                <View key={stat.stat.name} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: primaryColor }]}>
                    {statLabels[stat.stat.name] ?? stat.stat.name}
                  </Text>
                  <Text style={styles.statValue}>
                    {String(stat.base_stat).padStart(3, "0")}
                  </Text>
                  <View style={styles.statTrack}>
                    <View
                      style={[
                        styles.statBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: primaryColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: Spacing.four },
  hero: {
    position: "relative",
    zIndex: 2,
    elevation: 2,
    overflow: "visible",
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.two,
  },
  heroTopRow: { zIndex: 2, flexDirection: "row", alignItems: "center" },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backArrow: { color: "#FFFFFF", fontSize: 30, lineHeight: 32 },
  heroName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  heroNumber: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  watermark: {
    position: "absolute",
    width: 260,
    height: 260,
    right: -42,
    top: 12,
    opacity: 0.12,
    tintColor: "#FFFFFF",
  },
  pokemonImage: {
    position: "absolute",
    zIndex: 4,
    elevation: 4,
    width: 230,
    height: 230,
    alignSelf: "center",
    bottom: -72,
    resizeMode: "contain",
  },
  navigationArrow: {
    position: "absolute",
    zIndex: 3,
    top: "50%",
    width: 42,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationLeft: { left: 4 },
  navigationRight: { right: 4 },
  navigationArrowText: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "300",
    lineHeight: 58,
  },
  hiddenArrow: { opacity: 0 },
  contentCard: {
    minHeight: 500,
    zIndex: 1,
    marginTop: -20,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 62,
    paddingBottom: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  typeBadges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  typeBadge: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  sectionTitle: {
    marginBottom: Spacing.three,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    marginBottom: Spacing.four,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
  infoDivider: { width: 1, backgroundColor: "#E0E0E0" },
  infoValue: {
    color: "#212121",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  infoLabel: { color: "#777777", fontSize: 12, textAlign: "center" },
  description: {
    marginBottom: Spacing.four,
    color: "#444444",
    fontSize: 14,
    lineHeight: 22,
  },
  statsList: { gap: Spacing.two },
  statRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  statLabel: { width: 40, fontSize: 12, fontWeight: "700" },
  statValue: { width: 30, color: "#333333", fontSize: 12, fontWeight: "700" },
  statTrack: {
    flex: 1,
    height: 7,
    overflow: "hidden",
    backgroundColor: "#E6E6E6",
    borderRadius: 999,
  },
  statBar: { height: "100%", borderRadius: 999 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
  },
  error: { marginBottom: Spacing.three, color: "#C12239", textAlign: "center" },
  backButtonLight: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: GeneralColors.primary,
    borderRadius: 8,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "700" },
});

// TODO: add the detail screen entrance and stat bar animations later.
