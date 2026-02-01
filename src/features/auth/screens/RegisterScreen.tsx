import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { PhoneNumberInput } from "../../../components/PhoneNumberInput";
import {
  PHONE_COUNTRIES,
  PhoneCountry,
} from "../../../constants/phoneCountries";

type Sex = "MALE" | "FEMALE" | "OTHER";

export default function RegisterScreen() {
  const router = useRouter(); // Biến dùng để callback

  // Set các loading
  const [loading, setLoading] = useState(false);

  // Set các thuộc tính để gửi request
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  const [birthday, setBirthday] = useState("");
  const [sex, setSex] = useState<Sex>("MALE");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => {
    const vn = PHONE_COUNTRIES.find((c) => c.callingCode === "84");
    return vn ?? PHONE_COUNTRIES[0];
  });
  const [phoneNational, setPhoneNational] = useState("");

  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [otpSending, setOtpSending] = useState(false);

  // Tinh chỉnh kích thước
  const { width } = useWindowDimensions();

  const pageMaxWidth = useMemo(() => {
    if (width >= 1200) return 720; // desktop/web/mac
    if (width >= 992) return 660; // tablet ngang
    if (width >= 768) return 600; // tablet
    return 520; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 32, pageMaxWidth));
  const twoCols = width >= 992; // dùng cho layout 2 cột trên màn hình lớn

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
      setOtpSending(false);

      setCompanyId("");
      setEmail("");
      setPassword("");
      setShowPass(false);
      setFullName("");
      setOtp("");

      setBirthday("");
      setSex("MALE");
      setPhoneNational("");

      setStreet("");
      setWard("");
      setCity("");
      setCountry("");
      setZipCode("");

      return () => {};
    }, []),
  );

  // Gửi otp đến mail người dùng thông qua swagger api trên service
  const onSendOtp = async () => {
    try {
      const e = email.trim();

      if (!e) {
        Alert.alert(
          "Incomplete information",
          "Please enter the email address before sending the OTP.",
        );
        return;
      }

      setOtpSending(true);

      await api.get(ENDPOINTS.AUTH_OTP, {
        params: { email: e, type: "CREATE_ACCOUNT" },
      });

      Alert.alert("Success", "OTP sent to email. Please check your email!");
    } catch (err: any) {
      Alert.alert("OTP delivery failed.", err?.message ?? "An error occurred.");
    } finally {
      setOtpSending(false);
    }
  };

  // Xét các điều kiện để có để register
  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (!password.trim()) return false;
    if (!fullName.trim()) return false;
    if (!otp.trim()) return false;
    if (!birthday.trim()) return false;
    if (!phoneNational.trim()) return false;
    if (!street.trim() || !city.trim() || !country.trim()) return false;
    return true;
  }, [
    email,
    password,
    fullName,
    otp,
    birthday,
    phoneNational,
    street,
    city,
    country,
  ]);

  // Chuẩn hoá ngày sinh
  const normalizeBirthdayToISO = (yyyyMMdd: string) => {
    if (yyyyMMdd.includes("T")) return yyyyMMdd;
    return `${yyyyMMdd}T00:00:00.000Z`;
  };

  // Gửi các request để đăng kí
  const onSubmit = async () => {
    try {
      if (!canSubmit) {
        Alert.alert(
          "Missing information",
          "Please fill in all the required fields.",
        );
        return;
      }

      setLoading(true);

      const payload = {
        company_id: companyId ?? "",
        email: email.trim(),
        password: password,
        full_name: fullName.trim(),
        otp: Number(otp),
        birthday: normalizeBirthdayToISO(birthday.trim()),
        sex: sex,
        phone: `+${phoneCountry.callingCode}${phoneNational}`,
        address: {
          street: street.trim(),
          ward: ward.trim(),
          city: city.trim(),
          country: country.trim(),
          zip_code: zipCode.trim(),
        },
      };

      await api.post(ENDPOINTS.AUTH_REGISTER, payload);

      Alert.alert("Success", "Registration OK. Now, please log in!", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (e: any) {
      Alert.alert("Registration failed", e?.message ?? "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#050B1C", "#071A2F", "#0B1F3B", "#06122A"]}
      locations={[0, 0.35, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { justifyContent: width >= 992 ? "center" : "flex-start" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { width: pageWidth }]}>
            <View style={styles.logoBadge}>
              <Ionicons name="restaurant-outline" size={18} color="#0A1630" />
            </View>

            <Text style={styles.appTitle}>RESTAURANT{"\n"}MANAGEMENT APP</Text>
            <Text style={styles.welcome}>Create Account</Text>
            <Text style={styles.sub}>Register to continue</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { width: pageWidth }]}>
            {/* Company ID */}
            <InputRow
              icon="business-outline"
              placeholder="Company ID (optional)"
              value={companyId}
              onChangeText={setCompanyId}
            />

            {/* Full name */}
            <InputRow
              icon="person-outline"
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
            <InputRow
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <View style={styles.inputRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.60)"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                onPress={() => setShowPass((v) => !v)}
                style={styles.rightIconBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="rgba(255,255,255,0.85)"
                />
              </Pressable>
            </View>

            {/* OTP + Send OTP */}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <MiniLabel text="OTP" />
                <MiniInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="OTP"
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ width: twoCols ? 160 : 120 }}>
                <MiniLabel text=" " />
                <Pressable
                  onPress={onSendOtp}
                  disabled={otpSending}
                  style={({ pressed }) => [
                    styles.sendOtpBtn,
                    otpSending && { opacity: 0.6 },
                    pressed &&
                      !otpSending && {
                        opacity: 0.9,
                        transform: [{ scale: 0.99 }],
                      },
                  ]}
                >
                  <Text style={styles.sendOtpText}>
                    {otpSending ? "Sending..." : "Send OTP"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Birthday (move xuống dưới, sát khu OTP) */}
            <View style={styles.row1}>
              <MiniLabel text="Birthday (YYYY-MM-DD)" />
              <MiniInput
                value={birthday}
                onChangeText={setBirthday}
                placeholder="Birthday"
                autoCapitalize="none"
              />
            </View>

            {/* Sex */}
            <MiniLabel text="Sex" />
            <View style={styles.segment}>
              {(["MALE", "FEMALE", "OTHER"] as Sex[]).map((s) => {
                const active = sex === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSex(s)}
                    style={[
                      styles.segmentBtn,
                      active && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Phone */}
            <PhoneNumberInput
              containerStyle={styles.inputRow}
              country={phoneCountry}
              onChangeCountry={setPhoneCountry}
              nationalNumber={phoneNational}
              onChangeNationalNumber={setPhoneNational}
              placeholder="Phone number"
            />

            {/* Address */}
            <Text style={styles.sectionTitle}>Address</Text>

            <View style={twoCols ? styles.grid : undefined}>
              <View style={twoCols ? styles.half : undefined}>
                <InputRow
                  icon="location-outline"
                  placeholder="Street"
                  value={street}
                  onChangeText={setStreet}
                />
              </View>

              <View style={twoCols ? styles.half : undefined}>
                <InputRow
                  icon="grid-outline"
                  placeholder="Ward"
                  value={ward}
                  onChangeText={setWard}
                />
              </View>

              <View style={twoCols ? styles.half : undefined}>
                <InputRow
                  icon="business-outline"
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={twoCols ? styles.half : undefined}>
                <InputRow
                  icon="earth-outline"
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                />
              </View>

              <View style={twoCols ? styles.half : undefined}>
                <InputRow
                  icon="pricetag-outline"
                  placeholder="Zip code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Submit */}
            <Pressable
              disabled={!canSubmit || loading}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                (!canSubmit || loading) && { opacity: 0.55 },
                pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
              ]}
            >
              <Ionicons name="person-add-outline" size={18} color="#0A1630" />
              <Text style={styles.submitText}>
                {loading ? "Registering..." : "Register"}
              </Text>
            </Pressable>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.footerLink}> Login</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 18 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InputRow(props: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.iconBox}>
        <Ionicons name={props.icon} size={18} color="#E7C06B" />
      </View>
      <TextInput
        style={styles.input}
        placeholder={props.placeholder}
        placeholderTextColor="rgba(255,255,255,0.60)"
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize ?? "sentences"}
      />
    </View>
  );
}

