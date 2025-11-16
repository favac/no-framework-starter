# View Lifecycle System

Sistema de lifecycle hooks para vistas que garantiza la correcta inicialización, montaje y limpieza de componentes.

## Motivación

En aplicaciones con bindings reactivos, es crucial que:

1. Los stores estén inicializados antes del render
2. Los bindings reactivos se registren después de que el DOM esté montado
3. Los listeners y subscripciones se limpien al desmontar la vista

El sistema de lifecycle resuelve estos problemas proporcionando hooks predecibles.

## API

### `createView(viewName, lifecycle)`

Crea una vista con soporte para lifecycle hooks.

**Parámetros:**

- `viewName` (string): Identificador único de la vista
- `lifecycle` (ViewLifecycle): Configuración con hooks y función render

**Retorna:** Función async que renderiza la vista con lifecycle completo

### Lifecycle Hooks

#### `onInit()`

- **Cuándo:** Antes de renderizar el DOM
- **Uso:** Inicializar stores, preparar datos, setup inicial
- **Ejemplo:**

```javascript
onInit() {
  const state = myStore.get();
  if (!state.data) {
    myStore.update(() => ({ data: loadInitialData() }));
  }
}
```

#### `render()`

- **Cuándo:** Después de `onInit`, antes de montar al DOM
- **Uso:** Retornar el árbol de DOM a renderizar
- **Retorna:** Node (elemento DOM)
- **Ejemplo:**

```javascript
render() {
  return h('div', { class: 'page' }, [
    h('h1', {}, 'Title'),
    h.map('items', (item) => h('div', {}, item.name), { store: myStore })
  ]);
}
```

#### `onMount()`

- **Cuándo:** Después de que el DOM está montado y los bindings están activos
- **Uso:** Interactuar con el DOM, iniciar animaciones, focus en elementos
- **Ejemplo:**

```javascript
onMount() {
  console.log('✅ View mounted');
  document.querySelector('input')?.focus();
}
```

#### `onUnmount()` (opcional)

- **Cuándo:** Antes de desmontar la vista
- **Uso:** Limpiar listeners, cancelar subscripciones, liberar recursos
- **Ejemplo:**

```javascript
onUnmount() {
  clearInterval(this.intervalId);
  this.subscription?.unsubscribe();
}
```

## Ejemplo Completo

```javascript
import { h, createStore } from "../lib/h.js";
import { createView } from "../lib/lifecycle.js";

const tableStore = createStore({
  sortKey: "name",
  sortDirection: "asc",
  rows: [],
  sortedRows: [],
});

function getSortedRows(rows, sortKey, sortDirection) {
  const sorted = [...rows].sort((a, b) => {
    if (a[sortKey] === b[sortKey]) return 0;
    return a[sortKey] > b[sortKey] ? 1 : -1;
  });
  if (sortDirection === "desc") sorted.reverse();
  return sorted;
}

export const renderTable = createView("table", {
  onInit() {
    // Inicializar datos ordenados antes de renderizar
    const state = tableStore.get();
    if (!state.sortedRows || state.sortedRows.length === 0) {
      const sortedRows = getSortedRows(
        state.rows,
        state.sortKey,
        state.sortDirection
      );
      tableStore.update(() => ({ sortedRows }));
    }
  },

  onMount() {
    console.log("✅ Table mounted with reactive bindings");
  },

  render() {
    const state = tableStore.get();
    return h("div", { class: "page-content" }, [
      h("h1", {}, "Team Directory"),
      h("table", {}, [
        h(
          "tbody",
          {},
          h.map(
            "sortedRows", // Binding reactivo
            (row) => h("tr", {}, h("td", {}, row.name)),
            { store: tableStore }
          )
        ),
      ]),
    ]);
  },

  onUnmount() {
    // Cleanup si es necesario
    console.log("🧹 Table unmounted");
  },
});
```

## Orden de Ejecución

```
1. onInit()           → Preparar datos
2. render()           → Crear árbol DOM
3. [Mount to DOM]     → Insertar en document
4. [RAF]              → Esperar frame
5. onMount()          → DOM listo, bindings activos
...
[Navigation away]
6. onUnmount()        → Limpiar recursos
```

## Ventajas

✅ **Predecible:** Orden de ejecución claro y consistente
✅ **Reactivo:** Los bindings se activan después del montaje
✅ **Limpio:** Cleanup automático al cambiar de vista
✅ **Debuggeable:** Logs claros en cada fase
✅ **Type-safe:** JSDoc completo para autocompletado

## Migración de Vistas Existentes

### Antes (sin lifecycle):

```javascript
export function renderHome() {
  const content = h("div", {}, "Hello");
  mount(document.getElementById("main-content"), content);
}
```

### Después (con lifecycle):

```javascript
export const renderHome = createView("home", {
  render() {
    return h("div", {}, "Hello");
  },
});
```

## Utilidades

### `unmountView(viewName)`

Desmonta manualmente una vista:

```javascript
import { unmountView } from "../lib/lifecycle.js";
await unmountView("table");
```

### `getViewLifecycle(viewName)`

Obtiene el lifecycle activo (debugging):

```javascript
import { getViewLifecycle } from "../lib/lifecycle.js";
const lifecycle = getViewLifecycle("table");
console.log(lifecycle);
```

## Best Practices

1. **Siempre usa `onInit` para inicializar stores** antes de renderizar
2. **Usa `onMount` para interacciones con el DOM** (focus, scroll, etc.)
3. **Implementa `onUnmount`** si creas timers, listeners o subscripciones
4. **Mantén `render()` puro** - sin side effects
5. **Usa nombres únicos** para cada vista en `createView`

## Debugging

El sistema incluye logs automáticos. Para ver el flujo:

```javascript
onInit() {
  console.log('🔧 Initializing view');
},
onMount() {
  console.log('✅ View mounted');
},
onUnmount() {
  console.log('🧹 Cleaning up');
}
```
