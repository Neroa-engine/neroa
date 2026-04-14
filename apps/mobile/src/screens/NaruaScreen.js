import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MessageBubble } from "../components/message-bubble";
import { Body, Eyebrow, Heading, ScreenScroll, SurfaceCard } from "../components/ui";
import { appColors } from "../lib/theme";

function buildAssistantReply(input, engineTitle) {
  const normalized = input.toLowerCase();

  if (normalized.includes("mobile")) {
    return "Naroa recommends keeping React Native + Expo as the primary mobile path, using a PWA only when speed and budget protection matter more than app-store delivery.";
  }

  if (normalized.includes("budget")) {
    return "Naroa would tighten the scope first, compare the protected MVP against the budget guardrail, then decide whether the engine should stay lean or move deeper into build execution.";
  }

  if (normalized.includes("launch")) {
    return "The next useful move is to line up testing, release readiness, and the first launch checklist before widening the engine.";
  }

  return `Naroa is treating ${engineTitle || "this engine"} as the active context. The next move is to clarify the immediate outcome, keep the lane sequence tight, and open only the execution step that earns it.`;
}

export default function NaruaScreen({ route }) {
  const engineTitle = route.params?.engineTitle ?? null;
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "narua",
      content: engineTitle
        ? `Naroa is ready inside ${engineTitle}. Ask for the next move, the MVP cut line, the budget signal, or the build-path recommendation.`
        : "Naroa is ready. Ask what to build next, which lane should lead, or how to move from strategy into execution."
    }
  ]);
  const [draft, setDraft] = useState("");

  const suggestions = useMemo(
    () => [
      "What should I do next?",
      "How should this engine move into build?",
      "What is the smartest MVP cut line?",
      "How should I protect the budget?"
    ],
    []
  );

  function handleSend(text = draft) {
    const value = text.trim();

    if (!value) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: value },
      {
        id: `narua-${Date.now()}`,
        role: "narua",
        content: buildAssistantReply(value, engineTitle)
      }
    ]);
    setDraft("");
  }

  return (
    <ScreenScroll>
      <SurfaceCard>
        <Eyebrow>Naroa mobile</Eyebrow>
        <Heading style={{ marginTop: 12 }}>
          {engineTitle ? `Guide ${engineTitle}` : "Guide the next execution move"}
        </Heading>
        <Body style={{ marginTop: 12 }}>
          This mobile Naroa view is built for guidance, lane decisions, and next-step clarity. It is
          not the full desktop build surface.
        </Body>
      </SurfaceCard>

      <SurfaceCard style={{ paddingBottom: 12 }}>
        <Eyebrow>Conversation</Eyebrow>
        <ScrollView style={styles.thread} contentContainerStyle={{ gap: 10, paddingTop: 14 }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard>
        <Eyebrow>Quick prompts</Eyebrow>
        <View style={{ gap: 10, marginTop: 14 }}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => handleSend(suggestion)}
              style={styles.prompt}
            >
              <Text style={styles.promptText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Eyebrow>Message Naroa</Eyebrow>
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask about MVP, budget, build path, or launch readiness..."
            placeholderTextColor={appColors.textSoft}
            multiline
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Start voice input"
            onPress={() =>
              Alert.alert(
                "Voice input",
                "Voice capture can be wired next. The control is in place so the mobile input pattern matches the rest of Naroa."
              )
            }
            style={styles.iconButton}
          >
            <Ionicons name="mic-outline" size={20} color={appColors.text} />
          </Pressable>
          <Pressable accessibilityLabel="Send message" onPress={() => handleSend()} style={styles.sendButton}>
            <Ionicons name="arrow-up" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  thread: {
    maxHeight: 320
  },
  prompt: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  promptText: {
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  inputRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10
  },
  input: {
    flex: 1,
    minHeight: 90,
    maxHeight: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: appColors.text,
    textAlignVertical: "top"
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center"
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: appColors.blue,
    alignItems: "center",
    justifyContent: "center"
  }
});
