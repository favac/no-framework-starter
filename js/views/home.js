import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";

// Store local para este componente
const homeStore = createPersistentStore("home", {
  count: 0,
  message: "Hello from HMR-enabled app!",
});

export function renderHome() {
  const state = homeStore.get();

  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "!!!🚀 Welcome to Your App (HMR Enabled)!"),
    h(
      "p",
      {},
      "Este es un ejemplo con HMR - los cambios se aplican sin perder estado."
    ),

    h("div", { class: "card" }, [
      h("h2", {}, `Contador: ${state.count}`),
      h("p", {}, `Mensaje: ${state.message}`),
      h("div", { class: "button-group" }, [
        h(
          "button",
          {
            class: "btn btn-primary",
            onclick: () => homeStore.set((s) => ({ ...s, count: s.count + 1 })),
          },
          "Incrementar"
        ),
        h(
          "button",
          {
            class: "btn btn-secondary",
            onclick: () => homeStore.set((s) => ({ ...s, count: s.count - 1 })),
          },
          "Decrementar"
        ),
        h(
          "button",
          {
            class: "btn btn-accent",
            onclick: () =>
              homeStore.set((s) => ({
                ...s,
                message: "¡Estado preservado con HMR!",
              })),
          },
          "Cambiar Mensaje"
        ),
      ]),
    ]),

    h("div", { class: "card" }, [
      h("h3", {}, "Características de HMR"),
      h("ul", {}, [
        h("li", {}, "✅ Estado preservado al recargar"),
        h("li", {}, "✅ CSS actualizado al instante"),
        h("li", {}, "✅ JavaScript recargado sin refresh"),
        h("li", {}, "✅ Stores persistentes"),
      ]),
    ]),

    h("p", { class: "info" }, [
      "Prueba a editar este archivo y verás los cambios sin perder el estado del contador.",
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
}
