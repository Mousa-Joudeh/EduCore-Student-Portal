import { getStudents, addStudent } from "./api.js";
// ========================================
// Show / Hide Password
// ========================================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (passwordInput && togglePassword) {
    togglePassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";

            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";

            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");
        }
    });
}

// ========================================
// Validation Functions
// ========================================

function showError(input, errorElement, message) {
    input.classList.add("input-error");

    errorElement.textContent = message;

    errorElement.classList.add("show");
}

function clearError(input, errorElement) {
    input.classList.remove("input-error");

    errorElement.textContent = "";

    errorElement.classList.remove("show");
}

// ========================================
// Session Functions
// ========================================

export function getSession() {
    const localSession = localStorage.getItem("studentSession");
    const sessionSession = sessionStorage.getItem("studentSession");

    const savedSession = localSession || sessionSession;

    if (savedSession) {
        return JSON.parse(savedSession);
    }

    return null;
}

// ========================================
// Protect Private Pages
// ========================================

export function requireLogin() {
    const session = getSession();

    if (!session) {
        window.location.href = "./index.html";
        return null;
    }

    return session;
}

// ========================================
// Protect Authentication Pages
// ========================================

export function redirectIfLoggedIn() {
    const session = getSession();

    if (session) {
        window.location.href = "./dashboard.html";
    }
}

const currentPage = window.location.pathname;

if (currentPage.endsWith("index.html") || currentPage.endsWith("register.html")) {
    redirectIfLoggedIn();
}

// ========================================
// Register
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get input elements
        const fullNameInput = document.getElementById("fullName");
        const emailInput = document.getElementById("email");
        const studentIdInput = document.getElementById("studentId");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        // Get values
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const studentId = studentIdInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Get error elements
        const fullNameError = document.getElementById("fullNameError");

        const emailError = document.getElementById("emailError");

        const studentIdError = document.getElementById("studentIdError");

        const passwordError = document.getElementById("passwordError");

        const confirmPasswordError = document.getElementById("confirmPasswordError");

        // Reset previous errors
        clearError(fullNameInput, fullNameError);
        clearError(emailInput, emailError);
        clearError(studentIdInput, studentIdError);
        clearError(passwordInput, passwordError);
        clearError(confirmPasswordInput, confirmPasswordError);

        let isValid = true;

        // =========================
        // Full Name Validation
        // =========================

        const nameParts = fullName.split(/\s+/);

        if (fullName === "") {
            showError(fullNameInput, fullNameError, "Full name is required.");

            isValid = false;
        } else if (nameParts.length < 2) {
            showError(fullNameInput, fullNameError, "Please enter your first and last name.");

            isValid = false;
        }

        // =========================
        // Email Validation
        // =========================

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === "") {
            showError(emailInput, emailError, "Email is required.");

            isValid = false;
        } else if (!emailPattern.test(email)) {
            showError(
                emailInput,
                emailError,
                "Please enter a valid email, for example: name@email.com",
            );

            isValid = false;
        }

        // =========================
        // Student ID Validation
        // =========================

        const studentIdPattern = /^\d{6}$/;

        if (studentId === "") {
            showError(studentIdInput, studentIdError, "Student ID is required.");

            isValid = false;
        } else if (!studentIdPattern.test(studentId)) {
            showError(studentIdInput, studentIdError, "Student ID must contain exactly 6 numbers.");

            isValid = false;
        }

        // =========================
        // Password Validation
        // =========================

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

        if (password === "") {
            showError(passwordInput, passwordError, "Password is required.");

            isValid = false;
        } else if (!passwordPattern.test(password)) {
            showError(
                passwordInput,
                passwordError,
                "Password must be at least 8 characters and contain letters and numbers.",
            );

            isValid = false;
        }

        // =========================
        // Confirm Password
        // =========================

        if (confirmPassword === "") {
            showError(confirmPasswordInput, confirmPasswordError, "Please confirm your password.");

            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, "Passwords do not match.");

            isValid = false;
        }

        // Stop if validation failed
        if (!isValid) {
            return;
        }

        const students = await getStudents();

        // Check if email already exists
        const emailExists = students.find(function (student) {
            return student.email === email;
        });

        if (emailExists) {
            showError(emailInput, emailError, "This email is already registered.");

            return;
        }

        // Check if Student ID already exists
        const studentIdExists = students.find(function (student) {
            return student.studentId === studentId;
        });

        if (studentIdExists) {
            showError(studentIdInput, studentIdError, "This Student ID is already registered.");

            return;
        }

        const newStudent = {
            fullName: fullName,
            email: email,
            studentId: studentId,
            password: password,
            courseIds: []
        };

        await addStudent(newStudent);

        window.location.href = "./index.html";
    });
}

// ========================================
// Login
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const errorMessage = document.getElementById("errorMessage");

        errorMessage.textContent = "";

        // Check empty fields
        if (email === "" || password === "") {
            errorMessage.textContent = "Please enter your email and password.";

            return;
        }

        // Get students from API
        const students = await getStudents();

        // Find student with matching email and password
        const student = students.find(function (student) {
            return student.email === email && student.password === password;
        });

        // Student not found
        if (!student) {
            errorMessage.textContent = "Invalid email or password.";

            return;
        }

        // Create session data
        const sessionData = {
            id: student.id,
            name: student.fullName,
            email: student.email,
            loginTime: new Date().toISOString(),
        };

        const rememberMe = document.getElementById("rememberMe");

        // Save session
        if (rememberMe.checked) {
            // Remove old session
            sessionStorage.removeItem("studentSession");

            // Save session in Local Storage
            localStorage.setItem("studentSession", JSON.stringify(sessionData));
        } else {
            // Remove old session
            localStorage.removeItem("studentSession");

            // Save session in Session Storage
            sessionStorage.setItem("studentSession", JSON.stringify(sessionData));
        }

        // Redirect to Dashboard
        window.location.href = "./dashboard.html";
    });
}
