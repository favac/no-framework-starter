import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";

// Store para la página about
const aboutStore = createPersistentStore('about', {
  featureIndex: 0,
  features: [
    "Hot Module Replacement (HMR)",
    "Estado persistente",
    "Actualización en tiempo real",
    "Sin refresh de página",
    "Compatible con h()"
  ]
});

export function renderAbout() {
  const state = aboutStore.get();
  const currentFeature = state.features[state.featureIndex];
  
  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "About This Framework + HMR"),
    
    h("div", { class: "card hmr-demo" }, [
      h("h2", {}, "🚀 Hot Module Replacement"),
      h("p", {}, "¡Ahora con HMR integrado! Tus cambios se aplican sin perder estado:"),
      h("div", { class: "feature-showcase" }, [
        h("h3", {}, `Característica actual: ${currentFeature}`),
        h("div", { class: "button-group" }, [
          h("button", {
            class: "btn btn-primary",
            onclick: () => {
              const nextIndex = (state.featureIndex + 1) % state.features.length;
              aboutStore.set(s => ({ ...s, featureIndex: nextIndex }));
            }
          }, "Siguiente característica"),
          h("button", {
            class: "btn btn-secondary",
            onclick: () => {
              aboutStore.set(s => ({ ...s, featureIndex: 0 }));
            }
          }, "Resetear")
        ])
      ])
    ]),
    
    h("div", { class: "card" }, [
      h("h2", {}, "No-Framework Framework"),
      h("p", {}, "This is a lightweight, vanilla JavaScript framework that provides:"),
      h("ul", {}, [
        h("li", {}, "Hyperscript-style DOM creation with h()"),
        h("li", {}, "Simple client-side routing"),
        h("li", {}, "Event delegation helpers"),
        h("li", {}, "Lightweight state management"),
        h("li", {}, "Modal utilities"),
        h("li", {}, "No build step required"),
        h("li", {}, "✨ Hot Module Replacement (NEW!)")
      ])
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
        h("li", {}, "WebSocket para HMR"),
        h("li", {}, "Chokidar para file watching")
      ])
    ]),
    
    h("div", { class: "card" }, [
      h("h2", {}, "🧪 Prueba HMR"),
      h("p", {}, [
        "Edita este archivo (js/views/about.js) mientras navegas. " +
        "Verás los cambios sin perder el estado del contador de características."
      ]),
      h("p", { class: "info" }, [
        "💡 Tip: Abre la consola del navegador para ver los logs de HMR"
      ])
    ])
  ]);

  mount(document.getElementById("main-content"), content);
}
