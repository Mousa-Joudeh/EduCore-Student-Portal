// ==============================
// Sidebar Elements
// ==============================

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarOverlay = document.getElementById("sidebarOverlay");

// ==============================
// Open Sidebar
// ==============================

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");

    menuToggle.setAttribute("aria-expanded", "true");
}

// ==============================
// Close Sidebar
// ==============================

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");

    menuToggle.setAttribute("aria-expanded", "false");
}

// ==============================
// Event Listeners
// ==============================

menuToggle.addEventListener("click", openSidebar);

sidebarClose.addEventListener("click", closeSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);

// Close Sidebar with Escape

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSidebar();
    }
});

// Close Sidebar when switching to Desktop

window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});
