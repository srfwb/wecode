import type { LessonData } from "../types";
import html01 from "./html-01-structure.json";
import challenge01 from "./challenge-01-simple-page.json";

export const LESSONS: readonly LessonData[] = [html01 as LessonData];
export const CHALLENGES: readonly LessonData[] = [challenge01 as LessonData];
export const ALL_CONTENT: readonly LessonData[] = [...LESSONS, ...CHALLENGES];

export function getLessonById(id: string): LessonData | undefined {
  return ALL_CONTENT.find((l) => l.id === id);
}
