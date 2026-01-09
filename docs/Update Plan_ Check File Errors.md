# **Implementation Plan \- Phase 2: UX/UI & Feature Enhancements**

## **Overview**

This phase focuses on upgrading the user interface to be more interactive and robust. We will implement advanced table features (sort, filter, order, hide), create dedicated modals for data entry to replace browser alerts, and improve dashboard navigation.

## **Tasks**

* \[ \] 1\. Type & State Updates  
  * \[ \] 1.1 Update SkillMeta Interface  
    * Modify src/types/index.ts to include optional description?: string.  
    * *Ref: FR-05*  
  * \[ \] 1.2 Update App Navigation State  
    * Ensure setCurrentPage is accessible to the Dashboard component (pass as prop or move to Context if needed).  
    * *Ref: FR-06*  
* \[ \] 2\. Dashboard Interactivity  
  * \[ \] 2.1 Update StatsOverview  
    * Add onClick handlers to stat cards.  
    * Implement navigation logic:  
      * Members Card \-\> setCurrentPage('members')  
      * Tasks Card \-\> setCurrentPage('tasks')  
      * Rules Card \-\> setCurrentPage('config')  
    * Add hover cursor styles.  
    * *Ref: FR-06*  
* \[ \] 3\. Advanced Table Components  
  * \[ \] 3.1 Create ColumnVisibility Component  
    * Create dropdown UI with checkboxes for all columns.  
    * Integrate with TanStack Table getVisibleLeafColumns and toggleVisibility.  
    * *Ref: FR-02*  
  * \[ \] 3.2 Create TableHeader Component with Sorting & Tooltips  
    * Implement clickable sort headers (Asc/Desc/Off).  
    * Add visual sort indicators (Arrows).  
    * Add Info/Help icon with Tooltip on hover for columns with descriptions.  
    * *Ref: FR-01, FR-05*  
  * \[ \] 3.3 Create TableFilter Component  
    * Create filter row UI.  
    * Implement text input for string columns.  
    * Implement number range or min/max for number columns.  
    * Integrate with TanStack Table columnFilters state.  
    * *Ref: FR-03*  
  * \[ \] 3.4 Enable Column Ordering  
    * Configure useReactTable with enableColumnOrdering: true.  
    * Implement drag-and-drop handlers for column headers (using HTML5 DnD or light wrapper).  
    * *Ref: FR-04*  
* \[ \] 4\. Member Management Enhancements  
  * \[ \] 4.1 Create CreateMemberModal  
    * Build modal form with: Name (Text), Level (Select from ConfigRules), Date (Input), Skills (Grid of inputs).  
    * Handle validation and submission (ADD\_MEMBER).  
    * Replace prompt logic in MemberTable with this modal.  
    * *Ref: FR-07*  
  * \[ \] 4.2 Update MemberProfile for Editing  
    * Add "Edit" toggle/mode to existing modal.  
    * Convert display fields to inputs in edit mode.  
    * Enable real-time updates to Radar Chart as inputs change.  
    * Implement "Save" (UPDATE\_MEMBER) and "Cancel" actions.  
    * *Ref: FR-08*  
  * \[ \] 4.3 Update MemberTable  
    * Integrate new Table components (Sort, Filter, Visibility, Ordering).  
    * Connect new Modals.  
* \[ \] 5\. Task Management Enhancements  
  * \[ \] 5.1 Create CreateTaskModal  
    * Build modal form with: Name, Link, SP, Assignee (Select), Complexity (Grid of inputs).  
    * Handle validation and submission (ADD\_TASK).  
    * Replace prompt logic in TaskGrid with this modal.  
    * *Ref: FR-09*  
  * \[ \] 5.2 Create TaskDetailModal  
    * Build read/edit modal for Tasks.  
    * Editable fields: Name, Link, SP, Assignee, Complexity values.  
    * Read-only calculated fields: Status, Gaps, Reviewer, Score.  
    * Implement "Save" (UPDATE\_TASK) and "Cancel".  
    * *Ref: FR-10*  
  * \[ \] 5.3 Update TaskGrid  
    * Integrate new Table components (Sort, Filter, Visibility, Ordering).  
    * Add "View Detail" button to actions column to open TaskDetailModal.  
* \[ \] 6\. Final Polish & Testing  
  * \[ \] 6.1 Verify Persistence  
    * Ensure new complex objects created via modals are saved/loaded correctly from LocalStorage.  
  * \[ \] 6.2 Performance Check  
    * Test table sorting/filtering with generated large datasets (if available).  
  * \[ \] 6.3 Responsive Check  
    * Ensure new Modals fit on smaller screens.  
  * \[ \] 6.4 Code Quality Check  
    * Check all files for syntax errors or import errors.

## **Dependencies**

* Lucide React (for Icons)  
* TanStack Table (Core logic)  
* Existing StorageContext