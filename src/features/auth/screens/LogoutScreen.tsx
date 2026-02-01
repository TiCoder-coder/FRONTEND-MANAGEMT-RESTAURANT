import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useAuthActions } from "../hooks";

export default function LogoutScreen() {
  const router = useRouter(); // Tạo một biến dùng để callback
  const { logout } = useAuthActions(); // Lấy action logout

  // Tinh chỉnh kích thước cho phù hơp theo từng thiết bị
  const { width } = useWindowDimensions();

  const pageMaxWidth = React.useMemo(() => {
    if (width >= 1200) return 520; // desktop/web
    if (width >= 992) return 480; // tablet lớn
    if (width >= 768) return 440; // tablet thường
    return 420; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 36, pageMaxWidth)); // 18*2 padding

  // scale nhẹ cho padding/font (optional)
  const scale = Math.min(Math.max(width / 375, 0.95), 1.12);
  const s = (n: number) => Math.round(n * scale);

  // Khoá nút, tránh bấm logout nhiều lần
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
      return () => {};
    }, []),
  );

  // Tiến hành logout nếu đúng thì set lại trang login, nếu sai thì báo lỗi
  const onConfirmLogout = async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      try {
        await api.post(ENDPOINTS.AUTH_LOGOUT, {});
      } catch {}

      await logout();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#050B1C", "#071A2F", "#0B1F3B", "#06122A"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.container}>
        <View
          style={[
            styles.card,
            { width: pageWidth, padding: s(18), borderRadius: s(24) },
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="log-out-outline" size={26} color="#0A1630" />
          </View>

          <Text style={[styles.title, { fontSize: s(18) }]}>
            Confirm logout
          </Text>

          <Text style={[styles.sub, { fontSize: s(13.5), lineHeight: s(18) }]}>
            Are you sure you want to log out of this account?
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                pressed && { opacity: 0.9 },
              ]}
              disabled={loading}
            >
              <Ionicons name="close-outline" size={18} color="#E7C06B" />
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirmLogout}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
              ]}
              disabled={loading}
            >
              <Ionicons name="checkmark-outline" size={18} color="#0A1630" />
              <Text style={styles.btnPrimaryText}>
                {loading ? "Logging out..." : "Logout"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A1630" },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 44 : 16,

    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
    alignItems: "center",
  },

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  title: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 4,
  },
  sub: {
    marginTop: 8,
    color: "rgba(15,23,42,0.70)",
    fontWeight: "800",
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 18,
  },

  btnRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  btn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  btnGhost: {
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.45)",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  btnGhostText: {
    color: "#8B5A00",
    fontWeight: "900",
    fontSize: 14,
  },

  btnPrimary: {
    backgroundColor: "#E7C06B",
    shadowColor: "#E7C06B",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  btnPrimaryText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 14,
  },

  smallLink: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  smallLinkText: { color: "#0B1F3B", fontWeight: "900" },
});
