import { describe, expect, test } from "vitest";

import { createSerializeQueue } from "./serializeQueue";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("createSerializeQueue", () => {
  test("runs operations strictly in the order they were enqueued", async () => {
    const serialize = createSerializeQueue();
    const log: string[] = [];

    const slow = async () => {
      await delay(20);
      log.push("A");
    };
    const fast = async () => {
      log.push("B");
    };

    const p1 = serialize(slow);
    const p2 = serialize(fast);
    await Promise.all([p1, p2]);

    expect(log).toEqual(["A", "B"]);
  });

  test("continues the chain after a rejection", async () => {
    const serialize = createSerializeQueue();
    const log: string[] = [];

    const fails = async () => {
      throw new Error("boom");
    };
    const ok = async () => {
      log.push("second");
    };

    await expect(serialize(fails)).rejects.toThrow("boom");
    await serialize(ok);

    expect(log).toEqual(["second"]);
  });

  test("forwards the resolved value to the caller", async () => {
    const serialize = createSerializeQueue();
    const result = await serialize(async () => 42);
    expect(result).toBe(42);
  });

  test("does not interleave three concurrent operations", async () => {
    const serialize = createSerializeQueue();
    const log: string[] = [];

    const op = (label: string, ms: number) => async () => {
      log.push(`${label}:start`);
      await delay(ms);
      log.push(`${label}:end`);
    };

    const p1 = serialize(op("A", 15));
    const p2 = serialize(op("B", 5));
    const p3 = serialize(op("C", 10));
    await Promise.all([p1, p2, p3]);

    expect(log).toEqual(["A:start", "A:end", "B:start", "B:end", "C:start", "C:end"]);
  });
});
