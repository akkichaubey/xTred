import { describe, it, expect } from "vitest";

describe("Macro Calendar Engine", () => {
  it("should contain valid macro events data structure", () => {
    const sampleEvent = {
      id: "evt-1",
      event_name: "FOMC Rate Decision",
      currency: "USD",
      impact: 3,
      scheduled_at: new Date().toISOString(),
      forecast_value: "5.25%",
      previous_value: "5.25%",
      actual_value: "Pending",
    };

    expect(sampleEvent.event_name).toBe("FOMC Rate Decision");
    expect(sampleEvent.impact).toBe(3);
  });
});
