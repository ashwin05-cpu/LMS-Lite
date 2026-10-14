# LMS Lite - Learning Management System

An enterprise-grade, full-stack educational platform built strictly according to the **Learning Management System (LMS) Lite Software Requirements Specification (SRS)**.

---

## 🏛️ Architecture & Technology Stack

- **Backend**:
  - **Framework**: Spring Boot 3.3.4 (Java 21 LTS)
  - **Security**: Spring Security 6 with stateless JWT authentication (HS256) & Token Blacklisting
  - **Data Persistence**: Spring Data JPA with Hibernate ORM
  - **Database**: H2 Database (zero-configuration, in-memory with persistent tables & console at `/h2-console`)
  - **Validation**: Jakarta Bean Validation (`@Valid`, custom regex constraints matching SRS Appendix C)
  - **Port**: `8080`

- **Frontend**:
  - **Framework**: React 18+ (SPA architecture)
  - **Bundler & Dev Server**: Vite 5 (Port `3000`)
  - **Styling**: Tailwind CSS (WCAG 2.1 compliant accessible layout)
  - **Icons**: Lucide React
  - **Routing**: React Router v6 with protected routes and role authorization guards
  - **API Client**: Axios with automatic JWT Bearer interceptor

---

## 👥 Pre-Configured Demo Accounts (All 6 Roles from SRS)

For immediate presentation and grading verification, the database is pre-seeded with 6 realistic accounts representing each role from **Appendix A**:

| Role | Username | Password | Full Name | Capabilities |
|---|---|---|---|---|
| **ADMIN** | `admin` | `Admin@123` | Arthur Pendleton | Full platform governance, user lifecycle status toggles, FERPA audit log inspection, system policy configuration |
| **INSTRUCTOR** | `instructor_alan` | `Instructor@123` | Dr. Alan Turing | Course creation, multimedia module authoring, assignment rubric grading, class analytics & at-risk student monitoring |
| **CONTENT_CREATOR**| `creator_sarah` | `Creator@123` | Sarah Connor | Specialized instructional content development, video modules, interactive presentations, curriculum staging |
| **TEACHING_ASSISTANT**| `ta_michael` | `Teaching@123` | Michael Chang | Assigned section grading, rubric scoring, student feedback delivery, discussion board moderation |
| **STUDENT** | `student_emma` | `Student@123` | Emma Watson (ID: `STU-2026-001`) | Course enrollment, interactive lecture player, timed quiz taking with automated scoring, assignment submissions, GPA tracking |
| **GUEST** | `guest_user` | `Guest@123` | Guest Explorer | Public course catalog auditing, syllabus inspection, trial access |

> [!TIP]
> **1-Click Role Switcher Bar**: The top navigation bar in the frontend includes an **Instant Demo Role Switcher**. Clicking any role immediately authenticates that user and transitions the entire application view!

---

## 🚀 How to Run the Application

### Option A: 1-Click Launch (Recommended for Windows)
Simply double-click:
```bat
start-lms.bat
```
This automatically launches:
1. The Spring Boot backend server on `http://localhost:8080`
2. The React frontend on `http://localhost:3000`

---

### Option B: Manual Execution

#### 1. Start the Backend:
```powershell
cd "AD project (Learning management system)\backend"
java -jar target\lms-lite-backend-1.0.0.jar
```
*Backend runs at `http://localhost:8080`. H2 database console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:lmsdb`, user: `sa`, password: empty).*

#### 2. Start the Frontend:
```powershell
cd "AD project (Learning management system)\frontend"
npm run dev
```
*Frontend opens at `http://localhost:3000`.*

---

## 📋 Comprehensive SRS Requirements Compliance

