import { TokenResult } from "./TokenResult.js";
import { html } from "../htmReact.js";

export function TokenResults({ results }) {
  return html`
  <div className="token-results">
    ${
    results.map((result) =>
      html`<${TokenResult} key=${result.token.id} ...${result}/>`
    )
  }
  </div>`;
}
