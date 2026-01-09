# Implementation Plan: Team Task Allocator (TTA)

## Overview

This implementation plan builds the Team Task Allocator - a React SPA for skill-based task allocation. The plan follows the PRD's implementation steps while ensuring comprehensive testing.

### Key Design Principle: Dynamic Data

All data (skills, members, tasks, levels) is loaded via CSV import or added through the UI - nothing is hardcoded:
- **Skills**: Discovered automatically from CSV column headers or added via UI
- **Members**: Imported from CSV or added via UI
- **Tasks**: Imported from CSV or added via UI  
- **Levels/Config Rules**: Imported from CSV or added via UI

### Sample Data Reference (BA Team CSV files)

The BA Team CSV files serve as sample/reference data showing the expected format:
- **config_rules.csv**: Level ID, Level Name, Max SP Self, Review Authority
- **member_profile.csv**: Member Name, Current Level, Last Review Date, + skill columns
- **task_allocation.csv**: Task/Feature, Link, + complexity columns, Final SP, Assignee

## Tasks

- [ ] 1. Project Setup
  - [ ] 1.1 Initialize Vite + React + TypeScript project
    - Create new Vite project with React 19 and TypeScript
    - Configure TailwindCSS 4.1
    - Install dependencies: lucide-react, recharts, @tanstack/react-table, papaparse
    - Set up Vitest and fast-check for testing
    - _Requirements: 19.1, 19.2_

  - [ ] 1.2 Create TypeScript type definitions
    - Define SkillMeta interface (id, name, shortName, csvColumnName)
    - Define Member interface with dynamic skills: Record<string, number>
    - Define Task interface with dynamic complexity: Record<string, number>
    - Define ConfigRule interface (levelId, levelName, maxSPSelf, reviewAuthority)
    - Define ComputedTaskData interface (maxComplexity, skillGaps, suitabilityScore, status, reviewer, reviewFocus, reviewerMatching)
    - Define STORAGE_KEYS constants
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Core Storage Service
  - [ ] 2.1 Implement StorageContext and StorageService
    - Create StorageContext with React Context + useReducer
    - Implement CRUD operations for Members, Tasks, ConfigRules, SkillMeta
    - Implement JSON serialization/deserialization to LocalStorage
    - Implement bulk import operations
    - Implement exportAll and exportToCSV functions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 16.1, 16.2, 16.3_

  - [ ] 2.2 Write property test for data persistence round-trip
    - **Property 1: Data Persistence Round-Trip**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [ ] 3. Checkpoint - Storage Foundation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. CSV Import Service
  - [ ] 4.1 Implement CSV parsing with Papaparse
    - Create parseConfigRules function for config_rules.csv (columns: Level ID, Level Name, Max SP Self, Review Authority)
    - Create parseMemberProfiles function for member_profile.csv with dynamic skill discovery
      - Fixed columns: Member Name, Current Level, Last Review Date
      - All other columns treated as skill columns
    - Create parseTaskAllocation function for task_allocation.csv with dynamic complexity discovery
      - Fixed columns: Task/Feature, Link, Final SP, Assignee
      - Computed columns to ignore: Max Complexity, Skill gap check, Suitability Score, Status, Reviewer, Review Focus, Reviewer matching
      - All other columns treated as complexity/skill columns
    - Implement detectNewSkills function to find skills in CSV not in SkillMeta
    - Implement auto-generate shortName from skill name (first word or abbreviation)
    - Handle date format "Month DD, YYYY" (e.g., "December 12, 2025") or empty
    - Add validation: skill/complexity values must be 1-5
    - Add error reporting with row number and column name
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 4.2 Write property test for CSV config rules parsing
    - **Property 2: CSV Config Rules Parsing**
    - Test parsing of Level ID, Level Name, Max SP Self, Review Authority columns
    - Validate levelId is number, maxSPSelf and reviewAuthority are non-negative
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [ ] 4.3 Write property test for CSV member parsing
    - **Property 3: CSV Member Parsing with Dynamic Skills**
    - Test parsing of Member Name, Current Level, Last Review Date
    - Test dynamic skill column discovery
    - Test skill values 1-5
    - Test date format handling
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ] 4.4 Write property test for CSV task parsing
    - **Property 4: CSV Task Parsing with Dynamic Complexity**
    - Test parsing of Task/Feature, Link, Final SP, Assignee
    - Test dynamic complexity column discovery
    - Test that computed columns are ignored
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 5. Calculation Service
  - [ ] 5.1 Implement core calculation functions
    - Create calculateMaxComplexity: MAX of all complexity values (dynamic skill set)
    - Create calculateSkillGaps: compare member skills vs task complexity for all skills in SkillMeta, return format "⚠️[shortName]"
    - Create calculateReviewStatus: compare maxComplexity vs member's maxSPSelf from config rules, return "TỰ QUYẾT" or "CẦN REVIEW"
    - Create suggestReviewers: find members with reviewAuthority >= maxComplexity, prioritize by gap skills, return { reviewer, reviewFocus, reviewerMatching }
    - Create calculateSuitabilityScore: sum of (member skill - task complexity) for all skills (can be negative)
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3_

  - [ ] 5.2 Implement skill sync function
    - Create syncSkills function to ensure all skills in SkillMeta exist in all members
    - Add missing skills to members with default value 0
    - When new skill discovered from CSV, add to SkillMeta and sync to all members
    - _Requirements: 8.2, 8.3, 8.4_

  - [ ] 5.3 Write property test for max complexity calculation
    - **Property 5: Max Complexity Calculation**
    - Test MAX of all complexity values (dynamic skill set)
    - **Validates: Requirements 10.1, 10.2**

  - [ ] 5.4 Write property test for skill gap detection
    - **Property 6: Skill Gap Detection Accuracy**
    - Test that gaps contain exactly skills where member < task (dynamic skills)
    - Test format: "⚠️[shortName]"
    - Test multiple gaps comma-separated
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

  - [ ] 5.5 Write property test for review status determination
    - **Property 7: Review Status Determination**
    - Test lookup of maxSPSelf from ConfigRule by levelName
    - Test "TỰ QUYẾT" when maxComplexity <= maxSPSelf
    - Test "CẦN REVIEW" when maxComplexity > maxSPSelf
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5**

  - [ ] 5.6 Write property test for reviewer suggestion validity
    - **Property 8: Reviewer Suggestion Validity**
    - Test reviewers have reviewAuthority >= maxComplexity
    - Test prioritization by gap skills
    - Test reviewFocus format: "Focus: [shortName1], [shortName2]"
    - Test reviewerMatching: "✅ Hợp lệ" or "—"
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**

  - [ ] 5.7 Write property test for skill sync completeness
    - **Property 9: Skill Sync Completeness**
    - Test all skills in SkillMeta exist in all members after sync
    - Test new skills have default value 0
    - **Validates: Requirements 8.2, 8.3, 8.4**

  - [ ] 5.8 Write property test for suitability score calculation
    - **Property 10: Suitability Score Calculation**
    - Test sum of (member - task) for all skills in SkillMeta
    - Test score can be negative
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [ ] 6. Checkpoint - Services Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Common UI Components
  - [ ] 7.1 Create reusable UI components with TailwindCSS 4.1
    - Build Button, Input, Modal components
    - Build FileDropzone component for drag-drop upload
    - Build StatusBadge component with amber/emerald/rose colors
    - Ensure accessibility compliance
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 8. Dashboard & Import UI
  - [ ] 8.1 Implement Dashboard page
    - Create main dashboard layout
    - Display stats overview (member count, task count)
    - _Requirements: 5.1, 5.4_

  - [ ] 8.2 Implement ImportSection component
    - Create drag-drop zone for CSV files
    - Add separate import buttons for Members, Rules, Tasks
    - Display import status and errors
    - Handle new skill detection and prompt user
    - _Requirements: 5.1, 5.2, 5.3, 4.4_

