import type { ValidationRule } from "./validation/types";

export interface LessonParagraph {
  kind: "text" | "code";
  content: string;
}

export interface CheckpointDef {
  id: string;
  label: string;
  rule: ValidationRule;
}

export interface LessonStep {
  heading: string;
  paragraphs: LessonParagraph[];
  checkpoints: CheckpointDef[];
}

export interface LessonData {
  id: string;
  type: "lesson" | "challenge";
  title: string;
  description: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  estimatedMinutes: number;
  tags: string[];
  allowFileOps: boolean;
  starterFiles: Record<string, string>;
  steps: LessonStep[];
}

export type CheckpointStatus = "todo" | "active" | "done";

export interface CheckpointState {
  id: string;
  status: CheckpointStatus;
}
