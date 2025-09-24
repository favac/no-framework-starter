/**
 * @fileoverview Hyperscript-style DOM helper and tiny state utilities.
 * Provides `h`, `fragment`, mount/clear, event delegation `on`, query helpers `$`/`$$`, and a minimal `createStore`.
 *
 * Notes:
 * - The `h()` return value is augmented with delegation helpers (`on`, `click(selector, handler)`, `input`, `change`, `submit`, `keydown`, `keyup`).
 */
// Hyperscript-style DOM helper and tiny state utilities

/**
 * @typedef {Object} HProps
 * @property {string|string[]} [class] CSS class(es) to apply.
 * @property {string|string[]} [className] CSS class(es) to apply (alias of `class`).
 * @property {string|Object<string, string|number>} [style] Inline styles. Accepts a CSS string or a style object.
 * @property {Object<string, string>} [dataset] Values assigned to `element.dataset`.
 * @property {(el: HTMLElement) => void} [ref] Callback invoked with the created element.
 * @property {string} [html] Sets `innerHTML` directly (use with caution).
 * @description Any property starting with `on` and whose value is a function is treated as an event listener (e.g., `onClick`, `onInput`). Any other key is set via `setAttribute`.
 */

/**
 * Creates a DOM element with attributes, styles, dataset, refs, event listeners, and children.
 * The returned element is augmented with delegation helpers: `on`,
 * `click(selector, handler)`, `input`, `change`, `submit`, `keydown`, and `keyup`.
 *
 * @param {string} tag - Tag name, e.g., `"div"`.
 * @param {HProps} [props={}] - Properties and attributes for the element.
 * @param {...(string|number|boolean|Node|Array<any>)} children - Children to append. Arrays are flattened; `null`/`undefined`/`false` are ignored.
 * @returns {HTMLElement} The created element (augmented with delegation helpers).
 * @example
 * const btn = h('button', { className: 'primary', onClick: () => alert('OK') }, 'Click');
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  if (props && typeof props === "object") {
    for (const [key, val] of Object.entries(props)) {
      if (val == null) continue;
      if (key === "class" || key === "className") {
        el.className = Array.isArray(val)
          ? val.filter(Boolean).join(" ")
          : String(val);
      } else if (key === "style") {
        if (typeof val === "string") {
          el.setAttribute("style", val);
        } else if (val && typeof val === "object") {
          Object.assign(el.style, val);
        }
      } else if (key === "dataset" && val && typeof val === "object") {
        Object.assign(el.dataset, val);
      } else if (key === "ref" && typeof val === "function") {
        // ref callback
        val(el);
      } else if (key === "html") {
        el.innerHTML = val;
      } else if (key.startsWith("on") && typeof val === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else {
        el.setAttribute(key, String(val));
      }
    }
  }

  const append = (child) => {
    if (child == null || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(append);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  };

  children.forEach(append);

  // Attach delegation methods directly to the element
  // Store original click method to avoid conflicts
  el._nativeClick = el.click;

  // Add delegation methods
  el.on = (event, selector, handler) => on(el, event, selector, handler);
  el.click = (selector, handler) => {
    // If called with selector and handler, it's delegation
    if (typeof selector === "string" && typeof handler === "function") {
      return on(el, "click", selector, handler);
    }
    // Otherwise, call native click method
    return el._nativeClick.apply(el, arguments);
  };
  el.input = (selector, handler) => on(el, "input", selector, handler);
  el.change = (selector, handler) => on(el, "change", selector, handler);
  el.submit = (selector, handler) => on(el, "submit", selector, handler);
  el.keydown = (selector, handler) => on(el, "keydown", selector, handler);
  el.keyup = (selector, handler) => on(el, "keyup", selector, handler);

  return el;
}

/**
 * Creates a `DocumentFragment` and appends the provided children.
 *
 * @param {...(string|number|boolean|Node|Array<any>)} children - Children to append. Arrays are flattened; `null`/`undefined`/`false` are ignored.
 * @returns {DocumentFragment} The created fragment containing the children.
 */
export function fragment(...children) {
  const frag = document.createDocumentFragment();
  const append = (child) => {
    if (child == null || child === false) return;
    if (Array.isArray(child)) child.forEach(append);
    else
      frag.appendChild(
        child instanceof Node ? child : document.createTextNode(String(child))
      );
  };
  children.forEach(append);
  return frag;
}

/**
 * Replaces all children of `target` with `node`.
 *
 * @param {Element} target - The element whose children will be replaced.
 * @param {Node} node - The node to mount into `target`.
 * @returns {Element} The `target` element.
 */
export function mount(target, node) {
  target.replaceChildren(node);
  return target;
}

/**
 * Removes all children from `target`.
 *
 * @param {Element} target - The element to clear.
 * @returns {void}
 */
export function clear(target) {
  target.replaceChildren();
}

/**
 * Adds a delegated event listener to `root`.
 * The handler is invoked when the event originates from an element matching `selector`
 * (or one of its ancestors via `closest`).
 *
 * @param {Element|Document} root - Root element/document on which to listen.
 * @param {string} event - Event type (e.g., `"click"`).
 * @param {string} selector - CSS selector for matching targets via `closest()`.
 * @param {(e: Event, match: Element) => void} handler - Callback invoked with the original event and the matched element.
 * @returns {void}
 */
export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const match = e.target.closest(selector);
    if (match && root.contains(match)) handler(e, match);
  });
}

/**
 * Shorthand for `root.querySelector(sel)`.
 *
 * @param {string} sel - CSS selector.
 * @param {Document|Element} [root=document] - Root on which to perform the query.
 * @returns {Element|null} The first matching element or `null`.
 */
export const $ = (sel, root = document) => root.querySelector(sel);
/**
 * Shorthand for `Array.from(root.querySelectorAll(sel))`.
 *
 * @param {string} sel - CSS selector.
 * @returns {Element[]} An array of matching elements.
 */
export const $$ = (sel, root = document) =>
  Array.from(root.querySelectorAll(sel));

// Super small state container for later use
/**
 * Tiny observable store with `get`, `set`, `update`, and `subscribe`.
 *
 * @template S
 * @param {S} initialState - Initial store state.
 * @returns {{
 *   get: () => S,
 *   set: (next: S | ((s: S) => S)) => void,
 *   update: (patch: Partial<S> | ((s: S) => Partial<S>)) => void,
 *   subscribe: (fn: (s: S) => void) => () => boolean
 * }} An object with store helpers.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    get: () => state,
    set: (next) => {
      const value = typeof next === "function" ? next(state) : next;
      if (value === state) return;
      state = value;
      listeners.forEach((l) => l(state));
    },
    update: (patch) => {
      const value = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...value };
      listeners.forEach((l) => l(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
