// Simple client-side router with async support

// Helper function for lazy loading routes
export function createLazyRoute(viewName, viewPath, functionName = null) {
  // If no function name provided, derive it from viewName (e.g., 'home' -> 'renderHome')
  const renderFunction = functionName || `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
  
  return async () => {
    // Use global moduleCache if available, otherwise create local cache
    const cache = window.moduleCache || new Map();
    
    if (!cache.has(viewName)) {
      try {
        const module = await import(viewPath);
        cache.set(viewName, module[renderFunction]);
        
        // Store in global cache if available
        if (window.moduleCache) {
          window.moduleCache.set(viewName, module[renderFunction]);
        }
      } catch (error) {
        console.error(`Error loading view "${viewName}" from "${viewPath}":`, error);
        throw error;
      }
    }
    
    return cache.get(viewName)();
  };
}

// Even more convenient helper for standard view structure
export function load(viewName, customPath = null) {
  const viewPath = customPath || `./views/${viewName}.js`;
  return createLazyRoute(viewName, viewPath);
}

// Helper to create multiple routes at once
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
