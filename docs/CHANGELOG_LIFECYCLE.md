# Changelog: View Lifecycle System

## Resumen

Se implementó un sistema completo de lifecycle hooks para vistas, resolviendo el problema de inicialización de datos en bindings reactivos.

## Problema Original

La tabla no mostraba datos al inicio porque:

1. `sortedRows` iniciaba como array vacío `[]`
2. El binding reactivo `h.map("sortedRows", ...)` se registraba antes de que los datos estuvieran disponibles
3. No había un hook para inicializar datos antes del render

## Solución Implementada

### 1. Sistema de Lifecycle (`js/lib/lifecycle.js`)

Nuevo módulo que proporciona:

- `createView(viewName, lifecycle)` - Factory para vistas con lifecycle
- Hooks: `onInit`, `render`, `onMount`, `onUnmount`
- Gestión automática de montaje y limpieza
- Cache de lifecycles activos para cleanup

**Características:**

- ✅ Orden de ejecución predecible
- ✅ Soporte para async/await
- ✅ Cleanup automático al cambiar de vista
- ✅ Documentación JSDoc completa

### 2. Migración de Vista de Tabla

**Antes:**

```javascript
export function renderTable() {
  const content = h("div", {}, [...]);
  mount(document.getElementById("main-content"), content);
}
```

**Después:**

```javascript
export const renderTable = createView("table", {
  onInit() {
    // Inicializar sortedRows antes de render
    const state = tableStore.get();
    if (!state.sortedRows || state.sortedRows.length === 0) {
      const sortedRows = getSortedRows(state.rows, state.sortKey, state.sortDirection);
      tableStore.update(() => ({ sortedRows }));
    }
  },

  render() {
    // Renderizar con datos ya disponibles
    return h("div", {}, [...]);
  },

  onMount() {
    console.log("✅ Table mounted with reactive bindings");
  }
});
```

### 3. Documentación

Creados tres documentos:

- `docs/LIFECYCLE.md` - Documentación completa del sistema
- `docs/LIFECYCLE_EXAMPLE.md` - Ejemplos prácticos y casos de uso
- `README.md` actualizado con sección de lifecycle

## Archivos Modificados

### Nuevos Archivos

- ✅ `js/lib/lifecycle.js` - Sistema de lifecycle
- ✅ `docs/LIFECYCLE.md` - Documentación
- ✅ `docs/LIFECYCLE_EXAMPLE.md` - Ejemplos
- ✅ `docs/CHANGELOG_LIFECYCLE.md` - Este archivo

### Archivos Modificados

- ✅ `js/views/table.js` - Migrado a usar lifecycle
- ✅ `README.md` - Agregada sección de lifecycle

## API del Sistema

### `createView(viewName, lifecycle)`

```typescript
interface ViewLifecycle {
  onInit?: () => void | Promise<void>;
  render: () => Node;
  onMount?: () => void | Promise<void>;
  onUnmount?: () => void | Promise<void>;
}

function createView(
  viewName: string,
  lifecycle: ViewLifecycle
): () => Promise<void>;
```

### Orden de Ejecución

```
1. onInit()           → Preparar datos, inicializar stores
2. render()           → Crear árbol DOM
3. [Mount to DOM]     → Insertar en document.getElementById("main-content")
4. [RAF]              → requestAnimationFrame para asegurar render
5. onMount()          → DOM listo, bindings activos
...
[Navigation away]
6. onUnmount()        → Limpiar recursos
```

## Casos de Uso

### 1. Inicialización de Datos

```javascript
onInit() {
  if (!store.get().data) {
    store.update(() => ({ data: loadData() }));
  }
}
```

### 2. Fetch Async

```javascript
async onInit() {
  const data = await fetchData();
  store.update(() => ({ data }));
}
```

### 3. Setup de Listeners

```javascript
onInit() {
  this.subscription = store.subscribe(handleChange);
}

onUnmount() {
  this.subscription?.();
}
```

### 4. Focus en Input

```javascript
onMount() {
  document.querySelector('input')?.focus();
}
```

## Beneficios

### Para Desarrolladores

- ✅ Código más predecible y mantenible
- ✅ Separación clara de responsabilidades
- ✅ Debugging más fácil con logs en cada fase
- ✅ Previene bugs de timing en bindings reactivos

### Para la Aplicación

- ✅ Datos siempre disponibles al renderizar
- ✅ Bindings reactivos funcionan correctamente
- ✅ Cleanup automático previene memory leaks
- ✅ Mejor performance con lazy initialization

### Para el Framework

- ✅ Patrón consistente para todas las vistas
- ✅ Compatible con vistas legacy (sin lifecycle)
- ✅ Extensible para futuros hooks
- ✅ Documentación completa y ejemplos

## Comparación con Otros Frameworks

| Framework | Lifecycle Hooks        | Nuestro Sistema              |
| --------- | ---------------------- | ---------------------------- |
| React     | useEffect              | onInit + onMount + onUnmount |
| Vue       | mounted, beforeUnmount | onMount, onUnmount           |
| Svelte    | onMount, onDestroy     | onMount, onUnmount           |
| Angular   | ngOnInit, ngOnDestroy  | onInit, onUnmount            |

**Ventaja:** Más simple y directo, sin necesidad de hooks especiales o decoradores.

## Testing

Para verificar que funciona:

1. Navegar a la vista de tabla (`#table`)
2. Verificar que los datos se muestran inmediatamente
3. Hacer clic en los headers para ordenar
4. Verificar que la tabla se actualiza reactivamente
5. Ver logs en consola:
   - "🔧 Initializing..." (onInit)
   - "✅ Table mounted with reactive bindings" (onMount)

## Próximos Pasos

### Posibles Mejoras

1. **Error Boundaries** - Capturar errores en lifecycle hooks
2. **Loading States** - Mostrar spinner durante onInit async
3. **Transition Hooks** - `onBeforeMount`, `onBeforeUnmount`
4. **Dev Tools** - Panel de debugging para lifecycles activos
5. **HMR Integration** - Preservar estado durante hot reload

### Migración de Otras Vistas

Las vistas existentes pueden seguir usando el patrón legacy:

```javascript
export function renderHome() {
  const content = h("div", {}, [...]);
  mount(document.getElementById("main-content"), content);
}
```

O migrar al nuevo sistema cuando necesiten:

- Bindings reactivos con `h.map` o `h.link`
- Inicialización async de datos
- Cleanup de recursos
- Interacción con DOM después del mount

## Conclusión

El sistema de lifecycle resuelve elegantemente el problema de timing en la inicialización de vistas reactivas, proporcionando un patrón claro y predecible que es familiar para desarrolladores de otros frameworks pero más simple y directo.

La implementación es:

- ✅ Mínima (~100 líneas)
- ✅ Sin dependencias
- ✅ Totalmente documentada
- ✅ Compatible con código existente
- ✅ Extensible para el futuro

---

**Fecha de Implementación:** 15 de Noviembre, 2025
**Versión:** 1.0.0
**Autor:** Sistema de Lifecycle para No-Framework Starter
