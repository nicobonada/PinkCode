import type { ManagedAgentInfo } from "../types";

/** User-selected model + thinking level for one session. */
export type SessionModelChoice = {
  modelId: string;
  reasoningEffort?: string;
};

export function nextSessionModelChoice(
  previous: SessionModelChoice | undefined,
  modelId: string,
  reasoningEffort?: string,
): SessionModelChoice {
  return {
    modelId,
    reasoningEffort: reasoningEffort ?? previous?.reasoningEffort,
  };
}

/** Chip display: user pick wins, then live agent, then the session card. */
export function displayedSessionModel(
  choice: SessionModelChoice | undefined,
  agent:
    | Pick<ManagedAgentInfo, "modelId" | "reasoningEffort">
    | null
    | undefined,
  cardModelId?: string | null,
): { modelId: string | null; reasoningEffort: string | null } {
  return {
    modelId: choice?.modelId ?? agent?.modelId ?? cardModelId ?? null,
    reasoningEffort: choice?.reasoningEffort ?? agent?.reasoningEffort ?? null,
  };
}

/** Values to send on attach, or null when ACP already matches the pick. */
export function sessionModelNeedsPush(
  choice: SessionModelChoice | undefined,
  agent: Pick<ManagedAgentInfo, "modelId" | "reasoningEffort">,
): { modelId: string; reasoningEffort?: string } | null {
  if (!choice) return null;
  const modelId = choice.modelId.trim() || agent.modelId || "";
  if (!modelId) return null;
  const reasoningEffort = choice.reasoningEffort?.trim() || undefined;
  if (
    modelId === (agent.modelId ?? "") &&
    (reasoningEffort ?? "") === (agent.reasoningEffort ?? "")
  ) {
    return null;
  }
  return { modelId, reasoningEffort };
}
