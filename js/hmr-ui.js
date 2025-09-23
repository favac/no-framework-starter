// UI to show HMR status

export function showHMRIndicator() {
  const indicator = document.getElementById('hmr-indicator');
  if (indicator) {
    indicator.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 3000);
  }
}

// Show indicator when HMR is active
if (typeof window !== 'undefined') {
  // Check if we're in development mode with HMR
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showHMRIndicator);
    } else {
      showHMRIndicator();
    }
    
    // Also show when receiving an HMR update
    if (window.__HMR_STATE__) {
      const originalHandleMessage = window.handleHMRMessage;
      window.handleHMRMessage = function(data) {
        showHMRIndicator();
        if (originalHandleMessage) {
          originalHandleMessage(data);
        }
      };
    }
  }
}
