import { StyleSheet, Text, View } from "react-native";
import { appColors } from "../lib/theme";

export function MessageBubble({ role, content }) {
  const user = role === "user";

  return (
    <View style={[styles.base, user ? styles.user : styles.assistant]}>
      <Text style={[styles.badge, user ? styles.userBadge : styles.assistantBadge]}>
        {user ? "You" : "Naroa"}
      </Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1
  },
  user: {
    backgroundColor: "rgba(37,99,235,0.09)",
    borderColor: "rgba(37,99,235,0.15)",
    alignSelf: "flex-end",
    maxWidth: "88%"
  },
  assistant: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "rgba(148,163,184,0.18)",
    alignSelf: "flex-start",
    maxWidth: "92%"
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  userBadge: {
    color: appColors.blue
  },
  assistantBadge: {
    color: appColors.cyan
  },
  content: {
    marginTop: 8,
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 22
  }
});
