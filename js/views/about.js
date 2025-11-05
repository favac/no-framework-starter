import { h, mount, createStore } from "../lib/h.js";

// Store for the about page
const aboutStore = createStore({
  featureIndex: 0,
  features: [
    "Vite-powered dev server",
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
    h("h1", {}, "About This Vite-Powered Framework"),

    h("div", { class: "card" }, [
      h("h2", {}, "🚀 Modern Dev Experience"),
      h(
        "p",
        {},
        "Vite keeps updates instant so you can iterate without losing state:"
      ),
      h("div", { class: "feature-showcase" }, [
        h("h3", {}, [
          "Current feature: ",
          h.link(aboutStore, "features", {
            format(value, fullState) {
              const features = Array.isArray(value) ? value : [];
              const index = fullState.featureIndex ?? 0;
              return features[index] ?? "";
            },
          }),
        ]),
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
        h("li", {}, "Vite-powered development workflow"),
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
        h("li", {}, "Vite for hot module replacement"),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h2", {}, "🧪 Try Live Reload"),
      h("p", {}, [
        "Edit this file (js/views/about.js) while browsing. " +
          "Vite will apply the changes without losing the feature counter state.",
      ]),
      h("p", { class: "info" }, [
        "💡 Tip: Open the browser console to see Vite's hot update logs",
      ]),
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
}
