// ========================================
// Imports
// ========================================

import { requireLogin } from "./auth.js";

import { getStudentById, getEnrollments, getCourses, getScores, getTeachers } from "./api.js";

// ========================================
// Protect Dashboard
// ========================================

const session = requireLogin();

// ========================================
// Display Student Name
// ========================================

const topbarName = document.getElementById("topbarName");

if (session && topbarName) {
    topbarName.textContent = session.name;
}

const welcomeName = document.getElementById("welcomeName");

if (session && welcomeName) {
    const firstName = session.name.split(" ")[0];
    welcomeName.textContent = firstName;
}

// ========================================
// Logout
// ========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("studentSession");
        sessionStorage.removeItem("studentSession");

        window.location.href = "./index.html";
    });
}

// ========================================
// Load Dashboard Data
// ========================================

async function loadStudentData() {
    try {
        // ==============================
        // 1. Get Data
        // ==============================

        const student = await getStudentById(session.id);
        const enrollments = await getEnrollments();
        const courses = await getCourses();
        const scores = await getScores();
        const teachers = await getTeachers();

        // ==============================
        // 2. Get Student Enrollments
        // ==============================

        const studentEnrollments = enrollments.filter(function (enrollment) {
            return enrollment.studentId === student.id;
        });

        // ==============================
        // 3. Get Student Courses
        // ==============================

        const studentCourses = courses.filter(function (course) {
            return studentEnrollments.some(function (enrollment) {
                return enrollment.courseId === course.id;
            });
        });

        // ==============================
        // 4. Get Student Teachers
        // ==============================

        const teacherIds = studentCourses.map(function (course) {
            return course.teacherId;
        });

        const uniqueTeacherIds = new Set(teacherIds);

        // ==============================
        // 5. Get Student Scores
        // ==============================

        const studentScores = scores.filter(function (score) {
            return score.studentId === student.id;
        });

        // ==============================
        // 6. Calculate Average Score
        // ==============================

        let totalScore = 0;

        for (const score of studentScores) {
            totalScore += score.score;
        }

        let average = 0;

        if (studentScores.length > 0) {
            average = totalScore / studentScores.length;
        }

        let highest = 0;

        for (const score of studentScores) {
            if (score.score > highest) {
                highest = score.score;
            }
        }

        // ==============================
        // 7. Update Summary Cards
        // ==============================

        const coursesCount = document.getElementById("coursesCount");
        const teachersCount = document.getElementById("teachersCount");
        const averageScore = document.getElementById("averageScore");
        const studentId = document.getElementById("studentId");

        const overviewAverage = document.getElementById("overviewAverage");
        const highestScore = document.getElementById("highestScore");
        const gradedCourses = document.getElementById("gradedCourses");

        coursesCount.textContent = studentEnrollments.length;
        teachersCount.textContent = uniqueTeacherIds.size;
        averageScore.textContent = Math.round(average) + "%";
        studentId.textContent = student.studentId;

        overviewAverage.textContent = Math.round(average) + "%";
        highestScore.textContent = highest + "%";
        gradedCourses.textContent = studentScores.length;

        // ==============================
        // 8. Display Student Courses
        // ==============================

        const dashboardCourses = document.getElementById("dashboardCourses");

        // Clear old courses before displaying new ones
        dashboardCourses.innerHTML = "";

        studentCourses.forEach(function (course) {
            const teacher = teachers.find(function (teacher) {
                return teacher.id === course.teacherId;
            });

            const courseScore = studentScores.find(function (score) {
                return score.courseId === course.id;
            });

            const courseElement = document.createElement("div");

            courseElement.className = "dashboard-course";

            courseElement.innerHTML = `
                <div class="course-details">
                    <h3>${course.name}</h3>
                    <p>
                        ${teacher ? teacher.name : "No teacher assigned"}
                    </p>
                </div>

                <span class="course-score">
                    ${courseScore ? courseScore.score + "%" : "Not graded"}
                </span>
            `;

            dashboardCourses.appendChild(courseElement);
        });
    } catch (error) {
        // ==============================
        // 9. Handle API Errors
        // ==============================

        console.error("Error loading dashboard:", error);

        const dashboardCourses = document.getElementById("dashboardCourses");

        // Display error message
        dashboardCourses.innerHTML = `
            <div class="dashboard-error">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>Unable to load dashboard data</h3>

                <p>
                    We couldn't connect to the server.
                    Please try again.
                </p>

                <button id="retryDashboardBtn" type="button">
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>

            </div>
        `;

        // ==============================
        // 10. Reset Summary Cards
        // ==============================

        document.getElementById("coursesCount").textContent = "-";
        document.getElementById("teachersCount").textContent = "-";
        document.getElementById("averageScore").textContent = "-";
        document.getElementById("studentId").textContent = "-";

        document.getElementById("overviewAverage").textContent = "-";
        document.getElementById("highestScore").textContent = "-";
        document.getElementById("gradedCourses").textContent = "-";

        // ==============================
        // 11. Retry Loading Data
        // ==============================

        const retryDashboardBtn = document.getElementById("retryDashboardBtn");

        retryDashboardBtn.addEventListener("click", function () {
            retryDashboardBtn.disabled = true;
            retryDashboardBtn.textContent = "Loading...";

            loadStudentData();
        });
    }
}

// ========================================
// Initialize Dashboard
// ========================================

if (session) {
    loadStudentData();
}
