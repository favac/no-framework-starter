/**
 * @fileoverview Lifecycle management system for views.
 * Provides hooks like onInit, onMount, onUnmount for view lifecycle management.
 */

/**
 * @typedef {Object} ViewLifecycle
 * @property {() => void|Promise<void>} [onInit] - Called before rendering, ideal for store initialization
 * @property {() => void|Promise<void>} [onMount] - Called after DOM is mounted
 * @property {() => void|Promise<void>} [onUnmount] - Called before view is unmounted
 * @property {() => Node} render - Function that returns the view's DOM content
 */

const activeLifecycles = new Map();

/**
 * Creates a view with lifecycle hooks support.
 *
 * @param {string} viewName - Unique identifier for the view
 * @param {ViewLifecycle} lifecycle - Lifecycle configuration
 * @returns {() => Promise<void>} View render function with lifecycle support
 *
 * @example
 * export const renderTable = createView('table', {
 *   onInit() {
 *     // Initialize store, setup listeners
 *   },
 *   onMount() {
 *     // DOM is ready, bindings are active
 *   },
 *   render() {
 *     return h('div', {}, 'content');
 *   }
 * });
 */
export function createView(viewName, lifecycle) {
  return async function renderView() {
    // Cleanup previous instance if exists
    if (activeLifecycles.has(viewName)) {
      const previous = activeLifecycles.get(viewName);
      if (previous.onUnmount) {
        await previous.onUnmount();
      }
    }

    // Call onInit before rendering
    if (lifecycle.onInit) {
      await lifecycle.onInit();
    }

    // Render the view
    const content = lifecycle.render();

    // Mount to DOM
    const container = document.getElementById("main-content");
    if (!container) {
      throw new Error("main-content container not found");
    }

    // Clear previous content
    container.innerHTML = "";
    container.appendChild(content);

    // Call onMount after DOM is ready
    if (lifecycle.onMount) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await lifecycle.onMount();
    }

    // Store lifecycle for cleanup
    activeLifecycles.set(viewName, lifecycle);
  };
}

/**
 * Manually trigger unmount for a view (useful for cleanup).
 *
 * @param {string} viewName - View identifier
 * @returns {Promise<void>}
 */
export async function unmountView(viewName) {
  if (activeLifecycles.has(viewName)) {
    const lifecycle = activeLifecycles.get(viewName);
    if (lifecycle.onUnmount) {
      await lifecycle.onUnmount();
    }
    activeLifecycles.delete(viewName);
  }
}

/**
 * Get active lifecycle for a view (for debugging).
 *
 * @param {string} viewName - View identifier
 * @returns {ViewLifecycle|undefined}
 */
export function getViewLifecycle(viewName) {
  return activeLifecycles.get(viewName);
}
