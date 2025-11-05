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
 * @typedef {Object} LinkOptions
 * @property {(value: unknown, state: Record<string, unknown>) => string} [format]
 * Formatter applied before writing the value to the DOM.
 */

const LINK_DESCRIPTOR_SYMBOL = Symbol("h.link.descriptor");
let autoComponentIdCounter = 0;

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
    } else if (isLinkDescriptor(child)) {
      const descriptor = child;
      const componentId = ensureElementId(el);
      const textNode = document.createTextNode("");
      const binding = createLinkBinding(descriptor, textNode, componentId);
      descriptor.store.__registerBinding(descriptor.key, binding);
      el.appendChild(textNode);
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
 * Determines whether the provided value is a link descriptor produced by `h.link`.
 *
 * @param {unknown} value - Candidate value to inspect.
 * @returns {value is { __type: symbol }} True when the value represents a link descriptor.
 */
function isLinkDescriptor(value) {
  return Boolean(
    value && typeof value === "object" && value.__type === LINK_DESCRIPTOR_SYMBOL
  );
}

/**
 * Formats the value that will be written to the DOM for a linked binding.
 *
 * @param {unknown} value - Current store value for the bound key.
 * @param {Record<string, unknown>} state - Complete store state.
 * @param {(value: unknown, state: Record<string, unknown>) => string | number | boolean | null | undefined} [formatter]
 * Optional formatter provided via {@link LinkOptions}.
 * @returns {string} String representation for the DOM text node.
 */
function formatLinkedValue(value, state, formatter) {
  if (typeof formatter === "function") {
    const formatted = formatter(value, state);
    if (formatted == null) return "";
    return String(formatted);
  }
  if (value == null) return "";
  return String(value);
}

/**
 * Ensures the provided element has an `id` attribute, generating one when missing.
 *
 * @param {HTMLElement} element - Element that should expose an identifier for bindings.
 * @returns {string} The existing or generated identifier.
 */
function ensureElementId(element) {
  if (element.id) return element.id;
  autoComponentIdCounter += 1;
  const generatedId = `h-component-${autoComponentIdCounter}`;
  element.id = generatedId;
  return generatedId;
}

/**
 * Creates a binding record used to keep a text node in sync with the store.
 *
 * @param {{ store: { __unregisterBinding: (key: string, binding: LinkBindingRecord) => void }, key: string, formatter?: (value: unknown, state: Record<string, unknown>) => string | number | boolean | null | undefined }} descriptor
 * Descriptor produced by {@link link}.
 * @param {Text} node - Text node that will receive updates.
 * @param {string} componentId - Identifier of the host element for housekeeping purposes.
 * @returns {LinkBindingRecord} Binding record ready to be registered in the store.
 */
function createLinkBinding(descriptor, node, componentId) {
  return {
    node,
    formatter: descriptor.formatter,
    store: descriptor.store,
    key: descriptor.key,
    componentId,
    wasConnected: false,
    update(value, state) {
      if (this.node.isConnected) {
        this.wasConnected = true;
        this.node.textContent = formatLinkedValue(value, state, this.formatter);
        return;
      }
      if (this.wasConnected) {
        this.store.__unregisterBinding(this.key, this);
        return;
      }
      this.node.textContent = formatLinkedValue(value, state, this.formatter);
    },
  };
}

/**
 * @typedef {Object} LinkBindingRecord
 * @property {Text} node - Target text node receiving updates.
 * @property {(value: unknown, state: Record<string, unknown>) => string | number | boolean | null | undefined} [formatter]
 * @property {{ __unregisterBinding: (key: string, binding: LinkBindingRecord) => void }} store - Bound store instance.
 * @property {string} key - Property name within the store state.
 * @property {string} componentId - Identifier for the host element.
 * @property {boolean} wasConnected - Indicates whether the node was ever connected to the document.
 * @property {(value: unknown, state: Record<string, unknown>) => void} update - Callback invoked on store updates.
 */

/**
 * Creates a link descriptor used by the `h()` helper to bind a store property to a text node.
 *
 * @template {Record<string, unknown>} S
 * @param {{ __registerBinding: (key: string, binding: LinkBindingRecord) => () => boolean, __unregisterBinding: (key: string, binding: LinkBindingRecord) => boolean, get: () => S }} store
 * Store instance produced by {@link createStore}.
 * @param {keyof S & string} key - Name of the property to bind.
 * @param {LinkOptions} [options] - Optional configuration.
 * @returns {{ __type: symbol, store: typeof store, key: keyof S & string, formatter?: LinkOptions['format'] }} Link descriptor consumed internally by `h()`.
 */
export function link(store, key, options = {}) {
  if (!store || typeof store.__registerBinding !== "function") {
    throw new Error("h.link requires a store created by createStore.");
  }
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("h.link requires a non-empty property name.");
  }
  const formatter = typeof options.format === "function" ? options.format : undefined;
  return {
    __type: LINK_DESCRIPTOR_SYMBOL,
    store,
    key,
    formatter,
  };
}

h.link = link;

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
 *   set: (next: S | ((s: S) => S), afterUpdate?: (s: S) => void) => void,
 *   update: (patch: Partial<S> | ((s: S) => Partial<S>)) => void,
 *   subscribe: (fn: (s: S) => void) => () => boolean
 * }} An object with store helpers.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  const bindings = new Map();

  /**
   * Registers a binding record for the specified key and performs the initial sync.
   *
   * @param {string} key - Property name in the store state.
   * @param {LinkBindingRecord} binding - Binding configuration.
   * @returns {() => boolean} Cleanup function removing the binding.
   */
  function registerBinding(key, binding) {
    if (!bindings.has(key)) bindings.set(key, new Set());
    const bindingSet = bindings.get(key);
    bindingSet.add(binding);
    binding.update(state[key], state);
    return () => unregisterBinding(key, binding);
  }

  /**
   * Removes a binding from the registry.
   *
   * @param {string} key - Bound property name.
   * @param {LinkBindingRecord} binding - Binding record to remove.
   * @returns {boolean} True when the record was removed.
   */
  function unregisterBinding(key, binding) {
    const bindingSet = bindings.get(key);
    if (!bindingSet) return false;
    const removed = bindingSet.delete(binding);
    if (bindingSet.size === 0) bindings.delete(key);
    return removed;
  }

  /**
   * Notifies bindings when their respective values have changed.
   *
   * @param {Record<string, unknown>} previous - Previous state snapshot.
   * @param {Record<string, unknown>} next - Next state snapshot.
   * @returns {void}
   */
  function notifyBindings(previous, next) {
    if (bindings.size === 0) return;
    bindings.forEach((bindingSet, key) => {
      if (!Object.prototype.hasOwnProperty.call(next, key)) return;
      const prevValue = previous ? previous[key] : undefined;
      const nextValue = next[key];
      if (prevValue === nextValue) return;
      bindingSet.forEach((binding) => {
        binding.update(nextValue, next);
      });
    });
  }

  return {
    get: () => state,
    set: (next, afterUpdate) => {
      const value = typeof next === "function" ? next(state) : next;
      if (value === state) return;
      const previous = state;
      state = value;
      notifyBindings(previous, state);
      listeners.forEach((l) => l(state));
      if (typeof afterUpdate === "function") afterUpdate(state);
    },
    update: (patch) => {
      const value = typeof patch === "function" ? patch(state) : patch;
      const previous = state;
      state = { ...state, ...value };
      notifyBindings(previous, state);
      listeners.forEach((l) => l(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    __registerBinding: registerBinding,
    __unregisterBinding: unregisterBinding,
  };
}
