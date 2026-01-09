# Requirements Document

## Introduction

Team Task Allocator (TTA) là một ứng dụng web Single Page Application (SPA) giúp Leader/Manager phân bổ công việc cho các thành viên trong team dựa trên năng lực (Skill) và độ phức tạp của công việc (Complexity). Hệ thống tự động tính toán độ phù hợp, phát hiện lỗ hổng kỹ năng (Skill Gap) và đề xuất người review.

## Glossary

- **TTA**: Team Task Allocator - hệ thống chính
- **Member**: Thành viên trong team với bộ kỹ năng (skills)
- **Task**: Công việc cần phân bổ với độ phức tạp (complexity)
- **Skill**: Kỹ năng của member - giá trị 1-5
- **Complexity**: Độ phức tạp của task theo từng skill - giá trị 1-5
- **Skill_Gap**: Lỗ hổng kỹ năng khi Member Skill < Task Complexity
- **Max_SP_Self**: Số điểm tối đa mà member được tự quyết định theo level
- **Review_Authority**: Quyền review của member theo level
- **Final_SP**: Story Point cuối cùng của task
- **Max_Complexity**: Độ khó cao nhất trong các complexity của task
- **CSV_Importer**: Component import dữ liệu từ file CSV
- **LocalStorage**: Browser storage để lưu trữ dữ liệu

### Dynamic Data (No Hardcoding)

- **Skills**: Created via UI or imported from CSV - no default skills
- **Levels**: Created via UI or imported from CSV - no default levels
- **Members**: Created via UI or imported from CSV
- **Tasks**: Created via UI or imported from CSV

## Requirements

### Requirement 1: Data Storage Schema

**User Story:** As a user, I want my data to be stored locally in the browser, so that I can use the application without a backend server.

#### Acceptance Criteria

1. THE TTA SHALL store member data in LocalStorage with key TTA_MEMBERS
2. THE TTA SHALL store task data in LocalStorage with key TTA_TASKS
3. THE TTA SHALL store configuration rules in LocalStorage with key TTA_CONFIG_RULES
4. THE TTA SHALL store skill metadata in LocalStorage with key TTA_SKILL_META
5. WHEN the application loads, THE TTA SHALL retrieve all saved data from LocalStorage
6. WHEN data is modified, THE TTA SHALL persist changes to LocalStorage immediately
7. WHEN user refreshes the page (F5), THE TTA SHALL retain all data without loss

### Requirement 2: CSV Import - Config Rules

**User Story:** As a Leader/Manager, I want to import configuration rules from CSV, so that I can define level permissions and review authority.

#### Acceptance Criteria

1. WHEN a user uploads a config rules CSV file, THE CSV_Importer SHALL parse columns: "Level ID", "Level Name", "Max SP Self", "Review Authority"
2. WHEN parsing is successful, THE CSV_Importer SHALL store rules in TTA_CONFIG_RULES
3. IF the CSV file is malformed, THEN THE CSV_Importer SHALL display a descriptive error message
4. THE CSV_Importer SHALL validate that Level ID is numeric and Max SP Self/Review Authority are non-negative numbers

### Requirement 3: CSV Import - Member Profiles

**User Story:** As a Leader/Manager, I want to import member profiles from CSV, so that I can quickly set up team member data with their skills.

#### Acceptance Criteria

1. WHEN a user uploads a member profile CSV file, THE CSV_Importer SHALL parse fixed columns: "Member Name", "Current Level", "Last Review Date"
2. THE CSV_Importer SHALL treat all other columns as skill columns (dynamic skill discovery)
3. THE CSV_Importer SHALL accept skill values from 1 to 5
4. THE CSV_Importer SHALL handle date format "Month DD, YYYY" or empty values
5. WHEN parsing is successful, THE CSV_Importer SHALL store members in TTA_MEMBERS
6. WHEN new skill columns are discovered, THE CSV_Importer SHALL add them to TTA_SKILL_META
7. IF the CSV file contains invalid skill values (not 1-5), THEN THE CSV_Importer SHALL display validation errors

### Requirement 4: CSV Import - Task Allocation

**User Story:** As a Leader/Manager, I want to import tasks from CSV, so that I can load backlog data for allocation.

#### Acceptance Criteria

1. WHEN a user uploads a task allocation CSV file, THE CSV_Importer SHALL parse fixed columns: "Task/Feature", "Link", "Final SP", "Assignee"
2. THE CSV_Importer SHALL ignore computed columns: "Max Complexity", "Skill gap check", "Suitability Score", "Status", "Reviewer", "Review Focus", "Reviewer matching"
3. THE CSV_Importer SHALL treat all other columns as complexity/skill columns (dynamic discovery)
4. THE CSV_Importer SHALL accept complexity values from 1 to 5
5. WHEN parsing is successful, THE CSV_Importer SHALL store tasks in TTA_TASKS
6. WHEN new skill columns are discovered, THE CSV_Importer SHALL add them to TTA_SKILL_META and sync to existing members with default value 0

