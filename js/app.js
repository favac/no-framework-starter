// Main application module
import { initRouter, load, navigateTo } from "./router.js";
import { closeModal, showModal } from "./utils/modal.js";
import { createStore } from "./lib/h.js";

// Dynamic route definitions with lazy loading - super clean!
// Option 1: Using the simple load() helper
const routes = {
  home: load("home"),
  about: load("about"),
  tasks: load("tasks"),
  table: load("table"),
  "": load("home"), // Default route
};

// Option 2: Even more declarative with createRoutes()
// import { createRoutes } from "./router.js";
// const routes = createRoutes({
//   home: 'home',        // route name -> view name
//   about: 'about',
//   "": 'home'           // default route
// });

// Option 3: Advanced configuration (for complex cases)
// const routes = createRoutes({
//   home: { view: 'home' },
//   about: { view: 'about' },
//   profile: {
//     view: 'userProfile',
//     path: './views/user/profile.js',
//     function: 'renderUserProfile'
//   }
// });

// Global application store
export const appStore = createStore({
  currentView: "home",
  modalOpen: false,
  count: 0,
});

// Initialize the application
function initApp() {
  console.log("🚀 Initializing application...");

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

  // Navigation button click handlers using History API
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      navigateTo(view);
      appStore.set((state) => ({ ...state, currentView: view }));
    });
  });

  // Subscribe to store changes
  appStore.subscribe((state) => {
    console.log("📊 State updated:", state);
  });
}

// Loading state management
function showLoadingState() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "block";
  }
}

function hideLoadingState() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "none";
  }
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

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    appStore.subscribe(() => {});
  });
}
