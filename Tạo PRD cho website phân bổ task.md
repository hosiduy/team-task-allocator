# **Product Requirements Document (PRD)**

## **Project Name: Team Task Allocator (TTA)**

Version: 1.0  
Date: 2026-01-08  
Language: Vietnamese

## **1\. Tổng Quan (Overview)**

### **1.1. Mục đích**

Xây dựng một ứng dụng web Single Page Application (SPA) giúp Leader/Manager phân bổ công việc (Task Allocation) cho các thành viên trong team dựa trên năng lực (Skill) và độ phức tạp của công việc (Complexity). Hệ thống tự động tính toán độ phù hợp, phát hiện lỗ hổng kỹ năng (Skill Gap) và đề xuất người review.

### **1.2. Công nghệ yêu cầu**

* **Frontend Framework:** ReactJS (Phiên bản mới nhất \- 19.x hoặc 18.x).  
* **Styling:** TailwindCSS 4.1 (Phiên bản mới nhất \- cấu hình không cần file config phức tạp).  
* **Icons:** Lucide-react hoặc Phosphor-icons.  
* **Charts:** Recharts (cho Radar Chart skill) hoặc Chart.js.  
* **Data Handling:** Papaparse (CSV Import/Export), TanStack Table (Quản lý grid data).  
* **Storage:** LocalStorage (Trình duyệt) \- Không cần Backend Database.

## **2\. Luồng dữ liệu & Cấu trúc (Data Flow & Structure)**

### **2.1. Mô hình lưu trữ (Schema LocalStorage)**

Dữ liệu sẽ được lưu dưới dạng JSON string trong LocalStorage với các key chính:

1. TTA\_MEMBERS: Danh sách thành viên và bộ kỹ năng.  
2. TTA\_TASKS: Danh sách công việc và phân bổ.  
3. TTA\_CONFIG\_RULES: Quy định về Level và quyền hạn.  
4. TTA\_SKILL\_META: Danh sách định nghĩa các loại kỹ năng (Ví dụ: Tech, Biz, UI/UX...).

### **2.2. Import Logic (CSV Mapping)**

Hệ thống cho phép Import 3 loại file CSV (dựa trên mẫu file bạn cung cấp):

**A. Config Rules (config\_rules.csv)**

* Cột: Level ID, Level Name, Max SP Self (Số điểm tối đa được tự quyết), Review Authority (Quyền review).

**B. Member Profiles (member\_profile.csv)**

* Cột: Member Name, Current Level, Last Review Date.  
* Cột Skill (Dynamic): Requirement Elicitation, Tech Skill, Biz Skill, Doc Skill, Comm Skill, Critical Thinking, UI/UX skill, Presentation skill... (Giá trị 1-5).

**C. Task Allocation / Backlog (task\_allocation.csv / BACKLOG\_Report...)**

* Cột: Task Name, Link/Key (XCOR-...), Task Type.  
* Cột Complexity (Tương ứng với Skill): Req, Tech, Biz, Doc, Comm, UI/UX... (Giá trị 1-5).  
* Cột Assignee: Người thực hiện.

## **3\. Tính năng chi tiết (Functional Requirements)**

### **3.1. Dashboard & Import Data**

* **Giao diện:** Khu vực kéo thả file CSV hoặc nút Upload.  
* **Chức năng:**  
  * Import từng loại dữ liệu riêng biệt (Members, Rules, Tasks).  
  * Khi import, hệ thống tự động parse CSV \-\> JSON.  
  * Tự động đồng bộ hóa cột Skill: Nếu file Task có cột "AI Skill" mà file Member chưa có, hệ thống sẽ nhắc hoặc tự động thêm skill đó vào cấu trúc Member với giá trị mặc định là 0\.

### **3.2. Quản lý Thành viên (Member Management)**

* **Danh sách:** Hiển thị dạng bảng (Table).  
* **Inline Edit:** Cho phép sửa trực tiếp Tên, Level, và điểm số các Skill ngay trên dòng.  
* **Detail Profile (Modal/Page):**  
  * Hiển thị thông tin chung.  
  * **Biểu đồ năng lực (Radar Chart/Spider Chart):** Trực quan hóa điểm mạnh yếu của member (Ví dụ: Tech 5, Biz 3, Comm 4...).  
* **Sync Skill:** Nút "Sync Skills" để quét toàn bộ hệ thống, đảm bảo danh sách Skill của Member khớp với các tiêu chí đánh giá của Task.

### **3.3. Quản lý Task & Phân bổ (Task Allocation \- Core Feature)**

