// ========================================
// API URL
// ========================================

const STUDENTS_API = "http://localhost:3000/students";
const COURSES_API = "http://localhost:3000/courses";
const TEACHERS_API = "http://localhost:3000/teachers";
const SCORES_API = "http://localhost:3000/scores";
const ENROLLMENTS_API = "http://localhost:3000/enrollments";

// ========================================
// Get All Students
// ========================================

export async function getStudents() {
    const response = await fetch(STUDENTS_API);

    const students = await response.json();

    return students;
}

// ========================================
// Add New Student
// ========================================

export async function addStudent(student) {
    const response = await fetch(STUDENTS_API, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(student),
    });

    const newStudent = await response.json();

    return newStudent;
}

// ========================================
// Get Courses
// ========================================

export async function getCourses() {
    const response = await fetch(COURSES_API);
    const courses = await response.json();

    return courses;
}

// ========================================
// Get Teachers
// ========================================

export async function getTeachers() {
    const response = await fetch(TEACHERS_API);
    const teachers = await response.json();

    return teachers;
}

// ========================================
// Get Scores
// ========================================

export async function getScores() {
    const response = await fetch(SCORES_API);
    const scores = await response.json();

    return scores;
}

// ========================================
// Get Student By ID
// ========================================

export async function getStudentById(id) {
    const response = await fetch(`${STUDENTS_API}/${id}`);
    const student = await response.json();

    return student;
}

// ========================================
// Get Enrollments
// ========================================

export async function getEnrollments() {
    const response = await fetch(ENROLLMENTS_API);
    const enrollments = await response.json();

    return enrollments;
}

// ==============================
// Update Student
// ==============================

export async function updateStudent(id, studentData) {
    const response = await fetch(`${STUDENTS_API}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
    });

    if (!response.ok) {
        throw new Error("Failed to update student");
    }

    return await response.json();
}
