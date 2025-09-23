// Store system for HMR - Compatible with your h() helper

// Global store for HMR
window.stores = window.stores || {};

/**
 * Creates a reactive store that persists during HMR
 * @param {string} name - Unique store name
 * @param {*} initialState - Initial state
 * @returns {Object} Store with get, set, update, subscribe methods
 */
export function createPersistentStore(name, initialState) {
  // If a store with this name already exists, use it
  if (window.stores[name]) {
    return window.stores[name];
  }

  // If there's saved state from HMR, use it
  const savedState = window.__HMR_STATE__?.stores?.get(name);
  const state = savedState !== undefined ? savedState : initialState;

  // Create store similar to h.js but persistent
  let currentState = state;
  const listeners = new Set();

  const store = {
    get: () => currentState,
    
    set: (next) => {
      const value = typeof next === 'function' ? next(currentState) : next;
      if (value === currentState) return;
      currentState = value;
      listeners.forEach(l => l(currentState));
    },
    
    update: (patch) => {
      const value = typeof patch === 'function' ? patch(currentState) : patch;
      currentState = { ...currentState, ...value };
      listeners.forEach(l => l(currentState));
    },
    
    subscribe: (fn) => {
      // Automatic cleanup system for HMR
      const wrappedFn = (state) => {
        try {
          fn(state);
        } catch (error) {
          console.warn('Error in subscription:', error);
        }
      };
      
      listeners.add(wrappedFn);
      
      // Register for automatic cleanup in HMR
      if (window.__HMR_CLEANUP__) {
        const unsubscribe = () => listeners.delete(wrappedFn);
        window.__HMR_CLEANUP__.push(unsubscribe);
        return unsubscribe;
      }
      
      return () => listeners.delete(wrappedFn);
    },
    
    // Additional method to clear listeners in development
    _clearListeners: () => {
      listeners.clear();
    }
  };

  // Save in global stores for HMR
  window.stores[name] = store;
  
  return store;
}

/**
 * Hook to use with components that need re-render on changes
 * @param {string} storeName - Store name
 * @param {Function} renderFn - Function that renders the component
 * @returns {Object} Store and forceUpdate function
 */
export function useStore(storeName, renderFn) {
  const store = window.stores[storeName];
  if (!store) {
    throw new Error(`Store "${storeName}" not found`);
  }

  let forceUpdate = () => {};
  
  if (renderFn) {
    forceUpdate = () => {
      const newElement = renderFn(store.get());
      // Here you could use your mount/update system
      // This is a placeholder that can be adapted
      if (window.__HMR_UPDATE_COMPONENT__) {
        window.__HMR_UPDATE_COMPONENT__(newElement);
      }
    };
    
    // Subscribe to changes
    const unsubscribe = store.subscribe(forceUpdate);
    
    // Clean up subscription when component unmounts
    if (window.__HMR_CLEANUP__) {
      window.__HMR_CLEANUP__.push(unsubscribe);
    }
  }
  
  return { store, forceUpdate };
}

/**
 * Simple component system with HMR
 */
export class HMRComponent {
  constructor(name, renderFn) {
    this.name = name;
    this.renderFn = renderFn;
    this.element = null;
    this.cleanup = [];
    
    // Register for HMR
    if (!window.__HMR_COMPONENTS__) {
      window.__HMR_COMPONENTS__ = new Map();
    }
    window.__HMR_COMPONENTS__.set(name, this);
  }
  
  render(container, props = {}) {
    // Clean up previous subscriptions
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    
    // Render
    this.element = this.renderFn(props);
    
    if (container) {
      container.innerHTML = '';
      container.appendChild(this.element);
    }
    
    return this.element;
  }
  
  update(props = {}) {
    return this.render(null, props);
  }
  
  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    
    if (window.__HMR_COMPONENTS__) {
      window.__HMR_COMPONENTS__.delete(this.name);
    }
  }
}

// Component update system for HMR
window.__HMR_UPDATE_COMPONENT__ = (newElement) => {
  // Placeholder - will be implemented according to your structure
  console.log('Component updated:', newElement);
};

window.__HMR_CLEANUP__ = [];
