export type MatchMode =
  | "exact"
  | "contains"
  | "starts-with"
  | "ends-with"
  | "regex"
  | "not-empty"
  | "exists"
  | "gte"
  | "lte";

export type ValidationRule =
  | { type: "element-exists"; selector: string; file: string }
  | { type: "element-count"; selector: string; file: string; min?: number; max?: number }
  | { type: "element-text"; selector: string; file: string; text: string; match: MatchMode }
  | { type: "attribute-exists"; selector: string; file: string; attribute: string }
  | {
      type: "attribute-value";
      selector: string;
      file: string;
      attribute: string;
      value?: string;
      match: MatchMode;
    }
  | { type: "attribute-count"; selector: string; file: string; minAttributes: number }
  | { type: "css-property"; selector: string; file: string; property: string; match: MatchMode }
  | {
      type: "css-property-value";
      selector: string;
      file: string;
      property: string;
      value: string;
      match: MatchMode;
    }
  | { type: "file-contains"; file: string; text: string }
  | { type: "file-not-contains"; file: string; text: string }
  | { type: "file-regex"; file: string; pattern: string }
  | { type: "nesting"; parent: string; child: string; direct?: boolean; file: string }
  | { type: "element-order"; selectors: string[]; within: string; file: string }
  | { type: "sibling"; first: string; then: string; file: string }
  | { type: "indent-style"; file: string; style: "spaces" | "tabs"; size?: number }
  | { type: "composite"; operator: "and" | "or"; rules: ValidationRule[] };

export interface CheckpointResult {
  checkpointId: string;
  passed: boolean;
}
