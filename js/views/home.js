import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";
import { showModal, closeModal } from "../utils/modal.js";

// Local store for this component
const homeStore = createPersistentStore("home", {
  count: 0,
  message: "Hello from HMR-enabled app!",
});

/**
 * Build the content node for the modal demo using the `h()` helper.
 * The content includes a title, description, and an action row
 * with a primary button and a secondary close button.
 *
 * @returns {Node} A DOM node ready to be passed into showModal.
 */
function createModalExampleContent() {
  return h("div", { class: "modal-demo" }, [
    h("h2", {}, "Modal example"),
    h(
      "p",
      {},
      "This modal content is rendered with the lightweight h() helper and opened via showModal(content)."
    ),
    h("div", { class: "button-group" }, [
      h(
        "button",
        {
          class: "btn btn-primary",
          onclick: () => alert("Primary action executed"),
        },
        "Primary action"
      ),
      h(
        "button",
        {
          class: "btn btn-secondary",
          onclick: () => closeModal(),
        },
        "Close"
      ),
    ]),
  ]);
}

export function renderHome() {
  const state = homeStore.get();

  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "🚀 Welcome to Your App (HMR Enabled)"),
    h(
      "p",
      {},
      "This is an example with HMR - changes are applied without losing state."
    ),

    h("div", { class: "card" }, [
      h("h2", {}, `Counter: ${state.count}`),
      h("p", {}, `Message: ${state.message}`),
      h("div", { class: "button-group" }, [
        h(
          "button",
          {
            class: "btn btn-primary",
            onclick: () => homeStore.set((s) => ({ ...s, count: s.count + 1 })),
          },
          "Increment"
        ),
        h(
          "button",
          {
            class: "btn btn-secondary",
            onclick: () => homeStore.set((s) => ({ ...s, count: s.count - 1 })),
          },
          "Decrement"
        ),
        h(
          "button",
          {
            class: "btn btn-accent",
            onclick: () =>
              homeStore.set((s) => ({
                ...s,
                message: "State preserved with HMR!",
              })),
          },
          "Change Message"
        ),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h3", {}, "HMR Features"),
      h("ul", {}, [
        h("li", {}, "✅ State preserved on reload"),
        h("li", {}, "✅ CSS updated instantly"),
        h("li", {}, "✅ JavaScript reloaded without refresh"),
        h("li", {}, "✅ Persistent stores"),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h3", {}, "Modal Demo"),
      h(
        "p",
        {},
        "Click the button below to open a modal created with the modal utility."
      ),
      h(
        "button",
        {
          class: "btn btn-primary",
          onclick: () => {
            const node = createModalExampleContent();
            showModal(node);
          },
        },
        "Open Modal Example"
      ),
    ]),

    h("p", { class: "info" }, [
      "Try editing this file and you'll see the changes without losing the counter state.",
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
}

