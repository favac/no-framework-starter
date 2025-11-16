import { h, mount, createStore } from "../lib/h.js";
import { showModal, closeModal } from "../utils/modal.js";

// Local store for this component
const homeStore = createStore({
  count: 0,
  message: "Hello from the Vite-powered app!",
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

function renderCounterCard(state) {
  return h("div", { class: "card", id: "home-counter-card" }, [
    h("h2", {}, ["Counter: ", h.link(homeStore, "count")]),
    h("p", {}, ["Message: ", h.link(homeStore, "message")]),
    h("div", { class: "button-group" }, [
      h(
        "button",
        {
          class: "btn btn-primary",
          onclick: () =>
            homeStore.set(
              (s) => ({ ...s, count: s.count + 1 }),
              renderCounterCard
            ),
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
              message: "State preserved with Vite HMR!",
            })),
        },
        "Change Message"
      ),
    ]),
  ]);
}

export function renderHome() {
  const state = homeStore.get();

  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "🚀 Welcome to Your Vite-Powered App"),
    h(
      "p",
      {},
      "This example uses Vite's dev server so code changes appear instantly without losing state."
    ),

    renderCounterCard(state),

    h("div", { class: "card" }, [
      h("h3", {}, "Dev Experience Highlights"),
      h("ul", {}, [
        h("li", {}, "✅ Fast hot updates with Vite"),
        h("li", {}, "✅ CSS changes applied instantly"),
        h("li", {}, "✅ JavaScript reloaded without refresh"),
        h("li", {}, "✅ Lightweight state store"),
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
      "Try editing this file and Vite will refresh the view without losing the counter state.",
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
  // renderCounterSection();
}

// function isHomeRouteActive() {
//   const hash = window.location.hash.replace("#", "");
//   return hash === "" || hash === "home";
// }

// function renderCounterSection() {
//   // if (!isHomeRouteActive()) return;
//   const counterRoot = document.getElementById("home-counter-card");
//   if (!counterRoot) return;
//   const nextCard = renderCounterCard(homeStore.get());
//   counterRoot.replaceWith(nextCard);
// }

// homeStore.subscribe(renderCounterSection);
