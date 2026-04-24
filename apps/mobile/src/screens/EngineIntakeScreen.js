import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  buildNewEngineMetadata,
  encodeWorkspaceDescription,
  engineCategoryOptions,
  mobileSupportSummary
} from "../lib/engine-templates";
import { appColors } from "../lib/theme";
import {
  Body,
  Eyebrow,
  FormField,
  Heading,
  PrimaryButton,
  ScreenScroll,
  SurfaceCard
} from "../components/ui";

export default function EngineIntakeScreen({ navigation }) {
  const { user } = useAuth();
  const [categoryId, setCategoryId] = useState("mobile");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => engineCategoryOptions.find((item) => item.id === categoryId) ?? engineCategoryOptions[0],
    [categoryId]
  );

  async function handleCreate() {
    if (!title.trim() || !summary.trim() || !user?.id) {
      Alert.alert("Missing details", "Add an engine name and summary before continuing.");
      return;
    }

    setSubmitting(true);

    try {
      const metadata = buildNewEngineMetadata({ templateId: selectedCategory.templateId });
      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          owner_id: user.id,
          name: title.trim(),
          description: encodeWorkspaceDescription(summary.trim(), metadata)
        })
        .select("id")
        .single();

      if (error || !data) {
        Alert.alert("Unable to create engine", error?.message ?? "Try again in a moment.");
        return;
      }

      navigation.replace("EngineDetail", {
        workspaceId: data.id,
        engineTitle: title.trim()
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll>
      <SurfaceCard>
        <Eyebrow>New Engine</Eyebrow>
        <Heading style={{ marginTop: 12 }}>
          Start with the right build category.
        </Heading>
        <Body style={{ marginTop: 12 }}>
          Choose what you want to build and give Neroa the first clean summary. The mobile app keeps
          the engine structure tight while the heavier execution still syncs back to your Neroa
          system.
        </Body>
      </SurfaceCard>

      <SurfaceCard>
        <Eyebrow>Build category</Eyebrow>
        <View style={{ gap: 12, marginTop: 14 }}>
          {engineCategoryOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setCategoryId(option.id)}
              style={[styles.option, categoryId === option.id ? styles.optionActive : null]}
            >
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      {selectedCategory.id === "mobile" ? (
        <SurfaceCard>
          <Eyebrow>Mobile stack</Eyebrow>
          <Heading style={{ marginTop: 12, fontSize: 24, lineHeight: 28 }}>
            Mobile App support inside Neroa
          </Heading>
          <Body style={{ marginTop: 12 }}>
            Primary Build Path: {mobileSupportSummary.primaryBuildPath}. Secondary MVP Path:{" "}
            {mobileSupportSummary.secondaryMvpPath}. Advisory Path: {mobileSupportSummary.advisoryPath}.
          </Body>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <View style={{ gap: 14 }}>
          <FormField
            label="Engine name"
            value={title}
            onChangeText={setTitle}
            placeholder="Example: Field Service Mobile App"
          />
          <FormField
            label="What should this engine help build?"
            value={summary}
            onChangeText={setSummary}
            placeholder="Describe the product, the first outcome, and what Neroa should shape first."
            multiline
          />
        </View>
      </SurfaceCard>

      <PrimaryButton
        label={submitting ? "Creating engine..." : `Create ${selectedCategory.title} engine`}
        onPress={handleCreate}
        disabled={submitting}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  option: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  optionActive: {
    borderColor: "rgba(6,182,212,0.22)",
    backgroundColor: "rgba(6,182,212,0.08)"
  },
  optionTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  optionDescription: {
    marginTop: 6,
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 22
  }
});
