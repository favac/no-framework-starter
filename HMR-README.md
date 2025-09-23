# 🚀 Servidor HMR para No-Framework

Este proyecto incluye un servidor de desarrollo con **Hot Module Replacement (HMR)** que permite ver cambios en tiempo real sin perder el estado de la aplicación.

## 📋 Características

- ✅ **HMR completo** para JavaScript y CSS
- ✅ **Estado persistente** durante recargas
- ✅ **WebSocket en tiempo real** para actualizaciones
- ✅ **Compatible con tu helper `h()`**
- ✅ **Stores persistentes** con `createPersistentStore()`
- ✅ **Sin configuración compleja** - funciona out-of-the-box

## 🚀 Cómo usar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 3. Ver HMR en acción

1. Abre `http://localhost:3000` en tu navegador
2. Incrementa el contador en la página de inicio
3. Edita `js/views/home.js` (cambia algún texto)
4. Guarda el archivo
5. Verás los cambios **sin perder el estado del contador** 🔥

## 🏗️ Estructura de archivos

```
├── server.js          # Servidor HMR con WebSocket
├── js/
│   ├── hmr-store.js   # Sistema de stores para HMR
│   ├── hmr-ui.js      # Indicador visual de HMR
│   └── views/
│       └── home.js    # Ejemplo con store persistente
└── css/
    └── hmr-demo.css   # Estilos para la demo
```

## 📦 API de Stores

### `createPersistentStore(name, initialState)`

Crea un store que persiste durante HMR:

```javascript
import { createPersistentStore } from './js/hmr-store.js';

const myStore = createPersistentStore('counter', {
  count: 0,
  message: 'Hello HMR!'
});

// Usar el store
myStore.set(state => ({ ...state, count: state.count + 1 }));
myStore.subscribe(state => console.log('Estado:', state));
```

### Ejemplo completo con `h()`

```javascript
import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";

const store = createPersistentStore('myComponent', { count: 0 });

export function renderComponent() {
  const state = store.get();
  
  const element = h("div", {}, [
    h("h1", {}, `Contador: ${state.count}`),
    h("button", {
      onclick: () => store.set(s => ({ ...s, count: s.count + 1 }))
    }, "Incrementar")
  ]);
  
  mount(document.getElementById("app"), element);
  
  // Re-render automático
  const unsubscribe = store.subscribe(() => renderComponent());
  
  // Limpiar al recargar
  if (window.__HMR_CLEANUP__) {
    window.__HMR_CLEANUP__.push(unsubscribe);
  }
}
```

## 🎯 Qué se actualiza sin refresh

- **JavaScript**: Módulos ES6 se recargan preservando estado
- **CSS**: Estilos se aplican al instante
- **HTML**: Requiere refresh completo (por diseño)
- **Stores**: Estado persistente entre recargas

## 🔧 Personalización

### Cambiar puerto

```bash
PORT=8080 npm run dev
```

### Monitorear archivos adicionales

Edita `server.js` y agrega patrones a `chokidar.watch()`:

```javascript
const watcher = chokidar.watch([
  '**/*.js',
  '**/*.css',
  '**/*.html',
  '**/*.json'  // Agregar JSON
], {
  ignored: /node_modules|\\.git/,
  persistent: true
});
```

## 🐛 Solución de problemas

### HMR no funciona

1. Verifica que el servidor está corriendo en `localhost:3000`
2. Abre la consola del navegador - deberías ver "🔥 HMR conectado"
3. Verifica que WebSocket está funcionando en `ws://localhost:3000`

### Estado no se preserva

1. Asegúrate de usar `createPersistentStore()` en lugar de `createStore()`
2. Verifica que el nombre del store es único
3. Usa `window.__HMR_CLEANUP__` para limpiar suscripciones

### Errores de CORS

El servidor está configurado para permitir todos los orígenes en desarrollo.

## 📚 Cómo funciona

1. **Servidor**: Usa `chokidar` para detectar cambios en archivos
2. **WebSocket**: Envía actualizaciones a todos los clientes conectados
3. **Cliente**: Recibe actualizaciones y aplica cambios sin recargar
4. **Stores**: Guardan estado en `window.__HMR_STATE__` entre recargas
5. **Cleanup**: Limpia suscripciones antiguas al recargar módulos

## 🎉 ¡Listo!

Tu aplicación no-framework ahora tiene HMR completo. ¡Edita los archivos y mira los cambios en tiempo real!
