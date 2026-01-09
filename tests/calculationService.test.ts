import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateMaxComplexity,
  calculateSkillGaps,
  calculateSuitabilityScore,
  calculateReviewStatus,
  syncSkills,
  syncTaskComplexity
} from '../src/services/calculationService';
import type { Task, Member, ConfigRule, SkillMeta } from '../src/types';

// Arbitraries for generating test data
const skillMetaArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 20 }),
  shortName: fc.string({ minLength: 1, maxLength: 5 }),
  csvColumnName: fc.string({ minLength: 3, maxLength: 20 }),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString())
}) as fc.Arbitrary<SkillMeta>;

const complexityArb = (skillIds: string[]) => 
  fc.record(
    Object.fromEntries(skillIds.map(id => [id, fc.integer({ min: 0, max: 5 })]))
  ) as fc.Arbitrary<Record<string, number>>;

const taskArb = (skillMeta: SkillMeta[]) => {
  const skillIds = skillMeta.map(s => s.id);
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    link: fc.string(),
    finalSP: fc.integer({ min: 1, max: 20 }),
    assignee: fc.string(),
    complexity: complexityArb(skillIds),
    createdAt: fc.date().map(d => d.toISOString()),
    updatedAt: fc.date().map(d => d.toISOString())
  }) as fc.Arbitrary<Task>;
};

const memberArb = (skillMeta: SkillMeta[]) => {
  const skillIds = skillMeta.map(s => s.id);
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 3, maxLength: 30 }),
    currentLevel: fc.constantFrom('Intern 1', 'Intern 2', 'Junior', 'Middle', 'Senior'),
    lastReviewDate: fc.option(fc.date().map(d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))).map(v => v || ''),
    skills: complexityArb(skillIds),
    createdAt: fc.date().map(d => d.toISOString()),
    updatedAt: fc.date().map(d => d.toISOString())
  }) as fc.Arbitrary<Member>;
};

const configRuleArb = fc.record({
  levelId: fc.integer({ min: 1, max: 5 }),
  levelName: fc.constantFrom('Intern 1', 'Intern 2', 'Junior', 'Middle', 'Senior'),
  maxSPSelf: fc.integer({ min: 0, max: 50 }),
  reviewAuthority: fc.integer({ min: 0, max: 50 })
}) as fc.Arbitrary<ConfigRule>;

