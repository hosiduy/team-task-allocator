# **Functional Requirements Document (FRD)**

## **Project: Team Task Allocator (TTA) \- UX/UI & Feature Enhancements**

Version: 2.0  
Date: 2026-01-09  
Status: Approved

## **1\. Introduction**

### **1.1 Purpose**

The purpose of this document is to define the functional requirements for "Phase 2" of the Team Task Allocator project. This phase focuses on improving user experience (UX) by enhancing data grid interactivity (sorting, filtering, ordering), replacing basic browser alerts with proper UI modals, and improving navigation flow.

### **1.2 Scope**

Changes apply to:

* **Global Components:** Table architecture (TanStack Table configurations).  
* **Dashboard:** Interactivity of metric cards.  
* **Member Management:** Create and Edit workflows.  
* **Task Management:** Create and Edit workflows.

## **2\. Assumptions & Dependencies**

* The project continues to use **React 19**, **TailwindCSS 4.1**, and **TanStack Table**.  
* Data persistence remains in **LocalStorage**.  
* **TanStack Table** features (Sorting, Ordering, Visibility, Filtering) will be leveraged rather than building custom logic from scratch.

## **3\. Detailed Functional Requirements**

### **3.1. General Table Enhancements**

*Applies to both MemberTable and TaskGrid.*

#### **FR-01: Column Sorting**

* **Requirement:** All columns in data tables must be sortable.  
* **Behavior:**  
  * Clicking a column header toggles the state: Ascending ➔ Descending ➔ Off (Default).  
  * Visual indicators (arrows) must show the current sort direction next to the header text.  
  * **Logic:**  
    * Text columns (Name, Link): Alphabetical sort.  
    * Number columns (Skills, Complexity, SP): Numerical sort.  
    * Status columns: Sort by predefined logical order (e.g., TỰ QUYẾT \< CẦN REVIEW) or alphabetical.

#### **FR-02: Column Visibility (Show/Hide)**

* **Requirement:** Users must be able to toggle the visibility of any column.  
* **UI Implementation:**  
  * A "View Columns" dropdown button located above the table (top-right).  
  * The dropdown contains checkboxes for all available columns.  
  * Unchecking a box hides the column immediately.  
  * **Constraint:** The "Actions" column (Delete/Edit buttons) cannot be hidden.

#### **FR-03: Advanced Filtering**

* **Requirement:** Users must be able to filter data within the tables.  
* **UI Implementation:**  
  * A generic "Filter" button toggles a filter row beneath the header row.  
  * **Logic per Column Type:**  
    * **Text (Name, Link):** Text input (fuzzy search/contains).  
    * **Select (Level, Status):** Dropdown select (e.g., Filter only "Senior" or only "CẦN REVIEW").  
    * **Number (Skills/Complexity):** Min/Max range inputs or simple equality (e.g., "\> 3").

#### **FR-04: Column Re-ordering**

* **Requirement:** Users must be able to change the order of columns via drag-and-drop.  
* **Behavior:**  
  * Users can click and hold a column header to drag it left or right.  
  * Upon release, the column snaps into the new position.  
  * **Constraint:** "Frozen" columns (like checkboxes or Actions) may be pinned to the start/end if necessary, but data columns must be re-orderable.

#### **FR-05: Column Header Tooltips**

* **Requirement:** Display a tooltip explaining the data source or calculation logic for specific columns.  
* **UI Implementation:**  
  * A small info icon (e.g., HelpCircle from Lucide) appears next to the column title.  
  * Hovering over the icon displays a tooltip.  
  * **Content:**  
    * **Skill/Complexity Columns:** Description of the skill (e.g., "Requirements Elicitation: Ability to gather requirements...").  
    * **Max Complexity:** "Highest value among all complexity scores."  
    * **Suitability Score:** "Calculated as Sum(Member Skill \- Task Complexity)."

### **3.2. Dashboard Enhancements**

