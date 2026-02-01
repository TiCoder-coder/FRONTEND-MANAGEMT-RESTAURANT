import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
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
import { useAuthActions } from "../hooks";

export default function LoginScreen() {
  // Tạo ra một biến dùng để callback
  const router = useRouter();

  // Tinh chỉnh kích thước phù hợp theo từng thiết bị
  const { width } = useWindowDimensions();

  const pageMaxWidth = React.useMemo(() => {
    if (width >= 1200) return 720; // desktop/web
    if (width >= 992) return 640; // tablet lớn
    if (width >= 768) return 560; // tablet thường
    return 520; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 36, pageMaxWidth)); // 18*2 padding
  const isTablet = width >= 768;

  // scale nhẹ (optional nhưng đẹp)
  const scale = Math.min(Math.max(width / 375, 0.95), 1.15);
  const s = (n: number) => Math.round(n * scale);

  // Nhập các dữ liệu cho request
  const [email, setEmail] = useState(""); // Email
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => {
    const vn = PHONE_COUNTRIES.find((c) => c.callingCode === "84");
    return vn ?? PHONE_COUNTRIES[0];
  }); // Số điện thoại
  const [phoneNational, setPhoneNational] = useState(""); // Quốc gia (đầu của số điện thoại)
  const [password, setPassword] = useState(""); // Password
  const [submitting, setSubmitting] = useState(false); // Submit

  // Quyết định password show/hide
  const [showPw, setShowPw] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPassword("");

      setPhoneNational("");
      setShowPw(false);

      return () => {};
    }, []),
  );

  const { login } = useAuthActions(); // Lấy action login

  // Gọi + validate + chuyển trang cho chức năng login
  const onLogin = async () => {
    try {
      // Trong login có 3 thuộc tính là email, phone và password
      const e = email.trim();
      const national = phoneNational.trim();
      const p = `+${phoneCountry.callingCode}${national}`;
      const pw = password;

      if (!e) {
        Alert.alert("Information missing", "Please enter the email address.");
        return;
      }
      if (!national) {
        Alert.alert("Missing information", "Please enter the phone number.");
        return;
      }
      if (!pw.trim()) {
        Alert.alert("Incomplete information", "Please enter the password.");
        return;
      }

      setSubmitting(true);

      // Gọi login
      await login({
        email: e,
        phone: p,
        password: pw,
      });

      // Login ok thì chuyển qua home (vào app)
      router.replace("/(tabs)/home");
    } catch (err: any) {
      // Sai thì in ra lỗi
      Alert.alert("Login failed", err?.message ?? "An error occurred.");
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.container,
            { justifyContent: width >= 992 ? "center" : "flex-start" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { width: pageWidth, marginTop: width >= 992 ? 40 : 80 },
            ]}
          >
            <View style={styles.logoBadge}>
              <Ionicons name="restaurant-outline" size={20} color="#0A1630" />
            </View>

            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? s(24) : s(22),
                  lineHeight: isTablet ? s(28) : s(26),
                },
              ]}
            >
              RESTAURANT
            </Text>
            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? s(24) : s(22),
                  lineHeight: isTablet ? s(28) : s(26),
                },
              ]}
            >
              MANAGEMENT APP
            </Text>

            <Text
              style={[styles.welcome, { fontSize: isTablet ? s(24) : s(22) }]}
            >
              Welcome Back!
            </Text>

            <Text style={styles.sub}>Login to continue</Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              { width: pageWidth, padding: s(16), borderRadius: s(24) },
            ]}
          >
            {/* Email */}
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={18} color="#E7C06B" />
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.55)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Phone */}
            <PhoneNumberInput
              containerStyle={styles.inputWrap}
              inputStyle={styles.input}
              country={phoneCountry}
              onChangeCountry={setPhoneCountry}
              nationalNumber={phoneNational}
              onChangeNationalNumber={setPhoneNational}
              placeholder="Phone number"
            />

            {/* Password */}
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                secureTextEntry={!showPw}
                style={[styles.input, { paddingRight: 44 }]}
              />

              <Pressable
                onPress={() => setShowPw((v) => !v)}
                style={({ pressed }) => [
                  styles.eyeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={showPw ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>
            </View>

            {/* Forgot password */}
            <Pressable
              onPress={() => router.push("/(auth)/reset_password")}
              style={({ pressed }) => [
                styles.forgotBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              onPress={onLogin}
              style={({ pressed }) => [
                styles.loginBtn,
                submitting && { opacity: 0.6 },
                pressed && { transform: [{ scale: 0.99 }], opacity: 0.95 },
              ]}
            >
              <Ionicons name="log-in-outline" size={18} color="#0A1630" />
              <Text style={styles.loginText}>Login</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerMuted}>Don’t have an account?</Text>
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                style={({ pressed }) => [pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.registerLink}> Register</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#0A1630" },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 42 : 26,
    alignItems: "center",
    flexGrow: 1,
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 80,
    marginBottom: 16,
  },

  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  title: {
    color: "#E7C06B",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 0.5,
    lineHeight: 26,
  },

  welcome: {
    marginTop: 10,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 22,
  },
  sub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.70)",
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
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
    marginBottom: 12,
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

  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  forgotText: {
    color: "#8B5A00",
    fontWeight: "900",
    fontSize: 12.5,
  },

  loginBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#E7C06B",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  loginText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 16,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(15,23,42,0.14)",
  },
  dividerText: {
    color: "rgba(15,23,42,0.55)",
    fontWeight: "900",
    fontSize: 12,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 12,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F6F0DD",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  registerMuted: {
    color: "rgba(15,23,42,0.65)",
    fontWeight: "800",
    fontSize: 13,
  },
  registerLink: {
    color: "#8B5A00",
    fontWeight: "900",
    fontSize: 13,
  },

  footer: {
    marginTop: 14,
    paddingBottom: 12,
  },
  footerText: {
    color: "rgba(255,255,255,0.70)",
    fontWeight: "800",
  },
  footerLink: {
    color: "#E7C06B",
    fontWeight: "900",
  },
});
