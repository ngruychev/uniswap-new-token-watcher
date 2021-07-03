import ReactDOM from "react-dom";
import { html } from "./htmReact.js";

import { App } from "./components/App.js";

const root = ReactDOM.createRoot(document.getElementById("rootDiv"));

root.render(html`<${App} defaultRefreshInterval=${5}/>`);
