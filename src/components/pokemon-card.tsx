import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { getPokemonImage } from "@/services/pokeapi";
import type { PokemonDetails } from "@/types/pokemon";

type PokemonCardProps = {
  pokemon: PokemonDetails;
};

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const imageUri = getPokemonImage(pokemon);

  return (
    <Link
      asChild
      href={{ pathname: "/pokemon/[id]", params: { id: String(pokemon.id) } }}
    >
      <View style={styles.card}>
        <Text style={styles.number}>
          #{String(pokemon.id).padStart(3, "0")}
        </Text>
        <View style={styles.imageArea}>
          <View style={styles.platform} />
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.name}>
          {pokemon.name}
        </Text>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    margin: 5,
    padding: 8,
    position: "relative",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  number: {
    alignSelf: "flex-end",
    color: "#777777",
    fontSize: 10,
    fontWeight: "700",
  },
  imageArea: {
    width: "100%",
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  platform: {
    position: "absolute",
    bottom: 8,
    width: "68%",
    height: 18,
    backgroundColor: "#E2E2E2",
    borderRadius: 999,
  },
  image: {
    width: 92,
    height: 92,
    resizeMode: "contain",
    zIndex: 1,
  },
  name: {
    maxWidth: "100%",
    color: "#212121",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
