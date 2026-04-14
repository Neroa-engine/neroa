import { useCallback, useState } from "react";
import { RefreshControl, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getTemplateSummary, parseWorkspaceDescription } from "../lib/engine-templates";
import { EngineCard } from "../components/engine-card";
import {
  Body,
  Eyebrow,
  Heading,
  PrimaryButton,
  ScreenScroll,
  SurfaceCard
} from "../components/ui";

function formatUpdatedLabel(value) {
  if (!value) {
    return "Recently";
  }

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "Recently";
  }
}

export default function EngineBoardScreen({ navigation }) {
  const { user } = useAuth();
  const [engines, setEngines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEngines = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, description, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const next = (data ?? []).map((workspace) => {
        const parsed = parseWorkspaceDescription(workspace.description);
        const templateSummary = getTemplateSummary(parsed.metadata?.templateId);

        return {
          id: workspace.id,
          title: workspace.name,
          description: parsed.visibleDescription,
          templateLabel: templateSummary.label,
          laneCount: templateSummary.lanes.length,
          updatedLabel: formatUpdatedLabel(workspace.created_at),
          metadata: parsed.metadata
        };
      });

      setEngines(next);
    }

    setRefreshing(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEngines();
    }, [loadEngines])
  );

  return (
    <ScreenScroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadEngines} />}
    >
      <SurfaceCard>
        <Eyebrow>Engine Board</Eyebrow>
        <Heading style={{ marginTop: 12 }}>
          Manage your engines and AI execution from mobile.
        </Heading>
        <Body style={{ marginTop: 12 }}>
          Open active engines, review the lane structure, jump into Naroa, and keep support close
          without losing the execution thread.
        </Body>
        <PrimaryButton
          label="Create new engine"
          onPress={() => navigation.navigate("EngineIntake")}
        />
      </SurfaceCard>

      {engines.length === 0 ? (
        <SurfaceCard>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>No engines yet</Text>
          <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 22, color: "#475569" }}>
            Start with SaaS, Internal Software, External Apps, or Mobile Apps and Naroa will create
            the first engine structure for you.
          </Text>
        </SurfaceCard>
      ) : (
        engines.map((engine) => (
          <EngineCard
            key={engine.id}
            engine={engine}
            onPress={() =>
              navigation.navigate("EngineDetail", {
                workspaceId: engine.id,
                engineTitle: engine.title
              })
            }
          />
        ))
      )}
    </ScreenScroll>
  );
}