function MiniLabel({ text }: { text: string }) {
  return <Text style={styles.miniLabel}>{text}</Text>;
}

function MiniInput(props: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <TextInput
      style={styles.miniInput}
      placeholder={props.placeholder}
      placeholderTextColor="rgba(15,23,42,0.45)"
      value={props.value}
      onChangeText={props.onChangeText}
      keyboardType={props.keyboardType}
      autoCapitalize={props.autoCapitalize ?? "none"}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 42 : 26,
    paddingBottom: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  appTitle: {
    color: "#E7C06B",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  welcome: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  sub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontWeight: "700",
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  inputRow: {
    height: 52,
    backgroundColor: "#0E2B58",
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(231,192,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13.5,
  },
  rightIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  row2: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },
  miniInput: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F4F6FA",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  segment: {
    flexDirection: "row",
    backgroundColor: "#F4F6FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    overflow: "hidden",
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "rgba(231,192,107,0.35)",
  },
  segmentText: {
    fontWeight: "900",
    fontSize: 12.5,
    color: "rgba(15,23,42,0.70)",
  },
  segmentTextActive: {
    color: "#0F172A",
  },

  sectionTitle: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },

  submitBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
    shadowColor: "#E7C06B",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  submitText: {
    color: "#0A1630",
    fontSize: 15,
    fontWeight: "900",
  },

  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#0F172A",
    fontWeight: "800",
  },
  footerLink: {
    color: "#8B5A00",
    fontWeight: "900",
  },

  row1: {
    marginTop: 2,
    marginBottom: 10,
  },

  sendOtpBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },

  sendOtpText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 12.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  half: { width: "48%" },
});