### Requirement 5: Dashboard & Import Interface

**User Story:** As a user, I want a dashboard with drag-drop file upload, so that I can easily import different types of data.

#### Acceptance Criteria

1. THE Dashboard SHALL display a drag-drop zone for CSV file upload
2. THE Dashboard SHALL provide separate import options for Members, Rules, and Tasks
3. WHEN a file is dropped or selected, THE TTA SHALL automatically detect file type and parse accordingly
4. THE Dashboard SHALL display import status and any errors
5. THE Dashboard SHALL display current data counts (members, tasks, rules)

### Requirement 6: Member Management - List View

**User Story:** As a Leader/Manager, I want to view and manage team members in a table, so that I can see and edit their information.

#### Acceptance Criteria

1. THE TTA SHALL display all members in a table format with columns: Member Name, Current Level, Last Review Date, and dynamic skill columns from TTA_SKILL_META
2. THE TTA SHALL support inline editing of Member Name, Level, and Skill scores directly in the table row
3. WHEN a user edits a cell, THE TTA SHALL save changes immediately to LocalStorage
4. THE TTA SHALL display skill values with visual indicators (1-5 scale)
5. THE TTA SHALL allow sorting by any column
6. THE TTA SHALL allow adding new members via UI

### Requirement 7: Member Management - Profile Detail

**User Story:** As a Leader/Manager, I want to view detailed member profiles with skill visualization, so that I can understand their strengths and weaknesses.

#### Acceptance Criteria

1. WHEN a user clicks on a member, THE TTA SHALL display a detail modal/page
2. THE TTA SHALL display member general information (Name, Level, Last Review Date)
3. THE TTA SHALL display a Radar Chart (Spider Chart) visualizing all skills from TTA_SKILL_META
4. THE Radar Chart SHALL show skill short names on axes (from TTA_SKILL_META)
5. THE Radar Chart SHALL display values from 1-5 on the radial axis
6. THE Radar Chart SHALL adapt to the number of skills in TTA_SKILL_META

### Requirement 8: Member Management - Skill Sync

**User Story:** As a Leader/Manager, I want to synchronize skills between members and tasks, so that all skill columns are consistent.

#### Acceptance Criteria

1. THE TTA SHALL provide a "Sync Skills" button
2. WHEN user clicks Sync Skills, THE TTA SHALL scan all tasks for skill/complexity columns
3. THE TTA SHALL add any missing skill columns to member profiles with default value 0
4. THE TTA SHALL ensure member skill list matches task complexity criteria

### Requirement 9: Task Management - Data Grid

**User Story:** As a Leader/Manager, I want to view tasks in an Excel-like data grid, so that I can efficiently manage task allocation.

#### Acceptance Criteria

1. THE TTA SHALL display tasks in a data grid with columns: Task/Feature, Link, dynamic complexity columns from TTA_SKILL_META, Final SP, Assignee
2. THE TTA SHALL display computed columns: Max Complexity, Skill gap check, Suitability Score, Status, Reviewer, Review Focus, Reviewer matching
3. THE TTA SHALL support inline editing of Complexity values and Assignee
4. THE TTA SHALL provide Filter/Search by Assignee, Task/Feature name, Link
5. THE TTA SHALL provide Sort by Max Complexity, Final SP, Assignee
6. THE TTA SHALL paginate results when data exceeds 50 rows
7. THE TTA SHALL allow adding new tasks via UI

### Requirement 10: Task Allocation - Max Complexity Calculation

**User Story:** As a Leader/Manager, I want to see the maximum complexity of each task, so that I can understand task difficulty at a glance.

#### Acceptance Criteria

1. THE TTA SHALL calculate Max Complexity as MAX of all complexity values for each task (dynamic based on TTA_SKILL_META)
2. WHEN any complexity value changes, THE TTA SHALL recalculate Max Complexity in real-time
3. THE TTA SHALL display Max Complexity in a dedicated column

### Requirement 11: Task Allocation - Skill Gap Detection

**User Story:** As a Leader/Manager, I want to see skill gap warnings, so that I can identify when an assignee lacks required skills.

#### Acceptance Criteria

1. THE TTA SHALL compare Assignee's skill scores with Task's complexity scores for each skill in TTA_SKILL_META
2. WHEN Member Skill < Task Complexity for any skill, THE TTA SHALL display warning format: "⚠️[Skill Short Name]"
3. WHEN multiple gaps exist, THE TTA SHALL display all gaps comma-separated
4. WHEN no gaps exist, THE TTA SHALL display empty or no warning
5. WHEN Assignee or Complexity changes, THE TTA SHALL recalculate Skill Gap in real-time

