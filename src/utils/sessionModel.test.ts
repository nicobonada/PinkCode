import { describe, expect, it } from "vitest";
import {
  displayedSessionModel,
  nextSessionModelChoice,
  sessionModelNeedsPush,
} from "./sessionModel";

describe("nextSessionModelChoice", () => {
  it("keeps the previous thinking level when only the model changes", () => {
    expect(
      nextSessionModelChoice(
        { modelId: "grok-4.6", reasoningEffort: "xhigh" },
        "grok-4.5",
      ),
    ).toEqual({ modelId: "grok-4.5", reasoningEffort: "xhigh" });
  });
});

describe("displayedSessionModel", () => {
  it("lets the user pick win over the live agent", () => {
    expect(
      displayedSessionModel(
        { modelId: "grok-4.6", reasoningEffort: "xhigh" },
        { modelId: "grok-4.6", reasoningEffort: "high" },
        "grok-4.5",
      ),
    ).toEqual({ modelId: "grok-4.6", reasoningEffort: "xhigh" });
  });

  it("falls back to the agent, then the session card", () => {
    expect(
      displayedSessionModel(undefined, { modelId: "grok-4.6", reasoningEffort: "high" }, "card"),
    ).toEqual({ modelId: "grok-4.6", reasoningEffort: "high" });
    expect(displayedSessionModel(undefined, null, "grok-4.5")).toEqual({
      modelId: "grok-4.5",
      reasoningEffort: null,
    });
  });
});

describe("sessionModelNeedsPush", () => {
  it("skips when ACP already matches the pick", () => {
    expect(
      sessionModelNeedsPush(
        { modelId: "grok-4.6", reasoningEffort: "high" },
        { modelId: "grok-4.6", reasoningEffort: "high" },
      ),
    ).toBeNull();
  });

  it("pushes a disconnected thinking-level pick", () => {
    expect(
      sessionModelNeedsPush(
        { modelId: "grok-4.6", reasoningEffort: "xhigh" },
        { modelId: "grok-4.6", reasoningEffort: "high" },
      ),
    ).toEqual({ modelId: "grok-4.6", reasoningEffort: "xhigh" });
  });
});
