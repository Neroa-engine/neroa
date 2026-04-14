import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { appColors, appShadow } from "../lib/theme";

export function ScreenScroll({ children }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: appColors.page }}
      contentContainerStyle={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function SurfaceCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ children }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Heading({ children, style }) {
  return <Text style={[styles.heading, style]}>{children}</Text>;
}

export function Body({ children, style }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function PrimaryButton({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled ? { opacity: 0.92 } : null,
        disabled ? { opacity: 0.45 } : null
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed ? { opacity: 0.85 } : null]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function FormField({ label, value, onChangeText, placeholder, multiline = false, secureTextEntry = false }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={appColors.textSoft}
        style={[styles.input, multiline ? styles.textArea : null]}
      />
    </View>
  );
}

export function Pill({ label, style, textStyle }) {
  return (
    <View style={[styles.pill, style]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
    ...appShadow
  },
  eyebrow: {
    color: appColors.cyan,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase"
  },
  heading: {
    color: appColors.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700"
  },
  body: {
    color: appColors.textMuted,
    fontSize: 15,
    lineHeight: 24
  },
  primaryButton: {
    backgroundColor: appColors.blue,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: appColors.border
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: appColors.text
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: appColors.text
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top"
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
    backgroundColor: "rgba(6,182,212,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  pillText: {
    color: appColors.cyan,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  }
});
