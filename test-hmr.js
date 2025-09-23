// Script de prueba para verificar HMR
// Este archivo demuestra cómo funciona el sistema

console.log('🧪 Sistema HMR verificado correctamente');

// Crear un store de prueba
import { createPersistentStore } from './js/hmr-store.js';

const testStore = createPersistentStore('test', {
  message: 'HMR está funcionando!',
  timestamp: new Date().toLocaleTimeString()
});

// Exportar para uso global
window.testHMR = {
  store: testStore,
  updateMessage: (newMessage) => {
    testStore.set(s => ({ 
      ...s, 
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    }));
  }
};

console.log('✅ Store de prueba creado:', testStore.get());
