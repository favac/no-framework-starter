// Hyperscript-style DOM helper and tiny state utilities

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

export function mount(target, node) {
  target.replaceChildren(node);
  return target;
}

export function clear(target) {
  target.replaceChildren();
}

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const match = e.target.closest(selector);
    if (match && root.contains(match)) handler(e, match);
  });
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) =>
  Array.from(root.querySelectorAll(sel));

// Super small state container for later use
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
