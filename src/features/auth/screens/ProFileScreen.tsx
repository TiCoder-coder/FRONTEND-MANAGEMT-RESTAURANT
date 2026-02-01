import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { useAuthActions } from "@/src/features/auth/hooks";

// Định nghĩa một type cho address giống như swagger api
type Address = {
  street: string;
  ward: string;
  city: string;
  country: string;
  zip_code: string;
};

// Tạo ra thông tin Profile
type Profile = {
  company_id: string;
  email: string;
  full_name: string;
  phone: string;
  birthday: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  address: Address;
};

// Chuẩn hoá profile
function pickProfile(raw: any): Profile {
  const p = raw?.data ?? raw;
  return {
    company_id: p.company_id,
    email: p.email,
    full_name: p.full_name,
    phone: p.phone,
    birthday: p.birthday,
    sex: p.sex,
    address: p.address,
  };
}

// Cchuaanr háo ngày giờ
function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

// Kiểm tra các lỗi
function isUnauthorized(err?: string) {
  if (!err) return false;
  const s = err.toLowerCase();
  return (
    s.includes("unauthorized") ||
    s.includes("401") ||
    s.includes("not authenticated") ||
    s.includes("token")
  );
}
// Một component con giúp render 1 dòng thông tin
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color="#E7C06B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value && value.trim() ? value : "—"}
        </Text>
      </View>
    </View>
  );
}

