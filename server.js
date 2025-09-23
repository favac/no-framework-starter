const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mime = require('mime-types');

const PORT = process.env.PORT || 3000;

// Estado del servidor HMR
const clients = new Set();
const moduleCache = new Map();

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  // Parsear URL para remover query parameters
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
  const filePath = path.join(__dirname, pathname);
  
  console.log(`Solicitando: ${req.url} -> ${pathname} -> ${filePath}`);
  
  // Seguridad: no permitir salir del directorio
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        res.statusCode = 500;
        res.end('Server error');
      }
      return;
    }

    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Headers CORS para módulos ES6
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Inyectar cliente HMR en HTML
    if (pathname.endsWith('.html')) {
      const hmrScript = `
        <script>
          ${getHMRClientCode()}
        </script>
      `;
      data = data.toString().replace('</body>', hmrScript + '</body>');
    }
    
    // Inyectar HMR automático en archivos JS de vistas
    if (pathname.includes('/views/') && pathname.endsWith('.js')) {
      let jsContent = data.toString();
      
      // Detectar función de render exportada
      const renderFunctionMatch = jsContent.match(/export\s+function\s+(render\w+)/);
      if (renderFunctionMatch) {
        const functionName = renderFunctionMatch[1];
        const viewName = pathname.split('/').pop().replace('.js', '');
        
        // Detectar stores en el archivo
        const storeMatches = jsContent.match(/const\s+(\w*Store)\s*=/g) || [];
        const storeNames = storeMatches.map(match => {
          const storeName = match.match(/const\s+(\w*Store)/)[1];
          return storeName;
        });
        
        // Inyectar código HMR automático al final del archivo
        const hmrCode = `

// 🔥 HMR Auto-injected - Código automático para Hot Module Replacement
if (typeof window !== "undefined") {
  window.__HMR_VIEWS__ = window.__HMR_VIEWS__ || {};
  window.__HMR_VIEWS__["${viewName}"] = ${functionName};
  
  // Auto-suscribir stores detectados
  ${storeNames.map(storeName => `
  if (typeof ${storeName} !== 'undefined') {
    ${storeName}.subscribe(() => ${functionName}());
  }`).join('')}
}`;
        jsContent += hmrCode;
        data = Buffer.from(jsContent);
      }
    }
    
    res.end(data);
  });
});

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente HMR conectado');
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Cliente HMR desconectado');
  });
  
  ws.on('error', (error) => {
    console.error('Error WebSocket:', error);
    clients.delete(ws);
  });
});

// Sistema de HMR
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Monitorear cambios en archivos
const watcher = chokidar.watch([
  '**/*.js',
  '**/*.css',
], {
  ignored: /node_modules|\.git/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`Archivo cambiado: ${filePath}`);
  
  const ext = path.extname(filePath);
  const relativePath = path.relative(__dirname, filePath);
  const webPath = '/' + relativePath.replace(/\\/g, '/');
  
  console.log(`Enviando actualización para: ${webPath}`);
  
  if (ext === '.js') {
    // Invalidar módulo en caché
    moduleCache.delete(webPath);
    
    broadcast({
      type: 'hmr:update',
      module: webPath,
      timestamp: Date.now()
    });
  } else if (ext === '.css') {
    broadcast({
      type: 'css:update',
      url: webPath,
      timestamp: Date.now()
    });
  } else if (ext === '.html') {
    broadcast({
      type: 'full-reload',
      timestamp: Date.now()
    });
  }
});

