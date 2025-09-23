# No-Framework Starter Template

A lightweight, vanilla JavaScript framework for building modern web applications without the complexity of traditional frameworks.

## Features

- 🚀 **No build step required** - Works directly in the browser
- 📦 **Tiny footprint** - Core library is less than 5KB
- 🎯 **Modern JavaScript** - Uses ES6 modules and modern APIs
- 🧩 **Component-based** - Create reusable UI components with `h()`
- 🛣️ **Client-side routing** - Simple hash-based routing
- 🎨 **CSS Variables** - Modern styling with custom properties
- 📱 **Responsive** - Mobile-first design approach
- 🔧 **Event delegation** - Efficient event handling
- 💾 **State management** - Lightweight reactive state container

## Quick Start

1. **Clone or download** this starter template
2. **Open `index.html`** in your browser or serve it with a local server
3. **Start building** your application!

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
│   └── styles.css         # Styles with CSS variables
├── js/
│   ├── app.js            # Main application entry point
│   ├── router.js         # Client-side routing
│   ├── lib/
│   │   └── h.js          # Core framework utilities
│   ├── views/
│   │   ├── home.js       # Home page view
│   │   └── about.js      # About page view
│   └── utils/
│       └── modal.js      # Modal utilities
└── README.md             # This file
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

Add new routes by updating the `routes` object in `app.js`:

```javascript
import { renderNewPage } from './views/newpage.js';

const routes = {
    'home': renderHome,
    'about': renderAbout,
    'newpage': renderNewPage,  // Add your new route
    '': renderHome
};
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

## CSS Variables

Customize the look and feel by modifying CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4a6fa5;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    /* ... more variables */
}
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

### 2. Add the Route

```javascript
// js/app.js
import { renderProducts } from './views/products.js';

const routes = {
    // ... existing routes
    'products': renderProducts
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