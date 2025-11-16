/**
 * @fileoverview Simple client-side router with async support and lazy-loaded views.
 * Exposes helpers to create lazy routes, bulk route maps, initialize routing, and navigate.
 */

// Helper function for lazy loading routes
/**
 * Creates a lazy route handler that dynamically imports a view module and executes
 * its render function. Optionally accepts a custom function name to invoke.
 * Uses a global `window.moduleCache` Map if present to avoid re-importing.
 *
 * @param {string} viewName - Logical view name (e.g., "home").
 * @param {string} viewPath - Module path to import (e.g., "./views/home.js").
 * @param {string|null} [functionName=null] - Optional render function to call from the module.
 * @returns {() => Promise<void>} An async route handler that imports and invokes the render function.
 */
export function createLazyRoute(viewName, viewPath, functionName = null) {
  // If no function name provided, derive it from viewName (e.g., 'home' -> 'renderHome')
  const renderFunction = functionName || `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
  
  return async () => {
    // Ensure we work with a Map instance for caching
    const cache = window.moduleCache instanceof Map
      ? window.moduleCache
      : (window.moduleCache = new Map());
    
    if (!cache.has(viewName)) {
      try {
        const module = await import(viewPath);
        cache.set(viewName, module[renderFunction]);
      } catch (error) {
        console.error(`Error loading view "${viewName}" from "${viewPath}":`, error);
        throw error;
      }
    }
    
    return cache.get(viewName)();
  };
}

// Even more convenient helper for standard view structure
/**
 * Convenience helper that builds a lazy route for a view in `./views/<name>.js`.
 *
 * @param {string} viewName - View name (e.g., "home").
 * @param {string|null} [customPath=null] - Optional custom module path.
 * @returns {() => Promise<void>} Lazy route handler.
 */
export function load(viewName, customPath = null) {
  const viewPath = customPath || `./views/${viewName}.js`;
  return createLazyRoute(viewName, viewPath);
}

// Helper to create multiple routes at once
/**
 * @typedef {Object<string, string|{view: string, path?: string, function?: string}>} RouteDefinitions
 * A map from route name to either a simple view name string or a config object.
 */
/**
 * Creates a routes map from a route definitions object.
 *
 * Simple form: `{ home: 'home' }` becomes `{ home: () => import('./views/home.js')... }`.
 * Advanced form supports custom path and render function name.
 *
 * @param {RouteDefinitions} routeDefinitions - Route configuration map.
 * @returns {Record<string, () => Promise<void>>} A map of route handlers by route name.
 */
export function createRoutes(routeDefinitions) {
  const routes = {};
  
  for (const [routeName, config] of Object.entries(routeDefinitions)) {
    if (typeof config === 'string') {
      // Simple case: route name -> view name
      routes[routeName] = load(config);
    } else if (config.view) {
      // Advanced case: custom configuration
      routes[routeName] = createLazyRoute(
        config.view, 
        config.path || `./views/${config.view}.js`,
        config.function
      );
    }
  }
  
  return routes;
}

// Initialize the router: loads the initial route and handles browser navigation events.
/**
 * Initializes the router: loads the initial route and handles browser navigation events.
 *
 * @param {Record<string, () => Promise<void>>} routes - Route handlers keyed by route name.
 * @returns {void}
 */
export function initRouter(routes) {
  // Handle initial route
  const initialRoute = window.location.hash.replace("#", "") || "home";
  if (routes[initialRoute]) {
    handleRouteAsync(routes[initialRoute], initialRoute);
  }

  // Handle browser back/forward
  window.addEventListener("popstate", () => {
    const route = window.location.hash.replace("#", "") || "home";
    if (routes[route]) {
      handleRouteAsync(routes[route], route);
    }
  });
}

// Handle async route loading with loading state
/**
 * Handles a route transition with loading state and navigation updates.
 *
 * @param {() => (void|Promise<void>)} routeHandler - Handler to execute for the route.
 * @param {string} routeName - The name of the route being navigated to.
 * @returns {Promise<void>} Resolves when the handler completes.
 */
async function handleRouteAsync(routeHandler, routeName) {
  try {
    // Show loading state
    showLoadingState();
    
    // Execute route handler (could be sync or async)
    await routeHandler();
    
    // Update navigation after successful load
    updateActiveNav(routeName);
    
    // Hide loading state
    hideLoadingState();
  } catch (error) {
    console.error(`Error loading route "${routeName}":`, error);
    hideLoadingState();
    // Could show error state here
  }
}

// Simple loading state management
/**
 * Shows the global loading indicator element if present.
 * @returns {void}
 */
function showLoadingState() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'block';
  }
}

/**
 * Hides the global loading indicator element if present.
 * @returns {void}
 */
function hideLoadingState() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

// Update active navigation
/**
 * Updates navigation buttons by toggling the `active` class matching the current route name.
 *
 * @param {string} route - Current route name.
 * @returns {void}
 */
function updateActiveNav(route) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === route);
  });
}

// Navigate to a specific route
/**
 * Navigates to a route by updating the hash and dispatching a `popstate` event.
 *
 * @param {string} route - Route name to navigate to.
 * @returns {void}
 */
export function navigateTo(route) {
  if (window.location.hash.replace("#", "") !== route) {
    window.history.pushState({}, "", `#${route}`);
    window.dispatchEvent(new Event("popstate"));
  }
}
