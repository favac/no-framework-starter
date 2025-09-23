import { h, mount } from "../lib/h.js";

export function renderAbout() {
  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "About This Framework"),
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
      ]),
    ]),
  ]);

  mount(document.getElementById("main-content"), content);
}
