import { Pressable, StyleSheet, Text, View } from "react-native";
import { founderPlans } from "../data/plans";
import { useAuth } from "../context/AuthContext";
import { appColors } from "../lib/theme";
import {
  Body,
  Eyebrow,
  Heading,
  PrimaryButton,
  ScreenScroll,
  SecondaryButton,
  SurfaceCard
} from "../components/ui";

export default function PlanSelectScreen({ navigation }) {
  const {
    selectedPlan,
    setSelectedPlan,
    selectedBillingInterval,
    setSelectedBillingInterval
  } = useAuth();

  return (
    <ScreenScroll>
      <SurfaceCard>
        <Eyebrow>Neroa mobile</Eyebrow>
        <Heading style={{ marginTop: 12 }}>
          Start with a plan, then open the product.
        </Heading>
        <Body style={{ marginTop: 12 }}>
          Choose the plan that matches how many engines you want to run and how much guided
          execution you need each month. Every paid plan includes monthly Engine Credits.
        </Body>
      </SurfaceCard>

      <SurfaceCard>
        <Eyebrow>Billing</Eyebrow>
        <View style={styles.toggleRow}>
          {[
            { id: "monthly", label: "Monthly" },
            { id: "annual", label: "Annual (12% off)" }
          ].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedBillingInterval(option.id)}
              style={[
                styles.toggle,
                selectedBillingInterval === option.id ? styles.toggleActive : null
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedBillingInterval === option.id ? styles.toggleTextActive : null
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      {founderPlans.map((plan) => (
        <Pressable key={plan.id} onPress={() => setSelectedPlan(plan.id)}>
          <SurfaceCard style={selectedPlan === plan.id ? styles.planActive : null}>
            <View style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <View
                style={[styles.planBadge, selectedPlan === plan.id ? styles.planBadgeActive : null]}
              >
                <Text style={styles.planBadgeText}>
                  {selectedPlan === plan.id ? "Selected" : "Plan"}
                </Text>
              </View>
            </View>
            <View style={{ gap: 8, marginTop: 14 }}>
              <Text style={styles.planMeta}>{plan.credits}</Text>
              <Text style={styles.planMeta}>{plan.engines}</Text>
              <Text style={styles.planMeta}>{plan.stages}</Text>
            </View>
          </SurfaceCard>
        </Pressable>
      ))}

      <View style={{ gap: 12 }}>
        <PrimaryButton
          label="Continue to account setup"
          onPress={() => navigation.navigate("Auth", { mode: "signup" })}
        />
        <SecondaryButton
          label="Already have an account?"
          onPress={() => navigation.navigate("Auth", { mode: "signin" })}
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  toggle: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  toggleActive: {
    borderColor: "rgba(37,99,235,0.24)",
    backgroundColor: "rgba(37,99,235,0.09)"
  },
  toggleText: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  toggleTextActive: {
    color: appColors.blue
  },
  planActive: {
    borderColor: "rgba(37,99,235,0.22)",
    backgroundColor: "rgba(255,255,255,0.98)"
  },
  planHeader: {
    flexDirection: "row",
    gap: 12
  },
  planName: {
    color: appColors.text,
    fontSize: 19,
    fontWeight: "700"
  },
  planDescription: {
    marginTop: 6,
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  planBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  planBadgeActive: {
    borderColor: "rgba(37,99,235,0.2)",
    backgroundColor: "rgba(37,99,235,0.08)"
  },
  planBadgeText: {
    color: appColors.textSoft,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  planMeta: {
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 22
  }
});
