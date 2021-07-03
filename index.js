if (new URLSearchParams(window.location.search).get("debug") !== null) {
  await import("preact/debug");
}
import { render } from "preact";
import { html } from "htm/preact";

import { App } from "./components/App.js";

render(
  html`<${App} defaultRefreshInterval=${5}/>`,
  document.getElementById("rootDiv"),
);
