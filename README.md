# No-Framework Starter Template

A lightweight, vanilla JavaScript framework for building modern web applications without the complexity of traditional frameworks.

## Features

- 🚀 **No build step required** - Works directly in the browser
- 📦 **Tiny footprint** - Core library is less than 5KB
- 🎯 **Modern JavaScript** - Uses ES6 modules and modern APIs
- 🧩 **Component-based** - Create reusable UI components with `h()`
- 🛣️ **Client-side routing** - Simple hash-based routing
- ⚡ **HMR dev server** - Hot Module Replacement for JS and CSS with state persistence
- 🧠 **Lazy-loaded views/routes** - Code-splitting with async route helpers
- 🎨 **CSS Variables** - Modern styling with custom properties
- 📱 **Responsive** - Mobile-first design approach
- 🔧 **Event delegation** - Efficient event handling
- 💾 **State management** - Lightweight reactive state container

## Quick Start

1. **Clone or download** this starter template
2. **Install dependencies**

```bash
npm install
```

3. **Start the HMR dev server**

```bash
npm run dev
```

Server will run at: http://localhost:3000

4. (Optional) **Serve without HMR**

```bash
# Serve with Python (if you have it installed)
python -m http.server 8000

# Or with Node.js
npx serve .
```

## Project Structure

```
no-framework-starter/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css         # Styles with CSS variables
│   └── hmr-demo.css       # Styles for the HMR demo indicator
├── js/
│   ├── app.js             # Main application entry point (sets up routes + HMR indicator)
│   ├── router.js          # Client-side routing with lazy loading helpers
│   ├── hmr-store.js       # Persistent stores for HMR
│   ├── hmr-ui.js          # Small UI helper to show HMR indicator
│   ├── lib/
│   │   └── h.js           # Core framework utilities
│   ├── views/
│   │   ├── home.js        # Home page view (uses persistent store)
│   │   └── about.js       # About page view (uses persistent store)
│   └── utils/
│       └── modal.js       # Modal utilities
├── server.js               # Development server with WebSocket-powered HMR
├── test-hmr.js             # Example script to verify HMR (optional)
└── README.md               # This file
```

## Core Concepts

### Creating Elements with `h()`

The `h()` function is the heart of this framework. It creates DOM elements in a declarative way:

```javascript
import { h } from './lib/h.js';

// Basic element
const title = h('h1', {}, 'Hello World');

// Element with attributes
const button = h('button', { 
  class: 'btn btn-primary',
  onclick: () => alert('Clicked!')
}, 'Click Me');

// Nested elements
const card = h('div', { class: 'card' }, [
  h('h2', {}, 'Card Title'),
  h('p', {}, 'Card content goes here'),
  button
]);
```

### Routing

Routes are lazy-loaded by default using helpers from `js/router.js` so you only load the code you need when you need it:

```javascript
// js/app.js
import { load /*, createRoutes */ } from './router.js';

// Simple approach using the load() helper
const routes = {
  home: load('home'),
  about: load('about'),
  '': load('home') // default route
};

// Advanced: declarative route creation
// const routes = createRoutes({
//   home: 'home',
//   about: 'about',
//   '': 'home'
// });

// Make available globally for HMR fallback
window.routes = routes;
```

### Creating Views

Views are functions that render content to the main area:

```javascript
import { h, mount } from '../lib/h.js';

export function renderNewPage() {
    const content = h('div', { class: 'page-content' }, [
        h('h1', {}, 'New Page'),
        h('p', {}, 'This is a new page!')
    ]);

    mount(document.getElementById('main-content'), content);
}
```

### State Management

Use `createStore()` for reactive state management:

```javascript
import { createStore } from './lib/h.js';

const store = createStore({ count: 0 });

// Subscribe to changes
store.subscribe(state => {
    console.log('Count is now:', state.count);
});

// Update state
store.update({ count: store.get().count + 1 });
```

For HMR-enabled components, prefer `createPersistentStore()` from `js/hmr-store.js` which preserves state across hot updates:

```javascript
import { createPersistentStore } from './hmr-store.js';

const store = createPersistentStore('counter', { count: 0 });

store.subscribe(state => {
  console.log('Count is now:', state.count);
});

store.set(s => ({ ...s, count: s.count + 1 }));
```

