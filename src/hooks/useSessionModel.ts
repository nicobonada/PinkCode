import { useCallback, useRef, useState } from "react";
import { setSessionModel } from "../api";
import type { ManagedAgentInfo } from "../types";
import {
  nextSessionModelChoice,
  sessionModelNeedsPush,
  type SessionModelChoice,
} from "../utils/sessionModel";

/**
 * Local model + thinking-level pick. The chip reads this; ACP is updated
 * immediately when live, or once via `reapply` on first send/attach.
 */
export function useSessionModel() {
  const [choiceBySession, setChoiceBySession] = useState<
    Record<string, SessionModelChoice>
  >({});
  const choiceRef = useRef(choiceBySession);
  choiceRef.current = choiceBySession;

  const write = useCallback(
    (sessionId: string, next: SessionModelChoice | undefined) => {
      const map = { ...choiceRef.current };
      if (next) map[sessionId] = next;
      else delete map[sessionId];
      choiceRef.current = map;
      setChoiceBySession(map);
    },
    [],
  );

  const choiceOf = useCallback(
    (sessionId: string | null | undefined) =>
      sessionId ? choiceBySession[sessionId] : undefined,
    [choiceBySession],
  );

  const select = useCallback(
    (sessionId: string, modelId: string, reasoningEffort?: string) => {
      write(
        sessionId,
        nextSessionModelChoice(
          choiceRef.current[sessionId],
          modelId,
          reasoningEffort,
        ),
      );
    },
    [write],
  );

  const revert = useCallback(
    (sessionId: string, previous?: SessionModelChoice) => {
      write(sessionId, previous);
    },
    [write],
  );

  const reapply = useCallback(
    async (info: ManagedAgentInfo): Promise<ManagedAgentInfo> => {
      const sessionId = info.sessionId;
      if (!sessionId) return info;
      const push = sessionModelNeedsPush(choiceRef.current[sessionId], info);
      if (!push) return info;
      await setSessionModel(info.handleId, push.modelId, push.reasoningEffort);
      return {
        ...info,
        modelId: push.modelId,
        reasoningEffort: push.reasoningEffort ?? info.reasoningEffort,
      };
    },
    [],
  );

  return { choiceOf, select, revert, reapply };
}