export default function ProFileScreen() {
  const router = useRouter(); // Tạo ra biến dùng để callback
  const { logout } = useAuthActions(); // Lấy action logut

  // Tinh chỉnh kích thước phù hợp theo từng thiết bị
  const { width } = useWindowDimensions();

  const pageMaxWidth = React.useMemo(() => {
    if (width >= 1200) return 900; // desktop/web
    if (width >= 992) return 820; // tablet lớn / ipad ngang
    if (width >= 768) return 680; // tablet
    return 560; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 32, pageMaxWidth));
  const isTablet = width >= 768;

  // scale nhẹ cho font/padding (optional nhưng đẹp)
  const scale = Math.min(Math.max(width / 375, 0.95), 1.12);
  const s = (n: number) => Math.round(n * scale);

  // Xét các trạng thái
  const [loading, setLoading] = useState(true); // Đảm bảo bấm các button một lần
  const [refreshing, setRefreshing] = useState(false); // Kéo xuống refresh hiển thị spiner Refresh control
  const [profile, setProfile] = useState<Profile | null>(null); // Data profile
  const [error, setError] = useState<string | null>(null); // Message lỗi
  const twoCols = width >= 992; // desktop/tablet ngang

  // Lấy thông tin profile từ api endpoints
  const loadProfile = useCallback(async () => {
    try {
      setError(null);

      const res = await api.get(ENDPOINTS.AUTH_PROFILE);
      setProfile(pickProfile(res.data));
    } catch (e: any) {
      setError(e?.message ?? "Load profile failed");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chặn không cho gửi request khi đã gửi request đầu tiên
  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError(null);

      (async () => {
        try {
          const res = await api.get(ENDPOINTS.AUTH_PROFILE);
          if (!active) return;
          setProfile(pickProfile(res.data));
        } catch (e: any) {
          if (!active) return;
          setError(e?.message ?? "Load profile failed");
          setProfile(null);
        } finally {
          if (!active) return;
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Bật refreshing
    await loadProfile(); // Load prfile
    setRefreshing(false); // Tắt refreshing
  }, [loadProfile]);

  // Có chức năng logout nếu người dùng muốn sử dụng
  const onLogout = async () => {
    try {
      try {
        await api.post(ENDPOINTS.AUTH_LOGOUT, {});
      } catch {}

      await logout();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout fail", e?.message ?? "An error occurred.");
    }
  };

  const addr = profile?.address;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#050B1C", "#071A2F", "#0B1F3B", "#06122A"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { alignItems: "center" }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ width: pageWidth, alignSelf: "center" }}>
          <View style={[styles.header, { marginTop: s(50) }]}>
            <View style={styles.avatarBadge}>
              <Ionicons name="person-outline" size={22} color="#0A1630" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[styles.title, { fontSize: isTablet ? s(22) : s(20) }]}
              >
                Profile
              </Text>
              <Text style={[styles.subtitle, { fontSize: s(13) }]}>
                Account information
              </Text>
            </View>

            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.logoutMini,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color="#0A1630" />
            </Pressable>
          </View>

          <View style={[styles.card, { padding: s(14), borderRadius: s(22) }]}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.muted}>Loading profile...</Text>
              </View>
            ) : error ? (
              <View style={styles.center}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#EF4444"
                />
                <Text
                  style={[styles.muted, { marginTop: 8, textAlign: "center" }]}
                >
                  {error}
                </Text>

                <View style={styles.errActions}>
                  <Pressable
                    onPress={loadProfile}
                    style={({ pressed }) => [
                      styles.retryBtn,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text style={styles.retryText}>Reload</Text>
                  </Pressable>

                  <Text>
                    {" "}
                    ------------------------ Or you can ------------------------
                  </Text>

                  {isUnauthorized(error) && (
                    <Pressable
                      onPress={() => router.replace("/(auth)/login")}
                      style={({ pressed }) => [
                        styles.loginBtn,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Ionicons
                        name="log-in-outline"
                        size={18}
                        color="#0A1630"
                      />
                      <Text style={styles.loginText}>Login</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Account</Text>

                <InfoRow
                  icon="person-outline"
                  label="Full name"
                  value={profile?.full_name}
                />
                <InfoRow
                  icon="mail-outline"
                  label="Email"
                  value={profile?.email}
                />
                <InfoRow
                  icon="call-outline"
                  label="Phone"
                  value={profile?.phone}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Birthday"
                  value={formatDate(profile?.birthday)}
                />
                <InfoRow
                  icon="male-female-outline"
                  label="Sex"
                  value={profile?.sex}
                />
                <InfoRow
                  icon="business-outline"
                  label="Company ID"
                  value={profile?.company_id}
                />

                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                  Address
                </Text>

                <View style={twoCols ? styles.rowGrid : undefined}>
                  <View style={twoCols ? styles.rowHalf : undefined}>
                    <InfoRow
                      icon="location-outline"
                      label="Street"
                      value={addr?.street}
                    />
                  </View>

                  <View style={twoCols ? styles.rowHalf : undefined}>
                    <InfoRow
                      icon="grid-outline"
                      label="Ward"
                      value={addr?.ward}
                    />
                  </View>

                  <View style={twoCols ? styles.rowHalf : undefined}>
                    <InfoRow
                      icon="business-outline"
                      label="City"
                      value={addr?.city}
                    />
                  </View>

                  <View style={twoCols ? styles.rowHalf : undefined}>
                    <InfoRow
                      icon="earth-outline"
                      label="Country"
                      value={addr?.country}
                    />
                  </View>

                  <View style={twoCols ? styles.rowHalf : undefined}>
                    <InfoRow
                      icon="pricetag-outline"
                      label="Zip code"
                      value={addr?.zip_code}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A1630" },
  bg: { flex: 1 },
  content: { padding: 16, paddingTop: Platform.OS === "android" ? 14 : 10 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    marginTop: 50,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#E7C06B", fontSize: 22, fontWeight: "900" },
  subtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontWeight: "700",
  },
  logoutMini: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#0E2B58",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(231,192,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "800",
  },
  rowValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "900",
  },

  center: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  muted: { color: "rgba(15,23,42,0.70)", fontWeight: "800" },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#E7C06B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: { color: "#0A1630", fontWeight: "900" },
  errActions: {
    marginTop: 10,
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E7C06B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  loginText: {
    color: "#0A1630",
    fontWeight: "900",
  },
  rowHalf: {
    width: "49%",
  },
  rowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
