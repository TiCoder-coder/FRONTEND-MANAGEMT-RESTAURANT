import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type Address = {
  street: string;
  ward: string;
  city: string;
  country: string;
  zip_code: string;
};

type Profile = {
  email: string;
  phone: string;
  full_name: string;
  birthday: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  member_level_id: string;
  address: Address;
};

function pickProfile(raw: any): Profile {
  const p = raw?.data ?? raw;
  return {
    email: p.email ?? "",
    phone: p.phone ?? "",
    full_name: p.full_name ?? p?.fullName ?? "",
    birthday: p.birthday ?? "",
    sex: p.sex ?? undefined,
    member_level_id: p.member_level_id ?? "",
    address: p.address ?? {},
  };
}

function toMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unknown error"
  );
}

function isUnauthorized(error: any) {
  const status = error?.response?.status;
  const msg = String(toMessage(error)).toLowerCase();
  return status === 401 || msg.includes("unauthorized");
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <View style={styles.inputIcon}>
          <Ionicons name={icon} size={18} color="#E7C06B" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.55)"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          style={styles.input}
        />
      </View>
    </View>
  );
}

export default function UpdateProfileScreen() {
  const router = useRouter();

  // Tinh chỉnh kích thước
  const { width } = useWindowDimensions();

  const pageMaxWidth = useMemo(() => {
    if (width >= 1200) return 760; // desktop/web
    if (width >= 992) return 680; // tablet ngang
    if (width >= 768) return 600; // tablet
    return 520; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 36, pageMaxWidth));
  const isWide = width >= 992;

  const scale = Math.min(Math.max(width / 375, 0.95), 1.12);
  const s = (n: number) => Math.round(n * scale);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [sex, setSex] = useState<Profile["sex"]>(undefined);
  const [memberLevelId, setMemberLevelId] = useState("");

  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [didLoadOnce, setDidLoadOnce] = useState(false);

  const payload = useMemo(() => {
    return {
      email: email.trim(),
      phone: phone.trim(),
      full_name: fullName.trim(),
      birthday: birthday.trim(),
      sex: sex,
      member_level_id: memberLevelId.trim(),
      address: {
        street: street.trim(),
        ward: ward.trim(),
        city: city.trim(),
        country: country.trim(),
        zip_code: zipCode.trim(),
      },
    };
  }, [
    email,
    phone,
    fullName,
    birthday,
    sex,
    memberLevelId,
    street,
    ward,
    city,
    country,
    zipCode,
  ]);

  const fillForm = useCallback((p: Profile) => {
    setEmail(p.email ?? "");
    setPhone(p.phone ?? "");
    setFullName(p.full_name ?? "");
    setBirthday(p.birthday ?? "");
    setSex(p.sex);
    setMemberLevelId(p.member_level_id ?? "");

    const a = p.address ?? {};
    setStreet(a.street ?? "");
    setWard(a.ward ?? "");
    setCity(a.city ?? "");
    setCountry(a.country ?? "");
    setZipCode(a.zip_code ?? "");
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setUnauthorized(false);
      setError(null);
      const res = await api.get(ENDPOINTS.AUTH_PROFILE);
      const p = pickProfile(res.data);
      fillForm(p);
    } catch (e: any) {
      if (isUnauthorized(e)) setUnauthorized(true);
      setError(toMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fillForm]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const onSubmit = async () => {
    try {
      if (saving) return;

      if (!payload.email) {
        Alert.alert("Information missing", "Please enter the email address.");
        return;
      }
      if (!payload.phone) {
        Alert.alert("Missing information", "Please enter the phone number.");
        return;
      }
      if (!payload.full_name) {
        Alert.alert("Incomplete information", "Please enter the full name.");
        return;
      }

      setSaving(true);
      setError(null);

      await api.patch(ENDPOINTS.AUTH_UPDATE_PROFILE, payload);

      Alert.alert("Success", "Profile update successful", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      if (isUnauthorized(e)) setUnauthorized(true);
      Alert.alert("Update failed", toMessage(e));
      setError(toMessage(e));
    } finally {
      setSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!didLoadOnce) {
        setLoading(true);
        loadProfile().finally(() => setDidLoadOnce(true));
      }
      return () => {
        setRefreshing(false);
        setSaving(false);
      };
    }, [didLoadOnce, loadProfile]),
  );

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
        contentContainerStyle={[
          styles.content,
          {
            alignItems: "center",
            justifyContent: isWide ? "center" : "flex-start",
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ width: pageWidth }}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color="#0A1630" />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: s(22) }]}>
                Update Profile
              </Text>
              <Text style={[styles.subtitle, { fontSize: s(13) }]}>
                Edit your account information.
              </Text>
            </View>

            <View style={{ width: 44 }} />
          </View>

          <View style={[styles.card, { padding: s(14), borderRadius: s(22) }]}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.muted}>Loading data...</Text>
              </View>
            ) : unauthorized ? (
              <View style={styles.center}>
                <Ionicons
                  name="alert-circle-outline"
                  size={26}
                  color="#EF4444"
                />
                <Text style={[styles.muted, { marginTop: 8 }]}>
                  Unauthorized
                </Text>

                <Pressable
                  onPress={() => router.replace("/(auth)/login")}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Ionicons name="log-in-outline" size={18} color="#0A1630" />
                  <Text style={styles.primaryBtnText}>Login</Text>
                </Pressable>

                <Pressable
                  onPress={loadProfile}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.secondaryBtnText}>Tải lại</Text>
                </Pressable>
              </View>
            ) : error ? (
              <View style={styles.center}>
                <Ionicons
                  name="alert-circle-outline"
                  size={26}
                  color="#EF4444"
                />
                <Text
                  style={[styles.muted, { marginTop: 8, textAlign: "center" }]}
                >
                  {error}
                </Text>

                <Pressable
                  onPress={loadProfile}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.secondaryBtnText}>Tải lại</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Account */}
                <Text style={styles.sectionTitle}>Account</Text>

                <Field
                  icon="mail-outline"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@gmail.com"
                  keyboardType="email-address"
                />

                <Field
                  icon="call-outline"
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+84xxxxxxxxx"
                  keyboardType="phone-pad"
                />

                <Field
                  icon="person-outline"
                  label="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Võ Anh Nhật"
                  autoCapitalize="words"
                />

                <Field
                  icon="calendar-outline"
                  label="Birthday (YYYY-MM-DD)"
                  value={birthday}
                  onChangeText={setBirthday}
                  placeholder="2004-07-24"
                />

                <Field
                  icon="ribbon-outline"
                  label="Member level id"
                  value={memberLevelId}
                  onChangeText={setMemberLevelId}
                  placeholder="member_level_id"
                />

                {/* Sex */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Sex</Text>
                <View style={styles.sexRow}>
                  {(["MALE", "FEMALE", "OTHER"] as const).map((k) => {
                    const active = sex === k;
                    return (
                      <Pressable
                        key={k}
                        onPress={() => setSex(k)}
                        style={({ pressed }) => [
                          styles.sexBtn,
                          active && styles.sexBtnActive,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sexText,
                            active && styles.sexTextActive,
                          ]}
                        >
                          {k}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Address */}
                <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
                  Address
                </Text>

                {isWide ? (
                  <View style={styles.grid}>
                    <View style={styles.half}>
                      <Field
                        icon="location-outline"
                        label="Street"
                        value={street}
                        onChangeText={setStreet}
                        placeholder="Street"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.half}>
                      <Field
                        icon="grid-outline"
                        label="Ward"
                        value={ward}
                        onChangeText={setWard}
                        placeholder="Ward"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.half}>
                      <Field
                        icon="business-outline"
                        label="City"
                        value={city}
                        onChangeText={setCity}
                        placeholder="City"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.half}>
                      <Field
                        icon="earth-outline"
                        label="Country"
                        value={country}
                        onChangeText={setCountry}
                        placeholder="Country"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.half}>
                      <Field
                        icon="pricetag-outline"
                        label="Zip code"
                        value={zipCode}
                        onChangeText={setZipCode}
                        placeholder="Zip code"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    <Field
                      icon="location-outline"
                      label="Street"
                      value={street}
                      onChangeText={setStreet}
                      placeholder="Street"
                      autoCapitalize="words"
                    />
                    <Field
                      icon="grid-outline"
                      label="Ward"
                      value={ward}
                      onChangeText={setWard}
                      placeholder="Ward"
                      autoCapitalize="words"
                    />
                    <Field
                      icon="business-outline"
                      label="City"
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      autoCapitalize="words"
                    />
                    <Field
                      icon="earth-outline"
                      label="Country"
                      value={country}
                      onChangeText={setCountry}
                      placeholder="Country"
                      autoCapitalize="words"
                    />
                    <Field
                      icon="pricetag-outline"
                      label="Zip code"
                      value={zipCode}
                      onChangeText={setZipCode}
                      placeholder="Zip code"
                      keyboardType="number-pad"
                    />
                  </>
                )}

                {/* Buttons */}
                <Pressable
                  onPress={onSubmit}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    saving && { opacity: 0.7 },
                    pressed && { transform: [{ scale: 0.99 }], opacity: 0.95 },
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color="#0A1630" />
                      <Text style={styles.saveText}>Update</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>

          <View style={{ height: 22 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A1630" },
  content: {
    padding: 16,
    paddingTop: Platform.OS === "android" ? 14 : 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingTop: Platform.OS === "android" ? 70 : 6,
  },
  iconBtn: {
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

  label: {
    color: "rgba(15,23,42,0.70)",
    fontWeight: "900",
    fontSize: 12.5,
    marginBottom: 6,
    marginLeft: 2,
  },

  inputWrap: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(231,192,107,0.16)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14.5,
  },

  sexRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  sexBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F2F4F8",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sexBtnActive: {
    backgroundColor: "#E7C06B",
    borderColor: "rgba(0,0,0,0.10)",
  },
  sexText: {
    fontWeight: "900",
    color: "rgba(15,23,42,0.70)",
  },
  sexTextActive: {
    color: "#0A1630",
  },

  saveBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#E7C06B",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  saveText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 16,
  },

  cancelBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#E7C06B",
    fontWeight: "900",
    fontSize: 14,
  },

  center: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  muted: { color: "rgba(15,23,42,0.70)", fontWeight: "800" },

  primaryBtn: {
    marginTop: 6,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E7C06B",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#0A1630", fontWeight: "900" },

  secondaryBtn: {
    marginTop: 8,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.30)",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#E7C06B", fontWeight: "900" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  half: { width: "49%" },
});
