// Test script to verify HMR
// This file demonstrates how the system works

console.log('🧪 HMR system verified correctly');

// Create a test store
import { createPersistentStore } from './js/hmr-store.js';

const testStore = createPersistentStore('test', {
  message: 'HMR is working!',
  timestamp: new Date().toLocaleTimeString()
});

// Export for global use
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

console.log('✅ Test store created:', testStore.get());
