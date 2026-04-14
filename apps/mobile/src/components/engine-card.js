import { Pressable, StyleSheet, Text, View } from "react-native";
import { appColors } from "../lib/theme";
import { SurfaceCard, Pill } from "./ui";

export function EngineCard({ engine, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <SurfaceCard style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{engine.title}</Text>
            <Text style={styles.description}>{engine.description || "No summary yet."}</Text>
          </View>
          <Pill label={engine.templateLabel} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{engine.laneCount} lanes</Text>
          <Text style={styles.metaText}>{engine.updatedLabel}</Text>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14
  },
  header: {
    flexDirection: "row",
    gap: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: appColors.text
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: appColors.textMuted
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  metaText: {
    fontSize: 12,
    color: appColors.textSoft
  }
});
