import { describe, expect, it } from "vitest";
import type { AvailableModelInfo } from "../types";
import {
  GROK_45_EFFORTS,
  GROK_46_EFFORTS,
  LEGACY_EFFORTS,
  resolveReasoningOptions,
  selectedReasoningEffort,
} from "./reasoningEffort";

const catalogWithCustomMenu: AvailableModelInfo[] = [
  {
    modelId: "grok-4.6",
    supportsReasoningEffort: true,
    reasoningEfforts: [
      { value: "deep", label: "Deep" },
      { value: "high", label: "High", default: true },
    ],
  },
];

const catalogWithoutMeta: AvailableModelInfo[] = [{ modelId: "grok-4.6" }];

const catalogCustomReasoner: AvailableModelInfo[] = [
  {
    modelId: "custom-reasoner",
    supportsReasoningEffort: true,
    reasoningEfforts: [],
  },
];

describe("resolveReasoningOptions", () => {
  it("uses the catalog list when the agent advertised one", () => {
    expect(
      resolveReasoningOptions("grok-4.6", catalogWithCustomMenu).map(
        (option) => option.value,
      ),
    ).toEqual(["deep", "high"]);
  });

  it("falls back for grok-4.6 when the catalog is empty", () => {
    expect(resolveReasoningOptions("grok-4.6", [])).toEqual(GROK_46_EFFORTS);
  });

  it("falls back for grok-4.5 without xhigh", () => {
    expect(resolveReasoningOptions("grok-4.5", [])).toEqual(GROK_45_EFFORTS);
  });

  it("uses the legacy menu when support is set but the list is empty", () => {
    expect(resolveReasoningOptions("custom-reasoner", catalogCustomReasoner)).toEqual(
      LEGACY_EFFORTS,
    );
  });

  it("still offers grok-4.6 when catalog meta omitted the support flag", () => {
    expect(resolveReasoningOptions("grok-4.6", catalogWithoutMeta)).toEqual(
      GROK_46_EFFORTS,
    );
  });

  it("hides the menu for unknown models without support", () => {
    expect(resolveReasoningOptions("other", [{ modelId: "other" }])).toEqual([]);
    expect(resolveReasoningOptions("grok-4-mini", [])).toEqual([]);
  });
});

describe("selectedReasoningEffort", () => {
  it("prefers the session choice, then catalog default", () => {
    expect(selectedReasoningEffort(GROK_46_EFFORTS, "xhigh")?.value).toBe(
      "xhigh",
    );
    expect(selectedReasoningEffort(GROK_46_EFFORTS, null)?.value).toBe("high");
  });
});
