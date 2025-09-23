import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";

// Store for the about page
const aboutStore = createPersistentStore("about", {
  featureIndex: 0,
  features: [
    "Hot Module Replacement (HMR)",
    "Persistent state",
    "Real-time updates",
    "No page refresh",
    "Compatible with h()",
  ],
});

export function renderAbout() {
  const state = aboutStore.get();
  const currentFeature = state.features[state.featureIndex];

  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "About This Framework + HMR"),

    h("div", { class: "card hmr-demo" }, [
      h("h2", {}, "🚀 Hot Module Replacement"),
      h(
        "p",
        {},
        "Now with integrated HMR! Your changes are applied without losing state:"
      ),
      h("div", { class: "feature-showcase" }, [
        h("h3", {}, `Current feature: ${currentFeature}`),
        h("div", { class: "button-group" }, [
          h(
            "button",
            {
              class: "btn btn-primary",
              onclick: () => {
                const nextIndex =
                  (state.featureIndex + 1) % state.features.length;
                aboutStore.set((s) => ({ ...s, featureIndex: nextIndex }));
              },
            },
            "Next feature"
          ),
          h(
            "button",
            {
              class: "btn btn-secondary",
              onclick: () => {
                aboutStore.set((s) => ({ ...s, featureIndex: 0 }));
              },
            },
            "Reset"
          ),
        ]),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h2", {}, "No-Framework Framework"),
      h(
        "p",
        {},
        "This is a lightweight, vanilla JavaScript framework that provides:"
      ),
      h("ul", {}, [
        h("li", {}, "Hyperscript-style DOM creation with h()"),
        h("li", {}, "Simple client-side routing"),
        h("li", {}, "Event delegation helpers"),
        h("li", {}, "Lightweight state management"),
        h("li", {}, "Modal utilities"),
        h("li", {}, "No build step required"),
        h("li", {}, "✨ Hot Module Replacement (NEW!)"),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h2", {}, "Core Features"),
      h("p", {}, "Built with modern JavaScript features:"),
      h("ul", {}, [
        h("li", {}, "ES6 modules"),
        h("li", {}, "Template literals"),
        h("li", {}, "Arrow functions"),
        h("li", {}, "Destructuring"),
        h("li", {}, "Modern DOM APIs"),
        h("li", {}, "WebSocket for HMR"),
        h("li", {}, "Chokidar for file watching"),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h2", {}, "🧪 Test HMR"),
      h("p", {}, [
        "Edit this file (js/views/about.js) while browsing. " +
          "You'll see the changes without losing the feature counter state.",
      ]),
      h("p", { class: "info" }, [
        "💡 Tip: Open the browser console to see HMR logs",
      ]),
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
}