#### **FR-06: Interactive Metrics Navigation**

* **Current State:** Metrics are static display cards.  
* **Requirement:** Clicking on a metric card navigates the user to the relevant detailed view.  
* **Behavior:**  
  * Click "Thành viên" (Members) card ➔ Navigate to /members route.  
  * Click "Công việc" (Tasks) card ➔ Navigate to /tasks route.  
  * Click "Quy tắc" (Rules) card ➔ Navigate to /config route.  
  * Cursor should change to pointer on hover to indicate interactivity.

### **3.3. Member Management Improvements**

#### **FR-07: Improved "Create Member" Modal**

* **Current State:** Uses window.prompt (primitive browser alerts).  
* **Requirement:** Replace with a dedicated UI Modal.  
* **UI Content:**  
  * **Input:** Member Name (Text).  
  * **Input:** Level (Dropdown Select \- loaded from Config Rules).  
  * **Input:** Last Review Date (Date Picker).  
  * **Inputs:** Dynamic list of Skills with number inputs (defaulting to 0).  
* **Actions:** "Create" (Save to storage) and "Cancel".

#### **FR-08: Editable Member Detail Popup**

* **Current State:** MemberProfile modal is read-only (displays info and Radar Chart).  
* **Requirement:** Allow editing of all member data directly within this modal.  
* **UI Content:**  
  * Convert display text (Name, Level, Date) into Input/Select fields.  
  * Display Skill list as a grid of inputs (0-5) alongside the Radar Chart.  
  * The Radar Chart should update in real-time as the user changes skill inputs in the modal.  
* **Actions:** "Save Changes" and "Cancel".

### **3.4. Task Management Improvements**

#### **FR-09: Improved "Create Task" Modal**

* **Current State:** Uses window.prompt.  
* **Requirement:** Replace with a dedicated UI Modal.  
* **UI Content:**  
  * **Input:** Task Name (Text, required).  
  * **Input:** Link/Jira Key (Text).  
  * **Input:** Story Points (Number).  
  * **Input:** Assignee (Dropdown Select from existing members).  
  * **Inputs:** Dynamic list of Complexity scores (0-5) for each skill.  
* **Actions:** "Create" and "Cancel".

#### **FR-10: Task Detail & Edit Modal**

* **Current State:** No dedicated detail modal exists; editing is only possible inline in the grid.  
* **Requirement:** Add a "View/Edit Detail" action to open a modal for a specific task.  
* **UI Content:**  
  * Full form to edit Name, Link, SP, Assignee.  
  * Grid/List view to edit all Complexity scores comfortably without horizontal scrolling.  
  * Display calculated fields (Status, Gaps, Reviewer) as read-only indicators within the modal.  
* **Actions:** "Save Changes" and "Cancel".

## **4\. Data & Logic Updates**

### **4.1 Skill Metadata Extension**

To support **FR-05 (Tooltips)**, the SkillMeta data structure in src/types/index.ts needs to be updated to include a description field.

export interface SkillMeta {  
  id: string;  
  name: string;  
  shortName: string;  
  description?: string; // New optional field for Tooltip  
  csvColumnName: string;  
  // ... existing fields  
}

### **4.2 TanStack Table Configuration**

The useReactTable hook configuration in MemberTable.tsx and TaskGrid.tsx must be updated to enable:

* enableSorting: true  
* enableFilters: true  
* enableColumnVisibility: true  
* enableColumnOrdering: true

## **5\. Non-Functional Requirements**

### **5.1 Performance**

* Table rendering (sorting/filtering) must remain under 100ms for datasets up to 1000 rows.  
* Real-time updates in Modals (e.g., Radar chart updating while typing) should not cause visible lag.

### **5.2 Usability**

* **Keyboard Navigation:** Modals must support Tab navigation between fields and Esc to close.  
* **Responsiveness:** The new Modals and Tooltips must be responsive and viewable on standard laptop screens (1366x768) without getting cut off.