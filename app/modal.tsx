import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>

      <Link href="/(tabs)/home" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Go to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  buttonText: { color: "white", fontWeight: "600" },
});