### Event Delegation

Efficiently handle events with delegation:

```javascript
const container = h('div', {});

// Add delegation after creating the element
container.click('.button', (e, target) => {
    console.log('Button clicked:', target);
});

container.input('.form-control', (e, target) => {
    console.log('Input changed:', target.value);
});
```

### Modals

Show and hide modals easily:

```javascript
import { showModal, closeModal } from './utils/modal.js';

// Show a modal with content
const modalContent = h('div', {}, [
    h('h2', {}, 'Modal Title'),
    h('p', {}, 'Modal content'),
    h('button', { onclick: closeModal }, 'Close')
]);

showModal(modalContent);
```
 
## Hot Module Replacement (HMR)

This starter includes a development server with full Hot Module Replacement for JavaScript and CSS.

- JS modules are reloaded without a full page refresh.
- CSS updates are applied instantly.
- State persists across updates when using `createPersistentStore()` from `js/hmr-store.js`.

### How to run

```bash
npm run dev
```

The server injects the HMR client into `index.html` at runtime and auto-wires view modules that export a function like `renderHome` or `renderAbout`.

You’ll also see a small on-screen indicator when HMR is active. See more details and advanced usage in [HMR-README.md](HMR-README.md).

### Example: persistent state with HMR

```javascript
// js/views/home.js
import { h, mount } from '../lib/h.js';
import { createPersistentStore } from '../hmr-store.js';

const homeStore = createPersistentStore('home', { count: 0 });

export function renderHome() {
  const state = homeStore.get();
  const content = h('div', {}, [
    h('h2', {}, `Counter: ${state.count}`),
    h('button', { onclick: () => homeStore.set(s => ({ ...s, count: s.count + 1 })) }, 'Increment')
  ]);
  mount(document.getElementById('main-content'), content);
}
```

No extra HMR code is required in your views—the dev server auto-injects what’s needed to re-render after updates.

> Tip: open the browser console to see detailed HMR logs.

## Lazy Loading (Code-Splitting)

The router provides helpers to lazy-load view modules on demand:

```javascript
// js/router.js
export function load(viewName, customPath = null) {
  const viewPath = customPath || `./views/${viewName}.js`;
  return createLazyRoute(viewName, viewPath);
}

export function createLazyRoute(viewName, viewPath, functionName = null) {
  const renderFunction = functionName || `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
  return async () => {
    const cache = window.moduleCache || new Map();
    if (!cache.has(viewName)) {
      const module = await import(viewPath);
      cache.set(viewName, module[renderFunction]);
      if (window.moduleCache) window.moduleCache.set(viewName, module[renderFunction]);
    }
    return cache.get(viewName)();
  };
}
```

Use it from `js/app.js`:

```javascript
import { load } from './router.js';

const routes = {
  home: load('home'),
  about: load('about'),
  '': load('home')
};

window.routes = routes; // also used by HMR fallback
```

## Adding New Features

### 1. Create a New View

```javascript
// js/views/products.js
import { h, mount } from '../lib/h.js';

export function renderProducts() {
    const content = h('div', { class: 'page-content' }, [
        h('h1', {}, 'Products'),
        // Your content here
    ]);

    mount(document.getElementById('main-content'), content);
}
```

### 2. Add the Route (Lazy-loaded)

```javascript
// js/app.js
import { load } from './router.js';

const routes = {
    // ... existing routes
    products: load('products')
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
const form = h('form', { 
    class: 'form',
    onsubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('Form data:', Object.fromEntries(formData));
    }
}, [
    h('div', { class: 'form-group' }, [
        h('label', {}, 'Name:'),
        h('input', { 
            class: 'form-control',
            type: 'text',
            name: 'name',
            required: true
        })
    ]),
    h('button', { 
        class: 'btn btn-primary',
        type: 'submit'
    }, 'Submit')
]);
```

### Dynamic Lists

```javascript
const items = ['Apple', 'Banana', 'Orange'];

const list = h('ul', {}, 
    items.map(item => 
        h('li', { 
            onclick: () => alert(`Clicked ${item}`)
        }, item)
    )
);
```

## License

MIT License - feel free to use this in your projects!

## Contributing

This is a starter template, but if you have improvements or find bugs, feel free to submit issues or pull requests.

---

Happy coding! 🚀