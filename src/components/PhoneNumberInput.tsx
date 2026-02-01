import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from "react-native";
import { PHONE_COUNTRIES, PhoneCountry } from "../constants/phoneCountries";

type Props = {
  country: PhoneCountry;
  onChangeCountry: (c: PhoneCountry) => void;

  nationalNumber: string;
  onChangeNationalNumber: (v: string) => void;

  placeholder?: string;
  autoStripLeadingZero?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  selectorStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

function FlagImage({
  source,
  name,
  style,
}: {
  source: ImageSourcePropType;
  name: string;
  style: any;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={[style, styles.flagFallback]}>
        <Ionicons name="flag" size={12} color="#64748B" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
      onError={(e) => {
        console.log("FLAG ERROR:", name, e?.nativeEvent);
        setFailed(true);
      }}
    />
  );
}

export function PhoneNumberInput({
  country,
  onChangeCountry,
  nationalNumber,
  onChangeNationalNumber,
  placeholder = "Phone number",
  autoStripLeadingZero = true,
  containerStyle,
  selectorStyle,
  inputStyle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((c) => c.name.toLowerCase().includes(s));
  }, [q]);

  const onChangeText = (txt: string) => {
    let digits = txt.replace(/[^\d]/g, "");
    if (autoStripLeadingZero) digits = digits.replace(/^0+/, "");
    onChangeNationalNumber(digits);
  };

  return (
    <>
      <View style={[styles.row, containerStyle]}>
        <Pressable
          onPress={() => setOpen(true)}
          style={[styles.selector, selectorStyle]}
        >
          <FlagImage
            source={country.flag}
            name={country.name}
            style={styles.flag}
          />
          <Text style={styles.codeText}>+{country.callingCode}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>

        <TextInput
          value={nationalNumber}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={[styles.input, inputStyle]}
        />
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select country</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#0F172A" />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search country..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <FlatList
              style={{ maxHeight: 420 }}
              data={list}
              keyExtractor={(c) => `${c.name}-${c.callingCode}`}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={7}
              removeClippedSubviews
              renderItem={({ item: c }) => (
                <Pressable
                  onPress={() => {
                    onChangeCountry(c);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Image
                    source={c.flag}
                    style={styles.itemFlag}
                    resizeMode="cover"
                    resizeMethod="resize"
                    onError={(e) =>
                      console.log("FLAG ERROR:", c.name, e.nativeEvent)
                    }
                  />
                  <Text style={styles.itemName}>{c.name}</Text>
                  <Text style={styles.itemCode}>+{c.callingCode}</Text>
                </Pressable>
              )}
              ListFooterComponent={<View style={{ height: 10 }} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(231,192,107,0.25)",
  },

  flag: {
    width: 26,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  codeText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13.5 },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14.5,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    backgroundColor: "rgba(15,23,42,0.04)",
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontWeight: "700", color: "#0F172A" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  itemFlag: {
    width: 26,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  itemName: { flex: 1, fontWeight: "800", color: "#0F172A" },
  itemCode: { fontWeight: "900", color: "#334155" },

  flagFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
