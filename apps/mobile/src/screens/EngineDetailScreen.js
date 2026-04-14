import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { getTemplateSummary, parseWorkspaceDescription } from "../lib/engine-templates";
import { supabase } from "../lib/supabase";
import { Body, Eyebrow, Heading, PrimaryButton, ScreenScroll, SurfaceCard } from "../components/ui";

export default function EngineDetailScreen({ navigation, route }) {
  const workspaceId = route.params?.workspaceId;
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, description, created_at")
        .eq("id", workspaceId)
        .single();

      if (error) {
        Alert.alert("Unable to load engine", error.message);
        return;
      }

      if (!active || !data) return;

      const parsed = parseWorkspaceDescription(data.description);
      const template = getTemplateSummary(parsed.metadata?.templateId);
      setEngine({
        id: data.id,
        title: data.name,
        description: parsed.visibleDescription,
        metadata: parsed.metadata,
        template
      });
    }

    load();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  if (!engine) {
    return (
      <ScreenScroll>
        <SurfaceCard>
          <Text style={{ fontSize: 16, color: "#475569" }}>Loading engine...</Text>
        </SurfaceCard>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <SurfaceCard>
        <Eyebrow>{engine.template.label}</Eyebrow>
        <Heading style={{ marginTop: 12 }}>{engine.title}</Heading>
        <Body style={{ marginTop: 12 }}>
          {engine.description ||
            "Naroa will keep this engine focused on the next execution move without losing the lane structure."}
        </Body>
      </SurfaceCard>

      {engine.metadata?.templateId === "mobile-app-build" ? (
        <SurfaceCard>
          <Eyebrow>Supported mobile path</Eyebrow>
          <Body style={{ marginTop: 12 }}>
            Primary Build Path: React Native + Expo. Secondary MVP Path: PWA / mobile web.
            Advisory Path: Flutter, native iOS, native Android.
          </Body>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <Eyebrow>Lane structure</Eyebrow>
        <View style={{ gap: 10, marginTop: 14 }}>
          {engine.template.lanes.map((lane) => (
            <View
              key={lane}
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.16)",
                backgroundColor: "rgba(255,255,255,0.94)",
                paddingHorizontal: 14,
                paddingVertical: 12
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>{lane}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <PrimaryButton
        label="Open Naroa"
        onPress={() =>
          navigation.navigate("MainTabs", {
            screen: "Naroa",
            params: { engineTitle: engine.title, workspaceId: engine.id }
          })
        }
      />
    </ScreenScroll>
  );
}