// Código del cliente HMR
function getHMRClientCode() {
  return `
(function() {
  const WS_URL = 'ws://localhost:${PORT}';
  let ws;
  let reconnectTimer;
  
  // Estado global para HMR
  window.__HMR_STATE__ = window.__HMR_STATE__ || {
    modules: new Map(),
    stores: new Map()
  };
  
  // Array para funciones de limpieza
  window.__HMR_CLEANUP__ = window.__HMR_CLEANUP__ || [];
  
  function connect() {
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('🔥 HMR conectado');
      clearTimeout(reconnectTimer);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleHMRMessage(data);
    };
    
    ws.onclose = () => {
      console.log('🔥 HMR desconectado, reconectando...');
      reconnectTimer = setTimeout(connect, 1000);
    };
    
    ws.onerror = (error) => {
      console.error('HMR error:', error);
    };
  }
  
  function handleHMRMessage(data) {
    switch (data.type) {
      case 'hmr:update':
        updateModule(data.module);
        break;
      case 'css:update':
        updateCSS(data.url);
        break;
      case 'full-reload':
        window.location.reload();
        break;
    }
  }
  
  function updateCSS(url) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      if (link.href.includes(url)) {
        const newLink = link.cloneNode();
        newLink.href = url + '?t=' + Date.now();
        link.parentNode.insertBefore(newLink, link);
        link.remove();
      }
    });
  }
  
  async function updateModule(moduleId) {
    try {
      console.log('🔄 Actualizando módulo:', moduleId);
      
      // Guardar estado antes de recargar
      saveState();
      
      // Recargar módulo
      const moduleUrl = moduleId + '?t=' + Date.now();
      const response = await fetch(moduleUrl);
      const code = await response.text();
      
      // Ejecutar nuevo código
      executeModule(moduleId, code);
      
      console.log('✅ Módulo actualizado:', moduleId);
    } catch (error) {
      console.error('❌ Error actualizando módulo:', error);
    }
  }
  
  function saveState() {
    // Guardar estado de stores
    if (window.stores) {
      Object.keys(window.stores).forEach(name => {
        window.__HMR_STATE__.stores.set(name, window.stores[name].get());
      });
    }
  }
  
  function executeModule(moduleId, code) {
    try {
      console.log('🔄 Ejecutando limpieza para:', moduleId);
      
      // Ejecutar funciones de limpieza
      if (window.__HMR_CLEANUP__ && window.__HMR_CLEANUP__.length > 0) {
        window.__HMR_CLEANUP__.forEach(function(cleanup) {
          try {
            cleanup();
          } catch (e) {
            console.warn('Error en cleanup:', e);
          }
        });
        window.__HMR_CLEANUP__ = [];
      }
      
      // Eliminar script anterior si existe
      const oldScript = document.querySelector('script[data-module="' + moduleId + '"]');
      if (oldScript) oldScript.remove();
      
      // Crear nuevo script con URL correcta
      const script = document.createElement('script');
      script.type = 'module';
      script.src = moduleId + '?t=' + Date.now();
      script.setAttribute('data-module', moduleId);
      
      // Manejar carga exitosa
      script.onload = function() {
        console.log('✅ Módulo recargado:', moduleId);
        // Restaurar estado y re-renderizar después de la carga
        setTimeout(function() {
          if (window.__HMR_STATE__ && window.__HMR_STATE__.stores && window.__HMR_STATE__.stores.size > 0) {
            window.__HMR_STATE__.stores.forEach(function(state, name) {
              if (window.stores && window.stores[name]) {
                window.stores[name].set(state);
              }
            });
          }
          
          // Re-ejecutar la función de render automáticamente
          if (moduleId.includes('/views/')) {
            const currentHash = window.location.hash.replace('#', '') || 'home';
            
            // Intentar múltiples métodos para re-renderizar
            setTimeout(() => {
              console.log('🔄 Re-renderizando vista:', currentHash);
              
              // Método 1: Usar registro directo de vistas
              if (window.__HMR_VIEWS__ && window.__HMR_VIEWS__[currentHash]) {
                try {
                  window.__HMR_VIEWS__[currentHash]();
                  console.log('✅ Vista re-renderizada via __HMR_VIEWS__');
                  return;
                } catch (error) {
                  console.warn('⚠️ Error en __HMR_VIEWS__:', error);
                }
              }
              
              // Método 2: Usar routes como fallback
              if (window.routes && window.routes[currentHash]) {
                try {
                  window.routes[currentHash]();
                  console.log('✅ Vista re-renderizada via routes');
                } catch (error) {
                  console.error('❌ Error al re-renderizar vista:', error);
                }
              }
            }, 100); // Delay más largo para asegurar carga completa
          }
        }, 0);
      };
      
      // Manejar errores
      script.onerror = function(error) {
        console.error('❌ Error al recargar módulo:', moduleId, error);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Error en executeModule:', error);
    }
  }
  
  // Inicializar conexión
  connect();
})();
  `;
}

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor HMR ejecutándose en http://localhost:${PORT}`);
  console.log('📁 Monitoreando cambios en archivos...');
});

// Manejo de cierre
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  watcher.close();
  wss.close();
  server.close();
});
