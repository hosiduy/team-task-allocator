import type { Task, Member, ConfigRule, SkillMeta, ComputedTaskData } from '../types';

// Calculate MAX of all complexity values
export function calculateMaxComplexity(task: Task): number {
  const values = Object.values(task.complexity);
  return values.length > 0 ? Math.max(...values) : 0;
}

// Calculate skill gaps: compare member skills vs task complexity
// Returns array of warnings in format: ["⚠️Req", "⚠️Tech"]
export function calculateSkillGaps(
  member: Member | null,
  task: Task,
  skillMeta: SkillMeta[]
): string[] {
  if (!member) return [];
  
  const gaps: string[] = [];
  
  skillMeta.forEach(skill => {
    const memberSkill = member.skills[skill.id] || 0;
    const taskComplexity = task.complexity[skill.id] || 0;
    
    if (taskComplexity > 0 && memberSkill < taskComplexity) {
      gaps.push(`⚠️${skill.shortName}`);
    }
  });
  
  return gaps;
}

// Calculate suitability score: sum of (member skill - task complexity) for all skills
export function calculateSuitabilityScore(
  member: Member | null,
  task: Task,
  skillMeta: SkillMeta[]
): number {
  if (!member) return 0;
  
  let score = 0;
  
  skillMeta.forEach(skill => {
    const memberSkill = member.skills[skill.id] || 0;
    const taskComplexity = task.complexity[skill.id] || 0;
    score += (memberSkill - taskComplexity);
  });
  
  return score;
}

// Calculate review status based on member level and task complexity
export function calculateReviewStatus(
  member: Member | null,
  maxComplexity: number,
  configRules: ConfigRule[]
): 'TỰ QUYẾT' | 'CẦN REVIEW' {
  if (!member) return 'CẦN REVIEW';
  
  const rule = configRules.find(r => r.levelName === member.currentLevel);
  if (!rule) return 'CẦN REVIEW';
  
  return maxComplexity <= rule.maxSPSelf ? 'TỰ QUYẾT' : 'CẦN REVIEW';
}

// Suggest reviewers for tasks needing review
// Returns { reviewer, reviewFocus, reviewerMatching }
export function suggestReviewers(
  members: Member[],
  assignee: Member | null,
    _task: Task, // Reserved for future use
  maxComplexity: number,
  skillGaps: string[],
  skillMeta: SkillMeta[],
  configRules: ConfigRule[],
  status: 'TỰ QUYẾT' | 'CẦN REVIEW'
): { reviewer: string; reviewFocus: string; reviewerMatching: '✅ Hợp lệ' | '—' } {
  if (status === 'TỰ QUYẾT') {
    return {
      reviewer: '',
      reviewFocus: '',
      reviewerMatching: '—'
    };
  }

  // Find members with reviewAuthority >= maxComplexity
  const eligibleReviewers = members.filter(m => {
    if (!assignee || m.id === assignee.id) return false;
    
    const rule = configRules.find(r => r.levelName === m.currentLevel);
    return rule && rule.reviewAuthority >= maxComplexity;
  });

  if (eligibleReviewers.length === 0) {
    return {
      reviewer: '',
      reviewFocus: '',
      reviewerMatching: '—'
    };
  }

  // Prioritize reviewers by gap skills
  // Find skill IDs from gap warnings
  const gapSkillIds = new Set<string>();
  skillGaps.forEach(gap => {
    const shortName = gap.replace('⚠️', '');
    const skill = skillMeta.find(s => s.shortName === shortName);
    if (skill) {
      gapSkillIds.add(skill.id);
    }
  });

  // Score reviewers by their skills in gap areas
  const scoredReviewers = eligibleReviewers.map(reviewer => {
    let gapScore = 0;
    gapSkillIds.forEach(skillId => {
      gapScore += reviewer.skills[skillId] || 0;
    });
    
    return { reviewer, gapScore };
  });

  // Sort by gap score descending
  scoredReviewers.sort((a, b) => b.gapScore - a.gapScore);
  
  const bestReviewer = scoredReviewers[0].reviewer;
  
  // Build review focus
  const focusSkills: string[] = [];
  gapSkillIds.forEach(skillId => {
    const skill = skillMeta.find(s => s.id === skillId);
    if (skill) {
      focusSkills.push(skill.shortName);
    }
  });
  
  const reviewFocus = focusSkills.length > 0 ? `Focus: ${focusSkills.join(', ')}` : '';

  return {
    reviewer: bestReviewer.name,
    reviewFocus,
    reviewerMatching: '✅ Hợp lệ'
  };
}

// Calculate all computed data for a task
export function calculateTaskData(
  task: Task,
  members: Member[],
  configRules: ConfigRule[],
  skillMeta: SkillMeta[]
): ComputedTaskData {
  const assignee = members.find(m => m.name === task.assignee) || null;
  const maxComplexity = calculateMaxComplexity(task);
  const skillGaps = calculateSkillGaps(assignee, task, skillMeta);
  const suitabilityScore = calculateSuitabilityScore(assignee, task, skillMeta);
  const status = calculateReviewStatus(assignee, maxComplexity, configRules);
  const reviewerInfo = suggestReviewers(members, assignee, task, maxComplexity, skillGaps, skillMeta, configRules, status);

  return {
    maxComplexity,
    skillGaps,
    suitabilityScore,
    status,
    reviewer: reviewerInfo.reviewer,
    reviewFocus: reviewerInfo.reviewFocus,
    reviewerMatching: reviewerInfo.reviewerMatching
  };
}

// Sync skills: ensure all skills in SkillMeta exist in all members
// Add missing skills to members with default value 0
export function syncSkills(
  members: Member[],
  skillMeta: SkillMeta[]
): Member[] {
  return members.map(member => {
    const updatedSkills = { ...member.skills };
    
    skillMeta.forEach(skill => {
      if (!(skill.id in updatedSkills)) {
        updatedSkills[skill.id] = 0;
      }
    });
    
    return {
      ...member,
      skills: updatedSkills,
      updatedAt: new Date().toISOString()
    };
  });
}

// Sync complexity: ensure all skills in SkillMeta exist in all tasks
// Add missing skills to tasks with default value 0
export function syncTaskComplexity(
  tasks: Task[],
  skillMeta: SkillMeta[]
): Task[] {
  return tasks.map(task => {
    const updatedComplexity = { ...task.complexity };
    
    skillMeta.forEach(skill => {
      if (!(skill.id in updatedComplexity)) {
        updatedComplexity[skill.id] = 0;
      }
    });
    
    return {
      ...task,
      complexity: updatedComplexity,
      updatedAt: new Date().toISOString()
    };
  });
}
