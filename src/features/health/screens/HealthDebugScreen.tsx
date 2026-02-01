import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ENV } from "../../../core/config/env";
import { HEALTH_ENDPOINT } from "../api";
import { useHealthCheck } from "../hooks";

export default function HealthDebugScreen() {
  const { loading, result, error, run, runAuto, reset } = useHealthCheck();
  const [custom, setCustom] = useState("/health");

  const baseUrl = useMemo(() => ENV.BASE_URL, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🩺 Health Debug</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🌐 BASE_URL</Text>
        <Text style={styles.mono}>{baseUrl}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>🔑 X_API_KEY</Text>
        <Text style={styles.mono}>
          {ENV.X_API_KEY
            ? "✅ Provided"
            : "⚠️ Empty (nếu backend yêu cầu thì phải set)"}
        </Text>

        <Text style={[styles.label, { marginTop: 12 }]}>⏱️ TIME_OUT</Text>
        <Text style={styles.mono}>{ENV.TIME_OUT} ms</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🚀 Quick test</Text>

        <View style={styles.row}>
          <Btn
            text={loading ? "Running..." : "Auto Ping"}
            disabled={loading}
            onPress={runAuto}
          />
          <Btn text="Reset" variant="ghost" onPress={reset} />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          📌 Try default endpoints
        </Text>
        <View style={styles.wrap}>
          {HEALTH_ENDPOINT.map((ep) => (
            <Chip
              key={ep}
              text={ep}
              disabled={loading}
              onPress={() => run(ep)}
            />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          🧪 Custom endpoint
        </Text>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="/restaurants/v1/health"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          style={styles.input}
        />
        <Btn
          text={loading ? "Testing..." : `GET ${custom || ""}`}
          disabled={loading || !custom.trim()}
          onPress={() => run(custom)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📦 Result</Text>

        {result ? (
          <>
            <Text style={styles.ok}>
              ✅ {result.endpoint} • {result.status} • {result.durationMs}ms
            </Text>
            <Text style={styles.monoSmall}>{safeStringify(result.data)}</Text>
          </>
        ) : error ? (
          <>
            <Text style={styles.bad}>❌ Request failed</Text>
            <Text style={styles.monoSmall}>{safeStringify(error)}</Text>
            <Text style={styles.hint}>
              💡 Nếu lỗi network: kiểm tra BASE_URL có đúng chưa (đừng để link
              swagger). Nếu chạy emulator Android và backend chạy trên máy bạn:
              dùng http://10.0.2.2:PORT
            </Text>
          </>
        ) : (
          <Text style={styles.hint}>Bấm Auto Ping để test nhanh.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function Btn({
  text,
  onPress,
  disabled,
  variant = "solid",
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        variant === "ghost" && styles.btnGhost,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text
        style={[styles.btnText, variant === "ghost" && styles.btnTextGhost]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

function Chip({
  text,
  onPress,
  disabled,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, disabled && styles.btnDisabled]}
    >
      <Text style={styles.chipText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#0B1220" },
  title: { fontSize: 22, fontWeight: "800", color: "#E5E7EB" },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
    gap: 10,
  },

  label: { color: "#93C5FD", fontWeight: "700" },
  mono: { color: "#E5E7EB", fontFamily: "monospace" },
  monoSmall: {
    color: "#E5E7EB",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 16,
  },

  row: { flexDirection: "row", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  input: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#E5E7EB",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },

  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
  btnTextGhost: { color: "#E5E7EB" },

  chip: {
    backgroundColor: "rgba(37,99,235,0.18)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.35)",
  },
  chipText: { color: "#BFDBFE", fontWeight: "700", fontSize: 12 },

  ok: { color: "#34D399", fontWeight: "800" },
  bad: { color: "#FCA5A5", fontWeight: "800" },
  hint: { color: "#9CA3AF", fontSize: 12, lineHeight: 16 },
});
