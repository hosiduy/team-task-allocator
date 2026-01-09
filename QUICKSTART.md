# Quick Start Guide

## Testing the Application with Sample Data

The project includes sample CSV files from the BA Team that you can use to test the application immediately.

### Step 1: Start the Application

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:5173/`

### Step 2: Import Configuration Rules

1. Click on the **Dashboard** tab
2. Select **"Quy tắc"** (Rules) import type
3. Upload the file: `BA Team - config_rules.csv`
4. You should see a success message showing 5 rules imported

This will create the level hierarchy:
- Intern 1 (Max SP Self: 0, Review Authority: 0)
- Intern 2 (Max SP Self: 3, Review Authority: 3)
- Junior (Max SP Self: 6, Review Authority: 6)
- Middle (Max SP Self: 12, Review Authority: 12)
- Senior (Max SP Self: 50, Review Authority: 50)

### Step 3: Import Members

1. Select **"Thành viên"** (Members) import type
2. Upload the file: `BA Team - member_profile.csv`
3. The system will detect 9 skills from the CSV columns:
   - Requirement Elicitation
   - Tech Skill
   - Biz Skill
   - Doc Skill
   - Comm Skill
   - Critical Thinking: (Logic) Tư duy phản biện
   - Problem-Solving
   - UI/UX skill
   - Presentation skill
4. Click **"OK"** to add these skills to the system
5. You should see members imported successfully

### Step 4: Import Tasks

1. Select **"Công việc"** (Tasks) import type
2. Upload the file: `BA Team - task_allocation.csv`
3. The system will recognize the existing 9 skills and import tasks
4. Tasks will be imported with their complexity values

### Step 5: Explore the Application

#### View Members
1. Click on **"Thành viên"** (Members) tab
2. See all members with their skill levels (1-5)
3. Click on the eye icon to view a member's profile with radar chart
4. Click on any cell to edit inline (name, level, or skill values)

#### View Tasks
1. Click on **"Công việc"** (Tasks) tab
2. See all tasks with:
   - **Complexity columns** (editable, 1-5)
   - **Max Complexity** (computed, highest requirement)
   - **Lỗ hổng** (Skill gaps, e.g., "⚠️UI/UX")
   - **Điểm** (Suitability score)
   - **Trạng thái** (Status: "TỰ QUYẾT" or "CẦN REVIEW")
   - **Reviewer** (Suggested reviewer)
   - **Review Focus** (Skills to focus on)
   - **Hợp lệ** (Reviewer matching: "✅ Hợp lệ" or "—")
3. Click on assignee cell to change who's assigned
4. Watch computed columns update in real-time

#### Manage Configuration
1. Click on **"Cấu hình"** (Configuration) tab
2. **Level Rules Table**: Add, edit, or delete level rules
3. **Skill Manager**: 
   - View all skills with their short names
   - Add new skills (will be synced to all members/tasks with value 0)
   - Edit skill names
   - Delete skills (will be removed from all members/tasks)

### Step 6: Test Real-time Calculations

Try these scenarios to see the system in action:

#### Scenario 1: Assign a task to a junior member
1. Go to **Công việc** tab
2. Find a task with high complexity (e.g., Max = 4 or 5)
3. Click on the Assignee cell
4. Select a Junior member
5. Observe:
   - **Lỗ hổng** column shows skill gaps
   - **Trạng thái** shows "CẦN REVIEW" (since Junior can only self-manage up to 6 SP)
   - **Reviewer** suggests a Senior member
   - **Review Focus** shows which skills need attention

#### Scenario 2: Adjust task complexity
1. Click on any complexity cell
2. Change the value (1-5)
3. Press Enter
4. Watch all computed columns recalculate instantly

#### Scenario 3: Sync skills
1. Go to **Thành viên** tab
2. Click **"Sync Skills"** button
3. This ensures all members have values for all skills in the system

### Step 7: Export Data

1. Go to **Dashboard** tab
2. Click **"Export JSON"** to download all data as JSON backup
3. Click **"Export Members"** to download members as CSV
4. Click **"Export Tasks"** to download tasks with computed columns as CSV
5. Click **"Export Rules"** to download configuration rules as CSV

### Understanding the Color Coding

- **Amber** (⚠️): Warnings, skill gaps that need attention
- **Emerald** (✅): Valid states, self-manageable tasks
- **Rose**: Critical states, negative scores
- **Blue**: Information, links, focus areas
- **Purple**: Max complexity values

### Tips

1. **Data Persistence**: Your data is saved automatically to LocalStorage. Refresh the page (F5) and your data will still be there.

2. **Adding New Members/Tasks**: Use the "+ Thêm" buttons to add entries manually, or import more CSV files.

3. **Search and Filter**: In the Tasks view, use the search box to find specific tasks.

4. **Sorting**: Click on any column header to sort by that column.

5. **Pagination**: If you have > 50 tasks, use the pagination controls at the bottom.

6. **Keyboard Navigation**: 
   - Click a cell to edit
   - Press Enter to save
   - Press Escape to cancel
   - Use Tab to move between fields

### Troubleshooting

**Problem**: Import shows errors
- **Solution**: Check that CSV file matches the expected format. Required columns must be present.

**Problem**: Skills not showing
- **Solution**: Make sure you imported config rules first, then confirmed adding detected skills during member/task import.

**Problem**: Computed columns showing "—"
- **Solution**: Assign a member to the task. Computed columns need an assignee to calculate.

**Problem**: Data disappeared after browser close
- **Solution**: Check if browser's LocalStorage is enabled and not in private/incognito mode.

## Next Steps

- Explore the radar charts in member profiles to visualize skill strengths
- Try creating different task allocation scenarios
- Experiment with different level configurations
- Add your own team members and tasks!

## Sample Data Overview

The BA Team CSV files contain:
- **5 levels**: From Intern 1 to Senior
- **9 skills**: Covering requirement, technical, business, documentation, communication, critical thinking, problem-solving, UI/UX, and presentation skills
- **Multiple members**: With varying skill levels across all competencies
- **Various tasks**: With different complexity requirements

This provides a realistic starting point for understanding how the system works!
