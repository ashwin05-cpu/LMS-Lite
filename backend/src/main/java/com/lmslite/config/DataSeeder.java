package com.lmslite.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmslite.entity.*;
import com.lmslite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseContentRepository contentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonProgressRepository progressRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private DiscussionPostRepository postRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Users (Roles matching SRS)
        User admin = new User("admin", "admin@lmslite.edu", passwordEncoder.encode("Admin@123"),
                Role.ADMIN, "Arthur", "Pendleton", "Administration", "INST-001", null);
        admin.setBio("System Administrator overseeing LMS operations, security compliance, and user lifecycles.");

        User instructor = new User("instructor_alan", "alan.turing@lmslite.edu", passwordEncoder.encode("Instructor@123"),
                Role.INSTRUCTOR, "Dr. Alan", "Turing", "Computer Science", "INST-001", null);
        instructor.setBio("Professor of Computer Science specializing in Distributed Computing & Algorithms.");

        User creator = new User("creator_sarah", "sarah.connor@lmslite.edu", passwordEncoder.encode("Creator@123"),
                Role.CONTENT_CREATOR, "Sarah", "Connor", "Instructional Design", "INST-001", null);
        creator.setBio("Senior Content Specialist specializing in multimedia interactive learning modules.");

        User ta = new User("ta_michael", "michael.chang@lmslite.edu", passwordEncoder.encode("Teaching@123"),
                Role.TEACHING_ASSISTANT, "Michael", "Chang", "Computer Science", "INST-001", "TA-8801");
        ta.setBio("Graduate Teaching Assistant for CS core courses and grading supervisor.");

        User student1 = new User("student_emma", "emma.watson@lmslite.edu", passwordEncoder.encode("Student@123"),
                Role.STUDENT, "Emma", "Watson", "Software Engineering", "INST-001", "STU-2026-001");
        student1.setBio("3rd Year Undergraduate Software Engineering student eager to master full-stack systems.");

        User student2 = new User("student_alex", "alex.chen@lmslite.edu", passwordEncoder.encode("Student@123"),
                Role.STUDENT, "Alex", "Chen", "Data Science", "INST-001", "STU-2026-002");
        student2.setBio("Data Science enthusiast focusing on AI architectures.");

        User guest = new User("guest_user", "guest@lmslite.edu", passwordEncoder.encode("Guest@123"),
                Role.GUEST, "Guest", "Explorer", "Auditor", "INST-001", null);
        guest.setBio("Prospective learner auditing open curriculum courses.");

        userRepository.saveAll(List.of(admin, instructor, creator, ta, student1, student2, guest));

        // 2. Seed System Configurations
        configRepository.save(new SystemConfig("PLATFORM_NAME", "LMS Lite - Learning Management System", "Platform branding title"));
        configRepository.save(new SystemConfig("GRADING_SCALE", "A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: 0-59", "Institutional grading standard"));
        configRepository.save(new SystemConfig("FERPA_COMPLIANCE_MODE", "STRICT", "FERPA educational privacy safeguard status"));

        // 3. Seed Courses
        Course course1 = new Course(
                "CS-101",
                "Distributed Web Architectures & Cloud Services",
                "Comprehensive study of contemporary distributed web platforms, REST APIs, Microservices, Spring Boot security, and React frontend integration.",
                instructor,
                4,
                LocalDate.now().minusDays(30),
                LocalDate.now().plusDays(90),
                CourseStatus.PUBLISHED,
                40,
                CourseDifficulty.INTERMEDIATE,
                "Computer Science",
                "Module 1: Foundations of REST & Spring Boot\nModule 2: Enterprise Security & JWT\nModule 3: React SPA Architecture\nModule 4: Distributed Cloud Deployment",
                "Proficiency in Java and modern JavaScript"
        );

        Course course2 = new Course(
                "CS-204",
                "Advanced Algorithms & High-Performance Data Structures",
                "Deep dive into graph algorithms, dynamic programming, network flow, and amortized complexity analysis with hands-on problem solving.",
                instructor,
                3,
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(105),
                CourseStatus.PUBLISHED,
                35,
                CourseDifficulty.ADVANCED,
                "Computer Science",
                "Module 1: Graphs & Shortest Paths\nModule 2: Dynamic Programming & Memoization\nModule 3: Computational Geometry",
                "CS-101 or equivalent Data Structures coursework"
        );

        Course course3 = new Course(
                "DS-301",
                "Foundations of Machine Learning & Neural Networks",
                "Core mathematical foundations and algorithmic principles behind statistical learning, regression, classification, and neural representations.",
                creator,
                4,
                LocalDate.now().minusDays(10),
                LocalDate.now().plusDays(80),
                CourseStatus.PUBLISHED,
                50,
                CourseDifficulty.BEGINNER,
                "Data Science",
                "Module 1: Linear Algebra & Gradient Descent\nModule 2: Supervised Learning & SVMs\nModule 3: Neural Network Architectures",
                "Basic Calculus and Python"
        );

        Course course4 = new Course(
                "SE-410",
                "Enterprise Software Engineering & Agile Delivery",
                "Methodologies for software requirements specification (SRS), test-driven development, CI/CD pipelines, and regulatory compliance standards.",
                instructor,
                3,
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(120),
                CourseStatus.DRAFT,
                30,
                CourseDifficulty.BEGINNER,
                "Software Engineering",
                "Syllabus under active preparation by curriculum committee.",
                "None"
        );

        courseRepository.saveAll(List.of(course1, course2, course3, course4));

        // 4. Seed Course Content / Modules for Course 1
        CourseContent c1_m1_l1 = new CourseContent(
                course1,
                "Module 1: Foundations of REST & Spring Boot",
                "Introduction to Spring Boot 3 & RESTful API Design",
                ContentType.VIDEO,
                "https://www.youtube.com/embed/9SGDpanrc8U",
                "## Welcome to Spring Boot 3 Architecture\n\nIn this lecture, we explore how Spring Boot streamlines enterprise Java development with autoconfiguration, embedded servers, and declarative REST endpoints.\n\n### Key Principles Covered:\n1. Inversion of Control (IoC) and Dependency Injection (DI)\n2. Spring MVC request lifecycle: Controller -> Service -> Repository\n3. Exception handling using `@RestControllerAdvice`",
                1,
                true,
                25,
                true
        );

        CourseContent c1_m1_l2 = new CourseContent(
                course1,
                "Module 1: Foundations of REST & Spring Boot",
                "JPA Persistence & Relational Data Modeling",
                ContentType.DOCUMENT,
                "https://docs.spring.io/spring-data/jpa/reference/",
                "## Object-Relational Mapping with Spring Data JPA\n\nLearn how to map domain models to SQL tables using `@Entity`, `@Table`, and relationship annotations (`@ManyToOne`, `@OneToMany`).\n\nWe review query optimization, indexing strategies, and repository interfaces.",
                2,
                true,
                20,
                true
        );

        CourseContent c1_m2_l1 = new CourseContent(
                course1,
                "Module 2: Enterprise Security & JWT",
                "Stateless Authentication with Spring Security 6 & JJWT",
                ContentType.TEXT,
                null,
                "## Modern Web Security Paradigms\n\nTraditional session cookies encounter cross-origin and scalability bottlenecks in distributed cloud topologies. JSON Web Tokens (JWT) allow stateless, cryptographically signed authentication.\n\n### Security Flow:\n- Client posts credentials (`username`, `password`) to `/api/auth/login`\n- Server validates credentials with `BCryptPasswordEncoder`\n- Server signs a HS256 JWT payload containing user ID, username, and role\n- Client attaches `Authorization: Bearer <token>` in header for subsequent API calls",
                3,
                true,
                30,
                false
        );

        CourseContent c1_m2_l2 = new CourseContent(
                course1,
                "Module 2: Enterprise Security & JWT",
                "Role-Based Access Control (RBAC) & Method Security",
                ContentType.PRESENTATION,
                "https://example.com/slides/rbac-security.pdf",
                "## Enforcing Fine-Grained Authorization\n\nThis presentation examines `@PreAuthorize('hasRole(...)')` annotations and custom permission evaluators matching educational regulatory requirements.",
                4,
                true,
                15,
                true
        );

        contentRepository.saveAll(List.of(c1_m1_l1, c1_m1_l2, c1_m2_l1, c1_m2_l2));

        // 5. Seed Enrollments
        Enrollment enr1 = new Enrollment(course1, student1, EnrollmentStatus.ENROLLED);
        enr1.setProgressPercent(50); // Completed 2 out of 4 lessons
        enrollmentRepository.save(enr1);

        Enrollment enr2 = new Enrollment(course2, student1, EnrollmentStatus.ENROLLED);
        enr2.setProgressPercent(0);
        enrollmentRepository.save(enr2);

        Enrollment enr3 = new Enrollment(course1, student2, EnrollmentStatus.ENROLLED);
        enr3.setProgressPercent(25);
        enrollmentRepository.save(enr3);

        // Lesson progress for Student 1 in Course 1
        progressRepository.save(new LessonProgress(student1, c1_m1_l1, true));
        progressRepository.save(new LessonProgress(student1, c1_m1_l2, true));
        progressRepository.save(new LessonProgress(student1, c1_m2_l1, false));
        progressRepository.save(new LessonProgress(student1, c1_m2_l2, false));

        // 6. Seed Assessments (Quiz + Assignment)
        String quizQuestions = """
        [
            {
                "id": "q1",
                "type": "MULTIPLE_CHOICE",
                "question": "Which HTTP header is standard for transmitting a JSON Web Token?",
                "options": ["Authorization: Bearer <token>", "X-Token: <token>", "Cookie: token=<token>", "Authentication: JWT <token>"],
                "correctAnswer": "Authorization: Bearer <token>",
                "points": 25
            },
            {
                "id": "q2",
                "type": "TRUE_FALSE",
                "question": "Spring Security 6 disables CSRF by default for stateless REST API architectures.",
                "options": ["True", "False"],
                "correctAnswer": "True",
                "points": 25
            },
            {
                "id": "q3",
                "type": "MULTIPLE_CHOICE",
                "question": "What is the primary advantage of Spring Data JPA repositories?",
                "options": ["Automatic CRUD implementation without writing boilerplate SQL", "Replaces need for relational database", "Generates React frontend forms automatically", "Eliminates need for JVM memory management"],
                "correctAnswer": "Automatic CRUD implementation without writing boilerplate SQL",
                "points": 25
            },
            {
                "id": "q4",
                "type": "SHORT_ANSWER",
                "question": "Name the encryption algorithm commonly used with HMAC symmetric signing in JWT.",
                "correctAnswer": "HS256",
                "points": 25
            }
        ]
        """;

        Assessment quiz1 = new Assessment(
                course1,
                "Midterm Quiz 1: Spring Boot & Security Core",
                "Timed assessment testing your understanding of REST architecture, JWT authentication flow, and Spring Data JPA persistence.",
                AssessmentType.QUIZ,
                100,
                LocalDateTime.now().plusDays(7),
                20,
                2,
                70,
                quizQuestions
        );

        Assessment assignment1 = new Assessment(
                course1,
                "Project Milestone 1: REST API & Role Guards",
                "Implement a secure Spring Boot controller with `@PreAuthorize` role access restrictions and submit your GitHub repository link or source archive.",
                AssessmentType.ASSIGNMENT,
                100,
                LocalDateTime.now().plusDays(14),
                null,
                1,
                60,
                null
        );

        assessmentRepository.saveAll(List.of(quiz1, assignment1));

        // 7. Seed Student 1 Submission & Grade for Quiz 1
        String studentAnswers = """
        {
            "q1": "Authorization: Bearer <token>",
            "q2": "True",
            "q3": "Automatic CRUD implementation without writing boilerplate SQL",
            "q4": "HS256"
        }
        """;

        AssessmentSubmission submission1 = new AssessmentSubmission(
                quiz1, student1, 1, studentAnswers, null, "Completed quiz within 12 minutes."
        );
        submission1.setScore(100.0);
        submission1.setStatus(SubmissionStatus.GRADED);
        submission1.setGradedBy(instructor);
        submission1.setGradedDate(LocalDateTime.now().minusDays(1));
        submission1.setFeedback("Flawless score! Exceptional grasp of Spring Security paradigms.");
        submissionRepository.save(submission1);

        Grade grade1 = new Grade(student1, course1, quiz1, 100.0, 100.0, instructor,
                "Flawless score! Exceptional grasp of Spring Security paradigms.", "A");
        gradeRepository.save(grade1);

        // 8. Seed Student 2 Pending Submission for Assignment 1
        AssessmentSubmission submission2 = new AssessmentSubmission(
                assignment1, student2, 1, null, "https://github.com/alexchen/lms-rest-api",
                "Completed milestone 1 with full JWT token verification filters and JUnit test cases."
        );
        submission2.setStatus(SubmissionStatus.SUBMITTED);
        submissionRepository.save(submission2);

        // 9. Seed Discussions & Posts
        Discussion disc1 = new Discussion(
                course1,
                "Discussion: Best practices for JWT token refresh strategy",
                "When implementing silent refresh with Axios interceptors, should we store refresh tokens in HTTP-only cookies or memory?",
                "GENERAL",
                instructor
        );
        disc1.setIsPinned(true);
        discussionRepository.save(disc1);

        DiscussionPost post1 = new DiscussionPost(
                disc1,
                instructor,
                "Welcome everyone! For security reasons, HTTP-only secure cookies with Strict SameSite protection are the gold standard to mitigate XSS exposure.",
                null
        );
        post1.setUpvotes(5);

        DiscussionPost post2 = new DiscussionPost(
                disc1,
                student1,
                "Thank you Dr. Turing! In our React app, we have configured Axios to automatically handle 401s and trigger `/api/auth/refresh`.",
                post1.getId()
        );
        post2.setUpvotes(3);

        postRepository.saveAll(List.of(post1, post2));

        // 10. Seed Notifications
        notificationRepository.save(new Notification(
                student1,
                "Welcome to CS-101: Distributed Web Architectures & Cloud Services!",
                "SYSTEM",
                course1.getId(),
                "/courses/" + course1.getId()
        ));

        notificationRepository.save(new Notification(
                student1,
                "Grade published for Midterm Quiz 1: 100/100 (A)",
                "GRADE_POSTED",
                course1.getId(),
                "/grades"
        ));

        notificationRepository.save(new Notification(
                instructor,
                "Alex Chen submitted Project Milestone 1 for grading.",
                "SUBMISSION",
                course1.getId(),
                "/grading"
        ));
    }
}
