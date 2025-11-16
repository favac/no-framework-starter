# No-Framework Starter Template

A lightweight, vanilla JavaScript framework for building modern web applications without the complexity of traditional frameworks.

## Features

- ⚡ **Vite-powered dev server** - Fast HMR and modern tooling out of the box
- 📦 **Tiny footprint** - Core library is less than 5KB
- 🎯 **Modern JavaScript** - Uses ES6 modules and modern APIs
- 🧩 **Component-based** - Create reusable UI components with `h()`
- 🛣️ **Client-side routing** - Simple hash-based routing
- 🧠 **Lazy-loaded views/routes** - Code-splitting with async route helpers
- 🔄 **View lifecycle hooks** - `onInit`, `onMount`, `onUnmount` for proper initialization
- 🎨 **CSS Variables** - Modern styling with custom properties
- 📱 **Responsive** - Mobile-first design approach
- 🔧 **Event delegation** - Efficient event handling
- 💾 **State management** - Lightweight reactive state container with bindings

## Quick Start

1. **Clone or download** this starter template
2. **Install dependencies**

```bash
npm install
```

3. **Start the Vite dev server**

```bash
npm run dev
```

The dev server will run at: http://localhost:5173 (default Vite port).

## Project Structure

```
no-framework-starter/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Global styles with CSS variables
├── js/
│   ├── app.js             # Main application entry point
│   ├── router.js          # Client-side routing with lazy loading helpers
│   ├── lib/
│   │   ├── h.js           # Core framework utilities (h, createStore, mount)
│   │   └── lifecycle.js   # View lifecycle system (onInit, onMount, onUnmount)
│   ├── views/
│   │   ├── home.js        # Home page view
│   │   ├── about.js       # About page view
│   │   ├── tasks.js       # Task management demo view
│   │   └── table.js       # Reactive table demo with lifecycle
│   └── utils/
│       └── modal.js       # Modal utilities
├── docs/
│   ├── LIFECYCLE.md       # Lifecycle system documentation
│   └── LIFECYCLE_EXAMPLE.md  # Practical examples
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Core Concepts

### Creating Elements with `h()`

The `h()` function is the heart of this framework. It creates DOM elements in a declarative way:

```javascript
import { h } from "./lib/h.js";

// Basic element
const title = h("h1", {}, "Hello World");

// Element with attributes
const button = h(
  "button",
  {
    class: "btn btn-primary",
    onclick: () => alert("Clicked!"),
  },
  "Click Me"
);

// Nested elements
const card = h("div", { class: "card" }, [
  h("h2", {}, "Card Title"),
  h("p", {}, "Card content goes here"),
  button,
]);
```

### Routing

Routes are lazy-loaded by default using helpers from `js/router.js` so you only load the code you need when you need it:

```javascript
// js/app.js
import { load /*, createRoutes */ } from "./router.js";

// Simple approach using the load() helper
const routes = {
  home: load("home"),
  about: load("about"),
  "": load("home"), // default route
};

// Advanced: declarative route creation
// const routes = createRoutes({
//   home: 'home',
//   about: 'about',
//   '': 'home'
// });

// Make available globally if you want to expose routes manually
window.routes = routes;
```

### Creating Views

#### Simple Views (Legacy)

Views are functions that render content to the main area:

```javascript
import { h, mount } from "../lib/h.js";

export function renderNewPage() {
  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "New Page"),
    h("p", {}, "This is a new page!"),
  ]);

  mount(document.getElementById("main-content"), content);
}
```

#### Views with Lifecycle (Recommended)

For views with reactive bindings, stores, or complex initialization, use the lifecycle system:

```javascript
import { h, createStore } from "../lib/h.js";
import { createView } from "../lib/lifecycle.js";

const pageStore = createStore({
  items: [],
  loading: false,
});

