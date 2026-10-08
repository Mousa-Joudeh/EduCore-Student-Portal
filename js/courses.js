// ==============================
// Imports
// ==============================

import { requireLogin } from "./auth.js";

import { getEnrollments, getCourses, getTeachers, getScores } from "./api.js";

// ==============================
// Check Student Session
// ==============================

const session = requireLogin();

// ==============================
// Display Student Name
// ==============================

const topbarName = document.getElementById("topbarName");

if (session && topbarName) {
    topbarName.textContent = session.name;
}

// ==============================
// Logout
// ==============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("studentSession");
        sessionStorage.removeItem("studentSession");

        window.location.href = "./index.html";
    });
}

// ==============================
// Load Student Courses
// ==============================

async function loadCourses() {
    const coursesGrid = document.getElementById("coursesGrid");
    const coursesTotal = document.getElementById("coursesTotal");

    try {
        // ==============================
        // 1. Get Data
        // ==============================

        const enrollments = await getEnrollments();
        const courses = await getCourses();
        const teachers = await getTeachers();
        const scores = await getScores();

        // ==============================
        // 2. Get Student Enrollments
        // ==============================

        const studentEnrollments = enrollments.filter(function (enrollment) {
            return enrollment.studentId === session.id;
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
        // 4. Get Student Scores
        // ==============================

        const studentScores = scores.filter(function (score) {
            return score.studentId === session.id;
        });

        // ==============================
        // 5. Update Courses Count
        // ==============================

        coursesTotal.textContent = studentCourses.length;

        // ==============================
        // 6. Display Student Courses
        // ==============================

        // Clear old cards before displaying new ones
        coursesGrid.innerHTML = "";

        studentCourses.forEach(function (course) {
            // Find course teacher
            const teacher = teachers.find(function (teacher) {
                return teacher.id === course.teacherId;
            });

            // Find student score for this course
            const courseScore = studentScores.find(function (score) {
                return score.courseId === course.id;
            });

            // Create course card
            const courseCard = document.createElement("div");

            courseCard.className = "course-card";

            courseCard.innerHTML = `
                <div class="course-card-top"></div>

                <div class="course-card-content">

                    <div class="course-icon">
                        <i class="fa-solid fa-code"></i>
                    </div>

                    <h3>${course.name}</h3>

                    <div class="course-card-footer">

                        <div class="course-instructor">
                            <i class="fa-solid fa-user-tie"></i>
                            <span>Instructor:</span>
                            <strong>
                                ${teacher ? teacher.name : "Not assigned"}
                            </strong>
                        </div>

                        <span class="course-grade">
                            ${courseScore ? courseScore.score + "%" : "Not graded"}
                        </span>

                    </div>

                </div>
            `;

            coursesGrid.appendChild(courseCard);
        });
    } catch (error) {
        // ==============================
        // 7. Handle API Errors
        // ==============================

        console.error("Error loading courses:", error);

        // Reset courses count
        coursesTotal.textContent = "-";

        // Display error message
        coursesGrid.innerHTML = `
            <div class="dashboard-error">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>Unable to load courses</h3>

                <p>
                    We couldn't connect to the server.
                    Please try again.
                </p>

                <button id="retryCoursesBtn" type="button">
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>

            </div>
        `;

        // ==============================
        // 8. Retry Loading Courses
        // ==============================

        const retryCoursesBtn = document.getElementById("retryCoursesBtn");

        retryCoursesBtn.addEventListener("click", function () {
            retryCoursesBtn.disabled = true;
            retryCoursesBtn.textContent = "Loading...";

            loadCourses();
        });
    }
}

// ==============================
// Initialize
// ==============================

if (session) {
    loadCourses();
}