Đây là màn hình chính, dạng Data Grid (Excel-like).

#### **3.3.1. Hiển thị & Thao tác**

* **Filter/Search:** Tìm theo Assignee, Project, Status, Task Key.  
* **Sort:** Sắp xếp theo độ phức tạp (Complexity), Story Point (SP).  
* **Paging:** Phân trang nếu dữ liệu \> 50 dòng.  
* **Inline Edit:** Chỉnh sửa độ khó (Complexity) của task, thay đổi Assignee.

#### **3.3.2. Logic Tính toán Tự động (Automation)**

Ngay khi dữ liệu thay đổi (ví dụ: đổi Assignee hoặc đổi điểm độ khó), các cột sau phải được tính lại **real-time**:

1. **Max Complexity (Độ khó cao nhất):**  
   * *Công thức:* MAX(Req, Tech, Biz, Doc, Comm, Logic, UI/UX...) của Task đó.  
2. **Skill Gap Check (Cảnh báo lỗ hổng):**  
   * *Logic:* So sánh điểm Skill của Assignee với điểm Complexity của Task tương ứng.  
   * *Hiển thị:* Nếu Member Skill \< Task Complexity, hiển thị cảnh báo dạng text: ⚠️ \[Tên Skill\].  
   * *Ví dụ:* Task cần UI/UX \= 4, Member chỉ có UI/UX \= 2 \-\> Hiện ⚠️UI/UX.  
3. **Status (Trạng thái Duyệt):**  
   * *Logic:* Dựa vào config\_rules.  
   * So sánh Final SP (hoặc Max Complexity) của Task với Max SP Self của Level thành viên đó.  
   * *Kết quả:*  
     * Nếu Task Complexity \<= Max SP Self: Hiển thị "TỰ QUYẾT" (Self-manage).  
     * Nếu Task Complexity \> Max SP Self: Hiển thị "CẦN REVIEW" (Need Review).  
4. **Reviewer Suggestion (Gợi ý người Review):**  
   * *Logic:* Nếu trạng thái là "CẦN REVIEW", tìm trong danh sách Member những người có Review Authority \>= Level yêu cầu (hoặc Seniority cao hơn).  
   * *Logic nâng cao:* Ưu tiên người có Skill cao nhất ở những Skill mà Assignee đang bị thiếu (Gap).  
5. **Suitability Score (Điểm phù hợp \- Optional):**  
   * Tính % độ khớp skill để gợi ý ai là người tốt nhất cho task này.

### **3.4. Quản lý Cấu hình (Configuration)**

* Cho phép thêm/sửa/xóa các Rule về Level (Ví dụ: Update Senior được tự quyết task 50 điểm).  
* Quản lý danh sách các Skill (Thêm cột skill mới, đổi tên skill).

## **4\. Yêu cầu Phi chức năng (Non-Functional Requirements)**

* **Performance:** Tính toán lại bảng Task (ví dụ 500 tasks) phải dưới 200ms khi edit inline.  
* **Usability:** Hỗ trợ phím tắt điều hướng trong bảng (Arrow keys) tương tự Excel.  
* **Persistence:** F5 không mất dữ liệu (Lưu liên tục vào LocalStorage).  
* **Data Safety:** Có nút "Export Data" ra JSON hoặc CSV để backup.

## **5\. UI/UX Guidelines (TailwindCSS 4\)**

* **Theme:** Modern, Clean, sử dụng spacing rộng rãi.  
* **Colors:**  
  * Gap/Warning: text-amber-600, bg-amber-50.  
  * Safe/Valid: text-emerald-600, bg-emerald-50.  
  * Critical: text-rose-600.  
* **Components:**  
  * **Table:** Sticky Header, Row Hover effect, Cell Editing state rõ ràng.  
  * **Inputs:** Minimalist border, focus ring rõ ràng.

## **6\. Kế hoạch phát triển (Implementation Steps)**

1. **Setup:** Khởi tạo Vite \+ React \+ Tailwind 4\.  
2. **Core:** Xây dựng StorageContext để quản lý đọc/ghi LocalStorage.  
3. **Feature 1:** Xây dựng Import CSV Parser & Data Mapping.  
4. **Feature 2:** Xây dựng Member List & Profile Chart.  
5. **Feature 3:** Xây dựng Task Table với Logic tính toán (Gap, Review Status).  
6. **Feature 4:** Filter, Sort, Pagination.  
7. **Refine:** UI Polish & Testing với dữ liệu mẫu.