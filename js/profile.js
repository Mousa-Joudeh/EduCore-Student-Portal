// ==============================
// Imports
// ==============================

import { requireLogin } from "./auth.js";

import { getStudentById, getStudents, updateStudent } from "./api.js";

// ==============================
// Check Student Session
// ==============================

const session = requireLogin();

// ==============================
// Elements
// ==============================

const topbarName = document.getElementById("topbarName");
const profileName = document.getElementById("profileName");
const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profileStudentId = document.getElementById("profileStudentId");

const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const editProfileForm = document.getElementById("editProfileForm");
const editFullName = document.getElementById("editFullName");
const editEmail = document.getElementById("editEmail");
const modalMessage = document.getElementById("modalMessage");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const logoutBtn = document.getElementById("logoutBtn");

let currentStudent = null;

// ==============================
// Display Student Information
// ==============================

function displayStudent(student) {
    topbarName.textContent = student.fullName;
    profileName.textContent = student.fullName;
    profileFullName.textContent = student.fullName;
    profileEmail.textContent = student.email;
    profileStudentId.textContent = student.studentId;
}

// ==============================
// Load Student Profile
// ==============================

async function loadProfile() {
    // Disable editing until data loads
    currentStudent = null;
    editProfileBtn.disabled = true;

    // Remove any previous error message
    const oldError = document.getElementById("profileError");

    if (oldError) {
        oldError.remove();
    }

    try {
        // ==============================
        // 1. Get Student Data
        // ==============================

        const student = await getStudentById(session.id);

        if (!student || !student.id) {
            throw new Error("Student not found");
        }

        // ==============================
        // 2. Update Profile Information
        // ==============================

        currentStudent = student;

        displayStudent(student);

        // Enable editing after successful loading
        editProfileBtn.disabled = false;
    } catch (error) {
        // ==============================
        // 3. Handle API Errors
        // ==============================

        console.error("Error loading profile:", error);

        currentStudent = null;

        // Clear old profile information
        profileName.textContent = "Unable to load profile";
        profileFullName.textContent = "-";
        profileEmail.textContent = "-";
        profileStudentId.textContent = "-";

        editProfileBtn.disabled = true;

        // Create error message
        const errorBox = document.createElement("div");

        errorBox.id = "profileError";
        errorBox.className = "dashboard-error";

        errorBox.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>

            <h3>Unable to load profile</h3>

            <p>
                We couldn't load your profile information.
                Please try again.
            </p>

            <button id="retryProfileBtn" type="button">
                <i class="fa-solid fa-rotate-right"></i>
                Try Again
            </button>
        `;

        // Display error after the profile card
        const profileCard = document.querySelector(".profile-card");

        profileCard.insertAdjacentElement("afterend", errorBox);

        // ==============================
        // 4. Retry Loading Profile
        // ==============================

        const retryProfileBtn = document.getElementById("retryProfileBtn");

        retryProfileBtn.addEventListener("click", function () {
            retryProfileBtn.disabled = true;
            retryProfileBtn.textContent = "Loading...";

            loadProfile();
        });
    }
}

// ==============================
// Open Modal
// ==============================

function openModal() {
    if (!currentStudent) {
        return;
    }

    editFullName.value = currentStudent.fullName;
    editEmail.value = currentStudent.email;

    modalMessage.textContent = "";
    modalMessage.className = "modal-message";

    editProfileModal.hidden = false;

    editFullName.focus();
}

// ==============================
// Close Modal
// ==============================

function closeModal() {
    editProfileModal.hidden = true;

    modalMessage.textContent = "";
    modalMessage.className = "modal-message";
}

// ==============================
// Modal Events
// ==============================

editProfileBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelModalBtn.addEventListener("click", closeModal);

// Close when clicking outside the modal

editProfileModal.addEventListener("click", function (event) {
    if (event.target === editProfileModal) {
        closeModal();
    }
});

// Close with Escape key

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !editProfileModal.hidden) {
        closeModal();
    }
});

// ==============================
// Show Modal Message
// ==============================

function showMessage(message, type) {
    modalMessage.textContent = message;
    modalMessage.className = "modal-message " + type;
}

// ==============================
// Save Profile Changes
// ==============================

editProfileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!session || !currentStudent) {
        return;
    }

    const fullName = editFullName.value.trim();
    const email = editEmail.value.trim().toLowerCase();

    // ==============================
    // 1. Validate Full Name
    // ==============================

    if (fullName.split(/\s+/).length < 2) {
        showMessage("Please enter your full name.", "error");
        return;
    }

    // ==============================
    // 2. Validate Email
    // ==============================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    // ==============================
    // 3. Disable Save Button
    // ==============================

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    try {
        // ==============================
        // 4. Check if Email Already Exists
        // ==============================

        const students = await getStudents();

        const emailExists = students.some(function (student) {
            return student.email.toLowerCase() === email && student.id !== session.id;
        });

        if (emailExists) {
            showMessage("This email is already registered.", "error");
            return;
        }

        // ==============================
        // 5. Update Student in API
        // ==============================

        const updatedStudent = await updateStudent(session.id, {
            fullName: fullName,
            email: email,
        });

        currentStudent = updatedStudent;

        // ==============================
        // 6. Update Profile Information
        // ==============================

        displayStudent(updatedStudent);

        // ==============================
        // 7. Update Session
        // ==============================

        const updatedSession = {
            ...session,
            name: updatedStudent.fullName,
            email: updatedStudent.email,
        };

        if (localStorage.getItem("studentSession")) {
            localStorage.setItem("studentSession", JSON.stringify(updatedSession));
        } else {
            sessionStorage.setItem("studentSession", JSON.stringify(updatedSession));
        }

        session.name = updatedStudent.fullName;
        session.email = updatedStudent.email;

        // ==============================
        // 8. Close Modal
        // ==============================

        closeModal();
    } catch (error) {
        console.error("Error updating profile:", error);

        showMessage("Something went wrong. Please try again.", "error");
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = "Save Changes";
    }
});

// ==============================
// Logout
// ==============================

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("studentSession");
        sessionStorage.removeItem("studentSession");

        window.location.href = "./index.html";
    });
}

// ==============================
// Initialize
// ==============================

if (session) {
    loadProfile();
}