| SRS Section | Implemented Functionality |
|---|---|
| **FR1: User Registration** | Captures First/Last name, email, department, institution ID, and student ID. Enforces Appendix C & D password complexity. |
| **FR2: Secure Authentication** | Multi-credential login (by username, email, or student ID), JWT access/refresh tokens, token blacklisting on logout. |
| **FR3 & Appendix A: RBAC** | Enforces the complete Role-Based Permission Matrix across Guest, Student, TA, Instructor, Creator, and Admin. |
| **FR4 & Appendix F: Course Management** | Course code regex validation (`^[A-Z0-9-]{6,20}$`), 1-6 credit range, capacity enforcement, cannot delete courses once students enroll. |
| **FR5: Content Delivery** | Hierarchical modules, video streaming player, PDF lecture documents, and "Mark Lesson Complete" toggle updating student progress. |
| **FR6: Assessment & Grading** | Timed Quiz player with live countdown, objective auto-grading, assignment submission portal, instructor/TA rubric grading with 0-100 score validation. |
| **FR7: Progress & Analytics** | Student progress percentages, GPA calculations (4.0 scale), competency mapping, and historical assessment timelines. |
| **FR8: Collaboration** | Threaded course discussion forums, Q&A tagging, upvotes, locked/pinned topic controls, and deadline notifications. |
| **FR9: Administration & FERPA** | User activation/deactivation, role upgrades, tamper-evident FERPA audit logs tracking all security and grade events. |
| **FR10: Institutional Intelligence**| Predictive model identifying at-risk learners (<40% progression), department demographics, and course retention metrics. |

---

## 🔌 REST API Endpoints Summary (Appendix H)

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with username, email, or student ID.
- `POST /api/auth/register`: Create new user account with role validation.
- `POST /api/auth/logout`: Invalidate token and add to server blacklist.

### Courses (`/api/courses`)
- `GET /api/courses/public`: Filter and search public courses.
- `GET /api/courses`: Retrieve all courses.
- `GET /api/courses/instructor`: Retrieve instructor's courses.
- `GET /api/courses/{id}`: Detailed course syllabus and modules.
- `POST /api/courses`: Create new course offering (`INSTRUCTOR`, `CONTENT_CREATOR`, `ADMIN`).
- `PUT /api/courses/{id}`: Update course details.
- `DELETE /api/courses/{id}`: Archive/delete course.

### Curriculum Content (`/api/courses/{courseId}/content`)
- `GET /api/courses/{courseId}/content`: Retrieve lessons and completion status.
- `POST /api/courses/{courseId}/content`: Add multimedia lesson.
- `POST /api/courses/content/{contentId}/toggle-completion`: Mark lesson completed.

### Enrollments (`/api/enrollments`)
- `POST /api/enrollments/course/{courseId}`: Enroll in course (capacity checked).
- `POST /api/enrollments/course/{courseId}/drop`: Drop enrolled course.
- `GET /api/enrollments/my`: Current student's enrolled courses.
- `GET /api/enrollments/course/{courseId}/students`: Course roster.

### Assessments & Quizzes (`/api/assessments`)
- `GET /api/assessments/course/{courseId}`: Course assessments.
- `GET /api/assessments/{id}`: Assessment questions and parameters.
- `POST /api/assessments`: Create quiz or assignment.
- `POST /api/assessments/{id}/submit`: Submit answers (auto-grades objective questions).
- `GET /api/assessments/{id}/submissions`: Instructor view of student attempts.

### Grading (`/api/grades`)
- `GET /api/grades/my`: Student transcript and letter grades.
- `GET /api/grades/course/{courseId}`: Course gradebook matrix.
- `POST /api/grades/grade-submission/{submissionId}`: Assign rubric score (0-100) & feedback.

### Discussions (`/api/discussions`)
- `GET /api/discussions/course/{courseId}`: Course threads.
- `POST /api/discussions`: Create topic.
- `GET /api/discussions/{id}/posts`: Retrieve posts in thread.
- `POST /api/discussions/{id}/posts`: Post reply.
- `POST /api/discussions/{id}/lock`: Lock thread.
- `POST /api/discussions/{id}/pin`: Pin thread.
- `POST /api/discussions/posts/{postId}/upvote`: Upvote helpful post.

### Analytics & Administration (`/api/analytics`, `/api/admin`)
- `GET /api/analytics/student`: Student GPA and progress analytics.
- `GET /api/analytics/instructor`: Class performance and at-risk students.
- `GET /api/analytics/institutional`: Institution-wide metrics.
- `GET /api/admin/users`: User management table.
- `PUT /api/admin/users/{id}/toggle-status`: Activate / Deactivate user.
- `PUT /api/admin/users/{id}/role`: Change role.
- `GET /api/admin/audit-logs`: FERPA audit trail.
- `GET /api/admin/system-config`: Platform configuration settings.
