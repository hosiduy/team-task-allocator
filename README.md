# Team Task Allocator (TTA)

A React-based web application for skill-based task allocation, helping team leaders/managers assign tasks to team members based on their skills and task complexity.

## Features

### Core Functionality
- **Dynamic Skill Management**: All skills are discovered from CSV imports or added via UI - no hardcoded skills
- **CSV Import/Export**: Import members, tasks, and configuration rules from CSV files
- **Skill-Based Task Allocation**: Automatically calculate task suitability based on member skills
- **Real-time Calculations**: Instant recalculation of:
  - Max Complexity (highest complexity requirement)
  - Skill Gaps (skills where member < task requirement)
  - Suitability Score (overall skill match)
  - Review Status (whether task needs review based on level)
  - Reviewer Suggestions (recommend appropriate reviewers)

### User Interface
- **Dashboard**: Overview with import functionality and data statistics
- **Member Management**: 
  - Table view with inline editing
  - Skill radar chart visualization
  - Profile details modal
- **Task Management**:
  - Excel-like data grid
  - Inline editing for complexity and assignee
  - Real-time computed columns
  - Search and filter capabilities
  - Pagination for large datasets
- **Configuration Panel**:
  - Level rules management (Max SP Self, Review Authority)
  - Skill metadata management (add, edit, delete skills)

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS 4.1
- **Icons**: Lucide React
- **Charts**: Recharts (Radar Chart for skill visualization)
- **Data Grid**: TanStack Table
- **CSV Parsing**: Papaparse
- **Build Tool**: Vite
- **Testing**: Vitest + fast-check (property-based testing)
- **Storage**: LocalStorage (browser-based, no backend required)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The application will be available at `http://localhost:5173/`

## CSV File Format

### config_rules.csv
```csv
Level ID,Level Name,Max SP Self,Review Authority
1,Intern 1,0,0
2,Intern 2,3,3
3,Junior,6,6
4,Middle,12,12
5,Senior,50,50
```

### member_profile.csv
```csv
Member Name,Current Level,Last Review Date,Requirement Elicitation,Tech Skill,Biz Skill,Doc Skill,Comm Skill,Critical Thinking,Problem-Solving,UI/UX skill,Presentation skill
John Doe,Senior,December 12, 2025,5,5,4,4,5,5,4,3,4
Jane Smith,Middle,,4,4,4,3,4,4,4,2,3
```

**Note**: Any additional columns beyond the fixed columns (Member Name, Current Level, Last Review Date) will be treated as skill columns.

### task_allocation.csv
```csv
Task/Feature,Link,Requirement Elicitation,Tech Skill,Biz Skill,Doc Skill,Comm Skill,Critical Thinking,Problem-Solving,UI/UX skill,Presentation skill,Final SP,Assignee
Implement login feature,XCOR-001,3,4,3,3,3,4,4,3,2,5,John Doe
Create dashboard UI,XCOR-002,2,3,2,2,2,3,2,5,3,8,Jane Smith
```

**Note**: Complexity columns should match skill columns from member_profile.csv. Computed columns (Max Complexity, Skill gap check, Status, Reviewer, etc.) are ignored during import.

## Key Concepts

### Dynamic Skill Discovery
The system automatically discovers skills from CSV imports:
- Any column in member_profile.csv (excluding Member Name, Current Level, Last Review Date) is treated as a skill
- Any column in task_allocation.csv (excluding Task/Feature, Link, Final SP, Assignee, and computed columns) is treated as a complexity/skill requirement
- When new skills are detected, the system prompts to add them and syncs existing data

### Computed Columns
These values are calculated in real-time and not stored:

1. **Max Complexity**: Maximum value across all complexity scores for a task
2. **Skill Gap Check**: List of skills where member skill < task complexity (format: "⚠️Skill1, ⚠️Skill2")
3. **Suitability Score**: Sum of (member skill - task complexity) for all skills (can be negative)
4. **Status**: 
   - "TỰ QUYẾT" if maxComplexity <= member's maxSPSelf
   - "CẦN REVIEW" if maxComplexity > member's maxSPSelf
5. **Reviewer**: Suggested reviewer name (members with reviewAuthority >= maxComplexity)
6. **Review Focus**: Skills that need review focus (e.g., "Focus: Tech, UI/UX")
7. **Reviewer Matching**: "✅ Hợp lệ" if valid reviewer found, "—" otherwise

### Level Permissions
Each level has two key attributes:
- **Max SP Self**: Maximum complexity a member can self-manage without review
- **Review Authority**: Maximum complexity a member can review for others

## Data Persistence

All data is stored in browser LocalStorage with these keys:
- `TTA_MEMBERS`: Member profiles and skills
- `TTA_TASKS`: Task details and complexity
- `TTA_CONFIG_RULES`: Level configuration rules
- `TTA_SKILL_META`: Skill definitions and metadata

Data persists across browser sessions. Use the Export functions to backup your data.

## Testing

The project includes property-based tests using fast-check to validate:
- Data persistence round-trip
- Max complexity calculation correctness
- Skill gap detection accuracy
- Review status determination logic
- Skill synchronization completeness
- Suitability score calculation

Run tests with: `npm test`

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── dashboard/       # Dashboard and import functionality
│   ├── members/         # Member management
│   ├── tasks/           # Task management
│   └── config/          # Configuration management
├── context/
│   └── StorageContext.tsx  # Global state management
├── services/
│   ├── storageService.ts   # (via context)
│   ├── csvService.ts       # CSV import/export
│   └── calculationService.ts  # Core calculations
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # App entry point

tests/
├── calculationService.test.ts  # Property-based tests
└── storageService.test.ts      # Storage tests
```

## Requirements Traceability

This implementation fulfills all requirements from the PRD:
- ✅ Dynamic skill discovery and management
- ✅ CSV import/export for all data types
- ✅ Real-time calculation of all computed fields
- ✅ Inline editing with immediate persistence
- ✅ Skill gap detection and reviewer suggestions
- ✅ Performance: <200ms recalculation for 500 tasks (via memoization)
- ✅ Responsive UI with TailwindCSS 4.1
- ✅ LocalStorage persistence (F5-safe)
- ✅ Property-based testing for correctness

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

LocalStorage must be enabled.

## License

MIT

## Contributing

This is an internal tool. For questions or issues, contact the development team.
