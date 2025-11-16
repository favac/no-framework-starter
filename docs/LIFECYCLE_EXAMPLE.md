# Ejemplo Práctico: Migración a Lifecycle

## Problema Original

La tabla no mostraba datos al inicio porque:

1. `sortedRows` iniciaba como array vacío `[]`
2. El binding reactivo `h.map("sortedRows", ...)` se registraba con array vacío
3. No había un momento para inicializar los datos antes del render

## Solución con Lifecycle

### Antes (sin lifecycle)

```javascript
export function renderTable() {
  const state = tableStore.get();
  const content = h("div", {}, [
    h(
      "tbody",
      {},
      h.map("sortedRows", (row) => h("tr", {}, row.name), { store: tableStore })
    ),
  ]);
  mount(document.getElementById("main-content"), content);
}
```

**Problema:** `sortedRows` está vacío cuando se crea el binding.

### Después (con lifecycle)

```javascript
export const renderTable = createView("table", {
  onInit() {
    // ✅ Inicializar ANTES de renderizar
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

  render() {
    // ✅ Ahora sortedRows tiene datos
    const state = tableStore.get();
    return h("div", {}, [
      h(
        "tbody",
        {},
        h.map("sortedRows", (row) => h("tr", {}, row.name), {
          store: tableStore,
        })
      ),
    ]);
  },

  onMount() {
    console.log("✅ Table mounted with data");
  },
});
```

## Flujo de Ejecución

```
Usuario navega a /table
    ↓
1. onInit() ejecuta
   - tableStore.sortedRows = [] (vacío)
   - Calcula sortedRows con getSortedRows()
   - tableStore.update({ sortedRows: [...data] })
   - tableStore.sortedRows = [5 items] ✅
    ↓
2. render() ejecuta
   - Lee state = tableStore.get()
   - state.sortedRows tiene 5 items ✅
   - Crea h.map("sortedRows", ...) con datos
   - Retorna árbol DOM completo
    ↓
3. [Sistema monta al DOM]
   - container.innerHTML = ""
   - container.appendChild(content)
   - Bindings reactivos se activan
    ↓
4. onMount() ejecuta
   - DOM está listo
   - Bindings están activos
   - Tabla visible con datos ✅
```

## Casos de Uso Comunes

### 1. Fetch de Datos Async

```javascript
export const renderUsers = createView("users", {
  async onInit() {
    const state = userStore.get();
    if (!state.users.length) {
      const users = await fetchUsers();
      userStore.update(() => ({ users }));
    }
  },

  render() {
    return h(
      "div",
      {},
      h.map("users", (user) => h("div", {}, user.name), { store: userStore })
    );
  },
});
```

### 2. Setup de Event Listeners

```javascript
export const renderSearch = createView("search", {
  onInit() {
    this.debouncedSearch = debounce((query) => {
      searchStore.update(() => ({ query }));
    }, 300);
  },

  render() {
    return h("input", {
      type: "text",
      oninput: (e) => this.debouncedSearch(e.target.value),
    });
  },

  onMount() {
    document.querySelector("input")?.focus();
  },

  onUnmount() {
    this.debouncedSearch.cancel();
  },
});
```

### 3. Animaciones al Montar

```javascript
export const renderDashboard = createView("dashboard", {
  render() {
    return h("div", { class: "dashboard fade-in" }, [h("h1", {}, "Dashboard")]);
  },

  onMount() {
    // Trigger animation after mount
    const el = document.querySelector(".dashboard");
    el?.classList.add("active");
  },
});
```

### 4. Subscripciones a Stores

```javascript
export const renderLiveData = createView("live-data", {
  onInit() {
    // Subscribe to real-time updates
    this.unsubscribe = dataStore.subscribe((state) => {
      console.log("Data updated:", state);
    });
  },

  render() {
    return h(
      "div",
      {},
      h.map("items", (item) => h("div", {}, item.value), { store: dataStore })
    );
  },

  onUnmount() {
    // Clean up subscription
    this.unsubscribe?.();
  },
});
```

## Comparación con Otros Frameworks

### React

```javascript
// React
useEffect(() => {
  // onInit + onMount
  fetchData();
  return () => {
    // onUnmount
    cleanup();
  };
}, []);
```

### Vue

```javascript
// Vue
export default {
  mounted() {
    // onMount
    this.fetchData();
  },
  beforeUnmount() {
    // onUnmount
    this.cleanup();
  },
};
```

### Nuestro Sistema

```javascript
// No-Framework Lifecycle
export const renderView = createView("view", {
  onInit() {
    // Antes de render
    this.fetchData();
  },
  onMount() {
    // Después de montar
    this.setupListeners();
  },
  onUnmount() {
    // Antes de desmontar
    this.cleanup();
  },
  render() {
    return h("div", {}, "content");
  },
});
```

## Tips y Trucos

### 1. Compartir Estado entre Hooks

```javascript
export const renderView = createView("view", {
  onInit() {
    this.intervalId = setInterval(() => {
      console.log("tick");
    }, 1000);
  },

  onUnmount() {
    clearInterval(this.intervalId);
  },

  render() {
    return h("div", {}, "Timer running");
  },
});
```

### 2. Conditional Initialization

```javascript
onInit() {
  const state = store.get();
  // Solo inicializar si es necesario
  if (!state.initialized) {
    store.update(() => ({
      initialized: true,
      data: loadData()
    }));
  }
}
```

### 3. Error Handling

```javascript
async onInit() {
  try {
    const data = await fetchData();
    store.update(() => ({ data, error: null }));
  } catch (error) {
    store.update(() => ({ data: [], error: error.message }));
  }
}
```

## Debugging

### Ver el Flujo Completo

```javascript
export const renderView = createView("view", {
  onInit() {
    console.log("1️⃣ onInit - Preparing data");
  },
  render() {
    console.log("2️⃣ render - Creating DOM");
    return h("div", {}, "content");
  },
  onMount() {
    console.log("3️⃣ onMount - DOM ready");
  },
  onUnmount() {
    console.log("4️⃣ onUnmount - Cleaning up");
  },
});
```

### Inspeccionar Estado

```javascript
onInit() {
  const before = store.get();
  console.log("State before:", before);

  store.update(() => ({ data: loadData() }));

  const after = store.get();
  console.log("State after:", after);
}
```
