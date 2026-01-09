import Papa from 'papaparse';
import type { Member, Task, ConfigRule, SkillMeta, CSVImportResult, CSVImportError } from '../types';

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Generate short name from skill name
function generateShortName(skillName: string): string {
  // Remove trailing "skill" or "Skill"
  const cleaned = skillName.replace(/\s+(skill|Skill)$/i, '').trim();
  
  // Check for special cases with slashes or acronyms
  if (cleaned.includes('/')) {
    return cleaned; // Keep as is (e.g., "UI/UX")
  }
  
  // Take first word or first letters of each word if multiple words
  const words = cleaned.split(/\s+/);
  if (words.length === 1) {
    return words[0];
  }
  
  // If multiple words, use first 3-4 letters of first word
  return words[0].substring(0, 4);
}

// Parse config_rules.csv: Level ID, Level Name, Max SP Self, Review Authority
export function parseConfigRules(csvContent: string): CSVImportResult<ConfigRule> {
  const errors: CSVImportError[] = [];
  const rules: ConfigRule[] = [];

  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  if (result.errors.length > 0) {
    return {
      success: false,
      data: [],
      errors: result.errors.map(e => ({
        row: e.row || 0,
        column: '',
        message: e.message
      }))
    };
  }

  // Check required columns
  const requiredColumns = ['Level ID', 'Level Name', 'Max SP Self', 'Review Authority'];
  const headers = result.meta.fields || [];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: '',
        message: `Thiếu cột bắt buộc: ${missingColumns.join(', ')}`
      }]
    };
  }

  result.data.forEach((row, index) => {
    const levelId = parseInt(row['Level ID']);
    const levelName = row['Level Name']?.trim();
    const maxSPSelf = parseFloat(row['Max SP Self']);
    const reviewAuthority = parseFloat(row['Review Authority']);

    if (isNaN(levelId)) {
      errors.push({
        row: index + 2,
        column: 'Level ID',
        message: 'Level ID phải là số'
      });
      return;
    }

    if (!levelName) {
      errors.push({
        row: index + 2,
        column: 'Level Name',
        message: 'Level Name không được để trống'
      });
      return;
    }

    if (isNaN(maxSPSelf) || maxSPSelf < 0) {
      errors.push({
        row: index + 2,
        column: 'Max SP Self',
        message: 'Max SP Self phải là số không âm'
      });
      return;
    }

    if (isNaN(reviewAuthority) || reviewAuthority < 0) {
      errors.push({
        row: index + 2,
        column: 'Review Authority',
        message: 'Review Authority phải là số không âm'
      });
      return;
    }

    rules.push({
      levelId,
      levelName,
      maxSPSelf,
      reviewAuthority
    });
  });

  return {
    success: errors.length === 0,
    data: rules,
    errors
  };
}

// Parse member_profile.csv with dynamic skill discovery
// Fixed columns: Member Name, Current Level, Last Review Date
// All other columns are skill columns
export function parseMemberProfiles(
  csvContent: string,
  existingSkillMeta: SkillMeta[]
): CSVImportResult<Member> {
  const errors: CSVImportError[] = [];
  const members: Member[] = [];
  const newSkills: string[] = [];

  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  if (result.errors.length > 0) {
    return {
      success: false,
      data: [],
      errors: result.errors.map(e => ({
        row: e.row || 0,
        column: '',
        message: e.message
      })),
      newSkillsDetected: []
    };
  }

  // Check required columns
  const requiredColumns = ['Member Name', 'Current Level', 'Last Review Date'];
  const headers = result.meta.fields || [];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: '',
        message: `Thiếu cột bắt buộc: ${missingColumns.join(', ')}`
      }],
      newSkillsDetected: []
    };
  }

  // Identify skill columns (all columns except fixed ones)
  const skillColumns = headers.filter(h => !requiredColumns.includes(h));
  
  // Check for new skills
  const existingSkillNames = new Set(existingSkillMeta.map(s => s.csvColumnName));
  skillColumns.forEach(col => {
    if (!existingSkillNames.has(col)) {
      newSkills.push(col);
    }
  });

  // Create skill map: columnName -> skillId
  const skillMap = new Map<string, string>();
  existingSkillMeta.forEach(skill => {
    skillMap.set(skill.csvColumnName, skill.id);
  });

  result.data.forEach((row, index) => {
    const name = row['Member Name']?.trim();
    const currentLevel = row['Current Level']?.trim();
    const lastReviewDate = row['Last Review Date']?.trim() || '';

    if (!name) {
      errors.push({
        row: index + 2,
        column: 'Member Name',
        message: 'Member Name không được để trống'
      });
      return;
    }

    if (!currentLevel) {
      errors.push({
        row: index + 2,
        column: 'Current Level',
        message: 'Current Level không được để trống'
      });
      return;
    }

    // Parse skills
    const skills: Record<string, number> = {};
    let hasSkillError = false;

    skillColumns.forEach(col => {
      const value = parseInt(row[col]);
      
      if (row[col] && (isNaN(value) || value < 1 || value > 5)) {
        errors.push({
          row: index + 2,
          column: col,
          message: `Giá trị skill phải từ 1-5, nhận được: ${row[col]}`
        });
        hasSkillError = true;
        return;
      }

      const skillId = skillMap.get(col);
      if (skillId) {
        skills[skillId] = value || 0;
      }
    });

    if (hasSkillError) {
      return;
    }

    const now = new Date().toISOString();
    members.push({
      id: generateId(),
      name,
      currentLevel,
      lastReviewDate,
      skills,
      createdAt: now,
      updatedAt: now
    });
  });

  return {
    success: errors.length === 0,
    data: members,
    errors,
    newSkillsDetected: newSkills
  };
}

