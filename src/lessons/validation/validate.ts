import type { CheckpointResult, ValidationRule } from "./types";
import { evaluateRule } from "./rules/composite";

interface CheckpointDef {
  id: string;
  label: string;
  rule: ValidationRule;
}

export function validateCheckpoints(
  checkpoints: CheckpointDef[],
  files: Record<string, string>,
): CheckpointResult[] {
  return checkpoints.map((cp) => ({
    checkpointId: cp.id,
    passed: evaluateRule(cp.rule, files),
  }));
}
