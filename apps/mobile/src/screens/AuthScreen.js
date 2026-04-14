import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { appColors } from "../lib/theme";
import {
  Body,
  Eyebrow,
  FormField,
  Heading,
  PrimaryButton,
  ScreenScroll,
  SecondaryButton,
  SurfaceCard
} from "../components/ui";

export default function AuthScreen({ navigation, route }) {
  const { selectedPlan, selectedBillingInterval, signIn, signUp } = useAuth();
  const [mode, setMode] = useState(route.params?.mode ?? "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const helperText = useMemo(
    () =>
      mode === "signup"
        ? `Creating an account with the ${selectedPlan} plan on ${selectedBillingInterval}.`
        : "Sign in with an existing account to access your Engine Board.",
    [mode, selectedBillingInterval, selectedPlan]
  );

  async function handleContinue() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Enter both email and password to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const result =
        mode === "signup"
          ? await signUp({
              email: email.trim(),
              password: password.trim(),
              planId: selectedPlan,
              billingInterval: selectedBillingInterval
            })
          : await signIn({
              email: email.trim(),
              password: password.trim()
            });

      if (result.error) {
        Alert.alert("Account access failed", result.error.message);
        return;
      }

      if (mode === "signup") {
        Alert.alert(
          "Account created",
          "Your account has been created. If email confirmation is enabled, finish that step, then sign in."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll>
      <SurfaceCard>
        <Eyebrow>{mode === "signup" ? "Account setup" : "Account access"}</Eyebrow>
        <Heading style={{ marginTop: 12 }}>
          {mode === "signup" ? "Create your Naroa account" : "Sign in to Naroa"}
        </Heading>
        <Body style={{ marginTop: 12 }}>{helperText}</Body>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.modeRow}>
          {[
            { id: "signup", label: "Create account" },
            { id: "signin", label: "Sign in" }
          ].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setMode(option.id)}
              style={[styles.modeChip, mode === option.id ? styles.modeChipActive : null]}
            >
              <Text
                style={[
                  styles.modeChipText,
                  mode === option.id ? styles.modeChipTextActive : null
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 14, marginTop: 16 }}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />
        </View>
      </SurfaceCard>

      <View style={{ gap: 12 }}>
        <PrimaryButton
          label={submitting ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
          onPress={handleContinue}
          disabled={submitting}
        />
        {mode === "signup" ? (
          <SecondaryButton label="Back to plans" onPress={() => navigation.goBack()} />
        ) : (
          <SecondaryButton label="Need a new account?" onPress={() => setMode("signup")} />
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: "row",
    gap: 10
  },
  modeChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  modeChipActive: {
    borderColor: "rgba(6,182,212,0.22)",
    backgroundColor: "rgba(6,182,212,0.08)"
  },
  modeChipText: {
    color: appColors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  modeChipTextActive: {
    color: appColors.cyan
  }
});