- [ ] 9. Member Management UI
  - [ ] 9.1 Implement MemberTable with inline editing
    - Display all members in table format using TanStack Table
    - Show columns: Member Name, Current Level, Last Review Date, + dynamic skill columns from SkillMeta
    - Enable inline editing of Name, Level, Skill scores (1-5)
    - Save changes immediately on edit
    - Support sorting by any column
    - Handle dynamic column rendering based on SkillMeta
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.2 Implement MemberProfile with Radar Chart
    - Create modal/page for member detail view
    - Display general info (Name, Level, Last Review Date)
    - Implement Radar Chart using Recharts for dynamic skills visualization
    - Show skill shortNames on axes (from SkillMeta)
    - Display values 1-5 on radial axis
    - Handle variable number of skills (radar chart adapts to SkillMeta)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 9.3 Implement SyncSkillsButton
    - Add "Sync Skills" button to member management
    - Call syncSkills function and update all members with missing skills (default 0)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 9.4 Write property test for member CRUD consistency
    - **Property 11: Member CRUD Consistency**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 10. Task Management UI - Data Grid
  - [ ] 10.1 Implement TaskGrid with TanStack Table
    - Display tasks in Excel-like data grid
    - Show columns: Task/Feature, Link, dynamic complexity columns from SkillMeta, Final SP, Assignee
    - Show computed columns: Max Complexity, Skill gap check, Suitability Score, Status, Reviewer, Review Focus, Reviewer matching
    - Implement sticky header and row hover effects
    - Handle dynamic column rendering based on SkillMeta
    - _Requirements: 9.1, 9.2, 19.6, 19.7_

  - [ ] 10.2 Implement inline editing for TaskGrid
    - Enable editing of dynamic Complexity values (1-5)
    - Enable Assignee selection dropdown (list of member names)
    - Trigger real-time recalculation on changes
    - Show clear cell editing states
    - _Requirements: 9.3, 10.2, 11.5, 12.4, 13.7, 19.8_

  - [ ] 10.3 Implement computed columns display
    - Create SkillGapCell component showing "⚠️[shortName]" warnings (dynamic from SkillMeta)
    - Create ReviewStatusCell showing "TỰ QUYẾT" or "CẦN REVIEW"
    - Create ReviewerSuggestionCell showing reviewer name, Review Focus, Reviewer matching
    - Use amber colors (text-amber-600, bg-amber-50) for warnings
    - Use emerald colors (text-emerald-600, bg-emerald-50) for valid states (✅ Hợp lệ)
    - _Requirements: 10.3, 11.2, 11.4, 12.2, 12.3, 13.3, 13.4, 13.5, 19.3, 19.4_

  - [ ] 10.4 Implement TaskFilters
    - Add Filter/Search by Assignee, Task/Feature name, Link
    - Add Sort by Max Complexity, Final SP, Assignee
    - Implement pagination for > 50 rows
    - _Requirements: 9.4, 9.5, 9.6_

  - [ ] 10.5 Write property test for task CRUD consistency
    - **Property 12: Task CRUD Consistency**
    - **Validates: Requirements 9.2, 9.3**

  - [ ] 10.6 Write property test for real-time recalculation
    - **Property 13: Real-time Recalculation**
    - Test recalculation of maxComplexity, skillGaps, suitabilityScore, status, reviewer, reviewFocus, reviewerMatching
    - **Validates: Requirements 10.2, 11.5, 12.4, 13.7, 14.3**

