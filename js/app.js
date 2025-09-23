// Main application module - Compatible with HMR
import { initRouter } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderAbout } from "./views/about.js";
import { closeModal, showModal } from "./utils/modal.js";
import { createPersistentStore } from "./hmr-store.js";
import { showHMRIndicator } from "./hmr-ui.js";

// Initialize the router with routes
const routes = {
  home: renderHome,
  about: renderAbout,
  "": renderHome, // Default route
};

// Make routes available globally for HMR
window.routes = routes;

// Global application store
export const appStore = createPersistentStore('app', {
  currentView: 'home',
  modalOpen: false,
  count: 0
});

// Initialize the application
function initApp() {
  console.log('🚀 Initializing application...');
  
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
      appStore.set(state => ({ ...state, currentView: view }));
      routes[view]();
      updateActiveNav(btn);
    });
  });
  
  // Subscribe to store changes
  appStore.subscribe(state => {
    console.log('📊 State updated:', state);
  });
  
  // Show HMR indicator
  showHMRIndicator();
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
