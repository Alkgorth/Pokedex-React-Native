import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PokemonCard } from "@/components/pokemon-card";
import {
    BottomTabInset,
    GeneralColors,
    MaxContentWidth,
    PokemonColors,
    Spacing,
} from "@/constants/theme";
import { usePokemonList } from "@/hooks/use-pokemon-list";
import type { PokemonSort, PokemonTypeName } from "@/types/pokemon";

const typeLabels: Record<PokemonTypeName, string> = {
  bug: "Insecte",
  dark: "Ténèbres",
  dragon: "Dragon",
  electric: "Électrik",
  fairy: "Fée",
  fighting: "Combat",
  fire: "Feu",
  flying: "Vol",
  ghost: "Spectre",
  grass: "Plante",
  ground: "Sol",
  ice: "Glace",
  normal: "Normal",
  poison: "Poison",
  psychic: "Psy",
  rock: "Roche",
  steel: "Acier",
  water: "Eau",
};

const pokemonTypes = Object.keys(PokemonColors) as PokemonTypeName[];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<PokemonSort>("number_asc");
  const [filterTypes, setFilterTypes] = useState<PokemonTypeName[]>([]);
  const [pendingSort, setPendingSort] = useState<PokemonSort>("number_asc");
  const [pendingTypes, setPendingTypes] = useState<PokemonTypeName[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { pokemon, total, loading, loadingMore, error, loadMore } =
    usePokemonList({
      searchQuery: debouncedSearch,
      sortBy,
      filterTypes,
    });

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  function openFilters() {
    setPendingSort(sortBy);
    setPendingTypes(filterTypes);
    setModalVisible(true);
  }

  function resetFilters() {
    setSearchQuery("");
    setSortBy("number_asc");
    setFilterTypes([]);
    setPendingSort("number_asc");
    setPendingTypes([]);
    setModalVisible(false);
  }

  function toggleType(type: PokemonTypeName) {
    setPendingTypes((currentTypes) =>
      currentTypes.includes(type)
        ? currentTypes.filter((currentType) => currentType !== type)
        : [...currentTypes, type],
    );
  }

  function applyFilters() {
    setSortBy(pendingSort);
    setFilterTypes(pendingTypes);
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image
              source={require("@/assets/images/icons/pokeball.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Pokédex</Text>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="Rechercher un Pokémon"
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor="#777777"
                style={styles.searchInput}
                value={searchQuery}
              />
            </View>
            <Pressable
              accessibilityLabel="Ouvrir les options de tri et de filtre"
              onPress={openFilters}
              style={styles.filterButton}
            >
              <Text style={styles.filterButtonText}>#</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading && pokemon.length === 0 ? (
            <ActivityIndicator
              color={GeneralColors.primary}
              size="large"
              style={styles.loader}
            />
          ) : (
            <FlatList
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              data={pokemon}
              ListEmptyComponent={
                <Text style={styles.empty}>Aucun Pokémon trouvé.</Text>
              }
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    color={GeneralColors.primary}
                    style={styles.footerLoader}
                  />
                ) : null
              }
              numColumns={3}
              onEndReached={loadMore}
              onEndReachedThreshold={0.6}
              renderItem={({ item }) => <PokemonCard pokemon={item} />}
            />
          )}
          <Text style={styles.resultCount}>{total} Pokémon</Text>
        </View>
      </SafeAreaView>

      <Modal
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent
        visible={modalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Trier et filtrer</Text>
            <Text style={styles.sectionTitle}>Tri</Text>
            {(
              [
                ["number_asc", "Numéro croissant"],
                ["number_desc", "Numéro décroissant"],
                ["name_asc", "Nom A → Z"],
              ] as const
            ).map(([value, label]) => (
              <Pressable
                key={value}
                onPress={() => setPendingSort(value)}
                style={styles.optionRow}
              >
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.radio}>
                  {pendingSort === value ? "●" : "○"}
                </Text>
              </Pressable>
            ))}
            <Text style={styles.sectionTitle}>Types</Text>
            <View style={styles.typeGrid}>
              {pokemonTypes.map((type) => {
                const selected = pendingTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: selected
                          ? PokemonColors[type]
                          : "#F0F0F0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeLabel,
                        selected && styles.selectedTypeLabel,
                      ]}
                    >
                      {typeLabels[type]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={resetFilters} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
              </Pressable>
              <Pressable onPress={applyFilters} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  safeArea: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset,
  },
  header: {
    backgroundColor: "#EE1515",
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  logo: { width: 34, height: 34, tintColor: "#FFFFFF" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  searchField: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
  },
  searchIcon: { color: "#555555", fontSize: 24, marginRight: Spacing.two },
  searchInput: { flex: 1, color: "#212121", fontSize: 16 },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
  },
  filterButtonText: { color: "#EE1515", fontSize: 22, fontWeight: "700" },
  content: { flex: 1, paddingHorizontal: Spacing.screenHorizontal },
  listContent: { paddingTop: Spacing.three, paddingBottom: Spacing.three },
  loader: { flex: 1 },
  footerLoader: { paddingVertical: Spacing.three },
  error: { color: "#C12239", paddingTop: Spacing.two },
  empty: { paddingTop: Spacing.four, color: "#666666", textAlign: "center" },
  resultCount: {
    color: "#777777",
    fontSize: 12,
    paddingBottom: Spacing.two,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalContent: {
    maxHeight: "85%",
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    marginBottom: Spacing.three,
    backgroundColor: "#D0D0D0",
    borderRadius: 4,
  },
  modalTitle: {
    color: "#212121",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "700",
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    textTransform: "uppercase",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionLabel: { color: "#212121", fontSize: 15 },
  radio: { color: "#EE1515", fontSize: 20 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  typeOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  typeLabel: { color: "#333333", fontSize: 12, fontWeight: "600" },
  selectedTypeLabel: { color: "#FFFFFF" },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  primaryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    backgroundColor: "#EE1515",
    borderRadius: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
  },
  secondaryButtonText: { color: "#333333", fontWeight: "700" },
});
