// Skills are DYNAMIC - loaded from CSV or added via UI
// No hardcoded skill list - system discovers skills from imported data

// Skill definition (stored in TTA_SKILL_META)
export interface SkillMeta {
  id: string;           // Unique identifier (UUID)
  name: string;         // Full name (e.g., "Requirement Elicitation")
  shortName: string;    // Short name for display (e.g., "Req")
  csvColumnName: string; // Original CSV column name for re-import
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}

// Member with DYNAMIC skills (Record<skillId, value>)
export interface Member {
  id: string;
  name: string;
  currentLevel: string;           // References ConfigRule.levelName
  lastReviewDate: string;         // Format: "Month DD, YYYY" or empty
  skills: Record<string, number>; // skillId → value (1-5), dynamic based on SkillMeta
  createdAt: string;
  updatedAt: string;
}

// Task with DYNAMIC complexity (Record<skillId, value>)
export interface Task {
  id: string;
  name: string;                      // Task/Feature name
  link: string;                      // External reference (e.g., "XCOR-18024")
  finalSP: number;                   // Story points
  assignee: string;                  // Member name
  complexity: Record<string, number>; // skillId → value (1-5), dynamic based on SkillMeta
  createdAt: string;
  updatedAt: string;
}

// Computed task data (not stored, calculated real-time)
export interface ComputedTaskData {
  maxComplexity: number;           // MAX of all complexity values
  skillGaps: string[];             // Format: ["⚠️Req", "⚠️Tech"]
  suitabilityScore: number;        // Sum of (member - task) for all skills
  status: 'TỰ QUYẾT' | 'CẦN REVIEW';
  reviewer: string;                // Suggested reviewer name or empty
  reviewFocus: string;             // Format: "Focus: Tech, UI/UX" or empty
  reviewerMatching: '✅ Hợp lệ' | '—';
}

// Configuration rule per level (DYNAMIC - loaded from CSV or added via UI)
export interface ConfigRule {
  levelId: number;        // "Level ID" column
  levelName: string;      // "Level Name" column (e.g., "Intern 1", "Senior")
  maxSPSelf: number;      // "Max SP Self" column
  reviewAuthority: number; // "Review Authority" column
}

// App state - ALL data is dynamic, loaded from CSV or UI
export interface AppState {
  members: Member[];
  tasks: Task[];
  configRules: ConfigRule[];
  skillMeta: SkillMeta[];     // No default skills - discovered from CSV imports
}

// LocalStorage keys
export const STORAGE_KEYS = {
  MEMBERS: 'TTA_MEMBERS',
  TASKS: 'TTA_TASKS',
  CONFIG_RULES: 'TTA_CONFIG_RULES',
  SKILL_META: 'TTA_SKILL_META'
} as const;

// CSV Import types
export interface CSVImportResult<T> {
  success: boolean;
  data: T[];
  errors: CSVImportError[];
  newSkillsDetected?: string[];
}

export interface CSVImportError {
  row: number;
  column: string;
  message: string;
}

// Action types for reducer
export type StorageAction =
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CONFIG_RULES'; payload: ConfigRule[] }
  | { type: 'ADD_CONFIG_RULE'; payload: ConfigRule }
  | { type: 'UPDATE_CONFIG_RULE'; payload: ConfigRule }
  | { type: 'DELETE_CONFIG_RULE'; payload: number }
  | { type: 'SET_SKILL_META'; payload: SkillMeta[] }
  | { type: 'ADD_SKILL_META'; payload: SkillMeta }
  | { type: 'UPDATE_SKILL_META'; payload: SkillMeta }
  | { type: 'DELETE_SKILL_META'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: AppState };
