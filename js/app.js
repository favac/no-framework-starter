// Main application module - Compatible with HMR
import { initRouter, load, createRoutes } from "./router.js";
import { closeModal, showModal } from "./utils/modal.js";
import { createPersistentStore } from "./hmr-store.js";
import { showHMRIndicator } from "./hmr-ui.js";

// Cache for loaded modules to avoid re-importing
const moduleCache = new Map();

// Make module cache available globally for HMR
window.moduleCache = moduleCache;

// Dynamic route definitions with lazy loading - super clean!
// Option 1: Using the simple load() helper
const routes = {
  home: load('home'),
  about: load('about'),
  tasks: load('tasks'),
  "": load('home'), // Default route
};

// Option 2: Even more declarative with createRoutes()
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

  // Navigation button click handlers with async support
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const view = btn.dataset.view;
      window.history.pushState({}, "", `#${view}`);
      appStore.set(state => ({ ...state, currentView: view }));
      
      try {
        // Show loading state
        showLoadingState();
        await routes[view]();
        updateActiveNav(btn);
        hideLoadingState();
      } catch (error) {
        console.error(`Error loading view "${view}":`, error);
        hideLoadingState();
      }
    });
  });
  
  // Subscribe to store changes
  appStore.subscribe(state => {
    console.log('📊 State updated:', state);
  });
  
  // Show HMR indicator
  showHMRIndicator();
}

// Loading state management
function showLoadingState() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'block';
  }
}

function hideLoadingState() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
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