describe('Calculation Service Property Tests', () => {
  describe('Property 5: Max Complexity Calculation', () => {
    it('should return MAX of all complexity values', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          (skillMeta) => {
            return fc.pre(skillMeta.length > 0) && fc.property(
              taskArb(skillMeta),
              (task) => {
                const maxComplexity = calculateMaxComplexity(task);
                const complexityValues = Object.values(task.complexity);
                const expectedMax = complexityValues.length > 0 ? Math.max(...complexityValues) : 0;
                
                expect(maxComplexity).toBe(expectedMax);
                expect(maxComplexity).toBeGreaterThanOrEqual(0);
                expect(maxComplexity).toBeLessThanOrEqual(5);
              }
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Skill Gap Detection Accuracy', () => {
    it('should detect exactly those skills where member < task', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          (skillMeta) => {
            return fc.pre(skillMeta.length > 0) && fc.property(
              fc.tuple(memberArb(skillMeta), taskArb(skillMeta)),
              ([member, task]) => {
                const gaps = calculateSkillGaps(member, task, skillMeta);
                
                // Count expected gaps
                const expectedGaps = skillMeta.filter(skill => {
                  const memberSkill = member.skills[skill.id] || 0;
                  const taskComplexity = task.complexity[skill.id] || 0;
                  return taskComplexity > 0 && memberSkill < taskComplexity;
                });
                
                expect(gaps.length).toBe(expectedGaps.length);
                
                // Check format
                gaps.forEach(gap => {
                  expect(gap).toMatch(/^⚠️.+/);
                });
              }
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Review Status Determination', () => {
    it('should correctly determine TỰ QUYẾT or CẦN REVIEW', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          fc.array(configRuleArb, { minLength: 1, maxLength: 5 }),
          (skillMeta, configRules) => {
            return fc.pre(skillMeta.length > 0 && configRules.length > 0) && fc.property(
              fc.tuple(memberArb(skillMeta), taskArb(skillMeta)),
              ([member, task]) => {
                const maxComplexity = calculateMaxComplexity(task);
                const status = calculateReviewStatus(member, maxComplexity, configRules);
                
                const rule = configRules.find(r => r.levelName === member.currentLevel);
                
                if (rule) {
                  if (maxComplexity <= rule.maxSPSelf) {
                    expect(status).toBe('TỰ QUYẾT');
                  } else {
                    expect(status).toBe('CẦN REVIEW');
                  }
                } else {
                  expect(status).toBe('CẦN REVIEW');
                }
              }
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Skill Sync Completeness', () => {
    it('should ensure all skills exist in all members after sync', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          (skillMeta) => {
            return fc.pre(skillMeta.length > 0) && fc.property(
              fc.array(memberArb(skillMeta), { minLength: 1, maxLength: 10 }),
              (members) => {
                const syncedMembers = syncSkills(members, skillMeta);
                
                syncedMembers.forEach(member => {
                  skillMeta.forEach(skill => {
                    expect(member.skills).toHaveProperty(skill.id);
                    expect(typeof member.skills[skill.id]).toBe('number');
                  });
                });
              }
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should add new skills with default value 0', () => {
      // Simple test without nested property
      const initialSkillMeta: SkillMeta[] = [
        {
          id: 'skill-1',
          name: 'Skill 1',
          shortName: 'S1',
          csvColumnName: 'Skill 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const newSkill: SkillMeta = {
        id: 'skill-2',
        name: 'Skill 2',
        shortName: 'S2',
        csvColumnName: 'Skill 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const allSkillMeta = [...initialSkillMeta, newSkill];

      fc.assert(
        fc.property(
          fc.array(memberArb(initialSkillMeta), { minLength: 1, maxLength: 5 }),
          (members) => {
            const syncedMembers = syncSkills(members, allSkillMeta);
            
            syncedMembers.forEach((member, idx) => {
              expect(member.skills[newSkill.id]).toBe(0);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 10: Suitability Score Calculation', () => {
    it('should calculate sum of (member - task) for all skills', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          (skillMeta) => {
            return fc.pre(skillMeta.length > 0) && fc.property(
              fc.tuple(memberArb(skillMeta), taskArb(skillMeta)),
              ([member, task]) => {
                const score = calculateSuitabilityScore(member, task, skillMeta);
                
                const expectedScore = skillMeta.reduce((sum, skill) => {
                  const memberSkill = member.skills[skill.id] || 0;
                  const taskComplexity = task.complexity[skill.id] || 0;
                  return sum + (memberSkill - taskComplexity);
                }, 0);
                
                expect(score).toBe(expectedScore);
              }
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow negative scores', () => {
      fc.assert(
        fc.property(
          fc.array(skillMetaArb, { minLength: 1, maxLength: 10 }),
          (skillMeta) => {
            return fc.pre(skillMeta.length > 0) && fc.property(
              memberArb(skillMeta),
              (member) => {
                // Create a task with all complexities at max
                const task: Task = {
                  id: 'test',
                  name: 'Test',
                  link: '',
                  finalSP: 10,
                  assignee: member.name,
                  complexity: Object.fromEntries(skillMeta.map(s => [s.id, 5])),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                // Set member skills to min
                const weakMember: Member = {
                  ...member,
                  skills: Object.fromEntries(skillMeta.map(s => [s.id, 0]))
                };
                
                const score = calculateSuitabilityScore(weakMember, task, skillMeta);
                expect(score).toBeLessThanOrEqual(0);
              }
            );
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