- [ ] 11. Checkpoint - Member and Task UI Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Configuration Management UI
  - [ ] 12.1 Implement ConfigPanel
    - Create configuration page/modal
    - _Requirements: 15.1_

  - [ ] 12.2 Implement LevelRulesTable
    - Display level rules in editable table (Level ID, Level Name, Max SP Self, Review Authority)
    - Allow add/edit/delete of Level rules via UI
    - No default levels - must be imported from CSV or added via UI
    - Configure Max SP Self and Review Authority per level
    - _Requirements: 15.1, 15.2_

  - [ ] 12.3 Implement SkillManager
    - Display list of skills from SkillMeta (dynamic)
    - Allow adding new skill types via UI (name, shortName)
    - Allow renaming existing skills (name, shortName)
    - Allow deleting skills (with confirmation - affects all members/tasks)
    - Apply changes immediately and recalculate all computed fields
    - Sync new skills to all existing members with default value 0
    - _Requirements: 15.3, 15.4, 15.5_

- [ ] 13. Data Export
  - [ ] 13.1 Implement Export functionality
    - Add "Export Data" button to dashboard
    - Generate JSON export with all data (Members, Tasks, ConfigRules, SkillMeta)
    - Generate CSV export option with computed columns (Max Complexity, Skill gap check, Suitability Score, Status, Reviewer, Review Focus, Reviewer matching)
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 13.2 Write property test for export completeness
    - **Property 14: Export Data Completeness**
    - Test JSON export contains all data
    - Test CSV export includes computed columns
    - **Validates: Requirements 16.2, 16.3, 16.4**

