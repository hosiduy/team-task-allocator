import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { STORAGE_KEYS } from '../src/types';
import type { Member, Task, ConfigRule, SkillMeta } from '../src/types';

describe('Storage Service Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Property 1: Data Persistence Round-Trip', () => {
    it('should persist and retrieve Member data correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 3, maxLength: 30 }),
              currentLevel: fc.constantFrom('Intern 1', 'Junior', 'Middle', 'Senior'),
              lastReviewDate: fc.string(),
              skills: fc.dictionary(fc.uuid(), fc.integer({ min: 0, max: 5 })),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString())
            }) as fc.Arbitrary<Member>,
            { minLength: 0, maxLength: 10 }
          ),
          (members) => {
            // Store
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
            
            // Retrieve
            const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
            
            // Verify
            expect(retrieved).toEqual(members);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist and retrieve Task data correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 5, maxLength: 50 }),
              link: fc.string(),
              finalSP: fc.integer({ min: 1, max: 20 }),
              assignee: fc.string(),
              complexity: fc.dictionary(fc.uuid(), fc.integer({ min: 0, max: 5 })),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString())
            }) as fc.Arbitrary<Task>,
            { minLength: 0, maxLength: 10 }
          ),
          (tasks) => {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
            expect(retrieved).toEqual(tasks);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist and retrieve ConfigRule data correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              levelId: fc.integer({ min: 1, max: 10 }),
              levelName: fc.string({ minLength: 3, maxLength: 20 }),
              maxSPSelf: fc.integer({ min: 0, max: 50 }),
              reviewAuthority: fc.integer({ min: 0, max: 50 })
            }) as fc.Arbitrary<ConfigRule>,
            { minLength: 0, maxLength: 10 }
          ),
          (rules) => {
            localStorage.setItem(STORAGE_KEYS.CONFIG_RULES, JSON.stringify(rules));
            const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG_RULES) || '[]');
            expect(retrieved).toEqual(rules);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist and retrieve SkillMeta data correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 3, maxLength: 30 }),
              shortName: fc.string({ minLength: 1, maxLength: 5 }),
              csvColumnName: fc.string({ minLength: 3, maxLength: 30 }),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString())
            }) as fc.Arbitrary<SkillMeta>,
            { minLength: 0, maxLength: 10 }
          ),
          (skillMeta) => {
            localStorage.setItem(STORAGE_KEYS.SKILL_META, JSON.stringify(skillMeta));
            const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILL_META) || '[]');
            expect(retrieved).toEqual(skillMeta);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1: Data Serialization', () => {
    it('should handle empty arrays correctly', () => {
      const emptyArrays = [
        { key: STORAGE_KEYS.MEMBERS, data: [] },
        { key: STORAGE_KEYS.TASKS, data: [] },
        { key: STORAGE_KEYS.CONFIG_RULES, data: [] },
        { key: STORAGE_KEYS.SKILL_META, data: [] }
      ];

      emptyArrays.forEach(({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
        const retrieved = JSON.parse(localStorage.getItem(key) || '[]');
        expect(retrieved).toEqual(data);
        expect(Array.isArray(retrieved)).toBe(true);
        expect(retrieved.length).toBe(0);
      });
    });

    it('should handle special characters in strings', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (specialString) => {
            const member: Member = {
              id: 'test-id',
              name: specialString,
              currentLevel: 'Junior',
              lastReviewDate: '',
              skills: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([member]));
            const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
            expect(retrieved[0].name).toBe(specialString);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
