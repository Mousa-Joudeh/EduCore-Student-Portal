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
// Convert Score to Letter Grade
// ==============================

function getLetterGrade(score) {
    if (score >= 90) {
        return "A";
    } else if (score >= 80) {
        return "B";
    } else if (score >= 70) {
        return "C";
    } else if (score >= 60) {
        return "D";
    } else {
        return "F";
    }
}

// ==============================
// Load Student Grades
// ==============================

async function loadGrades() {
    const gradesTableBody = document.getElementById("gradesTableBody");
    const gradesAverage = document.getElementById("gradesAverage");
    const gradesHighest = document.getElementById("gradesHighest");
    const gradesCount = document.getElementById("gradesCount");

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
        // 5. Calculate Average and Highest Score
        // ==============================

        let totalScore = 0;
        let highest = 0;

        for (const score of studentScores) {
            totalScore += score.score;

            if (score.score > highest) {
                highest = score.score;
            }
        }

        let average = 0;

        if (studentScores.length > 0) {
            average = totalScore / studentScores.length;
        }

        // ==============================
        // 6. Update Summary Cards
        // ==============================

        gradesAverage.textContent = Math.round(average) + "%";
        gradesHighest.textContent = highest + "%";
        gradesCount.textContent = studentScores.length;

        // ==============================
        // 7. Display Grades Table
        // ==============================

        // Clear old rows before displaying new ones
        gradesTableBody.innerHTML = "";

        studentCourses.forEach(function (course) {
            const teacher = teachers.find(function (teacher) {
                return teacher.id === course.teacherId;
            });

            const courseScore = studentScores.find(function (score) {
                return score.courseId === course.id;
            });

            const row = document.createElement("tr");

            let scoreText = "Not graded";
            let gradeText = "-";
            let gradeClass = "";

            if (courseScore) {
                scoreText = courseScore.score + "%";
                gradeText = getLetterGrade(courseScore.score);
                gradeClass = "grade-" + gradeText.toLowerCase();
            }

            row.innerHTML = `
                <td>${course.name}</td>

                <td>
                    ${teacher ? teacher.name : "Not assigned"}
                </td>

                <td>${scoreText}</td>

                <td>
                    <span class="grade-badge ${gradeClass}">
                        ${gradeText}
                    </span>
                </td>
            `;

            gradesTableBody.appendChild(row);
        });
    } catch (error) {
        // ==============================
        // 8. Handle API Errors
        // ==============================

        console.error("Error loading grades:", error);

        // Reset summary cards
        gradesAverage.textContent = "-";
        gradesHighest.textContent = "-";
        gradesCount.textContent = "-";

        // Display error inside the table
        gradesTableBody.innerHTML = `
            <tr>
                <td colspan="4">

                    <div class="dashboard-error">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <h3>Unable to load grades</h3>

                        <p>
                            We couldn't connect to the server.
                            Please try again.
                        </p>

                        <button id="retryGradesBtn" type="button">
                            <i class="fa-solid fa-rotate-right"></i>
                            Try Again
                        </button>

                    </div>

                </td>
            </tr>
        `;

        // ==============================
        // 9. Retry Loading Grades
        // ==============================

        const retryGradesBtn = document.getElementById("retryGradesBtn");

        retryGradesBtn.addEventListener("click", function () {
            retryGradesBtn.disabled = true;
            retryGradesBtn.textContent = "Loading...";

            loadGrades();
        });
    }
}

// ==============================
// Initialize
// ==============================

if (session) {
    loadGrades();
}
