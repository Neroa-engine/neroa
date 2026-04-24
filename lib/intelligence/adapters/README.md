# Neroa Conversation Artifact Adapter

This namespace is the hidden bridge between real planning conversation artifacts and the intelligence stack.

What it does:
- normalizes conversation artifacts from planning and strategy surfaces
- maps artifacts into extraction-state updates
- recomputes branch classification from updated extraction truth
- recomputes next-question selection from updated extraction and branch state
- supports duplicate suppression, replay, and rebuild from artifact history

What it does not do:
- it does not change visible `/start` replies
- it does not change workspace behavior, auth, billing, routing, or UI surfaces
- it does not enforce runtime governance by itself

How later passes should use it:
1. adapt real thread/message artifacts into `ConversationArtifact` values
2. apply them through `applyArtifactToIntelligenceState(...)` or `rebuildIntelligenceStateFromArtifacts(...)`
3. consume the resulting hidden bundle for read-only verification first
4. wire runtime integration only in a later pass after explicit verification
