// Main application module
import { initRouter } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderAbout } from "./views/about.js";
import { closeModal, showModal } from "./utils/modal.js";

// Initialize the router with routes
const routes = {
  home: renderHome,
  about: renderAbout,
  "": renderHome, // Default route
};

// Initialize the application
function initApp() {
  // Initialize the router
  initRouter(routes);

  // Close modal when clicking the close button or outside the modal
  const closeBtn = document.querySelector(".close-btn");
  const modal = document.getElementById("modal");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Navigation button click handlers
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      window.history.pushState({}, "", `#${view}`);
      routes[view]();
      updateActiveNav(btn);
    });
  });
}

// Update active navigation button
function updateActiveNav(activeBtn) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn === activeBtn);
  });
}

// Initialize the app when the DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Export for use in other modules
window.showModal = showModal;
window.closeModal = closeModal;
