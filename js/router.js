// Simple client-side router
export function initRouter(routes) {
  // Handle initial route
  const initialRoute = window.location.hash.replace("#", "") || "home";
  if (routes[initialRoute]) {
    routes[initialRoute]();
    updateActiveNav(initialRoute);
  }

  // Handle browser back/forward
  window.addEventListener("popstate", () => {
    const route = window.location.hash.replace("#", "") || "home";
    if (routes[route]) {
      routes[route]();
      updateActiveNav(route);
    }
  });
}

// Update active navigation
function updateActiveNav(route) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === route);
  });
}

// Navigate to a specific route
export function navigateTo(route) {
  if (window.location.hash.replace("#", "") !== route) {
    window.history.pushState({}, "", `#${route}`);
    window.dispatchEvent(new Event("popstate"));
  }
}