// Parse task_allocation.csv with dynamic complexity discovery
// Fixed columns: Task/Feature, Link, Final SP, Assignee
// Computed columns (ignored): Max Complexity, Skill gap check, Suitability Score, Status, Reviewer, Review Focus, Reviewer matching
// All other columns are complexity/skill columns
export function parseTaskAllocation(
  csvContent: string,
  existingSkillMeta: SkillMeta[]
): CSVImportResult<Task> {
  const errors: CSVImportError[] = [];
  const tasks: Task[] = [];
  const newSkills: string[] = [];

  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  if (result.errors.length > 0) {
    return {
      success: false,
      data: [],
      errors: result.errors.map(e => ({
        row: e.row || 0,
        column: '',
        message: e.message
      })),
      newSkillsDetected: []
    };
  }

  // Check required columns
  const requiredColumns = ['Task/Feature', 'Link'];
  const headers = result.meta.fields || [];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: '',
        message: `Thiếu cột bắt buộc: ${missingColumns.join(', ')}`
      }],
      newSkillsDetected: []
    };
  }

  // Identify complexity columns (all columns except fixed and computed)
  const fixedColumns = ['Task/Feature', 'Link', 'Final SP', 'Assignee'];
  const computedColumns = ['Max Complexity', 'Skill gap check', 'Suitability Score', 'Status', 'Reviewer', 'Review Focus', 'Reviewer matching'];
  const complexityColumns = headers.filter(h => !fixedColumns.includes(h) && !computedColumns.includes(h));
  
  // Check for new skills
  const existingSkillNames = new Set(existingSkillMeta.map(s => s.csvColumnName));
  complexityColumns.forEach(col => {
    if (!existingSkillNames.has(col)) {
      newSkills.push(col);
    }
  });

  // Create skill map: columnName -> skillId
  const skillMap = new Map<string, string>();
  existingSkillMeta.forEach(skill => {
    skillMap.set(skill.csvColumnName, skill.id);
  });

  result.data.forEach((row, index) => {
    const name = row['Task/Feature']?.trim();
    const link = row['Link']?.trim() || '';
    const finalSP = parseFloat(row['Final SP']) || 0;
    const assignee = row['Assignee']?.trim() || '';

    if (!name) {
      errors.push({
        row: index + 2,
        column: 'Task/Feature',
        message: 'Task/Feature không được để trống'
      });
      return;
    }

    // Parse complexity
    const complexity: Record<string, number> = {};
    let hasComplexityError = false;

    complexityColumns.forEach(col => {
      const value = parseInt(row[col]);
      
      if (row[col] && (isNaN(value) || value < 1 || value > 5)) {
        errors.push({
          row: index + 2,
          column: col,
          message: `Giá trị complexity phải từ 1-5, nhận được: ${row[col]}`
        });
        hasComplexityError = true;
        return;
      }

      const skillId = skillMap.get(col);
      if (skillId) {
        complexity[skillId] = value || 0;
      }
    });

    if (hasComplexityError) {
      return;
    }

    const now = new Date().toISOString();
    tasks.push({
      id: generateId(),
      name,
      link,
      finalSP,
      assignee,
      complexity,
      createdAt: now,
      updatedAt: now
    });
  });

  return {
    success: errors.length === 0,
    data: tasks,
    errors,
    newSkillsDetected: newSkills
  };
}

// Detect new skills from CSV content
export function detectNewSkills(csvContent: string, existingSkillMeta: SkillMeta[]): string[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    preview: 1 // Just need headers
  });

  const headers = result.meta.fields || [];
  
  // Determine which columns are skill columns based on context
  const fixedMemberColumns = ['Member Name', 'Current Level', 'Last Review Date'];
  const fixedTaskColumns = ['Task/Feature', 'Link', 'Final SP', 'Assignee'];
  const computedColumns = ['Max Complexity', 'Skill gap check', 'Suitability Score', 'Status', 'Reviewer', 'Review Focus', 'Reviewer matching'];
  
  let skillColumns: string[];
  
  if (fixedMemberColumns.every(col => headers.includes(col))) {
    // Member CSV
    skillColumns = headers.filter(h => !fixedMemberColumns.includes(h));
  } else if (fixedTaskColumns.some(col => headers.includes(col))) {
    // Task CSV
    skillColumns = headers.filter(h => !fixedTaskColumns.includes(h) && !computedColumns.includes(h));
  } else {
    skillColumns = [];
  }
  
  const existingSkillNames = new Set(existingSkillMeta.map(s => s.csvColumnName));
  return skillColumns.filter(col => !existingSkillNames.has(col));
}

// Create SkillMeta from skill name
export function createSkillMeta(skillName: string): SkillMeta {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: skillName,
    shortName: generateShortName(skillName),
    csvColumnName: skillName,
    createdAt: now,
    updatedAt: now
  };
}
