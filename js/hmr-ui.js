// UI para mostrar estado de HMR

export function showHMRIndicator() {
  const indicator = document.getElementById('hmr-indicator');
  if (indicator) {
    indicator.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 3000);
  }
}

// Mostrar indicador cuando HMR está activo
if (typeof window !== 'undefined') {
  // Verificar si estamos en modo desarrollo con HMR
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showHMRIndicator);
    } else {
      showHMRIndicator();
    }
    
    // También mostrar cuando se recibe una actualización HMR
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