export const renderNewPage = createView("newPage", {
  // Called before rendering - initialize data
  onInit() {
    const state = pageStore.get();
    if (!state.items.length) {
      pageStore.update(() => ({ items: loadItems() }));
    }
  },

  // Called after DOM is mounted - setup interactions
  onMount() {
    console.log("✅ Page ready");
    document.querySelector("input")?.focus();
  },

  // Return the DOM tree
  render() {
    return h("div", { class: "page-content" }, [
      h("h1", {}, "New Page"),
      h.map("items", (item) => h("div", {}, item.name), { store: pageStore }),
    ]);
  },

  // Optional: cleanup before unmounting
  onUnmount() {
    console.log("🧹 Cleaning up");
  },
});
```

**Lifecycle Hooks:**

- `onInit()` - Initialize stores and data before rendering
- `render()` - Return the DOM tree to mount
- `onMount()` - DOM is ready, bindings are active
- `onUnmount()` - Cleanup before view is removed

📖 **[Full Lifecycle Documentation](./docs/LIFECYCLE.md)**

### State Management

Use `createStore()` for reactive state management:

```javascript
import { createStore } from "./lib/h.js";

const store = createStore({ count: 0 });

// Subscribe to changes
store.subscribe((state) => {
  console.log("Count is now:", state.count);
});

// Update state
store.update({ count: store.get().count + 1 });
```

### Event Delegation

Efficiently handle events with delegation:

```javascript
const container = h("div", {});

// Add delegation after creating the element
container.click(".button", (e, target) => {
  console.log("Button clicked:", target);
});

container.input(".form-control", (e, target) => {
  console.log("Input changed:", target.value);
});
```

### Modals

Show and hide modals easily:

```javascript
import { showModal, closeModal } from "./utils/modal.js";

// Show a modal with content
const modalContent = h("div", {}, [
  h("h2", {}, "Modal Title"),
  h("p", {}, "Modal content"),
  h("button", { onclick: closeModal }, "Close"),
]);

showModal(modalContent);
```

## Lazy Loading (Code-Splitting)

The router provides helpers to lazy-load view modules on demand:

```javascript
// js/router.js
export function load(viewName, customPath = null) {
  const viewPath = customPath || `./views/${viewName}.js`;
  return createLazyRoute(viewName, viewPath);
}

export function createLazyRoute(viewName, viewPath, functionName = null) {
  const renderFunction =
    functionName ||
    `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
  return async () => {
    const module = await import(viewPath);
    return module[renderFunction]();
  };
}
```

Use it from `js/app.js`:

```javascript
import { load } from "./router.js";

const routes = {
  home: load("home"),
  about: load("about"),
  "": load("home"),
};

window.routes = routes; // optional helper to inspect routes from the console
```

## Adding New Features

### 1. Create a New View

```javascript
// js/views/products.js
import { h, mount } from "../lib/h.js";

export function renderProducts() {
  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "Products"),
    // Your content here
  ]);

  mount(document.getElementById("main-content"), content);
}
```

### 2. Add the Route (Lazy-loaded)

```javascript
// js/app.js
import { load } from "./router.js";

const routes = {
  // ... existing routes
  products: load("products"),
};
```

### 3. Add Navigation

```html
<!-- index.html -->
<nav class="main-nav">
  <button class="nav-btn active" data-view="home">Home</button>
  <button class="nav-btn" data-view="about">About</button>
  <button class="nav-btn" data-view="products">Products</button>
</nav>
```

## Browser Support

This framework uses modern JavaScript features and requires:

- ES6 Modules support
- Modern DOM APIs
- CSS Custom Properties (variables)

Supported browsers:

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## Examples

### Form Handling

```javascript
const form = h(
  "form",
  {
    class: "form",
    onsubmit: (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      console.log("Form data:", Object.fromEntries(formData));
    },
  },
  [
    h("div", { class: "form-group" }, [
      h("label", {}, "Name:"),
      h("input", {
        class: "form-control",
        type: "text",
        name: "name",
        required: true,
      }),
    ]),
    h(
      "button",
      {
        class: "btn btn-primary",
        type: "submit",
      },
      "Submit"
    ),
  ]
);
```

### Dynamic Lists

```javascript
const items = ["Apple", "Banana", "Orange"];

const list = h(
  "ul",
  {},
  items.map((item) =>
    h(
      "li",
      {
        onclick: () => alert(`Clicked ${item}`),
      },
      item
    )
  )
);
```

## License

MIT License - feel free to use this in your projects!

## Contributing

This is a starter template, but if you have improvements or find bugs, feel free to submit issues or pull requests.

---

Happy coding! 🚀