### Requirement 12: Task Allocation - Review Status

**User Story:** As a Leader/Manager, I want to see if a task needs review based on member level, so that I can ensure proper oversight.

#### Acceptance Criteria

1. THE TTA SHALL compare Task's Max Complexity with Assignee's Max SP Self from config rules
2. WHEN Max Complexity <= Max SP Self, THE TTA SHALL display status "TỰ QUYẾT"
3. WHEN Max Complexity > Max SP Self, THE TTA SHALL display status "CẦN REVIEW"
4. WHEN Assignee or Complexity changes, THE TTA SHALL recalculate Status in real-time
5. THE TTA SHALL use Assignee's Current Level to lookup Max SP Self from config rules

### Requirement 13: Task Allocation - Reviewer Suggestion

**User Story:** As a Leader/Manager, I want reviewer suggestions for tasks needing review, so that I can quickly assign appropriate reviewers.

#### Acceptance Criteria

1. WHEN Status is "CẦN REVIEW", THE TTA SHALL find members with Review Authority >= Task's Max Complexity
2. THE TTA SHALL prioritize reviewers who have high skills in areas where Assignee has gaps
3. THE TTA SHALL display suggested reviewer name in "Reviewer" column
4. THE TTA SHALL display "Review Focus" showing which skills the reviewer should focus on (e.g., "Focus: Tech, UI/UX")
5. THE TTA SHALL display "Reviewer matching" as "✅ Hợp lệ" when a valid reviewer is found
6. WHEN Status is "TỰ QUYẾT", THE TTA SHALL display empty Reviewer, empty Review Focus, and "—" for Reviewer matching
7. WHEN Assignee or Complexity changes, THE TTA SHALL recalculate Reviewer Suggestion in real-time

### Requirement 14: Task Allocation - Suitability Score

**User Story:** As a Leader/Manager, I want to see suitability scores, so that I can identify how well an assignee matches a task.

#### Acceptance Criteria

1. THE TTA SHALL calculate suitability score based on skill match between member and task complexity
2. THE TTA SHALL display suitability score as a number (can be negative if many gaps)
3. THE TTA SHALL recalculate suitability score when Assignee or Complexity changes

### Requirement 15: Configuration Management

**User Story:** As a Leader/Manager, I want to manage configuration rules and skills, so that I can customize the system for my team.

#### Acceptance Criteria

1. THE TTA SHALL allow adding, editing, and deleting Level rules
2. THE TTA SHALL allow configuring Max SP Self and Review Authority per level
3. THE TTA SHALL allow adding new skill types to the system
4. THE TTA SHALL allow renaming existing skills
5. WHEN configuration changes, THE TTA SHALL apply changes immediately and recalculate all computed fields

### Requirement 16: Data Export

**User Story:** As a user, I want to export data for backup, so that I can preserve my work.

#### Acceptance Criteria

1. THE TTA SHALL provide an "Export Data" button
2. WHEN user clicks Export, THE TTA SHALL generate JSON or CSV file with all data
3. THE TTA SHALL include Members, Tasks, Config Rules, and Skill Meta in export
4. THE CSV export SHALL include computed columns (Max Complexity, Skill gap check, Status, Reviewer, etc.)

### Requirement 17: Performance

**User Story:** As a user, I want fast response times, so that I can work efficiently with large datasets.

#### Acceptance Criteria

1. WHEN editing inline with 500 tasks, THE TTA SHALL recalculate all computed columns within 200ms
2. THE TTA SHALL not block UI during calculations

### Requirement 18: Usability - Keyboard Navigation

**User Story:** As a user, I want Excel-like keyboard navigation, so that I can work efficiently in the data grid.

#### Acceptance Criteria

1. THE TTA SHALL support Arrow key navigation between cells in the task grid
2. THE TTA SHALL support Enter key to confirm edits
3. THE TTA SHALL support Tab key to move between editable cells

### Requirement 19: User Interface

**User Story:** As a user, I want a modern, clean interface, so that I can work comfortably.

#### Acceptance Criteria

1. THE TTA SHALL use TailwindCSS 4.1 for styling
2. THE TTA SHALL use Lucide-react or Phosphor-icons for icons
3. THE TTA SHALL use amber colors (text-amber-600, bg-amber-50) for warnings/gaps (⚠️)
4. THE TTA SHALL use emerald colors (text-emerald-600, bg-emerald-50) for valid/safe states (✅)
5. THE TTA SHALL use rose colors (text-rose-600) for critical states
6. THE TTA SHALL implement sticky table headers
7. THE TTA SHALL implement row hover effects
8. THE TTA SHALL show clear cell editing states