- [ ] 14. Performance Optimization
  - [ ] 14.1 Optimize calculation performance
    - Implement memoization for expensive calculations
    - Use useMemo/useCallback appropriately
    - Ensure recalculation completes within 200ms for 500 tasks
    - _Requirements: 17.1, 17.2_

  - [ ] 14.2 Write property test for calculation performance
    - **Property 15: Performance - Calculation Time**
    - **Validates: Requirements 17.1**

- [ ] 15. Keyboard Navigation
  - [ ] 15.1 Implement Excel-like keyboard navigation
    - Add Arrow key navigation between cells
    - Add Enter key to confirm edits
    - Add Tab key to move between editable cells
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 16. App Layout and Routing
  - [ ] 16.1 Create main App layout
    - Implement responsive navigation
    - Create page routing (Dashboard, Members, Tasks, Config)
    - Wire all components together
    - Apply modern, clean theme with TailwindCSS
    - _Requirements: 19.1, 19.2_

- [ ] 17. Final Checkpoint - All Features Complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Technology stack: React 19, TailwindCSS 4.1, Recharts, TanStack Table, Papaparse, Vitest, fast-check

### Key Design Principle: Dynamic Data (No Hardcoding)

- **Skills**: Discovered from CSV column headers or added via UI - stored in TTA_SKILL_META
- **Members**: Imported from CSV or added via UI - stored in TTA_MEMBERS
- **Tasks**: Imported from CSV or added via UI - stored in TTA_TASKS
- **Levels**: Imported from CSV or added via UI - stored in TTA_CONFIG_RULES
- **No default data**: System starts empty, all data must be imported or added

### CSV Column Discovery

- **member_profile.csv**: Fixed columns (Member Name, Current Level, Last Review Date) + any other columns = skill columns
- **task_allocation.csv**: Fixed columns (Task/Feature, Link, Final SP, Assignee) + computed columns (ignored) + any other columns = complexity columns
- **config_rules.csv**: Fixed columns (Level ID, Level Name, Max SP Self, Review Authority)

### Computed Columns (calculated real-time, not stored)

- Max Complexity: MAX of all complexity values
- Skill gap check: "⚠️[shortName1], ⚠️[shortName2]" format
- Suitability Score: sum of (member - task) for all skills
- Status: "TỰ QUYẾT" or "CẦN REVIEW"
- Reviewer: suggested reviewer name
- Review Focus: "Focus: [shortName1], [shortName2]" format
- Reviewer matching: "✅ Hợp lệ" or "—"
