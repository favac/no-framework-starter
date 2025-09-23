// Sistema de stores para HMR - Compatible con tu helper h()

// Store global para HMR
window.stores = window.stores || {};

/**
 * Crea un store reactivo que persiste durante HMR
 * @param {string} name - Nombre único del store
 * @param {*} initialState - Estado inicial
 * @returns {Object} Store con métodos get, set, update, subscribe
 */
export function createPersistentStore(name, initialState) {
  // Si ya existe un store con este nombre, usarlo
  if (window.stores[name]) {
    return window.stores[name];
  }

  // Si hay estado guardado de HMR, usarlo
  const savedState = window.__HMR_STATE__?.stores?.get(name);
  const state = savedState !== undefined ? savedState : initialState;

  // Crear store similar al de h.js pero persistente
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
      // Sistema automático de limpieza para HMR
      const wrappedFn = (state) => {
        try {
          fn(state);
        } catch (error) {
          console.warn('Error en suscripción:', error);
        }
      };
      
      listeners.add(wrappedFn);
      
      // Registrar para limpieza automática en HMR
      if (window.__HMR_CLEANUP__) {
        const unsubscribe = () => listeners.delete(wrappedFn);
        window.__HMR_CLEANUP__.push(unsubscribe);
        return unsubscribe;
      }
      
      return () => listeners.delete(wrappedFn);
    },
    
    // Método adicional para limpiar listeners en desarrollo
    _clearListeners: () => {
      listeners.clear();
    }
  };

  // Guardar en stores globales para HMR
  window.stores[name] = store;
  
  return store;
}

/**
 * Hook para usar con componentes que necesitan re-render en cambios
 * @param {string} storeName - Nombre del store
 * @param {Function} renderFn - Función que renderiza el componente
 * @returns {Object} Store y función forceUpdate
 */
export function useStore(storeName, renderFn) {
  const store = window.stores[storeName];
  if (!store) {
    throw new Error(`Store "${storeName}" no encontrado`);
  }

  let forceUpdate = () => {};
  
  if (renderFn) {
    forceUpdate = () => {
      const newElement = renderFn(store.get());
      // Aquí podrías usar tu sistema de mount/update
      // Esto es un placeholder que se puede adaptar
      if (window.__HMR_UPDATE_COMPONENT__) {
        window.__HMR_UPDATE_COMPONENT__(newElement);
      }
    };
    
    // Suscribirse a cambios
    const unsubscribe = store.subscribe(forceUpdate);
    
    // Limpiar suscripción cuando el componente se desmonte
    if (window.__HMR_CLEANUP__) {
      window.__HMR_CLEANUP__.push(unsubscribe);
    }
  }
  
  return { store, forceUpdate };
}

/**
 * Sistema simple de componentes con HMR
 */
export class HMRComponent {
  constructor(name, renderFn) {
    this.name = name;
    this.renderFn = renderFn;
    this.element = null;
    this.cleanup = [];
    
    // Registrar para HMR
    if (!window.__HMR_COMPONENTS__) {
      window.__HMR_COMPONENTS__ = new Map();
    }
    window.__HMR_COMPONENTS__.set(name, this);
  }
  
  render(container, props = {}) {
    // Limpiar suscripciones anteriores
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    
    // Renderizar
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

// Sistema de actualización de componentes para HMR
window.__HMR_UPDATE_COMPONENT__ = (newElement) => {
  // Placeholder - se implementará según tu estructura
  console.log('Componente actualizado:', newElement);
};

window.__HMR_CLEANUP__ = [];
